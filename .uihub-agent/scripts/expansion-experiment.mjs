#!/usr/bin/env node
/**
 * Runs the deferred expansion-subject experiment (DEC-009) and writes the result.
 *
 * Read-only by construction: it imports `buildBundle` and the expansion helpers
 * and measures a hypothetical subject set. No engine module is modified, and
 * `runExperiment()` asserts the bundle is byte-identical after measurement.
 *
 *   node .uihub-agent/scripts/expansion-experiment.mjs [--json] [--out <path>]
 *
 * The default output is the Markdown report in `.uihub-agent/tasks/`, because a
 * measurement nobody reads is a measurement nobody trusts. `--json` is for the
 * test and for anyone who wants to diff two runs.
 */

import { writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  runExperiment,
  CANONICAL_SET,
  EXPECT_RATIONALE,
  TRIGGER_PRIORITY,
} from './lib/expansion-experiment.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DEFAULT_OUT = join(ROOT, '.uihub-agent', 'tasks', 'EXPANSION_EXPERIMENT.md');

const HELP = `agent:experiment -- the deferred expansion-subject experiment (DEC-009)

Usage:
  node .uihub-agent/scripts/expansion-experiment.mjs [options]

Options:
  --json          print the raw result as JSON instead of the Markdown report
  --out <path>    write the report somewhere else
  --help          show this help

This command changes nothing. It measures what each of the seven permitted
triggers would admit if relevance-admitted files were also treated as expansion
subjects, and reports the cost per trigger against the canonical benchmark.`;

export function parseArgs(argv) {
  const opts = { json: false, out: DEFAULT_OUT, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--out') opts.out = resolve(argv[++i] ?? DEFAULT_OUT);
    else throw new Error(`unknown argument: ${a}`);
  }
  return opts;
}

function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const rule = `|${headers.map(() => '---').join('|')}|`;
  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
  return [head, rule, body].join('\n');
}

export function renderReport(result) {
  const { rows, summary } = result;
  const at = new Date().toISOString().slice(0, 10);

  const rejects = TRIGGER_PRIORITY.filter((t) => summary[t].verdict.startsWith('REJECT'));
  const defers = TRIGGER_PRIORITY.filter((t) => summary[t].verdict.startsWith('DEFER'));
  const noEffect = TRIGGER_PRIORITY.filter((t) => summary[t].verdict.startsWith('NO EFFECT'));

  // S6 is the decisive task, so the narrative quotes its numbers directly rather
  // than re-deriving them inline where they would be unreadable.
  const s6 = rows.find((r) => r.id === 'S6');
  const s6FalsePositives = s6
    ? TRIGGER_PRIORITY.reduce((n, t) => n + s6.perTrigger[t].falsePositives, 0)
    : 0;

  const perTask = table(
    ['ID', 'Ground truth', 'Bundle now', 'Expanded now', 'Relevance subjects', ...TRIGGER_PRIORITY.map((t) => t.replace('_DEPENDENCY', '').replace('_RELATIONSHIP', '').replace('_CONSUMER', ''))],
    rows.map((r) => [
      r.id,
      r.expect,
      r.baselineFiles,
      r.baselineExpanded,
      r.relevanceSubjects.length,
      ...TRIGGER_PRIORITY.map((t) => {
        const cell = r.perTrigger[t];
        if (cell.added === 0) return '0';
        return cell.falsePositives > 0 ? `**${cell.added}** (!${cell.falsePositives})` : String(cell.added);
      }),
    ]),
  );

  const perTrigger = table(
    ['Trigger', 'Tasks widened', 'Files added', 'False positives', 'Ground-truth hits', 'Unverified', 'Verdict'],
    TRIGGER_PRIORITY.map((t) => {
      const s = summary[t];
      return [t, s.tasksWidened, s.added, s.falsePositives, s.groundTruthHits, s.unverified, s.verdict.split(' -- ')[0]];
    }),
  );

  const fpDetail = TRIGGER_PRIORITY
    .filter((t) => summary[t].falsePositives > 0)
    .map((t) => {
      const lines = [];
      for (const r of rows) {
        for (const f of r.perTrigger[t].files.filter((x) => x.verdict === 'false-positive')) {
          lines.push(`  - \`${f.path}\` (via ${r.id})`);
        }
      }
      return `### ${t} - ${summary[t].falsePositives} invented file(s)\n\n${lines.slice(0, 12).join('\n')}${lines.length > 12 ? `\n  - ... and ${lines.length - 12} more` : ''}`;
    })
    .join('\n\n');

  return `# Expansion-subject experiment (DEC-009)

*Generated ${at} by \`agent:experiment\`. Read-only: no engine module was changed.*

## 1. The question

Expansion grows from one seed set. \`namedPaths()\` in \`expand.mjs\` is **only
the explicit files** when the developer named any, and otherwise the resolved
components, services, hooks and route handlers. Files the relevance engine
admitted on its own are in the bundle but are **not** expansion subjects:
expansion never walks out from them.

The proposal is to also treat relevance-admitted files as subjects, buying one
more hop out. DEC-009 deferred it rather than rejecting it, because the stated
worry - re-admitting the whole feature through the back door, the over-broad
context the 8.30 fast path exists to prevent - was an argument, not a
measurement. This is the measurement.

## 2. Method

For each of the ten canonical tasks: build the real bundle, derive the proposed
subject set (current seeds + relevance-admitted non-test files), re-derive the
candidate universe with \`candidatesFor()\`, and for each trigger in
\`TRIGGER_PRIORITY\` ask \`reasonsForPath()\` which files that trigger would newly
admit. Only files the current bundle does not already contain are counted, so
the number is the *cost of widening*, not what the trigger can see.

The experiment re-uses the shipped \`candidatesFor()\` and \`reasonsForPath()\`
rather than a re-implementation, so it cannot drift from the engine it measures.
\`runExperiment()\` asserts the bundle is byte-identical before and after, so
"read-only" is a checked invariant and not a promise.

## 3. How the answer is judged

Most canonical tasks have no enumerable ground truth. Four do: **S6, S7, S8 and
S10 are tasks whose correct answer is nothing.** S6 names a component that does
not exist, S7 names an entity that is not in the index, S8 and S10 are unknown.
The benchmark states a zero-file bundle is correct and that nothing may be
invented.

For those four, every file a trigger would newly admit is a **provable false
positive** - not a judgement about relevance, a contradiction of a stated
requirement. A trigger that widens them is disqualified regardless of what it
does elsewhere. For the six tasks with known relevant files, an addition counts
as \`ground-truth-relevant\` only if it is in the benchmark's list; anything else
is \`unverified\` and is never counted as a win.

| Expectation | Tasks | Basis |
|---|---|---|
${Object.entries(EXPECT_RATIONALE).map(([k, v]) => `| \`${k}\` | ${CANONICAL_SET.filter((t) => t.expect === k).map((t) => t.id).join(', ') || '-'} | ${v} |`).join('\n')}

