#!/usr/bin/env node
/**
 * Cross-reference validator for the intelligence indexes - agent.md task 7.30.
 *
 * Freshness (`generate-index.mjs --check`) proves the indexes match the source
 * tree. It does NOT prove they agree with EACH OTHER or with the Phase 1-6
 * documents. That is this script's job, and it is a separate check for exactly
 * that reason: an index can be perfectly fresh and still contradict a sibling.
 *
 * Each rule reports MATCH, CONFLICT, or MISSING. CONFLICT and MISSING exit 1.
 * Unresolved import edges are reported as WARN and do not fail, because they are
 * a finding about the repository rather than a defect in the index.
 *
 *   node check-index.mjs          human-readable
 *   node check-index.mjs --json   machine-readable, for CI
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRoutingMatrix } from './lib/router-matrix.mjs';
import { knowledgeRel } from './lib/intel.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const A = join(ROOT, '.uihub-agent');
const AGENT_DIR = '.uihub-agent';

const results = [];
const warn = (rule, message) => results.push({ level: 'WARN', rule, message });
const conflict = (rule, message) => results.push({ level: 'CONFLICT', rule, message });
const missing = (rule, message) => results.push({ level: 'MISSING', rule, message });
const match = (rule, message) => results.push({ level: 'MATCH', rule, message });

function load(rel) {
  const p = join(A, rel);
  if (!existsSync(p)) {
    missing('artifact', `.uihub-agent/${rel} does not exist - run: npm run agent:index`);
    return null;
  }
  return JSON.parse(readFileSync(p, 'utf8'));
}

function main() {
  const json = process.argv.includes('--json');

  const roles = load('codebase/FILE_ROLE_MAP.json');
  const comps = load('codebase/COMPONENT_MAP.json');
  const pages = load('codebase/PAGE_MAP.json');
  const routes = load('codebase/ROUTE_MAP.json');
  const features = load('codebase/FEATURE_MAP.json');
  const hooks = load('codebase/HOOKS_MAP.json');
  const services = load('codebase/SERVICE_MAP.json');
  const api = load('codebase/API_MAP.json');
  const integrations = load('codebase/INTEGRATION_MAP.json');
  const graph = load('generated/IMPORT_GRAPH.json');
  const rev = load('generated/REVERSE_DEPENDENCY_MAP.json');
  const symbols = load('generated/SYMBOL_INDEX.json');
  const ffi = load('generated/FEATURE_FILE_INDEX.json');
  const pci = load('generated/PAGE_COMPONENT_INDEX.json');
  const manifest = load('generated/INTELLIGENCE_MANIFEST.json');

  if (!roles || !comps || !pages || !routes || !features || !hooks ||
      !services || !api || !integrations || !graph || !rev || !symbols || !ffi || !pci || !manifest) {
    return emit(json);
  }

  const rolePaths = new Set(roles.files.map((f) => f.path));

  /* ---- 1. every component appears in FILE_ROLE_MAP ------------------ */
  {
    const missingRoles = comps.components.filter((c) => !rolePaths.has(c.path));
    if (missingRoles.length) {
      conflict('COMPONENT_MAP -> FILE_ROLE_MAP',
        `${missingRoles.length} component(s) absent from the role map: ` +
        missingRoles.slice(0, 5).map((c) => c.path).join(', '));
    } else {
      match('COMPONENT_MAP -> FILE_ROLE_MAP',
        `all ${comps.components.length} components carry a file role`);
    }
  }

  /* ---- 2. every page appears in FILE_ROLE_MAP ----------------------- */
  {
    const missingRoles = pages.pages.filter((p) => !rolePaths.has(p.path));
    if (missingRoles.length) {
      conflict('PAGE_MAP -> FILE_ROLE_MAP',
        `${missingRoles.length} page(s) absent from the role map: ` +
        missingRoles.slice(0, 5).map((p) => p.path).join(', '));
    } else {
      match('PAGE_MAP -> FILE_ROLE_MAP', `all ${pages.pages.length} pages carry a file role`);
    }
  }

  /* ---- 3. every route's component file is a real indexed file ------- */
  {
    const bad = routes.routes.filter(
      (r) => r.componentFile && !rolePaths.has(r.componentFile),
    );
    if (bad.length) {
      conflict('ROUTE_MAP -> FILE_ROLE_MAP',
        `${bad.length} route(s) point at a file that is not indexed: ` +
        bad.slice(0, 5).map((r) => `${r.path} -> ${r.componentFile}`).join(', '));
    } else {
      const bound = routes.routes.filter((r) => r.componentFile).length;
      match('ROUTE_MAP -> FILE_ROLE_MAP', `${bound} route(s) resolve to an indexed file`);
    }
  }

  /* ---- 4. a route-associated component must be a page --------------- */
  {
    const roleOf = new Map(roles.files.map((f) => [f.path, f.role]));
    const bad = routes.routes.filter(
      (r) => r.componentFile && !['PAGE', 'PAGE_SHELL', 'COMPONENT', 'LAYOUT'].includes(roleOf.get(r.componentFile)),
    );
    if (bad.length) {
      conflict('ROUTE_MAP -> FILE_ROLE_MAP (role coherence)',
        `${bad.length} route(s) resolve to a file that is not a page/component/layout: ` +
        bad.slice(0, 5).map((r) => `${r.path} -> ${r.componentFile} (${roleOf.get(r.componentFile)})`).join(', '));
    } else {
      match('ROUTE_MAP -> FILE_ROLE_MAP (role coherence)',
        'every route resolves to a page, component, or layout');
    }
  }

  /* ---- 5. page <-> route agreement ---------------------------------- */
  {
    const pagesWithRoute = pages.pages.filter((p) => p.route);
    const routeFiles = new Set(routes.routes.map((r) => r.componentFile).filter(Boolean));
    const pagesNotRouted = pages.pages.filter((p) => !p.route && !routeFiles.has(p.path));
    if (pagesNotRouted.length) {
      warn('PAGE_MAP <-> ROUTE_MAP',
        `${pagesNotRouted.length} page(s) have no route; expected for shared/partial pages. ` +
        `e.g. ${pagesNotRouted.slice(0, 4).map((p) => p.path).join(', ')}`);
    }
    match('PAGE_MAP <-> ROUTE_MAP', `${pagesWithRoute.length} of ${pages.pages.length} pages carry a route path`);
  }

  /* ---- 6. FEATURE_MAP agrees with FEATURE_FILE_INDEX ---------------- */
  {
    const a = Object.fromEntries(features.features.map((f) => [f.feature, f.files]));
    const b = Object.fromEntries(Object.entries(ffi.index).map(([k, v]) => [k, v.length]));
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const diffs = [...keys].filter((k) => a[k] !== b[k]);
    if (diffs.length) {
      conflict('FEATURE_MAP <-> FEATURE_FILE_INDEX',
        `${diffs.length} feature(s) disagree on file count: ` +
        diffs.slice(0, 6).map((k) => `${k} (map=${a[k] ?? 'absent'}, index=${b[k] ?? 'absent'})`).join(', '));
    } else {
      match('FEATURE_MAP <-> FEATURE_FILE_INDEX',
        `all ${keys.size} features agree between both maps`);
    }
  }

  /* ---- 7. every indexed file belongs to exactly one feature ---------- */
  {
    const assigned = Object.values(ffi.index).flat();
    const unassigned = roles.files.filter((f) => !assigned.includes(f.path));
    const dupes = assigned.filter((p, i) => assigned.indexOf(p) !== i);
    if (dupes.length) {
      conflict('FEATURE_FILE_INDEX uniqueness', `${dupes.length} file(s) listed under more than one feature`);
    } else if (unassigned.length) {
      conflict('FEATURE_FILE_INDEX coverage', `${unassigned.length} indexed file(s) in no feature`);
    } else {
      match('FEATURE_FILE_INDEX coverage', `all ${assigned.length} files map to exactly one feature`);
    }
  }

  /* ---- 8. IMPORT_GRAPH agrees with REVERSE_DEPENDENCY_MAP ----------- */
  {
    const internal = graph.edges.filter((e) => e.resolution === 'internal');
    const mismatches = [];
    for (const e of internal) {
      const revEntry = rev.reverse[e.to];
      if (!revEntry) {
        mismatches.push(`target not in reverse map: ${e.to}`);
        continue;
      }
      if (!revEntry.importers.includes(e.from)) {
        mismatches.push(`edge ${e.from} -> ${e.to} missing from reverse map`);
      }
    }
    if (mismatches.length) {
      conflict('IMPORT_GRAPH <-> REVERSE_DEPENDENCY_MAP',
        `${mismatches.length} disagreement(s): ${mismatches.slice(0, 4).join('; ')}`);
    } else {
      match('IMPORT_GRAPH <-> REVERSE_DEPENDENCY_MAP',
        `all ${internal.length} internal edges are mirrored in the reverse map`);
    }
  }

  /* ---- 9. every SYMBOL_INDEX entry points at an indexed file -------- */
  {
    const bad = symbols.symbols.filter((s) => !rolePaths.has(s.path));
    if (bad.length) {
      conflict('SYMBOL_INDEX -> FILE_ROLE_MAP',
        `${bad.length} symbol(s) reference a non-indexed file: ` +
        [...new Set(bad.map((s) => s.path))].slice(0, 5).join(', '));
    } else {
      match('SYMBOL_INDEX -> FILE_ROLE_MAP',
        `all ${symbols.symbols.length} symbols live in indexed files`);
    }
  }

  /* ---- 10. PAGE_COMPONENT_INDEX only references real files ---------- */
  {
    const bad = [];
    for (const [, v] of Object.entries(pci.index)) {
      for (const c of v.transitive) if (!rolePaths.has(c.path)) bad.push(c.path);
      for (const d of v.direct) if (!rolePaths.has(d)) bad.push(d);
    }
    if (bad.length) {
      conflict('PAGE_COMPONENT_INDEX -> FILE_ROLE_MAP',
        `${bad.length} component reference(s) are not indexed: ${[...new Set(bad)].slice(0, 5).join(', ')}`);
    } else {
      match('PAGE_COMPONENT_INDEX -> FILE_ROLE_MAP',
        'every page component reference resolves');
    }
  }

  /* ---- 11. hooks and services exist in the role map ----------------- */
  {
    const missingHooks = hooks.hooks.filter((h) => !rolePaths.has(h.path));
    const missingServices = services.services.filter((s) => !rolePaths.has(s.path));
    if (missingHooks.length || missingServices.length) {
      conflict('HOOKS_MAP/SERVICE_MAP -> FILE_ROLE_MAP',
        `${missingHooks.length} hook(s) and ${missingServices.length} service(s) reference non-indexed files`);
    } else {
      match('HOOKS_MAP/SERVICE_MAP -> FILE_ROLE_MAP',
        `all ${hooks.hooks.length} hooks and ${services.services.length} services resolve`);
    }
  }

  /* ---- 12. API endpoints sit in router/controller/entrypoint files --- */
  {
    // ENTRY is allowed: an Express entrypoint that mounts routes directly on
    // `app` (`backend/src/server.js` -> app.get('/health')) declares real
    // routes. Requiring a separate routes/ file would have forced the rule to
    // reject genuine endpoints.
    const roleOf = new Map(roles.files.map((f) => [f.path, f.role]));
    const SERVE = ['ROUTE_CONFIG', 'API_ROUTE', 'CONTROLLER', 'ENTRY'];
    const bad = api.endpoints.filter((e) =>
      e.handlers.some((h) => !SERVE.includes(roleOf.get(h))));
    if (bad.length) {
      conflict('API_MAP -> FILE_ROLE_MAP',
        `${bad.length} endpoint(s) declared outside a router/controller/entrypoint: ` +
        bad.slice(0, 4).map((e) =>
          `${e.method} ${e.path} -> ${e.handlers.join(',')} ` +
          `(${e.handlers.map((h) => roleOf.get(h)).join(',')})`
        ).join(' | '));
    } else {
      match('API_MAP -> FILE_ROLE_MAP',
        `all ${api.counts.endpoints} endpoints live in router/controller/entrypoint files`);
    }
  }

  /* ---- 13. INTEGRATION_MAP agrees with the package inventory -------- */
  {
    const pkgSet = new Set(
      graph.edges.filter((e) => e.resolution === 'external').map((e) => e.to),
    );
    const claimed = integrations.integrations.flatMap((i) => i.packageNames);
    const notImported = [...new Set(claimed)].filter((p) => !pkgSet.has(p));
    if (notImported.length) {
      conflict('INTEGRATION_MAP <-> IMPORT_GRAPH',
        `${notImported.length} package(s) claimed as integrations but absent from the graph: ` +
        notImported.slice(0, 5).join(', '));
    } else {
      match('INTEGRATION_MAP <-> IMPORT_GRAPH',
        `all ${new Set(claimed).size} integration packages appear as real imports`);
    }
  }

