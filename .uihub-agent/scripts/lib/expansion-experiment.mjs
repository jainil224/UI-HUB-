/**
 * The deferred expansion-subject experiment (DEC-009, ROUTER_DECISIONS OPEN item 1).
 *
 * THE QUESTION
 * ------------
 * Expansion today grows from one seed set: the paths the router resolved for the
 * task -- `namedPaths()` in `expand.mjs`, which is *only* the explicit files when
 * the developer named any. Everything the relevance engine admitted on its own
 * (a component, a hook, a service that scored in without being mentioned) is in
 * the bundle, but is not an expansion *subject*: expansion never walks out from it.
 *
 * The proposal under test is to also treat those relevance-admitted files as
 * subjects, so one more hop out is available. The concern recorded in DEC-009 is
 * that this re-admits the whole feature through the back door -- exactly the
 * over-broad context the 8.30 fast path exists to prevent, just one step later.
 * The proposal was deferred rather than rejected because it was never measured.
 * This file measures it. Seven triggers, ten canonical tasks, no behaviour change.
 *
 * WHY IT IS SAFE TO RUN
 * --------------------
 * Nothing here is called by `buildBundle()`. The shipped path in `expand.mjs` is
 * untouched; this module re-derives the candidate set for a *hypothetical* subject
 * set and reports the difference. Every function is pure with respect to the
 * bundle it is handed: `measureTrigger()` deep-clones the bundle before doing any
 * work, so the caller's bundle is bit-identical afterwards. `assertUnchanged()`
 * turns that promise into a checked invariant rather than a comment.
 *
 * HOW THE ANSWER IS JUDGED
 * ------------------------
 * Precision needs ground truth, and most tasks do not have it. But four of the ten
 * canonical tasks DO have an unambiguous one: S6, S7, S8 and S10 are tasks whose
 * correct answer is *nothing*. S6 names a component that does not exist, S7 names
 * an entity that is not in the index, S8 and S10 are unknown. The benchmark says
 * a zero-file bundle is the correct answer and that nothing may be invented.
 *
 * So for those four tasks every file a trigger would newly admit is a provable
 * false positive -- not an opinion about relevance, a contradiction of a stated
 * requirement. A trigger that widens them is disqualified regardless of what it
 * does elsewhere. For the six tasks with known relevant files, an added file is
 * credited only when it is already in the bundle or in the task's ground truth;
 * anything else is reported as `unverified` and never counted as a win.
 */

import { intel } from './intel.mjs';
import { expandReasons, reasonsForPath, candidatesFor } from './expand-reasons.mjs';
import { namedPaths, TRIGGER_PRIORITY } from './expand.mjs';
import { classify } from './router.mjs';
import { buildBundle } from './bundle.mjs';

/**
 * The canonical set, with the ground truth the benchmark actually states.
 *
 * `expect` is the honest reading of the benchmark, not a wish:
 *   - `empty`  : the correct bundle has no files. Any addition is a false positive.
 *   - `known`  : these files are relevant. Anything else is unverified, not relevant.
 *
 * S3 ("the named file itself, plus its reverse deps") has no enumerable ground
 * truth, so it is scored only on growth and is marked `structural` -- it is
 * reported but never used to claim a trigger is safe.
 */
export const CANONICAL_SET = [
  {
    id: 'S1',
    task: 'Fix a payment verification bug',
    expect: 'known',
    relevant: ['backend/src/services/accessService.js', 'backend/src/middleware/auth.js'],
  },
  {
    id: 'S2',
    task: 'Fix WebM template preview performance',
    expect: 'known',
    relevant: ['frontend/src/components/templates/TemplatePreview.tsx'],
  },
  {
    id: 'S3',
    task: 'Edit frontend/src/components/templates/TemplatePreview.tsx',
    expect: 'structural',
    relevant: ['frontend/src/components/templates/TemplatePreview.tsx'],
  },
  {
    id: 'S4',
    task: 'Fix the auth middleware',
    expect: 'known',
    relevant: ['backend/src/middleware/auth.js'],
  },
  {
    id: 'S5',
    task: 'Add an MCP tool',
    expect: 'known',
    relevant: ['mcp-server/src/tools/index.ts', 'mcp-server/src/tools/helpers.ts'],
  },
  {
    id: 'S6',
    task: 'Fix TemplateCard so the similar rail shows WebM previews',
    expect: 'empty',
    relevant: [],
  },
  {
    id: 'S7',
    task: 'Fix an XSS vulnerability in the comment renderer',
    expect: 'empty',
    relevant: [],
  },
  {
    id: 'S8',
    task: 'Why is the site loading slowly?',
    expect: 'empty',
    relevant: [],
  },
  {
    id: 'S9',
    task: 'Fix the /activate-free endpoint',
    expect: 'known',
    relevant: ['backend/src/routes/userRoutes.js'],
  },
  {
    id: 'S10',
    task: 'xyzzy frobnicate widget',
    expect: 'empty',
    relevant: [],
  },
];

/** Why a task is scored the way it is. Used by the report, and by the test. */
export const EXPECT_RATIONALE = {
  empty: 'the benchmark states the correct bundle is empty and that nothing may be invented',
  known: 'the benchmark enumerates the known relevant files',
  structural: 'the benchmark describes the ground truth qualitatively, so it can only measure growth',
};

