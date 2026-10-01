#!/usr/bin/env node
/**
 * Intelligence query CLI — agent.md tasks 7.19–7.22, extended by Phase 8 (8.16, 8.19).
 *
 * The indexes are large on purpose: SYMBOL_INDEX alone holds ~2,940 symbols and
 * IMPORT_GRAPH ~1,100 internal edges. An agent that reads those files spends
 * most of its context on data it does not need, which is exactly the failure the
 * Phase 7 brief warns about ("Do not create a graph so verbose that agents
 * cannot practically use it").
 *
 * So the indexes stay on disk and this tool answers questions about them,
 * printing only the lines that answer the question. Every example query in
 * agent.md A7.22 and every success criterion in A50 is a subcommand here, so the
 * documented examples are executable rather than aspirational.
 *
 * Phase 8 (8.16) requires the task router to sit ON TOP of these indexes rather
 * than build a second parser. That is why this module is now two layers:
 *
 *   queries   pure accessors, return plain data. The router imports these.
 *   commands  printers. Each one renders a `queries` result for a human.
 *
 * The commands never reach into an index directly, so a routing bug cannot be
 * fixed in one place and stay broken in the other. `--json` returns the `queries`
 * result verbatim, which is what agent.md 8.19 asks for: metadata and paths
 * first, no source code in the default output.
 *
 * Usage:
 *   npm run agent:query -- <command> [args]
 *   npm run agent:query -- <command> [args] --json
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '..', '..');
export const AGENT_DIR = join(ROOT, '.uihub-agent');

const cache = new Map();

/** Read one generated index. Cached for the life of the process. */
export function load(rel) {
  if (cache.has(rel)) return cache.get(rel);
  const p = join(AGENT_DIR, rel);
  if (!existsSync(p)) {
    fail(`missing index: .uihub-agent/${rel}\n  run: npm run agent:index`);
  }
  const v = JSON.parse(readFileSync(p, 'utf8'));
  cache.set(rel, v);
  return v;
}

export function fail(msg) {
  console.error(`[query-index] ${msg}`);
  process.exit(1);
}

/** Windows shells hand back backslash paths; every index key uses forward slashes. */
export function slash(p) {
  return String(p).replace(/\\/g, '/');
}

/** Raised by `queries` for a usage error. `run()` turns it into exit 1. */
export class UsageError extends Error {}

/* ------------------------------------------------------------------ *
 * Impact model (7.19 / 7.20 / 7.21)
 *
 * Qualitative levels only — the brief explicitly forbids a numeric risk score,
 * because a fabricated 0-100 number is read as a measurement. Every level below
 * states the EVIDENCE that produced it so the reader can disagree.
 * ------------------------------------------------------------------ */

const PROTECTED_HIGH = /\.uihub-agent|\bbackend\/src\/(?:config|middleware|services)\//;

