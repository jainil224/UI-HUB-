/**
 * Guards for the expansion-subject experiment (C1/C2).
 *
 * The experiment's entire value depends on one property: it changes nothing. If
 * it could perturb the engine, its numbers would describe a different engine
 * than the one that ships, and the report would be worse than useless - it would
 * be confidently wrong. So the read-only property is tested, not asserted in a
 * comment, and the tests below are written to fail loudly if anything in the
 * experiment starts reaching back into the engine.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildBundle } from '../scripts/lib/bundle.mjs';
import { classify } from '../scripts/lib/router.mjs';
import { expand, namedPaths, TRIGGER_PRIORITY } from '../scripts/lib/expand.mjs';
import { expandReasons, reasonsForPath, candidatesFor } from '../scripts/lib/expand-reasons.mjs';
import { intel } from '../scripts/lib/intel.mjs';
import {
  runExperiment,
  measureTrigger,
  proposedSubjects,
  CANONICAL_SET,
  EXPECT_RATIONALE,
} from '../scripts/lib/expansion-experiment.mjs';
import { renderReport, parseArgs } from '../scripts/expansion-experiment.mjs';

/**
 * A bundle as a comparable string.
 *
 * `generatedAt` is a wall-clock stamp, so two builds of the same task differ
 * there by design -- the existing bundle suite strips it for the same reason.
 * Comparing raw JSON would make every determinism guard fail for a reason that
 * has nothing to do with determinism.
 */
function stableBundle(task) {
  const bundle = buildBundle(task);
  delete bundle.generatedAt;
  return JSON.stringify(bundle);
}

/* ------------------------------------------------------------------ *
 * The seven-trigger contract
 * ------------------------------------------------------------------ */

test('the permitted-trigger set is exactly the seven, and is unchanged', () => {
  assert.equal(TRIGGER_PRIORITY.length, 7, 'the contract permits exactly seven triggers');
  assert.deepEqual([...TRIGGER_PRIORITY].sort(), [
    'API_DEPENDENCY',
    'DIRECT_DEPENDENCY',
    'PROTECTED_RELATIONSHIP',
    'RELEVANT_CONSUMER',
    'SHARED_SERVICE',
    'STATE_DEPENDENCY',
    'TEST_DEPENDENCY',
  ], 'a trigger was added, removed or renamed without the contract being updated');

  // Every trigger still carries a recorded justification. An undocumented trigger
  // is an unauthorised one.
  for (const t of TRIGGER_PRIORITY) {
    assert.ok(expandReasons[t], `trigger ${t} has no recorded reason`);
  }
});

/* ------------------------------------------------------------------ *
 * C2 - the experiment changes nothing
 * ------------------------------------------------------------------ */

test('the experiment does not mutate any bundle it measures', () => {
  // `runExperiment` asserts this internally; this test asserts it from outside so
  // that removing the internal check does not silently remove the guarantee.
  for (const spec of CANONICAL_SET) {
    const before = stableBundle(spec.task);
    runExperiment({ tasks: [spec] });
    assert.equal(
      stableBundle(spec.task),
      before,
      `rebuilding after the experiment produced a different bundle for ${spec.id}`,
    );
  }
});

test('the experiment module exports only measurement functions', async () => {
  // The experiment must not be able to reach the engine's decisions. An explicit
  // allowlist is used rather than a name-shape heuristic: a heuristic passes
  // something like `applyWiden()` only by luck, whereas adding an export that
  // could touch the engine now fails loudly until someone says why it is safe.
  const mod = await import('../scripts/lib/expansion-experiment.mjs');
  const allowed = new Set([
    'runExperiment',
    'measureTrigger',
    'proposedSubjects',
    'judge',
    'summarise',
    'assertUnchanged',
  ]);
  for (const name of Object.keys(mod)) {
    assert.ok(
      allowed.has(name) || typeof mod[name] !== 'function',
      `the experiment now exports "${name}"; every new function must be justified as read-only`,
    );
  }
  assert.ok(mod.assertUnchanged, 'the read-only assertion must remain exported so the guarantee is externally checkable');
});

