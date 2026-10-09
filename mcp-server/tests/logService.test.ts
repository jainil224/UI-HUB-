import { describe, it, expect } from 'vitest';
import type { McpEvent } from '../src/services/analyticsService.js';
import {
  statusOf,
  resultOfEvent,
  mapLogRow,
  matchesLogFilters,
  eventsToLogRows,
  logsToCsv,
} from '../src/services/logService.js';

const ev = (over: Partial<McpEvent>): McpEvent => ({ event: 'mcp_request', timestamp: 1000, ...over });

describe('logService.statusOf', () => {
  it('prefers an explicit statusCode', () => {
    expect(statusOf(ev({ statusCode: 418 }))).toBe(418);
  });

  it('maps error codes to HTTP statuses', () => {
    expect(statusOf(ev({ success: false, errorCode: 'RATE_LIMIT' }))).toBe(429);
    expect(statusOf(ev({ success: false, errorCode: 'RATE_LIMITED' }))).toBe(429);
    expect(statusOf(ev({ success: false, errorCode: 'INSUFFICIENT_TIER' }))).toBe(403);
    expect(statusOf(ev({ success: false, errorCode: 'PREMIUM_ACCESS_DENIED' }))).toBe(403);
    expect(statusOf(ev({ success: false, errorCode: 'AUTH_FAILURE' }))).toBe(401);
    expect(statusOf(ev({ success: false, errorCode: 'INVALID_API_KEY' }))).toBe(401);
  });

  it('falls back to the event name for known failures', () => {
    expect(statusOf(ev({ event: 'auth_failure', success: false }))).toBe(401);
    expect(statusOf(ev({ event: 'rate_limit', success: false }))).toBe(429);
    expect(statusOf(ev({ event: 'premium_denied', success: false }))).toBe(403);
  });

  it('maps unknown errors to 500 and successes to 200', () => {
    expect(statusOf(ev({ success: false, errorCode: 'SOMETHING' }))).toBe(500);
    expect(statusOf(ev({ success: true }))).toBe(200);
  });
});

describe('logService.resultOfEvent', () => {
  it('derives a result label', () => {
    expect(resultOfEvent(ev({ statusCode: 200 }))).toBe('success');
    expect(resultOfEvent(ev({ statusCode: 500 }))).toBe('error');
    expect(resultOfEvent(ev({ success: false }))).toBe('error');
    expect(resultOfEvent(ev({ errorCode: 'X' }))).toBe('error');
    expect(resultOfEvent(ev({ success: true }))).toBe('success');
  });
});

describe('logService.mapLogRow', () => {
  it('attaches derived status, result and ts', () => {
    const row = mapLogRow(ev({ statusCode: 201 }));
    expect(row.status).toBe(201);
    expect(row.result).toBe('success');
    expect(row.ts).toBe(1000);
  });
});

describe('logService.matchesLogFilters', () => {
  const row = mapLogRow(
    ev({ event: 'component_search', componentId: 'cursor', query: 'Neon Glow', keyPrefix: 'uh_live_a', statusCode: 200 })
  );

  it('matches by event, status and result', () => {
    expect(matchesLogFilters(row, { event: 'component_search' })).toBe(true);
    expect(matchesLogFilters(row, { event: 'rate_limit' })).toBe(false);
    expect(matchesLogFilters(row, { status: 200 })).toBe(true);
    expect(matchesLogFilters(row, { status: '200' })).toBe(true);
    expect(matchesLogFilters(row, { status: 500 })).toBe(false);
    expect(matchesLogFilters(row, { result: 'success' })).toBe(true);
    expect(matchesLogFilters(row, { result: 'error' })).toBe(false);
  });

  it('matches search across multiple fields, case-insensitively', () => {
    expect(matchesLogFilters(row, { search: 'neon' })).toBe(true);
    expect(matchesLogFilters(row, { search: 'CURSOR' })).toBe(true);
    expect(matchesLogFilters(row, { search: 'uh_live' })).toBe(true);
    expect(matchesLogFilters(row, { search: 'nope' })).toBe(false);
  });

  it('ignores empty filters', () => {
    expect(matchesLogFilters(row, {})).toBe(true);
    expect(matchesLogFilters(row, { event: '', result: '', status: '' })).toBe(true);
  });
});

describe('logService.eventsToLogRows', () => {
  const events: McpEvent[] = [
    ev({ timestamp: 10 }),
    ev({ timestamp: 30, componentId: 'a' }),
    ev({ timestamp: 20, componentId: 'b' }),
  ];

  it('sorts newest first', () => {
    expect(eventsToLogRows(events).map((r) => r.ts)).toEqual([30, 20, 10]);
  });

  it('filters and then sorts', () => {
    const rows = eventsToLogRows(events, { search: 'a' });
    expect(rows).toHaveLength(1);
    expect(rows[0].componentId).toBe('a');
  });
});

describe('logService.logsToCsv', () => {
  it('emits a header followed by a data row', () => {
    const csv = logsToCsv([mapLogRow(ev({ event: 'component_search', query: 'neon' }))]);
    const [header, row] = csv.split('\n');
    expect(header).toBe('timestamp,event,userId,keyPrefix,tier,tool,componentId,query,status,result,errorCode,responseTimeMs');
    expect(row).toContain('component_search');
    expect(row).toContain('neon');
  });

  it('escapes commas, quotes and newlines', () => {
    const csv = logsToCsv([mapLogRow(ev({ query: 'a,"b"\nc' }))]);
    const row = csv.split('\n').slice(1).join('\n');
    expect(row).toContain('"a,""b""\nc"');
  });

  it('applies the provided uid mask', () => {
    const csv = logsToCsv([mapLogRow(ev({ userId: 'secret-user' }))], (u) => `masked:${u.length}`);
    expect(csv).toContain('masked:11');
    expect(csv).not.toContain('secret-user');
  });
});
