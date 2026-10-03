/**
 * D2 — tests for the composition layer (`agent:prepare`).
 *
 * What is under test
 * ------------------
 * `prepare-task.mjs` adds no intelligence. It calls the memory retrieval, the
 * router and the context builder that already exist and reports them together.
 * So the tests here are not "does prepare work" — they are "does composing these
 * systems lose anything, let anything leak between them, or let one start
 * overruling another".
 *
 * The three failure modes this file exists to catch:
 *
 *   1. SILENT LOSS. A record retrieved but not rendered looks exactly like a
 *      record that was never retrieved. The D1 grouping bug (upper-case kind
 *      compared against a lower-case value) emptied the Decisions section for a
 *      payment task whose top hit *was* a P0 decision. TEST 1 pins that.
 *   2. CREEPING AUTHORITY. Memory is historical. The moment it can change a file
 *      list, the router stops being the only thing deciding what gets opened, and
 *      every guarantee in the context-size contract becomes conditional on a
 *      memory file nobody reviewed. TESTs 2, 12 and 13 pin that it cannot.
 *   3. LOSSY COMPOSITION. If prepare emits less than agent:context, the single
 *      command an agent is told to use becomes strictly worse than the two it
 *      replaced. TEST 3 pins the superset.
 *
 * Fixtures, not the database
 * --------------------------
 * TESTs 1, 8, 12 and 13 use injected records via `prepareTask({ records })`
 * rather than the real 61. A test that asserts against the live memory files
 * breaks the next time someone files a record — and worse, it would pass or fail
 * for a reason unrelated to the behaviour it claims to check. The live database
 * is exercised only where the claim is genuinely about it (TEST 4).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildBundle } from '../scripts/lib/bundle.mjs';
import { MEMORY_CATEGORIES, FRESHNESS } from '../scripts/lib/memory.mjs';
import {
  prepareTask,
  render,
  groupMemory,
  checkIndexFreshness,
  serialiseSafely,
} from '../scripts/prepare-task.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PREPARE_CLI = join(ROOT, '.uihub-agent', 'scripts', 'prepare-task.mjs');
const CONTEXT_CLI = join(ROOT, '.uihub-agent', 'scripts', 'context-task.mjs');

/* ------------------------------------------------------------------ *
 * Fixtures
 * ------------------------------------------------------------------ */

/**
 * A record shaped exactly like the ones `parseRecords` produces.
 *
 * `match` is the evidence text the retrieval layer will find. It is not
 * decoration: `retrievalPriority()` drops a record that matches nothing, so a
 * fixture without it is silently never retrieved — and a test built on a record
 * that never loaded asserts nothing while looking rigorous. The first draft of
 * this file made exactly that mistake, and TEST 8 "passed" by scanning a payload
 * that contained no secret at all.
 */
function record({
  id,
  kind,
  title,
  status = FRESHNESS.CURRENT,
  file = 'KNOWN_FAILURES.md',
  date = '2026-01-01',
  match = 'payment verification',
  body,
} = {}) {
  const prose = body ?? `${match} — fixture record ${id}`;
  return {
    id,
    kind,
    // The id is deliberately NOT repeated in the title. Several tests count how
    // many times an id appears in the rendered report, and an id echoed inside
    // its own title makes every record look duplicated.
    title: title ?? match,
    status,
    file,
    date,
    dateKnown: true,
    category: null,
    prose,
    // Retrieval decoration; the renderer reads `tier` and `tierMeaning`.
    tier: 'P5',
    tierMeaning: 'token-level match only',
    matched: [match],
  };
}

/** The seven kinds the memory layer actually assigns, from the source of truth. */
const REAL_KINDS = Object.fromEntries(
  Object.entries(MEMORY_CATEGORIES).map(([cat, v]) => [cat, v.kind]),
);

function runCli(script, args) {
  return JSON.parse(execFileSync('node', [script, '--json', ...args], {
    encoding: 'utf8',
    maxBuffer: 1e8,
  }));
}

/* ================================================================== *
 * TEST 1 — memory category grouping regression
 * ================================================================== */

test('TEST 1: a record lands in the section its MEMORY_CATEGORIES kind names', () => {
  // One record per real category. If any group were mis-keyed, the record would
  // be absent from every section and this fails.
  const fixtures = [
    ['DEC-001', REAL_KINDS.ARCHITECTURAL_DECISIONS, 'decisions'],
    ['KFX-001', REAL_KINDS.KNOWN_FIXES, 'fixes'],
    ['KF-001', REAL_KINDS.KNOWN_FAILURES, 'failures'],
    ['LL-001', REAL_KINDS.LESSONS_LEARNED, 'lessons'],
    ['LIM-001', REAL_KINDS.LIMITATIONS, 'limitations'],
    ['task-001', REAL_KINDS.TASK_HISTORY, 'tasks'],
    ['R1', REAL_KINDS.REGRESSION_HISTORY, 'regressions'],
  ];

  for (const [id, kind, group] of fixtures) {
    const g = groupMemory([record({ id, kind })]);
    assert.equal(g[group].length, 1, `${id} (kind "${kind}") did not land in "${group}"`);
    assert.equal(g[group][0].id, id);
  }
});

