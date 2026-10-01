/**
 * Intelligence access layer — agent.md task 8.16.
 *
 * Everything in Phase 8 reads the codebase through this module. It is a thin
 * facade over `query-index.mjs`, which owns the Phase 7 indexes and is the ONLY
 * thing that parses them. agent.md 8.16 is explicit:
 *
 *   "Do not create a second independent indexing engine."
 *
 * So this file adds no parsing, no graph building, and no inference of its own.
 * What it adds is the vocabulary the router needs — normalised names, lookups
 * that tolerate casing and separators, knowledge-file existence checks, and a
 * cheap freshness signal.
 *
 * Every lookup is intentionally total: it returns an empty result rather than
 * throwing, because "the router found nothing" is a normal, reportable outcome
 * (agent.md 8.35 UNKNOWN handling), not an error.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { queries, load, ROOT, AGENT_DIR, slash, impactOf } from '../query-index.mjs';
import { discover } from './walk.mjs';

export { ROOT, AGENT_DIR, slash, impactOf };

/* ------------------------------------------------------------------ *
 * Normalisation
 *
 * agent.md 8.28 requires `TemplateCard`, `template card`, `template-card` and
 * "card for templates" to reach the same component, and 8.3 forbids classifying
 * on keywords alone. Both are satisfied by the same trick: reduce every spelling
 * of an identifier to one canonical token form before matching it against index
 * keys. Matching then happens against REAL symbols, not against prose.
 * ------------------------------------------------------------------ */

