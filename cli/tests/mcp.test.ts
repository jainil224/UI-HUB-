import { test } from 'node:test';
import assert from 'node:assert/strict';
import { McpClient } from '../src/mcp.js';

type FetchImpl = typeof globalThis.fetch;

function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = { 'Content-Type': 'application/json' },
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

function stubFetch(impl: FetchImpl): void {
  globalThis.fetch = impl;
}

function restoreFetch(orig: FetchImpl | undefined): void {
  if (orig) globalThis.fetch = orig;
}

const origFetch = globalThis.fetch;

const textResult = (text: string, isError = false) => ({
  content: [{ type: 'text', text }],
  isError,
});

test('callTool unwraps JSON text content on success', async () => {
  stubFetch(async () =>
    jsonResponse({ jsonrpc: '2.0', id: 1, result: textResult(JSON.stringify({ count: 2 })) }),
  );
  try {
    const client = new McpClient('http://example.test/mcp', 'uh_live_test');
    const r = await client.callTool('list_categories', {});
    assert.deepEqual(r, { count: 2 });
  } finally {
    restoreFetch(origFetch);
  }
});

test('callTool returns raw text content when it is not JSON', async () => {
  stubFetch(async () => jsonResponse({ jsonrpc: '2.0', id: 1, result: textResult('just text') }));
  try {
    const client = new McpClient('http://example.test/mcp', 'uh_live_test');
    const r = await client.callTool('some_tool', {});
    assert.equal(r, 'just text');
  } finally {
    restoreFetch(origFetch);
  }
});

test('tool-level isError result throws a CliError with the embedded code', async () => {
  stubFetch(async () =>
    jsonResponse({
      jsonrpc: '2.0',
      id: 1,
      result: textResult(JSON.stringify({ error: 'PREMIUM_ACCESS_REQUIRED', message: 'Pro needed' }), true),
    }),
  );
  try {
    const client = new McpClient('http://example.test/mcp', 'uh_live_test');
    await assert.rejects(
      client.callTool('get_component_code', { componentId: 'x' }),
      (err: any) => err.code === 'PREMIUM_ACCESS_REQUIRED' && err.exitCode === 1 && err.message === 'Pro needed',
    );
  } finally {
    restoreFetch(origFetch);
  }
});

test('HTTP 401 surfaces as an AUTH_ERROR with exit code 3', async () => {
  stubFetch(async () =>
    jsonResponse({ error: { code: -32001, message: 'Unauthorized' } }, 401),
  );
  try {
    const client = new McpClient('http://example.test/mcp', 'uh_live_bad');
    await assert.rejects(
      client.callTool('search_components', {}),
      (err: any) => err.code === 'AUTH_ERROR' && err.exitCode === 3,
    );
  } finally {
    restoreFetch(origFetch);
  }
});

test('JSON-RPC error -32001 in a 200 response surfaces as AUTH_ERROR', async () => {
  stubFetch(async () =>
    jsonResponse({ jsonrpc: '2.0', id: 1, error: { code: -32001, message: 'invalid key' } }),
  );
  try {
    const client = new McpClient('http://example.test/mcp', 'uh_live_bad');
    await assert.rejects(client.callTool('search_components', {}), (err: any) => err.code === 'AUTH_ERROR');
  } finally {
    restoreFetch(origFetch);
  }
});

test('network failure surfaces as NETWORK_ERROR', async () => {
  stubFetch(async () => {
    throw new TypeError('fetch failed');
  });
  try {
    const client = new McpClient('http://example.test/mcp', 'uh_live_test');
    await assert.rejects(client.callTool('search_components', {}), (err: any) => err.code === 'NETWORK_ERROR');
  } finally {
    restoreFetch(origFetch);
  }
});

test('listTools returns the tools array', async () => {
  stubFetch(async () =>
    jsonResponse({
      jsonrpc: '2.0',
      id: 1,
      result: { tools: [{ name: 'search_components', description: 'd' }] },
    }),
  );
  try {
    const client = new McpClient('http://example.test/mcp', 'uh_live_test');
    const list = await client.listTools();
    assert.deepEqual(list.tools, [{ name: 'search_components', description: 'd' }]);
  } finally {
    restoreFetch(origFetch);
  }
});

test('sends the Authorization Bearer header when a key is set', async () => {
  let captured: any = null;
  stubFetch(async (_input: any, init: any) => {
    captured = init.headers;
    return jsonResponse({ jsonrpc: '2.0', id: 1, result: textResult('{}') });
  });
  try {
    const client = new McpClient('http://example.test/mcp', 'uh_live_test');
    await client.callTool('list_categories', {});
    assert.equal(captured.Authorization, 'Bearer uh_live_test');
    assert.equal(captured['Content-Type'], 'application/json');
  } finally {
    restoreFetch(origFetch);
  }
});