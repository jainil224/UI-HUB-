/**
 * Task classifier — the classification contract.
 *
 * The contract in tasks/TASK_ROUTER.md:
 *
 *   classify(task) → { task, intent, categories, surface, confidence,
 *                      featureCandidates, initialIndexes, entities, evidence }
 *
 * the classification-evidence contract says "Do NOT classify purely by keyword", and that single
 * sentence is the reason this module is shaped the way it is.
 *
 * A naive router matches "preview" against a TEMPLATE keyword list and calls it
 * a day. Here, a keyword only nominates a candidate. The candidate must survive
 * the index: a feature slug, route, endpoint, file path, symbol, service, hook,
 * role or integration has to actually resolve. Only then does the category earn
 * confidence.
 *
 * Two further rules earn their keep, both learned from the first implementation
 * returning all sixteen categories for every task:
 *
 *   - Evidence is only ever collected from entities the TASK referenced. Seeding
 *     the candidate set with the whole index makes every category look proven.
 *   - A word that appears in a large fraction of an index is not evidence. "page"
 *     appears in eleven features and identifies none of them.
 *
 * Every category in the result carries `strong` / `weak` signal lists, and
 * `strong` is what allows HIGH. Weak-only categories cap at MEDIUM, and a task
 * with no strong signal at all returns UNKNOWN / LOW per the UNKNOWN-handling contract.
 */

import {
  intel, normName, normTokens, identifierTokens, routeTokens, filePathTokens,
  isDistinctive, tokenStats, distinctiveTerms,
  resolveTaskFeatures, resolveComponents, resolveSymbols, resolveRoute,
  resolveFilePath, resolveServices, resolveHooks, featureFiles, resolveNearMisses,
  STOPWORDS, stem, aliasTerms, splitWords,
} from './intel.mjs';
import {
  CATEGORIES, CATEGORY_NAMES, INTENTS, INTENT_NAMES, ROLE_SURFACE, PATH_SURFACE,
  buildRoutingMatrix, HIGH_CAUTION_CATEGORIES,
} from './router-matrix.mjs';
import { detectProtected } from './protected.mjs';

const lower = (s) => String(s).toLowerCase();

/** Match a word or short phrase from a category's weak list against task text. */
function phraseHit(text, phrase) {
  const p = lower(phrase);
  if (/\s/.test(p)) return text.includes(p);
  if (p.length <= 3) return new RegExp(`\\b${p}\\b`, 'i').test(text);
  return new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(text);
}

const dedupe = (list) => [...new Set(list)];

/**
 * Categories that qualify a subsystem rather than being one. They may be added
 * alongside a resolved subsystem but never stand alone.
 */
const OVERLAY_CATEGORIES = ['PERFORMANCE', 'TESTING'];

/** Did the task hand us a literal path for this identifier? */
function evExplicitPath(paths, ident) {
  return paths.some((p) => p.toLowerCase().includes(ident.toLowerCase()));
}

/* ------------------------------------------------------------------ *
 * 8.4 — Intent, determined separately from category.
 *
 * Intent comes from the verb, not the noun. "Why is preview slow?" and "Fix
 * preview loading" name the same subsystem and differ in intent, which is
 * exactly the split the surface-split contract asks for.
 * ------------------------------------------------------------------ */

export function classifyIntent(task) {
  const text = lower(task);
  const scores = [];
  for (const name of INTENT_NAMES) {
    let n = 0;
    for (const w of INTENTS[name].words) if (phraseHit(text, w)) n += 1;
    if (n > 0) scores.push({ intent: name, hits: n });
  }
  if (scores.length === 0) return { intent: 'MODIFY', why: 'no intent verb matched; assumed MODIFY' };

  scores.sort((a, b) => b.hits - a.hits);
  const top = scores[0];
  // DEBUG and INVESTIGATE both carry interrogatives. When they tie, prefer
  // INVESTIGATE: it asks for understanding, DEBUG presumes a fix is coming.
  if (top.intent === 'DEBUG' && scores.some((s) => s.intent === 'INVESTIGATE' && s.hits === top.hits)) {
    return { intent: 'INVESTIGATE', why: 'interrogative with no fix verb — treating as investigation' };
  }
  return { intent: top.intent, why: `${top.hits} intent verb(s) matched` };
}

