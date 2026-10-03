/**
 * Phase 10 durable-memory tests.
 *
 * The memory layer has one job that a passing test run is easy to fake: not
 * returning something plausible. Every test below is written so that a retrieval
 * engine which ignored freshness, ignored precedence, or answered every query
 * would FAIL. A test suite for memory that only proves "it returns results"
 * proves nothing at all.
 *
 * Three families:
 *   1. INVARIANTS   the properties the layer promises (precedence, supersession,
 *                   freshness, refusal, redaction, boundedness).
 *   2. THE RECORDS  the memory files themselves are well-formed, dated, and carry
 *                   a real freshness value. This is what stops the machine-readable
 *                   layer from silently degrading to "everything is UNKNOWN".
 *   3. RETRIEVAL    evidence-based ranking, asserted against the real records.
 *
 *   node --test .uihub-agent/tests/memory.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadMemory,
  parseRecords,
  retrieve,
  retrievalPriority,
  compareRecords,
  precedenceRank,
  outranks,
  resolveFreshness,
  redactSecrets,
  containsSecretShape,
  supersede,
  hasSuperseded,
  snippet,
  SOURCE_PRECEDENCE,
  PRECEDENCE_ORDER,
  FRESHNESS,
  FRESHNESS_WEIGHT,
  MEMORY_DIR,
  MEMORY_CATEGORIES,
  MEMORY_POLICY,
} from '../scripts/lib/memory.mjs';
import { buildEvidence } from '../scripts/memory-query.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Reads a generated index, skipping the test body when it is unavailable. */
function index(name) {
  const path = join(ROOT, '.uihub-agent', 'generated', name);
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

const INDEXES = {
  featureFileIndex: index('FEATURE_FILE_INDEX.json'),
  pageComponentIndex: index('PAGE_COMPONENT_INDEX.json'),
};

const INDEXES_AVAILABLE = Boolean(INDEXES.featureFileIndex && INDEXES.pageComponentIndex);

/* ------------------------------------------------------------------ *
 * 1. INVARIANTS
 * ------------------------------------------------------------------ */

/**
 * The ladder is the layer's central claim: the repository beats memory. If this
 * ordering is ever wrong, a stale belief outranks live code and nothing else in
 * the suite would notice.
 */
test('source precedence puts the repository above memory, and memory above assumption', () => {
  assert.equal(precedenceRank(SOURCE_PRECEDENCE.RUNTIME_EVIDENCE), 0);
  assert.equal(precedenceRank(SOURCE_PRECEDENCE.SOURCE), 1);
  assert.equal(precedenceRank(SOURCE_PRECEDENCE.MEMORY), 4);
  assert.equal(precedenceRank(SOURCE_PRECEDENCE.HISTORICAL_ASSUMPTION), 5);

  assert.ok(outranks(SOURCE_PRECEDENCE.SOURCE, SOURCE_PRECEDENCE.MEMORY));
  assert.ok(outranks(SOURCE_PRECEDENCE.MEMORY, SOURCE_PRECEDENCE.HISTORICAL_ASSUMPTION));
  assert.ok(!outranks(SOURCE_PRECEDENCE.MEMORY, SOURCE_PRECEDENCE.SOURCE));

  // An unrecognised source must not be treated as authoritative. It sorts last
  // rather than first, so a typo cannot grant a record top precedence.
  assert.equal(precedenceRank('not-a-real-source'), PRECEDENCE_ORDER.length);
});

test('every precedence value has a rank and every rank is unique', () => {
  const values = Object.values(SOURCE_PRECEDENCE);
  const ranks = values.map(precedenceRank);
  assert.equal(ranks.length, values.length);
  assert.equal(new Set(ranks).size, values.length, 'two sources share a rank');
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
});

/**
 * The core safety property. A superseded belief that outranks the corrected one
 * is the exact failure this layer exists to prevent, so it is asserted directly
 * and not inferred from the comparator.
 */
test('a SUPERSEDED record never outranks a CURRENT one', () => {
  const current = { id: 'X-1', status: FRESHNESS.CURRENT, precedence: SOURCE_PRECEDENCE.MEMORY, date: '2026-01-01' };
  const superseded = { id: 'X-2', status: FRESHNESS.SUPERSEDED, precedence: SOURCE_PRECEDENCE.MEMORY, date: '2026-10-10' };

  // The superseded record is both newer and would otherwise rank better.
  assert.ok(compareRecords(current, superseded) < 0, 'CURRENT must sort before SUPERSEDED');
  assert.ok(compareRecords(superseded, current) > 0);

  // And it must lose even if it claims a stronger source.
  const supersededFromSource = { ...superseded, precedence: SOURCE_PRECEDENCE.SOURCE };
  assert.ok(compareRecords(current, supersededFromSource) < 0,
    'freshness dominates precedence; a superseded record cannot be promoted by claiming a strong source');
});

test('supersede() marks records without deleting them', () => {
  const records = [
    { id: 'A', status: FRESHNESS.CURRENT, precedence: SOURCE_PRECEDENCE.MEMORY, date: '2026-01-01' },
    { id: 'B', status: FRESHNESS.CURRENT, precedence: SOURCE_PRECEDENCE.MEMORY, date: '2026-01-02' },
  ];
  const { records: next, changed } = supersede(records, {
    supersededIds: ['A'],
    supersededBy: 'KF-006',
    reason: 'current evidence contradicts it',
  });

  assert.deepEqual(changed, ['A']);
  assert.equal(next.length, 2, 'a superseded record is kept — the record that the question was answered differently is itself evidence');
  assert.equal(next[0].status, FRESHNESS.SUPERSEDED);
  assert.equal(next[0].precedence, SOURCE_PRECEDENCE.HISTORICAL_ASSUMPTION);
  assert.equal(next[0].supersededBy, 'KF-006');
  assert.equal(next[1].status, FRESHNESS.CURRENT, 'unrelated records are untouched');
  assert.ok(hasSuperseded(next));
  assert.ok(!hasSuperseded(records), 'the input array is not mutated');
});

/**
 * `UNKNOWN` is the reason the enum has four members rather than two. A record
 * recorded without verification must not silently promote itself to fact.
 */
test('an unrecognised or missing status is UNKNOWN, never CURRENT', () => {
  assert.equal(resolveFreshness('CURRENT'), FRESHNESS.CURRENT);
  assert.equal(resolveFreshness('SUPERSEDED'), FRESHNESS.SUPERSEDED);
  assert.equal(resolveFreshness('DEFINITELY FIXED'), FRESHNESS.UNKNOWN);
  assert.equal(resolveFreshness(undefined), FRESHNESS.UNKNOWN);
  assert.equal(resolveFreshness(42), FRESHNESS.UNKNOWN);

  assert.ok(FRESHNESS_WEIGHT[FRESHNESS.UNKNOWN] > FRESHNESS_WEIGHT[FRESHNESS.HISTORICAL]);
  assert.ok(FRESHNESS_WEIGHT[FRESHNESS.SUPERSEDED] > FRESHNESS_WEIGHT[FRESHNESS.UNKNOWN],
    'UNKNOWN outranks SUPERSEDED: an unverified claim is more usable than a known-wrong one, and both trail CURRENT');
});

/**
 * The refusal test. This is the one that distinguishes memory from a generator.
 * An engine that always answers cannot be checked for accuracy later, because
 * its answer will be trusted.
 */
test('retrieval declines when no record supports an answer', () => {
  const records = loadMemory();
  assert.ok(records.length > 0, 'memory has records to test against');

  const nothing = retrieve({ records, evidence: {} });
  assert.deepEqual(nothing, [], 'no evidence must produce no results, not a low-confidence guess');

  const unrelated = retrieve({ records, evidence: { tokens: ['zzzzqqqq'] } });
  assert.deepEqual(unrelated, []);
});

test('a query result states its own evidence and never returns everything', () => {
  const records = loadMemory();
  const result = retrieve({ records, evidence: { files: ['backend/src/services/healthService.js'] } });

  assert.ok(result.length > 0, 'a named real file must find something');
  assert.ok(result.length <= MEMORY_POLICY.maxResults, 'results are bounded');

  for (const r of result) {
    assert.ok(r.tier && r.tierMeaning, 'every result names its tier and why');
    assert.ok(Array.isArray(r.matched) && r.matched.length > 0, 'every result carries the evidence that earned its rank');
    assert.ok(r.id && r.file && r.status, 'every result is individually stamped');
  }
});

test('results are ordered strongest tier first', () => {
  const records = loadMemory();
  const result = retrieve({
    records,
    evidence: { files: ['backend/src/middleware/auth.js'], tokens: ['cors', 'tailwind', 'expansion'] },
  });
  const order = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 };
  for (let i = 1; i < result.length; i += 1) {
    assert.ok(order[result[i - 1].tier] <= order[result[i].tier], `out of order at ${i}`);
  }
});