/** `TemplateCard`, `template_card`, `template-card` → `templatecard`. */
export function normName(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/** Split a phrase into normalised word tokens: `template card` → `['template','card']`. */
export function normTokens(s) {
  return String(s)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Word tokens WITH camelCase/PascalCase boundaries respected.
 *
 * `normTokens('TemplateSimilarRail')` returns `['templatesimilarrail']` — one
 * useless token — because it only splits on non-alphanumerics. Component,
 * service and hook matching has to see `template`, `similar` and `rail`
 * separately, or the word "template" in a task can never reach a component
 * whose name merely *contains* it.
 */
export function splitWords(s) {
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** PascalCase/camelCase runs: `Fix TemplateCard webm` → `['TemplateCard']`. */
export function identifierTokens(s) {
  return String(s).match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? [];
}

/** Route-ish strings: `/api/v1/templates`, `/admin/mcp/health`. */
export function routeTokens(s) {
  return String(s).match(/(?:^|\s)(\/[A-Za-z0-9_\-/:.$*{}[\]]*)/g) ?? [];
}

/** Repository file paths, with or without a leading `./`. */
export function filePathTokens(s) {
  return String(s).match(/(?:\.{0,2}\/)?(?:[A-Za-z0-9_\-]+\/)+[A-Za-z0-9_\-.!]+\.[A-Za-z0-9]+/g) ?? [];
}

/* ------------------------------------------------------------------ *
 * Stopwords and token informativeness
 *
 * The first version of the router fed every whitespace token into the index.
 * "the" then matched 40 component paths and the classifier confidently returned
 * all sixteen categories for every task, which is the precise failure
 * agent.md 8.3 forbids ("Do NOT classify purely by keyword").
 *
 * The fix is not a longer stopword list. It is to ask, for each word, how much
 * it actually narrows the search: a token that appears in a quarter of all
 * component names carries no information about which component is meant, and
 * treating it as evidence is what produced the noise.
 * ------------------------------------------------------------------ */

export const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'our',
  'you', 'are', 'was', 'were', 'has', 'have', 'had', 'not', 'but', 'can',
  'should', 'would', 'could', 'will', 'shall', 'its', 'it', 'who',
  'what', 'when', 'where', 'which', 'how', 'why', 'all', 'any', 'some',
  'make', 'made', 'need', 'want', 'please', 'help', 'get', 'got', 'use',
  'using', 'used', 'via', 'per', 'etc', 'than', 'then', 'them', 'their',
  'there', 'here', 'also', 'just', 'like', 'does', 'did', 'doing', 'done',
  'about', 'after', 'before', 'because', 'very', 'too', 'only', 'over',
  'under', 'again', 'more', 'most', 'much', 'many', 'each', 'both',
  // Sentence-initial verbs. "Fix", "Change", "Optimize" and "Improve" are
  // capitalised by grammar, not because they are identifiers.
  'fix', 'change', 'changes', 'optimize', 'optimise', 'improve', 'remove',
  'add', 'create', 'update', 'debug', 'investigate', 'why', 'document',
]);

/** Minimum length for a free word to be considered as evidence at all. */
export const MIN_TOKEN = 4;

/**
 * Words that are too ordinary to identify anything in this codebase.
 *
 * Frequency alone is not enough to catch these. "code" appears in only three
 * component names, so it passes any distinctiveness threshold — and the task
 * "my code is broken" then resolved TemplateCodeViewer, CodeHighlighter and
 * OtpCodeInput and reported a HIGH-confidence COMPONENT task. These are banned
 * outright from free-word evidence.
 */
export const GENERIC_TOKENS = new Set([
  'code', 'codes', 'file', 'files', 'page', 'pages', 'route', 'routes', 'data',
  'config', 'type', 'types', 'value', 'values', 'item', 'items', 'list', 'lists',
  'main', 'app', 'apps', 'util', 'utils', 'utility', 'utilities', 'helper',
  'helpers', 'server', 'servers', 'client', 'clients', 'request', 'requests',
  'response', 'responses', 'error', 'errors', 'name', 'names', 'key', 'keys',
  'index', 'thing', 'things', 'stuff', 'content', 'contents', 'entry', 'entries',
  'function', 'functions', 'handler', 'handlers', 'input', 'inputs', 'output',
  'state', 'props', 'param', 'params', 'object', 'objects', 'array', 'string',
  'number', 'boolean', 'interface', 'type', 'component', 'components', 'service',
  'services', 'hook', 'hooks', 'context', 'provider', 'module', 'modules',
]);

/**
 * Light plural folding.
 *
 * `templates-page` yields the token `templates`, never `template`, so a task
 * saying "template" found no feature at all until this existed. Only the
 * trailing `s` is removed — no real stemming engine, because an aggressive one
 * would merge genuinely different names.
 */
export function stem(t) {
  return t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t;
}

/** A token shared by more than this share of entries is generic, not informative. */
export const GENERIC_SHARE = 0.18;

function tokenFreq(names) {
  const freq = new Map();
  for (const n of names) {
    // MUST split camelCase/PascalCase. Index names are stored whole
    // (`TemplatePreview`), so tokenizing the normalized name produced keys like
    // "templatepreview" and the frequency table contained no real words at all.
    // Every `isDistinctive` lookup then missed, which silently disabled
    // single-token entity resolution and made the router report ordinary words
    // like "preview" or "dark" as "too common to identify anything".
    for (const t of new Set(splitWords(n).map(stem))) {
      if (t.length < MIN_TOKEN || STOPWORDS.has(t)) continue;
      freq.set(t, (freq.get(t) ?? 0) + 1);
    }
  }
  return freq;
}

/**
 * How distinctive is a token, per index?
 *
 * `distinct` is the set of tokens that narrow their index to a workable
 * handful of entries. `shares` lets the router explain WHY a word was ignored,
 * which matters when someone disagrees with the classification.
 */
export function tokenStats() {
  if (memo?.tokens) return memo.tokens;
  const ix = intel();

  const build = (names) => {
    const freq = tokenFreq(names);
    const limit = Math.max(2, Math.floor(names.length * GENERIC_SHARE));
    const distinct = new Set();
    for (const [t, n] of freq) if (n <= limit) distinct.add(t);
    return { freq, limit, distinct };
  };

  const tokens = {
    features: build(ix.features.features.map((f) => f.feature)),
    components: build(ix.components.components.map((c) => c.name)),
    services: build(ix.services.services.map((s) => s.name)),
    hooks: build(ix.hooks.hooks.map((h) => h.name)),
    symbols: build(Object.keys(ix.symbolIndex.symbolsByName)),
    pages: build(ix.pages.pages.map((p) => p.name)),
  };
  if (memo) memo.tokens = tokens;
  return tokens;
}

/** Is this free word worth searching the index for? */
export function isDistinctive(token, which = 'components') {
  const t = stem(token);
  if (t.length < MIN_TOKEN || STOPWORDS.has(t) || GENERIC_TOKENS.has(t)) return false;
  return tokenStats()[which].distinct.has(t);
}

/** The distinctive free words in a task, stemmed, for the explainable output. */
export function distinctiveTerms(s) {
  const seen = new Set();
  for (const t of normTokens(s)) {
    const st = stem(t);
    if (isDistinctive(st, 'features') || isDistinctive(st, 'components') || isDistinctive(st, 'symbols')) {
      if (!seen.has(st)) seen.add(st);
    }
  }
  return [...seen];
}

/* ------------------------------------------------------------------ *
 * Index handles
 *
 * Loaded through query-index.mjs's cache so two lookups of the same index are
 * one disk read, and so `agent:route` and `agent:query` share a warm cache when
 * a caller uses both.
 * ------------------------------------------------------------------ */

let memo = null;

function build() {
  const symbolIndex = load('generated/SYMBOL_INDEX.json');
  const reverse = load('generated/REVERSE_DEPENDENCY_MAP.json');
  const pci = load('generated/PAGE_COMPONENT_INDEX.json');
  const ffi = load('generated/FEATURE_FILE_INDEX.json');
  const graph = load('generated/IMPORT_GRAPH.json');
  const roles = load('codebase/FILE_ROLE_MAP.json');
  const features = load('codebase/FEATURE_MAP.json');
  const components = load('codebase/COMPONENT_MAP.json');
  const pages = load('codebase/PAGE_MAP.json');
  const routes = load('codebase/ROUTE_MAP.json');
  const api = load('codebase/API_MAP.json');
  const services = load('codebase/SERVICE_MAP.json');
  const hooks = load('codebase/HOOKS_MAP.json');
  const integrations = load('codebase/INTEGRATION_MAP.json');
  const database = load('codebase/DATABASE_USAGE_MAP.json');
  const storage = load('codebase/STORAGE_USAGE_MAP.json');

  // Symbol names are the single most useful lookup in the repo, so the
  // normalised map is built once here rather than per query.
  const byNormName = new Map();
  for (const name of Object.keys(symbolIndex.symbolsByName)) {
    const k = normName(name);
    if (!byNormName.has(k)) byNormName.set(k, []);
    byNormName.get(k).push(name);
  }

  // Adjacency for dependency expansion. Import edges are stored once, from →
  // to; the router needs both directions.
  const outboundOf = new Map();
  const inboundOf = new Map();
  const push = (m, k, v) => {
    if (!m.has(k)) m.set(k, []);
    const arr = m.get(k);
    if (!arr.includes(v)) arr.push(v);
  };
  for (const e of graph.edges) {
    if (!e.to || e.to.includes('node_modules')) continue;
    push(outboundOf, e.from, e.to);
    push(inboundOf, e.to, e.from);
  }

  const filePaths = roles.files.map((f) => f.path).sort();

  return {
    symbolIndex, reverse, pci, ffi, graph, roles, features, components, pages,
    routes, api, services, hooks, integrations, database, storage,
    byNormName, outboundOf, inboundOf,
    filePaths,
    roleByPath: new Map(roles.files.map((f) => [f.path, f])),
    /** Every indexed file inside a source root, e.g. `backend/src/config`. */
    filesUnder: (root) => {
      const prefix = root.endsWith('/') ? root : `${root}/`;
      return filePaths.filter((p) => p.startsWith(prefix));
    },
  };
}

export function intel() {
  if (!memo) memo = build();
  return memo;
}

/* ------------------------------------------------------------------ *
 * Entity resolution (8.27 feature, 8.28 component, 8.29 route, 8.30 path)
 * ------------------------------------------------------------------ */

/** Exact-then-normalised feature slug. `templates page` → `templates-page`. */
export function resolveFeature(term) {
  const ix = intel();
  const exact = ix.features.features.find((f) => f.feature === term);
  if (exact) return { feature: exact.feature, how: 'exact' };

  const slug = normTokens(term).join('-');
  const bySlug = ix.features.features.find((f) => f.feature === slug);
  if (bySlug) return { feature: bySlug.feature, how: 'slug-normalised' };

  const norm = normName(term);
  const byNorm = ix.features.features.find((f) => normName(f.feature) === norm);
  if (byNorm) return { feature: byNorm.feature, how: 'name-normalised' };

  return null;
}

/**
 * Related task wording → real feature slugs.
 *
 * agent.md 8.27 asks the router to "associate related terms" using Phase 7
 * feature metadata rather than building a hand-maintained synonym dictionary.
 * That is exactly what this is, and it is small on purpose: each entry is a
 * piece of domain vocabulary a developer would actually use, mapped to features
 * that genuinely exist in FEATURE_MAP. Anything not here falls through to the
 * index lookups above.
 *
 * Verified against the real FEATURE_MAP — a slug that does not exist is not
 * listed here, and `check-index.mjs` asserts that.
 */
export const FEATURE_ALIASES = {
  authentication: ['auth', 'auth-context', 'access-service', 'user-routes', 'user-service'],
  authenticate: ['auth', 'auth-context', 'access-service'],
  authorization: ['access-service', 'auth'],
  login: ['auth', 'auth-context'],
  signup: ['auth'],
  logout: ['auth', 'auth-context'],
  session: ['auth-context'],
  password: ['auth'],
  entitlement: ['access-service'],
  premium: ['access-service', 'pricing-page'],
  profile: ['user-routes', 'user-service', 'auth'],
  account: ['user-routes', 'user-service'],
  payment: ['payment-routes'],
  checkout: ['payment-routes', 'pricing-page'],
  invoice: ['payment-routes'],
  razorpay: ['payment-routes'],
  admin: ['admin'],
  dashboard: ['dashboard', 'admin'],
  moderation: ['admin'],
  analytics: ['admin', 'dashboard'],
  mcp: ['mcp'],
  tool: ['mcp'],
  claude: ['mcp'],
  playground: ['mcp', 'dashboard'],
  database: ['mongo-service'],
  mongo: ['mongo-service'],
  collection: ['collections-service', 'collections-routes'],
  collections: ['collections-service', 'collections-routes'],
  template: ['templates-page'],
  preview: ['preview-capture-page', 'templates-page'],
  marketplace: ['templates-page', 'components'],
  gallery: ['templates-page', 'components'],
  component: ['components'],
  components: ['components'],
  library: ['library-page'],
  favorite: ['favorites-service', 'favorites-routes'],
  favourites: ['favorites-service', 'favorites-routes'],
  saved: ['favorites-service', 'library-page'],
  hero: ['home-page'],
  homepage: ['home-page'],
  search: ['components'],
  announcement: ['announcement-service'],
  email: ['brevo-service', 'email-templates', 'email-log-service'],
  push: ['push-service'],
  notification: ['push-service', 'admin'],
  sync: ['sync-service', 'component-sync-service'],
  redis: ['mcp'],
  ratelimit: ['mcp'],
  deploy: ['config'],
  hosting: ['config'],
  vercel: ['config'],
  render: ['config'],
  theme: ['theme-context'],
  cookie: ['cookie-consent-context'],
  skeleton: ['skeleton-context'],
};

/**
 * Alias keys actually present in a task.
 *
 * An arbitrary free word is only searched when it is a distinctive index token,
 * which is the right default — most English words identify nothing. But
 * FEATURE_ALIASES is a small, hand-verified vocabulary, so its keys are safe to
 * search unconditionally. Without this, the word "authentication" was dropped
 * before reaching resolveTaskFeatures and an authentication task resolved no
 * auth feature at all.
 */
export function aliasTerms(s) {
  const seen = new Set();
  for (const t of normTokens(s)) {
    const st = stem(t);
    if (FEATURE_ALIASES[st] && !seen.has(st)) seen.add(st);
  }
  return [...seen];
}

/**
 * Features a task refers to.
 *
 * A feature counts as resolved when the task names it, when a distinctive word
 * matches its leading slug token, or when a known piece of domain vocabulary
 * maps to it (FEATURE_ALIASES above).
 */
export function resolveTaskFeatures(terms) {
  const ix = intel();
  const stats = tokenStats().features;
  const found = new Map();

  const record = (feature, how, term) => {
    if (!ix.features.features.some((f) => f.feature === feature)) return;
    if (!found.has(feature)) found.set(feature, { feature, how, terms: term ? [term] : [] });
    else if (term && !found.get(feature).terms.includes(term)) found.get(feature).terms.push(term);
  };

  for (const term of terms) {
    const direct = resolveFeature(term);
    if (direct) { record(direct.feature, direct.how, term); continue; }

    const norm = stem(normName(term));
    if (norm.length < MIN_TOKEN) continue;

    const byName = ix.features.features.find((f) => normName(f.feature) === norm);
    if (byName) { record(byName.feature, 'name-normalised', term); continue; }

    // Known domain vocabulary → the features that actually own that concept.
    const aliased = FEATURE_ALIASES[norm];
    if (aliased) {
      for (const slug of aliased) record(slug, `known term "${term}"`, term);
      continue;
    }

    if (!stats.distinct.has(norm)) continue;

    // Only a feature whose LEADING slug token matches counts.
    //
    // Without this, "template" matches `email-templates` as well as
    // `templates-page`, and a task about marketplace previews inherits a backend
    // email feature and its files. A feature is identified by its head, not by
    // any word that happens to appear somewhere inside it.
    for (const f of ix.features.features) {
      const head = stem(normTokens(f.feature)[0]);
      if (head === norm) record(f.feature, `distinctive-word "${term}" matched the leading slug token`, term);
    }
  }

  return [...found.values()];
}

/**
 * Closest real names for an identifier that resolved to nothing.
 *
 * agent.md uses `TemplateCard` as its worked example in 8.28 and in the success
 * criteria, and simulation 2 asks to route "Change the TemplateCard design".
 * That component does not exist in this repository — the nearest real name is
 * the local, non-exported `CurrentTemplateCard` inside TemplateSimilarRail.tsx.
 *
 * A router that silently returned UNKNOWN there would be defensible but useless,
 * and one that confidently matched it would be worse. Reporting the near miss
 * with the distance stated is the honest answer, and it is what agent.md 8.49
 * asks for: search exact symbols, return candidate areas, mark confidence.
 */
export function resolveNearMisses(term, max = 5) {
  const ix = intel();
  const norm = normName(term);
  if (norm.length < 5) return [];

  const names = Object.keys(ix.symbolIndex.symbolsByName);
  const scored = [];
  for (const name of names) {
    const n = normName(name);
    if (n === norm) continue;
    let relation = null;
    // Only the "real name contains what was asked" direction is kept. The
    // reverse — a shorter real name sitting inside the asked name — is almost
    // always a substring artefact, and it is what surfaced a useless candidate
    // called `template` for the task "Change the TemplateCard design".
    if (n.includes(norm)) relation = `contains "${term}"`;
    if (relation) {
      scored.push({ name, relation, locations: ix.symbolIndex.symbolsByName[name].locations });
    }
  }
  scored.sort((a, b) => Math.abs(a.name.length - norm.length) - Math.abs(b.name.length - norm.length));
  return scored.slice(0, max);
}

/**
 * Components whose name or path matches.
 *
 * Two rules keep this honest:
 *
 * 1. EVERY token of the term must match. The previous version tested a single
 *    token with `path.includes()`, so "the" matched forty paths.
 * 2. The result is labelled `exact` or `fuzzy`. Only `exact` (a normalised name
 *    equality) is allowed to establish a strong category signal on its own.
 */
/**
 * How many names may share a token before it is treated as a real identifier.
 *
 * A single free word is normally too weak to match a name by — that is what
 * stopped "my code is broken" resolving CodeHighlighter. But a word like
 * "comment" appears in almost nothing, and refusing all single-token matches
 * meant "Fix an XSS vulnerability in the comment renderer" found zero files.
 * So a lone token is allowed only when it is rare AND is not on the generic
 * list, and it is capped so one word cannot flood the context.
 */
export const SINGLE_TOKEN_MAX_FREQ = 3;
export const SINGLE_TOKEN_MAX_HITS = 3;

/**
 * Words that describe the ACTION a task asks for, not the thing it is about.
 *
 * These must never be used to resolve an entity. "Refactor TemplatePreview" was
 * matching `ParticleSphereRefactor` through the rare token "refactor": a verb
 * that happens to appear once in a component name. The match was rare enough to
 * pass the frequency filter and completely irrelevant, which is the worst kind
 * of false positive — it looks like evidence.
 */
export const ACTION_WORDS = new Set([
  'add', 'fix', 'remove', 'delete', 'update', 'refactor', 'rename', 'move',
  'create', 'implement', 'build', 'make', 'change', 'improve', 'clean',
  'cleanup', 'simplify', 'rewrite', 'revert', 'undo', 'test', 'debug',
  'investigate', 'check', 'verify', 'review', 'explain', 'document',
  'support', 'handle', 'wire', 'hook', 'wireup', 'port', 'migrate',
]);

/** True when a token is an action word and therefore not an identifier. */
export function isActionWord(token) {
  return ACTION_WORDS.has(stem(token));
}

export function resolveComponents(term) {
  const ix = intel();
  const norm = normName(term);
  const toks = normTokens(term).map(stem)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t) && !ACTION_WORDS.has(t));
  const hits = [];
  if (!norm) return hits;

  // A lone token must be rare enough to name something specific.
  let allowSingle = false;
  if (toks.length === 1) {
    const freq = tokenStats().components.freq.get(toks[0]) ?? 0;
    allowSingle = freq > 0 && freq <= SINGLE_TOKEN_MAX_FREQ && !GENERIC_TOKENS.has(toks[0]);
  }

  for (const c of ix.components.components) {
    const cNorm = normName(c.name);
    if (cNorm === norm) { hits.push({ component: c, how: 'name-exact-normalised', strength: 'exact' }); continue; }
    if (c.name.toLowerCase() === String(term).trim().toLowerCase()) { hits.push({ component: c, how: 'name-case-insensitive', strength: 'exact' }); continue; }
    if (toks.length === 0) continue;
    const cToks = new Set(splitWords(c.name).map(stem));
    // Name only — never the path. Matching paths against free words is what
    // made the word "components" resolve all 227 components, since every
    // component path contains `/components/`.
    if (toks.every((t) => cToks.has(t))) {
      const how = toks.length === 1
        ? `rare name token "${toks[0]}" (${(tokenStats().components.freq.get(toks[0]) ?? 0)} matches)`
        : `all tokens matched the name (${toks.join('+')})`;
      hits.push({ component: c, how, strength: 'fuzzy' });
    }
  }

  if (toks.length === 1 && allowSingle && hits.length > SINGLE_TOKEN_MAX_HITS) {
    return hits
      .slice()
      .sort((a, b) => splitWords(a.component.name).length - splitWords(b.component.name).length
        || a.component.name.localeCompare(b.component.name))
      .slice(0, SINGLE_TOKEN_MAX_HITS);
  }
  return hits;
}

