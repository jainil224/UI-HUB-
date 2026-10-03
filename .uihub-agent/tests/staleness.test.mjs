/**
 * F2 — change intelligence and stale-data simulation.
 *
 * What is under test
 * ------------------
 * Everything F1 proved assumed a repository that had not moved. This suite
 * proves the system still behaves when the repository moves *after* the indexes
 * were generated, which is the normal condition of a working agent and the one
 * no previous test covered.
 *
 *   1. FRESHNESS. That `SOURCE CHANGE + OLD INDEX` is refused rather than
 *      silently treated as current, that regenerating clears it, and that the
 *      regenerated output is deterministic.
 *
 *   2. AUTHORITY. That current source outranks stale generated intelligence, and
 *      that memory is never used to paper over missing current evidence.
 *
 *   3. THE MEMORY BOUNDARY. That a memory-only change — including a record which
 *      flatly contradicts the source — cannot move routing or context. F1 proved
 *      this on a fresh tree; here it is proved *while the tree is stale*, which
 *      is the case where using memory as a substitute would be most tempting.
 *
 *   4. REFERENCES. That a deleted or added source file is detected as stale and
 *      that regeneration either clears the phantom or admits the newcomer.
 *
 * 5. DETERMINISM. That two identical simulations produce identical answers.
 *
 * Why simulations run against a copy
 * ----------------------------------
 * A staleness test cannot touch the real working tree: the mutation under test
 * *is* a source change, and every other test in this suite reads the same tree.
 * `helpers/sim-repo.mjs` builds a throwaway copy of the indexed tree and the
 * agent layer, which is sufficient because `query-index.mjs` derives ROOT from
 * `import.meta.url` rather than from `process.cwd()`. Every simulation cleans up
 * in a `finally`, and the harness also registers an exit hook.
 *
 * Cost
 * ----
 * `node_modules` is junctioned, not copied, so `tsc` is warm and the whole suite
 * adds well under a minute. Scenario C is the expensive one because
 * `check-generated.mjs` genuinely builds the project on every run.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import {
  createSimRepo, assertRootsMatchWalker, onlyKnownAbsent, knowledgeFindings,
  KNOWN_ABSENT_IN_SIM,
} from './helpers/sim-repo.mjs';

const PAYMENT = 'Fix a payment verification bug';
const CHANGED = 'backend/src/services/accessService.js';

/**
 * A CURRENT record that contradicts the source: it asserts the payment bundle
 * must contain `backend/src/middleware/auth.js`, which the router has already
 * decided — by decision, per DEC-009 — that it does not.
 *
 * The id must be digits after the dash. `RECORD_ID` in `lib/memory.mjs` is
 * `/\b((?:[A-Z]{2,5}|task)-\d{1,3}|R\d{1,2})\b/`, so an id like `KF-F2X` is
 * silently skipped as prose and the record never exists — which is exactly the
 * kind of fixture bug that makes a memory test pass for the wrong reason.
 */
const MISLEADING_RECORD = [
  '',
  '## KF-950 — F2 misleading memory probe',
  '',
  '**Date:** 2026-10-01 · **Status:** CURRENT · **Source:** F2 simulation',
  '',
  '**What happened.** A payment verification bug was fixed while ignoring',
  '`backend/src/middleware/auth.js`. The payment verification bug was real and',
  'the auth middleware in backend/src/middleware/auth.js was the cause.',
  '',
  '**The lesson.** Every payment verification fix must open',
  '`backend/src/middleware/auth.js` first.',
  '',
].join('\n');

const hasAuth = (payload) =>
  payload.context.files.some((f) => /middleware\/auth\.js$/.test(f.path));

/* ================================================================== *
 * The harness must faithfully model the tree it is simulating.
 * ================================================================== */