/* ------------------------------------------------------------------ *
 * 8.5 — Surface
 * ------------------------------------------------------------------ */

export function classifySurface(roles, paths, categories) {
  const surfaces = new Set();

  for (const r of roles) {
    const s = ROLE_SURFACE[r];
    if (s && s !== 'UNKNOWN') surfaces.add(s);
  }
  if (surfaces.size === 0) {
    for (const p of paths) {
      for (const rule of PATH_SURFACE) {
        if (rule.re.test(p)) { surfaces.add(rule.surface); break; }
      }
    }
  }
  for (const c of categories) {
    for (const s of CATEGORIES[c]?.surfaces ?? []) surfaces.add(s);
  }

  const list = [...surfaces].filter((s) => s !== 'UNKNOWN').sort();
  if (list.length === 0) return { surface: ['UNKNOWN'], why: 'no indexed role, path, or category implied a surface' };
  if (list.length > 1) return { surface: list, why: `${list.length} surfaces implicated by resolved evidence` };
  return { surface: list, why: 'single surface from resolved evidence' };
}

/* ------------------------------------------------------------------ *
 * Signal collection
 * ------------------------------------------------------------------ */

/**
 * Gather every entity the task points at. This is the ONLY evidence source for
 * strong category signals.
 */
function collectEntities(task) {
  const text = String(task);
  const low = lower(text);
  const ix = intel();

  // The sentence's first word is capitalised by grammar, not because it is a
  // symbol. "Change the TemplateCard design" must not search the index for a
  // component called `Change`, and it did, until this was excluded.
  const sentenceStart = lower(text.trim().split(/\s+/)[0] ?? '');
  const identifiers = identifierTokens(text).filter(
    (id) => lower(id) !== sentenceStart || text.trim().split(/\s+/).length === 1,
  );

  const paths = filePathTokens(text).map((p) => p.replace(/\\/g, '/'));
  const routeStrings = routeTokens(text).map((r) => r.trim());

  // 8.30 fast path: an explicit repository path is the strongest signal there
  // is. An experienced developer naming a file does not need the whole map.
  const explicitFiles = paths.map((p) => resolveFilePath(p)).filter(Boolean);

  // A path or route the task names but the index does not have is a FINDING, not
  // noise. Discarding it silently made "Fix frontend/src/components/templates/
  // TemplateCard.tsx" fall through to a keyword search for "template", which
  // resolved TEMPLATE + COMPONENT from other files and reported HIGH confidence
  // for a file that does not exist — fifty files of confident wrong context.
  // The token is kept here and surfaced as `unresolvedTargets` so classification
  // can discount the confidence the leftover keywords appear to justify.
  const unresolvedTargets = [
    ...paths.filter((p) => !resolveFilePath(p)).map((p) => ({ kind: 'PATH', asked: p, near: nearFiles(p) })),
    ...routeStrings.filter((r) => !resolvedRouteHit(r)).map((r) => ({ kind: 'ROUTE', asked: r, near: nearRoutes(r) })),
  ];

  // 8.30 fast path, part 1: when the task names real files, broad
  // classification is explicitly not wanted. Searching the task's other words
  // against 227 components put BuildWithUIHubUsedComponents and
  // TemplateCodeViewer at P0 on top of the file the developer actually named.
  const fastPath = explicitFiles.length > 0;

  // Terms worth searching: real identifiers, then distinctive free words, then
  // adjacent word pairs (so "template card" beats "card" alone).
  const words = normTokens(text);
  const distinctive = fastPath ? [] : distinctiveTerms(text);
  const pairs = [];
  if (!fastPath) {
    for (let i = 0; i + 1 < words.length; i += 1) {
      const a = stem(words[i]);
      const b = stem(words[i + 1]);
      if (a.length >= 3 && b.length >= 3 && !STOPWORDS.has(a) && !STOPWORDS.has(b)) pairs.push(`${a} ${b}`);
    }
  }
  const terms = fastPath ? [] : dedupe([...identifiers, ...pairs, ...distinctive, ...aliasTerms(text)]);

  const featureHits = fastPath
    ? dedupe(explicitFiles.map((f) => f.feature).filter(Boolean))
      .map((feature) => ({ feature, how: 'the named file belongs to it', terms: [] }))
    : resolveTaskFeatures(terms);
  const featureCandidates = featureHits.map((f) => f.feature);

  const components = [];
  const symbols = [];
  const services = [];
  const hooks = [];
  const resolvedRoutes = [];

  for (const term of terms) {
    for (const hit of resolveComponents(term)) components.push({ ...hit, term });
    const s = resolveSymbols(term);
    if (s) for (const n of s.names) symbols.push({ name: n, term, how: s.how, locations: s.entry.locations });
    for (const sv of resolveServices(term)) services.push({ ...sv, term });
    for (const hk of resolveHooks(term)) hooks.push({ ...hk, term });
    const r = resolveRoute(term);
    if (r) resolvedRoutes.push({ ...r, term });
  }
  for (const r of routeStrings) {
    const hit = resolveRoute(r);
    if (hit) resolvedRoutes.push({ ...hit, term: r });
  }

  // Integrations count only when the task actually names the package or a
  // readable form of the slug ("Razorpay", "firebase", "upstash-redis").
  const integrations = new Set();
  for (const integ of ix.integrations.integrations) {
    const pretty = integ.name.replace(/-/g, ' ');
    if (low.includes(integ.name) || low.includes(pretty)) integrations.add(integ.name);
    for (const pkg of integ.packageNames ?? []) {
      if (low.includes(pkg.toLowerCase())) integrations.add(integ.name);
    }
  }

  const mcpTools = new Set();
  for (const t of ix.api.mcpTools ?? []) {
    if (t.name && low.includes(t.name.toLowerCase().replace(/_/g, ''))) mcpTools.add(t.name);
  }

  // Identifiers that resolved to nothing. These are reported rather than
  // silently dropped: a task naming a component that does not exist is a real
  // finding, and guessing at the nearest name would hide it.
  const nearMisses = [];
  for (const ident of identifiers) {
    const resolved = components.some((c) => c.component.name === ident)
      || symbols.some((s) => s.name === ident)
      || evExplicitPath(paths, ident);
    if (resolved) continue;
    // Only camelCase/PascalCase identifiers get a near miss. A plain capitalised
    // word like "Render" is an English word that happens to start a sentence or
    // name a platform — reporting "Render does not exist, nearest is
    // renderKV/LazyRenderer/renderCanvas" is noise, not help. A name with an
    // internal capital is what a developer means as a symbol.
    if (!/[a-z][A-Z]/.test(ident)) continue;
    for (const nm of resolveNearMisses(ident)) {
      nearMisses.push({ asked: ident, found: nm.name, relation: nm.relation, locations: nm.locations });
    }
  }

  // Roles come only from entities the task resolved.
  const roles = new Set();
  const entityPaths = dedupe([
    ...explicitFiles.map((f) => f.path),
    ...components.map((c) => c.component.path),
    ...services.map((s) => s.service.path),
    ...hooks.map((h) => h.hook.path),
    ...resolvedRoutes.flatMap((r) => {
      if (r.kind === 'PAGE') return [r.page.path];
      if (r.kind === 'API_ENDPOINT') return r.endpoint.handlers;
      if (r.kind === 'ROUTE' && r.route.componentFile) return [r.route.componentFile];
      return [];
    }),
  ]);
  for (const p of entityPaths) {
    const r = ix.roleByPath.get(p)?.role;
    if (r) roles.add(r);
  }

  return {
    identifiers, paths, routeStrings, terms, words, distinctive,
    explicitFiles, featureHits, featureCandidates,
    components, symbols, services, hooks, resolvedRoutes,
    integrations, mcpTools, roles, entityPaths, nearMisses, unresolvedTargets,
    distinctiveNote: explainNonDistinctive(words),
  };
}

