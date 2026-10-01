/**
 * CORS regression tests for the MCP server (agent.md 6.4, 6.3).
 *
 * Separate from the web API's suite on purpose: MCP has a different caller set
 * (MCP dashboard in the browser, plus the `ui-hub` CLI and server-to-server
 * clients authenticating with `Bearer uh_live_...`). Same defect, different
 * policy.
 *
 * These assert real middleware behaviour through a live Express app via
 * supertest, so they would have failed against the Phase 5 implementation even
 * though its configuration object looked correct.
 */

import { describe, test, expect } from 'vitest';
import express from 'express';
import cors from 'cors';
import request from 'supertest';

import {
  DEFAULT_ALLOWED_ORIGINS,
  buildCorsOptions,
  createOriginPolicy,
  isOriginAllowed,
  parseOriginList,
  resolveAllowedOrigins,
} from '../src/config/corsPolicy.js';

const PROD_ORIGIN = 'https://ui-hub-design.vercel.app';
const DEV_ORIGIN = 'http://localhost:5173';

function makeApp(allowedOrigins?: string[]) {
  const app = express();
  app.use(
    cors(
      buildCorsOptions({
        allowedOrigins,
        logger: { warn: () => {} },
      }),
    ),
  );
  app.get('/probe', (_req, res) => {
    res.json({ ok: true });
  });
  return app;
}

describe('6.2 invariant on the MCP surface', () => {
  test('allowed production origin is echoed', async () => {
    const res = await request(makeApp()).get('/probe').set('Origin', PROD_ORIGIN);
    expect(res.headers['access-control-allow-origin']).toBe(PROD_ORIGIN);
  });

  test('allowed development origin is echoed', async () => {
    const res = await request(makeApp()).get('/probe').set('Origin', DEV_ORIGIN);
    expect(res.headers['access-control-allow-origin']).toBe(DEV_ORIGIN);
  });

  test('unknown origin is rejected', async () => {
    const res = await request(makeApp()).get('/probe').set('Origin', 'https://attacker.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('missing Origin is permitted for non-browser clients', async () => {
    const res = await request(makeApp()).get('/probe');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('malformed origin is rejected safely', async () => {
    for (const bad of [
      'not-a-url',
      '://ui-hub-design.vercel.app',
      'https://ui-hub-design.vercel.app.evil.example',
      'null',
    ]) {
      const res = await request(makeApp()).get('/probe').set('Origin', bad);
      expect(res.headers['access-control-allow-origin'], bad).toBeUndefined();
    }
  });

  test('preflight for a disallowed origin is rejected', async () => {
    const res = await request(makeApp())
      .options('/probe')
      .set('Origin', 'https://attacker.example')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('MCP session headers remain exposed to allowed callers', async () => {
    const res = await request(makeApp()).get('/probe').set('Origin', PROD_ORIGIN);
    expect(res.headers['access-control-expose-headers']).toContain('Mcp-Session-Id');
  });

  test('the wildcard header is never emitted', async () => {
    const res = await request(makeApp()).get('/probe').set('Origin', PROD_ORIGIN);
    expect(res.headers['access-control-allow-origin']).not.toBe('*');
  });
});

describe('the substring bypass is gone', () => {
  test('an origin merely containing "localhost" is rejected', async () => {
    // Previously `origin.includes('localhost')` accepted this.
    for (const bad of [
      'https://localhost.attacker.example',
      'https://evil.example/?localhost',
      'http://notlocalhost:5173',
    ]) {
      const res = await request(makeApp()).get('/probe').set('Origin', bad);
      expect(res.headers['access-control-allow-origin'], bad).toBeUndefined();
    }
  });
});

describe('MCP_ALLOWED_ORIGINS still works, and never removes the dashboard', () => {
  test('configured origins are permitted', async () => {
    const res = await request(makeApp(['https://extra.example']))
      .get('/probe')
      .set('Origin', 'https://extra.example');
    expect(res.headers['access-control-allow-origin']).toBe('https://extra.example');
  });

  test('configured origins are unioned with the defaults, not substituted', async () => {
    // config.allowedOrigins is an EMPTY ARRAY when MCP_ALLOWED_ORIGINS is unset.
    // Before Phase 6 the "allowed" branch was therefore unreachable and the code
    // only appeared to work because the rejection branch allowed everything.
    const resolved = resolveAllowedOrigins([]);
    expect(resolved).toContain(PROD_ORIGIN);
    expect(resolved).toEqual(expect.arrayContaining([...DEFAULT_ALLOWED_ORIGINS]));

    const res = await request(makeApp([])).get('/probe').set('Origin', PROD_ORIGIN);
    expect(res.headers['access-control-allow-origin']).toBe(PROD_ORIGIN);
  });

  test('duplicate configured origins are collapsed', () => {
    const resolved = resolveAllowedOrigins([PROD_ORIGIN, PROD_ORIGIN]);
    expect(resolved.filter((o) => o === PROD_ORIGIN)).toHaveLength(1);
  });
});

describe('pure policy helpers', () => {
  test('isOriginAllowed permits a missing origin', () => {
    expect(isOriginAllowed(undefined, ['https://a.example'])).toBe(true);
    expect(isOriginAllowed('', ['https://a.example'])).toBe(true);
  });

  test('isOriginAllowed requires an exact match', () => {
    const allow = [PROD_ORIGIN];
    expect(isOriginAllowed(PROD_ORIGIN, allow)).toBe(true);
    expect(isOriginAllowed(`${PROD_ORIGIN}/`, allow)).toBe(false);
    expect(isOriginAllowed(`${PROD_ORIGIN}:443`, allow)).toBe(false);
  });

  test('parseOriginList trims, de-duplicates, drops blanks and placeholders', () => {
    expect(parseOriginList(' https://a.example , ,https://b.example ,https://a.example ')).toEqual([
      'https://a.example',
      'https://b.example',
    ]);
    expect(parseOriginList('<your-origin>')).toEqual([]);
    expect(parseOriginList(undefined)).toEqual([]);
    expect(parseOriginList('')).toEqual([]);
  });

  test('whitespace-padded origins are refused at the policy layer', () => {
    // HTTP header parsing strips OWS, so this cannot arrive from a conforming
    // client; the policy still refuses it for hand-rolled callers.
    const policy = createOriginPolicy({ logger: { warn: () => {} } });
    const seen: Array<boolean | undefined> = [];
    policy(` ${PROD_ORIGIN} `, (_err, allow) => seen.push(allow));
    expect(seen).toEqual([false]);
  });

  test('the callback reports false for a disallowed origin', () => {
    const policy = createOriginPolicy({ logger: { warn: () => {} } });
    const seen: Array<boolean | undefined> = [];
    policy('https://attacker.example', (_err, allow) => seen.push(allow));
    expect(seen).toEqual([false]);
  });
});