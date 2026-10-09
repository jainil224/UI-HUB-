import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { ObjectId } from 'mongodb';

// In-memory stand-in for the `mcp_analytics` collection. A single shared
// collection object is returned for every name, which is enough for the log
// routes under test (analytics reads + purge writes + audit inserts).
const store = vi.hoisted(() => {
  const state: { docs: any[] } = { docs: [] };
  const eq = (a: any, b: any) => String(a) === String(b);
  const matches = (doc: any, filter: any): boolean => {
    if (!filter || Object.keys(filter).length === 0) return true;
    if (filter._id !== undefined && !eq(doc._id, filter._id)) return false;
    if (filter.date) {
      if (filter.date.$gte !== undefined && !(doc.date >= filter.date.$gte)) return false;
      if (filter.date.$lte !== undefined && !(doc.date <= filter.date.$lte)) return false;
    }
    return true;
  };
  const collection = {
    find: (filter: any = {}) => ({ toArray: async () => state.docs.filter((d) => matches(d, filter)) }),
    insertOne: async () => ({ acknowledged: true }),
    deleteOne: async (q: any) => {
      const i = state.docs.findIndex((d) => matches(d, q));
      if (i < 0) return { deletedCount: 0 };
      state.docs.splice(i, 1);
      return { deletedCount: 1 };
    },
    updateOne: async (q: any, update: any) => {
      const d = state.docs.find((x) => matches(x, q));
      if (!d) return { matchedCount: 0 };
      if (update?.$set) Object.assign(d, update.$set);
      return { matchedCount: 1 };
    },
  };
  return { state, collection };
});

vi.mock('../src/services/mongo.js', () => ({
  getCollection: vi.fn(async () => store.collection),
  getDb: vi.fn(async () => ({ collection: () => store.collection })),
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

// Bypass Firebase token verification: every request is a logged-in admin.
vi.mock('../src/middleware/requireAdmin.js', () => ({
  requireAdmin: (req: any, _res: any, next: any) => {
    req.email = 'admin@test.dev';
    req.uid = 'admin-uid';
    next();
  },
}));

import { app } from '../src/index.js';
import { AnalyticsService } from '../src/services/analyticsService.js';

const todayKey = () => new Date().toISOString().slice(0, 10);

const seedDoc = (events: any[], date = todayKey()): any => {
  const doc = { _id: new ObjectId(), events, date, createdAt: Date.now() };
  store.state.docs.push(doc);
  return doc;
};

const event = (over: Record<string, any> = {}) => ({
  event: 'mcp_request',
  tool: 'search_components',
  timestamp: Date.now(),
  success: true,
  statusCode: 200,
  ...over,
});

describe('admin DELETE /logs', () => {
  beforeEach(() => {
    store.state.docs = [];
    AnalyticsService.invalidateQueryCache();
  });

  it('refuses a blind purge with no filters or range', async () => {
    seedDoc([event()]);
    const res = await request(app).delete('/api/admin/mcp/logs');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('BAD_REQUEST');
    expect(store.state.docs).toHaveLength(1);
  });

  it('purges the whole range when confirm=ALL', async () => {
    seedDoc([event(), event({ timestamp: Date.now() + 1 })]);
    seedDoc([event({ timestamp: Date.now() + 2 })]);
    const res = await request(app).delete('/api/admin/mcp/logs?range=30d&confirm=ALL');
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(3);
    expect(store.state.docs).toHaveLength(0);
  });
});

describe('admin DELETE /logs/item (per-row)', () => {
  beforeEach(() => {
    store.state.docs = [];
    AnalyticsService.invalidateQueryCache();
  });

  it('requires an identifier', async () => {
    const res = await request(app).delete('/api/admin/mcp/logs/item');
    expect(res.status).toBe(400);
  });

  it('removes exactly one event and leaves the rest', async () => {
    const doc = seedDoc([
      event({ timestamp: 1_000_000 }),
      event({ timestamp: 2_000_000 }),
      event({ timestamp: 3_000_000 }),
    ]);

    const list = await request(app).get('/api/admin/mcp/logs?range=30d&pageSize=25');
    expect(list.status).toBe(200);
    const rows = list.body.events as any[];
    expect(rows).toHaveLength(3);
    // Every row carries the identity the delete route needs.
    expect(rows.every((r) => r.docId && r.eventId !== undefined)).toBe(true);

    const target = rows.find((r) => r.timestamp === 2_000_000)!;
    const res = await request(app).delete(
      `/api/admin/mcp/logs/item?docId=${encodeURIComponent(target.docId)}&eventId=${target.eventId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(1);

    expect(store.state.docs).toHaveLength(1);
    expect(store.state.docs[0]._id.toString()).toBe(doc._id.toString());
    expect(store.state.docs[0].events).toHaveLength(2);
    expect(store.state.docs[0].events.map((e: any) => e.timestamp)).toEqual([1_000_000, 3_000_000]);
  });

  it('deletes the bucket document when the last event is removed', async () => {
    seedDoc([event({ timestamp: 5_000_000 })]);
    const list = await request(app).get('/api/admin/mcp/logs?range=30d&pageSize=25');
    const row = (list.body.events as any[])[0];

    const res = await request(app).delete(
      `/api/admin/mcp/logs/item?docId=${encodeURIComponent(row.docId)}&eventId=${row.eventId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(1);
    expect(store.state.docs).toHaveLength(0);
  });
});