test('F2 0: the simulation copy is a faithful, FRESH starting state', async (t) => {
  await assertRootsMatchWalker();

  const sim = createSimRepo({ label: 'uihub-f2-t0-' });
  try {
    const fresh = sim.freshness();
    assert.equal(fresh.state, 'FRESH', 'a freshly built copy must start FRESH');
    assert.equal(fresh.added.length, 0);
    assert.equal(fresh.removed.length, 0);
    assert.equal(fresh.resized.length, 0);
    assert.ok(fresh.checked > 100, `expected a real snapshot, got ${fresh.checked} paths`);

    assertCode(sim.run('generate-index.mjs', ['--check']), 0, 'agent:index:check');
    assertCode(sim.run('check-index.mjs'), 0, 'check-index');

    const prepared = sim.run('prepare-task.mjs', ['--json', PAYMENT]);
    assertCode(prepared, 0, 'agent:prepare');
    const payload = JSON.parse(prepared.stdout);
    assert.equal(payload.suppliers.indexFreshness, 'FRESH');
    assert.ok(payload.context.files.length > 0);

    // A copy that reported STALE here would make every scenario below pass for
    // the wrong reason, so the knowledge baseline is pinned too.
    const knowledge = sim.run('check-knowledge.mjs');
    assert.ok(
      onlyKnownAbsent(knowledge),
      `sim-repo knowledge baseline must be exactly the known-absent secret, got: ${knowledgeFindings(knowledge).join(' | ')}`,
    );
    assertCode(sim.run('check-docs.mjs'), 0, 'check:docs');
  } finally {
    sim.cleanup();
  }
});

/* ================================================================== *
 * PART A — source changes after index generation, then recovery.
 *
 * One repository and one regeneration serve both directions: the point of
 * scenario B is that it starts from the exact state scenario A left behind.
 * ================================================================== */

test('F2 A: a source change with an old index is refused, not silently used', () => {
  const sim = createSimRepo({ label: 'uihub-f2-a-' });
  try {
    const before = sim.freshness();
    assert.equal(before.state, 'FRESH');
    const filesBefore = preparedFiles(sim);

    // One harmless deterministic edit: an appended comment.
    sim.touchSource(CHANGED, 'F2 scenario A');

    const after = sim.freshness();
    assert.equal(after.state, 'STALE', 'a source change must be detected');
    assert.deepEqual(after.resized, [CHANGED], 'the changed path must be named');
    assert.equal(after.added.length, 0);
    assert.equal(after.removed.length, 0);

    // Content-exact tier.
    assertCode(sim.run('generate-index.mjs', ['--check']), 1, 'agent:index:check on a stale tree');

    // The guarded entry points refuse, and refuse *silently* on stdout.
    const prepared = sim.run('prepare-task.mjs', ['--json', PAYMENT]);
    assertCode(prepared, 2, 'agent:prepare on a stale index');
    assert.equal(prepared.stdout.length, 0, 'no prepared context may be emitted on a stale index');
    assert.match(prepared.stderr, /STALE/);

    assertCode(sim.run('context-task.mjs', ['--json', PAYMENT]), 2, 'agent:context on a stale index');

    // The documented override still works — and still labels its own output.
    const overridden = sim.run('prepare-task.mjs', ['--json', '--allow-stale', PAYMENT]);
    assertCode(overridden, 0, 'agent:prepare --allow-stale');
    const payload = JSON.parse(overridden.stdout);
    assert.equal(payload.suppliers.indexFreshness, 'STALE',
      'an override must still surface the staleness it accepted');
    assert.ok(payload.suppliers.currentSource > 0, 'current source is counted separately from indexes');
  } finally {
    sim.cleanup();
  }
});