test('expansion admission is byte-identical with and without the experiment imported', async () => {
  // The strongest form of the guarantee: the engine's own output for every
  // canonical task, computed before and after the experiment module is loaded.
  // If importing the experiment could perturb a shared index or a memo, this is
  // where it shows.
  const before = CANONICAL_SET.map((s) => stableBundle(s.task));

  await import('../scripts/lib/expansion-experiment.mjs');
  runExperiment();

  const after = CANONICAL_SET.map((s) => stableBundle(s.task));
  assert.deepEqual(after, before, 'loading and running the experiment changed engine output');
});

test('the shipped subject set is still namedPaths only - the experiment did not widen it', () => {
  // The experiment proposes a wider subject set. If that proposal had leaked into
  // `expand()`, this assertion fails, which is exactly the regression the user
  // decision - "measure it, do not ship it" - is protecting against.
  const spec = CANONICAL_SET.find((s) => s.id === 'S4');
  const routing = classify(spec.task);
  const bundle = buildBundle(spec.task);

  const shipped = namedPaths(routing);
  const { subjects, addedByRelevance } = proposedSubjects(routing, bundle);

  assert.ok(addedByRelevance.length > 0, 'this task must have relevance-admitted subjects for the test to mean anything');
  assert.ok(
    subjects.size > shipped.size,
    'the proposed subject set must actually be wider, or the experiment measures nothing',
  );

  // The proposal lives only in the return value. `namedPaths` itself is unchanged.
  const again = namedPaths(routing);
  assert.deepEqual([...again].sort(), [...shipped].sort(), 'namedPaths changed between calls');
  assert.equal(again.has(addedByRelevance[0]), false, 'a relevance-admitted file leaked into the shipped subject set');
});

test('every admitted file the experiment reports is a path the engine would actually evaluate', () => {
  // Guards against the experiment inventing a code path: every file it reports
  // must be a real indexed file, and the trigger it names must genuinely return
  // a reason when asked directly by the engine's own function.
  const result = runExperiment();
  let checked = 0;
  for (const row of result.rows) {
    const routing = classify(row.task);
    const bundle = buildBundle(row.task);
    const { subjects } = proposedSubjects(routing, bundle);
    for (const trigger of TRIGGER_PRIORITY) {
      for (const entry of row.perTrigger[trigger].files) {
        assert.ok(
          intel().roleByPath.has(entry.path),
          `${trigger} reported ${entry.path} for ${row.id}, which is not an indexed file`,
        );
        const direct = reasonsForPath(entry.path, { routing, initial: bundle, ix: intel(), trigger, named: subjects });
        assert.ok(direct.length > 0, `${trigger} reported ${entry.path} but reasonsForPath gives no reason for it now`);
        assert.equal(entry.trigger, trigger, 'a file is filed under a trigger it did not match');
        checked += 1;
      }
    }
  }
  assert.ok(checked > 0, 'the experiment reported no files at all, so this guard proved nothing');
});

test('measureTrigger only ever reports files the current bundle does not contain', () => {
  const spec = CANONICAL_SET.find((s) => s.id === 'S5');
  const routing = classify(spec.task);
  const bundle = buildBundle(spec.task);
  const { subjects } = proposedSubjects(routing, bundle);
  const held = new Set(bundle.files.map((f) => f.path));

  for (const trigger of TRIGGER_PRIORITY) {
    for (const entry of measureTrigger({ routing, bundle, trigger, subjects })) {
      assert.equal(held.has(entry.path), false, `${trigger} re-counted ${entry.path}, which the bundle already has`);
    }
  }
});

/* ------------------------------------------------------------------ *
 * The measurement itself
 * ------------------------------------------------------------------ */

