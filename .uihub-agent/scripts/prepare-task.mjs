#!/usr/bin/env node
/**
 * agent:prepare — the one command that stands in front of the whole agent.
 *
 * The failure this exists to prevent
 * ----------------------------------
 * A developer asks for a change. The agent routes it, opens files, and starts
 * editing. Somewhere in the middle it remembers — or half-remembers — that this
 * exact area had a defect in Phase 4, that a decision was already taken about
 * it, that a fix was applied and never deployed. Whether that memory surfaces
 * depends on whether the agent happened to read the right file. Recall by luck is
 * not recall.
 *
 * So preparation is a step, not a habit. This command runs it in a fixed order:
 * retrieve memory, classify, route, select context, evaluate protected paths, and
 * report. Whatever the answer to "is this area known?" turns out to be, it is
 * asked before the first edit, and the reason is recorded either way.
 *
 * What this command is NOT
 * ------------------------
 * It adds no intelligence of its own. It calls `classify()`, `buildBundle()` and
 * the memory retrieval that already exist and prints the results side by side.
 * There is no second router, no second relevance ranking and no second expansion
 * rule, because a second one would immediately be a third answer to a question
 * the codebase already answers.
 *
 * The precedence rule that matters
 * -------------------------------
 * Memory never outranks the repository. If a memory record and the current source
 * disagree, the source is right and the record is stale — that is what
 * `KNOWN_FAILURES.md` is full of, and it is why `suppliers` below is printed
 * separately from `memory`. A historical record is context for a human decision,
 * never an input to a routing decision. The one place memory informs the report
 * is the *advisory* block, and it is labelled as advice.
 *
 * Read-only: it never writes application source and never mutates an index.
 *
 *   node prepare-task.mjs "Fix a payment verification bug"
 *   node prepare-task.mjs --json "Fix WebM template preview"
 *   node prepare-task.mjs --memory-limit 5 "Add an MCP tool"
 */

import { buildBundle } from './lib/bundle.mjs';
import { freshness } from './lib/intel.mjs';
import { scanText } from './secret-scan.mjs';
import { UsageError, parseArgs } from './lib/cli-args.mjs';
import { memoryQuery, loadIndexes, buildEvidence } from './memory-query.mjs';
import { MEMORY_POLICY, redactSecrets, SOURCE_PRECEDENCE, MEMORY_CATEGORIES, isActivePolicy } from './lib/memory.mjs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HELP = `
agent:prepare - retrieve memory, route the task, and report both together

USAGE
  node prepare-task.mjs [options] "<task>"

OPTIONS
  --json               machine-readable output
  --memory-limit <n>   how many memory records to surface (default: ${MEMORY_POLICY.maxResults})
  --max-files <n>      override the evidence-driven relevance budget
  --expand-steps <n>   context expansion rounds, 0 disables (default 1)
  --allow-stale        proceed even when the indexes are stale
  -h, --help           this text

EXAMPLES
  node prepare-task.mjs "Fix a payment verification bug"
  node prepare-task.mjs --json "Fix an XSS vulnerability in the comment renderer"
  node prepare-task.mjs --memory-limit 3 "Add an MCP tool"

