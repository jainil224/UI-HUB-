import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

// Mock auth dependencies to test auth flow deterministically
vi.mock('../src/services/apiKeyService.js', () => {
  return {
    apiKeyService: {
      validateApiKey: vi.fn(async (key: string) => {
        if (key === 'uh_live_validkey') {
          return {
            id: 'key-1',
            user_id: 'user-1',
            key_hash: 'hash',
            key_prefix: 'uh_live_abc',
            name: 'Test',
            created_at: Date.now(),
            last_used_at: null,
            expires_at: null,
            revoked_at: null,
            status: 'active',
          };
        }
        if (key === 'uh_live_revoked') {
          return null; // simulate revoked
        }
        return null;
      }),
      touchApiKey: vi.fn().mockResolvedValue(undefined),
      getKeyPrefix: vi.fn((k: string) => k.slice(0, 14)),
    },
  };
});

vi.mock('../src/services/firebase.js', () => ({
  firebaseService: {
    getUserTier: vi.fn(async () => 'FREE'),
    getDb: vi.fn(),
    getAdmin: vi.fn(),
  },
}));

vi.mock('../src/services/analyticsService.js', () => ({
  analyticsService: { track: vi.fn().mockResolvedValue(undefined) },
}));

describe('MCP HTTP endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Auth failures are returned as HTTP 200 with a JSON-RPC -32001 error envelope,
  // NOT a bare HTTP 401. Rationale: a naked 401 is the trigger for the OAuth 2.1
  // discovery flow (clients look for /.well-known/oauth-protected-resource), which
  // this server does not implement. Since we use a simple Bearer API key, the
  // transport succeeded and the *method* failed — exactly what a JSON-RPC error
  // envelope is for. MCP clients parse the envelope and surface the message.
  it('rejects requests without an Authorization header (200 + JSON-RPC -32001)', async () => {
    const res = await request(app).post('/mcp').send({ jsonrpc: '2.0', method: 'tools/list', id: 1 });
    expect(res.status).toBe(200);
    expect(res.body.error.code).toBe(-32001);
    expect(res.body.error.message).toContain('Authorization: Bearer uh_live_');
  });

  it('rejects requests with invalid API key (200 + JSON-RPC -32001)', async () => {
    const res = await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer uh_live_invalidkey')
      .send({ jsonrpc: '2.0', method: 'tools/list', id: 1 });
    expect(res.status).toBe(200);
    expect(res.body.error.code).toBe(-32001);
    expect(res.body.error.message).toContain('Authorization: Bearer uh_live_');
  });

  it('rejects revoked keys (200 + JSON-RPC -32001)', async () => {
    const res = await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer uh_live_revoked')
      .send({ jsonrpc: '2.0', method: 'tools/list', id: 1 });
    expect(res.status).toBe(200);
    expect(res.body.error.code).toBe(-32001);
  });

  it('accepts a valid API key and initializes', async () => {
    const res = await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer uh_live_validkey')
      .send({ jsonrpc: '2.0', method: 'initialize', id: 1 });
    expect(res.status).toBe(200);
    expect(res.body.result.serverInfo.name).toBe('ui-hub');
  });

  it('lists tools', async () => {
    const res = await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer uh_live_validkey')
      .send({ jsonrpc: '2.0', method: 'tools/list', id: 2 });
    expect(res.status).toBe(200);
    const names = res.body.result.tools.map((t: any) => t.name);
    expect(names).toContain('search_components');
    expect(names).toContain('get_component');
    expect(names).toContain('get_component_code');
    expect(names).toContain('search_templates');
    expect(names).toContain('get_template');
    expect(names).toContain('search_animations');
    expect(names).toContain('get_animation_code');
    expect(names).toContain('list_categories');
    expect(names).toContain('get_dependencies');
  });

  it('handles unknown tool with method not found', async () => {
    const res = await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer uh_live_validkey')
      .send({ jsonrpc: '2.0', method: 'tools/call', params: { name: 'nope', arguments: {} }, id: 3 });
    expect(res.body.error.code).toBe(-32601);
  });

  it('health endpoint is public', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