/** Symbols by exact name, then by normalised name. */
export function resolveSymbols(term) {
  const ix = intel();
  const entry = ix.symbolIndex.symbolsByName[term];
  if (entry) return { names: [term], how: 'name-exact', strength: 'exact', entry };

  const norm = normName(term);
  const names = ix.byNormName.get(norm);
  if (names?.length) {
    return { names, how: 'name-normalised', strength: 'exact', entry: ix.symbolIndex.symbolsByName[names[0]] };
  }
  return null;
}

/**
 * Route resolution. Handles both frontend routes (`/templates`) and backend
 * endpoint paths (`/api/v1/templates`) by searching both maps and reporting
 * which one matched, because a task saying "/api/v1/templates" is an API task
 * even though a page named TemplatesPage also exists.
 */
export function resolveRoute(term) {
  const ix = intel();
  const raw = String(term).trim();
  const p = raw.split('?')[0].replace(/\/+$/, '') || '/';

  const page = ix.pages.pages.find((x) => x.route === p);
  const endpoint = ix.api.endpoints.find(
    (e) => e.path === p || `${e.path}`.replace(/\/+$/, '') === p,
  );
  const route = ix.routes.routes.find((r) => r.path === p);

  if (endpoint) return { kind: 'API_ENDPOINT', endpoint, path: endpoint.path, how: 'endpoint-path-exact' };
  if (page?.route) return { kind: 'PAGE', page, path: page.route, how: 'page-route-exact' };
  if (route) return { kind: 'ROUTE', route, path: route.path, how: 'route-path-exact' };
  return null;
}