/** Did this route string resolve to something the index actually records? */
function resolvedRouteHit(route) {
  return resolveRoute(route) !== null;
}

/**
 * Real files near a path the task named but the index does not have.
 *
 * Deliberately structural, not fuzzy. The candidates are ranked by the two things
 * that actually indicate a typo — same directory, and the same leaf name appearing
 * elsewhere in the tree — so "TemplateCard.tsx" can be answered with "no such
 * file; the templates directory holds registry.ts, TemplateCodeViewer.tsx and
 * seven other files" without ever guessing an edit distance.
 */
function nearFiles(path) {
  const ix = intel();
  const dir = path.slice(0, path.lastIndexOf('/')) || '.';
  const leaf = path.slice(path.lastIndexOf('/') + 1);
  const stem = leaf.replace(/\.[A-Za-z0-9]+$/, '');
  const sameDir = [...ix.roleByPath.keys()].filter((p) => p.startsWith(`${dir}/`) && p !== path);
  const sameLeaf = stem.length >= 3
    ? [...ix.roleByPath.keys()].filter((p) => p !== path && p.slice(p.lastIndexOf('/') + 1).replace(/\.[A-Za-z0-9]+$/, '') === stem)
    : [];
  const out = [];
  for (const p of [...sameLeaf, ...sameDir]) {
    if (out.includes(p)) continue;
    out.push(p);
    if (out.length >= 8) break;
  }
  return out;
}

