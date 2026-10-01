#!/usr/bin/env node
/**
 * Intelligence query CLI — agent.md tasks 7.19–7.22.
 *
 * The indexes are large on purpose: SYMBOL_INDEX alone holds ~2,940 symbols and
 * IMPORT_GRAPH ~1,100 internal edges. An agent that reads those files spends
 * most of its context on data it does not need, which is exactly the failure the
 * Phase 7 brief warns about ("Do not create a graph so verbose that agents
 * cannot practically use it").
 *
 * So the indexes stay on disk and this tool answers questions about them,
 * printing only the lines that answer the question. Every example query in
 * agent.md §7.22 and every success criterion in §50 is a subcommand here, so the
 * documented examples are executable rather than aspirational.
 *
 * Usage:
 *   npm run agent:query -- <command> [args]
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const AGENT_DIR = join(ROOT, '.uihub-agent');

const cache = new Map();
function load(rel) {
  if (cache.has(rel)) return cache.get(rel);
  const p = join(AGENT_DIR, rel);
  if (!existsSync(p)) {
    fail(`missing index: .uihub-agent/${rel}\n  run: npm run agent:index`);
  }
  const v = JSON.parse(readFileSync(p, 'utf8'));
  cache.set(rel, v);
  return v;
}

function fail(msg) {
  console.error(`[query-index] ${msg}`);
  process.exit(1);
}

const out = [];
const say = (s = '') => { out.push(s); };
const flush = () => { process.stdout.write(out.join('\n') + '\n'); };

/* ------------------------------------------------------------------ *
 * Impact model (7.19 / 7.20 / 7.21)
 *
 * Qualitative levels only — the brief explicitly forbids a numeric risk score,
 * because a fabricated 0-100 number is read as a measurement. Every level below
 * states the EVIDENCE that produced it so the reader can disagree.
 * ------------------------------------------------------------------ */

const PROTECTED_HIGH = /\.uihub-agent|\bbackend\/src\/(?:config|middleware|services)\//;

function impactOf(path) {
  const rev = load('generated/REVERSE_DEPENDENCY_MAP.json');
  const pci = load('generated/PAGE_COMPONENT_INDEX.json');
  const roles = load('codebase/FILE_ROLE_MAP.json');
  const pages = load('codebase/PAGE_MAP.json');

  const entry = rev.reverse[path];
  if (!entry) {
    // Not indexed. Distinguish "not a source file at all" from "present but
    // out of scope", because those are different answers for someone deciding
    // whether an edit is safe.
    const evidence = [];
    if (!existsSync(join(ROOT, path))) {
      evidence.push('no such file in the working tree');
    } else {
      const roleFile0 = roles.files.find((f) => f.path === path);
      if (roleFile0) evidence.push('file exists but has no entry in REVERSE_DEPENDENCY_MAP');
      else evidence.push('file is outside the 8 indexed source roots (excluded by extension, name, or directory)');
    }
    return { level: 'UNKNOWN', evidence, notFound: true };
  }

  const roleFile = roles.files.find((f) => f.path === path);
  const importers = entry.importers;
  const consumers = [];

  // PAGE_COMPONENT_INDEX is keyed BY PAGE PATH. The old loop did
// `Object.values(pci.index)` and then read `p.path`, which does not exist on a
// value object -- only on the key. Every consumer therefore printed `undefined`,
// so "which pages render this" was silently always wrong.
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
 * Commands
 * ------------------------------------------------------------------ */

const commands = {};

commands.symbol = (arg) => {
  if (!arg) fail('usage: symbol <name>');
  const si = load('generated/SYMBOL_INDEX.json');
  const entry = si.symbolsByName[arg];
  const rev = load('generated/REVERSE_DEPENDENCY_MAP.json');
  if (!entry) {
    const near = Object.keys(si.symbolsByName)
      .filter((n) => n.toLowerCase().includes(arg.toLowerCase()))
      .slice(0, 8);
    say(`no symbol named "${arg}"`);
    if (near.length) say(`similar: ${near.join(', ')}`);
    return;
  }
  say(`SYMBOL ${arg}${entry.ambiguous ? '   (AMBIGUOUS NAME)' : ''}`);
  for (const loc of entry.locations) {
    const [path, line] = loc.split(':');
    const importedBy = rev.reverse[path]?.importers ?? [];
    say(`  ${loc}`);
    say(`      role=${rev.reverse[path]?.role ?? '?'}  importers=${importedBy.length}`);
    for (const i of importedBy.slice(0, 8)) say(`        ← ${i}`);
    if (importedBy.length > 8) say(`        … +${importedBy.length - 8} more`);
  }
  if (entry.ambiguous) {
    say('  NOTE: same name at several locations — disambiguate by path, not by name.');
  }
};

commands.component = (arg) => {
  if (!arg) fail('usage: component <name|path>');
  const cm = load('codebase/COMPONENT_MAP.json');
  const pm = load('codebase/PAGE_MAP.json');
  const pci = load('generated/PAGE_COMPONENT_INDEX.json');
  const q = arg.toLowerCase();
  const hits = cm.components.filter(
    (c) => c.path.toLowerCase().includes(q) || c.name.toLowerCase() === q,
  );
  if (!hits.length) { say(`no component matching "${arg}"`); return; }
  for (const c of hits) {
    const imp = impactOf(c.path);
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
      say(`  ORPHANED  no file imports this component.`);
      const t = pci.index;
      say(`            live components on same routes:`);
      const owner = Object.entries(t).filter(([, v]) => v.transitive.some((x) => x.path === c.path));
      if (owner.length === 0) say(`            (not reachable from any indexed page)`);
      for (const [page, v] of owner.slice(0, 5)) {
        say(`            ${page}`);
      }
    }
    say('');
  }
};

