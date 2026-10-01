/**
 * Expansion justifications (8.12). Exactly seven permitted triggers.
 *
 * Each trigger is a concrete relationship to the task's named entities, never a
 * property of the candidate alone. The prose in 8.12 forbids expanding because
 * a file is "nearby", "looks related" or "contains generic code"; these strings
 * are intentionally absent.
 */

import { pagesReaching } from './intel.mjs';
import { PATH_SURFACE } from './router-matrix.mjs';

/**
 * Reverse index: path -> the feature slugs that own it.
 *
 * Built once per intel snapshot and memoised on it, because building it naively
 * scans all 56 feature slugs per lookup and this is on the expansion hot path.
 * A file may legitimately belong to more than one feature, so the value is a Set.
 */
let FEATURE_OF = null;
function featuresOf(ix) {
  if (FEATURE_OF && FEATURE_OF.ix === ix) return FEATURE_OF.byPath;
  const byPath = new Map();
  for (const [slug, paths] of Object.entries(ix.ffi?.index ?? {})) {
    for (const p of paths) {
      let set = byPath.get(p);
      if (!set) { set = new Set(); byPath.set(p, set); }
      set.add(slug);
    }
  }
  FEATURE_OF = { ix, byPath };
  return byPath;
}

/**
 * The task's feature scope: the slugs the router resolved, plus the slugs that
 * own anything the task named.
 *
 * The second half matters because a task can name a file without resolving a
 * feature slug for it ("Fix TemplateCard so the similar rail shows WebM
 * previews" names template components but resolves the TEMPLATE category, not a
 * `templates` slug). Using the named paths' own features keeps such tasks from
 * looking unrelated to everything they touch.
 */
function taskFeatureScope(routing, ix) {
  const scope = new Set(routing?.featureCandidates ?? []);
  const byPath = featuresOf(ix);
  for (const p of namedFromRouting(routing)) {
    for (const f of byPath.get(p) ?? []) scope.add(f);
  }
  return scope;
}

/** Paths the router itself resolved for this task. */
function namedFromRouting(routing) {
  const e = routing?.entities ?? {};
  return [
    ...(e.explicitFiles ?? []).map((f) => f.path),
    ...(e.components ?? []).map((c) => c.path),
    ...(e.services ?? []).map((s) => s.path),
    ...(e.hooks ?? []).map((h) => h.path),
  ].filter(Boolean);
}

/** The surfaces the task's own evidence implicated. */
function taskSurfaces(routing) {
  return new Set((routing?.surface ?? []).filter((s) => s !== 'UNKNOWN'));
}

/**
 * The surface a path belongs to, by path prefix.
 *
 * Deliberately NOT `ROLE_SURFACE`: the role table maps MIDDLEWARE to BACKEND even
 * for `mcp-server/src/middleware/auth.ts`, and CONFIG to DEPLOYMENT, so judging
 * subsystem membership by role would call an MCP file backend code and let an
 * unrelated deployment config look task-adjacent. The prefix rules are the only
 * unambiguous statement of which tree a file is in.
 *
 * Returns null when no prefix applies, which is treated as "no evidence against"
 * rather than as a mismatch.
 */
function surfaceOf(path) {
  for (const rule of PATH_SURFACE ?? []) {
    if (rule.re.test(path)) return rule.surface;
  }
  return null;
}

/**
 * Is this protected file connected to the task, or merely protected?
 *
 * PROTECTED is not RELEVANT. Being a CRITICAL path says a file is dangerous to
 * touch; it says nothing about whether THIS task needs it. Treating the second
 * as if it followed from the first is what let "Fix XSS in the comment renderer"
 * pull in paymentController and paymentRoutes, and let "Fix the auth middleware"
 * pull in the MCP server's routes.
 *
 * A protected file counts as connected when either:
 *   - its feature scope intersects the task's feature scope; or
 *   - the task resolved a category that declares this file protected (`via`) AND
 *     the file lives in a surface the task actually implicated.
 *
 * The second clause is deliberately weaker than the first because the routing
 * matrix declares whole protected areas per category, which is too coarse to
 * discriminate within a category on its own — PAYMENT declares the payment
 * route, the signature verifier and the premium-components config alike. The
 * surface check is what narrows it across subsystems: AUTHENTICATION declares
 * both `backend/src/middleware/auth.js` and `mcp-server/src/middleware/auth.ts`,
 * but only the backend one is in scope for a task whose evidence implicated
 * BACKEND and FRONTEND.
 */
function isTaskConnected(protectedPath, { routing, ix, scope, surfaces, via }) {
  const byFeature = featuresOf(ix).get(protectedPath) ?? new Set();
  for (const f of byFeature) if (scope.has(f)) return true;

  if (!via) return false;
  const surface = surfaceOf(protectedPath);
  if (surface && !surfaces.has(surface)) return false;
  return true;
}