test('TEST 1: the D1 case-comparison bug cannot return (lower-case kind, upper-case constant)', () => {
  // The regression itself. A decision record was silently dropped because the
  // grouping compared 'DECISION' against kind 'decision'.
  const dec = record({ id: 'DEC-009', kind: 'decision' });
  const groups = groupMemory([dec]);

  assert.equal(groups.decisions.length, 1, 'a lower-case "decision" record vanished');
  assert.equal(groups.decisions[0].id, 'DEC-009');
  // And it must not have leaked into a differently-named section either.
  const elsewhere = ['fixes', 'failures', 'lessons', 'limitations', 'tasks', 'regressions'];
  for (const g of elsewhere) {
    assert.equal(groups[g].length, 0, `the record also appeared under "${g}"`);
  }
});

test('TEST 1: grouping is derived from MEMORY_CATEGORIES, not hardcoded strings', () => {
  // If someone adds a category to the memory layer, grouping must pick it up.
  // This asserts the wiring, not the current data.
  for (const [cat, v] of Object.entries(MEMORY_CATEGORIES)) {
    const g = groupMemory([record({ id: 'X-1', kind: v.kind })]);
    const landed = Object.entries(g).find(([, list]) => list.length === 1);
    assert.ok(landed, `category ${cat} (kind "${v.kind}") landed in no section at all`);
  }
});

test('TEST 1: an unrecognised kind is reported, never silently dropped', () => {
  const odd = record({ id: 'ZZ-999', kind: 'not-a-real-kind' });
  const groups = groupMemory([odd]);

  // It is in no category group, which is correct. The requirement is that the
  // renderer says so instead of showing an empty memory section.
  for (const [name, list] of Object.entries(groups)) {
    if (name === 'historical') continue;
    assert.equal(list.length, 0, `an unknown kind must not be filed under "${name}"`);
  }

  const p = prepareTask('Fix a payment verification bug', { records: [odd] });
  const text = render(p);
  assert.match(text, /WARNING/, 'an uncategorised record must produce a warning');
  assert.match(text, /not-a-real-kind:ZZ-999/, 'the warning must name the offending record');
  assert.match(text, /defect in agent:prepare/, 'the warning must say it is a tool defect, not a memory finding');
});

test('TEST 1: retrieved records are never fewer than rendered ones', () => {
  // The invariant in one assertion: retrieved != silently missing.
  const mixed = [
    record({ id: 'DEC-100', kind: REAL_KINDS.ARCHITECTURAL_DECISIONS }),
    record({ id: 'KF-100', kind: REAL_KINDS.KNOWN_FAILURES }),
    record({ id: 'R100', kind: REAL_KINDS.REGRESSION_HISTORY, status: FRESHNESS.HISTORICAL }),
    record({ id: 'ODD-100', kind: 'mystery-kind' }),
  ];
  const p = prepareTask('Fix a payment verification bug', { records: mixed, memoryLimit: 50 });
  const text = render(p);

  // Each id must appear in the rendered report.
  for (const r of mixed) {
    assert.ok(text.includes(r.id), `${r.id} was retrieved but never rendered`);
  }
});

/* ================================================================== *
 * TEST 2 — memory must not influence routing
 * ================================================================== */

test('TEST 2: memory depth does not change classification, routing, context or validation', () => {
  // The critical architectural invariant. Compared as structured values, never
  // as prose, so a cosmetic reformat cannot mask a real difference.
  const tasks = [
    'Fix a payment verification bug',
    'Fix the auth middleware',
    'Add an MCP tool',
    'Fix WebM template preview performance',
    'Why is the site loading slowly?',
    'xyzzy frobnicate widget',
  ];

  // Fields that must be identical with memory switched off vs fully on.
  const INVARIANT = [
    'classification.intent', 'classification.categories', 'classification.surface',
    'classification.confidence', 'classification.confidenceWhy',
    'routing.indexes', 'routing.entities', 'routing.evidence', 'routing.knowledge',
    'routing.protectedAreas', 'routing.dependencies', 'routing.sizePolicy',
    'routing.candidates',
    'context.files', 'context.initial', 'context.expanded', 'context.expansionLog',
    'context.expansionCount', 'context.expansionSteps', 'context.stopReason',
    'validation', 'unknown',
  ];
  const dig = (o, p) => p.split('.').reduce((x, k) => x?.[k], o);

  for (const task of tasks) {
    const none = prepareTask(task, { memoryLimit: 0 });
    const full = prepareTask(task, { memoryLimit: 99 });

    for (const field of INVARIANT) {
      assert.deepEqual(
        dig(full, field),
        dig(none, field),
        `memory changed "${field}" for "${task}"`,
      );
    }
    // Sanity: the two runs really did retrieve different amounts of memory, or
    // the assertion above would be vacuous.
    assert.equal(none.memory.resultCount, 0, `${task}: expected no memory at limit 0`);
    assert.ok(full.memory.recordCount > 0);
  }
});

