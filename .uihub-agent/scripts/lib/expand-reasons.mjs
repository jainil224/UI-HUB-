/**
 * Expansion justifications (8.12). Exactly seven permitted triggers.
 *
 * Each trigger is a concrete relationship to the task's named entities, never a
 * property of the candidate alone. The prose in 8.12 forbids expanding because
 * a file is "nearby", "looks related" or "contains generic code"; these strings
 * are intentionally absent.
 */

import { pagesReaching } from './intel.mjs';

export const expandReasons = {
  DIRECT_DEPENDENCY: 'Direct dependency discovered (a named file imports this file)',
  RELEVANT_CONSUMER: 'Relevant consumer discovered (this file imports a named file)',
  SHARED_SERVICE: 'Shared service discovered (several named files share this service)',
  API_DEPENDENCY: 'API dependency discovered (the task mentions an endpoint that reaches this file)',
  STATE_DEPENDENCY: 'State dependency discovered (this file provides or consumes state the task names)',
  PROTECTED_RELATIONSHIP: 'Protected relationship discovered (a protected path depends on this file)',
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
export function candidatesFor({ routing, ix, named }) {
  const out = new Set();
  const put = (p) => { if (p && ix.roleByPath?.has(p)) out.add(p); };

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
  // matters before editing it.
  for (const area of routing.protectedAreas ?? []) {
    for (const f of ix.inboundOf?.get(area.path ?? '') ?? []) put(f);
  }

  // Tests that import something the task named.
  for (const [p, role] of ix.roleByPath ?? []) {
    if (role?.role !== 'TEST') continue;
    if ((ix.outboundOf?.get(p) ?? []).some((t) => named.has(t))) put(p);
  }

  return [...out];
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
      // `inboundOf` maps a file to the paths that import it, as plain strings —
      // not to edge objects. Reading `e.from` here made every comparison
      // `undefined === path`, so this trigger could never fire.
      for (const area of routing.protectedAreas ?? []) {
        const dependents = ix.inboundOf?.get(area.path ?? '') ?? [];
        if (dependents.includes(path)) {
          out.push(`${path} is depended on by a protected file (${area.path})`);
        }
      }
      break;
    }
    case 'TEST_DEPENDENCY': {
      // This file is a test that imports something the task named.
      if (ix.roleByPath?.get(path)?.role !== 'TEST') break;
      for (const n of namedSet) {
        if ((ix.outboundOf?.get(path) ?? []).includes(n)) {
          out.push(`test ${path} imports the task-named ${n}`);
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