commands.hook = (arg) => {
  if (!arg) fail('usage: hook <name>');
  const hm = load('codebase/HOOKS_MAP.json');
  const q = arg.toLowerCase();
  const hits = hm.hooks.filter((h) => h.name.toLowerCase().includes(q) || h.path.toLowerCase().includes(q));
  if (!hits.length) {
    say(`no hook matching "${arg}"`);
    say(`this repository defines ${hm.hooks.length} custom hook(s): ${hm.hooks.map((h) => h.name).join(', ')}`);
    return;
  }
  for (const h of hits) {
    say(`HOOK ${h.name}`);
    say(`  path     ${h.path}`);
    say(`  feature  ${h.feature}   ${h.lines} lines`);
    say(`  used by  ${h.usedBy.length}`);
    for (const u of h.usedBy.slice(0, 12)) say(`          ← ${u}`);
    if (!h.usedBy.length) say('          (unused)');
  }
};

commands.service = (arg) => {
  if (!arg) fail('usage: service <name>');
  const sm = load('codebase/SERVICE_MAP.json');
  const q = arg.toLowerCase();
  const hits = sm.services.filter((s) => s.name.toLowerCase().includes(q));
  if (!hits.length) { say(`no service matching "${arg}"`); return; }
  for (const s of hits) {
    const imp = impactOf(s.path);
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

commands.feature = (arg) => {
  if (!arg) fail('usage: feature <slug>');
  const fm = load('codebase/FEATURE_MAP.json');
  const f = fm.features.find((x) => x.feature === arg);
  if (!f) {
    say(`no feature "${arg}"`);
    say(`available: ${fm.features.map((x) => x.feature).join(', ')}`);
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

commands['list-features'] = () => {
  const fm = load('codebase/FEATURE_MAP.json');
  say('FEATURES');
  for (const f of fm.features) {
    say(`  ${String(f.files).padStart(4)} files  ${String(f.lines).padStart(7)} lines  ${f.feature}`);
  }
};

commands['list-symbols'] = (arg) => {
  const si = load('generated/SYMBOL_INDEX.json');
  const entries = Object.entries(si.symbolsByName);
  if (arg) {
    const q = arg.toLowerCase();
    for (const [name, v] of entries.filter(([n]) => n.toLowerCase().includes(q))) {
      say(`  ${name}  →  ${v.locations.join(', ')}${v.ambiguous ? '   (ambiguous)' : ''}`);
    }
  } else {
    say(`  ${entries.length} distinct names`);
    entries.slice(0, 40).forEach(([n, v]) => say(`  ${n}  →  ${v.locations[0]}`));
    say(`  … pass an argument to filter`);
  }
};

commands.endpoint = (arg) => {
  if (!arg) fail('usage: endpoint <METHOD /path>   (e.g. "POST /api/payments")');
  const am = load('codebase/API_MAP.json');
  const q = arg.toLowerCase();
  const hits = am.endpoints.filter((e) => `${e.method} ${e.path}`.toLowerCase().includes(q));
  if (!hits.length) { say(`no endpoint matching "${arg}"`); return; }
  for (const e of hits) {
    say(`ENDPOINT ${e.method} ${e.path}`);
    say(`  feature ${e.feature}`);
    for (const h of e.handlers) {
      const imp = impactOf(h);
      say(`  handler ${h}`);
      say(`  impact  ${imp.level}`);
      for (const x of imp.evidence) say(`          - ${x}`);
    }
  }
};

commands.database = (arg) => {
  const dm = load('codebase/DATABASE_USAGE_MAP.json');
  say(`DATABASE USAGE — ${dm.counts.files} files, ${dm.counts.distinctCollections} collections, ${dm.counts.models} models`);
  const hits = arg
    ? dm.usage.filter((u) => u.file.toLowerCase().includes(arg.toLowerCase()))
    : dm.usage;
  for (const u of hits) {
    say(`  ${u.file}`);
    if (u.collections.length) say(`     collections: ${u.collections.join(', ')}`);
    if (u.models.length) say(`     models: ${u.models.map((m) => m.name).join(', ')}`);
    if (u.prisma) say('     prisma: yes');
    if (u.rawSql) say('     raw SQL: yes');
  }
};

commands.storage = (arg) => {
  const sm = load('codebase/STORAGE_USAGE_MAP.json');
  say(`STORAGE — files=${sm.counts.files} stores=${sm.counts.stores.join(', ')} literalKeys=${sm.counts.literalKeys}`);
  const hits = arg ? sm.usage.filter((u) => u.file.toLowerCase().includes(arg.toLowerCase())) : sm.usage;
  for (const u of hits) {
    say(`  ${u.file}  [${u.stores.join(', ')}]`);
    const keys = u.calls.map((c) => c.key).filter(Boolean);
    if (keys.length) say(`     keys: ${[...new Set(keys)].slice(0, 10).join(', ')}`);
  }
};

commands.integration = (arg) => {
  const im = load('codebase/INTEGRATION_MAP.json');
  if (!arg) {
    say(`INTEGRATIONS (${im.integrations.length})`);
    for (const i of im.integrations) say(`  ${i.name.padEnd(24)} ${i.usedIn.length} file(s)`);
    say(`\nENV VARS REFERENCED (${im.envVars.length})`);
    for (const e of im.envVars.slice(0, 30)) say(`  ${e.name}`);
    return;
  }
  const hit = im.integrations.find((i) => i.name.toLowerCase().includes(arg.toLowerCase()));
  if (!hit) { say(`no integration "${arg}"`); return; }
  say(`INTEGRATION ${hit.name}`);
  say(`  packages ${hit.packageNames.join(', ')}`);
  for (const u of hit.usedIn.slice(0, 20)) say(`  used in  ${u}`);
};

/** Every file that imports the given file — the first thing to check before editing. */
commands.importers = (arg) => {
  if (!arg) fail('usage: importers <path>');
  arg = slash(arg);
  const rev = load('generated/REVERSE_DEPENDENCY_MAP.json');
  const e = rev.reverse[arg];
  if (!e) { say(`"${arg}" is not an indexed file`); return; }
  say(`IMPORTERS OF ${arg}  (${e.importedBy})`);
  say(`  role ${e.role}   feature ${e.feature}`);
  for (const i of e.importers) say(`  ← ${i}`);
  if (e.dynamicImporters.length) {
    say(`  dynamic (code-split): ${e.dynamicImporters.join(', ')}`);
  }
};

commands.impact = (arg) => {
  if (!arg) fail('usage: impact <path>');
  arg = slash(arg);
  const r = impactOf(arg);
  say(`IMPACT ${arg}`);
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

commands.routes = () => {
  const rm = load('codebase/ROUTE_MAP.json');
  say(`ROUTES — ${rm.counts.routes} declared in ${rm.routerFiles.join(', ')}`);
  for (const r of rm.routes) {
    say(`  ${String(r.path).padEnd(30)} ${String(r.element ?? '').padEnd(24)} ${r.association === 'none' ? '(unassociated)' : r.componentFile ?? ''}`);
  }
};

commands['route-pages'] = () => {
  const pci = load('generated/PAGE_COMPONENT_INDEX.json');
  for (const [page, v] of Object.entries(pci.index)) {
    say(`PAGE ${page}`);
    say(`  route ${v.route ?? '(none)'}   feature ${v.feature}`);
    for (const c of v.transitive.slice(0, 12)) say(`  ${'  '.repeat(Math.min(c.depth, 4))}└ ${c.path}`);
    if (v.transitive.length > 12) say(`  … +${v.transitive.length - 12} more`);
  }
};

commands.stats = () => {
  const man = load('generated/INTELLIGENCE_MANIFEST.json');
  say(`INDEX MANIFEST`);
  say(`  sourceFingerprint ${man.sourceFingerprint.slice(0, 16)}`);
  say(`  source files       ${man.sourceFileCount}  (${(man.sourceBytes / 1048576).toFixed(1)} MB)`);
  say(`  generated at       ${man.generatedAt}`);
  say(`  timings (ms)       ${JSON.stringify(man.timingsMs)}`);
  say(`  artifacts:`);
  for (const a of man.artifacts) say(`    ${String(a.bytes).padStart(8)}  ${a.path}`);
  const ig = load('generated/IMPORT_GRAPH.json');
  say(`  graph: ${JSON.stringify(ig.counts)}`);
};

commands.orphans = () => {
  const cm = load('codebase/COMPONENT_MAP.json');
  say(`ORPHANED COMPONENTS (${cm.counts.orphaned} of ${cm.counts.components}) — no importer in the index`);
  for (const c of cm.components.filter((x) => x.orphaned).sort((a, b) => b.lines - a.lines)) {
    say(`  ${String(c.lines).padStart(5)} lines  ${c.path}`);
  }
  const rev = load('generated/REVERSE_DEPENDENCY_MAP.json');
  const fr = load('codebase/FILE_ROLE_MAP.json');
  const isolated = fr.files.filter((f) => f.inbound === 0 && f.outbound === 0);
  say(`\nISOLATED FILES (${isolated.length}) — no edges in either direction`);
  for (const f of isolated.slice(0, 20)) say(`  ${f.role.padEnd(12)} ${f.path}`);
  void rev;
};

commands.role = (arg) => {
  if (!arg) fail('usage: role <ROLE>   (e.g. PAGE, SERVICE, MCP_TOOL)');
  const fr = load('codebase/FILE_ROLE_MAP.json');
  const hits = fr.files.filter((f) => f.role === arg.toUpperCase());
  say(`ROLE ${arg.toUpperCase()} — ${hits.length} file(s)`);
  for (const f of hits) say(`  ${f.path}  [${f.feature}] ${f.roleSource}`);
};

commands.confidence = () => {
  const ig = load('generated/IMPORT_GRAPH.json');
  const rm = load('codebase/ROUTE_MAP.json');
  const cm = load('codebase/COMPONENT_MAP.json');
  say('CONFIDENCE DISTRIBUTION');
  say(`  components  ${JSON.stringify(cm.counts.confidence)}`);
  say(`  routes      ${JSON.stringify(rm.counts.association)}`);
  say(`  unresolved  ${ig.counts.unresolvedEdges}`);
  for (const e of ig.unresolvedEdges) say(`    ${e.from}  '${e.specifier}'  — ${e.detail}`);
};

/* ------------------------------------------------------------------ */

/** Windows shells hand back backslash paths; every index key uses forward slashes. */
function slash(p) {
  return String(p).replace(/\\/g, '/');
}

function main() {
  const argv = process.argv.slice(2);
  const name = argv[0];
  // Accept `help` as well as `--help`. Every command in this knowledge base is
  // documented as `npm run agent:query -- help`, and an npm run passing a bare
  // `help` through to the script must not report "unknown command".
  if (!name || name === '--help' || name === '-h' || name === 'help') {
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
    flush();
    return;
  }
  const cmd = commands[name];
  if (!cmd) {
    say(`unknown command "${name}". Try: node query-index.mjs --help`);
    flush();
    process.exit(1);
  }
  cmd(argv.slice(1).join(' ').trim());
  flush();
}

main();