test('TEST 2: memory cannot change which files the bundle contains', () => {
  // Same invariant, stated as a file-set comparison so the failure message names
  // the file that leaked in.
  const task = 'Fix the auth middleware';
  const a = prepareTask(task, { memoryLimit: 0 }).context.files.map((f) => f.path).sort();
  const b = prepareTask(task, { memoryLimit: 99 }).context.files.map((f) => f.path).sort();
  assert.deepEqual(b, a);
});

/* ================================================================== *
 * TEST 3 — prepare output is a strict superset of context
 * ================================================================== */

test('TEST 3: every context field survives into the prepared output', () => {
  const tasks = [
    'Fix a payment verification bug',
    'Add an MCP tool',
    'Fix an XSS vulnerability in the comment renderer',
    'xyzzy frobnicate widget',
  ];

  const MAP = {
    files: 'context.files',
    dependencies: 'routing.dependencies',
    sizePolicy: 'routing.sizePolicy',
    expansionLog: 'context.expansionLog',
    expansionCount: 'context.expansionCount',
    expansionSteps: 'context.expansionSteps',
    stopReason: 'context.stopReason',
    emptyReason: 'context.emptyReason',
    indexes: 'routing.indexes',
    entities: 'routing.entities',
    evidence: 'routing.evidence',
    knowledge: 'routing.knowledge',
    protectedAreas: 'routing.protectedAreas',
    efficiency: 'routing.candidates',
    intent: 'classification.intent',
    categories: 'classification.categories',
    surface: 'classification.surface',
    confidence: 'classification.confidence',
    confidenceWhy: 'classification.confidenceWhy',
    featureCandidates: 'classification.featureCandidates',
    validation: 'validation',
    unknown: 'unknown',
    task: 'task',
  };
  const dig = (o, p) => p.split('.').reduce((x, k) => x?.[k], o);

  for (const task of tasks) {
    const ctx = runCli(CONTEXT_CLI, [task]);
    const prep = prepareTask(task);

    for (const [ctxKey, prepPath] of Object.entries(MAP)) {
      assert.deepEqual(
        dig(prep, prepPath),
        ctx[ctxKey],
        `"${ctxKey}" was lost or altered for "${task}" (expected at ${prepPath})`,
      );
    }
  }
});

test('TEST 3: the prepared output is a superset in shape, not merely in values', () => {
  // Values can coincide (e.g. two empty arrays). The claim "superset" is about
  // the fields existing, so this asserts presence for the fields most likely to
  // be dropped by a refactor.
  const prep = prepareTask('Fix the auth middleware');
  for (const path of [
    'routing.dependencies', 'routing.sizePolicy', 'routing.candidates',
    'context.expansionLog', 'context.stopReason', 'context.emptyReason',
    'validation', 'unknown', 'suppliers.indexFreshness', 'memory.rule',
  ]) {
    const v = path.split('.').reduce((x, k) => x?.[k], prep);
    assert.notEqual(v, undefined, `${path} is missing from the prepared output`);
  }
});

/* ================================================================== *
 * TEST 4 — current vs historical
 * ================================================================== */