test('one verbose file cannot crowd out the other categories', () => {
  const records = loadMemory();
  const result = retrieve({ records, evidence: { tokens: ['cors', 'health', 'index', 'router', 'test'] } });
  const perFile = new Map();
  for (const r of result) perFile.set(r.file, (perFile.get(r.file) ?? 0) + 1);
  for (const [file, count] of perFile) {
    assert.ok(count <= MEMORY_POLICY.maxPerFile, `${file} returned ${count} results, above the per-file cap`);
  }
});

/**
 * Secret handling. The value is removed; the description survives, because a
 * record of a rotated credential is useful and a record containing the credential
 * is a liability.
 */
test('secret-shaped values are redacted while the description survives', () => {
  const cases = [
    'the key is sk-abc123def456ghi789jkl012 and rotation is recommended',
    'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.abcdefghijklmnop',
    'password=hunter2correcthorse',
    'mongodb+srv://user:sup3rs3cr3t@cluster0.example.mongodb.net/db',
  ];
  for (const text of cases) {
    const out = redactSecrets(text);
    assert.ok(!containsSecretShape(out), `still secret-shaped after redaction: ${out}`);
    assert.ok(out.includes('[REDACTED]'), `expected a redaction marker in: ${out}`);
    // Redaction must be idempotent, or a record would be re-redacted every time
    // it is retrieved and would grow a new marker on each pass.
    assert.equal(redactSecrets(out), out, `redaction is not idempotent for: ${out}`);
  }

  // The point of redaction is not to silently destroy the record.
  const described = redactSecrets('the MongoDB credential in CONFLICTS.md #1 was rotated');
  assert.ok(described.includes('CONFLICTS.md'), 'the surrounding description is preserved');
});

