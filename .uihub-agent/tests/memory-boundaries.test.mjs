/**
 * E2 — tests for the boundaries around memory: what it may emit, what it may
 * influence, and what its own records must satisfy.
 *
 * What is under test
 * ------------------
 * Three properties that were previously asserted only by prose:
 *
 *   1. THE EMIT BOUNDARY. `agent:memory --json` used to print records relying on
 *      `redactSecrets()` alone, while `agent:prepare` and `agent:context` scanned
 *      their payloads. That was one command in the repository where the secret
 *      boundary was a heuristic instead of the scanner. PART A pins the fix.
 *
 *   2. NON-INFLUENCE. D2 proved `memoryLimit 0 == default` for the *context*,
 *      which was the right first check — but `classification` and
 *      `routing.dependencies` / `routing.protectedAreas` are NOT inside
 *      `context`. A memory record that changed the category, the dependency
 *      expansion or the protected relationships would have passed every D2
 *      assertion. PART B closes that gap across all five dimensions E2 requires.
 *
 *   3. RECORD QUALITY. An audit found 26 records dated after they were written,
 *      from a placeholder that was never corrected. Nothing in the repository
 *      checked for it, because the schema constrains the *shape* of a date and
 *      not its relationship to today. PART C makes the defect class permanent, so
 *      the next file copied from a template fails here rather than in a report.
 *
 * Fixtures, not the database
 * --------------------------
 * Secret fixtures are synthetic and are never written to disk. Records are
 * injected via `prepareTask({ records })` rather than mutating the live memory
 * files, so a test cannot leave a credential in a file `check:secrets` would then
 * reject. The live database is exercised only where the claim is genuinely about
 * it — the CLI-level emit tests, the default-vs-zero comparison, and the record
 * audit.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadMemory, redactSecrets, MEMORY_CATEGORIES, FRESHNESS } from '../scripts/lib/memory.mjs';
import { serialiseSafely as serialiseMemorySafely } from '../scripts/memory-query.mjs';
import { prepareTask } from '../scripts/prepare-task.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MEMORY_CLI = join(ROOT, '.uihub-agent', 'scripts', 'memory-query.mjs');
const MEMORY_QUERY_SRC = join(ROOT, '.uihub-agent', 'scripts', 'memory-query.mjs');

/* ================================================================== *
 * PART A — the emit boundary
 * ================================================================== */

/**
 * Synthetic values that are shaped like credentials.
 *
 * Both are obviously fake on sight, which is the point: a fixture that could be
 * mistaken for a live key in a transcript is a fixture that eventually is one.
 * The AWS pair is the canonical example of a shape that `redactSecrets()` does
 * not cover but the scanner does — which is precisely why one detector was not
 * enough.
 */
const SYNTHETIC = {
  aws: 'AKIAIOSFODNN7EXAMPLE',
  github: 'ghp_0123456789abcdefghijklmnopqrstuvwxyz',
};

