/**
 * F6 — MCP secret detector: fixture matrix, backward compatibility, and the
 * scanner/redaction boundary.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The scanner had fifteen detectors and no per-detector fixture matrix. Coverage
 * was indirect: two assertions in `memory-boundaries.test.mjs` that a shape the
 * redaction layer *misses* is still refused, which is the opposite direction.
 * Nothing pinned the verdict of any existing detector, so a change to one could
 * silently alter another.
 *
 * F5 closed the redaction gap for `uh_live_...` and recorded that the canonical
 * scanner had no MCP detector at all — every shape in the matrix returned *no
 * finding*. This file is the matrix that made that visible, and it is the thing
 * that will catch the next detector drifting into its neighbour.
 *
 * THE CREDENTIAL CONTRACT (evidence, not guesswork)
 * -------------------------------------------------
 * `mcp-server/src/services/apiKeyService.ts`:
 *   `${config.apiKeyPrefix}${crypto.randomBytes(32).toString('base64url')}`
 * `mcp-server/src/config/env.ts`: `MCP_API_KEY_PREFIX || 'uh_live_'`
 *
 * So a real key is `uh_live_` + 43 base64url characters. `SECRET_HANDLING.md`
 * records these as "stored hashed in MongoDB", "In git? no", and records the bare
 * prefix as "a prefix, not a secret".
 *
 * 16 is the detection floor rather than the true width 43. See the detector
 * comment in `secret-scan.mjs` for why, and note the two repository facts that
 * bound it: `getKeyPrefix()` returns a 14-char prefix (6-char body) and
 * `middleware/auth.ts` echoes a 24-char truncation (16-char body).
 *
 * NOTHING HERE IS A REAL CREDENTIAL
 * ---------------------------------
 * The 43-character bodies below are random strings generated for this file.
 * They were never minted, never issued, and authenticate against nothing.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { redactSecrets, containsSecretShape } from '../scripts/lib/memory.mjs';
import { scanText } from '../scripts/secret-scan.mjs';
import { serialiseSafely as serialiseMemorySafely } from '../scripts/memory-query.mjs';
import { prepareTask } from '../scripts/prepare-task.mjs';

/** Random, never-issued bodies. Correct width = 43. */
const BODY_43 = 'K7mQx2ZpL9vR4tYw8Nc3Bd6Fg1Hj5Km0Pq7Xs2Va9Eu';
const BODY_43_B = 'Rt5Wq9LmZx3Nc7Bd2Fg6Hj1Kk8Pp4Ss0Vv9Ee3Iu7Yq';
/** A truncated paste — 20 body chars. */
const BODY_20 = 'K7mQx2ZpL9vR4tYw8N';

assert.equal(BODY_43.length, 43, 'the synthetic body must match the real credential width');
assert.equal(BODY_43_B.length, 43);

/** Convenience: verdict of the first `mcp-api-key` finding, or null. */
function mcpVerdict(text, path) {
  const hit = scanText(text, path).find((f) => f.detector === 'mcp-api-key');
  return hit ? hit.verdict : null;
}

function allDetectors(text, path) {
  return scanText(text, path).map((f) => `${f.detector}=${f.verdict}`);
}

// ---------------------------------------------------------------------------
// §4 fixture matrix
// ---------------------------------------------------------------------------

test('F6-M1: a full-width MCP key is a REAL_SECRET', () => {
  assert.equal(mcpVerdict(`const k = "uh_live_${BODY_43}";`, 'mcp-server/src/services/x.ts'), 'REAL_SECRET');
});

test('F6-M2: a truncated paste is still caught — the width floor earns its keep', () => {
  // A `{43}`-only detector would miss this. It is the realistic leak.
  assert.equal(mcpVerdict(`key is uh_live_${BODY_20}`, 'docs/runbook.md'), 'REAL_SECRET');
  assert.equal(mcpVerdict(`Authorization: Bearer uh_live_${BODY_43_B}`, 'backend/src/x.js'), 'REAL_SECRET');
});