export function impactOf(path) {
  path = slash(path);
  const rev = load('generated/REVERSE_DEPENDENCY_MAP.json');
  const pci = load('generated/PAGE_COMPONENT_INDEX.json');
  const roles = load('codebase/FILE_ROLE_MAP.json');

  const entry = rev.reverse[path];
  const roleFile = roles.files.find((f) => f.path === path);

  if (!entry) {
    // Not indexed. Distinguish "not a source file at all" from "present but
    // out of scope", because those are different answers for someone deciding
    // whether an edit is safe.
    const evidence = [];
    if (!existsSync(join(ROOT, path))) {
      evidence.push('no such file in the working tree');
    } else if (roleFile) {
      evidence.push('file exists but has no entry in REVERSE_DEPENDENCY_MAP');
    } else {
      evidence.push('file is outside the 8 indexed source roots (excluded by extension, name, or directory)');
    }
    return { level: 'UNKNOWN', evidence, notFound: true };
  }

  const importers = entry.importers;
  const consumers = [];

  // PAGE_COMPONENT_INDEX is keyed BY PAGE PATH, so the page path is the KEY, not
  // a field on the value.
  for (const [pagePath, p] of Object.entries(pci.index)) {
    if (p.transitive.some((t) => t.path === path)) consumers.push(pagePath);
  }

  const features = new Set();
  for (const imp of importers) {
    const f = roles.files.find((x) => x.path === imp);
    if (f) features.add(f.feature);
  }

  const evidence = [];
  let level;

  if (importers.length === 0) {
    level = 'LOW';
    evidence.push(`no importers — nothing in the index depends on it`);
  } else if (PROTECTED_HIGH.test(path) && importers.length >= 3) {
    level = 'CRITICAL';
    evidence.push(`${importers.length} importers`);
    evidence.push('path is protected by rules/PROTECTED_PATHS.md');
    evidence.push(`reached from ${consumers.length} page(s)`);
  } else if (consumers.length >= 2 || features.size >= 4) {
    level = 'HIGH';
    evidence.push(`${importers.length} importers across ${features.size} feature(s)`);
    evidence.push(`rendered by ${consumers.length} page(s)`);
  } else if (importers.length >= 2 || consumers.length === 1) {
    level = 'MEDIUM';
    evidence.push(`${importers.length} importers across ${features.size} feature(s)`);
    evidence.push(`rendered by ${consumers.length} page(s)`);
  } else {
    level = 'MEDIUM';
    evidence.push(`1 importer (${importers[0]})`);
  }

  return {
    level,
    evidence,
    role: roleFile?.role,
    feature: roleFile?.feature,
    importers,
    consumers,
    features: [...features].sort(),
  };
}

/* ------------------------------------------------------------------ *
 * Layer 1 — structured queries.
 *
 * Every function here returns data and nothing else: no printing, no
 * process.exit. That is what makes the router in lib/router.mjs possible
 * without a second implementation of the same index questions.
 * ------------------------------------------------------------------ */

export const queries = {};

queries.symbol = (arg) => {
  if (!arg) throw new UsageError('usage: symbol <name>');
  const si = load('generated/SYMBOL_INDEX.json');
  const rev = load('generated/REVERSE_DEPENDENCY_MAP.json');
  const entry = si.symbolsByName[arg];
  if (!entry) {
    return {
      found: false,
      name: arg,
      similar: Object.keys(si.symbolsByName)
        .filter((n) => n.toLowerCase().includes(arg.toLowerCase()))
        .slice(0, 8),
    };
  }
  return {
    found: true,
    name: arg,
    ambiguous: !!entry.ambiguous,
    locations: entry.locations.map((loc) => {
      const path = loc.split(':')[0];
      const e = rev.reverse[path];
      return { loc, path, role: e?.role ?? null, importers: e?.importers ?? [] };
    }),
  };
};

queries.component = (arg) => {
  if (!arg) throw new UsageError('usage: component <name|path>');
  const cm = load('codebase/COMPONENT_MAP.json');
  const pci = load('generated/PAGE_COMPONENT_INDEX.json');
  const q = arg.toLowerCase();
  const hits = cm.components
    .filter((c) => c.path.toLowerCase().includes(q) || c.name.toLowerCase() === q)
    .map((c) => {
      const impact = impactOf(c.path);
      let alsoOn = null;
      if (c.orphaned) {
        alsoOn = Object.entries(pci.index)
          .filter(([, v]) => v.transitive.some((x) => x.path === c.path))
          .map(([page]) => page);
      }
      return { component: c, impact, alsoOn };
    });
  return { query: arg, hits };
};

queries.hook = (arg) => {
  if (!arg) throw new UsageError('usage: hook <name>');
  const hm = load('codebase/HOOKS_MAP.json');
  const q = arg.toLowerCase();
  return {
    query: arg,
    total: hm.hooks.length,
    allNames: hm.hooks.map((h) => h.name),
    hits: hm.hooks.filter((h) => h.name.toLowerCase().includes(q) || h.path.toLowerCase().includes(q)),
  };
};