## 4. Per-task result

Bold marks a cell containing invented files; \`!n\` is how many.

${perTask}

S6 is where the answer becomes unambiguous. Its shipped bundle is
${s6?.baselineFiles ?? 0} files, and the widening would add ${s6FalsePositives} more on
top of it - every one of them invented for a task whose correct answer is
nothing. (The ${s6?.baselineFiles ?? 0}-file baseline is itself worth reading against
the benchmark's "none"; that is a separate question, recorded in
\`KNOWN_FAILURES.md\`, and it is *not* what this experiment decides.)

## 5. Per-trigger verdict

${perTrigger}

## 6. The invented files

${fpDetail}

## 7. Conclusion

- **Rejected outright: ${rejects.length ? rejects.join(', ') : 'none'}.** Each invents
  files for a task whose correct answer is nothing, so the 8.30 concern is
  confirmed and measured rather than argued. \`DIRECT_DEPENDENCY\` is the worst:
  ${summary.DIRECT_DEPENDENCY.added} files, of which
  ${summary.DIRECT_DEPENDENCY.falsePositives} are on S6 alone.
- **No measurable effect: ${noEffect.length ? noEffect.join(', ') : 'none'}.** They fire
  on no canonical task even with the wider subject set, so widening buys nothing
  for them. Widening them is a pure risk with no measured upside.
- **Deferred: ${defers.length ? defers.join(', ') : 'none'}.** These add
  ${defers.reduce((n, t) => n + summary[t].added, 0)} file(s) and break no empty-answer
  task, but none of the additions is evidenced as relevant by the benchmark, so
  there is no reason to admit them yet either.

**Recommendation: keep the DEC-009 deferral, and record this measurement as its
justification.** The per-trigger split does not identify a safe subset to widen -
the two triggers that are safe in isolation add nothing, and the two that would
add something are exactly the two that invent context. Behaviour is unchanged;
this file is evidence for a future decision, not a change.

## 8. Reproduce

\`\`\`
npm run agent:experiment          # this report
npm run agent:experiment -- --json
node --test .uihub-agent/tests/expansion-experiment.test.mjs
\`\`\`
`;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`agent:experiment: ${err.message}\n`);
    process.exit(1);
  }
  if (opts.help) { process.stdout.write(HELP); return; }

  const result = runExperiment();
  if (opts.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  const report = renderReport(result);
  writeFileSync(opts.out, report);
  process.stdout.write(`[agent:experiment] wrote ${opts.out}\n`);
  for (const t of TRIGGER_PRIORITY) {
    const s = result.summary[t];
    process.stdout.write(`  ${t.padEnd(24)} added=${String(s.added).padEnd(4)} false-positives=${s.falsePositives}  ${s.verdict.split(' -- ')[0]}\n`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