export const expandReasons = {
  DIRECT_DEPENDENCY: 'Direct dependency discovered (a named file imports this file)',
  RELEVANT_CONSUMER: 'Relevant consumer discovered (this file imports a named file)',
  SHARED_SERVICE: 'Shared service discovered (several named files share this service)',
  API_DEPENDENCY: 'API dependency discovered (the task mentions an endpoint that reaches this file)',
  STATE_DEPENDENCY: 'State dependency discovered (this file provides or consumes state the task names)',
  PROTECTED_RELATIONSHIP: 'Protected relationship discovered (a task-connected protected path depends on this file)',
  TEST_DEPENDENCY: 'Test dependency discovered (a test that imports a task-named file)',
};

/**
 * The candidate universe expansion may draw from.
 *
 * Expansion cannot reuse the relevance engine's pending list. That list is
 * already filtered down to files with *substantive* evidence, which is the whole
 * purpose of relevance ranking — so it is empty by construction for a task that
 * named one file, and expansion could never run at all.
 *
 * Each of the seven triggers describes a relationship between a candidate and
 * the entities the TASK named, so the candidate set is derived from those same
 * relationships here. A candidate admitted to this set has NOT been added to the
 * context: `reasonsForPath` still has to justify it, trigger by trigger.
 */
export function candidatesFor({ routing, ix, named, initial = [] }) {
  const out = new Set();
  const put = (p) => { if (p && ix.roleByPath?.has(p)) out.add(p); };
  const testSubjects = testSubjectsFor(named, initial, ix);

  for (const n of named) {
    for (const t of ix.outboundOf?.get(n) ?? []) put(t);
    for (const f of ix.inboundOf?.get(n) ?? []) put(f);
    for (const p of pagesReaching(n)) put(p);
  }

  // State the task's named files genuinely share: an imported module that is a
  // context, store, provider or hook. Recorded so STATE_DEPENDENCY can cite it.
  for (const p of sharedStateModules(named, ix)) put(p);

  // Endpoint handlers for routes the task named. Read `handlers` off the public
  // route entity, not `endpoint.handlers`: the public mapping does not carry
  // `endpoint`, so that lookup returned undefined and API_DEPENDENCY could
  // never fire.
  for (const r of routing.entities?.routes ?? []) {
    if (r.kind !== 'API_ENDPOINT') continue;
    for (const h of r.handlers ?? []) put(h.file ?? h);
  }

  // Files a protected path depends on: knowing what depends on protected code
  // matters before editing it. Gated exactly as `reasonsForPath` gates the
  // PROTECTED_RELATIONSHIP trigger — a conceptual task named nothing, so there is
  // no subject to relate protected code to, and this trigger was otherwise
  // satisfiable from any protected file at all.
  if (!isConceptualTask(routing)) {
    for (const area of routing.protectedAreas ?? []) {
      for (const f of ix.inboundOf?.get(area.path ?? '') ?? []) put(f);
    }
  }

  // Tests that import something the task named, or — for a conceptual task that
  // names no file at all — something the relevance engine independently selected
  // as this task's subject. See `testSubjectsFor`.
  for (const [p, role] of ix.roleByPath ?? []) {
    if (role?.role !== 'TEST') continue;
    if ((ix.outboundOf?.get(p) ?? []).some((t) => testSubjects.has(t))) put(p);
  }

  return [...out];
}

/**
 * The subject files a test may be admitted for.
 *
 * Two sets, deliberately not merged:
 *
 *   - `named`: paths the router resolved for this task. Always eligible.
 *   - relevance-selected: paths the engine scored into the initial context even
 *     though the task never named them. Eligible ONLY for a conceptual task, i.e.
 *     one that named nothing — because then the selection itself is the only
 *     evidence available, and the alternative is that conceptual tasks never
 *     discover tests at all, which is the Phase 8 finding.
 *
 * A test never becomes evidence for itself: relevance-selected paths exclude
 * tests, so a bundle of tests cannot drag in more tests through a chain.
 */
function testSubjectsFor(named, initial, ix) {
  const subjects = new Set(named);
  if (named.size === 0) {
    for (const f of initial) {
      if (f?.addedByExpansion) continue;
      if (ix.roleByPath?.get(f.path)?.role === 'TEST') continue;
      subjects.add(f.path);
    }
  }
  return subjects;
}

/** Did the task name any file or entity of its own? */
function isConceptualTask(routing) {
  return namedFromRouting(routing).length === 0;
}

const STATE_HINT = /(context|store|provider|hook|state)/i;
function sharedStateModules(named, ix) {
  const counts = new Map();
  for (const n of named) {
    for (const t of ix.outboundOf?.get(n) ?? []) {
      if (!STATE_HINT.test(t ?? '')) continue;
      if (!counts.has(t)) counts.set(t, new Set());
      counts.get(t).add(n);
    }
  }
  return [...counts.entries()].filter(([, users]) => users.size >= 2).map(([p]) => p);
}

/**
 * Answer: why would this pending path be added under the given trigger?
 * Returns an array of human-readable lines. If empty, the trigger does not
 * justify this path.
 */