queries.service = (arg) => {
  if (!arg) throw new UsageError('usage: service <name>');
  const sm = load('codebase/SERVICE_MAP.json');
  const q = arg.toLowerCase();
  return {
    query: arg,
    hits: sm.services
      .filter((s) => s.name.toLowerCase().includes(q))
      .map((s) => ({ service: s, impact: impactOf(s.path) })),
  };
};

queries.feature = (arg) => {
  if (!arg) throw new UsageError('usage: feature <slug>');
  const fm = load('codebase/FEATURE_MAP.json');
  const f = fm.features.find((x) => x.feature === arg);
  return {
    query: arg,
    available: fm.features.map((x) => x.feature),
    feature: f ?? null,
  };
};

queries['list-features'] = () => {
  const fm = load('codebase/FEATURE_MAP.json');
  return { features: fm.features };
};

queries['list-symbols'] = (arg) => {
  const si = load('generated/SYMBOL_INDEX.json');
  const entries = Object.entries(si.symbolsByName);
  if (!arg) {
    return {
      filter: null,
      total: entries.length,
      names: entries.slice(0, 40).map(([n, v]) => ({ name: n, locations: v.locations, ambiguous: !!v.ambiguous })),
    };
  }
  const q = arg.toLowerCase();
  return {
    filter: arg,
    total: entries.length,
    names: entries
      .filter(([n]) => n.toLowerCase().includes(q))
      .map(([n, v]) => ({ name: n, locations: v.locations, ambiguous: !!v.ambiguous })),
  };
};

queries.endpoint = (arg) => {
  if (!arg) throw new UsageError('usage: endpoint <METHOD /path>   (e.g. "POST /api/payments")');
  const am = load('codebase/API_MAP.json');
  const q = arg.toLowerCase();
  return {
    query: arg,
    hits: am.endpoints
      .filter((e) => `${e.method} ${e.path}`.toLowerCase().includes(q))
      .map((e) => ({ endpoint: e, handlers: e.handlers.map((h) => ({ path: h, impact: impactOf(h) })) })),
  };
};

queries.database = (arg) => {
  const dm = load('codebase/DATABASE_USAGE_MAP.json');
  return {
    query: arg ?? null,
    counts: dm.counts,
    usage: arg ? dm.usage.filter((u) => u.file.toLowerCase().includes(arg.toLowerCase())) : dm.usage,
  };
};

queries.storage = (arg) => {
  const sm = load('codebase/STORAGE_USAGE_MAP.json');
  return {
    query: arg ?? null,
    counts: sm.counts,
    usage: arg ? sm.usage.filter((u) => u.file.toLowerCase().includes(arg.toLowerCase())) : sm.usage,
  };
};

queries.integration = (arg) => {
  const im = load('codebase/INTEGRATION_MAP.json');
  if (!arg) {
    return { query: null, integrations: im.integrations, envVars: im.envVars };
  }
  return {
    query: arg,
    integrations: im.integrations,
    envVars: im.envVars,
    integration: im.integrations.find((i) => i.name.toLowerCase().includes(arg.toLowerCase())) ?? null,
  };
};

queries.importers = (arg) => {
  if (!arg) throw new UsageError('usage: importers <path>');
  const path = slash(arg);
  const rev = load('generated/REVERSE_DEPENDENCY_MAP.json');
  return { query: path, entry: rev.reverse[path] ?? null };
};

queries.impact = (arg) => {
  if (!arg) throw new UsageError('usage: impact <path>');
  const path = slash(arg);
  return { query: path, ...impactOf(path) };
};

queries.routes = () => {
  const rm = load('codebase/ROUTE_MAP.json');
  return { counts: rm.counts, routerFiles: rm.routerFiles, routes: rm.routes };
};

queries['route-pages'] = () => {
  const pci = load('generated/PAGE_COMPONENT_INDEX.json');
  return {
    pages: Object.entries(pci.index).map(([page, v]) => ({
      page,
      feature: v.feature,
      route: v.route ?? null,
      direct: v.direct,
      transitive: v.transitive,
    })),
  };
};

