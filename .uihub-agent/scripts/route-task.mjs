#!/usr/bin/env node
/**
 * agent:route — classify a natural-language task and explain the routing.
 *
 * agent.md tasks 8.16, 8.17, 8.19, 8.20. Read-only: it never writes application
 * source, and it touches the network zero times.
 *
 *   node route-task.mjs "Fix WebM preview loading in Similar Templates"
 *   node route-task.mjs --json "Fix a payment verification bug"
 *   node route-task.mjs --explain "Why is the site loading slowly?"
 */

import { classify } from './lib/router.mjs';
import { rankFiles } from './lib/relevance.mjs';
import { UsageError, printHelp, parseArgs } from './lib/cli-args.mjs';

const HELP = `
agent:route - classify a task and show how it was routed

USAGE
  node route-task.mjs [options] "<task>"

OPTIONS
  --json              machine-readable output
  --explain           include every evidence line, not just the summary
  --max-files <n>     cap the preview file list (default 10)
  -h, --help          this text

EXAMPLES
  node route-task.mjs "Fix WebM preview loading in Similar Templates"
  node route-task.mjs --json "Fix a payment verification bug"
  node route-task.mjs "frontend/src/components/templates/TemplateSimilarRail.tsx"

Read-only. Safe to run at any time.
`;

const BULLET = '  - ';

function render(r, { explain, maxFiles }) {
  const L = [];
  const push = (s = '') => L.push(s);

  push(`TASK      ${r.task}`);
  push(`INTENT    ${r.intent.intent} — ${r.intent.why}`);
  push(`CATEGORY  ${r.categories.join(', ')}`);
  push(`CONFIDENCE ${r.confidence}`);
  push(`SURFACE   ${r.surface.join(', ')}`);

  if (r.fastPath) push('FAST PATH  a file was named directly — broad classification was skipped (8.30)');

  push();
  push('WHY THIS CLASSIFICATION');
  for (const c of r.candidates.filter((c) => c.strong.length)) {
    push(`${BULLET}${c.category}: ${c.strong.join('; ')}`);
  }
  if (!r.candidates.some((c) => c.strong.length)) push(`${BULLET}(no category had strong evidence)`);

  if (r.confidenceWhy) push(`CONFIDENCE ${r.confidenceWhy}`);

  if (r.featureCandidates.length) {
    push();
    push('FEATURES');
    for (const f of r.featureCandidates) push(`${BULLET}${f}`);
  }

  const ents = [];
  for (const c of r.entities.components) ents.push(`component ${c.name} -> ${c.path}`);
  for (const s of r.entities.symbols) ents.push(`symbol ${s.name}`);
  for (const s of r.entities.services) ents.push(`service ${s.name} -> ${s.path}`);
  for (const h of r.entities.hooks) ents.push(`hook ${h.name} -> ${h.path}`);
  for (const rt of r.entities.routes) ents.push(`${rt.kind.toLowerCase()} ${rt.path}`);
  for (const f of r.entities.explicitFiles) ents.push(`file ${f.path}`);
  if (ents.length) {
    push();
    push('ENTITIES');
    for (const e of [...new Set(ents)]) push(`${BULLET}${e}`);
  }

  if (r.knowledge.length) {
    push();
    push('READ FIRST (knowledge)');
    for (const k of r.knowledge) push(`${BULLET}${k}`);
  }

  if (r.protectedAreas.length) {
    push();
    push('PROTECTED PATHS');
    for (const p of r.protectedAreas) push(`${BULLET}[${p.tier ?? '?'}] ${p.path}`);
    if (r.highCaution) push(`HIGH CAUTION: ${r.highCautionReason}`);
  }

  if (r.validation.length) {
    push();
    push('VALIDATION REQUIRED');
    for (const v of r.validation) push(`${BULLET}${v}`);
  }

  if (r.ownerActionRequired) {
    push();
    push('OWNER ACTION REQUIRED');
    for (const o of r.ownerActionReasons) push(`${BULLET}${o}`);
  }

  const ranked = rankFiles(r.task, r, { maxFiles });
  push();
  push(`FILES (${ranked.totalCandidates} candidates, showing ${ranked.files.length}${ranked.truncated ? ', truncated' : ''})`);
  for (const f of ranked.files) {
    push(`${BULLET}${f.priority} ${f.path}`);
    if (explain) for (const w of f.why) push(`        ${w}`);
    else if (f.why[0]) push(`        ${f.why[0]}`);
  }
  if (ranked.files.length === 0) push(`${BULLET}no indexed file matched — see the explanation above`);

  if (r.unknown) {
    push();
    push('UNKNOWN — narrow the task');
    push(`  ${r.unknown.why}`);
    for (const s of r.unknown.suggestion.slice(0, 6)) push(`${BULLET}${s}`);
  }

  if (r.evidence?.nearMisses?.length) {
    push();
    push('NOT FOUND IN THIS REPOSITORY');
    for (const n of r.evidence.nearMisses) {
      push(`${BULLET}${n.asked} does not exist; nearest real name is ${n.found} (${n.relation})`);
    }
  }

  return L.join('\n');
}

function main() {
  const opts = parseArgs(process.argv.slice(2), {
    help: HELP, booleans: ['json', 'explain'], values: ['max-files'],
  });
  if (opts.help) { process.stdout.write(HELP); return; }

  const task = (opts.positional ?? []).join(' ').trim();
  if (!task) { process.stderr.write('agent:route: a task is required\n\n' + HELP); process.exit(1); }

  const maxFiles = Number.parseInt(opts.flags['max-files'] ?? '10', 10);
  if (!Number.isFinite(maxFiles) || maxFiles < 1) {
    process.stderr.write('agent:route: --max-files must be a positive number\n');
    process.exit(1);
  }

  const r = classify(task);

  if (opts.flags.json) {
    const ranked = rankFiles(task, r, { maxFiles });
    process.stdout.write(JSON.stringify({ ...r, files: ranked.files }, null, 2) + '\n');
    return;
  }

  process.stdout.write(render(r, { explain: !!opts.flags.explain, maxFiles }) + '\n');
}

try {
  main();
} catch (err) {
  if (err instanceof UsageError) {
    process.stderr.write(`agent:route: ${err.message}\n`);
    process.exit(1);
  }
  throw err;
}