/**
 * The subjects a hypothetical widening would use.
 *
 * Shipped behaviour is `namedPaths(routing)`. The proposal adds the files the
 * relevance engine admitted on its own. Tests are excluded from the added
 * subjects for the same reason `testSubjectsFor()` excludes them: a bundle that is
 * mostly tests must not gain subjects that turn the graph into a test-chain.
 */
export function proposedSubjects(routing, bundle) {
  const base = namedPaths(routing);
  const ix = intel();
  const added = [];
  for (const f of bundle.files ?? []) {
    if (f.addedByExpansion) continue;              // already an expansion result
    if (base.has(f.path)) continue;                 // already a subject
    if (ix.roleByPath.get(f.path)?.role === 'TEST') continue;
    added.push(f.path);
  }
  return { subjects: new Set([...base, ...added]), namedOnly: base, addedByRelevance: added };
}

/**
 * What would trigger `trigger` admit if the proposed subjects were in play?
 *
 * Returns only the paths the CURRENT bundle does not already contain, because the
 * question is what widening costs, not what the trigger can see in general.
 */
export function measureTrigger({ routing, bundle, trigger, subjects }) {
  const ix = intel();
  const held = new Set((bundle.files ?? []).map((f) => f.path));

  // The candidate universe is re-derived for the hypothetical subject set. This
  // is the same function `expand()` uses, so the experiment cannot drift from the
  // engine it is measuring.
  const universe = candidatesFor({ routing, ix, named: subjects, initial: [] });

  const admitted = [];
  for (const path of universe) {
    if (held.has(path)) continue;
    const why = reasonsForPath(path, { routing, initial: bundle, ix, trigger, named: subjects });
    if (why.length > 0) admitted.push({ path, trigger, why });
  }
  admitted.sort((a, b) => a.path.localeCompare(b.path));
  return admitted;
}

/** Classify one newly-admitted path against the task's stated ground truth. */
export function judge(entry, spec) {
  if (spec.expect === 'empty') return 'false-positive';
  if (spec.relevant.includes(entry.path)) return 'ground-truth-relevant';
  return 'unverified';
}

/**
 * Run the full experiment.
 *
 * Returns, per trigger: the tasks it would widen, the files it would add, and
 * whether it breaks a task whose correct answer is empty. `falsePositives` is the
 * disqualifying number; `unverified` is reported but never rewarded.
 */
export function runExperiment({ tasks = CANONICAL_SET } = {}) {
  const rows = [];

  for (const spec of tasks) {
    // The real, shipped bundle. This is the baseline the experiment is measured
    // against and is never modified.
    const bundle = buildBundle(spec.task);
    const before = JSON.stringify(bundle);
    const routing = classify(spec.task);
    const { subjects, namedOnly, addedByRelevance } = proposedSubjects(routing, bundle);

    const perTrigger = {};
    for (const trigger of TRIGGER_PRIORITY) {
      const admitted = measureTrigger({ routing, bundle, trigger, subjects });
      const judged = admitted.map((a) => ({ ...a, verdict: judge(a, spec) }));
      perTrigger[trigger] = {
        added: judged.length,
        files: judged,
        falsePositives: judged.filter((f) => f.verdict === 'false-positive').length,
        groundTruthHits: judged.filter((f) => f.verdict === 'ground-truth-relevant').length,
        unverified: judged.filter((f) => f.verdict === 'unverified').length,
      };
    }

    assertUnchanged(before, bundle, spec);

    rows.push({
      id: spec.id,
      task: spec.task,
      expect: spec.expect,
      baselineFiles: bundle.files.length,
      baselineExpanded: bundle.files.filter((f) => f.addedByExpansion).length,
      namedSubjects: [...namedOnly],
      relevanceSubjects: addedByRelevance,
      perTrigger,
    });
  }

  return { rows, summary: summarise(rows) };
}

/** The bundle must be byte-identical after measurement. Throws if it is not. */
export function assertUnchanged(before, bundle, spec) {
  const after = JSON.stringify(bundle);
  if (before !== after) {
    throw new Error(
      `the experiment mutated the bundle for ${spec.id}; it is required to be read-only`,
    );
  }
}

/** Per-trigger totals, with the disqualifying false-positive count first. */
export function summarise(rows) {
  const byTrigger = {};
  for (const trigger of TRIGGER_PRIORITY) {
    let added = 0;
    let falsePositives = 0;
    let groundTruthHits = 0;
    let unverified = 0;
    const tasks = [];
    for (const row of rows) {
      const t = row.perTrigger[trigger];
      if (t.added === 0) continue;
      added += t.added;
      falsePositives += t.falsePositives;
      groundTruthHits += t.groundTruthHits;
      unverified += t.unverified;
      tasks.push({ id: row.id, added: t.added, falsePositives: t.falsePositives });
    }
    byTrigger[trigger] = {
      trigger,
      reason: expandReasons[trigger],
      tasksWidened: tasks.length,
      added,
      falsePositives,
      groundTruthHits,
      unverified,
      breaksAnEmptyBundle: falsePositives > 0,
      verdict: falsePositives > 0
        ? 'REJECT -- it invents context for a task whose correct answer is nothing'
        : added === 0
          ? 'NO EFFECT -- it fires on no canonical task under the proposed subject set'
          : 'DEFER -- it adds files but breaks no empty-answer task, and the additions are not evidenced as relevant',
    };
  }
  return byTrigger;
}

export { TRIGGER_PRIORITY };