queries.stats = () => {
  const man = load('generated/INTELLIGENCE_MANIFEST.json');
  const ig = load('generated/IMPORT_GRAPH.json');
  return {
    sourceFingerprint: man.sourceFingerprint,
    sourceFileCount: man.sourceFileCount,
    sourceBytes: man.sourceBytes,
    generatedAt: man.generatedAt,
    timingsMs: man.timingsMs,
    artifacts: man.artifacts,
    graphCounts: ig.counts,
  };
};

queries.orphans = () => {
  const cm = load('codebase/COMPONENT_MAP.json');
  const fr = load('codebase/FILE_ROLE_MAP.json');
  return {
    counts: cm.counts,
    components: cm.components.filter((x) => x.orphaned).sort((a, b) => b.lines - a.lines),
    isolated: fr.files.filter((f) => f.inbound === 0 && f.outbound === 0),
  };
};

queries.role = (arg) => {
  if (!arg) throw new UsageError('usage: role <ROLE>   (e.g. PAGE, SERVICE, MCP_TOOL)');
  const fr = load('codebase/FILE_ROLE_MAP.json');
  const role = arg.toUpperCase();
  return { role, files: fr.files.filter((f) => f.role === role) };
};

queries.confidence = () => {
  const ig = load('generated/IMPORT_GRAPH.json');
  const rm = load('codebase/ROUTE_MAP.json');
  const cm = load('codebase/COMPONENT_MAP.json');
  return {
    components: cm.counts.confidence,
    routes: rm.counts.association,
    unresolvedEdges: ig.unresolvedEdges,
    unresolvedCount: ig.counts.unresolvedEdges,
  };
};

/* ------------------------------------------------------------------ *
 * Layer 2 — human printers. Each renders a `queries` result.
 * ------------------------------------------------------------------ */

const out = [];
const say = (s = '') => { out.push(s); };
const flush = () => { process.stdout.write(out.join('\n') + '\n'); };

export const commands = {};

commands.symbol = (r) => {
  if (!r.found) {
    say(`no symbol named "${r.name}"`);
    if (r.similar.length) say(`similar: ${r.similar.join(', ')}`);
    return;
  }
  say(`SYMBOL ${r.name}${r.ambiguous ? '   (AMBIGUOUS NAME)' : ''}`);
  for (const loc of r.locations) {
    say(`  ${loc.loc}`);
    say(`      role=${loc.role ?? '?'}  importers=${loc.importers.length}`);
    for (const i of loc.importers.slice(0, 8)) say(`        ← ${i}`);
    if (loc.importers.length > 8) say(`        … +${loc.importers.length - 8} more`);
  }
  if (r.ambiguous) {
    say('  NOTE: same name at several locations — disambiguate by path, not by name.');
  }
};

commands.component = (r) => {
  if (!r.hits.length) { say(`no component matching "${r.query}"`); return; }
  for (const { component: c, impact: imp, alsoOn } of r.hits) {
    say(`COMPONENT ${c.name}`);
    say(`  path      ${c.path}`);
    say(`  feature   ${c.feature}   ${c.lines} lines   lazy=${c.lazy}`);
    say(`  confidence ${c.confidence}`);
    say(`  impact    ${imp.level}`);
    for (const e of imp.evidence) say(`            - ${e}`);
    say(`  exported  ${c.exportedSymbols.join(', ') || '(none)'}`);
    say(`  imports   ${c.importsInternal.length} internal`);
    for (const i of c.importsInternal.slice(0, 10)) say(`            → ${i}`);
    if (c.importsInternal.length > 10) say(`            … +${c.importsInternal.length - 10} more`);
    say(`  used by pages   ${c.usedByPages.length}`);
    for (const p of c.usedByPages.slice(0, 10)) say(`            ${p}`);
    if (c.orphaned) {
      say('  ORPHANED  no file imports this component.');
      say('            live components on same routes:');
      if (alsoOn.length === 0) say('            (not reachable from any indexed page)');
      for (const page of alsoOn.slice(0, 5)) say(`            ${page}`);
    }
    say('');
  }
};

