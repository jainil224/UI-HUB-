/**
 * Context bundle assembly — agent.md tasks 8.15, 8.39, 8.47, 8.48, 8.51.
 *
 * A bundle is the machine-readable answer to "what is the minimal necessary
 * context for this task?" It contains nothing that cannot be explained, and
 * nothing that is a secret. The generatedAt timestamp is the only wall-clock
 * value; every other field is deterministic given the task, indexes and router.
 */

import { classify } from './router.mjs';
import { initialContext, rankFiles } from './relevance.mjs';
import { expand, ExpansionBudget } from './expand.mjs';
import { repositorySize } from './intel.mjs';
import { load } from '../query-index.mjs';

const BUNDLE_VERSION = '8.0.0';

function uniquePaths(files) {
  const seen = new Set();
  return files.filter((f) => {
    if (seen.has(f.path)) return false;
    seen.add(f.path);
    return true;
  });
}

function serialiseFiles(files) {
  return uniquePaths(files).map((f) => ({
    path: f.path,
    score: f.score ?? null,
    priority: f.priority,
    tier: f.tier ?? 'NORMAL',
    role: f.role ?? null,
    feature: f.feature ?? null,
    lines: f.lines ?? null,
    addedByExpansion: !!f.addedByExpansion,
    expansionTrigger: f.expansionTrigger ?? null,
    why: f.why ?? [],
    matched: f.matched ?? null,
  }));
}

export function buildBundle(task, { expandSteps = 1, maxFiles = 25 } = {}) {
  const routing = classify(task);
  let ctx = initialContext(task, routing, { maxFiles });

  const all = rankFiles(task, routing, { maxFiles: 2000, minScore: 0 });

  // `expand()` discovers its own candidates from the dependency graph, so it
  // no longer needs the relevance engine's pending list. `all` is still needed
  // for the efficiency report.
  const initialEmptyReason = ctx.emptyReason ?? null;

  const exp = expand({
    task,
    routing,
    initial: ctx,
    budget: new ExpansionBudget({ maxSteps: expandSteps }),
  });
  ctx = exp;

  const files = serialiseFiles(ctx.files);

  const bundle = {
    schemaVersion: BUNDLE_VERSION,
    generatedAt: new Date().toISOString(),
    task,
    intent: routing.intent,
    categories: routing.categories,
    surface: routing.surface,
    confidence: routing.confidence,
    confidenceWhy: routing.confidenceWhy,
    featureCandidates: routing.featureCandidates,
    // agent.md 8.14 lists "Indexes queried" as part of the bundle. Stating which
    // indexes were opened makes the bundle self-describing: a reader can tell
    // whether the context came from the symbol index or only from keywords.
    indexes: routing.initialIndexes ?? [],
    entities: routing.entities,
    evidence: routing.evidence,
    files,
    knowledge: (routing.knowledge ?? []).map((k) => ({ path: k, reason: `knowledge for ${routing.categories.join(', ')}` })),
    // agent.md 8.14 also lists "Dependencies". Every relationship the bundle
    // actually relied on, derived from the expansion log rather than
    // re-derived, so it can never disagree with what was really used.
    dependencies: (exp?.expansionLog ?? []).map((e) => ({
      path: e.path,
      trigger: e.trigger,
      how: e.how,
    })),
    protectedAreas: (routing.protectedAreas ?? []).map((p) => ({
      path: p.path,
      tier: p.tier,
      rule: p.rule ? `${p.rule.rule ?? ''}`.trim() || p.rule.tier : null,
      via: p.via ?? null,
    })),
    validation: (routing.validation ?? []),
    expansionLog: exp.expansionLog,
    expansionCount: exp.expansionCount,
    expansionSteps: exp.expansionSteps,
    stopReason: exp.stopReason,
    unknown: routing.unknown ?? null,
    efficiency: {
      // The real repository total, not the number of ranked candidates. Using
      // the candidate count made "12 of 12 candidates" look like a 100% ratio
      // against 12 files when the repository holds hundreds.
      totalIndexedFiles: repositorySize().indexedFiles,
      qualifiedCandidates: all.files.length,
      filesSelected: files.length,
      // Reported separately because the cap applies to what RELEVANCE selected.
      // Expansion is a separate, budgeted decision that may legitimately push
      // the total past it; conflating the two hides which rule was respected.
      initialFiles: files.length - exp.expansionCount,
      expandedFiles: exp.expansionCount,
      selectionRatio: files.length === 0
        ? 0
        : Number((files.length / repositorySize().indexedFiles).toFixed(4)),
    },
    // Derived from the FINAL file list, not from either intermediate context:
    // expansion can turn an empty result into a non-empty one, and a bundle that
    // claims "no file matched" while listing files is worse than no bundle.
    emptyReason: files.length === 0 ? (initialEmptyReason ?? exp.emptyReason ?? null) : null,
  };

  return bundle;
}

/**
 * Validate a bundle against the GENERATED schema.
 *
 * Driven by `generated/CONTEXT_BUNDLE_SCHEMA.json` rather than by assertions
 * written here, so the schema and the builder cannot drift apart silently: if
 * the generator adds a field, this stops ignoring it.
 */
export function validateBundle(bundle) {
  const schema = load('generated/CONTEXT_BUNDLE_SCHEMA.json');
  const problems = [];

  for (const prop of schema.properties ?? []) {
    const value = bundle[prop.path];
    if (value === undefined) {
      problems.push(`missing required property: ${prop.path}`);
      continue;
    }
    if (value === null) {
      if (prop.type !== 'object|null') problems.push(`${prop.path} is null but declared ${prop.type}`);
      continue;
    }
    if (!matchesType(value, prop.type)) {
      problems.push(`${prop.path} is ${describe(value)} but declared ${prop.type}`);
    }
  }

  const tiers = new Set(schema.tiers ?? []);
  for (const p of bundle.protectedAreas ?? []) {
    if (p.tier && !tiers.has(p.tier)) problems.push(`protectedAreas: unknown tier ${p.tier}`);
  }
  const confidences = new Set(schema.confidences ?? []);
  if (bundle.confidence && !confidences.has(bundle.confidence)) {
    problems.push(`confidence: unknown level ${bundle.confidence}`);
  }

  // Two invariants that make a bundle trustworthy rather than merely well-typed.
  if ((bundle.files ?? []).length === 0 && !bundle.emptyReason) {
    problems.push('files is empty but emptyReason is null — an empty context must say why');
  }
  for (const f of bundle.files ?? []) {
    if (!Array.isArray(f.why) || f.why.length === 0) {
      problems.push(`${f.path}: no reason recorded — every file must be explainable`);
    }
  }

  return { ok: problems.length === 0, problems };
}

function matchesType(value, type) {
  if (!type) return true;
  if (type.endsWith('|null')) return matchesType(value, type.slice(0, -5));
  if (type.endsWith('[]')) return Array.isArray(value);
  if (type === 'string') return typeof value === 'string';
  if (type === 'number') return typeof value === 'number';
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'object') return typeof value === 'object' && !Array.isArray(value);
  return true;
}

function describe(v) {
  if (Array.isArray(v)) return 'array';
  return v === null ? 'null' : typeof v;
}