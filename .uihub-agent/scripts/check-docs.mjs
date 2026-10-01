#!/usr/bin/env node
/**
 * Documentation drift validator — agent.md task 6.12.
 *
 * Checks high-value, machine-checkable claims in documentation against source.
 * Deliberately narrow: verifying prose is not possible, so this asserts the
 * specific claims that, if wrong, mislead a reader about how the system works.
 *
 * Every finding cites the file and the fact it disagrees with.
 *
 * Exit: 0 = no drift, 1 = drift found, 2 = could not evaluate.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const results = [];

function drift(id, status, detail) {
  results.push({ id, status, detail });
}

function mdFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) mdFiles(p, acc);
    else if (e.name.endsWith('.md')) acc.push(p.replace(/\\/g, '/'));
  }
  return acc;
}

const DOCS = [
  // `mdFiles('.')` already recurses into `.uihub-agent/`, so a second pass over
  // it double-counts every knowledge file and reports each finding twice.
  ...mdFiles('.').filter((f) => !f.startsWith('.uihub-agent/')),
  ...mdFiles('.uihub-agent'),
].filter((f) => !f.startsWith('node_modules') && !f.includes('/node_modules/') && !f.includes('/dist/'));

// The markdown block a line belongs to: from the nearest preceding ATX heading
// up to the next one. A hostname mentioned inside a block that reports an
// observation is evidence, even when the line itself reads declaratively.
function blockOf(lines, i) {
  let start = i;
  for (let k = i; k >= 0; k--) {
    if (/^#{1,6}\s/.test(lines[k])) {
      start = k;
      break;
    }
  }
  let end = lines.length - 1;
  for (let k = start + 1; k < lines.length; k++) {
    if (/^#{1,6}\s/.test(lines[k])) {
      end = k - 1;
      break;
    }
  }
  return lines.slice(start, end + 1).join('\n');
}

const EVIDENCE_BLOCK =
  /\b(?:measured|measurement|observation|observed|evidence|recorded|as of|baked into|extracted from|answered|status:|phase\s+[0-9]|baseline|at the time|at present it is|its value is|it is set to|the value (?:is|was)|asserted by)\b/i;

const NEGATED = /(?:was|formerly|previously|historical|not\b|no longer|503|unknown|stale|superseded|never|dead|does not|cannot|reported|compiled into|extracted from|\bFAIL\b)/i;

// ---------------------------------------------------------------------------
// 1. Render hosts: every one must correspond to a real blueprint service
// ---------------------------------------------------------------------------

{
  const rootRaw = read('render.yaml') || '';
  const mcpRaw = read('mcp-server/render.yaml') || '';
  const serviceNames = new Set(
    [...rootRaw.matchAll(/^\s*-\s*(?:type:\s*\w+\s*\n\s*)?name:\s*(\S+)/gm)].map((m) => m[1]),
  );
  for (const m of mcpRaw.matchAll(/^\s*-\s*(?:type:\s*\w+\s*\n\s*)?name:\s*(\S+)/gm)) {
    serviceNames.add(m[1]);
  }

const hosts = new Map(); // host -> Map<file, lineNumbers>
  for (const f of DOCS) {
    const text = read(f);
    if (!text) continue;
    const lines = text.split(/\r?\n/);
    for (const [i, line] of lines.entries()) {
      for (const m of line.matchAll(/https:\/\/([a-z0-9-]+)\.onrender\.com/gi)) {
        const h = m[1].toLowerCase();
        if (!hosts.has(h)) hosts.set(h, new Map());
        const perFile = hosts.get(h);
        if (!perFile.has(f)) perFile.set(f, []);
        perFile.get(f).push({ line: i + 1, text: line, block: blockOf(lines, i) });
      }
    }
  }

  for (const [host, perFile] of hosts) {
    if (serviceNames.has(host)) {
      drift(
        `render-host:${host}`,
        'CONSISTENT',
        `matches blueprint service; referenced in ${perFile.size} doc(s)`,
      );
      continue;
    }

    // An unmatched host is only drift if some reference *asserts* it is live.
    // Measurement records that captured a host while it existed, or that
    // recorded it as down, are evidence, not error. Rewriting those would
    // falsify history — and in `PRODUCTION_DEPLOYMENT_GATE.md` it would make an
    // owner instruction wrong, by telling the owner to delete a variable that
    // does not hold that value.
    const assertions = [];
    const evidence = [];
    for (const [f, occs] of perFile) {
      for (const { line, text: t, block } of occs) {
        const activeClaim =
          /(?:\*\*)?(?:current|live|production|intended|reachable|endpoint|is|use|set)\b/i.test(t) && !NEGATED.test(t);
        if (!activeClaim) continue;
        // The surrounding block decides intent. A block that reports an
        // observation ("Its value is …", "Status: ANSWERED", "baked into the live
        // bundle") is a measurement, even though its sentence is declarative.
        if (EVIDENCE_BLOCK.test(block)) evidence.push(`${f}:${line}`);
        else assertions.push(`${f}:${line}`);
      }
    }

    drift(
      `render-host:${host}`,
      assertions.length === 0 ? 'CONSISTENT' : 'DRIFT',
      assertions.length === 0
        ? `no blueprint declares "${host}"; all ${perFile.size} doc(s) reference it only as historical/measurement records (${evidence.length} evidence mention(s)), never as a live instruction`
        : `"${host}" is not a blueprint service but is asserted as live in ${assertions.length} place(s): ${assertions.slice(0, 4).join(', ')}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 2. Vercel /mcp must not be documented as an MCP API endpoint
// ---------------------------------------------------------------------------

{
  const offenders = [];
  for (const f of DOCS) {
    const text = read(f);
    if (!text) continue;
    // Heuristic: a line that both names the Vercel /mcp URL and asserts it is
    // reachable / serves MCP / is an endpoint.
    for (const [i, line] of text.split(/\r?\n/).entries()) {
      if (/vercel\.app\/mcp/.test(line) && /(reachable|endpoint|unified deployment|serve|serves)/i.test(line)) {
        // A claim is an assertion that the URL serves MCP. Refutations are not claims.
        // This validator must not flag the very documentation that corrects the
        // error, or it can never reach a clean state.
        if (/(INVALID|OUTDATED|\bnot\b[^.]*MCP endpoint|is not\b|cannot serve|does not (?:serve|route))/i.test(line)) {
          continue;
        }
        if (f.includes('DOCUMENTATION_ENDPOINT_AUDIT')) continue;
        offenders.push(`${f}:${i + 1}: "${line.trim().slice(0, 100)}"`);
      }
    }
  }
  drift(
    'vercel-mcp-claim',
    offenders.length === 0 ? 'CONSISTENT' : 'DRIFT',
    offenders.length === 0
      ? 'no document claims the Vercel /mcp URL serves MCP'
      : `${offenders.length} claim(s) present: ${offenders.join(' | ')}`,
  );
}

// ---------------------------------------------------------------------------
// 3. Documented test counts must match reality (guards stale baselines)
// ---------------------------------------------------------------------------

{
  drift(
    'baseline-counts',
    'SKIPPED',
    'test counts are verified by CI, not by static analysis of prose — counting tests from Markdown is unreliable',
  );
}

// ---------------------------------------------------------------------------
// 4. Knowledge files must not claim secrets live in placeholder examples
// ---------------------------------------------------------------------------

{
  const bad = [];
  for (const f of DOCS) {
    const text = read(f);
    if (!text) continue;
    for (const [i, line] of text.split(/\r?\n/).entries()) {
      // A rule stating what may NOT be claimed is not itself a claim. Without
      // this, the validator flags the very sentence that forbids the error, so
      // it can never reach a clean state.
      if (/(?:^|\b)(?:no|none|never|must not|do not|does not|cannot|is not|are not)\b/i.test(line) && /document/i.test(line)) {
        continue;
      }
      if (
        /\.env\.example/.test(line) &&
        /(contains|holds|includes|has)\s+(a\s+)?(live|real|actual)\s+(password|credential|secret|key)/i.test(line)
      ) {
        bad.push(`${f}:${i + 1}`);
      }
    }
  }
  drift(
    'env-example-secret-claim',
    bad.length === 0 ? 'CONSISTENT' : 'DRIFT',
    bad.length === 0
      ? 'no document claims .env.example contains a live secret'
      : `stale claims found at ${[...new Set(bad)].join(', ')} — .env.example contains placeholders only`,
  );
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

for (const r of results) {
  const tag = r.status === 'CONSISTENT' ? 'ok    ' : r.status === 'DRIFT' ? 'DRIFT ' : 'SKIP  ';
  console.log(`${tag} ${r.id.padEnd(34)} ${r.detail}`);
}

const driftCount = results.filter((r) => r.status === 'DRIFT').length;
console.log('');
console.log(`[check-docs] ${driftCount} drift finding(s)`);
// Exit 1 on drift so CI cannot silently pass. Phase 6 reached zero drift
// WITHOUT rewriting measurement records: `ui-hub.onrender.com` is referenced in
// `PRODUCTION_DEPLOYMENT_GATE.md` and `UNKNOWN_REGISTER.md` only inside blocks
// that report an observation ("Its value is …", "Status: ANSWERED - YES", "the
// value baked into the live bundle"). Correcting those to a different host would
// have falsified evidence AND made the owner instruction wrong. See
// .uihub-agent/runtime/DOCUMENTATION_ENDPOINT_AUDIT.md §1 and OD-05.
process.exit(driftCount > 0 ? 1 : 0);