commands.hook = (r) => {
  if (!r.hits.length) {
    say(`no hook matching "${r.query}"`);
    say(`this repository defines ${r.total} custom hook(s): ${r.allNames.join(', ')}`);
    return;
  }
  for (const h of r.hits) {
    say(`HOOK ${h.name}`);
    say(`  path     ${h.path}`);
    say(`  feature  ${h.feature}   ${h.lines} lines`);
    say(`  used by  ${h.usedBy.length}`);
    for (const u of h.usedBy.slice(0, 12)) say(`          ← ${u}`);
    if (!h.usedBy.length) say('          (unused)');
  }
};

commands.service = (r) => {
  if (!r.hits.length) { say(`no service matching "${r.query}"`); return; }
  for (const { service: s, impact: imp } of r.hits) {
    say(`SERVICE ${s.name}`);
    say(`  path      ${s.path}   (${s.layer})`);
    say(`  feature   ${s.feature}   ${s.lines} lines`);
    say(`  database  ${s.touchesDatabase}   storage ${s.touchesStorage}`);
    say(`  externals ${s.externalPackages.join(', ') || '(none)'}`);
    say(`  used by   ${s.usedBy.length}`);
    for (const u of s.usedBy.slice(0, 12)) say(`           ← ${u}`);
    say(`  impact    ${imp.level}`);
    for (const e of imp.evidence) say(`           - ${e}`);
  }
};

