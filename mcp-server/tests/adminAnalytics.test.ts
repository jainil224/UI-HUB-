import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

// Controllable request-event feed that stands in for the telemetry collection.
const state = vi.hoisted(() => ({ items: [] as any[] }));

vi.mock('../src/services/mongo.js', () => ({
  getCollection: vi.fn(async () => ({
    find: () => ({ toArray: async () => [] }),
    findOne: async () => null,
    insertOne: async () => ({ acknowledged: true }),
    updateOne: async () => ({ matchedCount: 1 }),
  })),
  getDb: vi.fn(async () => ({ collection: () => ({}) })),
  getClient: vi.fn(async () => ({})),
  mongoService: {},
}));

vi.mock('../src/services/firebase.js', () => ({
  firebaseService: {
    getUserTier: vi.fn(async () => 'ADMIN'),
    getDb: vi.fn(),
    getAdmin: vi.fn(),
  },
}));

vi.mock('../src/middleware/requireAdmin.js', () => ({
  requireAdmin: (req: any, _res: any, next: any) => {
    req.email = 'admin@test.dev';
    req.uid = 'admin-uid';
    next();
  },
}));

vi.mock('../src/services/telemetryService.js', () => ({
  SEARCH_EVENTS_COLLECTION: 'mcp_search_events',
  telemetryService: {
    queryRequests: vi.fn(async () => ({ total: state.items.length, page: 1, pageSize: 200, items: state.items })),
    querySearches: vi.fn(async () => ({ total: 0, page: 1, pageSize: 25, items: [] })),
    aggregateByTool: vi.fn(async () => {
      const map = new Map<string, any>();
      for (const e of state.items) {
        const name = e.toolName || e.method || 'unknown';
        const u = map.get(name) || { name, total: 0, success: 0, failed: 0, users: new Set<string>(), latSum: 0, latCnt: 0, lastUsed: 0 };
        u.total++;
        if (e.success) u.success++; else u.failed++;
        if (e.userId || e.apiKeyId) u.users.add(String(e.userId || e.apiKeyId));
        if (typeof e.latencyMs === 'number' && e.latencyMs > 0) { u.latSum += e.latencyMs; u.latCnt++; }
        if (e.timestamp > u.lastUsed) u.lastUsed = e.timestamp;
        map.set(name, u);
      }
      return [...map.values()].map((u) => ({
        name: u.name,
        total: u.total,
        success: u.success,
        failed: u.failed,
        uniqueUsers: u.users.size,
        avgResponseTimeMs: u.latCnt ? Math.round(u.latSum / u.latCnt) : 0,
        lastUsed: u.lastUsed,
      }));
    }),
    aggregateByComponent: vi.fn(async () => {
      const map = new Map<string, any>();
      for (const e of state.items) {
        if (e.resourceType !== 'component' || !e.resourceId) continue;
        const u = map.get(e.resourceId) || { id: e.resourceId, total: 0, codeFetches: 0, users: new Set<string>(), lastUsed: 0 };
        u.total++;
        if (e.toolName === 'get_component_code') u.codeFetches++;
        if (e.userId || e.apiKeyId) u.users.add(String(e.userId || e.apiKeyId));
        if (e.timestamp > u.lastUsed) u.lastUsed = e.timestamp;
        map.set(e.resourceId, u);
      }
      return [...map.values()].map((u) => ({
        id: u.id,
        total: u.total,
        codeFetches: u.codeFetches,
        uniqueUsers: u.users.size,
        lastUsed: u.lastUsed,
      }));
    }),
    getRequest: vi.fn(async () => null),
    recordRequest: vi.fn(),
    recordSearch: vi.fn(),
    markSearchFetched: vi.fn(),
  },
  toolTelemetry: {},
  buildRequestStatus: vi.fn(() => 'success'),
}));

import { app } from '../src/index.js';

const item = (over: Record<string, any> = {}) => ({
  success: true,
  latencyMs: 100,
  timestamp: Date.now(),
  toolName: 'search_components',
  userId: 'u1',
  ...over,
});

