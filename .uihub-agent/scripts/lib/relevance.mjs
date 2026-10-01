/**
 * Explainable file relevance — agent.md tasks 8.9, 8.10, 8.11, 8.32, 8.37, 8.38.
 *
 * Two rules shape this file.
 *
 * 1. NO FAKE PRECISION (8.9). agent.md forbids reporting "97.43% relevant" unless
 *    there is a real measurable basis. There is no such basis here, so a file
 *    gets a `score` — an integer used only for ORDERING — plus the list of
 *    `reasons` that produced it. The reasons are the output; the score is an
 *    implementation detail and is never presented as a percentage.
 *
 * 2. EVERY FILE EXPLAINS ITSELF (8.10). A relevance result you cannot debug is
 *    worse than no result, so `why` is mandatory on every entry and each reason
 *    names the concrete evidence — the file, the edge, the feature — rather than
 *    restating the task.
 *
 * Candidates are only ever drawn from the Phase 7 indexes, so a path that is not
 * indexed can never reach the context set by accident.
 */

import {
  intel, normTokens, stem, splitWords, STOPWORDS, GENERIC_TOKENS,
  outbound, inbound, pagesReaching, featureFiles,
} from './intel.mjs';
import { buildRoutingMatrix } from './router-matrix.mjs';

/* ------------------------------------------------------------------ *
 * Evidence weights
 *
 * These are ordering weights, not probabilities. They are deliberately
 * separated from the reasons that cite them so that tuning the order never
 * silently changes what counts as evidence.
 * ------------------------------------------------------------------ */

export const REASON_WEIGHTS = {
  EXPLICIT_PATH: 100,        // the developer named this exact file (8.30 fast path)
  EXACT_COMPONENT_NAME: 90,  // "TemplatePreview" matched a real component name
  COMPONENT_NAME_MATCH: 48, // a component name matched only some of the task words
  EXACT_SYMBOL_NAME: 85,     // a real symbol name was named
  SYMBOL_NAME_MATCH: 44,     // a symbol name matched only some of the task words
  FEATURE_OWNERSHIP: 60,     // the file belongs to a feature the task resolved
  ROUTE_RELATIONSHIP: 55,    // a route in the task reaches this file
  API_RELATIONSHIP: 50,      // an endpoint in the task reaches this file
  PATH_RELATIONSHIP: 45,     // same directory subtree as a resolved entity
  PAGE_RELATIONSHIP: 40,     // a page directly renders this file
  PAGE_REACHES_TRANSITIVELY: 14, // a page reaches it through a shared component
  IMPORT_DEPENDENCY: 30,     // this file imports something the task named
  REVERSE_DEPENDENCY: 25,    // a file the task named imports this file
  CATEGORY_SOURCE_ROOT: 20,  // the file sits in a source root this category owns
  PATH_SEGMENT_RARE: 38,     // a RARE directory segment in the task names this file
  PATH_SEGMENT: 32,          // a common task word names a segment of this path
  PROTECTED_DEPENDENCY: 15,  // a protected file depends on it — worth knowing early
  SHARED_SERVICE: 12,        // a service several resolved files use
};

export const PRIORITY = {
  P0: 'P0 — direct target',
  P1: 'P1 — direct dependency',
  P2: 'P2 — direct consumer',
  P3: 'P3 — shared service',
  P4: 'P4 — supporting knowledge',
  P5: 'P5 — optional context',
};

/**
 * Priority for a file, derived from the strongest reason it carries.
 * 8.38 fixes the order; it deliberately does not fix a maximum size.
 */
export function priorityFor(reasons) {
  const has = (k) => reasons.some((r) => r.kind === k);
  if (has('EXPLICIT_PATH') || has('EXACT_COMPONENT_NAME') || has('EXACT_SYMBOL_NAME')) return 'P0';
  if (has('IMPORT_DEPENDENCY') || has('API_RELATIONSHIP') || has('FEATURE_OWNERSHIP')
      || has('COMPONENT_NAME_MATCH') || has('SYMBOL_NAME_MATCH')) return 'P1';
  if (has('REVERSE_DEPENDENCY') || has('PAGE_RELATIONSHIP') || has('ROUTE_RELATIONSHIP') || has('PATH_SEGMENT_RARE')) return 'P2';
  if (has('SHARED_SERVICE') || has('PROTECTED_DEPENDENCY') || has('CATEGORY_SOURCE_ROOT')) return 'P3';
  return 'P5';
}