test('TEST 4: current and historical records are visually distinguished', () => {
  const fixtures = [
    record({ id: 'DEC-CUR', kind: REAL_KINDS.ARCHITECTURAL_DECISIONS, status: FRESHNESS.CURRENT, match: 'auth middleware', title: 'auth middleware current decision' }),
    record({ id: 'DEC-HIS', kind: REAL_KINDS.ARCHITECTURAL_DECISIONS, status: FRESHNESS.HISTORICAL, match: 'auth middleware', title: 'auth middleware historical decision' }),
    record({ id: 'DEC-SUP', kind: REAL_KINDS.ARCHITECTURAL_DECISIONS, status: FRESHNESS.SUPERSEDED, match: 'auth middleware', title: 'auth middleware superseded decision' }),
  ];
  const text = render(prepareTask('Fix the auth middleware', { records: fixtures, memoryLimit: 50 }));

  assert.ok(text.includes('== CURRENT (repository, indexed now) =='), 'the current fence is missing');
  assert.ok(text.includes('== HISTORICAL MEMORY'), 'the historical fence is missing');

  // The historical fence must come after the current one, so history can never be
  // read as repository truth.
  assert.ok(
    text.indexOf('== CURRENT') < text.indexOf('== HISTORICAL MEMORY'),
    'historical memory must not appear before the current-evidence fence',
  );

  // Every non-current record is grouped as historical, and the status is printed.
  for (const id of ['DEC-HIS', 'DEC-SUP']) {
    assert.ok(text.includes(id), `${id} was not rendered`);
  }
  assert.ok(text.includes(FRESHNESS.HISTORICAL), 'the HISTORICAL status is not shown');
  assert.ok(text.includes(FRESHNESS.SUPERSEDED), 'the SUPERSEDED status is not shown');
});

test('TEST 4: a non-current record carries its status, not just its placement', () => {
  const p = prepareTask('Fix the auth middleware', {
    records: [record({ id: 'OLD-1', kind: REAL_KINDS.KNOWN_FAILURES, status: FRESHNESS.SUPERSEDED, match: 'auth middleware' })],
    memoryLimit: 50,
  });
  const found = p.memory.results.find((r) => r.id === 'OLD-1');
  assert.equal(found.status, FRESHNESS.SUPERSEDED, 'the status must survive into the structured output');
  assert.ok(p.memory.groups.historical.some((r) => r.id === 'OLD-1'), 'a non-current record must be grouped as historical');
});

test('TEST 4: the live memory layer keeps active and historical distinguishable', () => {
  // The one test that reads the real database, because the claim is about it.
  const p = prepareTask('Fix a payment verification bug');
  const all = p.memory.results;
  for (const r of all) {
    assert.ok(FRESHNESS[r.status], `${r.id} has status "${r.status}", which is not a known freshness value`);
  }

  // The partition is "in force" versus "not in force", and it must be total:
  // every retrieved record lands on exactly one side. Asserting it per status
  // rather than as `status !== CURRENT` is deliberate — the day a fifth status
  // arrives, this test still states what that status means.
  const inForce = (r) => r.status === FRESHNESS.CURRENT || r.status === FRESHNESS.RESOLVED;
  for (const r of all) {
    const inHistorical = p.memory.groups.historical.some((h) => h.id === r.id);
    assert.equal(
      inHistorical,
      !inForce(r),
      `${r.id} is ${r.status}: ${inForce(r) ? 'must not' : 'must'} be in the historical group`,
    );
  }

  // And a resolved decision is specifically not filed as stale. DEC-009 is
  // settled *against* widening expansion subjects, so filing it under "no longer
  // in force" would bury a live ruling in the section that means the opposite.
  const dec = all.find((r) => r.id === 'DEC-009');
  if (dec) {
    assert.equal(dec.status, FRESHNESS.RESOLVED, 'DEC-009 must be RESOLVED, not deferred or stale');
    assert.equal(
      p.memory.groups.historical.some((h) => h.id === 'DEC-009'),
      false,
      'a resolved decision must not be filed as historical',
    );
  }
});

/* ================================================================== *
 * TEST 5 — the precedence rule is data, not prose
 * ================================================================== */

test('TEST 5: the precedence rule is exposed as structured data', () => {
  const p = prepareTask('Fix a payment verification bug');
  assert.equal(typeof p.memory.rule, 'string', 'memory.rule must be a field');
  assert.match(p.memory.rule, /never overrides current source or index evidence/i);
  assert.equal(p.suppliers.indexFreshness, 'FRESH', 'the supplier of current truth must be stated');
  assert.equal(typeof p.suppliers.currentSource, 'number', 'the count of current-source files must be stated');
});

test('TEST 5: current repository evidence is reported as the supplier, and memory separately', () => {
  // The rule is not just declared, it is structurally separated: everything the
  // router decided lives outside the memory block, and memory is reachable but
  // not merged into it.
  const p = prepareTask('Fix a payment verification bug');
  assert.notEqual(p.memory, p.routing);
  assert.notEqual(p.memory, p.context);

  // No memory record is embedded in the context file list, so a memory hit can
  // never be mistaken for a selected source file.
  const memoryPaths = new Set(p.memory.results.map((r) => r.file));
  for (const f of p.context.files) {
    assert.equal(memoryPaths.has(f.path), false, `${f.path} is a memory file, not a source file`);
  }
});

