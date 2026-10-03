/**
 * F5 — secret redaction hardening.
 *
 * What is under test
 * ------------------
 * A Phase 10 dry run found that `redactSecrets()` let two real credential shapes
 * through to emitted agent output: a bare MCP key and a bare Google/Firebase
 * key. Both survived because every pattern that could have caught them was
 * context-dependent — an `Authorization:` header or a `key=value` name — and a
 * memory record that mentions a key in a sentence ("the key is <X>") has neither.
 *
 * Two shapes were added to the existing `SECRET_SHAPES` list, plus one guard that
 * makes redaction idempotent for values that were already redacted.
 *
 * The boundaries this file protects
 * --------------------------------
 *   1. The new shapes fire on the BARE token, which is the defect.
 *   2. Every shape that worked before still works.
 *   3. The repository's own documentation about these keys stays READABLE. This
 *      matters more than it looks: `rules/SECRET_HANDLING.md` and
 *      `rules/PROTECTED_PATHS.md` both name `uh_live_` and `AIza` as prefixes and
 *      placeholders, and `RUNTIME_VERIFICATION.md` records the Firebase *web* key
 *      as a deliberate false positive. A pattern that redacted those would make
 *      the agent's own guidance unreadable in exactly the records an operator
 *      needs.
 *   4. Redaction is not load-bearing for safety. `secret-scan.mjs` remains the
 *      detection and refusal system, and it still refuses a real secret whether or
 *      not redaction ran first.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { redactSecrets, containsSecretShape } from '../scripts/lib/memory.mjs';
import { scanText } from '../scripts/secret-scan.mjs';

/** `AIza` plus exactly 35 token characters, which is the canonical width. */
const GOOGLE_KEY = `AIza${'SyD1a2B3c4D5e6F7g8H9i0JkLmNoPqRsTuV'}`;
/** This project's own MCP key prefix plus a 16-character body. */
const MCP_KEY = 'uh_live_9f3c2a7be14d8065';

test('F5-S1: a bare MCP API key is redacted', () => {
  const out = redactSecrets(`the admin key is ${MCP_KEY} and it still works`);
  assert.equal(out.includes(MCP_KEY), false, 'the key survived redaction');
  assert.match(out, /the admin key is \[REDACTED\] and it still works/);
});

test('F5-S2: a bare Google/Firebase API key is redacted', () => {
  const out = redactSecrets(`the firebase admin key is ${GOOGLE_KEY}`);
  assert.equal(out.includes(GOOGLE_KEY), false, 'the key survived redaction');
  assert.match(out, /the firebase admin key is \[REDACTED\]/);
});

test('F5-S3: contextual forms are still redacted', () => {
  for (const input of [
    `Authorization: Bearer ${MCP_KEY}`,
    `Authorization: Bearer ${GOOGLE_KEY}`,
    `api_key=${MCP_KEY}`,
    `{"token":"${MCP_KEY}"}`,
    `password=${MCP_KEY}`,
  ]) {
    const out = redactSecrets(input);
    assert.equal(containsSecretShape(out), false, `still secret-shaped after redaction: ${input}`);
    assert.equal(out.includes(MCP_KEY), false, `MCP key survived: ${input}`);
    assert.equal(out.includes(GOOGLE_KEY), false, `Google key survived: ${input}`);
  }
});

test('F5-S4: [REDACTED] is stable under repeated redaction', () => {
  const inputs = [
    `the key is ${MCP_KEY}`,
    `the key is ${GOOGLE_KEY}`,
    `apiKey: "${GOOGLE_KEY}"`,
    'apiKey: "[REDACTED]"',
    'Authorization: Bearer [REDACTED]',
    'the key is [REDACTED] and it works',
  ];
  for (const input of inputs) {
    const once = redactSecrets(input);
    const twice = redactSecrets(once);
    const thrice = redactSecrets(twice);
    assert.equal(once, thrice, `not idempotent for ${JSON.stringify(input)}`);
    assert.equal(twice, thrice, `drifted on the third pass for ${JSON.stringify(input)}`);
    assert.equal(containsSecretShape(once), false,
      `a redacted string still reports as secret: ${JSON.stringify(once)}`);
  }
});

test('F5-S5: the repository guidance about these keys stays readable', () => {
  // Each of these is quoted from documentation in this repository. Redacting any
  // of them would make the agent's own record of the rule unreadable.
  const prose = [
    'the MCP API key prefix is `uh_live_`',
    'MCP API keys look like `uh_live_...`; stored hashed in MongoDB',
    '`Bearer uh_live_xxx` is documentation, not a credential',
    'the prefix uh_live_ is not a secret',
    'set MCP_API_KEY_PREFIX=uh_live_ in the environment',
    'the short id uh_live_abc is not a key',
    'Google API key `AIza...` is a documented false positive',
    'the AIza hits are a Firebase web apiKey plus a base64 coincidence',
  ];
  for (const text of prose) {
    assert.equal(redactSecrets(text), text, `ordinary documentation was altered: ${text}`);
  }
});