/**
 * Reasons that on their own justify putting a file in front of the agent.
 *
 * Path adjacency and source-root membership are deliberately NOT in this set.
 * Every component sits beside other components and inside its category's source
 * root, so those two reasons rank every file in a directory identically and
 * would fill the context with DontBeGreedyFooter.tsx and
 * InteriorDesignShowcase.tsx on a task about WebM previews. They remain
 * available as supporting reasons for a file that already qualified on real
 * evidence.
 */
const SUBSTANTIVE_KINDS = new Set([
  'EXPLICIT_PATH',
  'EXACT_COMPONENT_NAME',
  'EXACT_SYMBOL_NAME',
  'FEATURE_OWNERSHIP',
  'ROUTE_RELATIONSHIP',
  'API_RELATIONSHIP',
  'PAGE_RELATIONSHIP',
  'IMPORT_DEPENDENCY',
  'REVERSE_DEPENDENCY',
]);

function isSubstantive(reasons) {
  return reasons.some((r) => SUBSTANTIVE_KINDS.has(r.kind));
}

/** Explainable, orderable score. Never a percentage, never a probability. */
function scoreOf(reasons) {
  // Summed, not maxed: a file reachable four independent ways really is more
  // relevant than one reachable a single way, and the reasons list shows why.
  return reasons.reduce((n, r) => n + (REASON_WEIGHTS[r.kind] ?? 0), 0);
}

/* ------------------------------------------------------------------ *
 * Candidate collection
 * ------------------------------------------------------------------ */

/** Words in the task that are specific enough to match a file name. */
function searchableWords(task) {
  const out = new Set();
  for (const t of normTokens(task)) {
    const s = stem(t);
    if (s.length < 4) continue;
    if (STOPWORDS.has(s) || GENERIC_TOKENS.has(s)) continue;
    out.add(s);
  }
  return out;
}

/**
 * Build the candidate set with every reason attached.
 *
 * Candidates are accumulated in a Map keyed by path so a file found through four
 * routes keeps all four reasons and is emitted once (8.37). Deduplication is
 * therefore structural, not a post-hoc filter that might miss a case.
 */