test('redaction does not fire on ordinary prose', () => {
  const safe = [
    'The health endpoint now returns 503 when Mongo is unreachable.',
    'tailwind.config.ts is dead code under Tailwind v4.',
    'password rotation is recommended but has not been performed.',
    'check:config reports 7 CONSISTENT and 4 CONFLICT.',
  ];
  for (const text of safe) {
    assert.equal(redactSecrets(text), text, `over-redacted: ${text}`);
  }
});

test('snippet is bounded and collapses whitespace', () => {
  const long = 'word '.repeat(200);
  const out = snippet(long, 50);
  assert.ok(out.length <= 50, `snippet too long: ${out.length}`);
  assert.ok(!/\n/.test(out));
  assert.ok(snippet('short', 50) === 'short');
});

/* ------------------------------------------------------------------ *
 * 2. THE RECORDS — the memory files must stay well-formed
 * ------------------------------------------------------------------ */

test('every memory record is dated, classified and individually identified', () => {
  const records = loadMemory();
  assert.ok(records.length >= 40, `expected a populated memory layer, found ${records.length}`);

  const undated = records.filter((r) => !r.dateKnown);
  assert.deepEqual(undated.map((r) => r.id), [], 'a record with no date cannot be reasoned about for freshness');

  const unclassified = records.filter((r) => r.status === FRESHNESS.UNKNOWN);
  assert.deepEqual(
    unclassified.map((r) => r.id),
    [],
    'records must state a freshness value; an absent status silently degrades the whole layer to UNKNOWN',
  );

  for (const r of records) {
    assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/, `${r.id} has a malformed date`);
    assert.ok(r.title.length > 0, `${r.id} has no title`);
    assert.ok(r.file.endsWith('.md'), `${r.id} has no source file`);
  }
});