commands.feature = (r) => {
  const f = r.feature;
  if (!f) {
    say(`no feature "${r.query}"`);
    say(`available: ${r.available.join(', ')}`);
    return;
  }
  say(`FEATURE ${f.feature}`);
  say(`  files       ${f.files}  (${f.lines} lines)`);
  say(`  roles       ${Object.entries(f.roles).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  say(`  entryPoints ${f.entryPoints.length}`);
  for (const e of f.entryPoints.slice(0, 10)) say(`               ${e}`);
  say(`  endpoints   ${f.endpoints.length}`);
  for (const e of f.endpoints.slice(0, 12)) say(`               ${e}`);
  say(`  externals   ${f.externalPackages.slice(0, 12).join(', ') || '(none)'}`);
};

commands['list-features'] = (r) => {
  say('FEATURES');
  for (const f of r.features) {
    say(`  ${String(f.files).padStart(4)} files  ${String(f.lines).padStart(7)} lines  ${f.feature}`);
  }
};

commands['list-symbols'] = (r) => {
  if (!r.filter) {
    say(`  ${r.total} distinct names`);
    for (const n of r.names) say(`  ${n.name}  →  ${n.locations[0]}`);
    say('  … pass an argument to filter');
    return;
  }
  for (const n of r.names) {
    say(`  ${n.name}  →  ${n.locations.join(', ')}${n.ambiguous ? '   (ambiguous)' : ''}`);
  }
};

commands.endpoint = (r) => {
  if (!r.hits.length) { say(`no endpoint matching "${r.query}"`); return; }
  for (const { endpoint: e, handlers } of r.hits) {
    say(`ENDPOINT ${e.method} ${e.path}`);
    say(`  feature ${e.feature}`);
    for (const h of handlers) {
      say(`  handler ${h.path}`);
      say(`  impact  ${h.impact.level}`);
      for (const x of h.impact.evidence) say(`          - ${x}`);
    }
  }
};

commands.database = (r) => {
  say(`DATABASE USAGE — ${r.counts.files} files, ${r.counts.distinctCollections} collections, ${r.counts.models} models`);
  for (const u of r.usage) {
    say(`  ${u.file}`);
    if (u.collections.length) say(`     collections: ${u.collections.join(', ')}`);
    if (u.models.length) say(`     models: ${u.models.map((m) => m.name).join(', ')}`);
    if (u.prisma) say('     prisma: yes');
    if (u.rawSql) say('     raw SQL: yes');
  }
};

commands.storage = (r) => {
  say(`STORAGE — files=${r.counts.files} stores=${r.counts.stores.join(', ')} literalKeys=${r.counts.literalKeys}`);
  for (const u of r.usage) {
    say(`  ${u.file}  [${u.stores.join(', ')}]`);
    const keys = u.calls.map((c) => c.key).filter(Boolean);
    if (keys.length) say(`     keys: ${[...new Set(keys)].slice(0, 10).join(', ')}`);
  }
};

commands.integration = (r) => {
  if (!r.query) {
    say(`INTEGRATIONS (${r.integrations.length})`);
    for (const i of r.integrations) say(`  ${i.name.padEnd(24)} ${i.usedIn.length} file(s)`);
    say(`\nENV VARS REFERENCED (${r.envVars.length})`);
    for (const e of r.envVars.slice(0, 30)) say(`  ${e.name}`);
    return;
  }
  if (!r.integration) { say(`no integration "${r.query}"`); return; }
  say(`INTEGRATION ${r.integration.name}`);
  say(`  packages ${r.integration.packageNames.join(', ')}`);
  for (const u of r.integration.usedIn.slice(0, 20)) say(`  used in  ${u}`);
};

/** Every file that imports the given file — the first thing to check before editing. */
commands.importers = (r) => {
  if (!r.entry) { say(`"${r.query}" is not an indexed file`); return; }
  say(`IMPORTERS OF ${r.query}  (${r.entry.importedBy})`);
  say(`  role ${r.entry.role}   feature ${r.entry.feature}`);
  for (const i of r.entry.importers) say(`  ← ${i}`);
  if (r.entry.dynamicImporters.length) {
    say(`  dynamic (code-split): ${r.entry.dynamicImporters.join(', ')}`);
  }
};

commands.impact = (r) => {
  say(`IMPACT ${r.query}`);
  say(`  level  ${r.level}${r.notFound ? '  (not indexed)' : ''}`);
  if (r.role) say(`  role   ${r.role}   feature ${r.feature}`);
  for (const e of r.evidence || []) say(`  - ${e}`);
  if (r.importers?.length) {
    say(`  importers (${r.importers.length}):`);
    for (const i of r.importers.slice(0, 20)) say(`    ${i}`);
    if (r.importers.length > 20) say(`    … +${r.importers.length - 20} more`);
  }
  if (r.consumers?.length) {
    say(`  pages rendering it (${r.consumers.length}):`);
    for (const c of r.consumers.slice(0, 15)) say(`    ${c}`);
  }
};

commands.routes = (r) => {
  say(`ROUTES — ${r.counts.routes} declared in ${r.routerFiles.join(', ')}`);
  for (const rt of r.routes) {
    say(`  ${String(rt.path).padEnd(30)} ${String(rt.element ?? '').padEnd(24)} ${rt.association === 'none' ? '(unassociated)' : rt.componentFile ?? ''}`);
  }
};

commands['route-pages'] = (r) => {
  for (const p of r.pages) {
    say(`PAGE ${p.page}`);
    say(`  route ${p.route ?? '(none)'}   feature ${p.feature}`);
    for (const c of p.transitive.slice(0, 12)) say(`  ${'  '.repeat(Math.min(c.depth, 4))}└ ${c.path}`);
    if (p.transitive.length > 12) say(`  … +${p.transitive.length - 12} more`);
  }
};

commands.stats = (r) => {
  say('INDEX MANIFEST');
  say(`  sourceFingerprint ${r.sourceFingerprint.slice(0, 16)}`);
  say(`  source files       ${r.sourceFileCount}  (${(r.sourceBytes / 1048576).toFixed(1)} MB)`);
  say(`  generated at       ${r.generatedAt}`);
  say(`  timings (ms)       ${JSON.stringify(r.timingsMs)}`);
  say('  artifacts:');
  for (const a of r.artifacts) say(`    ${String(a.bytes).padStart(8)}  ${a.path}`);
  say(`  graph: ${JSON.stringify(r.graphCounts)}`);
};

commands.orphans = (r) => {
  say(`ORPHANED COMPONENTS (${r.counts.orphaned} of ${r.counts.components}) — no importer in the index`);
  for (const c of r.components) {
    say(`  ${String(c.lines).padStart(5)} lines  ${c.path}`);
  }
  say(`\nISOLATED FILES (${r.isolated.length}) — no edges in either direction`);
  for (const f of r.isolated.slice(0, 20)) say(`  ${f.role.padEnd(12)} ${f.path}`);
};

commands.role = (r) => {
  say(`ROLE ${r.role} — ${r.files.length} file(s)`);
  for (const f of r.files) say(`  ${f.path}  [${f.feature}] ${f.roleSource}`);
};

commands.confidence = (r) => {
  say('CONFIDENCE DISTRIBUTION');
  say(`  components  ${JSON.stringify(r.components)}`);
  say(`  routes      ${JSON.stringify(r.routes)}`);
  say(`  unresolved  ${r.unresolvedCount}`);
  for (const e of r.unresolvedEdges) say(`    ${e.from}  '${e.specifier}'  — ${e.detail}`);
};

/* ------------------------------------------------------------------ *
 * Dispatch
 * ------------------------------------------------------------------ */

export const COMMAND_NAMES = Object.keys(commands);

/** Run one query by name. Returns the structured result. Throws UsageError. */
export function run(name, arg) {
  const q = queries[name];
  if (!q) throw new UsageError(`unknown command "${name}". Try: node query-index.mjs --help`);
  return q(arg);
}

/** Run one query and print it for a human. */
export function printCommand(name, arg) {
  const printer = commands[name];
  if (!printer) throw new UsageError(`unknown command "${name}". Try: node query-index.mjs --help`);
  printer(queries[name](arg));
}

function usage() {
  say('agent:query — read-only questions against the Phase 7 intelligence indexes');
  say('');
  say('  symbol <name>                 where a symbol lives, and who imports that file');
  say('  component <name|path>         component, its imports, pages using it, impact');
  say('  hook <name>                   hook and its consumers');
  say('  service <name>                service, its data reach, its consumers, impact');
  say('  feature <slug>                everything inside one feature');
  say('  list-features                 every feature with file and line counts');
  say('  list-symbols [filter]         symbol names, optionally filtered');
  say('  endpoint <METHOD /path>       endpoint handlers and their impact');
  say('  database [path]               files touching Mongo / Prisma / SQL');
  say('  storage [path]                localStorage / Redis / Firebase Storage usage');
  say('  integration [name]            external services, or all of them');
  say('  routes                        every declared route and its component');
  say('  route-pages                   component tree reachable from each page');
  say('  importers <path>              who imports this file');
  say('  impact <path>                 qualitative blast radius + evidence');
  say('  orphans                       components and files with no inbound edge');
  say('  role <ROLE>                   files with a given role');
  say('  confidence                    confidence distribution + unresolved edges');
  say('  stats                         manifest, fingerprints, timings');
  say('');
  say('  --json                        machine-readable output (agent.md 8.19)');
  flush();
}

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const rest = argv.filter((a) => a !== '--json');
  const name = rest[0];

  // Accept `help` as well as `--help`. Every command in this knowledge base is
  // documented as `npm run agent:query -- help`, and an npm run passing a bare
  // `help` through to the script must not report "unknown command".
  if (!name || name === '--help' || name === '-h' || name === 'help') {
    usage();
    return;
  }

  const arg = rest.slice(1).join(' ').trim();
  try {
    if (json) {
      const result = run(name, arg);
      process.stdout.write(JSON.stringify({ command: name, argument: arg || null, result }, null, 2) + '\n');
    } else {
      printCommand(name, arg);
      flush();
    }
  } catch (err) {
    if (err instanceof UsageError) {
      console.error(`[query-index] ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
}

// Importing this module must not run the CLI. Phase 8 (8.16) imports `queries`
// from the router; that import has to stay silent.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}