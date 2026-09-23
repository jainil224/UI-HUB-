#!/usr/bin/env node
/**
 * preflight.mjs
 *
 * UI-HUB Component Forge — ADD mode, Stage A preflight.
 *
 * READ-ONLY: prints a pass/fail table for the automated part of Stage A in
 * references/07-integration-checklist.md and never writes any file.
 *
 * Usage:
 *   node .agents/skills/uihub-component-forge/scripts/preflight.mjs <path-to-spec.md>
 *
 * Exit codes: 0 = no automated check failed (manual items still need a human),
 *             1 = one or more automated checks failed, 2 = usage/IO error.
 */

import { readFileSync, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(SKILL_ROOT, '..', '..', '..');
const VALIDATOR = path.join(__dirname, 'validate-spec.mjs');
const INDEX_PATH = path.join(SKILL_ROOT, 'data', 'component-index.json');
const REGISTRY = path.join(REPO_ROOT, 'frontend', 'src', 'data', 'componentData.tsx');
const METADATA = path.join(REPO_ROOT, 'frontend', 'src', 'data', 'componentMetadata.ts');

const rows = [];
const add = (status, id, detail) => rows.push({ status, id, detail });

function sectionText(md, num) {
  const lines = md.split('\n');
  let start = -1;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^##\s+(\d+(?:\.\d+)?)\.?\s+/.exec(line);
    if (m) {
      if (start === -1 && Number(m[1]) === num) { start = i + 1; continue; }
      if (start !== -1) return lines.slice(start, i).join('\n');
    }
  }
  return start === -1 ? '' : lines.slice(start).join('\n');
}

