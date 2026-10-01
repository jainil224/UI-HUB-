#!/usr/bin/env node
/**
 * Tracking invariants — agent.md task 6.10.
 *
 * Phase 5 found `.uihub-agent/` and `.github/` both ignored, which made the
 * project knowledge base and the CI definition impossible to track, review or
 * share. `.uihub-agent/` was fixed in Phase 5; `.github/` in Phase 6.
 *
 * The intent was never "track everything". Three build outputs are tracked and
 * three are not, and that split is load-bearing:
 *
 *   - `cli/dist/` is tracked because the CLI is published FROM dist and ships
 *     its own lockfile (`cli/.gitignore` negates `dist/`).
 *   - `mcp-server/dist/` is tracked (root `.gitignore` negates it) and is
 *     guarded for staleness by `check-generated.mjs`.
 *   - `frontend/dist/` is ignored because Vercel builds the frontend from
 *     source. Committing 700+ build files would create constant diff noise and
 *     a second, always-stale copy of the app.
 *   - `backend/dist/` is ignored; the backend is not built in-repo.
 *
 * So "generated artifacts are handled intentionally" is asserted path by path,
 * not as a blanket rule.
 *
 * Exit codes: 0 all satisfied, 1 one or more violated, 2 could not evaluate
 * (git unavailable) — distinct so CI can tell "broken" from "unrunnable".
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const results = [];
let unknownCount = 0;

function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

/**
 * `git check-ignore` signals its answer through the exit status, not stdout:
 * 0 = ignored, 1 = not ignored. Exit 128 means the path was malformed.
 */
function isIgnored(path) {
  const { status } = spawnSync('git', ['check-ignore', '-q', '--', path], { stdio: 'ignore' });
  return status === 0;
}

function isTracked(path) {
  const out = git(['ls-files', '--error-unmatch', '--', path]);
  return out !== '' && out !== null;
}

function trackedCount(prefix) {
  const out = git(['ls-files', '--', prefix]);
  if (!out) return 0;
  return out.split('\n').filter(Boolean).length;
}

function rule(id, description, fn) {
  let status;
  let detail = '';
  try {
    const r = fn();
    status = r.status;
    detail = r.detail ?? '';
  } catch (e) {
    status = 'UNKNOWN';
    detail = `evaluation failed: ${e.message}`;
  }
  if (status === 'UNKNOWN') unknownCount++;
  results.push({ id, description, status, detail });
}

// ---------------------------------------------------------------------------
// 1. Knowledge base trackable and fully tracked
// ---------------------------------------------------------------------------

rule('knowledge-trackable', '.uihub-agent/ must NOT be gitignored', () => ({
  status: isIgnored('.uihub-agent') ? 'FAIL' : 'PASS',
  detail: isIgnored('.uihub-agent') ? '.uihub-agent/ is ignored — knowledge base is untrackable' : 'not ignored',
}));

rule('knowledge-tracked', 'every .uihub-agent/ file must be tracked', () => {
  const untracked = git(['ls-files', '--others', '--exclude-standard', '--', '.uihub-agent']);
  const list = untracked ? untracked.split('\n').filter(Boolean) : [];
  return {
    status: list.length === 0 ? 'PASS' : 'FAIL',
    detail: list.length === 0 ? `${trackedCount('.uihub-agent')} files tracked` : `untracked: ${list.join(', ')}`,
  };
});

// ---------------------------------------------------------------------------
// 2. CI workflows trackable
// ---------------------------------------------------------------------------

rule('ci-trackable', '.github/ must NOT be gitignored', () => ({
  status: isIgnored('.github') ? 'FAIL' : 'PASS',
  detail: isIgnored('.github') ? '.github/ is ignored — CI is invisible to reviewers' : 'not ignored',
}));

rule('ci-workflows-exist', '.github/workflows/ must contain at least one workflow file on disk', () => {
  const dir = '.github/workflows';
  if (!existsSync(dir)) return { status: 'FAIL', detail: 'no workflows directory' };
  const files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
  return {
    status: files.length > 0 ? 'PASS' : 'FAIL',
    detail: files.length ? files.join(', ') : 'directory present but empty',
  };
});

rule('ci-workflows-tracked', 'every workflow file on disk must be tracked by git', () => {
  const untracked = git(['ls-files', '--others', '--exclude-standard', '--', '.github/workflows']);
  const list = untracked ? untracked.split('\n').filter(Boolean) : [];
  return {
    status: list.length === 0 ? 'PASS' : 'FAIL',
    detail: list.length === 0 ? 'all workflows tracked' : `untracked workflow files: ${list.join(', ')}`,
  };
});