/** Say plainly that a named target is absent, and what exists nearby instead. */
function describeUnresolvedTargets(targets) {
  return targets.map((t) => {
    const where = t.kind === 'ROUTE' ? 'route' : 'file';
    return t.near.length > 0
      ? `no such ${where} "${t.asked}"; the repository has ${t.near.slice(0, 5).join(', ')}`
      : `no such ${where} "${t.asked}"`;
  });
}

/** Real routes near a route the task named but the index does not record. */
function nearRoutes(route) {
  const ix = intel();
  const want = route.replace(/^\/+/, '').split('/').filter(Boolean);
  const out = [];
  for (const group of [ix.api?.endpoints ?? {}, ix.routes?.routes ?? {}]) {
    for (const p of Object.keys(group ?? {})) {
      const have = p.replace(/^\/+/, '').split('/').filter(Boolean);
      const shared = have.filter((seg, i) => seg === want[i]).length;
      if (shared === 0) continue;
      if (!out.includes(p)) out.push(p);
    }
  }
  return out.slice(0, 8);
}

/**
 * Why a free word was not used to resolve an entity.
 *
 * Two very different reasons collapse into one bad message if you only ask
 * `isDistinctive`: a word can be too GENERIC ("button" appears in 15 component
 * names) or simply ABSENT from the index ("slowly" appears in none). Telling a
 * reader that an absent word is "too common" is backwards — it sends them
 * looking for a frequency problem that does not exist.
 */
function explainNonDistinctive(words) {
  const stats = tokenStats();
  const notes = [];
  for (const w of words) {
    if (w.length < 4) continue;
    if (isDistinctive(w, 'components') || isDistinctive(w, 'features') || isDistinctive(w, 'symbols')) continue;
    const counts = ['components', 'features', 'symbols']
      .map((k) => stats[k].freq.get(w))
      .filter((n) => typeof n === 'number');
    if (counts.length === 0) {
      notes.push(`"${w}" appears in no indexed component, feature or symbol name`);
    } else {
      const best = Math.min(...counts);
      const limit = stats.components.limit;
      notes.push(`"${w}" is too common on its own (matches ${best} indexed names, limit ${limit})`);
    }
  }
  return notes;
}

/* ------------------------------------------------------------------ *
 * Category scoring (8.2 / 8.3)
 * ------------------------------------------------------------------ */