export function reasonsForPath(path, { routing, initial, ix, trigger, named }) {
  const out = [];
  const namedSet = named;

  switch (trigger) {
    case 'DIRECT_DEPENDENCY': {
      // A named file imports this path. `outboundOf` maps a file to the modules
      // it imports, as plain path strings — not to edge objects.
      for (const n of namedSet) {
        if ((ix.outboundOf?.get(n) ?? []).includes(path)) {
          out.push(`named file ${n} imports ${path}`);
        }
      }
      break;
    }
    case 'RELEVANT_CONSUMER': {
      // This path imports a named file.
      for (const n of namedSet) {
        if ((ix.outboundOf?.get(path) ?? []).includes(n)) {
          out.push(`${path} imports the named file ${n}`);
        }
      }
      break;
    }
    case 'SHARED_SERVICE': {
      // Named files share this service: the service definition is imported by
      // at least two of them.
      const svc = ix.services?.services.find((s) => s.path === path);
      if (!svc) break;
      const dependents = [...namedSet].filter((n) => (ix.outboundOf?.get(n) ?? []).includes(path));
      if (dependents.length >= 2) out.push(`service "${svc.name}" is imported by ${dependents.join(', ')}`);
      break;
    }
    case 'API_DEPENDENCY': {
      // An endpoint named in the task reaches this path.
      for (const r of routing.entities?.routes ?? []) {
        if (r.kind !== 'API_ENDPOINT') continue;
        const handlers = r.handlers ?? [];
        if (handlers.map((h) => h.file ?? h).includes(path)) {
          out.push(`endpoint ${r.path} is handled by ${path}`);
        }
      }
      break;
    }
    case 'STATE_DEPENDENCY': {
      // A context/store/provider/hook that at least two task-named files import:
      // that module is state this task genuinely touches, not a guess.
      const consumers = [...namedSet].filter((n) => (ix.outboundOf?.get(n) ?? []).includes(path));
      if (consumers.length >= 2 && STATE_HINT.test(path)) {
        out.push(`state module ${path} is imported by ${consumers.length} task-named file(s): ${consumers.join(', ')}`);
      }
      for (const hk of routing.entities?.hooks ?? []) {
        if (hk.path === path) out.push(`task names hook ${hk.name}`);
      }
      break;
    }
    case 'PROTECTED_RELATIONSHIP': {
      // Guard: this trigger asks "what does protected code depend on?", which is
      // only meaningful once the task has named something to work from. Without
      // the guard it is trivially satisfiable by anything reachable from a
      // protected config file, so a task that resolved NO source file — "fix XSS
      // in the comment renderer", where no indexed entity contains "comment" —
      // expanded to paymentController and paymentRoutes. Ten files of padding,
      // each with a technically-true justification and no relation to the task.
      if (namedSet.size === 0) break;
      // Second guard: "named something" is not the same as "connected to what was
      // named". A non-empty namedSet is satisfied by almost any task that resolved
      // a single entity, so on its own it let every importer of any protected file
      // in — including files in a subsystem the task never mentioned.
      const scope = taskFeatureScope(routing, ix);
      const surfaces = taskSurfaces(routing);
      // Third guard: a protected relationship that only ever reaches repository
      // maintenance tooling is not application context. Dataset builders, coverage
      // checkers and database setup scripts import the same shared config files
      // the running app does, so they were admitted into "Fix a payment
      // verification bug" on that basis alone — four files of pure padding, each
      // with a technically-true justification and nothing to do with the task.
      const candidateRole = ix.roleByPath?.get(path)?.role;
      if (candidateRole === 'SCRIPT') break;
      // `inboundOf` maps a file to the paths that import it, as plain strings —
      // not to edge objects. Reading `e.from` here made every comparison
      // `undefined === path`, so this trigger could never fire.
      for (const area of routing.protectedAreas ?? []) {
        const protectedPath = area.path ?? '';
        if (!protectedPath) continue;
        if (!isTaskConnected(protectedPath, { routing, ix, scope, surfaces, via: area.via })) continue;
        const dependents = ix.inboundOf?.get(protectedPath) ?? [];
        // Direction: `dependents` is the set of files that IMPORT `area.path`, so
        // this file is the one doing the importing. The wording used to be
        // "is depended on by a protected file", which asserts the exact
        // opposite — that the protected file imports this one. No source file
        // imports a test, so that sentence was false in every bundle it appeared
        // in, and expansion evidence is only worth anything if it is true.
        if (dependents.includes(path)) {
          out.push(`${path} imports the protected file (${protectedPath}), which is connected to this task`);
        }
      }
      break;
    }
    case 'TEST_DEPENDENCY': {
      // This file is a test that imports something the task named — or, when the
      // task named nothing, something the relevance engine selected as its
      // subject. Both are real import edges read from the graph; no filename is
      // ever pattern-matched, which is the weak evidence 9.10 rules out.
      if (ix.roleByPath?.get(path)?.role !== 'TEST') break;
      const subjects = testSubjectsFor(namedSet, initial?.files ?? [], ix);
      const namedOnly = namedSet.size > 0;
      for (const n of subjects) {
        if ((ix.outboundOf?.get(path) ?? []).includes(n)) {
          out.push(namedOnly
            ? `test ${path} imports the task-named ${n}`
            : `test ${path} imports ${n}, which this task selected as its subject`);
          break;
        }
      }
      break;
    }
    default:
      break;
  }

  return out;
}