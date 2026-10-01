/**
 * Evidence-gated context expansion â€” the permitted-trigger contract, 8.13, 8.31, 8.33,
 * 8.34, 8.35, 8.43.
 *
 * The whole point of this file is that expansion is a DECISION with a recorded
 * reason, not a reflex. the permitted-trigger contract lists the only seven justifications that
 * permit adding a file, and 8.12 also lists four things that must never justify
 * one. Those denials are enforced here as a hard filter, because a rule that is
 * only written in prose is a rule that gets forgotten.
 *
 * Every step is logged to `expansionLog` with the trigger that authorised it, so
 * a bundle can be audited after the fact: "why is this file open?"
 */

import { intel, outbound, inbound, pagesReaching, featureFiles } from './intel.mjs';
import { expandReasons, reasonsForPath, candidatesFor } from './expand-reasons.mjs';

/**
 * Most-specific-first. When a file qualifies under several triggers, the most
 * specific justification is the one worth recording â€” it tells the reader more.
 *
 * The ordering is load-bearing, not cosmetic. SHARED_SERVICE is strictly a
 * subset of DIRECT_DEPENDENCY (both ask "does a named file import this?", the
 * former additionally requiring two), so iterating trigger-major let
 * DIRECT_DEPENDENCY claim every shared service first and SHARED_SERVICE could
 * never fire. Selecting most-specific-first per candidate is what makes the
 * trigger reachable, and records the more useful reason.
 */
const TRIGGER_PRIORITY = [
  'TEST_DEPENDENCY',
  'API_DEPENDENCY',
  'STATE_DEPENDENCY',
  'PROTECTED_RELATIONSHIP',
  'SHARED_SERVICE',
  'DIRECT_DEPENDENCY',
  'RELEVANT_CONSUMER',
];

export { TRIGGER_PRIORITY };

/**
 * Guidelines, not universal caps.
 *
 * The context-size contract explicitly refuses a hard maximum like "never
 * inspect more than 10 files", because a database migration legitimately needs
 * more than a button change. These are therefore defaults the caller can raise
 * with an explicit reason, not limits the engine enforces on its own.
 *
 * The relevance budget that these sit alongside is a separate number owned by
 * `context-size.mjs`; it is deliberately not configured here, so expansion and
 * relevance cannot drift into one shared "limit".
 */
export const DEFAULT_LIMITS = {
  initialTarget: 15,      // "5-15 files where practical"
  perStep: 10,           // "+5-10 files at a time"
  maxSteps: 4,
  largeStepRequiresEvidence: true,
};

export class ExpansionBudget {
  constructor(limits = {}) {
    this.limits = { ...DEFAULT_LIMITS, ...limits };
    this.steps = 0;
    this.added = 0;
    this.log = [];
  }

  /** 8.43: stop when there is nothing left that has real evidence. */
  get exhausted() {
    return this.steps >= this.limits.maxSteps;
  }

  record(path, trigger, how) {
    this.added += 1;
    this.log.push({ step: this.steps + 1, path, trigger, how, reason: expandReasons[trigger] });
  }
}

/**
 * Should expansion continue?
 *
 * Returns `{ stop, why }`. The `why` is required because 8.34/8.35 ask for an
 * explanation when the system declines to expand â€” silence is not an acceptable
 * answer to "why did you stop?".
 */
export function shouldStop({ budget, pending, task, routing }) {
  if (budget.limits.maxSteps === 0) {
    return {
      stop: true,
      why: 'expansion was disabled for this bundle (--expand-steps 0); the context is exactly what the task named',
    };
  }
  if (budget.exhausted) {
    return { stop: true, why: `reached the step limit (${budget.limits.maxSteps}); ask for a larger budget if more context is genuinely needed` };
  }
  if (pending.length === 0) {
    return { stop: true, why: 'no remaining candidate has any permitted evidence' };
  }
  if (routing.intent?.intent === 'INVESTIGATE') {
    return {
      stop: true,
      why: 'INVESTIGATE tasks start from a deliberately small context (8.31); expand only after a concrete finding, not from the task text',
    };
  }
  return { stop: false, why: `${pending.length} candidate(s) carry permitted evidence` };
}