/**
 * File-path fast path (8.30). An explicit path in the task is the strongest
 * possible signal, so it is checked before any classification happens.
 */
export function resolveFilePath(term) {
  const ix = intel();
  const cleaned = slash(String(term).trim()).replace(/^\.\//, '');
  const role = ix.roleByPath.get(cleaned);
  if (!role) return null;
  const rev = ix.reverse.reverse[cleaned];
  return {
    path: cleaned,
    role: role.role,
    feature: role.feature,
    lines: role.lines,
    isBarrel: !!role.isBarrel,
    importers: rev?.importers ?? [],
    importedBy: rev?.importedBy ?? 0,
  };
}

/** Services and hooks whose names match. Exact or every-token, never loose. */
export function resolveServices(term) {
  const ix = intel();
  const norm = normName(term);
  const toks = normTokens(term).map(stem)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t) && !ACTION_WORDS.has(t));
  if (!norm) return [];
  return ix.services.services
    .filter((s) => normName(s.name) === norm || (toks.length >= 2 && toks.every((t) => new Set(splitWords(s.name).map(stem)).has(t))))
    .map((service) => ({
      service,
      how: normName(service.name) === norm ? 'name-exact-normalised' : `all tokens matched the name (${toks.join('+')})`,
      strength: normName(service.name) === norm ? 'exact' : 'fuzzy',
    }));
}