function scoreCategory(category, ev) {
  const def = CATEGORIES[category];
  const s = def.strong;
  const strong = [];
  const weak = [];

  for (const feat of s.features ?? []) {
    const hit = ev.featureHits.find((f) => f.feature === feat);
    if (hit) strong.push(`task resolves feature "${feat}" (${hit.how})`);
  }
  for (const role of s.roles ?? []) {
    if (ev.roles.has(role)) {
      const one = ev.entityPaths.find((p) => ev.roles.has(role) && intel().roleByPath.get(p)?.role === role);
      strong.push(`resolved file has indexed role ${role}${one ? ` (${one})` : ''}`);
    }
  }
  for (const integ of s.integrations ?? []) {
    if (ev.integrations.has(integ)) strong.push(`task names integration "${integ}", present in INTEGRATION_MAP`);
  }
  for (const tool of s.tools ?? []) {
    if (ev.mcpTools.has(tool)) strong.push(`task names MCP tool "${tool}", present in API_MAP`);
  }
  for (const p of s.paths ?? []) {
    for (const f of ev.paths) {
      if (new RegExp(p).test(f)) { strong.push(`explicit path ${f} matches /${p}/`); break; }
    }
  }

  // A named CONCEPT is strong evidence even when it names no indexed file.
  //
  // SECURITY, DOCUMENTATION and TESTING have little or no surface in the
  // component/service indexes — an XSS bug or a flaky test lives in code whose
  // names give nothing away. Without this, "Fix an XSS vulnerability in the
  // comment renderer" and "Add a test for the payment service" both fell through
  // to UNKNOWN. These are hand-verified concept names, not guesses, and the
  // evidence line says so explicitly.
  for (const c of s.concepts ?? []) {
    if (phraseHit(lower(ev.original ?? ''), c)) strong.push(`task names the concept "${c}"`);
  }

  for (const w of def.weak.words ?? []) {
    if (phraseHit(lower(ev.original ?? ''), w)) weak.push(`task text contains "${w}"`);
  }
  for (const p of def.weak.paths ?? []) {
    for (const f of ev.paths) {
      if (new RegExp(p).test(f)) { weak.push(`explicit path ${f} matches /${p}/`); break; }
    }
  }

  return { category, strong: dedupe(strong), weak: dedupe(weak) };
}

/* ------------------------------------------------------------------ *
 * 8.2 / 8.3 / 8.6 — the main entry point
 * ------------------------------------------------------------------ */