Order of operations: memory -> classification -> routing -> context -> protected
-> report. Memory is historical context and never overrides current source
evidence. Read-only with respect to application source.
`;

const B = '  ';

/**
 * Split retrieved records into the categories the report shows.
 *
 * The split is by the record's own `kind`, not by how well it matched. A decision
 * record is a decision whether it scored P0 or P5, because the reader's question
 * is "was this already decided?", and that is a property of what the record *is*.
 *
 * The kind names are read from `MEMORY_CATEGORIES` rather than written out here.
 * The first version of this file spelled them out in upper case against a
 * lower-case `kind` and silently reported an empty Decisions section for a task
 * whose top record *was* a P0 decision — the worst possible failure mode, because
 * a missing section reads as "nothing recorded".
 */
export function groupMemory(records) {
  const byKind = (k) => records.filter((r) => r.kind === k);
  return {
    decisions: byKind(kindOf('ARCHITECTURAL_DECISIONS')),
    fixes: byKind(kindOf('KNOWN_FIXES')),
    failures: byKind(kindOf('KNOWN_FAILURES')),
    lessons: byKind(kindOf('LESSONS_LEARNED')),
    limitations: byKind(kindOf('LIMITATIONS')),
    tasks: byKind(kindOf('TASK_HISTORY')),
    regressions: byKind(kindOf('REGRESSION_HISTORY')),
    historical: records.filter((r) => !isActivePolicy(r.status)),
  };
}

/** The `kind` string the memory layer assigns to a category file. */
function kindOf(category) {
  return MEMORY_CATEGORIES[category]?.kind;
}

/**
 * Assemble the full prepared task.
 *
 * Split from the CLI so the whole thing is testable without spawning a process.
 * Nothing here writes anything; `buildBundle` and the memory readers are the only
 * sources of truth and both are read-only.
 */
export function prepareTask(task, {
  memoryLimit = MEMORY_POLICY.maxResults,
  maxFiles = null,
  expandSteps = 1,
  fresh = freshness(),
  records = null,
} = {}) {
  // 1. Memory first. Retrieving before routing means the memory evidence is
  //    derived from what the developer *said*, not from whatever the router
  //    happened to resolve — otherwise memory can only ever confirm the router,
  //    which is circular.
  //
  //    `records` is an injection seam for tests. It defaults to null, meaning
  //    "read the real memory layer", so the shipped path is unchanged; a test can
  //    supply a fixture to prove that a poisoned or unknown-kind record is
  //    reported rather than dropped, without writing to the real memory files.
  const memory = memoryQuery(task, {
    limit: memoryLimit,
    evidence: buildEvidence(task, { index: loadIndexes() }),
    ...(records ? { records } : {}),
  });

  // 2-5. The existing pipeline, untouched. `classify` runs inside `buildBundle`;
  //    we call it separately only to report the intent alongside memory.
  const bundle = buildBundle(task, { maxFiles, expandSteps });

  const groups = groupMemory(memory.results);
  const suppliers = {
    currentSource: bundle.files.length,
    indexes: bundle.indexes,
    indexFreshness: fresh.state,
  };

  return {
    schema: 'prepared-task/1',
    task,
    memory: {
      ...memory,
      groups,
      precedence: SOURCE_PRECEDENCE,
      // The sentence that must never be droppable, so it is data and not prose.
      rule: 'Memory is historical context. It never overrides current source or index evidence.',
    },
    classification: {
      intent: bundle.intent,
      categories: bundle.categories,
      surface: bundle.surface,
      confidence: bundle.confidence,
      confidenceWhy: bundle.confidenceWhy,
      featureCandidates: bundle.featureCandidates,
    },
    routing: {
      indexes: bundle.indexes,
      entities: bundle.entities,
      evidence: bundle.evidence,
      knowledge: bundle.knowledge,
      protectedAreas: bundle.protectedAreas,
      // Every relationship the bundle actually relied on, plus the size policy
      // that set the budget. Both are carried so this output is a strict superset
      // of `agent:context`'s — a preparation step that silently dropped them
      // would make the composed report weaker than either system it composes.
      dependencies: bundle.dependencies,
      sizePolicy: bundle.sizePolicy,
      candidates: bundle.efficiency,
    },
    context: {
      initial: bundle.files.filter((f) => !f.addedByExpansion),
      expanded: bundle.files.filter((f) => f.addedByExpansion),
      files: bundle.files,
      expansionLog: bundle.expansionLog,
      expansionCount: bundle.expansionCount,
      expansionSteps: bundle.expansionSteps,
      stopReason: bundle.stopReason,
      emptyReason: bundle.emptyReason,
    },
    validation: bundle.validation,
    unknown: bundle.unknown,
    suppliers,
  };
}

function renderMemory(memory) {
  const L = [];
  const push = (s = '') => L.push(s);

  push('MEMORY  (historical context — not current repository truth)');
  push(`${B}retrieved ${memory.resultCount} of ${memory.recordCount} record(s); ` +
    `evidence files=${memory.evidence.files.length} features=${memory.evidence.features.length} routes=${memory.evidence.routes.length}`);
  if (memory.declined) {
    push(`${B}NO RECORDED MEMORY. This is not evidence that the area is unknown —`);
    push(`${B}only that no record matches. Read the current code.`);
    return L;
  }

  const sections = [
    ['decisions', 'Decisions'],
    ['fixes', 'Known fixes'],
    ['failures', 'Known failures'],
    ['lessons', 'Lessons'],
  ];
  const listed = new Set();
  let printed = 0;
  for (const [key, label] of sections) {
    const list = memory.groups[key];
    if (!list.length) continue;
    push();
    push(`${label}:`);
    for (const r of list) {
      const flag = isActivePolicy(r.status) ? ' ' : '!';  // '!' = not current
      push(`${B}${flag} ${r.tier} ${r.id.padEnd(9)} ${r.status.padEnd(10)} ${redactSecrets(r.title)}`);
      if (r.date) push(`${B}      date: ${r.date}  (${r.file})`);
      listed.add(r.id);
      printed += 1;
    }
  }

  // Non-current records are reported as a one-line summary rather than a second
  // full listing. A HISTORICAL failure already appears above under "Known
  // failures", marked `!` and carrying its status; repeating it in an "also
  // historical" section made one record read as two and inflated every count a
  // reader took from this block.
  const stale = memory.results.filter((r) => !isActivePolicy(r.status) && !listed.has(r.id));
  if (stale.length) {
    push();
    push(`Not shown above (no section of their own): ${stale.length}`);
    for (const r of stale) {
      push(`${B}  ${r.kind}:${r.id.padEnd(9)} ${r.status.padEnd(10)} ${redactSecrets(r.title)}`);
    }
  }

  // A retrieved record that matched no category is a bug in this file, not a fact
  // about the repository. It is reported rather than dropped, because the earlier
  // version of this function dropped them silently and the symptom — an empty
  // section — is indistinguishable from "nothing is recorded here".
  const categorised = new Set(
    Object.values(memory.groups).flat().map((r) => `${r.kind}:${r.id}`),
  );
  const uncategorised = memory.results.filter((r) => !categorised.has(`${r.kind}:${r.id}`));

  // The "nothing categorised" line is suppressed when a warning follows it. Both
  // lines are true, but together they read as a contradiction and the reader has
  // to work out which one explains the empty section.
  if (printed === 0 && uncategorised.length === 0) {
    push(`${B}(no categorised record — see --json for the flat list)`);
  }
  if (uncategorised.length) {
    push();
    push(`  WARNING: ${uncategorised.length} retrieved record(s) matched no report category:`);
    for (const r of uncategorised) push(`${B}    ${r.kind}:${r.id} (${r.file})`);
    push(`  This is a defect in agent:prepare's grouping, not a memory finding.`);
  }

  push();
  push(`  A '!' marks a record that is NOT current (historical/superseded). Such a`);
  push(`  record is context for a human, never an instruction to the router.`);
  return L;
}