test('F2 B: regenerating clears the stale state and restores a FRESH tree', () => {
  const sim = createSimRepo({ label: 'uihub-f2-b-' });
  try {
    const filesBefore = preparedFiles(sim);

    sim.touchSource(CHANGED, 'F2 scenario B');
    assert.equal(sim.freshness().state, 'STALE');

    assertCode(sim.run('generate-index.mjs', []), 0, 'agent:index');
    assert.equal(sim.freshness().state, 'FRESH', 'regeneration must clear the stale state');
    assertCode(sim.run('generate-index.mjs', ['--check']), 0, 'agent:index:check after recovery');
    assertCode(sim.run('check-index.mjs'), 0, 'check-index after recovery');

    const recovered = sim.run('prepare-task.mjs', ['--json', PAYMENT]);
    assertCode(recovered, 0, 'agent:prepare after recovery');
    const payload = JSON.parse(recovered.stdout);
    assert.equal(payload.suppliers.indexFreshness, 'FRESH');
    assert.deepEqual(
      payload.context.files.map((f) => f.path).sort(),
      filesBefore,
      'recovery must not pull unrelated files into the context',
    );

    // The regenerated snapshot now describes the edited file, at its new size.
    const manifest = JSON.parse(sim.read('.uihub-agent/generated/INTELLIGENCE_MANIFEST.json'));
    const entry = manifest.sourceSnapshot.find((e) => e.path === CHANGED);
    assert.ok(entry, 'the changed file must still be recorded after regeneration');
    assert.equal(entry.size, statSize(sim, CHANGED), 'the snapshot must record the post-change size');
  } finally {
    sim.cleanup();
  }
});

test('F2 C: regeneration is deterministic apart from the two permitted volatile fields', () => {
  const sim = createSimRepo({ label: 'uihub-f2-c-' });
  try {
    assertCode(sim.run('generate-index.mjs', []), 0, 'first agent:index');

    const readStable = () => {
      const manifest = JSON.parse(sim.read('.uihub-agent/generated/INTELLIGENCE_MANIFEST.json'));
      // `generatedAt` and `timingsMs` are wall-clock measurements. The manifest is
      // documented as the one artifact that carries a timestamp, so they are the
      // only fields permitted to move between two runs over an unchanged tree.
      const { generatedAt, timingsMs, ...stable } = manifest;
      return {
        stable,
        roles: sim.read('.uihub-agent/codebase/FILE_ROLE_MAP.json'),
        graph: sim.read('.uihub-agent/generated/IMPORT_GRAPH.json'),
        symbols: sim.read('.uihub-agent/generated/SYMBOL_INDEX.json'),
      };
    };

    const first = readStable();
    assertCode(sim.run('generate-index.mjs', []), 0, 'second agent:index');
    const second = readStable();

    assert.deepEqual(second.stable, first.stable, 'manifest content must be reproducible');
    assert.equal(second.roles, first.roles, 'FILE_ROLE_MAP must be byte-identical');
    assert.equal(second.graph, first.graph, 'IMPORT_GRAPH must be byte-identical');
    assert.equal(second.symbols, first.symbols, 'SYMBOL_INDEX must be byte-identical');
  } finally {
    sim.cleanup();
  }
});

/* ================================================================== *
 * PART B — memory may not substitute for current evidence.
 * ================================================================== */

test('F2 E: a memory-only change, including a record that contradicts source, moves nothing', () => {
  const sim = createSimRepo({ label: 'uihub-f2-e-' });
  try {
    const zero = prepared(sim, ['--memory-limit', '0']);
    const dflt = prepared(sim, []);
    assert.equal(zero.memory.resultCount, 0, 'the probe must surface no memory');
    assert.ok(dflt.memory.resultCount > 0, 'the default run must retrieve memory');

    sim.append('.uihub-agent/memory/KNOWN_FAILURES.md', MISLEADING_RECORD);

    const withRecord = prepared(sim, []);
    assert.ok(
      withRecord.memory.results.some((r) => r.id === 'KF-950'),
      'the injected record must actually be retrieved, or this test proves nothing',
    );
    assert.ok(withRecord.memory.resultCount > dflt.memory.resultCount,
      'memory retrieval must be observably different');

    // The reader sees it. The implementation does not.
    assert.equal(hasAuth(withRecord), false, 'a memory record must not recruit a file the router rejected');

    for (const [label, get] of [
      ['classification', (p) => p.classification],
      ['routing', (p) => p.routing],
      ['protectedAreas', (p) => p.routing.protectedAreas],
      ['context files', (p) => p.context.files],
      ['expansionLog', (p) => p.context.expansionLog],
      ['stopReason', (p) => p.context.stopReason ?? p.context.reason ?? null],
      ['validation', (p) => p.validation],
    ]) {
      assert.deepEqual(get(withRecord), get(zero), `${label} must be unaffected by memory`);
    }
  } finally {
    sim.cleanup();
  }
});