// ---------------------------------------------------------------------------
// 3. Agent instruction files trackable
// ---------------------------------------------------------------------------

for (const f of ['agent.md', '.uihub-agent/AGENT.md', '.uihub-agent/rules/DO_NOT_CHANGE.md']) {
  rule(`agent-file:${f}`, `${f} must be tracked`, () => ({
    status: isTracked(f) ? 'PASS' : 'FAIL',
    detail: isTracked(f) ? 'tracked' : 'not tracked',
  }));
}

// ---------------------------------------------------------------------------
// 4. Secrets stay ignored
// ---------------------------------------------------------------------------

for (const s of ['backend/.env', '.env', 'backend/service-account.json', 'backend/firebase-service-account.json']) {
  rule(`secret-ignored:${s}`, `${s} must stay gitignored`, () => {
    if (!existsSync(s)) {
      // Absent file: the gitignore pattern must still be intact, so the check
      // is still meaningful.
      const ignored = isIgnored(s);
      return {
        status: ignored ? 'PASS' : 'FAIL',
        detail: ignored ? 'ignored (file absent, pattern intact)' : 'NOT ignored — secret could be committed',
      };
    }
    return {
      status: isIgnored(s) ? 'PASS' : 'FAIL',
      detail: isIgnored(s) ? 'ignored' : 'NOT ignored — secret exists and could be committed',
    };
  });
}

rule('env-example-tracked', 'backend/.env.example must remain tracked (placeholders are not secrets)', () => ({
  status: isTracked('backend/.env.example') ? 'PASS' : 'FAIL',
  detail: isTracked('backend/.env.example') ? 'tracked' : 'not tracked',
}));

// ---------------------------------------------------------------------------
// 5. Build output: tracked / ignored, asserted per path with intent
// ---------------------------------------------------------------------------

// These MUST be ignored.
for (const d of ['frontend/dist', 'backend/dist']) {
  rule(`build-ignored:${d}`, `${d} must be gitignored`, () => ({
    status: isIgnored(d) ? 'PASS' : 'FAIL',
    detail: isIgnored(d) ? 'ignored' : 'NOT ignored',
  }));
}

// These MUST be trackable (intentionally tracked generated output).
for (const d of ['mcp-server/dist', 'cli/dist']) {
  rule(`build-tracked:${d}`, `${d} must be trackable (intentionally tracked)`, () => ({
    status: isIgnored(d) ? 'FAIL' : 'PASS',
    detail: isIgnored(d) ? 'ignored, but this build output is intentionally tracked' : 'not ignored',
  }));
}

// ---------------------------------------------------------------------------
// 6. Personal agent tooling stays local
// ---------------------------------------------------------------------------

for (const d of ['.agents', '.claude', '.opencode', 'component-specs']) {
  rule(`local-ignored:${d}`, `${d} must stay gitignored (personal/local tooling)`, () => ({
    status: isIgnored(d) ? 'PASS' : 'FAIL',
    detail: isIgnored(d) ? 'ignored' : 'NOT ignored — personal tooling would be published',
  }));
}

// ---------------------------------------------------------------------------
// 7. Generated artifacts consistent between disk and index
// ---------------------------------------------------------------------------

rule('generated:mcp-dist-consistent', 'mcp-server/dist on disk must match what is tracked', () => {
  if (!existsSync('mcp-server/dist')) {
    return { status: 'UNKNOWN', detail: 'mcp-server/dist absent (not built yet)' };
  }
  const walk = (dir) => {
    let n = 0;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      n += e.isDirectory() ? walk(p) : 1;
    }
    return n;
  };
  const onDisk = walk('mcp-server/dist');
  const tracked = trackedCount('mcp-server/dist');
  // Guarded in detail by check-generated.mjs; this is the coarse index check.
  return {
    status: onDisk === tracked ? 'PASS' : 'FAIL',
    detail: `disk=${onDisk} tracked=${tracked}${onDisk === tracked ? '' : ' — run the regeneration command'}`,
  };
});

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const SYMBOL = { PASS: 'PASS', FAIL: 'FAIL', UNKNOWN: 'UNKNOWN' };
for (const r of results) {
  const mark = r.status === 'PASS' ? 'ok  ' : r.status === 'FAIL' ? 'FAIL' : '????';
  console.log(`[${mark}] ${r.id.padEnd(42)} ${r.detail}`);
}

const failed = results.filter((r) => r.status === 'FAIL').length;
const passed = results.filter((r) => r.status === 'PASS').length;

console.log('');
console.log(`[check-tracking] ${passed}/${results.length} satisfied, ${failed} violated, ${unknownCount} unknown`);

if (failed > 0) process.exit(1);
if (unknownCount > results.length / 2) process.exit(2);
process.exit(0);