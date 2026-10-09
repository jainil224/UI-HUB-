import { Router } from 'express';
import { authenticateMcp } from '../middleware/auth.js';
import { mcpRateLimiter } from '../middleware/rateLimiter.js';
import { TOOLS } from '../tools/index.js';
import { analyticsService } from '../services/analyticsService.js';
import { configService } from '../config/configService.js';
import { telemetryService, toolTelemetry, buildRequestStatus } from '../services/telemetryService.js';
import { recordFailure } from '../services/diagnosticsService.js';
import { hashValue, redactText } from '../services/redaction.js';
import { categoryForOutcome, extractClientInfo, extractFilters, extractResourceId, parseToolResult, } from '../services/mcpInstrumentation.js';
import crypto from 'crypto';
/**
 * MCP Streamable HTTP transport.
 * Implements the MCP JSON-RPC 2.0 protocol over HTTP.
 *
 * IMPORTANT: `initialize` MUST be handled BEFORE authentication per the MCP spec.
 * Clients (Antigravity, Cursor, Claude Code, etc.) send `initialize` first to
 * negotiate the protocol — gating it behind auth causes "request terminated
 * without response" errors.
 */
export const mcpRouter = Router();
// ── Helpers ──────────────────────────────────────────────────────────────────
function jsonRpcHeader(res, version, sessionId) {
    if (sessionId) {
        res.setHeader('Mcp-Session-Id', sessionId);
    }
    // Echo the negotiated protocol version so strict MCP clients can confirm the
    // handshake. For stateless (sessionless) requests we fall back to the latest
    // stable version the server supports.
    res.setHeader('MCP-Protocol-Version', version || '2024-11-05');
}
function jsonRpcSuccess(res, id, result, sessionId, protocolVersion) {
    jsonRpcHeader(res, protocolVersion, sessionId);
    // Ensure content-type is always application/json for streamable HTTP
    res.setHeader('Content-Type', 'application/json');
    return res.json({ jsonrpc: '2.0', id, result });
}
function jsonRpcError(res, id, code, message, httpStatus = 200, protocolVersion) {
    jsonRpcHeader(res, protocolVersion);
    res.setHeader('Content-Type', 'application/json');
    return res.status(httpStatus).json({
        jsonrpc: '2.0',
        id: id ?? null,
        error: { code, message },
    });
}
function objectToSchemaProperties(schema) {
    if (!schema || typeof schema !== 'object' || !schema.shape) {
        return { properties: {} };
    }
    const properties = {};
    const required = [];
    const shape = schema.shape || {};
    Object.entries(shape).forEach(([key, def]) => {
        const prop = { type: 'string' };
        const typeName = def?._def?.typeName;
        if (typeName === 'ZodString')
            prop.type = 'string';
        else if (typeName === 'ZodNumber')
            prop.type = 'number';
        else if (typeName === 'ZodBoolean')
            prop.type = 'boolean';
        else if (typeName === 'ZodArray')
            prop.type = 'array';
        else if (typeName === 'ZodEnum') {
            prop.type = 'string';
            prop.enum = def._def.values;
        }
        if (def?.description)
            prop.description = def.description;
        properties[key] = prop;
        // Mark as required only if not optional
        const isOptional = typeName === 'ZodOptional' || def?._def?.innerType?._def?.typeName === 'ZodOptional';
        if (!isOptional) {
            required.push(key);
        }
    });
    return { properties, required: required.length > 0 ? required : undefined };
}
// ── Health endpoint (public, no auth) ────────────────────────────────────────
mcpRouter.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'ui-hub-mcp',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
const sessionStore = new Map();
// ── Auth middleware ───────────────────────────────────────────────────────────
/**
 * Honours the "authentication enabled" setting. When disabled, requests are
 * admitted in a dev/admin tier so the playground keeps working — EXCEPT in
 * production, where an anonymous caller must never get ADMIN privileges.
 * Returns a proper JSON-RPC error (not a raw HTTP 401) so MCP clients can parse it.
 */
