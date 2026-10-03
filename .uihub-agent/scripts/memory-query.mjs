#!/usr/bin/env node
/**
 * Memory query CLI — `agent:memory`.
 *
 * A future session should be able to ask "has this exact problem happened here
 * before, and what was the answer?" and get a ranked, sourced, dated answer
 * instead of a fresh repository-wide guess. This is the command that answers it.
 *
 * Two layers, matching `query-index.mjs`:
 *
 *   buildEvidence  derives retrieval evidence from the query text and the
 *                  existing intelligence index. Pure — no memory involved.
 *   commands       printers.
 *
 * The split matters because evidence derivation is where a wrong answer would be
 * cheapest to introduce and hardest to notice. If it were tangled into the printer,
 * a query would be "answered" by whatever the formatter happened to match.
 *
 * Ranking is delegated to `lib/memory.mjs`, which owns precedence, freshness and
 * supersession. This file does not reimplement any of that, and deliberately does
 * not decide what outranks what.
 *
 * Usage:
 *   npm run agent:memory -- "WebM template preview performance"
 *   npm run agent:memory -- --json "fix CORS"
 *   npm run agent:memory -- --list
 *   npm run agent:memory -- --limit 5 "auth middleware"
 *   npm run agent:memory -- --status CURRENT "health check"
 *   npm run agent:memory -- --help
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseArgs, printHelp, UsageError } from './lib/cli-args.mjs';
import { scanText } from './secret-scan.mjs';
import {
  loadMemory,
  retrieve,
  MEMORY_CATEGORIES,
  MEMORY_POLICY,
  PRIORITY_MEANING,
  FRESHNESS,
  redactSecrets,
} from './lib/memory.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '..', '..');
export const AGENT_DIR = join(ROOT, '.uihub-agent');

const HELP = `agent:memory - query durable memory in .uihub-agent/memory/

Usage:
  npm run agent:memory -- "<question or task text>"
  npm run agent:memory -- --json "<question or task text>"
  npm run agent:memory -- --list
  npm run agent:memory -- --help

Options:
  --json          emit the raw result object instead of a rendered report
  --list          list every record (metadata only, no bodies)
  --limit <n>     maximum results (default ${MEMORY_POLICY.maxResults})
  --status <s>    only records with this freshness: ${Object.keys(FRESHNESS).join(', ')}
  --kind <k>      only records of this kind: ${Object.values(MEMORY_CATEGORIES).map((c) => c.kind).join(', ')}

Ranking tiers:
  ${Object.entries(PRIORITY_MEANING).map(([t, m]) => `${t}  ${m}`).join('\n  ')}

An empty result means no record matched the evidence. That is an answer: it means
this problem is not recorded, not that nothing is wrong.
`;

const say = (s = '') => process.stdout.write(`${s}\n`);

/** Reads a generated index, returning null when it is absent or unreadable. */
function readIndex(name) {
  const path = join(AGENT_DIR, 'generated', name);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Function words that survive a length filter and would otherwise match almost
 * any record. `when`, `there` and `would` are 4–5 characters and appear in most
 * prose in this layer, so without this list P5 fills with matches on grammar
 * rather than on subject — consuming the result cap and crowding out the records
 * that actually discuss the task.
 */
const TOKEN_STOPWORDS = new Set([
  'about', 'after', 'again', 'against', 'along', 'already', 'also', 'always', 'among',
  'another', 'around', 'because', 'been', 'before', 'being', 'below', 'between',
  'both', 'bring', 'came', 'cannot', 'could', 'course', 'does', 'doing', 'done',
  'down', 'during', 'each', 'either', 'else', 'enough', 'even', 'ever', 'every',
  'from', 'further', 'gave', 'gives', 'going', 'gone', 'good', 'have', 'having',
  'here', 'however', 'into', 'itself', 'just', 'keep', 'kept', 'know', 'known',
  'less', 'like', 'made', 'make', 'many', 'might', 'more', 'most', 'much', 'must',
  'near', 'need', 'never', 'next', 'only', 'onto', 'other', 'over', 'part', 'per',
  'perhaps', 'same', 'shall', 'should', 'since', 'some', 'still', 'such', 'sure',
  'take', 'than', 'that', 'their', 'them', 'then', 'there', 'these', 'they', 'thing',
  'things', 'this', 'those', 'though', 'through', 'thus', 'together', 'took', 'under',
  'until', 'upon', 'very', 'want', 'well', 'were', 'what', 'when', 'where', 'which',
  'while', 'whole', 'whose', 'will', 'with', 'within', 'without', 'would', 'your',
]);

/** Escapes a string for safe embedding in a RegExp. */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts explicit repository paths written in the query.
 *
 * Only path-shaped tokens count. A bare word that happens to match a file name is
 * deliberately excluded here — inferring a path from a word is the exact move that
 * produced the 50-files-at-HIGH-confidence failure (DEC-006). If the user names a
 * path, we take it; if they do not, feature and route evidence carry the query.
 */
function pathsIn(text) {
  const out = new Set();
  const re = /(?:backend|frontend|mcp-server|cli|api|scripts)\/[A-Za-z0-9_./-]+\.[a-z]{1,4}/gi;
  for (const m of text.matchAll(re)) out.add(m[0]);
  return [...out];
}

/**
 * Derives retrieval evidence from a query and the intelligence index.
 *
 * Every field is a real, checkable signal from the repository. Nothing here is a
 * similarity score: a tier must be explicable as "the query named this file" or
 * "the query and this record both mention this feature", because an unexplainable
 * rank is indistinguishable from a guess.
 */
export function buildEvidence(task = '', { index = {} } = {}) {
  const text = String(task ?? '');
  const lower = text.toLowerCase();

  const files = new Set(pathsIn(text));
  const features = [];
  const routes = [];

  const featureIndex = index.featureFileIndex?.index ?? {};
  for (const [feature, fileList] of Object.entries(featureIndex)) {
    const name = feature.toLowerCase();
    // Match the whole slug or a word of it, so "mcp tool" reaches feature "mcp".
    if (lower.includes(name) || name.split(/[-_]/).some((w) => w.length > 3 && lower.includes(w))) {
      features.push(feature);
      // A named feature is strong enough to bring its files into P0 consideration.
      for (const f of fileList) files.add(f);
    }
  }

  const pageIndex = index.pageComponentIndex?.index ?? {};
  for (const entry of Object.values(pageIndex)) {
    const route = entry?.route;
    if (typeof route !== 'string' || !route) continue;
    // `(none)` is the generator's sentinel for "this page declares no route". It
    // is not a path, and matching it would put a literal `(none)` in the evidence
    // of every query.
    if (route === '(none)') continue;
    // A route is a *path shape*. The index also carries bare React route names
    // such as `health`, which are indistinguishable from an ordinary English
    // word — matching those on substring would let the query "health check"
    // claim route evidence and pull in every record containing the word.
    //
    // So: a path-shaped route matches when the query writes it, or names its
    // distinctive last segment. A bare name matches only when it is long enough
    // to be specific (`api-keys`, not `health`).
    if (route.includes('/')) {
      if (text.includes(route)) { routes.push(route); continue; }
      const last = route.split('/').filter(Boolean).pop() ?? '';
      if (last.length >= 8 && new RegExp(`\\b${escapeRegex(last)}\\b`, 'i').test(text)) {
        routes.push(route);
      }
      continue;
    }
    if (route.length >= 8 && new RegExp(`\\b${escapeRegex(route)}\\b`, 'i').test(text)) {
      routes.push(route);
    }
  }

  const subsystems = [
    ...new Set(
      ['backend', 'frontend', 'mcp-server', 'cli'].filter((s) =>
        lower.includes(s) || lower.includes(`${s}-`),
      ),
    ),
  ];

  // P5 is the weakest tier, so its evidence is held to the highest bar: a
  // distinctive word, not a function word.
  //
  // The floor is 4 characters, not 5. A 5-character minimum silently dropped
  // `cors` — the single most distinctive token in the query "CORS origin
  // callback allows every origin" — which is exactly the kind of failure where
  // the tool appears to work and returns the wrong record. The stopword list,
  // not the length, is what keeps common words out.
  const tokens = [
    ...new Set(
      (lower.match(/[a-z][a-z0-9_-]{3,}/g) ?? []).filter((t) => !TOKEN_STOPWORDS.has(t)),
    ),
  ];

  return { files: [...files], features: [...new Set(features)], routes: [...new Set(routes)], subsystems, tokens };
}

/** Loads the indexes evidence derivation needs. Missing indexes degrade, not fail. */
/**
 * The generated indexes memory evidence is derived from.
 *
 * Exported so `prepare-task.mjs` derives memory evidence from exactly the same
 * indexes as `agent:memory`. A second reader here would be free to drift, and a
 * memory record that outranks differently depending on which command asked is
 * worse than no ranking at all.
 */
export function loadIndexes() {
  return {
    featureFileIndex: readIndex('FEATURE_FILE_INDEX.json'),
    pageComponentIndex: readIndex('PAGE_COMPONENT_INDEX.json'),
  };
}

/**
 * The pure query. Returns metadata and short snippets only — never a whole record
 * body — so that the caller's context cost is bounded by `MEMORY_POLICY`, not by
 * how much prose a file happens to contain.
 */
export function memoryQuery(task, { evidence, limit = MEMORY_POLICY.maxResults, records } = {}) {
  const all = records ?? loadMemory({ dir: join(AGENT_DIR, 'memory') });
  const ev = evidence ?? buildEvidence(task, { index: loadIndexes() });
  const results = retrieve({ records: all, evidence: ev, maxResults: limit });

  return {
    query: task,
    evidence: ev,
    recordCount: all.length,
    resultCount: results.length,
    // Stated explicitly so "no match" is never mistaken for "no memory".
    declined: results.length === 0,
    results,
  };
}

/** Metadata-only listing of every record. Bounded by category, no bodies. */
export function memoryList({ status, kind } = {}) {
  const all = loadMemory({ dir: join(AGENT_DIR, 'memory') });
  const rows = all
    .filter((r) => (status ? r.status === status : true))
    .filter((r) => (kind ? r.kind === kind : true))
    .map((r) => ({
      id: r.id,
      title: r.title,
      file: r.file,
      kind: r.kind,
      status: r.status,
      date: r.date,
      dated: r.dateKnown,
    }));
  return { recordCount: all.length, filtered: rows.length, records: rows };
}

function printQuery(result) {
  say(`MEMORY  "${result.query}"`);
  say(`  evidence   files=${result.evidence.files.length} features=${result.evidence.features.length} routes=${result.evidence.routes.length}`);
  if (result.evidence.files.length) say(`  files      ${result.evidence.files.slice(0, 6).join(', ')}${result.evidence.files.length > 6 ? ', …' : ''}`);
  if (result.evidence.features.length) say(`  features   ${result.evidence.features.slice(0, 8).join(', ')}`);
  say(`  ${result.resultCount} of ${result.recordCount} record(s) matched`);
  say('');

  if (result.declined) {
    say('  NO RECORDED MEMORY.');
    say('');
    say('  This means the problem is not in durable memory — not that it is');
    say('  absent from the repository. Read the current code and documentation');
    say('  instead, and record the finding here if it becomes durable.');
    return;
  }

  for (const r of result.results) {
    say(`  ${r.tier}  ${r.id.padEnd(8)} ${r.status.padEnd(11)} ${r.file}`);
    say(`       ${redactSecrets(r.title)}`);
    say(`       why: ${r.tierMeaning}${r.matched?.length ? ` (${r.matched.slice(0, 3).join(', ')})` : ''}`);
    if (r.date) say(`       date: ${r.date}`);
    if (r.snippet) say(`       ${r.snippet}`);
    say('');
  }
}

function printList(list) {
  say(`MEMORY RECORDS  ${list.filtered} of ${list.recordCount}`);
  say('');
  for (const r of list.records) {
    const d = r.date ?? '(undated)';
    say(`  ${r.id.padEnd(9)} ${r.status.padEnd(11)} ${String(r.kind).padEnd(11)} ${d.padEnd(12)} ${r.file}`);
  }
  say('');
  say('  Metadata only. Query with a task description for ranked detail.');
}

/**
 * Serialize for emit, through the Phase 6 secret scanner.
 *
 * `agent:prepare` already did this for its payload, and the asymmetry was real:
 * `agent:memory --json` emitted records relying on `redactSecrets()` alone. That is
 * one detector where the repository has one, and redaction is a heuristic filter
 * while the scanner is the authority — so a record whose secret shape defeats
 * redaction (an AWS key, for example) printed verbatim.
 *
 * Two independent defences remain, in order:
 *
 *   1. `redactSecrets()` at retrieval replaces known shapes with `[REDACTED]`.
 *   2. this scan refuses to emit anything the scanner still recognises.
 *
 * The scanner is `scripts/secret-scan.mjs`, used unmodified — not a second detector
 * system written for memory. It inspects and does not rewrite, so a clean payload
 * is byte-identical to what it would have been, and output stays deterministic.
 *
 * Exported, and returning rather than exiting, for the same reason as the guards in
 * `prepare-task.mjs`: a guard that can only be exercised by corrupting the
 * workspace is a guard nobody runs.
 */
export function serialiseSafely(payload, label = 'memory-query') {
  const serialised = JSON.stringify(payload, null, 2);
  const findings = scanText(serialised, label);
  return { ok: findings.length === 0, serialised, findings };
}

/**
 * Write a JSON payload, or refuse.
 *
 * Exit `3` matches `agent:context` and `agent:prepare`, so a caller can treat
 * "the payload contained a secret" as one failure class across every command that
 * emits structured output. The value is never printed — not truncated, not
 * masked — because a partially-printed secret is still a secret in a transcript.
 */
function emitSafely(payload, label) {
  const safe = serialiseSafely(payload, label);
  if (!safe.ok) {
    process.stderr.write(`agent:memory: refusing to emit ${label} output that would contain secret values\n`);
    for (const f of safe.findings) process.stderr.write(`  ${f.verdict}: ${f.detector ?? f.type ?? 'secret'}\n`);
    process.exit(3);
  }
  process.stdout.write(`${safe.serialised}\n`);
}

function main() {
  const { flags, positional, help } = parseArgs(process.argv.slice(2), {
    booleans: ['json', 'list', 'help'],
    values: ['limit', 'status', 'kind'],
    help: HELP,
  });

  if (help) { printHelp(HELP); return; }

  try {
    if (flags.list) {
      const list = memoryList({ status: flags.status, kind: flags.kind });
      if (flags.json) { emitSafely(list, 'memory-list'); return; }
      printList(list);
      return;
    }

    const task = positional.join(' ').trim();
    if (!task) throw new UsageError('a question or task description is required (or use --list)');

    const limit = flags.limit ? Number(flags.limit) : MEMORY_POLICY.maxResults;
    if (!Number.isFinite(limit) || limit < 1) throw new UsageError('--limit must be a positive number');

    const status = flags.status ? String(flags.status).toUpperCase() : null;
    if (status && !Object.keys(FRESHNESS).includes(status)) {
      throw new UsageError(`--status must be one of ${Object.keys(FRESHNESS).join(', ')}`);
    }

    const kind = flags.kind ? String(flags.kind) : null;
    let result = memoryQuery(task, { limit });
    if (status || kind) {
      result = {
        ...result,
        results: result.results.filter((r) => (!status || r.status === status) && (!kind || r.kind === kind)),
        resultCount: result.results.filter((r) => (!status || r.status === status) && (!kind || r.kind === kind)).length,
      };
    }

    if (flags.json) { emitSafely(result, 'memory-query'); return; }
    printQuery(result);
  } catch (err) {
    if (err instanceof UsageError) {
      console.error(`[agent:memory] ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
}

// Importing this module must not run the CLI — `prepare-task.mjs` imports the
// query function, and that import has to stay silent.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}