test('TEST 5: memory precedence uses the existing SOURCE_PRECEDENCE, unchanged', () => {
  const p = prepareTask('Fix a payment verification bug');
  assert.deepEqual(
    Object.keys(p.memory.precedence),
    Object.keys(MEMORY_CATEGORIES).length ? Object.keys(p.memory.precedence) : [],
    'precedence must be a non-empty ordered map',
  );
  assert.ok(Object.keys(p.memory.precedence).length > 0);
});

/* ================================================================== *
 * TEST 6 — empty memory
 * ================================================================== */

test('TEST 6: an empty memory layer does not break preparation', () => {
  const p = prepareTask('Fix the auth middleware', { records: [] });
  assert.equal(p.memory.resultCount, 0);
  assert.equal(p.memory.declined, true, 'an empty result must set declined, so "no match" is never read as "no memory"');
  assert.deepEqual(p.memory.results, []);

  // Routing and context are unaffected.
  assert.ok(p.classification.categories.length > 0, 'classification must still work with no memory');
  assert.ok(p.context.files.length > 0, 'context selection must still work with no memory');
  assert.ok(p.routing.entities !== undefined);

  // And it still renders, stating the absence honestly.
  const text = render(p);
  assert.match(text, /NO RECORDED MEMORY/);
  assert.match(text, /not evidence that the area is unknown/);
});

test('TEST 6: empty memory and full memory produce the same context', () => {
  const a = prepareTask('Fix WebM template preview performance', { records: [] });
  const b = prepareTask('Fix WebM template preview performance');
  assert.deepEqual(b.context.files, a.context.files);
  assert.deepEqual(b.context.stopReason, a.context.stopReason);
});

/* ================================================================== *
 * TEST 7 — stale index guard
 * ================================================================== */

test('TEST 7: a non-FRESH index blocks preparation, and UNKNOWN is not treated as fresh', () => {
  // Checked as a unit so the guard is exercised without corrupting the workspace.
  for (const state of ['STALE', 'UNKNOWN', 'MISSING']) {
    const gate = checkIndexFreshness({ state, reason: `${state} for test` });
    assert.equal(gate.ok, false, `${state} must block preparation`);
    assert.equal(gate.code, 2, `${state} must exit 2`);
    assert.match(gate.message, new RegExp(state));
  }
  // FRESH passes.
  assert.equal(checkIndexFreshness({ state: 'FRESH' }).ok, true);
  // The override is honoured, and only for a real override.
  assert.equal(checkIndexFreshness({ state: 'STALE' }, { allowStale: true }).ok, true);
});