function parseEdits(md) {
  const integration = sectionText(md, 12);
  const m = /```json\s*\n([\s\S]*?)```/.exec(integration);
  if (!m) return null;
  try {
    const v = JSON.parse(m[1]);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

function countOccurrences(haystack, needle) {
  let n = 0;
  let i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  return n;
}

async function main() {
  const specArg = process.argv[2];
  if (!specArg) {
    console.error('Usage: node .agents/skills/uihub-component-forge/scripts/preflight.mjs <path-to-spec.md>');
    process.exit(2);
  }
  const specPath = path.resolve(specArg);

  if (!existsSync(specPath)) {
    add('FAIL', 'A1', `spec not found: ${specArg}`);
    report();
    process.exit(1);
  }
  add('PASS', 'A1', `spec exists: ${specArg}`);

  const md = await readFile(specPath, 'utf8');

  // A2 — validator exits 0
  const v = spawnSync(process.execPath, [VALIDATOR, specPath], { encoding: 'utf8' });
  if (v.status === 0) {
    add('PASS', 'A2', 'validate-spec.mjs exits 0');
  } else {
    const first = (v.stderr || v.stdout || '').split('\n').find((l) => l.trim().startsWith('-')) || `exit ${v.status}`;
    add('FAIL', 'A2', `validate-spec.mjs failed (${first.trim()})`);
  }

  // slug from §1
  const slugMatch = /\*\*Proposed slug:\*\*\s*`([^`]+)`/.exec(md);
  const slug = slugMatch ? slugMatch[1] : null;
  if (!slug) {
    add('FAIL', 'A4', 'could not parse "Proposed slug" from section 1');
  } else {
    const targets = [
      [REGISTRY, 'componentData.tsx'],
      [METADATA, 'componentMetadata.ts'],
      [INDEX_PATH, 'component-index.json'],
    ];
    const hits = [];
    for (const [file, label] of targets) {
      try {
        const text = readFileSync(file, 'utf8');
        const n = countOccurrences(text, slug);
        if (n > 0) hits.push(`${label}(${n})`);
      } catch (err) {
        hits.push(`${label}(unreadable)`);
      }
    }
    if (hits.length) add('FAIL', 'A4', `slug "${slug}" already present in ${hits.join(', ')}`);
    else add('PASS', 'A4', `slug "${slug}" unused in registry, metadata and index`);
  }

  // A5 / A6 from the §12 edit plan
  const edits = parseEdits(md);
  if (!edits) {
    add('FAIL', 'A5', 'could not parse a JSON §12 edit plan');
    add('FAIL', 'A6', 'could not parse a JSON §12 edit plan');
  } else {
    const creates = edits.filter((e) => e.operation === 'create-file');
    const existing = creates.filter((e) => typeof e.file === 'string' && existsSync(path.resolve(REPO_ROOT, e.file)));
    if (!creates.length) add('FAIL', 'A5', '§12 has no create-file edit');
    else if (existing.length) add('FAIL', 'A5', `create-file target already exists: ${existing.map((e) => e.file).join(', ')}`);
    else add('PASS', 'A5', `${creates.length} create-file target(s) do not exist`);

    let checked = 0;
    const bad = [];
    for (const e of edits) {
      if (e.operation === 'create-file') continue;
      checked++;
      const abs = path.resolve(REPO_ROOT, e.file);
      if (!existsSync(abs)) { bad.push(`${e.file} missing`); continue; }
      const text = readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
      const needle = String(e.anchor).replace(/\r\n/g, '\n');
      const n = countOccurrences(text, needle);
      if (n !== 1) bad.push(`${e.file} (${n} matches)`);
    }
    if (bad.length) add('FAIL', 'A6', `anchor failures: ${bad.join(', ')}`);
    else add('PASS', 'A6', `${checked}/${checked} insert anchors resolve exactly once`);
  }

  // A7 — git status (read-only). Skill/spec scaffolding is auto-accepted; unrelated
  // uncommitted app code still requires explicit human acceptance.
  const g = spawnSync('git', ['status', '--porcelain'], { cwd: REPO_ROOT, encoding: 'utf8' });
  if (g.status !== 0) {
    add('WARN', 'A7', 'git status unavailable (not a repo?) — confirm manually');
  } else {
    const paths = (g.stdout || '')
      .split('\n')
      .map((l) => l.replace(/\r$/, ''))
      .filter((l) => l.trim())
      .map((l) => {
        let p = l.slice(3).trim();
        const arrow = p.indexOf(' -> ');
        if (arrow !== -1) p = p.slice(arrow + 4);
        if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
        return p.replace(/\\/g, '/');
      });
    const isScaffolding = (p) => p.startsWith('.agents/skills/') || p.startsWith('component-specs/');
    const unrelated = paths.filter((p) => !isScaffolding(p));
    const scaffoldCount = paths.length - unrelated.length;
    if (unrelated.length) {
      add('WARN', 'A7', `unrelated uncommitted app state (${unrelated.length}): ${unrelated.join(', ')} — user must accept`);
    } else if (scaffoldCount > 0) {
      add('PASS', 'A7', `dirty only by auto-accepted skill/spec scaffolding (${scaffoldCount} path(s))`);
    } else {
      add('PASS', 'A7', 'git tree is clean');
    }
  }

  // Manual gates
  add('MANUAL', 'A3', 'explicit user approval must be confirmed in the conversation');
  add('MANUAL', 'A8', 'rollback manifest is recorded by the run, not by this script');

  report();
  process.exit(rows.some((r) => r.status === 'FAIL') ? 1 : 0);
}

function report() {
  const width = Math.max(...rows.map((r) => r.id.length));
  console.log('UI-HUB Forge — Stage A preflight (read-only)\n');
  for (const r of rows) {
    console.log(`${r.status.padEnd(6)} ${r.id.padEnd(width)}  ${r.detail}`);
  }
  const fails = rows.filter((r) => r.status === 'FAIL').length;
  console.log(`\n${fails === 0 ? 'No automated failures.' : `${fails} automated failure(s).`} Manual gates: A3, A8.`);
}

main().catch((err) => {
  console.error(`Unexpected error: ${err.stack || err.message}`);
  process.exit(2);
});
