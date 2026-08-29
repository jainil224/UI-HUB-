#!/usr/bin/env node
/**
 * UI HUB MCP Server - Local Stdio Transport
 * Enables direct, zero-latency MCP integration for Antigravity, Claude Code, Cursor, etc.
 */

import readline from 'node:readline';
import { TOOLS } from './tools/index.js';
import type { McpUser } from './types/index.js';

// Redirect all standard console logging to stderr to keep stdout clean for JSON-RPC messages
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
console.log = (...args: any[]) => process.stderr.write(args.join(' ') + '\n');
console.info = (...args: any[]) => process.stderr.write(args.join(' ') + '\n');
console.warn = (...args: any[]) => process.stderr.write(args.join(' ') + '\n');

// Default admin user for local developer access
const localAdminUser: McpUser = {
  userId: 'local-dev-user',
  email: 'dev@local.ui-hub',
  name: 'Local Developer',
  tier: 'ADMIN',
  keyId: 'local-stdio-key',
  keyPrefix: 'uh_local',
  keyStatus: 'active',
};

function objectToSchemaProperties(schema: any): { properties: Record<string, any>; required?: string[] } {
  if (!schema || typeof schema !== 'object' || !schema.shape) {
    return { properties: {} };
  }
  const properties: Record<string, any> = {};
  const required: string[] = [];
  const shape = (schema as any).shape || {};

  Object.entries(shape).forEach(([key, def]: [string, any]) => {
    const prop: any = { type: 'string' };
    const typeName = def?._def?.typeName;

    if (typeName === 'ZodString') prop.type = 'string';
    else if (typeName === 'ZodNumber') prop.type = 'number';
    else if (typeName === 'ZodBoolean') prop.type = 'boolean';
    else if (typeName === 'ZodArray') prop.type = 'array';
    else if (typeName === 'ZodEnum') {
      prop.type = 'string';
      prop.enum = def._def.values;
    }

    if (def?.description) prop.description = def.description;
    properties[key] = prop;

    // Check if required
    if (typeName !== 'ZodOptional' && def?._def?.innerType?._def?.typeName !== 'ZodOptional') {
      if (def?.isOptional && !def.isOptional()) {
        required.push(key);
      }
    }
  });

  return { properties, required: required.length > 0 ? required : undefined };
}

function sendResponse(id: any, result: any) {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id,
    result,
  });
  originalStdoutWrite(payload + '\n');
}

function sendError(id: any, code: number, message: string, data?: any) {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id: id ?? null,
    error: {
      code,
      message,
      ...(data ? { data } : {}),
    },
  });
  originalStdoutWrite(payload + '\n');
}

async function handleMessage(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return;

  let message: any;
  try {
    message = JSON.parse(trimmed);
  } catch (err: any) {
    sendError(null, -32700, 'Parse error: Invalid JSON');
    return;
  }

  const { id, method, params } = message;

  // Handle notifications (no response required)
  if (method?.startsWith('notifications/') || id === undefined || id === null) {
    if (method === 'notifications/initialized') {
      process.stderr.write('[MCP Stdio] Initialized notification received from client\n');
    }
    return;
  }

  switch (method) {
    case 'initialize': {
      sendResponse(id, {
        protocolVersion: params?.protocolVersion || '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'ui-hub',
          version: '1.0.0',
        },
      });
      break;
    }

    case 'ping': {
      sendResponse(id, {});
      break;
    }

    case 'tools/list': {
      const tools = TOOLS.map((t) => {
        const schema = objectToSchemaProperties(t.inputSchema);
        return {
          name: t.name,
          description: t.description,
          inputSchema: {
            type: 'object',
            properties: schema.properties,
            ...(schema.required ? { required: schema.required } : {}),
          },
        };
      });

      sendResponse(id, { tools });
      break;
    }

    case 'tools/call': {
      const { name, arguments: args } = params || {};
      const tool = TOOLS.find((t) => t.name === name);

      if (!tool) {
        sendError(id, -32601, `Unknown tool: ${name}`);
        return;
      }

      try {
        const result = await tool.handler(args || {}, { user: localAdminUser });
        sendResponse(id, result);
      } catch (err: any) {
        process.stderr.write(`[MCP Stdio] Tool execution error: ${err?.message || err}\n`);
        sendError(id, -32603, `Tool execution failed: ${err?.message || 'Internal error'}`);
      }
      break;
    }

    default:
      sendError(id, -32601, `Method not found: ${method}`);
      break;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  void handleMessage(line);
});

rl.on('close', () => {
  process.exit(0);
});

process.stderr.write('[MCP Stdio] UI HUB MCP server running via stdio\n');
