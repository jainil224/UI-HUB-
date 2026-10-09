import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mcpRateLimiter } from '../src/middleware/rateLimiter.js';
import { configService } from '../src/config/configService.js';
import type { McpUser } from '../src/types/index.js';

function makeUser(tier: McpUser['tier'], keyId: string): McpUser {
  return { userId: 'u1', email: '', tier, keyId, keyPrefix: 'uh_live_test', keyStatus: 'active' };
}

function makeRes() {
  const res: any = {
    headers: {} as Record<string, string>,
    statusCode: 200,
    body: undefined as any,
    set(k: string, v: string) {
      res.headers[k] = v;
      return res;
    },
    status(c: number) {
      res.statusCode = c;
      return res;
    },
    json(b: any) {
      res.body = b;
      return res;
    },
  };
  return res;
}

function makeReq(user: McpUser) {
  return { user, body: { jsonrpc: '2.0', id: 42, method: 'tools/call' }, ip: '127.0.0.1', headers: {} } as any;
}

describe('mcpRateLimiter', () => {
  beforeEach(() => {
    vi.spyOn(configService, 'get').mockResolvedValue({ rateLimitFree: 2, rateLimitPro: 5 } as any);
  });

  it('enforces the free limit and emits a JSON-RPC 429 with headers', async () => {
    const user = makeUser('FREE', 'free-key-1');

    for (let i = 0; i < 2; i++) {
      const res = makeRes();
      let next = false;
      await mcpRateLimiter(makeReq(user), res, () => { next = true; });
      expect(next).toBe(true);
      expect(res.statusCode).toBe(200);
    }

    const res = makeRes();
    let next = false;
    await mcpRateLimiter(makeReq(user), res, () => { next = true; });

    expect(next).toBe(false);
    expect(res.statusCode).toBe(429);
    expect(res.body.jsonrpc).toBe('2.0');
    expect(res.body.id).toBe(42);
    expect(res.body.error.code).toBe(-32029);
    expect(res.body.error.data.limit).toBe(2);
    expect(res.body.error.data.remaining).toBe(0);
    expect(res.body.error.data.retryAfterSeconds).toBeGreaterThan(0);
    expect(res.headers['Retry-After']).toBe(String(res.body.error.data.retryAfterSeconds));
    expect(res.headers['X-RateLimit-Limit']).toBe('2');
    expect(res.headers['X-RateLimit-Remaining']).toBe('0');
    expect(Number(res.headers['X-RateLimit-Reset'])).toBeGreaterThan(0);
  });

  it('gives PRO keys a higher limit than FREE', async () => {
    const user = makeUser('PRO', 'pro-key-1');
    for (let i = 0; i < 5; i++) {
      const res = makeRes();
      let next = false;
      await mcpRateLimiter(makeReq(user), res, () => { next = true; });
      expect(next).toBe(true);
    }
    const res = makeRes();
    let next = false;
    await mcpRateLimiter(makeReq(user), res, () => { next = true; });
    expect(next).toBe(false);
    expect(res.statusCode).toBe(429);
    expect(res.body.error.data.limit).toBe(5);
  });

  it('tracks counters per API key independently', async () => {
    const a = makeUser('FREE', 'iso-key-a');
    const b = makeUser('FREE', 'iso-key-b');
    await mcpRateLimiter(makeReq(a), makeRes(), () => {});
    await mcpRateLimiter(makeReq(a), makeRes(), () => {});

    const res = makeRes();
    let next = false;
    await mcpRateLimiter(makeReq(b), res, () => { next = true; });
    expect(next).toBe(true);
    expect(res.statusCode).toBe(200);
  });
});
