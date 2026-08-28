import { Router, Request, Response } from 'express';
import { authenticateMcp } from '../middleware/auth.js';
import { mcpRateLimiter } from '../middleware/rateLimiter.js';
import { TOOLS } from '../tools/index.js';
import type { McpToolResult, McpUser } from '../types/index.js';
import { analyticsService } from '../services/analyticsService.js';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * MCP Streamable HTTP transport.
 * Implements the core MCP JSON-RPC methods over HTTP:
 *  - initialize
 *  - tools/list
 *  - tools/call
 *
 * Each request is authenticated with a UI HUB API key.
 */

export const mcpRouter = Router();

// Health endpoint (public)
mcpRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ui-hub-mcp',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Streamable session protocol support
type Session = {
  clientId: string;
  createdAt: number;
};

let sessionStore: Map<string, Session> = new Map();
function getRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      return Redis.fromEnv();
    }
    return new (Redis as any)({ url, token: process.env.UPSTASH_REDIS_REST_TOKEN || '' });
  } catch {
    return null;
  }
}

// The main MCP endpoint (authenticated)
mcpRouter.post('/', authenticateMcp, mcpRateLimiter, async (req: Request, res: Response) => {
  const user = (req as any).user as McpUser;
  const body = req.body;

  try {
    // Validate JSON-RPC envelope
    if (!body || typeof body !== 'object' || body.jsonrpc !== '2.0') {
      return jsonRpcError(res, req, body?.id, -32600, 'Invalid Request: expected JSON-RPC 2.0');
    }

    const { method, id, params } = body;

    // MCP content negotiation (Streamable HTTP)
    if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
    } else {
      res.setHeader('Content-Type', 'application/json');
    }

    await analyticsService.track({
      event: 'mcp_request',
      userId: user.userId,
      apiKeyId: user.keyId,
      tool: method,
      timestamp: Date.now(),
    });

    switch (method) {
      case 'initialize':
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2025-03-26',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'ui-hub',
              version: '1.0.0',
            },
          },
        });

      case 'tools/list':
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: TOOLS.map((t) => ({
              name: t.name,
              description: t.description,
              inputSchema: {
                type: 'object',
                properties: objectToSchemaProperties(t.inputSchema),
              },
            })),
          },
        });

      case 'tools/call': {
        const { name, arguments: args } = params || {};
        const tool = TOOLS.find((t) => t.name === name);

        if (!tool) {
          return jsonRpcError(res, req, id, -32601, `Unknown tool: ${name}`);
        }

        const result = await tool.handler(args || {}, { user });

        return res.json({
          jsonrpc: '2.0',
          id,
          result,
        });
      }

      default:
        return jsonRpcError(res, req, id, -32601, `Method not found: ${method}`);
    }
  } catch (err: any) {
    console.error('[MCP] Internal error:', err);
    return jsonRpcError(res, req, body?.id, -32603, 'Internal error');
  }
});

// Also accept GET on the endpoint for discovery/health check
mcpRouter.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'ui-hub-mcp',
    description: 'UI HUB Model Context Protocol server',
    endpoint: `${process.env.MCP_SERVER_URL || ''}/mcp`,
    protocol: 'Streamable HTTP',
    auth: 'Bearer <UI_HUB_API_KEY>',
    tools: TOOLS.map((t) => t.name),
    health: '/mcp/health',
  });
});

function jsonRpcError(res: Response, req: Request, id: unknown, code: number, message: string) {
  return res.status(code === -32600 ? 400 : 200).json({
    jsonrpc: '2.0',
    id: id ?? null,
    error: { code, message },
  });
}

function objectToSchemaProperties(schema: any): Record<string, any> {
  if (!schema || typeof schema !== 'object' || !schema.shape) {
    return {};
  }
  const result: Record<string, any> = {};
  const shape = (schema as any).shape || {};

  Object.entries(shape).forEach(([key, def]: [string, any]) => {
    const prop: any = { type: 'string' };
    if (def?._def?.typeName === 'ZodString') prop.type = 'string';
    else if (def?._def?.typeName === 'ZodNumber') prop.type = 'number';
    else if (def?._def?.typeName === 'ZodBoolean') prop.type = 'boolean';
    else if (def?._def?.typeName === 'ZodArray') prop.type = 'array';
    else if (def?._def?.typeName === 'ZodEnum') {
      prop.type = 'string';
      prop.enum = def._def.values;
    }
    if (def?.description) prop.description = def.description;
    result[key] = prop;
  });

  return result;
}