/**
 * Expand the context.
 *
 * `pending` is the set of files the relevance engine saw but did not admit. A
 * file may only be added when a permitted trigger explains WHY THIS TASK needs
 * it â€” never because it is nearby or merely shares a name.
 */
export function expand({ task, routing, initial, budget = new ExpansionBudget() }) {
  const ix = intel();
  const held = new Set(initial.files.map((f) => f.path));
  const expansionLog = budget.log;
  const named = namedPaths(routing);
  // Candidates are discovered from the graph around the task's named entities,
  // not taken from the relevance engine: by the time a file reaches the pending
  // list it has already been filtered out for lacking substantive evidence, so
  // reusing that list made expansion unreachable for every explicit-file task.
  const universe = candidatesFor({ routing, ix, named, initial: initial.files ?? [] });
  let stopped = null;

  // One pass over the candidate universe. Each candidate is matched against
  // every permitted trigger and kept under the MOST SPECIFIC one that justifies
  // it, so a shared service is recorded as SHARED_SERVICE rather than being
  // claimed first by the broader DIRECT_DEPENDENCY.
  const admitted = universe
    .filter((p) => !held.has(p))
    .map((path) => {
      let best = null;
      for (const trigger of TRIGGER_PRIORITY) {
        const why = reasonsForPath(path, { routing, initial, ix, trigger, named });
        if (why.length > 0) { best = { path, trigger, why, strength: why.length }; break; }
      }
      return best;
    })
    .filter(Boolean)
    .sort((a, b) => (b.strength - a.strength) || a.path.localeCompare(b.path));

  if (admitted.length === 0) {
    stopped = universe.length === 0
      ? 'nothing in the dependency graph relates to this task'
      : 'no remaining candidate has any permitted evidence';
    return finish();
  }

  // Drain in step-sized batches so the step count reflects how much was actually
  // taken, not how many triggers happened to have candidates.
  let cursor = 0;
  while (cursor < admitted.length && !budget.exhausted) {
    const decision = shouldStop({ budget, pending: admitted.slice(cursor), task, routing });
    if (decision.stop) { stopped = decision.why; break; }

    budget.steps += 1;
    for (const c of admitted.slice(cursor, cursor + budget.limits.perStep)) {
      held.add(c.path);
      budget.record(c.path, c.trigger, c.why);
      initial.files.push({
        path: c.path,
        score: null,
        priority: 'P5',
        tier: 'NORMAL',
        role: ix.roleByPath.get(c.path)?.role ?? null,
        feature: null,
        lines: null,
        addedByExpansion: true,
        expansionTrigger: c.trigger,
        reasons: c.why.map((w) => ({ kind: c.trigger, why: w })),
        why: c.why,
      });
    }
    cursor += budget.limits.perStep;
    if (budget.exhausted && cursor < admitted.length) {
      stopped = `reached the step limit (${budget.limits.maxSteps}); ${admitted.length - cursor} justified file(s) were left unopened â€” ask for a larger budget if they are genuinely needed`;
    }
  }

  if (!stopped) {
    stopped = shouldStop({ budget, pending: [], task, routing }).why;
  }

  return finish();

  function finish() {
    return {
      files: initial.files,
      expansionLog,
      expansionCount: budget.added,
      expansionSteps: budget.steps,
      budget,
      candidateUniverse: universe.length,
      stopReason: stopped,
    };
  }
}

/** Paths the task itself named â€” the seeds every trigger must relate to. */
function namedPaths(routing) {
  const explicit = (routing.entities?.explicitFiles ?? []).map((f) => f.path);
  // 8.30: when the developer named a file, that file is the subject. Expanding
  // from every loosely-matched component as well would re-admit the whole feature
  // through the back door â€” the same over-broad context the fast path exists to
  // prevent, just one expansion step later.
  if (explicit.length) return new Set(explicit);

  return new Set([
    ...explicit,
    ...(routing.entities?.components ?? []).map((c) => c.path),
    ...(routing.entities?.services ?? []).map((s) => s.path),
    ...(routing.entities?.hooks ?? []).map((h) => h.path),
    ...(routing.entities?.routes ?? []).flatMap((r) => r.handlers ?? []),
  ].filter(Boolean));
}

export { namedPaths };