export function buildCandidates(task, routing) {
  const ix = intel();
  const words = searchableWords(task);
  const byPath = new Map();
  // 8.30: when the task names a file, broad classification is explicitly not
  // wanted. Follow the graph from the named file instead of admitting the whole
  // feature it belongs to.
  const fastPath = (routing.entities.explicitFiles ?? []).length > 0;

  const add = (path, kind, why, extra = {}) => {
    if (!path) return;
    const rel = ix.roleByPath.has(path) ? path : null;
    // Only indexed files may enter context. An unknown path is reported by the
    // router as a missing entity instead of being loaded blindly.
    if (!rel) return;
    const entry = byPath.get(rel) ?? { path: rel, reasons: [], ...extra };
    if (!entry.reasons.some((r) => r.kind === kind && r.why === why)) {
      entry.reasons.push({ kind, why });
    }
    byPath.set(rel, entry);
  };

  // --- 8.30 explicit path fast path ---------------------------------
  for (const f of routing.entities.explicitFiles ?? []) {
    add(f.path, 'EXPLICIT_PATH',
      f.lines ? `task named this file directly (${f.lines} lines)` : 'task named this file directly');
  }

  // --- 8.32 exact component / symbol names ---------------------------
  // "Exact" is reserved for a match on the WHOLE name. A partial match — the
  // task said "auth middleware" and the component is "AuthBrandPanel" — is real
  // evidence but much weaker, and scoring it as exact let a frontend brand panel
  // outrank backend/src/middleware/auth.js on a backend task.
  for (const c of routing.entities.components ?? []) {
    const exact = c.strength === 'exact';
    add(c.path, exact ? 'EXACT_COMPONENT_NAME' : 'COMPONENT_NAME_MATCH',
      exact
        ? `component name "${c.name}" matched exactly`
        : `component name "${c.name}" matched the task words`,
      { component: c.name });
  }
  for (const s of routing.entities.symbols ?? []) {
    const exact = s.strength === 'exact';
    for (const loc of s.locations ?? []) {
      add(loc.file, exact ? 'EXACT_SYMBOL_NAME' : 'SYMBOL_NAME_MATCH',
        `symbol "${s.name}" is defined here`);
    }
  }
  for (const sv of routing.entities.services ?? []) {
    add(sv.path, 'EXACT_SYMBOL_NAME', `service "${sv.name}" is defined here`);
  }
  for (const hk of routing.entities.hooks ?? []) {
    add(hk.path, 'EXACT_SYMBOL_NAME', `hook "${hk.name}" is defined here`);
  }

  // --- 8.27 feature ownership ----------------------------------------
  // Skipped on the fast path: the named file's feature is `components`, and
  // admitting every file in it buried the file's actual consumers.
  if (!fastPath) {
    for (const slug of routing.featureCandidates ?? []) {
      for (const path of featureFiles(slug)) {
        add(path, 'FEATURE_OWNERSHIP', `belongs to the resolved feature "${slug}"`);
      }
    }
  } else {
    for (const f of routing.entities.explicitFiles ?? []) {
      if (f.feature) add(f.path, 'FEATURE_OWNERSHIP', `belongs to the feature "${f.feature}"`);
    }
  }

  // --- 8.29 route-aware ---------------------------------------------
  for (const r of routing.entities.routes ?? []) {
    const reach = r.kind === 'PAGE' ? (r.page?.path ? [r.page.path] : [])
      : r.kind === 'API_ENDPOINT' ? (r.endpoint?.handlers ?? []).map((h) => h.file ?? h).filter(Boolean)
        : [r.route?.file].filter(Boolean);
    for (const p of reach) add(p, 'ROUTE_RELATIONSHIP', `the task's route ${r.path} reaches this file`);
    // A page also pulls in the components it renders.
    if (r.kind === 'PAGE' && r.page?.path) {
      for (const p of pagesReaching(r.page.path)) add(p, 'PAGE_RELATIONSHIP', `rendered by the page ${r.page.path}`);
    }
  }

  // --- import / reverse-dependency relationships (8.9) ---------------
  // Seeds are the files the task already named. Following the graph from a
  // named file is what turns "TemplatePreview" into "the service it calls".
  const seeds = new Set([
    ...(routing.entities.explicitFiles ?? []).map((f) => f.path),
    ...(routing.entities.components ?? []).map((c) => c.path),
    ...(routing.entities.routes ?? []).flatMap((r) =>
      (r.kind === 'API_ENDPOINT' ? (r.endpoint?.handlers ?? []).map((h) => h.file ?? h) : [r.page?.path, r.route?.file])),
  ].filter(Boolean));

  for (const seed of seeds) {
    for (const edge of outbound(seed)) {
      if (edge.to) add(edge.to, 'IMPORT_DEPENDENCY', `imports ${edge.to} (dependency of ${seed})`);
      for (const imp of edge.imports ?? []) add(imp, 'IMPORT_DEPENDENCY', `imported by ${seed}`);
    }
    for (const edge of inbound(seed)) {
      if (edge.from) add(edge.from, 'REVERSE_DEPENDENCY', `${seed} depends on this file`);
    }
    // A page that renders ITSELF is not evidence — it is the same file. Without this
    // guard every page outranked the backend file it shares a name with, purely by
    // pointing at itself.
    //
    // Direct renders and transitive reaches are recorded separately: a page that
    // imports the file is genuinely where it shows up, while a page that reaches
    // it through a shared component is one hop away from dozens of pages, and
    // listing all of them buries the subject.
    for (const p of pagesReaching(seed, 'direct')) {
      if (p === seed) continue;
      add(p, 'PAGE_RELATIONSHIP', `a page renders this file (${p})`);
    }
    const directSet = new Set(pagesReaching(seed, 'direct'));
    for (const p of pagesReaching(seed)) {
      if (p === seed || directSet.has(p)) continue;
      add(p, 'PAGE_REACHES_TRANSITIVELY', `${p} renders this file through a shared component`);
    }
  }

  // --- path relationship: same subtree as a resolved entity ----------
  for (const seed of seeds) {
    const dir = seed.slice(0, seed.lastIndexOf('/'));
    for (const cand of siblingsInDir(dir, ix)) {
      add(cand, 'PATH_RELATIONSHIP', `sits beside ${seed} in ${dir || '(root)'}`);
    }
  }

  // --- 8.9 path segment match ------------------------------------------
  // A word in the task that literally appears in a file's path. This is the
  // only evidence kind that distinguishes a BACKEND file from a FRONTEND file
  // when both share a word: "auth middleware" must reach
  // backend/src/middleware/auth.js and not stop at AuthBrandPanel.tsx, and
  // nothing in either component or symbol index says "middleware".
  //
  // Deliberately not substantive on its own — a path word narrows, it does not
  // identify. A file qualifies only when combined with something stronger.
  const segmentTokens = new Map();
  // How many indexed files sit under each directory segment. A segment held by
  // only a handful of files identifies; `templates` (hundreds) merely narrows.
  const segmentDf = new Map();
  for (const p of ix.filePaths ?? []) {
    for (const seg of new Set(p.split('/').slice(0, -1))) {
      if (seg.length < 4) continue;
      segmentDf.set(seg, (segmentDf.get(seg) ?? 0) + 1);
    }
  }
  for (const w of words) {
    if (w.length < 4) continue;
    for (const p of ix.filePaths ?? []) {
      const tokens = pathTokensOf(p);
      if (!tokens.has(w)) continue;
      if (!segmentTokens.has(p)) segmentTokens.set(p, []);
      segmentTokens.get(p).push(w);
    }
  }
  for (const [p, hits] of segmentTokens) {
    const dirs = p.split('/').slice(0, -1);
    const rare = dirs.some((d) => hits.includes(d) && (segmentDf.get(d) ?? 0) <= RARE_SEGMENT_MAX);
    add(p, rare ? 'PATH_SEGMENT_RARE' : 'PATH_SEGMENT',
      `the task word${hits.length > 1 ? 's' : ''} ${hits.map((h) => `"${h}"`).join(', ')} name${hits.length > 1 ? '' : 's'} a segment of this path`);
  }

  // --- 8.9 category source roots -------------------------------------
  const matrix = buildRoutingMatrix();
  for (const category of routing.categories) {
    const roots = matrix.categories[category]?.sourceRoots ?? [];
    for (const root of roots) {
      for (const p of ix.filesUnder?.(root) ?? []) {
        add(p, 'CATEGORY_SOURCE_ROOT', `sits in the ${category} source root ${root}`);
      }
    }
  }

  // --- protected dependency (8.9 / 8.52) ----------------------------
  for (const area of routing.protectedAreas ?? []) {
    for (const edge of inbound(area.path ?? '')) {
      if (edge.from) add(edge.from, 'PROTECTED_DEPENDENCY', `a protected file (${area.path}) depends on this file`);
    }
  }

  return byPath;
}