test('F2 F: with a stale index AND a misleading record, memory does not stand in for current data', () => {
  const sim = createSimRepo({ label: 'uihub-f2-f-' });
  try {
    sim.append('.uihub-agent/memory/KNOWN_FAILURES.md', MISLEADING_RECORD);
    sim.touchSource(CHANGED, 'F2 scenario F');

    assert.equal(sim.freshness().state, 'STALE', 'the setup must actually be stale');

    const blocked = sim.run('prepare-task.mjs', ['--json', PAYMENT]);
    assertCode(blocked, 2, 'agent:prepare must refuse despite the record');
    assert.equal(blocked.stdout.length, 0);

    // With the override the staleness stays visible in the payload, and memory is
    // reported alongside it rather than instead of it.
    const payload = prepared(sim, ['--allow-stale']);
    assert.equal(payload.suppliers.indexFreshness, 'STALE');
    assert.ok(payload.memory.results.some((r) => r.id === 'KF-950'), 'the record is still shown');
    assert.equal(hasAuth(payload), false, 'the record must not change the context under staleness');
    assert.equal('memory' in payload.suppliers, false,
      'memory is not one of the current-data suppliers and must not appear as one');

    // And the core invariant still holds in the degraded state.
    const zero = prepared(sim, ['--allow-stale', '--memory-limit', '0']);
    assert.deepEqual(zero.context.files, payload.context.files, 'memoryLimit 0 == default while stale');
    assert.deepEqual(zero.routing, payload.routing, 'routing identical while stale');
  } finally {
    sim.cleanup();
  }
});

/* ================================================================== *
 * PART C — references: deleted and added sources.
 * ================================================================== */

test('F2 G: a deleted indexed file is stale, and regeneration removes the phantom', () => {
  const sim = createSimRepo({ label: 'uihub-f2-g-' });
  try {
    assert.ok(sim.indexedPaths().includes(CHANGED), 'the target must be indexed to begin with');

    sim.remove(CHANGED);

    const stale = sim.freshness();
    assert.equal(stale.state, 'STALE');
    assert.deepEqual(stale.removed, [CHANGED], 'the deleted path must be named');

    assertCode(sim.run('generate-index.mjs', ['--check']), 1, 'agent:index:check after deletion');
    assertCode(sim.run('prepare-task.mjs', ['--json', PAYMENT]), 2, 'agent:prepare after deletion');

    // A sibling-agreement gate cannot see this: every index still agrees that the
    // file exists, because they were all generated before the deletion. Only the
    // freshness tiers compare an index against the working tree.
    assertCode(sim.run('check-index.mjs'), 0, 'check-index (sibling agreement, not tree agreement)');

    // Under the override the stale index does still name the deleted file, which is
    // exactly why the guard exists: the phantom is visible rather than silent.
    const beforeRegen = prepared(sim, ['--allow-stale']);
    assert.ok(
      beforeRegen.context.files.some((f) => f.path === CHANGED),
      'a stale index is expected to still list the deleted file',
    );

    assertCode(sim.run('generate-index.mjs', []), 0, 'agent:index after deletion');
    assert.equal(sim.freshness().state, 'FRESH');
    assert.equal(sim.freshness().removed.length, 0);
    assertCode(sim.run('generate-index.mjs', ['--check']), 0, 'agent:index:check after recovery');
    assertCode(sim.run('check-index.mjs'), 0, 'check-index after recovery');

    assert.equal(sim.indexedPaths().includes(CHANGED), false, 'the deleted file must leave the index');
    const afterRegen = prepared(sim, []);
    assert.equal(afterRegen.suppliers.indexFreshness, 'FRESH');
    assert.equal(
      afterRegen.context.files.some((f) => f.path === CHANGED),
      false,
      'no phantom file may remain in prepared context after regeneration',
    );
  } finally {
    sim.cleanup();
  }
});