test('F6-M3: values below the floor are not real-secret findings', () => {
  // 6 body chars is exactly what `getKeyPrefix()` deliberately displays.
  for (const body of ['abc123', 'abc123abcde', 'a'.repeat(15)]) {
    const v = mcpVerdict(`const p = "uh_live_${body}";`, 'mcp-server/src/services/x.ts');
    assert.notEqual(v, 'REAL_SECRET', `body of ${body.length} chars must not be REAL_SECRET`);
  }
});

test('F6-M4: the bare prefix is not a credential', () => {
  // `MCP_API_KEY_PREFIX=uh_live_` is committed in mcp-server/.env.example and
  // SECRET_HANDLING.md lists it as "a prefix, not a secret".
  assert.equal(mcpVerdict('MCP_API_KEY_PREFIX=uh_live_', 'mcp-server/.env.example'), null);
  assert.equal(mcpVerdict("apiKeyPrefix: process.env.MCP_API_KEY_PREFIX || 'uh_live_',", 'mcp-server/src/config/env.ts'), null);
});

test('F6-M5: the documented example is a PLACEHOLDER, not a leak', () => {
  // This exact line is committed in README.md, MCP.md, docs/mcp.md and
  // docs/cli.md. It is the case that decides whether the capture group is the
  // body or the whole token.
  const doc = 'API keys use the format: `uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx`';
  assert.equal(mcpVerdict(doc, 'docs/mcp.md'), 'PLACEHOLDER');
  assert.equal(mcpVerdict(doc, 'README.md'), 'PLACEHOLDER');
});

test('F6-M6: placeholder and ellipsis forms stay unremarkable', () => {
  for (const [text, path] of [
    ['MCP_API_KEY=uh_live_<your-key>', 'docs/mcp.md'],
    ['Authorization: Bearer uh_live_xxx', 'docs/mcp.md'],
    ['Bearer uh_live_...', 'docs/mcp.md'],
    ["if (!prefix) return 'uh_live_';", 'frontend/src/pages/Dashboard/MCPPage.tsx'],
    ['// Format: uh_live_<32 bytes base64url>', 'mcp-server/src/services/apiKeyService.ts'],
    ['// Example: uh_live_abc123... -> uh_live_abc1', 'mcp-server/src/services/apiKeyService.ts'],
  ]) {
    assert.notEqual(mcpVerdict(text, path), 'REAL_SECRET',
      `false positive on ${JSON.stringify(text)} in ${path}`);
  }
});

test('F6-M7: a deliberate test fixture is classified by the existing path rule', () => {
  // No new fixture semantics were invented. The pre-existing `tests/` path rule
  // in classify() handles this.
  const v = mcpVerdict(`const key = 'uh_live_${BODY_43}';`, 'mcp-server/tests/auth.test.ts');
  assert.notEqual(v, 'REAL_SECRET', 'a test fixture must never fail CI');
  assert.ok(['TEST_FIXTURE', 'PLACEHOLDER'].includes(v), `expected a fixture verdict, got ${v}`);
});

test('F6-M8: ordinary prose containing the prefix is not a false positive', () => {
  for (const text of [
    'the key starts with uh_live_ followed by random characters',
    'MCP API keys look like uh_live_...; stored hashed in MongoDB',
    'the MCP API key prefix is uh_live_',
  ]) {
    assert.equal(mcpVerdict(text, 'README.md'), null, `false positive on ${JSON.stringify(text)}`);
  }
});

test('F6-M9: base64url charset is enforced — not `uh_live_.*`', () => {
  // §3 forbids an overly broad expression. Characters outside base64url must not
  // satisfy the body.
  for (const body of ['...............abc', '+++++++++++++++abc', '///////////////abc',
    '••••••••••••••', '[A-Za-z0-9_\\-']) {
    assert.equal(mcpVerdict(`x uh_live_${body}`, 'backend/src/x.js'), null,
      `non-base64url body was accepted: ${JSON.stringify(body)}`);
  }
  // And a legal base64url body of sufficient length is accepted.
  assert.equal(mcpVerdict(`x uh_live_${BODY_43}`, 'backend/src/x.js'), 'REAL_SECRET');
});