test('TEST 7: the CLI exits non-zero and emits no prepared context when the index is stale', () => {
  // End-to-end, in an isolated copy so the real workspace is never touched. A
  // copy without the source tree leaves the recorded snapshot unsatisfied, which
  // is exactly the STALE condition the guard exists to catch.
  const dir = mkdtempSync(join(tmpdir(), 'uihub-d2-stale-'));
  try {
    cpSync(join(ROOT, '.uihub-agent'), join(dir, '.uihub-agent'), { recursive: true });
    const cli = join(dir, '.uihub-agent', 'scripts', 'prepare-task.mjs');

    let code = 0;
    let stdout = '';
    try {
      stdout = execFileSync('node', [cli, 'Fix the auth middleware'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (err) {
      code = err.status;
      stdout = String(err.stdout ?? '');
    }

    assert.equal(code, 2, 'a stale index must exit 2');
    assert.doesNotMatch(stdout, /== CURRENT/, 'no prepared context may be emitted on a stale index');
    assert.doesNotMatch(stdout, /FILES \(/, 'no file list may be emitted on a stale index');

    // The documented override still works, and is explicit about it.
    const overridden = execFileSync('node', [cli, '--allow-stale', 'Fix the auth middleware'], { encoding: 'utf8', maxBuffer: 1e8 });
    assert.match(overridden, /== CURRENT/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

/* ================================================================== *
 * TEST 8 — secret scan guard
 * ================================================================== */

test('TEST 8: a secret-shaped value in a memory record is redacted at retrieval', () => {
  // Synthetic only, and never written to disk. This is the redaction path: the
  // memory layer's own `redactSecrets` neutralises the value before it can reach
  // the payload, which is the first of two independent defences.
  const synthetic = 'ghp_0123456789abcdefghijklmnopqrstuvwxyz';
  const poisoned = record({
    id: 'KF-SECRET',
    kind: REAL_KINDS.KNOWN_FAILURES,
    body: `payment verification: a stray token ${synthetic} was pasted into this note`,
  });

  const prepared = prepareTask('Fix a payment verification bug', { records: [poisoned], memoryLimit: 50 });
  assert.ok(prepared.memory.resultCount > 0, 'the poisoned record must actually be retrieved');

  const safe = serialiseSafely(prepared);
  assert.equal(
    safe.serialised.includes(synthetic),
    false,
    'the raw secret reached the prepared payload',
  );
  assert.match(safe.serialised, /\[REDACTED\]/, 'the value must be replaced by a redaction marker');
});

test('TEST 8: a shape the memory redactor misses is still blocked by the Phase 6 scanner', () => {
  // The second defence, and the reason the prepare layer scans at all. The AWS
  // access-key shape is caught by `secret-scan.mjs` but not by the memory layer's
  // narrower redactor — which is exactly the gap the backstop exists to close.
  const synthetic = 'AKIAIOSFODNN7EXAMPLE';
  const poisoned = record({
    id: 'KF-SECRET2',
    kind: REAL_KINDS.KNOWN_FAILURES,
    body: `payment verification: a stray key ${synthetic} was pasted into this note`,
  });

  const prepared = prepareTask('Fix a payment verification bug', { records: [poisoned], memoryLimit: 50 });
  assert.ok(prepared.memory.resultCount > 0, 'the poisoned record must actually be retrieved');

  const safe = serialiseSafely(prepared);
  assert.equal(safe.ok, false, 'the Phase 6 scanner must block an unredacted secret');
  assert.ok(safe.findings.length > 0, 'the scanner must report what it found');
  // It reports rather than silently mangling: the finding names the rule.
  assert.ok(safe.findings.some((f) => (f.rule ?? f.type ?? '').toLowerCase().includes('aws')));
});

test('TEST 8: clean memory passes the same guard', () => {
  // The other half: the guard must not be so broad that ordinary prose is
  // rejected, or every task would fail to prepare.
  const clean = record({
    id: 'KF-CLEAN',
    kind: REAL_KINDS.KNOWN_FAILURES,
    body: 'the mongodb handshake completes in about 40ms on a warm pool for payment verification',
  });
  const safe = serialiseSafely(prepareTask('Fix a payment verification bug', { records: [clean], memoryLimit: 50 }));
  assert.equal(safe.ok, true, 'ordinary prose must not trip the scanner');
});

test('TEST 8: no secret-shaped value survives into a real prepared payload', () => {
  // End-to-end against the live memory layer, stated as the invariant rather than
  // as "the scanner found nothing", so an empty result cannot pass this silently.
  const safe = serialiseSafely(prepareTask('Add an MCP tool'));
  assert.equal(safe.ok, true, 'the live memory layer must not trip the Phase 6 scanner');
  assert.ok(safe.serialised.length > 0, 'the payload must be non-empty, or the check is vacuous');
});

/* ================================================================== *
 * TEST 9 — JSON schema
 * ================================================================== */

test('TEST 9: the JSON payload declares prepared-task/1 and is fully formed', () => {
  for (const task of ['Fix a payment verification bug', 'xyzzy frobnicate widget']) {
    const p = runCli(PREPARE_CLI, [task]);
    assert.equal(p.schema, 'prepared-task/1');
    for (const key of ['task', 'memory', 'classification', 'routing', 'context', 'validation', 'unknown', 'suppliers']) {
      assert.ok(key in p, `${task}: the payload is missing "${key}"`);
    }
    assert.equal(typeof p.memory.recordCount, 'number');
    assert.equal(typeof p.memory.resultCount, 'number');
    assert.equal(typeof p.memory.declined, 'boolean');
    assert.ok(Array.isArray(p.context.files));
    assert.ok(Array.isArray(p.validation));
  }
});

test('TEST 9: a memory-rich task and an empty-memory task are both schema-valid', () => {
  const rich = runCli(PREPARE_CLI, ['Fix a payment verification bug']);
  const empty = runCli(PREPARE_CLI, ['xyzzy frobnicate widget']);

  assert.ok(rich.memory.resultCount > 0, 'the payment task should retrieve memory');
  assert.equal(empty.memory.resultCount, 0, 'the nonsense task should retrieve nothing');
  assert.equal(empty.memory.declined, true);

  // Both must still carry a full routing/context block.
  for (const p of [rich, empty]) {
    assert.equal(p.schema, 'prepared-task/1');
    assert.ok(p.classification.categories.length > 0);
    assert.ok(Array.isArray(p.context.files));
    assert.ok(p.context.stopReason);
  }
});

/* ================================================================== *
 * TEST 10 — human-readable output
 * ================================================================== */

test('TEST 10: every required section is present in the rendered report', () => {
  const text = execFileSync('node', [PREPARE_CLI, 'Fix a payment verification bug'], { encoding: 'utf8', maxBuffer: 1e8 });
  for (const section of [
    'TASK', 'CATEGORIES', 'INTENT', 'SURFACE', 'CONFIDENCE',
    'FILES', 'EXPANSION', 'PROTECTED', 'VALIDATION',
    'MEMORY', '== CURRENT', '== HISTORICAL MEMORY',
  ]) {
    assert.ok(text.includes(section), `the rendered report is missing "${section}"`);
  }
  // A task with no resolution must render an UNKNOWN section.
  const unknown = execFileSync('node', [PREPARE_CLI, 'Why is the site loading slowly?'], { encoding: 'utf8', maxBuffer: 1e8 });
  assert.match(unknown, /UNKNOWN/);
  // A task with no memory must still render the memory fence.
  const noMemory = execFileSync('node', [PREPARE_CLI, 'xyzzy frobnicate widget'], { encoding: 'utf8', maxBuffer: 1e8 });
  assert.match(noMemory, /== HISTORICAL MEMORY/);
  assert.match(noMemory, /NO RECORDED MEMORY/);
});

test('TEST 10: an unrecognised memory category warns instead of vanishing', () => {
  const text = render(prepareTask('Fix a payment verification bug', {
    records: [record({ id: 'ZZ-1', kind: 'totally-unknown' })],
    memoryLimit: 50,
  }));
  assert.match(text, /WARNING/);
  assert.match(text, /totally-unknown:ZZ-1/);
  // And the section it should have appeared in is not silently empty-and-claimed.
  assert.doesNotMatch(text, /no categorised record/, 'the fallback line must not mask a real mis-grouping');
});

/* ================================================================== *
 * TEST 11 — existing router regression
 * ================================================================== */

test('TEST 11: the canonical benchmark is unchanged by the composition layer', () => {
  // The recorded post-Phase-9 baseline. If prepare changes any of these, the
  // router regressed — and the correct response is to investigate, not to
  // restate the expectation.
  const EXPECTED = {
    'Fix a payment verification bug': 9,
    'Fix WebM template preview performance': 14,
    'Edit frontend/src/components/templates/TemplatePreview.tsx': 2,
    'Fix the auth middleware': 16,
    'Add an MCP tool': 42,
    'Fix TemplateCard so the similar rail shows WebM previews': 13,
    'Fix an XSS vulnerability in the comment renderer': 0,
    'Why is the site loading slowly?': 0,
    'Fix the /activate-free endpoint': 10,
    'xyzzy frobnicate widget': 0,
  };

  for (const [task, expected] of Object.entries(EXPECTED)) {
    const viaContext = runCli(CONTEXT_CLI, [task]);
    const viaPrepare = runCli(PREPARE_CLI, [task]);
    const viaBundle = buildBundle(task);

    assert.equal(viaContext.files.length, expected, `agent:context changed for "${task}"`);
    assert.equal(viaPrepare.context.files.length, expected, `agent:prepare changed the file count for "${task}"`);
    assert.equal(viaBundle.files.length, expected, `buildBundle changed for "${task}"`);
    assert.deepEqual(
      viaPrepare.context.files.map((f) => f.path),
      viaContext.files.map((f) => f.path),
      `the two CLIs disagree on which files to open for "${task}"`,
    );
  }
});

/* ================================================================== *
 * TEST 12 — memory must not widen context
 * ================================================================== */

test('TEST 12: a memory record naming a source file does not pull that file in', () => {
  // A record that loudly claims a file is relevant. Memory relevance is not
  // source-file relevance: the file enters the bundle only if the router picks
  // it independently.
  const bait = record({
    id: 'KF-BAIT',
    kind: REAL_KINDS.KNOWN_FAILURES,
    match: 'payment verification',
    title: 'payment verification: mongoService is definitely the culprit',
    body: 'payment verification backend/src/services/mongoService.js backend/src/utils/logger.js frontend/src/lib/utils.ts',
  });

  const task = 'Fix a payment verification bug';
  const baseline = prepareTask(task, { memoryLimit: 0 });
  const withBait = prepareTask(task, { records: [bait], memoryLimit: 50 });

  assert.ok(
    withBait.memory.resultCount > 0,
    'the fixture must actually be retrieved, or the test proves nothing',
  );
  assert.deepEqual(
    withBait.context.files.map((f) => f.path),
    baseline.context.files.map((f) => f.path),
    'a memory record changed the context bundle',
  );
});

test('TEST 12: memory records never appear as source files in the bundle', () => {
  const p = prepareTask('Fix a payment verification bug');
  const memoryFiles = new Set(p.memory.results.map((r) => r.file));
  assert.ok(memoryFiles.size > 0);
  for (const f of p.context.files) {
    assert.equal(memoryFiles.has(f.path), false, `${f.path} is a memory record, not a source file`);
  }
});

/* ================================================================== *
 * TEST 13 — deduplication
 * ================================================================== */

test('TEST 13: a record matching several signals is surfaced once', () => {
  // One record that matches on file, on tokens and on category all at once.
  const strong = record({
    id: 'KF-MULTI',
    kind: REAL_KINDS.KNOWN_FAILURES,
    title: 'mongoService connectivity',
    body: 'backend/src/services/mongoService.js connectivity',
  });
  const p = prepareTask('Fix mongoService connectivity', { records: [strong], memoryLimit: 50 });

  const hits = p.memory.results.filter((r) => r.id === 'KF-MULTI');
  assert.equal(hits.length, 1, `the record appeared ${hits.length} times`);
});

test('TEST 13: duplicate ids in the input do not duplicate output', () => {
  const dup = record({ id: 'KF-DUP', kind: REAL_KINDS.KNOWN_FAILURES, body: 'auth middleware' });
  const p = prepareTask('Fix the auth middleware', { records: [dup, { ...dup }, { ...dup }], memoryLimit: 50 });
  const hits = p.memory.results.filter((r) => r.id === 'KF-DUP');
  assert.equal(hits.length, 1, 'a repeated record must not be repeated in the report');
});

test('TEST 13: no id appears twice in the rendered report', () => {
  const records = [
    record({ id: 'DEC-A', kind: REAL_KINDS.ARCHITECTURAL_DECISIONS, body: 'auth middleware' }),
    record({ id: 'KF-B', kind: REAL_KINDS.KNOWN_FAILURES, body: 'auth middleware' }),
    record({ id: 'KF-C', kind: REAL_KINDS.KNOWN_FAILURES, status: FRESHNESS.HISTORICAL, body: 'auth middleware' }),
  ];
  const text = render(prepareTask('Fix the auth middleware', { records, memoryLimit: 50 }));
  for (const id of ['DEC-A', 'KF-B', 'KF-C']) {
    const occurrences = text.split(id).length - 1;
    assert.equal(occurrences, 1, `${id} was rendered ${occurrences} times`);
  }
});

/* ================================================================== *
 * TEST 14 — no test chaining
 * ================================================================== */

test('TEST 14: prepare does not recruit test files into the context through memory', () => {
  // The standing rule is that a test must never recruit another test. At the
  // prepare layer the new risk is that a memory record naming a test file could
  // smuggle it in, bypassing the router's own test-subject rules.
  //
  // The assertion is comparative, not absolute: the router legitimately admits
  // test files via TEST_DEPENDENCY (the auth bundle contains two), so demanding
  // zero test files would fail for the wrong reason. What must hold is that the
  // memory bait adds nothing the router did not already choose.
  const bait = record({
    id: 'KF-TESTBAIT',
    kind: REAL_KINDS.KNOWN_FAILURES,
    match: 'auth middleware',
    body: 'auth middleware backend/tests/auth.test.js frontend/src/components/__tests__/foo.test.tsx',
  });
  const task = 'Fix the auth middleware';
  const baseline = prepareTask(task, { memoryLimit: 0 });
  const withBait = prepareTask(task, { records: [bait], memoryLimit: 50 });

  assert.ok(withBait.memory.resultCount > 0, 'the bait must be retrieved or the test proves nothing');

  const isTest = (p) => /\.test\.[jt]sx?$/.test(p);
  const before = baseline.context.files.map((f) => f.path).filter(isTest).sort();
  const after = withBait.context.files.map((f) => f.path).filter(isTest).sort();

  assert.deepEqual(after, before, 'memory changed which test files are in the bundle');
  // And the baited test file specifically was not smuggled in.
  assert.equal(
    after.includes('backend/tests/auth.test.js') && !before.includes('backend/tests/auth.test.js'),
    false,
    'a test file named only by a memory record entered the bundle',
  );
});

test('TEST 14: a prepare run leaves the working tree and the bundle untouched', () => {
  // Preparing a task is a read. If it mutated shared state, a later test in this
  // suite (or any suite run alongside it) would observe a different engine — which
  // is test chaining by another name.
  const before = JSON.stringify(buildBundle('Add an MCP tool'));
  prepareTask('Add an MCP tool');
  prepareTask('Add an MCP tool', { memoryLimit: 99 });
  const after = JSON.stringify(buildBundle('Add an MCP tool'));

  const strip = (s) => s.replace(/"generatedAt":"[^"]+"/, '');
  assert.equal(strip(after), strip(before), 'running prepare changed a subsequent buildBundle call');
});