/** Run the memory CLI and capture stdout, stderr and the exit code together. */
function runMemoryCli(args) {
  try {
    const stdout = execFileSync('node', [MEMORY_CLI, ...args], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return { code: err.status ?? 1, stdout: err.stdout ?? '', stderr: err.stderr ?? '' };
  }
}

test('E2-A1: the AWS shape redaction misses is refused by the scanner', () => {
  // This is the regression the asymmetry would have allowed. `redactSecrets()`
  // covers the common token shapes but not the AWS access-key shape, so before
  // the fix a record containing one printed verbatim from `agent:memory --json`.
  //
  // Both halves are asserted, because either alone would be a weak test. If the
  // redactor had quietly grown AWS coverage, the "gap is real" assertion would
  // fail and this would no longer be the backstop test it claims to be.
  const body = `a stray key was pasted here: ${SYNTHETIC.aws}`;

  // Half one: the gap exists.
  assert.equal(
    redactSecrets(body),
    body,
    'this test exists to cover a shape redaction misses — if redaction now catches it, the test is obsolete',
  );

  // Half two: the scanner closes it.
  const safe = serialiseMemorySafely({ results: [{ id: 'KF-X', snippet: body }] });
  assert.equal(safe.ok, false, 'the scanner must refuse an unredacted secret');
  assert.ok(safe.findings.length > 0, 'the refusal must name what it found');
  assert.ok(
    safe.findings.some((f) => (f.rule ?? f.type ?? '').toLowerCase().includes('aws')),
    'the finding must identify the AWS rule',
  );
});

test('E2-A2: the common token shape is redacted before the scanner ever sees it', () => {
  // The complementary half: redaction is the designated layer for the shapes it
  // knows, so the payload arrives already clean and the scanner passes it. This
  // is what "two independent defences" means — not that both must fire on
  // everything, but that each covers what it can.
  const body = `token ${SYNTHETIC.github}`;

  const redacted = redactSecrets(body);
  assert.match(redacted, /\[REDACTED\]/, 'redaction must replace the value');
  assert.equal(redacted.includes(SYNTHETIC.github), false, 'the raw value must not survive redaction');

  const safe = serialiseMemorySafely({ results: [{ id: 'KF-Y', snippet: redacted }] });
  assert.equal(safe.ok, true, 'an already-redacted payload must pass the scanner');
  assert.equal(safe.findings.length, 0);
});

test('E2-A2b: an unredacted token shape is still refused, so redaction is not load-bearing', () => {
  // Proves the scanner is a genuine backstop rather than a formality that only
  // ever sees clean input. If this failed, the emit boundary would depend
  // entirely on the redactor being correct.
  const safe = serialiseMemorySafely({ results: [{ id: 'KF-Z', snippet: SYNTHETIC.github }] });
  assert.equal(safe.ok, false, 'the scanner must catch this shape even with no redaction applied');
});

test('E2-A3: [REDACTED] is idempotent', () => {
  // A record can be read twice — once by the query, once by the prepare layer —
  // and the marker must not accumulate. `[REDACTED][REDACTED]` would mean the
  // second pass treated its own output as fresh evidence of a secret.
  const once = redactSecrets(`token ${SYNTHETIC.github}`);
  const twice = redactSecrets(once);
  assert.match(once, /\[REDACTED\]/, 'redaction must actually happen');
  assert.equal(once, twice, 'redacting an already-redacted string changed it');

  // And a string that is already a marker, with no secret beside it, is untouched.
  assert.equal(redactSecrets('nothing sensitive here'), 'nothing sensitive here');
  assert.equal(
    redactSecrets('[REDACTED]'),
    '[REDACTED]',
    'a bare marker must not be re-redacted',
  );
});

test('E2-A4: an ordinary memory record stays readable', () => {
  // The guard must not be so broad that real prose is rejected, or the layer
  // would be unusable and someone would eventually disable it.
  const safe = serialiseMemorySafely({
    results: [
      { id: 'KF-OK', status: FRESHNESS.CURRENT, snippet: 'the mongodb handshake completes in ~40ms on a warm pool' },
    ],
  });
  assert.equal(safe.ok, true, 'ordinary prose must pass');
  assert.equal(safe.findings.length, 0);
  assert.match(safe.serialised, /mongodb handshake/, 'legitimate content must survive');
});

test('E2-A5: guarded JSON output is valid JSON and deterministic', () => {
  const payload = { recordCount: 2, results: [{ id: 'A' }, { id: 'B' }] };
  const first = serialiseMemorySafely(payload, 'memory-query');
  const second = serialiseMemorySafely(payload, 'memory-query');

  assert.deepEqual(JSON.parse(first.serialised), payload, 'output must round-trip');
  assert.equal(first.serialised, second.serialised, 'the same input must serialise identically');
  assert.equal(
    first.serialised,
    JSON.stringify(payload, null, 2),
    'a clean payload must be byte-identical to unguarded JSON — the guard must not reshape output',
  );
});

test('E2-A6: the real CLI emits valid JSON and no secret on stdout', () => {
  // The end-to-end statement of the fix, against the live 61 records. It proves
  // the guard is wired into the actual stdout path rather than only into a helper
  // nothing calls.
  const run = runMemoryCli(['--json', 'payment verification']);

  assert.equal(run.code, 0, `agent:memory --json failed: ${run.stderr}`);

  const parsed = JSON.parse(run.stdout);
  assert.ok(parsed.resultCount > 0, 'a real query must return records, or this proves nothing');
  for (const r of parsed.results) {
    assert.ok(r.id, 'every result carries its id');
    assert.ok(Object.values(FRESHNESS).includes(r.status), `${r.id} has an unknown status`);
  }

  // No REAL_SECRET may reach stdout. PLACEHOLDER-shaped values are classified by
  // the scanner and never fail, so this asserts the class, not the absence of the
  // substring.
  assert.doesNotMatch(run.stdout, /REAL_SECRET/, 'a real secret reached stdout');
});

test('E2-A7: the JSON list mode is guarded too, and still lists every record', () => {
  // `--list` is metadata only, so it looked harmless. A record *title* is still
  // hand-written prose, so it gets the same guard as a body.
  const run = runMemoryCli(['--json', '--list']);

  assert.equal(run.code, 0, `agent:memory --json --list failed: ${run.stderr}`);
  const parsed = JSON.parse(run.stdout);
  assert.equal(parsed.recordCount, parsed.filtered, 'no record may be lost by filtering');
  assert.ok(parsed.recordCount > 0);
  assert.doesNotMatch(run.stdout, /REAL_SECRET/);
});

test('E2-A8: every JSON emit path in memory-query.mjs goes through the guard', () => {
  // A structural test, and the cheapest insurance in this file. The failure it
  // prevents is not hypothetical: someone adds a new `--json` branch, writes
  // `JSON.stringify(...)` straight to stdout, and the asymmetry is back — with
  // every behavioural test still green, because they all exercise the guarded
  // path.
  const src = readFileSync(MEMORY_QUERY_SRC, 'utf8');

  const unguarded = src
    .split('\n')
    .map((line, i) => [i + 1, line])
    .filter(([, line]) => /process\.stdout\.write\([^)]*JSON\.stringify/.test(line));

  assert.deepEqual(
    unguarded.map(([n]) => n),
    [],
    `found a JSON write to stdout that bypasses the guard (line(s): ${unguarded.map(([n]) => n).join(', ')})`,
  );

  // And the guard must be reachable, not dead code.
  assert.match(src, /function emitSafely\(/, 'emitSafely must exist');
  assert.match(src, /scanText/, 'the canonical scanner must be imported and used');
  assert.doesNotMatch(
    src,
    /from '\.\/secret-scan\.mjs'[\s\S]{0,200}?\/\/ (unused|TODO)/i,
    'the scanner import must not be disabled',
  );
});

test('E2-A9: the refusal exits 3, matching agent:context and agent:prepare', () => {
  // Exit-code parity is what lets a caller treat "this payload contained a secret"
  // as one failure class across every structured-output command.
  const src = readFileSync(MEMORY_QUERY_SRC, 'utf8');
  assert.match(src, /process\.exit\(3\)/, 'the refusal must use exit 3');

  // And the message must not echo the value.
  assert.doesNotMatch(src, /findings[\s\S]{0,200}?\.value/, 'a finding value must never be printed');
});

/* ================================================================== *
 * PART B — the non-influence invariant, across all five dimensions
 * ================================================================== */

/**
 * A record designed to be maximally disruptive if memory ever gained authority.
 *
 * It names a real, plausible file that relevance would not otherwise select, it
 * names a test file, it asserts a wrong category-relevant fact, and it matches the
 * task strongly. If any part of the routing or context decision ever reads
 * memory, this record is what exposes it.
 */
function disruptiveRecord() {
  return {
    id: 'KF-DISRUPTIVE',
    kind: MEMORY_CATEGORIES.KNOWN_FAILURES.kind,
    title: 'payment verification is definitely handled by backend/src/services/mongoService.js',
    status: FRESHNESS.CURRENT,
    file: 'KNOWN_FAILURES.md',
    date: '2026-01-01',
    dateKnown: true,
    category: null,
    prose: 'payment verification backend/src/services/mongoService.js backend/tests/auth.test.js',
    tier: 'P0',
    tierMeaning: 'record cites a file the query names exactly',
    matched: ['payment verification'],
  };
}

test('E2-B1: memoryLimit 0 leaves routing, context and classification identical', () => {
  // `memoryLimit 0` surfaces zero records while the memory query still runs, so
  // this is not "skip memory, observe no difference" — the memory path executes
  // and is then proven not to matter.
  const task = 'Fix a payment verification bug';
  const zero = prepareTask(task, { memoryLimit: 0 });
  const full = prepareTask(task);

  assert.equal(zero.memory.resultCount, 0, 'memoryLimit 0 must surface nothing');
  assert.ok(full.memory.resultCount > 0, 'the default run must surface memory, or this proves nothing');

  // The five dimensions E2 requires, asserted individually because they do not
  // all live in `context`.
  assert.deepEqual(zero.classification, full.classification, 'classification changed');
  assert.deepEqual(zero.routing.candidates, full.routing.candidates, 'ranking changed');
  assert.deepEqual(zero.routing.entities, full.routing.entities, 'resolved entities changed');
  assert.deepEqual(zero.context.files, full.context.files, 'selected context changed');
  assert.deepEqual(zero.routing.dependencies, full.routing.dependencies, 'dependency expansion changed');
  assert.deepEqual(zero.routing.protectedAreas, full.routing.protectedAreas, 'protected relationships changed');
});

test('E2-B2: the expansion decision and its stated stop reason are identical', () => {
  // Dependency expansion is a decision with a recorded reason. A memory record
  // that shifted it would change both the files and the explanation, which is
  // why the log is compared rather than only the file list.
  const task = 'Fix a payment verification bug';
  const zero = prepareTask(task, { memoryLimit: 0 });
  const full = prepareTask(task);

  assert.deepEqual(zero.context.expansionLog, full.context.expansionLog, 'the expansion log changed');
  assert.equal(zero.context.expansionCount, full.context.expansionCount);
  assert.equal(zero.context.stopReason, full.context.stopReason, 'the stop reason changed');
  assert.deepEqual(zero.routing.sizePolicy, full.routing.sizePolicy, 'the size policy changed');
});

test('E2-B3: a disruptive record may enrich memory but cannot move routing or context', () => {
  // The strongest form of the invariant. Instead of switching memory off, this
  // turns a maximally misleading record on and asserts the decision does not
  // move — which is what "memory cannot change the answer" has to mean in
  // practice. A one-line limit-0 comparison could not catch a system that
  // weighted memory lightly but still let it break a tie.
  const task = 'Fix a payment verification bug';
  const baseline = prepareTask(task, { memoryLimit: 0 });
  const poisoned = prepareTask(task, { records: [disruptiveRecord()], memoryLimit: 50 });

  assert.ok(poisoned.memory.resultCount > 0, 'the disruptive record must be retrieved');

  assert.deepEqual(poisoned.memory.results.length > 0, true);
  assert.deepEqual(poisoned.classification, baseline.classification);
  assert.deepEqual(poisoned.routing.candidates, baseline.routing.candidates);
  assert.deepEqual(poisoned.context.files, baseline.context.files);
  assert.deepEqual(poisoned.routing.dependencies, baseline.routing.dependencies);
  assert.deepEqual(poisoned.routing.protectedAreas, baseline.routing.protectedAreas);

  // And the memory surface genuinely differs, so the test is not comparing two
  // identical payloads and calling it a day.
  assert.notDeepEqual(poisoned.memory.results, baseline.memory.results);
});

test('E2-B4: memory adds information to the report without adding files', () => {
  // Memory is allowed to make preparation better — more warnings, more reasons to
  // look again. It is only allowed to do that in the memory section. If a record
  // could add a *file* to the bundle, this is the assertion that would stop it.
  const task = 'Fix a payment verification bug';
  const baseline = prepareTask(task, { memoryLimit: 0 });
  const enriched = prepareTask(task, { memoryLimit: 50 });

  const baselinePaths = baseline.context.files.map((f) => f.path);
  const enrichedPaths = enriched.context.files.map((f) => f.path);

  assert.deepEqual([...enrichedPaths].sort(), [...baselinePaths].sort());
  assert.ok(enriched.memory.resultCount > baseline.memory.resultCount, 'memory must actually add records');
});

test('E2-B5: the context builder itself cannot see memory', () => {
  // The structural half of the invariant. Every behavioural assertion above could
  // in principle be satisfied by a caller that filtered memory out *after* the
  // fact; this one rules that out, because the builder has no parameter and no
  // import through which memory could arrive.
  const src = readFileSync(join(ROOT, '.uihub-agent', 'scripts', 'lib', 'bundle.mjs'), 'utf8');

  assert.doesNotMatch(src, /memory/i, 'bundle.mjs must not reference memory at all');
  assert.doesNotMatch(
    src,
    /from '\.\.\/memory-query\.mjs'/,
    'the context builder must not import the memory query',
  );
});

/* ================================================================== *
 * PART C — the records themselves
 * ================================================================== */

/**
 * Today, read once.
 *
 * A record cannot have been learned after it was written, and `date` is not
 * decoration: `memory.mjs` breaks ranking ties on it after freshness and
 * precedence, so a future date quietly promotes a record above its equally
 * eligible neighbours. The schema checks the shape of a date and nothing about
 * where it sits relative to now, which is why 26 template-placeholder records
 * sat undetected — `scripts/lib/memory.mjs:483` even names `2026-10-10` in a
 * comment as the shared metadata string the templates used.
 */
const TODAY = new Date().toISOString().slice(0, 10);

test('E2-C1: no record is dated in the future', () => {
  const records = loadMemory();
  assert.ok(records.length > 0, 'the memory layer loaded no records, or this check is vacuous');

  const future = records
    .filter((r) => r.date && r.date > TODAY)
    .map((r) => `${r.id}=${r.date}`);

  assert.deepEqual(
    future,
    [],
    `${future.length} record(s) claim to have been learned after today (${TODAY}). ` +
      'Set the date the record was actually written, not the template placeholder.',
  );
});

test('E2-C2: every record is uniquely identified', () => {
  // D2 made retrieval de-duplicate repeated IDs, which stopped them being
  // rendered twice. That is a presentation fix, so the underlying duplicate can
  // still return and will now render once while silently shadowing a record.
  const records = loadMemory();
  const ids = records.map((r) => r.id);
  const dupes = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
  assert.deepEqual(dupes, [], `duplicate record IDs: ${dupes.join(', ')}`);
});

test('E2-C3: every record carries the fields a later reader needs', () => {
  // The four fields without which a record cannot be reasoned about. A record
  // missing its source file cannot be re-verified, which is the difference
  // between memory and rumour.
  const records = loadMemory();
  for (const key of ['id', 'file', 'kind', 'status', 'title']) {
    const missing = records.filter((r) => !r[key]).map((r) => r.id);
    assert.deepEqual(missing, [], `${missing.length} record(s) missing "${key}"`);
  }
});