export function render(p) {
  const L = [];
  const push = (s = '') => L.push(s);

  // --- CURRENT: everything read straight from the live repository -------------
  push('== CURRENT (repository, indexed now) ==');
  push();
  push(`TASK         ${p.task}`);
  push(`INTENT       ${p.classification.intent.intent} — ${p.classification.intent.why}`);
  push(`CATEGORIES   ${p.classification.categories.join(', ')}`);
  push(`SURFACE      ${p.classification.surface.join(', ')}`);
  push(`CONFIDENCE   ${p.classification.confidence} — ${p.classification.confidenceWhy}`);
  push(`INDEXES      ${p.routing.indexes.join(', ')} (${p.suppliers.indexFreshness})`);

  push();
  push(`FILES  (${p.context.files.length} selected of ${p.routing.candidates.totalIndexedFiles} candidates; ` +
    `${p.context.initial.length} initial, ${p.context.expanded.length} expanded)`);
  for (const f of p.context.files) {
    const tag = f.addedByExpansion ? `  [+${f.expansionTrigger}]` : '';
    push(`${B}${f.priority} ${f.path}${tag}`);
    for (const w of f.why.slice(0, 2)) push(`${B}    ${w}`);
    if (f.why.length > 2) push(`${B}    (+${f.why.length - 2} more; use --json)`);
  }
  if (p.context.files.length === 0 && p.context.emptyReason) {
    push(`${B}(${p.context.emptyReason.why})`);
  }

  push();
  push(`EXPANSION    ${p.context.expansionCount} file(s) over ${p.context.expansionSteps} step(s)`);
  push(`STOP         ${p.context.stopReason}`);

  if (p.routing.protectedAreas.length) {
    push();
    push('PROTECTED');
    for (const a of p.routing.protectedAreas) push(`${B}[${a.tier}] ${a.path}`);
  }

  if (p.validation.length) {
    push();
    push('VALIDATION');
    for (const v of p.validation) push(`${B}- ${v}`);
  }

  if (p.unknown) {
    push();
    push('UNKNOWN');
    push(`${B}${p.unknown.why}`);
    for (const s of p.unknown.suggestion ?? []) push(`${B}- ${s}`);
  }

  // --- HISTORICAL: memory, clearly fenced off from the above ------------------
  push();
  push('== HISTORICAL MEMORY (durable records; may be stale — current source wins) ==');
  push();
  for (const line of renderMemory(p.memory)) push(line);

  return L.join('\n');
}

