import { apiKeyService } from '../services/apiKeyService.js';
import { firebaseService } from '../services/firebase.js';
import { analyticsService } from '../services/analyticsService.js';
/** Max ms to wait for DB-backed auth. On cold start MongoDB can be slow. */
const AUTH_TIMEOUT_MS = 7000;
/**
 * Race a promise against a timeout.
 * Returns the result or throws an error if it takes too long.
 */
function withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`[Auth] ${label} timed out after ${ms}ms`)), ms)),
    ]);
}
/**
 * Build a human-actionable JSON-RPC error message for a rejected key.
 * The generic message left users guessing why their key failed — now they get
 * a reason-specific hint (wrong key / revoked / expired) plus what to do next.
 */
function authFailureMessage(reason, providedKey) {
    const headerHint = 'Use the header `Authorization: Bearer uh_live_...` with a valid key. Generate a new key at ui-hub-design.com/mcp.';
    switch (reason) {
        case 'INVALID_PREFIX':
            return `Unauthorized: the key you provided does not start with \`uh_live_\` (looks like: "${providedKey.slice(0, 24)}..."). You may have pasted the wrong value or only part of the key. ${headerHint}`;
        case 'REVOKED':
            return 'Unauthorized: this UI HUB API key has been revoked or deleted. Generate a new key at ui-hub-design.com/mcp.';
        case 'EXPIRED':
            return 'Unauthorized: this UI HUB API key has expired. Generate a new key at ui-hub-design.com/mcp.';
        case 'DB_ERROR':
            return 'Unauthorized: the key could not be verified right now (database error). Please retry in a moment — if the issue persists, generate a new key at ui-hub-design.com/mcp.';
        case 'NOT_FOUND':
        default:
            return `Unauthorized: the key you provided is not recognized. Check that you copied the FULL key (it should start with \`uh_live_\`). ${headerHint}`;
    }
}
/**
 * Middleware to authenticate MCP requests using a UI HUB API key.
 * Header: Authorization: Bearer uh_live_xxx
 * Fallback: ?key=uh_live_xxx query param or x-api-key header (some MCP clients
 * cannot send custom Authorization headers).
 *
 * IMPORTANT: This returns JSON-RPC error envelopes (not raw HTTP 401) so that
 * MCP clients (Antigravity, Cursor, Claude Code) can display a meaningful error
 * message instead of silently terminating with "request terminated without response".
 *
 * A hard timeout prevents cold-start MongoDB hangs from blocking the MCP session.
 */
export async function authenticateMcp(req, res, next) {
    const authHeader = req.headers.authorization;
    let apiKey = '';
    // 1. Preferred: Authorization: Bearer uh_live_xxx
    if (authHeader && authHeader.startsWith('Bearer ')) {
        apiKey = authHeader.slice(7).trim();
    }
    // 2. Fallback: some MCP tools/clients can't set a custom Authorization header.
    //    Support ?key=uh_live_xxx (URL) and x-api-key (header) so those work too.
    if (!apiKey && typeof req.query.key === 'string') {
        apiKey = req.query.key.trim();
    }
    if (!apiKey && typeof req.headers['x-api-key'] === 'string') {
        apiKey = req.headers['x-api-key'].trim();
    }
    if (!apiKey) {
        void analyticsService.track({
            event: 'auth_failure',
            timestamp: Date.now(),
            errorCode: 'MISSING_API_KEY',
        });
        return res.status(200).json({
            jsonrpc: '2.0',
            id: req.body?.id ?? null,
            error: {
                code: -32001,
                message: 'Unauthorized: Missing API key. Send requests with the header `Authorization: Bearer uh_live_...` (create a key at ui-hub-design.com/mcp). Note: pasting only the server URL will not work — the API key header is required.',
            },
        });
    }
    try {
        // Validate the key with a hard timeout to prevent cold-start DB hangs
        const result = await withTimeout(apiKeyService.validateApiKey(apiKey), AUTH_TIMEOUT_MS, 'validateApiKey');
        if (!result.record) {
            const reason = result.reason || 'NOT_FOUND';
            console.warn(`[Auth] Key rejected. Prefix: ${apiKey.slice(0, 14)}..., Reason: ${reason}`);
            void analyticsService.track({
                event: 'auth_failure',
                timestamp: Date.now(),
                errorCode: 'INVALID_API_KEY',
                keyPrefix: apiKey.slice(0, 14),
            });
            return res.status(200).json({
                jsonrpc: '2.0',
                id: req.body?.id ?? null,
                error: {
                    code: -32001,
                    message: authFailureMessage(reason, apiKey),
                },
            });
        }
        const record = result.record;
        // Touch last_used_at (async, fire-and-forget — never blocks the request)
        void apiKeyService.touchApiKey(record.id);
        // Get tier with timeout — fall back to FREE if Firebase is slow
        let tier = 'FREE';
        try {
            tier = await withTimeout(firebaseService.getUserTier(record.user_id, undefined), AUTH_TIMEOUT_MS, 'getUserTier');
        }
        catch (tierErr) {
            console.warn('[Auth] Tier lookup timed out or failed — defaulting to FREE:', tierErr);
        }
        const user = {
            userId: record.user_id,
            email: '',
            name: record.name,
            tier,
            keyId: record.id,
            keyPrefix: record.key_prefix,
            keyStatus: record.status,
        };
        req.user = user;
        req.apiKeyId = record.id;
        next();
    }
    catch (err) {
        console.error('[Auth] Authentication error:', err?.message || err);
        // On timeout or DB error, return a JSON-RPC error so the client knows why
        return res.status(200).json({
            jsonrpc: '2.0',
            id: req.body?.id ?? null,
            error: {
                code: -32003,
                message: err?.message?.includes('timed out')
                    ? 'Server is warming up — please retry in a few seconds. (Auth DB timeout)'
                    : `Authentication error: ${err?.message || 'Internal error'}`,
            },
        });
    }
}
//# sourceMappingURL=auth.js.map