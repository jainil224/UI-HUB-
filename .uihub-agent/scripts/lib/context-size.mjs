/**
 * Context-size policy — resolves the contradiction between "there is no
 * arbitrary universal file cap" and a hard-coded `maxFiles = 25`.
 *
 * The contradiction is resolved by separating three different numbers that were
 * all doing one job, and naming each for what it actually is:
 *
 *   1. RELEVANCE BUDGET — a soft target for what relevance alone selects. It is
 *      a budget, not a cap: it is derived from evidence about the task, and the
 *      caller may override it with an explicit number.
 *   2. EXPANSION BUDGET — a separate, smaller budget for files admitted by a
 *      trigger. Deliberately independent of (1), so "relevance wanted 35" and
 *      "expansion added 8" never get conflated into one opaque total.
 *   3. SAFETY CEILING — a hard guard that exists only to stop a runaway. It is
 *      not a target, not a guideline, and nothing legitimate should approach
 *      it; its purpose is to make a mis-ranked candidate set or a runaway
 *      trigger fail loudly instead of quietly emitting a repository-sized blob.
 *
 * The budget is evidence-driven. It grows with the properties the context-size
 * contract names — dependency necessity, task complexity, feature scope,
 * protected relationships, validation requirements — and with NONE of the things
 * that are merely available. A repository with more files, or a task that
 * happens to match more candidates, does not earn a bigger context.
 */

/**
 * The policy itself.
 *
 * `relevanceBudget` (25) is the floor-plus-baseline: an ordinary, single-feature
 * task that touches one or two subsystems. It is the number that used to be
 * passed as `maxFiles`, so it is deliberately unchanged in value — only its
 * meaning is corrected. `25` was never a safety limit; nothing in the benchmark
 * comes near the ceiling, so keeping the baseline preserves measured behaviour
 * while the surrounding policy becomes honest.
 *
 * `maxRelevanceBudget` (40) bounds how far evidence may raise the budget. This is
 * the documented "soft threshold": growth is allowed, but it cannot run away.
 *
 * `safetyCeiling` (60) is the runaway guard. It is set above the largest budget
 * evidence can justify plus a full expansion budget (40 + 10 + 10 = 60), so it is
 * reachable only by a caller who explicitly asked for a large budget *and* for
 * expansion to keep firing. In the 10 canonical benchmark tasks the largest
 * bundle is well under half of it. The ceiling exists to bound a bug, not to
 * describe normal operation, and it reports itself when it fires rather than
 * truncating silently.
 */
export const CONTEXT_SIZE_POLICY = Object.freeze({
  relevanceBudget: 25,
  maxRelevanceBudget: 40,
  safetyCeiling: 60,
  expansionBudget: Object.freeze({ steps: 1, perStep: 10 }),
  growth: Object.freeze({
    perExtraFeature: 5,
    validationOver: 2,
    validationBonus: 5,
    protectedOver: 2,
    protectedBonus: 5,
    surfaceOver: 2,
    surfaceBonus: 5,
  }),
});

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/**
 * The relevance budget for one task, with the evidence that produced it.
 *
 * Returns `{ budget, base, evidence }` rather than a bare number so the bundle
 * can state WHY it holds as many files as it does. A budget that cannot explain
 * itself would reintroduce the same documentation/code contradiction this module
 * exists to remove.
 *
 * When `grow` is false the caller supplied an explicit budget; it is honoured
 * verbatim and no evidence is collected, because an explicit number is already a
 * decision and re-litigating it would make the override meaningless.
 */
export function relevanceBudgetFor(routing, { base = CONTEXT_SIZE_POLICY.relevanceBudget, grow = true } = {}) {
  const explicit = routing?.entities?.explicitFiles ?? [];

  // A named file is the subject. Growth past the named set has to be earned by a
  // trigger, not by a larger default, so the budget is the named files plus one
  // expansion step's worth of room for what they pull in.
  if (explicit.length > 0) {
    const room = CONTEXT_SIZE_POLICY.expansionBudget.perStep;
    const budget = Math.min(base, explicit.length + room);
    return {
      budget,
      base,
      evidence: [
        { signal: 'named files', detail: `${explicit.length} path(s) named by the task`, amount: budget - base },
      ],
    };
  }

  if (!grow) return { budget: base, base, evidence: [] };

  const g = CONTEXT_SIZE_POLICY.growth;
  const evidence = [];

  const features = routing?.featureCandidates?.length ?? 0;
  if (features > 1) {
    evidence.push({
      signal: 'feature scope',
      detail: `${features} feature candidates implicated`,
      amount: (features - 1) * g.perExtraFeature,
    });
  }

  const validation = routing?.validation?.length ?? 0;
  if (validation > g.validationOver) {
    evidence.push({
      signal: 'validation requirements',
      detail: `${validation} verification command(s) required`,
      amount: g.validationBonus,
    });
  }

  const protectedAreas = routing?.protectedAreas?.length ?? 0;
  if (protectedAreas > g.protectedOver) {
    evidence.push({
      signal: 'protected relationships',
      detail: `${protectedAreas} protected area(s) touched`,
      amount: g.protectedBonus,
    });
  }

  const surfaces = (routing?.surface ?? []).filter((s) => s !== 'UNKNOWN').length;
  if (surfaces > g.surfaceOver) {
    evidence.push({
      signal: 'task complexity',
      detail: `${surfaces} subsystems implicated by resolved evidence`,
      amount: g.surfaceBonus,
    });
  }

  const requested = base + evidence.reduce((n, e) => n + e.amount, 0);
  const budget = clamp(requested, base, CONTEXT_SIZE_POLICY.maxRelevanceBudget);

  return { budget, base, requested, evidence };
}

/**
 * Apply the runaway guard.
 *
 * Truncation happens on the already-ordered final list, so what survives is the
 * highest-priority evidence rather than an arbitrary prefix, and every dropped
 * path is reported. A silent truncate would be the exact failure mode this
 * ceiling exists to make visible.
 */
export function applySafetyCeiling(files, ceiling = CONTEXT_SIZE_POLICY.safetyCeiling) {
  if (!Number.isFinite(ceiling) || files.length <= ceiling) {
    return { files, dropped: [], applied: false, ceiling };
  }
  return {
    files: files.slice(0, ceiling),
    dropped: files.slice(ceiling).map((f) => f.path),
    applied: true,
    ceiling,
  };
}