async function optionalAuth(req, res, next) {
    try {
        const cfg = await configService.get();
        if (!cfg.authEnabled) {
            const inProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
            req.user = {
                userId: 'no-auth',
                email: '',
                name: inProduction ? 'Anonymous' : 'Admin',
                tier: inProduction ? 'FREE' : 'ADMIN',
                keyId: 'no-auth',
                keyPrefix: '',
                keyStatus: 'active',
            };
            return next();
        }
        return authenticateMcp(req, res, next);
    }
    catch (err) {
        console.error('[MCP] optionalAuth error:', err);
        // Config fetch failed — fall back to auth-required mode
        return authenticateMcp(req, res, next);
    }
}
// ── Main MCP POST endpoint ────────────────────────────────────────────────────
//
// The MCP protocol requires that `initialize` is answered BEFORE auth so
// clients can negotiate the session. We handle it first, then authenticate
// all other methods.
mcpRouter.post('/', async (req, res) => {
    const body = req.body;
    // Validate JSON-RPC envelope
    if (!body || typeof body !== 'object' || body.jsonrpc !== '2.0') {
        return jsonRpcError(res, body?.id, -32600, 'Invalid Request: expected JSON-RPC 2.0', 400);
    }
    const { method, id, params } = body;
    // ── Instrumentation context (additive) ────────────────────────────────────
    // A per-request correlation id links a search to a subsequent fetch, and is
    // surfaced in the admin Live Activity / Diagnostics views. Best-effort only.
    const startedAt = Date.now();
    const correlationId = crypto.randomUUID();
    const inboundSessionId = req.headers['mcp-session-id'];
    const inboundSession = inboundSessionId ? sessionStore.get(inboundSessionId) : undefined;
    const clientName = inboundSession?.clientName;
    const clientVersion = inboundSession?.clientVersion;
    const sessionId = inboundSessionId || inboundSession?.clientId;
    req.mcpTelemetry = { correlationId, clientName, clientVersion, sessionId, startedAt };
    // Negotiated protocol version — take it from the request header if present,
    // otherwise derive it from `initialize` params / default to the latest stable.
    const protocolVersion = req.headers['mcp-protocol-version'] ||
        (method === 'initialize' && params?.protocolVersion) ||
        '2024-11-05';
    // ── STEP 1: Handle `initialize` WITHOUT auth (MCP spec requirement) ──────
    // This is the very first message any MCP client sends. Responding to it
    // correctly (and quickly) is what prevents "request terminated without
    // response" errors in Antigravity, Cursor, Claude Code, etc.
    if (method === 'initialize') {
        const newSessionId = crypto.randomUUID();
        const clientInfo = extractClientInfo(params);
        sessionStore.set(newSessionId, {
            clientId: newSessionId,
            createdAt: Date.now(),
            clientName: clientInfo.name,
            clientVersion: clientInfo.version,
            protocolVersion: params?.protocolVersion,
        });
        // Clean up old sessions (older than 1 hour) to prevent memory leaks
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        for (const [sid, session] of sessionStore) {
            if (session.createdAt < oneHourAgo)
                sessionStore.delete(sid);
        }
        const clientProtocolVersion = params?.protocolVersion || '2024-11-05';
        // New telemetry only (legacy analytics intentionally NOT touched for
        // initialize so existing aggregate numbers stay identical).
        telemetryService.recordRequest({
            correlationId,
            method: 'initialize',
            status: 'success',
            success: true,
            clientName: clientInfo.name,
            clientVersion: clientInfo.version,
            sessionId: newSessionId,
            transport: req.headers.accept?.includes('text/event-stream') ? 'sse' : 'streamable-http',
            statusCode: 200,
            latencyMs: Date.now() - startedAt,
            ipHash: hashValue(req.ip || ''),
            timestamp: Date.now(),
        });
        return jsonRpcSuccess(res, id, {
            protocolVersion: clientProtocolVersion,
            capabilities: {
                tools: {},
            },
            serverInfo: {
                name: 'ui-hub',
                version: '1.0.0',
            },
        }, newSessionId, clientProtocolVersion);
    }
    // ── STEP 2: Handle `ping` without auth (keep-alive, no session needed) ────
    if (method === 'ping') {
        return jsonRpcSuccess(res, id, {}, undefined, protocolVersion);
    }
    // ── STEP 3: Handle notifications (no response needed, no auth needed) ─────
    if (!id && id !== 0) {
        // JSON-RPC notifications have no `id` — just acknowledge silently
        res.status(204).end();
        return;
    }
    // ── STEP 4: Authenticate all other methods ────────────────────────────────
    // Run auth inline so we can return a proper JSON-RPC error (not HTTP 401)
    // which MCP clients can actually understand and display.
    await new Promise((resolve, reject) => {
        optionalAuth(req, res, (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    }).catch((err) => {
        console.error('[MCP] Auth middleware error:', err);
    });
    // If auth middleware already sent a response (401), stop here
    if (res.headersSent)
        return;
    const user = req.user;
    if (!user) {
        return jsonRpcError(res, id, -32001, 'Unauthorized: missing or invalid API key', 200, protocolVersion);
    }
    // ── STEP 5: Rate limiting ─────────────────────────────────────────────────
    // mcpRateLimiter calls `next()` on success and sends a 429 on failure. Because
    // this is invoked inline (not as Express middleware), guard against calling
    // `next()` after a response has already been sent.
    const rateLimitPassed = await new Promise((resolve) => {
        let resolved = false;
        mcpRateLimiter(req, res, () => {
            if (!resolved && !res.headersSent) {
                resolved = true;
                resolve(true);
            }
        });
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                resolve(false);
            }
        }, 500);
    });
    if (!rateLimitPassed || res.headersSent)
        return;
    // ── STEP 6: Track analytics (legacy aggregate + new observability) ────────
    let toolName;
    let isError = false;
    let errorCode;
    let errorSummary;
    let errorCategory;
    let resultCount;
    let resourceType;
    let resourceId;
    let returnedIds;
    let zeroResults = false;
    res.on('finish', () => {
        // Legacy telemetry — left byte-for-byte compatible.
        void analyticsService.track({
            event: 'mcp_request',
            userId: user.userId,
            apiKeyId: user.keyId,
            keyPrefix: user.keyPrefix,
            tier: user.tier,
            tool: method,
            timestamp: Date.now(),
            statusCode: res.statusCode,
            responseTimeMs: Date.now() - startedAt,
            success: res.statusCode < 400,
        });
        // New flat telemetry + diagnostics (best-effort, never throws).
        const tele = toolTelemetry(toolName);
        const isSearch = tele?.kind === 'search';
        const searchZero = isSearch && zeroResults && !isError;
        const status = buildRequestStatus({ isError, errorCode, errorCategory, zeroResults: searchZero });
        const latencyMs = Date.now() - startedAt;
        const queryText = params?.arguments?.query;
        telemetryService.recordRequest({
            correlationId,
            method,
            protocolTool: method,
            toolName,
            userId: user.userId,
            apiKeyId: user.keyId,
            keyPrefix: user.keyPrefix,
            tier: user.tier,
            clientName,
            clientVersion,
            sessionId,
            transport: req.headers.accept?.includes('text/event-stream') ? 'sse' : 'streamable-http',
            status,
            success: !isError && !searchZero,
            errorCode,
            errorCategory,
            statusCode: res.statusCode,
            latencyMs,
            resultCount,
            resourceType,
            resourceId,
            query: typeof queryText === 'string' ? queryText : undefined,
            ipHash: hashValue(req.ip || ''),
            timestamp: Date.now(),
        });
        if (isSearch && tele) {
            telemetryService.recordSearch({
                correlationId,
                resourceType: tele.resourceType,
                tool: toolName,
                query: typeof queryText === 'string' ? queryText : undefined,
                filters: extractFilters(params?.arguments),
                resultCount: resultCount ?? 0,
                zeroResults: searchZero,
                returnedIds,
                failureCategory: isError ? errorCategory : undefined,
                clientName,
                tier: user.tier,
                userId: user.userId,
                apiKeyId: user.keyId,
                latencyMs,
                timestamp: Date.now(),
            });
        }
        if (isError || searchZero) {
            void recordFailure({
                errorCode,
                message: errorSummary,
                explicitCategory: errorCategory,
                zeroResults: searchZero,
                tool: toolName,
                method,
                resourceType: tele?.resourceType,
                resourceId,
                query: typeof queryText === 'string' ? queryText : undefined,
                statusCode: res.statusCode,
                clientName,
                userId: user.userId,
                apiKeyId: user.keyId,
                correlationId,
                latencyMs,
            });
        }
        if (tele && (tele.kind === 'fetch' || tele.kind === 'code') && !isError) {
            void telemetryService.markSearchFetched(user.userId, resourceId, tele.kind === 'code');
        }
    });
    // ── STEP 7: Dispatch authenticated methods ────────────────────────────────
    try {
        switch (method) {
            case 'tools/list': {
                const states = await configService.getToolStates();
                const available = TOOLS.filter((t) => states[t.name] !== false);
                const schema = available.map((t) => {
                    const s = objectToSchemaProperties(t.inputSchema);
                    return {
                        name: t.name,
                        description: t.description,
                        inputSchema: {
                            type: 'object',
                            properties: s.properties,
                            ...(s.required ? { required: s.required } : {}),
                        },
                    };
                });
                return jsonRpcSuccess(res, id, { tools: schema }, undefined, protocolVersion);
            }
            case 'tools/call': {
                const { name, arguments: args } = params || {};
                toolName = typeof name === 'string' ? name : undefined;
                resourceType = toolTelemetry(toolName)?.resourceType;
                resourceId = extractResourceId(toolName, args);
                const tool = TOOLS.find((t) => t.name === name);
                if (!tool) {
                    isError = true;
                    errorCode = 'METHOD_NOT_FOUND';
                    errorCategory = 'protocol_error';
                    errorSummary = `Unknown tool: ${name}`;
                    return jsonRpcError(res, id, -32601, `Unknown tool: ${name}`, 200, protocolVersion);
                }
                const enabled = await configService.isToolEnabled(name);
                if (!enabled) {
                    isError = true;
                    errorCode = 'TOOL_DISABLED';
                    errorCategory = 'tool_execution_error';
                    errorSummary = `Tool disabled: ${name}`;
                    return jsonRpcError(res, id, -32601, `Tool disabled: ${name}`, 200, protocolVersion);
                }
                const result = await tool.handler(args || {}, {
                    user,
                    correlationId,
                    client: clientName ? { name: clientName, version: clientVersion } : undefined,
                    sessionId,
                });
                const parsed = parseToolResult(result);
                isError = parsed.isError;
                errorCode = parsed.errorCode;
                errorSummary = parsed.errorMessage;
                resultCount = parsed.resultCount;
                returnedIds = parsed.returnedIds;
                zeroResults = parsed.zeroResults;
                errorCategory = categoryForOutcome(parsed);
                return jsonRpcSuccess(res, id, result, undefined, protocolVersion);
            }
            default:
                isError = true;
                errorCode = 'METHOD_NOT_FOUND';
                errorCategory = 'protocol_error';
                errorSummary = `Method not found: ${method}`;
                return jsonRpcError(res, id, -32601, `Method not found: ${method}`, 200, protocolVersion);
        }
    }
    catch (err) {
        console.error('[MCP] Internal error:', err);
        isError = true;
        errorCode = 'INTERNAL_ERROR';
        errorCategory = 'internal_error';
        errorSummary = redactText(err?.message || 'Unknown error');
        return jsonRpcError(res, id, -32603, `Internal error: ${err?.message || 'Unknown error'}`);
    }
});
// ── GET /mcp — SSE transport or JSON discovery ────────────────────────────────
mcpRouter.get('/', async (req, res) => {
    // Support standard MCP SSE Transport (legacy clients)
    if (req.headers.accept?.includes('text/event-stream')) {
        const sessionId = crypto.randomUUID();
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Mcp-Session-Id', sessionId);
        if (res.flushHeaders)
            res.flushHeaders();
        // Send the required MCP SSE endpoint event
        res.write(`event: endpoint\ndata: /mcp?sessionId=${sessionId}\n\n`);
        sessionStore.set(sessionId, { clientId: sessionId, createdAt: Date.now() });
        req.on('close', () => sessionStore.delete(sessionId));
        return;
    }
    // JSON discovery — return server info
    const states = await configService.getToolStates();
    const available = TOOLS.filter((t) => states[t.name] !== false).map((t) => t.name);
    res.json({
        name: 'ui-hub-mcp',
        description: 'UI HUB Model Context Protocol server',
        endpoint: `${process.env.MCP_SERVER_URL || ''}/mcp`,
        protocol: 'Streamable HTTP & SSE (JSON-RPC 2.0)',
        auth: 'Bearer <UI_HUB_API_KEY>',
        tools: available,
        health: '/mcp/health',
    });
});
// ── DELETE /mcp — Session termination ────────────────────────────────────────
mcpRouter.delete('/', (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (sessionId && sessionStore.has(sessionId)) {
        sessionStore.delete(sessionId);
    }
    res.status(204).end();
});
//# sourceMappingURL=mcp.js.map