/** A directory held by at most this many files identifies rather than narrows. */
const RARE_SEGMENT_MAX = 12;

/**
 * Words contained in a file path: directory names plus the camelCase-split
 * basename. Cached per path because `buildCandidates` compares every task word
 * against every indexed file.
 */
const pathTokenCache = new Map();
function pathTokensOf(p) {
  let set = pathTokenCache.get(p);
  if (set) return set;
  set = new Set();
  const parts = p.split('/');
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (i === parts.length - 1) {
      for (const t of splitWords(part.replace(/\.[a-z]+$/, ''))) if (t.length >= 4) set.add(t);
    } else if (part.length >= 4) {
      // A directory is a single concept: `templates`, not `temp`+`lates`.
      for (const t of splitWords(part)) if (t.length >= 4) set.add(t);
    }
  }
  pathTokenCache.set(p, set);
  return set;
}

/** Indexed files inside one directory. Small, and only used for seeded dirs. */
function siblingsInDir(dir, ix) {
  const prefix = dir ? `${dir}/` : '';
  const out = [];
  for (const p of ix.fileByPathKeys ?? ix.filePaths ?? []) {
    if (p.startsWith(prefix)) out.push(p);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Ranking
 * ------------------------------------------------------------------ */

/**
 * Rank candidates for a task (8.9 / 8.10 / 8.38).
 *
 * `maxFiles` is deliberately NOT a fixed cap. 8.43 forbids an arbitrary
 * universal maximum; the caller passes a budget and the caller decides.
 */
export function rankFiles(task, routing, { maxFiles = 25, minScore = 12 } = {}) {
  const byPath = buildCandidates(task, routing);

  const scored = [];
  for (const entry of byPath.values()) {
    if (!isSubstantive(entry.reasons)) continue;
    const score = scoreOf(entry.reasons);
    if (score < minScore) continue;
    // Strongest evidence first, so a truncated view still leads with the real
    // reason rather than with a "sits beside ..." line.
    entry.reasons.sort((a, b) => (REASON_WEIGHTS[b.kind] ?? 0) - (REASON_WEIGHTS[a.kind] ?? 0));
    const role = intel().roleByPath.get(entry.path);
    scored.push({
      path: entry.path,
      score,
      priority: priorityFor(entry.reasons),
      role: role?.role ?? null,
      feature: role?.feature ?? null,
      lines: role?.lines ?? null,
      tier: entry.tier ?? 'NORMAL',
      component: entry.component ?? null,
      reasons: entry.reasons,
      why: entry.reasons.map((r) => r.why),
    });
  }

  // Deterministic order: score desc, then priority, then path. Two runs on the
  // same task must produce byte-identical bundles.
  const ORDER = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5'];
  scored.sort((a, b) =>
    b.score - a.score
    || ORDER.indexOf(a.priority) - ORDER.indexOf(b.priority)
    || a.path.localeCompare(b.path));

  return {
    files: scored.slice(0, maxFiles),
    totalCandidates: scored.length,
    truncated: scored.length > maxFiles,
  };
}

/**
 * 8.11 initial context set, plus 8.32 ordering — the small starting set the
 * agent should read before touching source.
 */
export function initialContext(task, routing, opts = {}) {
  const { files, totalCandidates, truncated } = rankFiles(task, routing, opts);

  // 8.10: a result you cannot explain is worse than no result. When nothing
  // qualified, say so and say why, instead of returning an empty array that
  // reads like a silent failure.
  //
  // This happens for real. "Fix an XSS vulnerability in the comment renderer"
  // resolves the SECURITY category correctly, but this repository has no
  // component, service, hook, feature or symbol whose name contains "comment"
  // — so there is genuinely no file to open, only the security knowledge to
  // read. Inventing a near-match would be worse than admitting it.
  const emptyReason = files.length === 0
    ? {
      why: 'no indexed file matched this task',
      searchedTerms: routing.evidence?.searchedTerms ?? [],
      note: routing.categories.includes('UNKNOWN')
        ? 'the task was too vague to resolve a subsystem; narrow it or name a file'
        : 'the category resolved but this repository has no file matching the named concepts',
      knowledgeAvailable: (routing.knowledge ?? []).length,
    }
    : null;

  return {
    files,
    totalCandidates,
    truncated,
    emptyReason,
    knowledge: routing.knowledge ?? [],
    protectedAreas: routing.protectedAreas ?? [],
  };
}

const SUBSTANTIVE_KINDS_SET = new Set([
  'EXPLICIT_PATH',
  'EXACT_COMPONENT_NAME',
  'COMPONENT_NAME_MATCH',
  'EXACT_SYMBOL_NAME',
  'SYMBOL_NAME_MATCH',
  'PATH_SEGMENT_RARE',
  'FEATURE_OWNERSHIP',
  'ROUTE_RELATIONSHIP',
  'API_RELATIONSHIP',
  'PAGE_RELATIONSHIP',
  'IMPORT_DEPENDENCY',
  'REVERSE_DEPENDENCY',
]);

export { SUBSTANTIVE_KINDS_SET as SUBSTANTIVE_KINDS, searchableWords, scoreOf };