test('memory file ids are unique across the layer', () => {
  const records = loadMemory();
  const seen = new Map();
  for (const r of records) {
    assert.ok(!seen.has(r.id), `duplicate id ${r.id} in ${seen.get(r.id)} and ${r.file}`);
    seen.set(r.id, r.file);
  }
});

test('every category file is present and parsed', () => {
  const files = new Set(loadMemory().map((r) => r.file));
  for (const [key, meta] of Object.entries(MEMORY_CATEGORIES)) {
    assert.ok(files.has(meta.file), `${key} is declared in MEMORY_CATEGORIES but ${meta.file} contributed no records`);
  }
});

test('parseRecords ignores documentation prose that is not a record', () => {
  const text = [
    '# Title',
    '',
    '## Index',
    '',
    'Some prose about the index.',
    '',
    '## KF-001 — A real record',
    '',
    '**Date:** 2026-10-10 · **Status:** CURRENT',
    '',
    'The body.',
  ].join('\n');

  const records = parseRecords(text, { file: 'KNOWN_FAILURES.md' });
  assert.equal(records.length, 1, 'a heading without a record id is documentation, not a record');
  assert.equal(records[0].id, 'KF-001');
  assert.equal(records[0].status, FRESHNESS.CURRENT);
  assert.equal(records[0].date, '2026-10-10');
  assert.equal(records[0].kind, 'failure');
});

/**
 * A record's snippet must open with the finding, not with its own metadata.
 * Getting this wrong spent the whole snippet budget on fields the caller already
 * has, and it was caught only by running the CLI.
 */
test('a record separates its metadata header from its prose', () => {
  const text = [
    '## LL-001 — A client object is not a connection',
    '',
    '**Date:** 2026-09-30 · **Status:** CURRENT · **Source:** Phase 3',
    '',
    'The handshake can still be pending.',
  ].join('\n');

  const [record] = parseRecords(text, { file: 'LESSONS_LEARNED.md' });
  assert.ok(!record.prose.startsWith('**Date:**'), 'prose must not begin with the metadata block');
  assert.ok(record.prose.startsWith('The handshake'), `prose began with: ${record.prose.slice(0, 40)}`);
  assert.ok(record.body.includes('**Date:**'), 'the raw body still carries the metadata');

  // Matching must not see the metadata: every record in the layer shares the same
  // date and status strings, so matching on them matches everything.
  const onMetadata = parseRecords(text.replace('The handshake can still be pending.', ''), { file: 'LESSONS_LEARNED.md' });
  assert.equal(
    retrievalPriority(onMetadata[0], { tokens: ['2026'] }),
    null,
    'a shared metadata string must not be retrievable evidence',
  );
});

/* ------------------------------------------------------------------ *
 * 3. RETRIEVAL — against the real records
 * ------------------------------------------------------------------ */

/**
 * The negative-knowledge case. `CONFLICTS.md` claims nothing has been fixed,
 * which was true in 2026 and is false now. A memory layer that could not say so
 * would actively mislead the next session.
 */
test('the layer records that the CONFLICTS.md header is superseded', () => {
  const records = loadMemory();
  const kf = records.find((r) => r.id === 'KF-006');
  assert.ok(kf, 'the supersession of the Phase 1 header is recorded');
  assert.ok(/stale/i.test(kf.title), `KF-006 should describe the staleness, found: ${kf.title}`);

  const over = records.find((r) => r.id === 'KFX-005');
  assert.ok(over, 'the frontend-has-no-tests finding is recorded as fixed');
  assert.ok(/test/i.test(over.title));
});

test('a named file retrieves the records that discuss it, with the file as evidence', () => {
  const records = loadMemory();
  const result = retrieve({ records, evidence: { files: ['backend/src/middleware/auth.js'] } });
  assert.ok(result.length > 0, 'the known S1 gap must be retrievable by the file it concerns');

  const ids = result.map((r) => r.id);
  assert.ok(ids.includes('DEC-009'), `expected the deferral decision, got ${ids.join(', ')}`);

  const top = result[0];
  assert.equal(top.tier, 'P0');
  assert.ok(top.matched.includes('backend/src/middleware/auth.js'));
});