test('F5-S6: an ordinary memory record stays readable', () => {
  const record = '**What happened.** The CORS origin callback returned `true` '
    + 'unconditionally, so every origin was allowed. Fixed by comparing against the '
    + 'configured allowlist in `backend/src/server.js`.';
  assert.equal(redactSecrets(record), record);
});

test('F5-S7: the scanner still refuses real secrets, so redaction is not load-bearing', () => {
  const found = (text, path) => {
    const r = scanText(text, path);
    return (Array.isArray(r) ? r : (r?.findings ?? []))
      .map((f) => ({ detector: f.detector, verdict: f.verdict }));
  };

  // The scanner is unchanged by F5 and still refuses a server-side Google key.
  assert.deepEqual(
    found(`const k = "${GOOGLE_KEY}";`, 'backend/src/config.js'),
    [{ detector: 'google-api-key', verdict: 'REAL_SECRET' }],
  );
  // An unrelated detector still refuses too, so this is not one lucky pattern.
  assert.equal(
    found('const s = "whsec_abcdefghij1234567890";', 'backend/src/x.js')[0]?.verdict,
    'REAL_SECRET',
  );
  // The documented frontend refinement is intact: the Firebase *web* key is a
  // public identifier, and F5 must not have promoted it to a secret.
  assert.equal(
    found(`const k = "${GOOGLE_KEY}";`, 'frontend/src/main.tsx')[0]?.verdict,
    'PUBLIC_IDENTIFIER',
  );

  // HISTORY, kept explicit. At F5 this was a KNOWN GAP, pinned here on purpose:
  // the scanner had no MCP detector, so a committed `uh_live_...` in source was
  // not flagged. F6 closed it by adding the `mcp-api-key` detector, and this
  // assertion is what forced that to be a deliberate, documented change rather
  // than a silent shift in coverage. The full fixture matrix now lives in
  // `secret-scan-fixtures.test.mjs`.
  //
  // Current contract: the scanner refuses an unredacted MCP key in application
  // code, so redaction is a second layer rather than the only one.
  assert.deepEqual(
    found(`const key = "${MCP_KEY}";`, 'backend/src/services/x.js'),
    [{ detector: 'mcp-api-key', verdict: 'REAL_SECRET' }],
    'MCP scanner coverage changed — update this test and security/SECRET_HANDLING.md deliberately',
  );

  // The text is still recognised as secret-shaped before redaction runs, which is
  // what makes the redaction layer, not luck, responsible for the output.
  assert.equal(containsSecretShape(`const key = "${MCP_KEY}";`), true);
});

test('F5-S8: redacted JSON stays valid JSON and deterministic', () => {
  const payload = JSON.stringify({
    title: `MCP rotation for ${MCP_KEY}`,
    body: `the firebase key ${GOOGLE_KEY} was revoked`,
    note: 'no secrets here',
  });
  const once = redactSecrets(payload);
  const twice = redactSecrets(once);
  assert.equal(once, twice, 'redaction must be deterministic');
  const parsed = JSON.parse(once);
  assert.equal(parsed.note, 'no secrets here');
  assert.equal(parsed.title.includes(MCP_KEY), false);
  assert.equal(parsed.body.includes(GOOGLE_KEY), false);
});

test('F5-S9: the real JSON CLIs emit valid JSON with no secret on stdout', () => {
  const task = 'Fix a bug in backend/src/services/accessService.js';
  for (const [label, args] of [
    ['agent:memory', ['.uihub-agent/scripts/memory-query.mjs', '--json', task]],
    ['agent:prepare', ['.uihub-agent/scripts/prepare-task.mjs', '--json', task]],
  ]) {
    const r = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    assert.equal(r.status, 0, `${label} exited ${r.status}: ${r.stderr.slice(0, 400)}`);
    assert.doesNotThrow(() => JSON.parse(r.stdout), `${label} did not emit valid JSON`);
    assert.equal(containsSecretShape(r.stdout), false,
      `${label} emitted something secret-shaped`);
    assert.equal(/AIza[0-9A-Za-z_\-]{35}/.test(r.stdout), false,
      `${label} emitted a Google API key`);
    assert.equal(/uh_live_[A-Za-z0-9_\-]{16,}/.test(r.stdout), false,
      `${label} emitted an MCP API key`);
  }
});