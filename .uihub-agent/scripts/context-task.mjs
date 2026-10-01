#!/usr/bin/env node
/**
 * agent:context — build a task context bundle and explain every selection.
 *
 * agent.md tasks 8.14, 8.15, 8.18, 8.19, 8.20, 8.39, 8.47, 8.48, 8.51.
 * Read-only: it never writes application source.
 *
 * The `--manifest <path>` option writes a per-task manifest to an explicit path.
 * agent.md 8.39 expects `generated/CONTEXT_MANIFEST.json` to exist, so a static
 * template is checked in at that path; this CLI does NOT overwrite it. Real
 * per-task output goes to the path the caller names, which keeps per-task state
 * out of a generated artifact that `agent:index:check` owns.
 *
 *   node context-task.mjs "Fix WebM template preview"
 *   node context-task.mjs --json "Fix a payment verification bug"
 *   node context-task.mjs --manifest .tmp/context.json "Fix MCP tools list"
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildBundle } from './lib/bundle.mjs';
import { freshness } from './lib/intel.mjs';
import { scanText } from './secret-scan.mjs';
import { UsageError, parseArgs } from './lib/cli-args.mjs';

const HELP = `
agent:context - build the minimal necessary context for a task

USAGE
  node context-task.mjs [options] "<task>"

OPTIONS
  --json                machine-readable bundle
  --max-files <n>       cap the context file list (default 25)
  --expand-steps <n>    context expansion rounds, 0 disables (default 1)
  --manifest <path>     write the manifest to <path> (ignored unless given)
  --allow-stale         proceed even when the indexes are stale
  -h, --help            this text

EXAMPLES
  node context-task.mjs "Fix WebM template preview"
  node context-task.mjs --json "Add a paid template to the user library"
  node context-task.mjs --manifest .tmp/ctx.json "Fix MCP tools list"

Read-only with respect to application source.
`;

const B = '  ';

function render(bundle, fresh) {
  const L = [];
  const push = (s = '') => L.push(s);

  push(`TASK         ${bundle.task}`);
  push(`INTENT       ${bundle.intent.intent} — ${bundle.intent.why}`);
  push(`CATEGORIES   ${bundle.categories.join(', ')}`);
  push(`CONFIDENCE   ${bundle.confidence} — ${bundle.confidenceWhy}`);
  push(`SURFACE      ${bundle.surface.join(', ')}`);
  if (fresh && fresh.state !== 'FRESH') push(`INDEX FRESHNESS  ${fresh.state} — ${fresh.reason}`);

  if (bundle.knowledge.length) {
    push();
    push('READ FIRST');
    for (const k of bundle.knowledge) push(`${B}- ${k.path}`);
  }

  push();
  push(`FILES (${bundle.efficiency.filesSelected} of ${bundle.efficiency.totalIndexedFiles} candidates)`);
  for (const f of bundle.files) {
    push(`${B}${f.priority} ${f.path}${f.addedByExpansion ? `   [+${f.expansionTrigger}]` : ''}`);
    // Show the strongest reasons only. Every reason is kept in --json; printing
    // all of them buried the actual evidence under "sits beside ..." lines that
    // repeat once per sibling file.
    const shown = f.why.slice(0, 3);
    for (const w of shown) push(`${B}    ${w}`);
    if (f.why.length > shown.length) push(`${B}    (+${f.why.length - shown.length} more; use --json)`);
  }
  if (bundle.files.length === 0 && bundle.emptyReason) {
    push(`${B}(${bundle.emptyReason.why})`);
    push(`${B} searched: ${bundle.emptyReason.searchedTerms.join(', ') || '(nothing)'}`);
  }

  if (bundle.protectedAreas.length) {
    push();
    push('PROTECTED PATHS');
    for (const p of bundle.protectedAreas) push(`${B}[${p.tier}] ${p.path}`);
  }

  if (bundle.expansionLog.length) {
    push();
    push('EXPANSION');
    for (const e of bundle.expansionLog) push(`${B}step ${e.step}: ${e.path} — ${e.how[0]}`);
  }
  push(`STOP         ${bundle.stopReason}`);

  if (bundle.validation.length) {
    push();
    push('VALIDATION');
    for (const v of bundle.validation) push(`${B}- ${v}`);
  }

  if (bundle.unknown) {
    push();
    push('UNKNOWN');
    push(`${B}${bundle.unknown.why}`);
    for (const s of bundle.unknown.suggestion) push(`${B}- ${s}`);
  }

  return L.join('\n');
}

function main() {
  const opts = parseArgs(process.argv.slice(2), {
    help: HELP,
    booleans: ['json', 'allow-stale'],
    values: ['max-files', 'expand-steps', 'manifest'],
  });
  if (opts.help) { process.stdout.write(HELP); return; }

  const task = (opts.positional ?? []).join(' ').trim();
  if (!task) { process.stderr.write('agent:context: a task is required\n\n' + HELP); process.exit(1); }

  // 8.51: cheap pre-check. A bundle built on stale indexes is worse than none,
  // because it looks authoritative while describing code that has moved on.
  const fresh = freshness();
  const freshOk = fresh.state === 'FRESH';
  if (!freshOk && !opts.flags['allow-stale']) {
    process.stderr.write(
      `agent:context: indexes are ${fresh.state} — ${fresh.reason}\n` +
      '  run: npm run agent:index\n' +
      '  override with --allow-stale if you know the indexes are close enough\n');
    process.exit(2);
  }

  const maxFiles = Number.parseInt(opts.flags['max-files'] ?? '25', 10);
  const expandSteps = Number.parseInt(opts.flags['expand-steps'] ?? '1', 10);
  if (!Number.isFinite(maxFiles) || maxFiles < 1) { process.stderr.write('agent:context: --max-files must be positive\n'); process.exit(1); }
  if (!Number.isFinite(expandSteps) || expandSteps < 0) { process.stderr.write('agent:context: --expand-steps must be >= 0\n'); process.exit(1); }

  const bundle = buildBundle(task, { maxFiles, expandSteps });

  // 8.39: "Do not include secret values." The bundle is built from paths and
  // names, never file contents, but the manifest is scanned anyway so a future
  // change that inlines content cannot leak silently.
  const serialised = JSON.stringify(bundle, null, 2);
  const findings = scanText(serialised, 'context-bundle');
  if (findings.length) {
    process.stderr.write('agent:context: refusing to emit a bundle that would contain secret values\n');
    for (const f of findings) process.stderr.write(`  ${f.severity}: ${f.rule ?? f.type ?? 'secret'}\n`);
    process.exit(3);
  }

  if (opts.flags.manifest) {
    const out = resolve(String(opts.flags.manifest));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, serialised + '\n');
    process.stderr.write(`agent:context: manifest written to ${out}\n`);
  }

  if (opts.flags.json) { process.stdout.write(serialised + '\n'); return; }
  process.stdout.write(render(bundle, fresh) + '\n');
}

try {
  main();
} catch (err) {
  if (err instanceof UsageError) {
    process.stderr.write(`agent:context: ${err.message}\n`);
    process.exit(1);
  }
  throw err;
}