/* ---- 14. manifest lists exactly the other artifacts ---------------- */
  {
    // The manifest cannot list itself: its `artifacts` array carries each file's
    // sha256, and a file cannot contain its own digest. So the expected
    // contract is "the manifest lists the other 18 artifacts, and those 18
    // plus the manifest are the artifacts that exist". Checking for exactly 19
    // self-referential entries would be checking for an impossibility.
    // The `match()` line below derives its own count from `allArtifacts`, so
    // this list stays the single place to update when an artifact is added.
    const MANIFEST_PATH = '.uihub-agent/generated/INTELLIGENCE_MANIFEST.json';
    const allArtifacts = [
      'codebase/API_MAP.json', 'codebase/COMPONENT_MAP.json',
      'codebase/DATABASE_USAGE_MAP.json', 'codebase/FEATURE_MAP.json',
      'codebase/FILE_ROLE_MAP.json', 'codebase/HOOKS_MAP.json',
      'codebase/INTEGRATION_MAP.json', 'codebase/PAGE_MAP.json',
      'codebase/ROUTE_MAP.json', 'codebase/SERVICE_MAP.json',
      'codebase/STORAGE_USAGE_MAP.json', 'generated/FEATURE_FILE_INDEX.json',
      'generated/IMPORT_GRAPH.json', 'generated/PAGE_COMPONENT_INDEX.json',
      'generated/REVERSE_DEPENDENCY_MAP.json', 'generated/SYMBOL_INDEX.json',
      // Phase 8: the router's two generated contracts.
      'generated/CONTEXT_BUNDLE_SCHEMA.json', 'generated/KNOWLEDGE_ROUTING_GRAPH.json',
    ].map((f) => `.uihub-agent/${f}`);

    const listed = new Set(manifest.artifacts.map((a) => a.path));
    const missingFromManifest = allArtifacts.filter((p) => !listed.has(p));
    const phantom = [...listed].filter((p) => p !== MANIFEST_PATH && !allArtifacts.includes(p));
    if (missingFromManifest.length || phantom.length) {
      conflict('INTELLIGENCE_MANIFEST <-> artifact set',
        `${missingFromManifest.length} unlisted (${missingFromManifest.slice(0, 3).join(', ')}), ` +
        `${phantom.length} phantom (${phantom.slice(0, 3).join(', ')})`);
    } else {
      match('INTELLIGENCE_MANIFEST <-> artifact set',
        `manifest lists exactly the ${allArtifacts.length} artifacts it can hash`);
    }
  }

  /* ---- 15. manifest source fingerprint is well formed -------------- */
  {
    if (!/^[0-9a-f]{64}$/.test(manifest.sourceFingerprint ?? '')) {
      conflict('INTELLIGENCE_MANIFEST fingerprint',
        'sourceFingerprint is not a sha256 hex digest');
    } else {
      match('INTELLIGENCE_MANIFEST fingerprint', 'sourceFingerprint is a valid sha256 digest');
    }
    const snapLen = manifest.sourceSnapshot?.length ?? 0;
    if (snapLen !== manifest.sourceFileCount) {
      conflict('INTELLIGENCE_MANIFEST snapshot',
        `sourceSnapshot has ${snapLen} entries but sourceFileCount claims ${manifest.sourceFileCount}`);
    } else {
      match('INTELLIGENCE_MANIFEST snapshot',
        `snapshot covers all ${snapLen} indexed source files`);
    }
  }

  /* ---- 16. no credential-shaped data in the indexes (defence) ------- */
  {
    const db = load('codebase/DATABASE_USAGE_MAP.json');
    const st = load('codebase/STORAGE_USAGE_MAP.json');
    // Values here are collection names and storage keys; they must never look like
    // a URI or key. The full detector runs in generate-index before writing.
    const suspicious = [...db.usage.flatMap((u) => u.collections), ...st.literalKeys]
      .filter((v) => /mongodb(\+srv)?:\/\/|AKIA|-----BEGIN|whsec_|rzp_live/i.test(v));
    if (suspicious.length) {
      conflict('indexes contain credential-shaped strings',
        `${suspicious.length} suspicious value(s): ${suspicious.slice(0, 3).join(', ')}`);
    } else {
      match('indexes contain credential-shaped strings',
        'no collection name or storage key resembles a credential');
    }
  }

  /* ---- 17. unresolved import edges (WARN, not a failure) ------------ */
  {
    if (graph.counts.unresolvedEdges > 0) {
      const byReason = {};
      for (const e of graph.unresolvedEdges) {
        byReason[e.detail] = (byReason[e.detail] || 0) + 1;
      }
      warn('IMPORT_GRAPH unresolved edges',
        `${graph.counts.unresolvedEdges} specifier(s) did not resolve: ` +
        Object.entries(byReason).map(([k, v]) => `${v}x ${k}`).join('; '));
    } else {
      match('IMPORT_GRAPH unresolved edges', 'every import specifier resolved');
    }
  }

  /* ---- 18. orphaned components (WARN, a repository finding) --------- */
  {
    const orphans = comps.components.filter((c) => c.orphaned);
    if (orphans.length) {
      warn('COMPONENT_MAP orphans',
        `${orphans.length} component(s) have no importer: ` +
        orphans.slice(0, 5).map((c) => `${c.path} (${c.lines} lines)`).join(', '));
    } else {
      match('COMPONENT_MAP orphans', 'every component has at least one importer');
    }
  }

  /* ---- 18. Phase 8 routing contracts agree with the code ---------- */
  {
    // ROUTING_MATRIX.json is a checked-in contract, but the source of truth is
    // buildRoutingMatrix(). If someone edits the JSON without the module, every
    // category the router actually uses silently disagrees with the document a
    // reader trusts.
    const checkedIn = readFileSync(join(ROOT, '.uihub-agent/tasks/ROUTING_MATRIX.json'), 'utf8');
    const built = JSON.stringify(buildRoutingMatrix(), null, 2) + '\n';
    if (checkedIn.trimEnd() !== built.trimEnd()) {
      conflict('ROUTING_MATRIX <-> router-matrix.mjs',
        'tasks/ROUTING_MATRIX.json is stale; regenerate it with: node .uihub-agent/scripts/lib/router-matrix.mjs');
    } else {
      match('ROUTING_MATRIX <-> router-matrix.mjs',
        `checked-in matrix equals buildRoutingMatrix() across ${Object.keys(buildRoutingMatrix().categories).length} categories`);
    }

    // Every knowledge path the matrix names must actually exist on disk, or the
    // router will confidently tell the agent to read a file that is not there.
    const matrix = buildRoutingMatrix();
    const missingDocs = new Set();
    for (const cat of Object.values(matrix.categories)) {
      for (const k of cat.knowledge ?? []) {
        const p = knowledgeRel(k);
        if (!existsSync(join(ROOT, AGENT_DIR, p))) missingDocs.add(k);
      }
    }
    if (missingDocs.size) {
      conflict('KNOWLEDGE paths <-> filesystem',
        `${missingDocs.size} knowledge path(s) named by the matrix do not exist: ${[...missingDocs].slice(0, 3).join(', ')}`);
    } else {
      match('KNOWLEDGE paths <-> filesystem',
        'every knowledge path named by the routing matrix exists');
    }

    // The generated graph must be a faithful projection of the matrix.
    const graph = load('generated/KNOWLEDGE_ROUTING_GRAPH.json');
    const expectedEdges = Object.values(matrix.categories)
      .reduce((n, c) => n + (c.knowledge?.length ?? 0), 0);
    if ((graph.edges?.length ?? 0) !== expectedEdges) {
      conflict('KNOWLEDGE_ROUTING_GRAPH <-> router-matrix',
        `graph has ${graph.edges?.length ?? 0} edges but the matrix declares ${expectedEdges}`);
    } else {
      match('KNOWLEDGE_ROUTING_GRAPH <-> router-matrix',
        `graph projects all ${expectedEdges} category->knowledge edges`);
    }
  }

  return emit(json);
}

function emit(json) {
  const bad = results.filter((r) => r.level === 'CONFLICT' || r.level === 'MISSING');
  const warnings = results.filter((r) => r.level === 'WARN');

  if (json) {
    console.log(JSON.stringify({
      status: bad.length ? 'FAIL' : 'PASS',
      checked: results.filter((r) => r.level === 'MATCH').length,
      warnings: warnings.length,
      failures: bad.length,
      results,
    }, null, 2));
  } else {
    for (const r of results) {
      if (r.level === 'MATCH') continue;
      console.log(`[check-index] ${r.level.padEnd(8)} ${r.rule}\n             ${r.message}`);
    }
    const passed = results.filter((r) => r.level === 'MATCH').length;
    console.log(
      `[check-index] ${passed} cross-reference(s) MATCH, ${warnings.length} WARN, ${bad.length} FAIL`,
    );
    if (!bad.length) console.log('[check-index] all intelligence indexes agree with each other');
  }
  process.exit(bad.length ? 1 : 0);
}

main();