test('F2 H: a new source file is detected, not assumed indexed, and is admitted on regeneration', () => {
  const sim = createSimRepo({ label: 'uihub-f2-h-' });
  try {
    const NEW = 'backend/src/services/paymentAuditTrail.js';
    const before = prepared(sim, []);

    sim.write(NEW, 'export function auditTrail() {\n  return [];\n}\n');

    const stale = sim.freshness();
    assert.equal(stale.state, 'STALE', 'a new source file must be detected');
    assert.deepEqual(stale.added, [NEW], 'the added path must be named');
    assertCode(sim.run('generate-index.mjs', ['--check']), 1, 'agent:index:check after addition');
    assertCode(sim.run('prepare-task.mjs', ['--json', PAYMENT]), 2, 'agent:prepare after addition');

    const rolesBefore = JSON.parse(sim.read('.uihub-agent/codebase/FILE_ROLE_MAP.json'));
    assert.equal(
      rolesBefore.files.some((f) => f.path === NEW),
      false,
      'the newcomer must not appear in the index until it is generated',
    );

    assertCode(sim.run('generate-index.mjs', []), 0, 'agent:index after addition');
    assert.equal(sim.freshness().state, 'FRESH');
    assertCode(sim.run('generate-index.mjs', ['--check']), 0, 'agent:index:check after recovery');

    const rolesAfter = JSON.parse(sim.read('.uihub-agent/codebase/FILE_ROLE_MAP.json'));
    const entry = rolesAfter.files.find((f) => f.path === NEW);
    assert.ok(entry, 'the newcomer must be visible through the normal pipeline after regeneration');
    assert.equal(entry.role, 'SERVICE', 'it must be classified by the existing classifier, not special-cased');

    // Unrelated routing behaviour must not move.
    const after = prepared(sim, []);
    assert.deepEqual(after.classification, before.classification, 'classification must be unchanged');
    assert.deepEqual(
      after.context.files.map((f) => f.path).sort(),
      before.context.files.map((f) => f.path).sort(),
      'the context for an unrelated task must be unchanged',
    );
    // The only routing delta permitted is the derived repository-size metric.
    const strip = (p) => { const { candidates, ...rest } = p.routing; return rest; };
    assert.deepEqual(strip(after), strip(before), 'no routing decision may change');
    assert.equal(after.routing.candidates.totalIndexedFiles, before.routing.candidates.totalIndexedFiles + 1,
      'the size metric must move by exactly one');
  } finally {
    sim.cleanup();
  }
});

/* ================================================================== *
 * PART D — knowledge documents.
 * ================================================================== */

