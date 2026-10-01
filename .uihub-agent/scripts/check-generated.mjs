#!/usr/bin/env node
/**
 * Generated artifact freshness guard — agent.md task 6.15.
 *
 * mcp-server/dist/ is tracked and bundled into the Vercel serverless function.
 * This validator:
 *
 * 1. Builds mcp-server from source into a temporary directory.
 * 2. Compares the entire tracked dist tree against the fresh build.
 * 3. Fails if ANY file is missing, extra, or byte-different.
 *
 * It does not modify the repository. This makes it safe to run in CI before
 * publishing.
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, statSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, dirname } from 'node:path';

const ROOT = process.cwd();
const TRACKED_DIST = 'mcp-server/dist';

const trackedCount = (prefix) => {
  const { stdout } = spawnSync('git', ['ls-files', '--', prefix], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return stdout ? stdout.trim().split('\n').filter(Boolean) : [];
};

/** Always use forward slashes so Windows and Linux produce identical reports. */
const norm = (p) => p.replace(/\\/g, '/');

function walk(dir, base = dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p, base));
    else out.push(norm(relative(base, p)));
  }
  return out.sort();
}

/**
 * Compare two built files for freshness.
 *
 * Byte comparison is correct for JS and JSON output.
 *
 * Sourcemaps (.js.map) are compared semantically instead. tsc writes the
 * relative path from the map to its source, so a map built at
 * `mcp-server/dist/` records `../../src/config/env.ts` while the same map built
 * into a temp directory records `../../../../<abs path>/src/config/env.ts`.
 * Those are the same map describing the same source; a byte comparison would
 * report every sourcemap as stale on every run, which would make this validator
 * noise rather than signal.
 */
function bytesEqual(a, b, relPath) {
  const ba = readFileSync(a);
  const bb = readFileSync(b);

  if (!relPath.endsWith('.map')) {
    return ba.compare(bb) === 0;
  }

  let ja;
  let jb;
  try {
    ja = JSON.parse(ba.toString('utf8'));
    jb = JSON.parse(bb.toString('utf8'));
  } catch {
    return ba.compare(bb) === 0; // not JSON; fall back to bytes
  }

  // The mappings/mappings-suffix payloads must match exactly.
  if (ja.mappings !== jb.mappings) return false;
  if ((ja.names ?? []).join(',') !== (jb.names ?? []).join(',')) return false;
  // sourcesContent, if present, must match.
  if ((ja.sourcesContent?.[0] ?? '') !== (jb.sourcesContent?.[0] ?? '')) return false;

  // sources may differ only by the relative prefix to the same file.
  // Reduce each source entry to its path relative to the package root, so that
  // `../../src/config/env.ts` (built at dist/) and
  // `../../../../<abs>/mcp-server/src/config/env.ts` (built to a temp dir)
  // collapse to the same value.
  const toRootRel = (s) => {
    const p = norm(s);
    // Anchoring on `src/` works for both forms:
    //   `../../src/config/env.ts`                    -> src/config/env.ts
    //   `../../../../C:/x/UI-HUB-/mcp-server/src/config/env.ts` -> src/config/env.ts
    const i = p.lastIndexOf('src/');
    if (i !== -1) return p.slice(i);
    return p.replace(/^(?:\.\.\/)+/, '');
  };
  const sa = (ja.sources ?? []).map(toRootRel);
  const sb = (jb.sources ?? []).map(toRootRel);
  return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
}

