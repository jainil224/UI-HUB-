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

  it('rejects requests without an Authorization header (401)', async () => {
    const res = await request(app).post('/mcp').send({ jsonrpc: '2.0', method: 'initialize', id: 1 });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_API_KEY');
  });

  it('rejects requests with invalid API key (401)', async () => {
    const res = await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer uh_live_invalidkey')
      .send({ jsonrpc: '2.0', method: 'initialize', id: 1 });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_API_KEY');
  });

  it('rejects revoked keys (401)', async () => {
    const res = await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer uh_live_revoked')
      .send({ jsonrpc: '2.0', method: 'initialize', id: 1 });
    expect(res.status).toBe(401);
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