export function classify(task) {
  const low = lower(task);
  const ev = collectEntities(task);
  ev.original = low;

  const scored = [];
  for (const category of CATEGORY_NAMES) {
    const r = scoreCategory(category, ev);
    if (r.strong.length > 0 || r.weak.length > 0) scored.push(r);
  }
  scored.sort((a, b) => b.strong.length - a.strong.length || b.weak.length - a.weak.length || a.category.localeCompare(b.category));

  const strongCount = scored.filter((s) => s.strong.length > 0).length;
  const resolvedCount =
    ev.components.length + ev.services.length + ev.hooks.length +
    ev.explicitFiles.length + ev.featureCandidates.length +
    ev.resolvedRoutes.filter((r) => r.how.endsWith('exact')).length;

  let confidence;
  let confidenceWhy;
  if (strongCount === 0) {
    confidence = 'LOW';
    confidenceWhy = resolvedCount === 0
      ? 'no indexed entity resolved from the task wording'
      : 'only wording matched; no category rule was confirmed by the index';
  } else if (resolvedCount >= 2) {
    confidence = 'HIGH';
    confidenceWhy = `${resolvedCount} indexed entities resolved and ${strongCount} category/categories confirmed`;
  } else {
    confidence = 'MEDIUM';
    confidenceWhy = `exactly one indexed entity resolved (${resolvedCount}); a single confirmed signal`;
  }

  // A task that named a concrete target the repository does not contain is not
  // confidently resolved, whatever its other words happened to match. "Fix
  // .../TemplateCard.tsx" resolved TEMPLATE from the word "template" and reached
  // HIGH with fifty files, none of them the file that was asked for. The
  // category evidence is still reported — it may genuinely be relevant — but the
  // confidence it can justify is capped, because the strongest signal in the task
  // went unmatched.
  if (ev.unresolvedTargets.length > 0) {
    const asked = ev.unresolvedTargets.map((t) => `${t.kind.toLowerCase()} "${t.asked}"`).join(', ');
    confidence = confidence === 'HIGH' ? 'MEDIUM' : 'LOW';
    confidenceWhy = `${asked} does not exist in this repository; `
      + `the remaining category evidence comes only from the task's other words. ${confidenceWhy}`;
  }

  const entities = {
    components: ev.components.map((c) => ({
      name: c.component.name, path: c.component.path, feature: c.component.feature,
      how: c.how, strength: c.strength, matched: c.term,
    })),
    services: ev.services.map((s) => ({
      name: s.service.name, path: s.service.path, feature: s.service.feature,
      how: s.how, strength: s.strength, matched: s.term,
    })),
    hooks: ev.hooks.map((h) => ({
      name: h.hook.name, path: h.hook.path, feature: h.hook.feature,
      how: h.how, strength: h.strength, matched: h.term,
    })),
    symbols: ev.symbols,
    routes: ev.resolvedRoutes.map((r) => ({
      kind: r.kind, path: r.path, term: r.term, how: r.how,
target: r.kind === 'PAGE' ? r.page.path
         : r.kind === 'API_ENDPOINT' ? r.endpoint.handlers
         : r.route?.componentFile ?? null,
       // Exposed as its own field rather than left under `endpoint`, which is
       // dropped by this mapping: expansion reads handler files from here, and
       // reading `r.endpoint.handlers` off the public entity always yielded
       // undefined, which silently disabled the API_DEPENDENCY trigger.
       handlers: r.kind === 'API_ENDPOINT' ? r.endpoint.handlers
         : r.kind === 'PAGE' ? [r.page.path]
         : r.route?.componentFile ? [r.route.componentFile] : [],
     })),
    explicitFiles: ev.explicitFiles.map((f) => ({
      path: f.path, role: f.role, feature: f.feature, importers: f.importers,
    })),
    features: ev.featureHits,
  };

  const intent = classifyIntent(task);

  /* --- 8.35 / 8.49: honest UNKNOWN ---------------------------------- */
  if (strongCount === 0) {
    // An unresolved identifier alongside zero category evidence is the exact
    // shape of the `TemplateCard` case in the non-existent-identifier contract. That is still an
    // UNKNOWN classification — the named thing does not exist — but it carries
    // the near miss so the caller is not left with nothing.
    const unidentified = ev.nearMisses.length
      ? [`${[...new Set(ev.nearMisses.map((n) => n.asked))].join(', ')} does not exist in this repository; nearest real name is ${[...new Set(ev.nearMisses.map((n) => n.found))].join(', ')}`]
      : [];

    return {
      task,
      intent,
      categories: ['UNKNOWN'],
      surface: ['UNKNOWN'],
      confidence: 'LOW',
      confidenceWhy,
      featureCandidates: ev.featureCandidates,
      initialIndexes: [],
      candidates: scored.map((s) => ({ category: s.category, strong: s.strong, weak: s.weak })),
      entities,
      knowledge: [],
      protectedAreas: [],
      validation: [],
      sourceRoots: [],
      highCaution: false,
      highCautionReason: null,
      ownerActionRequired: false,
      ownerActionReasons: [],
      fastPath: ev.explicitFiles.length > 0,
      evidence: {
        searchedTerms: ev.terms,
        ignoredAsTooCommon: ev.distinctiveNote,
        nearMisses: ev.nearMisses,
        unresolvedTargets: ev.unresolvedTargets,
        resolvedRoles: [...ev.roles].sort(),
      },
      unknown: {
        state: true,
        why: confidenceWhy,
        askedForNarrowing: true,
        suggestion: [
          ...unidentified,
          ...describeUnresolvedTargets(ev.unresolvedTargets),
          ...describeNarrowing(task),
        ],
      },
    };
  }

  /* --- 8.36: keep only categories with strong evidence --------------- */
  let categories = scored.filter((s) => s.strong.length > 0).map((s) => s.category);

  // PERFORMANCE and TESTING name a quality axis and a discipline, not a
  // subsystem. They are added as overlays when a real subsystem is also
  // resolved, so "Optimize template search" yields TEMPLATE + PERFORMANCE and
  // "Add a test for the payment service" yields PAYMENT + TESTING, while a bare
  // "make it faster" or "improve the weird loading thing" stays UNKNOWN.
  const subsystems = categories.filter((c) => !OVERLAY_CATEGORIES.includes(c));
  for (const overlay of OVERLAY_CATEGORIES) {
    const s = scored.find((x) => x.category === overlay);
    if (s?.weak.length && subsystems.length) categories = [...new Set([...categories, overlay])];
  }
  if (subsystems.length === 0) categories = categories.filter((c) => !OVERLAY_CATEGORIES.includes(c));
  if (categories.length === 0) categories = ['UNKNOWN'];

  const surface = classifySurface(ev.roles, [...ev.paths, ...ev.entityPaths], categories);
  const matrix = buildRoutingMatrix();
  const defs = categories.map((c) => matrix.categories[c]).filter(Boolean);

  const initialIndexes = dedupe(defs.flatMap((d) => d.primaryIndexes));
  const ownerDefs = defs.filter((d) => d.ownerActionRequired);

  // 8.21-8.26 / 8.52: protected detection lives in one place, backed by the
  // parsed PROTECTED_PATHS.md, so the router and the bundle cannot disagree
  // about what is protected or which tier it is.
  const protectedInfo = detectProtected(categories, ev.entityPaths);
  const { highCaution, highCautionReason } = protectedInfo;

  return {
    task,
    intent,
    categories,
    surface: surface.surface,
    confidence,
    confidenceWhy,
    featureCandidates: ev.featureCandidates,
    initialIndexes,
    fastPath: ev.explicitFiles.length > 0,
    candidates: scored.map((s) => ({ category: s.category, strong: s.strong, weak: s.weak })),
    entities,
    knowledge: dedupe(defs.flatMap((d) => d.knowledge)),
    protectedAreas: protectedInfo.areas,
    validation: dedupe(defs.flatMap((d) => d.requiredValidation)),
    sourceRoots: dedupe(defs.flatMap((d) => d.sourceRoots)),
    highCaution,
    highCautionReason,
    ownerActionRequired: ownerDefs.length > 0,
    ownerActionReasons: dedupe(ownerDefs.map((d) => d.ownerActionReason).filter(Boolean)),
    evidence: {
      searchedTerms: ev.terms,
      ignoredAsTooCommon: ev.distinctiveNote,
      nearMisses: ev.nearMisses,
      unresolvedTargets: ev.unresolvedTargets,
      resolvedRoles: [...ev.roles].sort(),
      surfaceWhy: surface.why,
      fastPathReason: ev.explicitFiles.length
        ? `explicit file path given: ${ev.explicitFiles.map((f) => f.path).join(', ')}`
        : null,
    },
  };
}