describe('admin GET /analytics', () => {
  beforeEach(() => {
    state.items = [];
  });

  it('returns errorRate as a fraction in [0,1]', async () => {
    state.items = [item(), item({ success: false }), item({ success: false })];
    const res = await request(app).get('/api/admin/mcp/analytics?range=30d');
    expect(res.status).toBe(200);
    expect(res.body.summary.errorRate).toBeCloseTo(2 / 3, 3);
    expect(res.body.summary.errorRate).toBeGreaterThan(0);
    expect(res.body.summary.errorRate).toBeLessThanOrEqual(1);
  });

  it('reports zero errorRate when there are no errors', async () => {
    state.items = [item(), item({ success: true })];
    const res = await request(app).get('/api/admin/mcp/analytics?range=30d');
    expect(res.body.summary.errorRate).toBe(0);
  });

  it('shapes byTool for the ToolUsage contract', async () => {
    state.items = [
      item({ toolName: 'a', userId: 'u1', latencyMs: 100, success: true }),
      item({ toolName: 'a', userId: 'u2', latencyMs: 200, success: false }),
      item({ toolName: 'b', userId: 'u1', latencyMs: 50, success: true }),
    ];
    const res = await request(app).get('/api/admin/mcp/analytics?range=30d');
    const a = (res.body.byTool as any[]).find((t) => t.name === 'a');
    expect(a).toMatchObject({ name: 'a', total: 2, success: 1, failed: 1, uniqueUsers: 2, avgResponseTimeMs: 150 });
    expect(typeof a.lastUsed).toBe('number');
    expect(a.lastUsed).toBeGreaterThan(0);
    expect('errorRate' in a).toBe(false);
  });
});

describe('admin GET /tools', () => {
  beforeEach(() => {
    state.items = [];
  });

  it('maps telemetry usage onto registered tools and leaves unused tools at zero', async () => {
    state.items = [
      item({ toolName: 'search_components', userId: 'u1' }),
      item({ toolName: 'search_components', userId: 'u2', success: false }),
      item({ toolName: 'get_component', userId: 'u1' }),
    ];
    const res = await request(app).get('/api/admin/mcp/tools');
    expect(res.status).toBe(200);
    const sc = (res.body.tools as any[]).find((t) => t.name === 'search_components');
    expect(sc).toMatchObject({ total: 2, failed: 1, uniqueUsers: 2 });
    const gc = (res.body.tools as any[]).find((t) => t.name === 'get_component');
    expect(gc.total).toBe(1);
    const unused = (res.body.tools as any[]).find((t) => t.name === 'list_categories');
    expect(unused).toMatchObject({ total: 0, uniqueUsers: 0, avgResponseTimeMs: 0 });
  });

  it('falls back to method for events without a toolName', async () => {
    state.items = [item({ toolName: undefined, method: 'initialize', userId: 'u1' })];
    const res = await request(app).get('/api/admin/mcp/tools');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tools)).toBe(true);
  });
});

describe('admin GET /components', () => {
  beforeEach(() => {
    state.items = [];
  });

  it('derives usedComponents and requestedComponentCalls from telemetry resourceId', async () => {
    state.items = [
      item({ toolName: 'get_component', resourceType: 'component', resourceId: 'aurora', userId: 'u1' }),
      item({ toolName: 'get_component_code', resourceType: 'component', resourceId: 'aurora', userId: 'u2' }),
      item({ toolName: 'get_component', resourceType: 'component', resourceId: 'pulse', userId: 'u1' }),
    ];
    const res = await request(app).get('/api/admin/mcp/components?range=30d');
    expect(res.status).toBe(200);
    expect(res.body.usedComponents).toBe(2);
    expect(res.body.requestedComponentCalls).toBe(3);
    const aurora = (res.body.topComponents as any[]).find((c) => c.id === 'aurora');
    expect(aurora).toMatchObject({ count: 2, codeFetches: 1, uniqueUsers: 2 });
    expect(typeof aurora.title).toBe('string');
  });

  it('reports zero usage when no component telemetry exists', async () => {
    state.items = [item({ toolName: 'search_components' })];
    const res = await request(app).get('/api/admin/mcp/components?range=30d');
    expect(res.status).toBe(200);
    expect(res.body.usedComponents).toBe(0);
    expect(res.body.requestedComponentCalls).toBe(0);
    expect(Array.isArray(res.body.catalog)).toBe(true);
  });
});