/**
 * 8.51 stale-index guard, extracted so it can be tested without a stale index.
 *
 * Returns `{ ok, code, message }` rather than exiting, because a guard that can
 * only be exercised by actually corrupting the workspace is a guard nobody runs:
 * the test would have to modify the source tree, which changes what every other
 * test in the suite observes.
 *
 * `UNKNOWN` is treated exactly like `STALE`. A failed filesystem walk returns
 * UNKNOWN, and "I could not check" must not read as "it is fine".
 */
export function checkIndexFreshness(fresh, { allowStale = false } = {}) {
  if (fresh?.state === 'FRESH' || allowStale) {
    return { ok: true, code: 0, message: '' };
  }
  return {
    ok: false,
    code: 2,
    message:
      `agent:prepare: indexes are ${fresh?.state ?? 'UNKNOWN'} — ${fresh?.reason ?? 'no reason recorded'}\n` +
      '  run: npm run agent:index\n' +
      (allowStale ? '' : '  override with --allow-stale if you know the indexes are close enough\n'),
  };
}

/**
 * 8.39 secret guard, extracted for the same reason as the freshness guard.
 *
 * `scanText` is the Phase 6 scanner, used unmodified. A memory record body is
 * hand-written prose and is exactly the kind of text that picks up a pasted key,
 * so the whole payload is scanned — not just the file list the bundle carries.
 */
export function serialiseSafely(prepared, label = 'prepared-task') {
  const serialised = JSON.stringify(prepared, null, 2);
  const findings = scanText(serialised, label);
  return { ok: findings.length === 0, serialised, findings };
}

function main() {
  const opts = parseArgs(process.argv.slice(2), {
    help: HELP,
    booleans: ['json', 'allow-stale'],
    values: ['memory-limit', 'max-files', 'expand-steps'],
  });
  if (opts.help) { process.stdout.write(HELP); return; }

  const task = (opts.positional ?? []).join(' ').trim();
  if (!task) { process.stderr.write('agent:prepare: a task is required\n\n' + HELP); process.exit(1); }

  // Same 8.51 pre-check as agent:context. A prepared task built on stale
  // indexes would present history as if it were the present.
  const fresh = freshness();
  const gate = checkIndexFreshness(fresh, { allowStale: Boolean(opts.flags['allow-stale']) });
  if (!gate.ok) {
    process.stderr.write(gate.message);
    process.exit(gate.code);
  }

  const memoryLimit = Number.parseInt(opts.flags['memory-limit'] ?? String(MEMORY_POLICY.maxResults), 10);
  const maxFilesRaw = opts.flags['max-files'];
  const maxFiles = maxFilesRaw === undefined ? null : Number.parseInt(maxFilesRaw, 10);
  const expandSteps = Number.parseInt(opts.flags['expand-steps'] ?? '1', 10);
  if (!Number.isFinite(memoryLimit) || memoryLimit < 0) { process.stderr.write('agent:prepare: --memory-limit must be >= 0\n'); process.exit(1); }
  if (maxFiles !== null && (!Number.isFinite(maxFiles) || maxFiles < 1)) { process.stderr.write('agent:prepare: --max-files must be positive\n'); process.exit(1); }
  if (!Number.isFinite(expandSteps) || expandSteps < 0) { process.stderr.write('agent:prepare: --expand-steps must be >= 0\n'); process.exit(1); }

  const prepared = prepareTask(task, { memoryLimit, maxFiles, expandSteps, fresh });

  // 8.39 parity: the bundle carries no file contents, but memory snippets are
  // prose lifted from the record files, so the whole payload goes through the
  // Phase 6 scanner. A record body is written by hand and is exactly the kind of
  // text that picks up a pasted key.
  const safe = serialiseSafely(prepared);
  if (!safe.ok) {
    process.stderr.write('agent:prepare: refusing to emit a prepared task that would contain secret values\n');
    for (const f of safe.findings) process.stderr.write(`  ${f.verdict}: ${f.detector ?? f.type ?? 'secret'}\n`);
    process.exit(3);
  }

  if (opts.flags.json) { process.stdout.write(safe.serialised + '\n'); return; }
  process.stdout.write(render(prepared) + '\n');
}

// Only run when invoked as a program. Without this guard, importing the module
// from a test executes the CLI against the test runner's own argv, which prints
// help and then exits the test process with a usage error.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (err) {
    if (err instanceof UsageError) {
      process.stderr.write(`agent:prepare: ${err.message}\n`);
      process.exit(1);
    }
    throw err;
  }
}