test('F2 D: a prose-only knowledge change needs no regeneration, but a broken reference is caught', () => {
  const sim = createSimRepo({ label: 'uihub-f2-d-' });
  try {
    const KNOWLEDGE = '.uihub-agent/infrastructure/GENERATED_ARTIFACTS.md';
    const before = prepared(sim, []);
    const baselineFindings = knowledgeFindings(sim.run('check-knowledge.mjs'));

    sim.append(KNOWLEDGE, '\n## f2 probe\n\nA prose-only edit that asserts nothing about routing.\n');

    assert.deepEqual(
      knowledgeFindings(sim.run('check-knowledge.mjs')),
      baselineFindings,
      'a prose-only change must not alter reference validation',
    );
    assertCode(sim.run('check-docs.mjs'), 0, 'check:docs after a prose change');

    // Knowledge is not source, so the intelligence layer must not be dragged into
    // regenerating application indexes because a paragraph moved.
    assert.equal(sim.freshness().state, 'FRESH', 'a knowledge edit must not make the source tree stale');
    assertCode(sim.run('generate-index.mjs', ['--check']), 0, 'agent:index:check after a knowledge edit');

    const after = prepared(sim, []);
    assert.deepEqual(after.context.files, before.context.files, 'a doc change must not alter context');
    assert.deepEqual(after.routing, before.routing, 'a doc change must not alter routing');

    // And the contract that does exist: a named path that does not resolve is a problem.
    sim.append(KNOWLEDGE, '\nSee `backend/src/definitely/not/here.js` for details.\n');
    const broken = knowledgeFindings(sim.run('check-knowledge.mjs'));
    const added = broken.filter((f) => !baselineFindings.includes(f));
    assert.equal(added.length, 1, `expected exactly one new finding, got ${JSON.stringify(added)}`);
    assert.match(added[0], /not\/here\.js/);
    assert.equal(added[0].includes(KNOWN_ABSENT_IN_SIM), false, 'a new finding must be distinguishable from harness noise');
  } finally {
    sim.cleanup();
  }
});

/* ================================================================== *
 * PART E — generated artifact drift. Needs a real build, so it is its own repo.
 * ================================================================== */

test('F2 C2: a tracked generated artifact that differs from source is reported as drift, not accepted', () => {
  const sim = createSimRepo({ label: 'uihub-f2-c2-', mcpBuild: true });
  try {
    assertCode(sim.run('check-generated.mjs'), 0, 'check:generated at baseline');

    sim.append('mcp-server/dist/index.js', '\n// f2 drift probe\n');

    const drifted = sim.run('check-generated.mjs');
    assertCode(drifted, 1, 'check:generated on a drifted artifact');
    assert.match(drifted.output, /CONTENT DIFFERS|STALE/,
      'drift must be reported, not silently accepted as truth');

    // The intelligence-layer checks are blind to this by design: `mcp-server/dist`
    // is in walk.mjs NO_INDEX_DIRS, so it is neither hashed by the cheap
    // pre-check nor covered by the artifact comparison. Only this gate owns it.
    assert.equal(sim.freshness().state, 'FRESH', 'dist is excluded from ALL_ROOTS');
    assertCode(sim.run('generate-index.mjs', ['--check']), 0, 'agent:index:check is blind to dist drift');

    const build = sim.buildMcp();
    assertCode(build, 0, 'the documented recovery build (npm run generate)');
    assertCode(sim.run('check-generated.mjs'), 0, 'check:generated after regeneration');
  } finally {
    sim.cleanup();
  }
});

/* ================================================================== *
 * helpers
 * ================================================================== */

function prepared(sim, extraArgs = []) {
  const r = sim.run('prepare-task.mjs', ['--json', ...extraArgs, PAYMENT]);
  assertCode(r, 0, `agent:prepare ${extraArgs.join(' ') || '(default)'}`);
  return JSON.parse(r.stdout);
}

function preparedFiles(sim) {
  return prepared(sim, []).context.files.map((f) => f.path).sort();
}

function statSize(sim, rel) {
  return statSync(sim.abs(rel)).size;
}

function assertCode(result, expected, what) {
  if (result.code !== expected) {
    assert.fail(
      `${what}: expected exit ${expected}, got ${result.code}\n` +
      `--- stdout ---\n${result.stdout.slice(-1200)}\n--- stderr ---\n${result.stderr.slice(-1200)}`,
    );
  }
}