test('evidence derivation finds the files and features a query names', () => {
  const named = buildEvidence('fix backend/src/services/mongoService.js connectivity');
  assert.ok(named.files.includes('backend/src/services/mongoService.js'), 'an explicit path is file evidence');

  // `buildEvidence` is pure: the index is passed in, because the CLI is the thing
  // that knows which indexes exist. A test that omits it is testing the empty
  // case, not derivation.
  const byFeature = buildEvidence('work on the mcp tool registry', { index: INDEXES });
  assert.ok(byFeature.features.length > 0, 'a named feature is feature evidence');
  assert.ok(byFeature.files.length > 0, 'a named feature contributes its files');

  const empty = buildEvidence('');
  assert.deepEqual(empty.files, []);
  assert.deepEqual(empty.tokens, []);
  assert.deepEqual(buildEvidence('anything', { index: {} }).features, [], 'a missing index degrades, it does not invent evidence');
});

/**
 * A common English word must not become route evidence. The index carries a bare
 * React route named `health`; matching it on substring made every record
 * containing the word "health" a P2 result.
 */
test('a common word is not route evidence, an explicit path is', () => {
  const health = buildEvidence('health check is wrong', { index: INDEXES });
  assert.ok(
    !health.routes.some((r) => r === 'health' || r === '/health'),
    `the bare word "health" must not match a route, got ${JSON.stringify(health.routes)}`,
  );
  assert.ok(!health.routes.includes('(none)'), 'the generator\'s "(none)" sentinel is not a route');

  const explicit = buildEvidence('the /forgot-password page is broken', { index: INDEXES });
  assert.ok(explicit.routes.includes('/forgot-password'), `an explicit route is evidence, got ${JSON.stringify(explicit.routes)}`);

  // A distinctive bare route name is evidence; a short common one is not.
  assert.ok(
    buildEvidence('the api-keys screen is wrong', { index: INDEXES }).routes.includes('api-keys'),
    'a distinctive bare route name is evidence',
  );
  assert.ok(
    !buildEvidence('the search box is wrong', { index: INDEXES }).routes.includes('search'),
    'a six-character common word is not route evidence',
  );
});

test('function words are not retrieval tokens', () => {
  const evidence = buildEvidence('when the results are what they were there should be');
  for (const t of ['when', 'there', 'should', 'what', 'they', 'were', 'they']) {
    assert.ok(!evidence.tokens.includes(t), `"${t}" is a function word, not evidence`);
  }
  // A short but distinctive term must survive the filter, or CORS-style queries
  // lose their best evidence.
  assert.ok(buildEvidence('CORS origin callback').tokens.includes('cors'), 'a 4-character distinctive term is kept');
});

/**
 * The strongest end-to-end assertion available without inventing ground truth:
 * a query whose subject word appears in a record's *title* must rank that record
 * at or near the top, ahead of records that merely share a common word in prose.
 */
test('a title match outranks a common-word body match', () => {
  const records = loadMemory();
  const result = retrieve({ records, evidence: { tokens: ['cors', 'origin', 'callback', 'allows'] } });
  assert.ok(result.length > 0);

  const ids = result.map((r) => r.id);
  const corsFix = ids.indexOf('KFX-003');
  assert.ok(corsFix !== -1, `the CORS fix must be reachable from the word CORS, got ${ids.join(', ')}`);
  assert.ok(corsFix <= 1, `the CORS fix ranked ${corsFix}, behind records matching a common word`);

  const top = result[corsFix];
  assert.equal(top.matched[0], 'cors', 'the evidence is the distinctive term, not the generic one');
});

test('retrieval is read-only: repeated calls give identical results', () => {
  const records = loadMemory();
  const evidence = { files: ['backend/src/server.js'], tokens: ['cors'] };
  const first = retrieve({ records, evidence });
  const second = retrieve({ records, evidence });
  assert.deepEqual(first, second, 'retrieval must not depend on call order or accumulated state');
});
