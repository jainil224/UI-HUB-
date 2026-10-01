/**
 * CORS regression tests (agent.md 6.4).
 *
 * These assert real middleware behaviour over a real socket, not the shape of
 * the configuration object. A test that only inspected `buildCorsOptions()`
 * would still have passed against the Phase 5 code, because the defect was a
 * runtime decision inside the `origin` callback, not a missing config value.
 *
 * Strategy: mount the real cors middleware on a throwaway Express app, listen
 * on an ephemeral port, and send real requests with real Origin headers.
 */

import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cors from 'cors';

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

let baseUrl;
let server;

/** Boots a minimal app with the real policy and a route that always answers 200. */
before(async () => {
  const app = express();
  app.use(cors(buildCorsOptions({ logger: { warn() {} } })));
  app.get('/probe', (_req, res) => res.json({ ok: true }));
  app.post('/probe', (_req, res) => res.json({ ok: true }));

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

/**
 * Reads the CORS decision for an origin.
 * `allow` is the observable consequence of the origin policy: when the
 * middleware rejects, the ACAO header is absent entirely.
 */
async function probe(origin, { method = 'GET' } = {}) {
  const headers = {};
  if (origin !== undefined) headers.Origin = origin;
  const res = await fetch(`${baseUrl}/probe`, { method, headers });
  await res.text();
  return res.headers.get('access-control-allow-origin');
}

describe('6.2 invariant: allowed / rejected / missing / malformed', () => {
  test('allowed production origin is permitted and echoed', async () => {
    assert.equal(await probe(PROD_ORIGIN), PROD_ORIGIN);
  });

  test('allowed development origin is permitted', async () => {
    assert.equal(await probe(DEV_ORIGIN), DEV_ORIGIN);
  });

  test('unknown origin is REJECTED (no ACAO header)', async () => {
    assert.equal(await probe('https://attacker.example'), null);
  });

  test('the Phase 5 defect specifically: a disallowed origin used to be allowed', async () => {
    // This is the exact case that proved the allowlist was decorative.
    const allow = await probe('https://evil.example');
    assert.equal(allow, null, 'a disallowed origin must not receive an ACAO header');
  });

  test('missing Origin header is permitted', async () => {
    assert.equal(await probe(undefined), null, 'no-origin callers are allowed, and get no ACAO');
  });

  test('malformed origin is rejected safely', async () => {
    for (const bad of [
      'not-a-url',
      'http://',
      '://ui-hub-design.vercel.app',
      'https://ui-hub-design.vercel.app.evil.example',
      'https://evil.example/?localhost',
      'null',
    ]) {
      assert.equal(await probe(bad), null, `expected rejection for ${bad}`);
    }
  });

  test('whitespace around an origin is not silently trimmed into a match', async () => {
    // Tested at the policy layer, not over the wire. HTTP header field parsing
    // strips optional whitespace (RFC 9110 OWS), so a padded Origin can never
    // reach the middleware from a conforming client - `fetch` here proves it by
    // delivering the header already trimmed. The policy still refuses padded
    // input, which matters for a hand-rolled or non-conforming client.
    const policy = createOriginPolicy({ logger: { warn() {} } });
    for (const padded of [` ${PROD_ORIGIN} `, `\t${PROD_ORIGIN}`, `${PROD_ORIGIN} `]) {
      const calls = [];
      policy(padded, (err, allow) => calls.push(allow));
      assert.deepEqual(calls, [false], `expected rejection for ${JSON.stringify(padded)}`);
    }

    // And confirm the over-the-wire behaviour: the padded value arrives trimmed
    // and is therefore treated as the legitimate origin it now equals.
    assert.equal(await probe(PROD_ORIGIN), PROD_ORIGIN);
  });

  test('preflight for an allowed origin succeeds', async () => {
    const res = await fetch(`${baseUrl}/probe`, {
      method: 'OPTIONS',
      headers: {
        Origin: PROD_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), PROD_ORIGIN);
  });

  test('preflight for a disallowed origin is rejected', async () => {
    const res = await fetch(`${baseUrl}/probe`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://attacker.example',
        'Access-Control-Request-Method': 'POST',
      },
    });
    assert.equal(res.headers.get('access-control-allow-origin'), null);
  });

  test('POST with a disallowed origin is rejected, not just preflighted', async () => {
    assert.equal(await probe('https://attacker.example', { method: 'POST' }), null);
  });

  test('the literal wildcard header is never emitted', async () => {
    // credentials: true makes `*` invalid anyway; assert it never appears.
    for (const origin of [PROD_ORIGIN, 'https://attacker.example', undefined]) {
      assert.notEqual(await probe(origin), '*');
    }
  });
});

describe('the two bypasses that made the allowlist decorative are gone', () => {
  test('any other *.vercel.app deployment is rejected', async () => {
    // Previously `origin.endsWith('.vercel.app')` accepted all of these.
    assert.equal(await probe('https://attacker.vercel.app'), null);
    assert.equal(await probe('https://ui-hub-design-evil.vercel.app'), null);
  });

  test('a host merely CONTAINING "localhost" is rejected', async () => {
    // Previously `origin.includes('localhost')` accepted all of these.
    assert.equal(await probe('https://localhost.attacker.example'), null);
    assert.equal(await probe('https://evil.example/localhost'), null);
    assert.equal(await probe('http://notlocalhost:5173'), null);
  });
});

describe('pure policy helpers', () => {
  test('isOriginAllowed permits a missing origin', () => {
    assert.equal(isOriginAllowed(undefined, ['https://a.example']), true);
    assert.equal(isOriginAllowed('', ['https://a.example']), true);
  });

  test('isOriginAllowed requires an exact match', () => {
    const allow = ['https://ui-hub-design.vercel.app'];
    assert.equal(isOriginAllowed('https://ui-hub-design.vercel.app', allow), true);
    assert.equal(isOriginAllowed('https://ui-hub-design.vercel.app/', allow), false);
    assert.equal(isOriginAllowed('https://ui-hub-design.vercel.app:443', allow), false);
  });

  test('parseOriginList trims, de-duplicates and drops blanks', () => {
    assert.deepEqual(
      parseOriginList(' https://a.example , https://b.example ,,https://a.example '),
      ['https://a.example', 'https://b.example'],
    );
  });

  test('parseOriginList treats undefined as empty', () => {
    assert.deepEqual(parseOriginList(undefined), []);
    assert.deepEqual(parseOriginList(''), []);
  });

  test('parseOriginList ignores documentation placeholders', () => {
    // Guards against a copied .env.example silently disabling enforcement.
    assert.deepEqual(parseOriginList('<your-origin>,https://a.example'), ['https://a.example']);
  });

  test('resolveAllowedOrigins always includes the production origin', () => {
    const resolved = resolveAllowedOrigins({ ALLOWED_ORIGINS: 'https://staging.example' });
    assert.ok(resolved.includes(PROD_ORIGIN), 'union semantics must not drop production');
    assert.ok(resolved.includes('https://staging.example'), 'configured origins are added');
  });

  test('resolveAllowedOrigins accepts extra origins from the environment', () => {
    const resolved = resolveAllowedOrigins({ ALLOWED_ORIGINS: 'https://extra.example' });
    assert.deepEqual(
      [...resolved].sort(),
      [...DEFAULT_ALLOWED_ORIGINS, 'https://extra.example'].sort(),
    );
  });

  test('multiple configured origins all work', () => {
    const resolved = resolveAllowedOrigins({ ALLOWED_ORIGINS: 'https://x.example,https://y.example' });
    for (const origin of ['https://x.example', 'https://y.example']) {
      assert.equal(isOriginAllowed(origin, resolved), true);
    }
  });

  test('duplicate origins are collapsed', () => {
    const resolved = resolveAllowedOrigins({ ALLOWED_ORIGINS: `${PROD_ORIGIN},${PROD_ORIGIN}` });
    assert.equal(resolved.filter((o) => o === PROD_ORIGIN).length, 1);
  });
});

describe('the origin callback decides as documented', () => {
  test('callback receives false for a disallowed origin', () => {
    const calls = [];
    const policy = createOriginPolicy({ logger: { warn() {} } });
    policy('https://attacker.example', (err, allow) => calls.push([err, allow]));
    assert.deepEqual(calls, [[null, false]]);
  });

  test('callback receives true for an allowed origin and does not warn', () => {
    const warned = [];
    const policy = createOriginPolicy({ logger: { warn: (m) => warned.push(m) } });
    const calls = [];
    policy(PROD_ORIGIN, (err, allow) => calls.push([err, allow]));
    assert.deepEqual(calls, [[null, true]]);
    assert.equal(warned.length, 0);
  });

  test('a rejection logs the blocked origin', () => {
    const warned = [];
    const policy = createOriginPolicy({ logger: { warn: (m) => warned.push(m) } });
    policy('https://attacker.example', () => {});
    assert.equal(warned.length, 1);
    assert.match(warned[0], /Blocked origin/);
  });
});