/* ------------------------------------------------------------------ *
 * 8.49 — router fallback.
 *
 * "Could not confidently classify" is answered with candidate AREAS derived
 * from the index, never with a guess and never by scanning the repository.
 * ------------------------------------------------------------------ */

export function describeNarrowing(task, ix = intel()) {
  const areas = [];
  const low = lower(task);

  // Which features even mention the distinctive words in the task?
  const words = distinctiveTerms(task);
  const stats = tokenStats().features;
  const scored = [];
  for (const f of ix.features.features) {
    const toks = normTokens(f.feature);
    const overlap = toks.filter((t) => words.includes(t) && stats.distinct.has(t));
    if (overlap.length > 0) scored.push({ feature: f.feature, overlap: overlap.length, files: f.files });
  }
  scored.sort((a, b) => b.overlap - a.overlap || b.files - a.files);
  for (const s of scored.slice(0, 5)) areas.push(`feature "${s.feature}" (${s.files} files) shares the word "${s.overlapWord ?? normTokens(s.feature).find((t) => words.includes(t))}"`);

  // Which symbols do the distinctive words reach?
  const symHits = [];
  for (const w of words) {
    const names = ix.byNormName.get(normName(w)) ?? [];
    if (names.length) symHits.push(`symbol ${names.slice(0, 3).join(', ')}`);
  }
  for (const h of symHits.slice(0, 3)) areas.push(`${h} — SYMBOL_INDEX`);

  if (/\b(slow|slower|performance|latency|lag|optimi[sz])\b/.test(low)) areas.push('performance-sensitive components — no specific owner identified');
  if (/\b(api|endpoint)\b/.test(low)) areas.push('backend HTTP surface — API_MAP');
  if (/\bpage\b/.test(low)) areas.push('frontend pages — PAGE_MAP');

  return areas.length
    ? areas
    : ['no index area shares vocabulary with the task — a human should name the subsystem or a file'];
}