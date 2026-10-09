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