export function resolveHooks(term) {
  const ix = intel();
  const norm = normName(term);
  const toks = normTokens(term).map(stem)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t) && !ACTION_WORDS.has(t));
  if (!norm) return [];
  return ix.hooks.hooks
    .filter((h) => normName(h.name) === norm || (toks.length >= 2 && toks.every((t) => new Set(splitWords(h.name).map(stem)).has(t))))
    .map((hook) => ({
      hook,
      how: normName(hook.name) === norm ? 'name-exact-normalised' : `all tokens matched the name (${toks.join('+')})`,
      strength: normName(hook.name) === norm ? 'exact' : 'fuzzy',
    }));
}

/* ------------------------------------------------------------------ *
 * Graph navigation
 * ------------------------------------------------------------------ */

export function outbound(path) {
  return intel().outboundOf.get(slash(path)) ?? [];
}

export function inbound(path) {
  return intel().inboundOf.get(slash(path)) ?? [];
}

export function pageTreeFor(pagePath) {
  return intel().pci.index[slash(pagePath)] ?? null;
}

/** Pages that reach a file, via the page component index. */
/**
 * Pages that render a file.
 *
 * `mode: 'direct'` returns only pages that import it themselves; the default
 * also includes pages that reach it through a shared component. Both are true,
 * but they are not equally useful: a payment button that reaches 13 pages only
 * through a shared component is one hop from all of them, so reporting every
 * page as "renders this file" buried the actual subject under unrelated pages.
 */