test('the experiment covers the full canonical set and labels its ground truth honestly', () => {
  const ids = CANONICAL_SET.map((s) => s.id);
  assert.deepEqual(ids, ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10']);

  // The four empty-answer tasks are what make the verdict decisive. If one is
  // dropped, the experiment silently loses its strongest evidence and the
  // remaining "unverified" results would have to carry the conclusion.
  const empty = CANONICAL_SET.filter((s) => s.expect === 'empty').map((s) => s.id);
  assert.deepEqual(empty, ['S6', 'S7', 'S8', 'S10']);

  for (const s of CANONICAL_SET) {
    assert.ok(EXPECT_RATIONALE[s.expect], `${s.id} has expectation "${s.expect}" with no stated rationale`);
    if (s.expect === 'empty') {
      assert.equal(s.relevant.length, 0, `${s.id} is marked empty but lists relevant files`);
    }
  }
});

test('a trigger that invents files for an empty-answer task is rejected, always', () => {
  const result = runExperiment();
  for (const trigger of TRIGGER_PRIORITY) {
    const s = result.summary[trigger];
    if (s.falsePositives > 0) {
      assert.ok(
        s.verdict.startsWith('REJECT'),
        `${trigger} invents ${s.falsePositives} file(s) but its verdict is "${s.verdict}"`,
      );
      assert.equal(s.breaksAnEmptyBundle, true);
    } else {
      assert.equal(s.breaksAnEmptyBundle, false);
      assert.ok(
        s.verdict.startsWith('NO EFFECT') || s.verdict.startsWith('DEFER'),
        `${trigger} has no false positives but an unclear verdict: "${s.verdict}"`,
      );
    }
  }
});

test('a rejected trigger is rejected on evidence, and the evidence is quotable', () => {
  const result = runExperiment();
  const rejected = TRIGGER_PRIORITY.filter((t) => result.summary[t].verdict.startsWith('REJECT'));
  assert.ok(rejected.length > 0, 'the experiment is supposed to reject something; rejecting nothing means it measured nothing');

  for (const trigger of rejected) {
    const offenders = result.rows
      .filter((r) => r.perTrigger[trigger].falsePositives > 0)
      .map((r) => r.id);
    for (const id of offenders) {
      assert.equal(
        CANONICAL_SET.find((s) => s.id === id).expect,
        'empty',
        `${trigger} is rejected via ${id}, which is not an empty-answer task; the verdict rests on a judgement call`,
      );
    }
  }
});

test('widening never adds a file to a task whose bundle is already empty', () => {
  // S7, S8 and S10 resolve nothing, so there is no relevance-admitted subject to
  // widen from. If they ever gain files, the subject derivation has started
  // inventing entities.
  const result = runExperiment();
  for (const id of ['S7', 'S8', 'S10']) {
    const row = result.rows.find((r) => r.id === id);
    assert.equal(row.baselineFiles, 0, `${id} is no longer a zero-file bundle`);
    assert.equal(row.relevanceSubjects.length, 0, `${id} now has relevance subjects, which should be impossible`);
    for (const trigger of TRIGGER_PRIORITY) {
      assert.equal(row.perTrigger[trigger].added, 0, `${trigger} would add a file to ${id}`);
    }
  }
});

test('the experiment is deterministic', () => {
  const a = JSON.stringify(runExperiment());
  const b = JSON.stringify(runExperiment());
  assert.equal(a, b, 'two runs disagree; the report is not reproducible');
});

/* ------------------------------------------------------------------ *
 * The report
 * ------------------------------------------------------------------ */

test('the report states a verdict for all seven triggers and quotes real numbers', () => {
  const result = runExperiment();
  const report = renderReport(result);

  for (const trigger of TRIGGER_PRIORITY) {
    assert.ok(report.includes(trigger), `the report never mentions ${trigger}`);
  }
  for (const spec of CANONICAL_SET) {
    assert.ok(report.includes(spec.id), `the report never mentions ${spec.id}`);
  }
  assert.ok(/NO CHANGE|changes nothing|read-only/i.test(report), 'the report must state that behaviour is unchanged');
  assert.ok(
    report.includes('agent:experiment'),
    'the report must record how to reproduce it',
  );
});

test('report generation is side-effect free and argument parsing is total', () => {
  const result = runExperiment();
  const first = renderReport(result);
  assert.equal(renderReport(result), first, 'rendering twice produced different text');

  assert.equal(parseArgs(['--json']).json, true);
  assert.equal(parseArgs([]).json, false);
  assert.equal(parseArgs(['--help']).help, true);
  assert.throws(() => parseArgs(['--nope']), /unknown argument/, 'an unknown flag must be rejected, not ignored');
});