// ---------------------------------------------------------------------------
// §6 backward compatibility — every pre-existing detector, pinned
// ---------------------------------------------------------------------------

test('F6-B1: every pre-existing detector still fires exactly as before', () => {
  const CASES = [
    // [label, text, path, expected detector, expected verdict]
    ['mongodb-uri', 'mongodb+srv://uihub:realpassword123@cluster0.abcde.mongodb.net/uihub', 'backend/.env.example', 'mongodb-uri', 'REAL_SECRET'],
    ['aws-access-key-id', 'AKIAIOSFODNN7EXAMPLE', 'backend/src/config/db.js', 'aws-access-key-id', 'REAL_SECRET'],
    // The AWS rule is exactly 40 characters (a known limitation, documented in the
// scanner header), so the literal below is deliberately 40 and the assertion
// pins that width.
['aws-secret-access-key', 'AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzabcdefgHH"', 'backend/.env.example', 'aws-secret-access-key', 'REAL_SECRET'],
    ['private-key', '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA\n-----END RSA PRIVATE KEY-----', 'backend/service-account.json', 'private-key', 'REAL_SECRET'],
    ['private-key-header', 'FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."', 'backend/.env.example', 'private-key-header', 'PLACEHOLDER'],
    ['firebase-service-account', '"private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvQ"', 'backend/service-account.json', 'firebase-service-account', 'REAL_SECRET'],
    ['razorpay-key', 'rzp_live_9f3cQ2mXk8pL7wR5tY1', 'backend/.env.example', 'razorpay-key', 'REAL_SECRET'],
    ['github-token', 'ghp_16CharsOfTokenHere1234567890abcd', 'scripts/deploy.sh', 'github-token', 'REAL_SECRET'],
    ['slack-token', 'xoxb-123456789012-abcdefghijkl', 'scripts/notify.sh', 'slack-token', 'REAL_SECRET'],
    ['stripe-webhook-secret', 'whsec_abcdefghij1234567890', 'backend/.env.example', 'stripe-webhook-secret', 'REAL_SECRET'],
    ['google-api-key (server)', `const k = "AIza${'SyD1a2B3c4D5e6F7g8H9i0JkLmNoPqRsTuV'}";`, 'backend/src/config.js', 'google-api-key', 'REAL_SECRET'],
    ['sendgrid-key', 'SG.abcdefghij1234567890.abcdefghij1234567890', 'backend/.env.example', 'sendgrid-key', 'REAL_SECRET'],
    ['bearer-token (JWT)', 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U', 'backend/src/middleware/auth.js', 'bearer-token', 'REAL_SECRET'],
    ['smtp-credential', 'SMTP_PASS=realsecretvalue123', 'backend/.env', 'smtp-credential', 'REAL_SECRET'],
    ['vapid-private-key', 'VAPID_PRIVATE_KEY=abcdefghij0123456789ABCDEFGHIJ0123456789abc', 'backend/.env', 'vapid-private-key', 'REAL_SECRET'],
  ];
  for (const [label, text, path, detector, verdict] of CASES) {
    const hits = scanText(text, path);
    const hit = hits.find((f) => f.detector === detector);
    assert.ok(hit, `${label}: detector ${detector} did not fire (got ${JSON.stringify(allDetectors(text, path))})`);
    assert.equal(hit.verdict, verdict, `${label}: verdict drifted`);
  }
});

test('F6-B2: the Firebase public-identifier distinction is untouched', () => {
  // §7: the new detector must not disturb the one documented public identifier.
  const key = `AIza${'SyD1a2B3c4D5e6F7g8H9i0JkLmNoPqRsTuV'}`;
  const frontend = scanText(`const k = "${key}";`, 'frontend/src/main.tsx');
  assert.equal(frontend.find((f) => f.detector === 'google-api-key').verdict, 'PUBLIC_IDENTIFIER');
  const backend = scanText(`const k = "${key}";`, 'backend/src/config.js');
  assert.equal(backend.find((f) => f.detector === 'google-api-key').verdict, 'REAL_SECRET');
});

test('F6-B3: the MCP detector does not shadow or double-report other shapes', () => {
  // A JWT, a Stripe secret and an MCP key on one page must each be attributed
  // once, to the right detector.
  const text = [
    // `bearer-token` is context-anchored on the literal `Bearer` keyword, which is
    // its pre-existing behaviour and is why the JWT must be written as a header.
    'const res = await fetch(url, { headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcdefghijklmnop" } });',
    'const stripe = "whsec_abcdefghij1234567890";',
    `const mcp = "uh_live_${BODY_43}";`,
  ].join('\n');
  const hits = scanText(text, 'backend/src/services/integrations.js');
  const ids = hits.map((h) => h.detector);
  assert.deepEqual([...new Set(ids)].sort(), ['bearer-token', 'mcp-api-key', 'stripe-webhook-secret']);
  for (const id of ids) {
    assert.equal(ids.filter((x) => x === id).length, 1, `${id} reported more than once`);
  }
});

test('F6-B4: the scanner still self-exempts and binary/binary-ext still skip', () => {
  assert.deepEqual(scanText(`const k = "uh_live_${BODY_43}";`, '.uihub-agent/scripts/secret-scan.mjs'), []);
  assert.deepEqual(scanText(`uh_live_${BODY_43}`, 'docs/logo.png'), []);
  // Documented allowlist entries stay allowlisted.
  assert.deepEqual(scanText(`MCP_API_KEY_PREFIX uh_live_`, 'backend/src/config/secrets.js'), []);
});

// ---------------------------------------------------------------------------
// §10 scanner and redaction, tested separately
// ---------------------------------------------------------------------------

test('F6-S1: detection and redaction are independent mechanisms that agree', () => {
  const raw = `the admin key is uh_live_${BODY_43}`;

  // Detection: raw credential -> scanner finds it.
  assert.equal(mcpVerdict(raw, 'backend/src/x.js'), 'REAL_SECRET');

  // Redaction: raw credential -> redactSecrets sanitizes it.
  const redacted = redactSecrets(raw);
  assert.equal(redacted.includes(BODY_43), false, 'redaction failed');
  assert.match(redacted, /the admin key is \[REDACTED\]/);

  // The redacted form is what the scanner sees downstream, and it is clean.
  assert.equal(mcpVerdict(redacted, 'backend/src/x.js'), null);

  // And redaction did not make detection unnecessary: the scanner still finds
  // the raw form. Neither layer is standing in for the other.
  assert.equal(mcpVerdict(raw, 'backend/src/x.js'), 'REAL_SECRET');
});

test('F6-S2: already-redacted content is unchanged, and clean content is byte-identical', () => {
  assert.equal(redactSecrets('the admin key is [REDACTED]'), 'the admin key is [REDACTED]');
  assert.equal(mcpVerdict('the admin key is [REDACTED]', 'backend/src/x.js'), null);

  const clean = 'const key = await getKeyPrefix(); // uh_live_ prefix only, no body';
  assert.equal(redactSecrets(clean), clean, 'clean content must be byte-identical');
  assert.equal(mcpVerdict(clean, 'backend/src/x.js'), null);
});

test('F6-S3: the documented display prefix is neither flagged nor mangled', () => {
  // `getKeyPrefix()` returns 14 chars = prefix + 6 body chars, and that value is
  // served to the dashboard. It must survive both layers untouched.
  const display = 'key_prefix: "uh_live_K7mQx"';
  assert.equal(mcpVerdict(display, 'mcp-server/src/services/x.ts'), null);
  assert.equal(redactSecrets(display), display);
});

test('F6-S4: containsSecretShape and the scanner agree on a real key', () => {
  assert.equal(containsSecretShape(`uh_live_${BODY_43}`), true);
  assert.equal(containsSecretShape('uh_live_abc123'), false);
});

// ---------------------------------------------------------------------------
// §16 overreach — the shapes F6 must NOT have started detecting
// ---------------------------------------------------------------------------

test('F6-O1: F6 did not add detectors for unrelated shapes', () => {
  // §17 forbids scope creep. These have no detector today and must still have
  // none; if a future phase adds one, this assertion forces a deliberate change.
  assert.deepEqual(allDetectors('const hex = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";', 'backend/src/x.js'), []);
  assert.deepEqual(allDetectors('const apiKey = "totally-not-a-real-key-value";', 'backend/src/x.js'), []);
  assert.deepEqual(allDetectors('const password = "hunter2hunter2hunter2";', 'backend/src/x.js'), []);
});

test('F6-O2: every committed uh_live_ occurrence stays non-REAL_SECRET', () => {
  // The whole-repository guarantee, asserted on the shapes this repository
  // actually contains rather than on a hand-picked sample.
  const COMMITTED = [
    'MCP_API_KEY_PREFIX=uh_live_',
    "apiKeyPrefix: process.env.MCP_API_KEY_PREFIX || 'uh_live_',",
    "if (!prefix) return 'uh_live_';",
    'Authorization: Bearer uh_live_...',
    'API keys use the format: `uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx`',
    'Authorization: Bearer uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx',
    '// Format: uh_live_<32 bytes base64url>',
    '// Example: uh_live_abc123... -> uh_live_abc1',
    '// Header: Authorization: Bearer uh_live_xxx',
    '// Fallback: ?key=uh_live_xxx query param or x-api-key header',
    'ui-hub login --key uh_live_.',
    'the key you provided does not start with `uh_live_`',
    'const key = \'uh_live_mysecretkey1234567890\';',
  ];
  for (const line of COMMITTED) {
    for (const path of ['README.md', 'docs/mcp.md', 'mcp-server/.env.example',
      'mcp-server/src/config/env.ts', 'mcp-server/src/services/apiKeyService.ts',
      'mcp-server/tests/apiKey.test.ts', 'frontend/src/pages/Dashboard/MCPPage.tsx']) {
      assert.notEqual(mcpVerdict(line, path), 'REAL_SECRET',
        `committed line became REAL_SECRET in ${path}: ${JSON.stringify(line)}`);
    }
  }
});
// ---------------------------------------------------------------------------
// �9 end-to-end: memory and prepare stay safe with a real-shaped key
// ---------------------------------------------------------------------------

/**
 * Fixtures are injected, never written to disk.
 *
 * This follows the rule `memory-boundaries.test.mjs` established: a credential
 * written into a memory file would be a credential committed to the repository
 * and would then be rejected by `check:secrets`. `prepareTask({ records })` is the
 * existing injection seam, so the throwaway record never reaches the filesystem.
 */
function syntheticRecords() {
  return [{
    id: 'KF-F6-MCP',
    status: 'CURRENT',
    tier: 'P0',
    kind: 'known_fix',
    // `source` matches the task's evidence so the record actually retrieves; a
    // record that is filtered out would make every assertion below vacuous.
    source: 'backend/src/services/accessService.js',
    title: `accessService key uh_live_${BODY_43}`,
    snippet: `the deployed key uh_live_${BODY_43} was rotated from the dashboard`,
    date: '2026-01-15',
  }];
}

const PREPARE_TASK = 'Fix a bug in backend/src/services/accessService.js';

test('F6-E1: agent:prepare redacts the key, keeps JSON valid, and is idempotent', () => {
  const report = prepareTask(PREPARE_TASK, { records: syntheticRecords() });

  // Guard against a vacuous pass: the record must actually surface.
  assert.equal(report.memory.resultCount, 1, 'the injected record did not retrieve');
  assert.equal(report.memory.declined, false);

  const memoryText = JSON.stringify(report.memory);

  // 1. Redaction removed it and said so.
  assert.equal(memoryText.includes(BODY_43), false, 'the key body survived into the prepare report');
  assert.equal(/\buh_live_[A-Za-z0-9_-]{16,}/.test(memoryText), false,
    'a credential-shaped MCP token survived into the prepare report');
  assert.match(report.memory.results[0].title, /\[REDACTED\]/,
    'the title should carry [REDACTED] rather than the key');

  // 2. The scanner would have refused the unredacted form. This is what proves
  //    redaction is not the only thing between the value and the report.
  assert.equal(mcpVerdict(`uh_live_${BODY_43}`, 'mcp-server/src/services/apiKey.ts'), 'REAL_SECRET');

  // 3. Valid JSON, deterministic, and a second pass changes nothing.
  assert.doesNotThrow(() => JSON.parse(memoryText), 'prepare memory block must be valid JSON');
  assert.equal(redactSecrets(memoryText), memoryText, 'redaction must be idempotent on emitted output');
  assert.equal(containsSecretShape(memoryText), false, 'emitted output still reports as secret-shaped');
  assert.equal(prepareTask(PREPARE_TASK, { records: syntheticRecords() }).memory.resultCount, 1,
    'prepare must be deterministic');
});

test('F6-E2: the emit boundary now refuses a key that redaction did not reach', () => {
  // This is the concrete F6 win. `serialiseSafely` runs the canonical scanner over
  // the payload. Before F6 the scanner had no MCP detector, so this returned
  // ok:true and `agent:memory` would have printed the key in full: the redaction
  // layer was the only thing preventing it. Now the scanner refuses as well.
  const raw = { resultCount: 1, results: [{ id: 'KF-F6-MCP', snippet: `key uh_live_${BODY_43}` }] };

  const unredacted = serialiseMemorySafely(raw, 'memory-query');
  assert.equal(unredacted.ok, false, 'the emit boundary accepted an unredacted MCP key');
  assert.deepEqual(
    unredacted.findings.map((f) => ({ verdict: f.verdict, detector: f.detector })),
    [{ verdict: 'REAL_SECRET', detector: 'mcp-api-key' }],
    'the refusal must name the MCP detector, not some other shape',
  );

  // And the normal path — redaction applied first — still emits cleanly.
  const cleaned = {
    resultCount: 1,
    results: [{ id: 'KF-F6-MCP', snippet: redactSecrets(`key uh_live_${BODY_43}`) }],
  };
  const safe = serialiseMemorySafely(cleaned, 'memory-query');
  assert.equal(safe.ok, true, `redacted payload was refused: ${JSON.stringify(safe.findings)}`);
  assert.equal(/\buh_live_[A-Za-z0-9_-]{16,}/.test(safe.serialised), false, 'a token reached stdout');
  assert.match(safe.serialised, /\[REDACTED\]/);
  assert.doesNotThrow(() => JSON.parse(safe.serialised), 'stdout must stay valid JSON');
  assert.equal(redactSecrets(safe.serialised), safe.serialised, 'redaction must be idempotent on stdout');
  assert.equal(serialiseMemorySafely(cleaned, 'memory-query').serialised, safe.serialised,
    'emission must be deterministic');
});

test('F6-E3: neither layer depends on the other', () => {
  // §9 forbids making redaction depend on the scanner, and the scanner depend on
  // memory retrieval. Both are pure functions of their input, so each is shown to
  // work with the other entirely absent from the picture.
  const raw = `uh_live_${BODY_43}`;

  // Redaction works with no scanner involved, and removes prefix and body.
  assert.equal(redactSecrets(raw), '[REDACTED]');

  // Detection works with no memory retrieval involved.
  assert.equal(mcpVerdict(raw, 'backend/src/services/x.js'), 'REAL_SECRET');

  // A value the redaction layer deliberately leaves alone is judged independently,
  // and is still not a finding: the layers agree without consulting each other.
  assert.equal(redactSecrets('uh_live_abc123'), 'uh_live_abc123', 'display prefix must survive');
  assert.equal(mcpVerdict('uh_live_abc123', 'backend/src/services/x.js'), null);
});