export function pagesReaching(path, mode = 'both') {
  const ix = intel();
  const p = slash(path);
  const out = [];
  for (const [page, v] of Object.entries(ix.pci.index)) {
    const direct = (v.direct ?? []).some((t) => t.path === p);
    if (mode === 'direct') {
      if (direct) out.push(page);
      continue;
    }
    if (direct || (v.transitive ?? []).some((t) => t.path === p)) out.push(page);
  }
  return out;
}

/** Every file belonging to a feature slug. */
export function featureFiles(slug) {
  return intel().ffi.index[slug] ?? [];
}

/* ------------------------------------------------------------------ *
 * Knowledge base (8.22 – 8.26, 8.48)
 * ------------------------------------------------------------------ */

/** Does a `.uihub-agent/<rel>` knowledge file actually exist? */
export function knowledgeExists(rel) {
  return existsSync(join(AGENT_DIR, slash(rel)));
}

export function knowledgeSize(rel) {
  const abs = join(AGENT_DIR, slash(rel));
  return existsSync(abs) ? statSync(abs).size : 0;
}

/** Strip a leading `.uihub-agent/` so callers can pass either form. */
export function knowledgeRel(rel) {
  return slash(rel).replace(/^\.uihub-agent\//, '');
}

/* ------------------------------------------------------------------ *
 * Index freshness (8.51)
 *
 * `agent:index:check` is the content-exact answer and re-hashes every source
 * file. Running it as a precondition for every route would cost a full read of
 * 8.5 MB, which defeats the purpose of a fast router.
 *
 * This is the cheap pre-check: compare the working tree against the manifest's
 * stored snapshot on path + size. It costs 485 stat() calls, no reads, and
 * catches every add, remove, rename, and any edit that changed a file length.
 * It cannot see a same-length content edit, so it reports exactly what it can
 * prove and points at the exact command for the rest.
 * ------------------------------------------------------------------ */

export function freshness() {
  const ix = intel();
  const snapshot = ix.symbolIndex && load('generated/INTELLIGENCE_MANIFEST.json').sourceSnapshot;
  if (!snapshot) {
    return { state: 'UNKNOWN', reason: 'manifest carries no sourceSnapshot', checked: 0 };
  }

  const added = [];
  const removed = [];
  const resized = [];
  const seen = new Set();

  for (const entry of snapshot) {
    seen.add(entry.path);
    const abs = join(ROOT, entry.path);
    if (!existsSync(abs)) { removed.push(entry.path); continue; }
    const size = statSync(abs).size;
    if (size !== entry.size) resized.push(entry.path);
  }

  // Walk the working tree to spot files the snapshot never saw.
  //
  // This must walk the FILESYSTEM, not the role map. The role map is the old
  // generated index, so by definition it cannot contain a file added after the
  // last run — iterating it made `added` permanently empty and left the
  // pre-check blind to exactly the change it exists to catch.
  //
  // `discover(ROOT)` is the same call the generator makes, so this sees exactly
  // the universe the manifest recorded and no more.
  try {
    for (const f of discover(ROOT).indexed) {
      if (!seen.has(f.path)) added.push(f.path);
    }
  } catch {
    // A failed walk must not make the router lie. Report UNKNOWN rather than
    // claiming FRESH from a partial check.
    return { state: 'UNKNOWN', reason: 'could not walk the source tree', checked: 0 };
  }

  const changed = [...added, ...removed, ...resized];
  return {
    state: changed.length === 0 ? 'FRESH' : 'STALE',
    reason: changed.length === 0
      ? 'every indexed path still exists at the recorded size'
      : `${changed.length} path(s) differ from the recorded snapshot`,
    checked: snapshot.length,
    added: added.sort(),
    removed: removed.sort(),
    resized: resized.sort(),
    caveat: 'path+size comparison; a same-size content edit needs `npm run agent:index:check`',
    sourceFingerprint: load('generated/INTELLIGENCE_MANIFEST.json').sourceFingerprint,
    generatedAt: load('generated/INTELLIGENCE_MANIFEST.json').generatedAt,
    refreshCommand: 'npm run agent:index',
    verifyCommand: 'npm run agent:index:check',
  };
}

/* ------------------------------------------------------------------ *
 * Repository size, used for the selection-ratio metric in 8.42.
 * ------------------------------------------------------------------ */

export function repositorySize() {
  const ix = intel();
  return {
    indexedFiles: ix.roles.files.length,
    sourceRoots: ix.roles.sourceRoots.length,
    indexedBytes: ix.roles.files.reduce((n, f) => n + (f.bytes ?? 0), 0),
    totalLines: ix.roles.files.reduce((n, f) => n + (f.lines ?? 0), 0),
    features: ix.features.features.length,
    components: ix.components.components.length,
    pages: ix.pages.pages.length,
    routes: ix.routes.routes.length,
    endpoints: ix.api.endpoints.length,
    services: ix.services.services.length,
    symbols: ix.symbolIndex.counts.symbols,
    internalEdges: ix.graph.counts.internalEdges,
  };
}

export { queries, load, readFileSync };