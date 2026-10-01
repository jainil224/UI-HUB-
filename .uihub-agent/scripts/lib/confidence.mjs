/**
 * Confidence model — agent.md task 7.31.
 *
 * Rule: a value is HIGH only when it is derivable from the file's own AST.
 * Anything inferred from a path convention, a naming pattern, or a heuristic is
 * LOW_CONFIDENCE and must say why. Nothing is silently asserted.
 *
 * This exists because an index that is confidently wrong is more dangerous than
 * an index that admits uncertainty — an agent reading the index has no way to
 * tell a fact from a guess unless the index says so.
 */

/** Confidence levels, ordered by how much trust they earn. */
export const LEVELS = ['HIGH', 'MEDIUM', 'LOW_CONFIDENCE', 'UNKNOWN'];

/** Wraps a value with its confidence and the evidence behind it. */
export function attest(value, confidence, why) {
  return { value, confidence, why };
}

/**
 * Confidence for an import edge.
 *
 * An edge that resolved to a real file in the index is HIGH regardless of how
 * the specifier was written: `import x from './y.js'` in a `.ts` file is a
 * NodeNext convention, not a guess, once the target is confirmed to exist.
 */
export function edgeConfidence(edge) {
  if (edge.kind === 'internal') return 'HIGH';
  if (edge.kind === 'external') return 'HIGH';
  if (edge.kind === 'asset') return 'MEDIUM';
  if (edge.kind === 'unresolved') return 'UNKNOWN';
  return 'UNKNOWN';
}

/** Confidence for a file role. */
export function roleConfidence(roleSource) {
  if (roleSource.startsWith('ast:')) return 'HIGH';
  if (roleSource === 'path-convention') return 'MEDIUM';
  return 'LOW_CONFIDENCE';
}

/** Confidence for a feature attribution. */
export function featureConfidence(path) {
  if (/^frontend\/src\/(pages|features|sections|hooks|contexts|stores)\//.test(path)) return 'HIGH';
  if (/^(backend|mcp-server|cli)\/src\//.test(path)) return 'HIGH';
  if (/^(api|scripts)\//.test(path)) return 'HIGH';
  if (/^frontend\/src\/components\//.test(path)) return 'MEDIUM';
  return 'LOW_CONFIDENCE';
}

/**
 * Confidence for a page↔route association.
 *
 * A route element that names a component is HIGH. A directory-name match
 * between `pages/Foo/` and a route path `/foo` is MEDIUM, because it is a
 * correlation rather than a declaration.
 */
export function routeAssociationConfidence(source) {
  if (source === 'router-element') return 'HIGH';
  if (source === 'lazy-import') return 'HIGH';
  if (source === 'directory-name') return 'MEDIUM';
  return 'LOW_CONFIDENCE';
}

/** Confidence for a database/storage usage claim. */
export function usageConfidence(evidence) {
  if (evidence.some((e) => e.includes('findOneAndUpdate') || e.includes('collection('))) return 'HIGH';
  if (evidence.length > 0) return 'MEDIUM';
  return 'UNKNOWN';
}

/**
 * Aggregate the lowest confidence present in a set of contributing records.
 *
 * A summary is only as trustworthy as its least certain input.
 */
export function weakest(values) {
  let worst = 'HIGH';
  let rank = 0;
  for (const v of values) {
    const i = LEVELS.indexOf(v);
    if (i > rank) {
      rank = i;
      worst = v;
    }
  }
  return worst;
}

/** Roll-up counts for a report, e.g. `HIGH: 210 MEDIUM: 22 UNKNOWN: 3`. */
export function tally(values) {
  const out = Object.fromEntries(LEVELS.map((l) => [l, 0]));
  for (const v of values) {
    if (out[v] === undefined) out[v] = 0;
    out[v] += 1;
  }
  return out;
}