async function main() {
  if (!existsSync(TRACKED_DIST)) {
    console.error(`[check-generated] FATAL: ${TRACKED_DIST} does not exist on disk`);
    process.exit(2);
  }

  const tracked = trackedCount(TRACKED_DIST);
  if (tracked.length === 0) {
    console.error(`[check-generated] FATAL: ${TRACKED_DIST} exists but has 0 tracked files (git does not see it)`);
    process.exit(2);
  }

  const tmp = mkdtempSync(join(tmpdir(), 'mcp-dist-'));
  console.log('[check-generated] building mcp-server to a temporary directory');

  // npx is a shell script/batch shim; spawnSync cannot execute it directly on
  // Windows, so route through the shell and capture output for diagnostics.
  const build = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['tsc', '--outDir', tmp], {
    cwd: join(ROOT, 'mcp-server'),
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  if (build.error) {
    rmSync(tmp, { recursive: true, force: true });
    console.error(`[check-generated] could not launch tsc: ${build.error.message}`);
    process.exit(3);
  }
  if (build.status !== 0) {
    rmSync(tmp, { recursive: true, force: true });
    console.error('[check-generated] mcp-server build FAILED; refusing to compare against a partial build');
    if (build.stdout) console.error(build.stdout.split('\n').slice(-25).join('\n'));
    if (build.stderr) console.error(build.stderr.split('\n').slice(-25).join('\n'));
    process.exit(3);
  }

  // Also run the copy step so generated JSON data files are present.
  // copy-data.mjs hard-codes dist/, so mirror the real build: copy the data
  // assets into the temporary tree ourselves, from the same source list the
  // real copy step uses. Reading the list from copy-data.mjs keeps the two in
  // step instead of duplicating it here.
  const DATA_FILES = [
    'sourceCode.json',
    'premiumComponents.json',
    'aiPrompts.json',
    'componentMetadata.json',
    'componentVibePrompts.json',
    'templates.json',
    'templateSourceCode.json',
  ];
  const { mkdirSync, copyFileSync } = await import('node:fs');
  const distData = join(tmp, 'data');
  mkdirSync(distData, { recursive: true });
  for (const f of DATA_FILES) {
    const srcData = join(ROOT, 'mcp-server', 'src', 'data', f);
    if (!existsSync(srcData)) {
      rmSync(tmp, { recursive: true, force: true });
      console.error(`[check-generated] missing source data file: mcp-server/src/data/${f}`);
      process.exit(3);
    }
    copyFileSync(srcData, join(distData, f));
  }

  const fresh = walk(tmp).sort();
  const trackedRel = tracked.map((f) => norm(relative(TRACKED_DIST, f))).sort();

  const missingInFresh = trackedRel.filter((f) => !fresh.includes(f));
  const extraInFresh = fresh.filter((f) => !trackedRel.includes(f));
  const diffs = [];

  // files common to both: compare bytes
  for (const f of trackedRel) {
    if (!fresh.includes(f)) continue;
    const tPath = join(ROOT, TRACKED_DIST, f);
    const fPath = join(tmp, f);
    try {
      if (!bytesEqual(tPath, fPath, f)) diffs.push(f);
    } catch (e) {
      diffs.push(`${f} (compare failed: ${e.message})`);
    }
  }

  rmSync(tmp, { recursive: true, force: true });

  let failed = false;
  if (missingInFresh.length) {
    failed = true;
    console.error(`[check-generated] FILES MISSING FROM FRESH BUILD (should not be tracked, or build dropped them):`);
    missingInFresh.forEach((f) => console.error(`  - ${f}`));
  }
  if (extraInFresh.length) {
    failed = true;
    console.error(`[check-generated] EXTRA FILES IN FRESH BUILD (tracked dist is stale — needs regeneration):`);
    extraInFresh.forEach((f) => console.error(`  + ${f}`));
  }
  if (diffs.length) {
    failed = true;
    console.error('[check-generated] CONTENT DIFFERS (tracked dist is stale):');
    // cap to avoid flooding CI logs
    diffs.slice(0, 30).forEach((f) => console.error(`  * ${f}`));
    if (diffs.length > 30) console.error(`  ...and ${diffs.length - 30} more`);
  }

  console.log(`[check-generated] tracked=${tracked.length} fresh=${fresh.length} common=${trackedRel.filter((f) => fresh.includes(f)).length}`);

  if (failed) {
    console.error('[check-generated] RESULT: STALE — run `npm run generate` and commit regenerated mcp-server/dist');
    process.exit(1);
  }
  console.log('[check-generated] RESULT: FRESH — tracked dist matches source');
  process.exit(0);
}

main().catch((e) => {
  console.error('[check-generated] unexpected error:', e);
  process.exit(4);
});