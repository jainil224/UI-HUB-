/**
 * File discovery and exclusion — agent.md task 7.28.
 *
 * Two rules drive this module:
 *
 *   1. The index must never contain a credential. `.env*` and
 *      `service-account.json` are excluded by NAME here, before any file is
 *      opened, so their contents cannot reach the indexer at all.
 *
 *   2. The index must never contain a vendor blob. `node_modules`, `dist`,
 *      `public` and binary assets are excluded, and the binary check is a
 *      content sniff rather than an extension guess, because this repository
 *      stores 3D models (`.glb`) and a stray `.bak`.
 *
 * Exclusions are derived from the repository's real structure, not guessed:
 * the directory list comes from what actually exists on disk under the source
 * roots, and the gitignore rules are read from `.gitignore` where relevant.
 */

import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { join, extname, basename, relative, resolve, sep } from 'node:path';

/**
 * Roots that contain indexable first-party source.
 *
 * `backend/scripts` and `frontend/scripts` hold 14 operational scripts
 * (`grantProUser.js`, `resetFirebase.js`, `generate-favicons.mjs` and friends).
 * They are first-party code that PROJECT_MAP.json already lists, so leaving them
 * out made FILE_ROLE_MAP incomplete for exactly the kind of file an operator
 * needs to look up.
 */
export const SOURCE_ROOTS = [
  'frontend/src',
  'backend/src',
  'mcp-server/src',
  'cli/src',
  'api',
  'scripts',
  'backend/scripts',
  'frontend/scripts',
];

/**
 * Directory names never descended into.
 *
 * `public` is here because `frontend/public` holds 485 tracked files of binary
 * previews; none of it is source. `mcp-server/dist` is tracked build output and
 * is covered by the GENERATED role rule in classify.mjs instead — it is listed
 * in NO_INDEX_DIRS so it is never parsed, and tracked separately so freshness
 * can still be reported.
 */
/**
 * Roots that contain test suites.
 *
 * Phase 8 closed with 16 of the repository's 18 real test files missing from the
 * index entirely, because every one of them lives in a sibling `tests/` directory
 * that SOURCE_ROOTS never descends into. The two that were indexed only made it
 * in by accident: they sit inside `frontend/src`, so `frontend/src/utils/
 * apiConfig.test.ts` and `frontend/src/routing/vercelRouting.test.ts` were
 * reachable purely by their location.
 *
 * This is a DISCOVERY gap, not a classification gap. classify.mjs already
 * returned TEST for both `(^|/)tests?/` and `*.test.*`, so nothing about the
 * classifier needed to change to admit these files - the walker simply never
 * offered them. Walking TEST_ROOTS is therefore the smallest change that makes
 * `TEST_DEPENDENCY` reachable, and it reuses the existing parse / resolve /
 * classify pipeline unchanged.
 *
 * Both directions of the question the intelligence layer must answer now work
 * from real graph edges:
 *
 *   test  -> what it covers     IMPORT_GRAPH outbound edge
 *   source -> tests that cover  REVERSE_DEPENDENCY_MAP importer
 *
 * The test-runner globs in this repository are the evidence for these paths, not
 * a guess. `frontend/vitest.config.ts` sets include to src, recursive, .test.ts;
 * `mcp-server/vitest.config.ts` sets include to tests, recursive, .test.ts; and
 * `backend/package.json` runs node --test over tests, recursive, .test.js while
 * `cli/package.json` names files directly under `tests/`.
 *
 * No test file is MOVED. `TEST_ROOTS` only widens what is read.
 */
export const TEST_ROOTS = [
  'backend/tests',
  'mcp-server/tests',
  'cli/tests',
];

/**
 * Every root the walker descends into.
 *
 * SOURCE_ROOTS and TEST_ROOTS are kept separate because they mean different
 * things: SOURCE_ROOTS is application source, TEST_ROOTS is verification of it.
 * Each generated artifact records both so a reader can tell which a file came
 * from instead of inferring it.
 */
export const ALL_ROOTS = [...SOURCE_ROOTS, ...TEST_ROOTS];

export const NO_INDEX_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  '.vercel',
  '.turbo',
  'tmp',
  'temp',
  'logs',
  '.cache',
  'public',
  '.vscode',
  '.idea',
  '.cursor',
  '.agents',
  '.claude',
  '.opencode',
  'component-specs',
  '.uihub-agent',
]);

/** Files never opened. Credentials first, then editor/log noise. */
export const NO_INDEX_FILES = new Set([
  '.DS_Store',
  'Thumbs.db',
  'service-account.json',
  'firebase-adminsdk.json',
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.development.local',
  '.env.production.local',
]);

/** Extensions the indexer will parse. */
export const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

/** Extensions recorded as a role but never parsed. */
export const ROLE_ONLY_EXT = new Set([
  '.json', '.yaml', '.yml', '.css', '.html', '.md', '.sql',
  '.glb', '.gltf', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.otf', '.mp4', '.webm',
  '.sh', '.ps1', '.bat', '.bak', '.txt', '.lock', '.map',
]);

export function toPosix(p) {
  return p.split(sep).join('/');
}

export function relFromRoot(root, absolute) {
  return toPosix(relative(root, absolute));
}

/** True when the file is excluded by name alone. */
export function isExcludedName(name) {
  if (NO_INDEX_DIRS.has(name)) return { excluded: true, reason: `dir:${name}` };
  if (NO_INDEX_FILES.has(name)) return { excluded: true, reason: `file:${name}` };
  if (name.endsWith('.log')) return { excluded: true, reason: 'file:*.log' };
  if (/\.env(\.|$)/.test(name)) return { excluded: true, reason: 'file:.env*' };
  if (/\.(bak|orig|rej|swp)$/.test(name)) return { excluded: true, reason: 'file:editor-backup' };
  return { excluded: false };
}

/**
 * Binary sniff: a NUL byte in the first 8 KB.
 *
 * Extension-based guessing is not enough here — `frontend/src/data/*.ts`
 * contains 897 KB of embedded source as string literals, and an earlier
 * generator assumed anything with a code extension was text.
 */
export function looksBinary(absolute) {
  let fd;
  try {
    fd = readFileSync(absolute, { encoding: null });
  } catch {
    return false;
  }
  const n = Math.min(fd.length, 8192);
  for (let i = 0; i < n; i++) if (fd[i] === 0) return true;
  return false;
}

/**
 * Walk one root, returning indexable files and a full exclusion ledger.
 *
 * The ledger matters: task 7.40 asks for a total-file / indexed-file /
 * excluded-file count, and an exclusion you cannot account for is an exclusion
 * you cannot audit.
 *
 * `sniffBinary: false` skips the per-file content read in `looksBinary()`, so
 * `indexed` becomes a superset that also contains binary files under a code
 * extension. It is for callers that need the SET OF PATHS and can decide
 * binariness themselves on a much smaller set — `freshness()` uses it and then
 * sniffs only the paths the manifest has never recorded. The generator leaves
 * it on, because the index must never contain a vendor blob.
 */
export function discover(root, { includeRoleOnly = true, sniffBinary = true } = {}) {
  const indexed = [];
  const roleOnly = [];
  const excluded = [];
  const seenDirs = new Set();

  const visit = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    // Sort for determinism. readdirSync order is filesystem-dependent.
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

    for (const e of entries) {
      const abs = join(dir, e.name);
      const rel = relFromRoot(root, abs);

      if (e.isDirectory()) {
        const gate = isExcludedName(e.name);
        if (gate.excluded) {
          // Count everything beneath so the ledger is honest about volume.
          let sub = 0;
          try {
            sub = countFiles(join(dir, e.name));
          } catch {
            sub = -1;
          }
          excluded.push({ path: rel, kind: 'directory', reason: gate.reason, filesBeneath: sub });
          seenDirs.add(rel);
          continue;
        }
        visit(abs);
        continue;
      }

      if (!e.isFile()) continue;

      const gate = isExcludedName(e.name);
      if (gate.excluded) {
        excluded.push({ path: rel, kind: 'file', reason: gate.reason, filesBeneath: 1 });
        continue;
      }

      const ext = extname(e.name);
      if (CODE_EXT.has(ext)) {
        if (sniffBinary && looksBinary(abs)) {
          excluded.push({ path: rel, kind: 'file', reason: 'binary-content', filesBeneath: 1 });
          continue;
        }
        let size = 0;
        try {
          size = statSync(abs).size;
        } catch {
          size = 0;
        }
        indexed.push({ path: rel, abs, ext, size, parseable: true });
        continue;
      }

      if (includeRoleOnly && ROLE_ONLY_EXT.has(ext)) {
        roleOnly.push({ path: rel, abs, ext, parseable: false });
        continue;
      }

      excluded.push({ path: rel, kind: 'file', reason: `ext:${ext || '(none)'}`, filesBeneath: 1 });
    }
  };

  for (const r of ALL_ROOTS) {
    const abs = resolve(root, r);
    if (!existsSync(abs)) {
      excluded.push({ path: r, kind: 'directory', reason: 'root-missing', filesBeneath: 0 });
      continue;
    }
    visit(abs);
  }

  indexed.sort((a, b) => (a.path < b.path ? -1 : 1));
  roleOnly.sort((a, b) => (a.path < b.path ? -1 : 1));
  excluded.sort((a, b) => (a.path < b.path ? -1 : 1));

  return {
    indexed,
    roleOnly,
    excluded,
    directoriesSeen: [...seenDirs].sort(),
    totals: {
      indexed: indexed.length,
      roleOnly: roleOnly.length,
      excludedEntries: excluded.length,
      excludedFiles: excluded.reduce((n, e) => n + (e.filesBeneath > 0 ? e.filesBeneath : 0), 0),
      parseableBytes: indexed.reduce((n, f) => n + f.size, 0),
    },
  };
}

function countFiles(dir) {
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, e.name);
    if (e.isDirectory()) {
      const gate = isExcludedName(e.name);
      if (gate.excluded) continue;
      n += countFiles(abs);
    } else if (e.isFile()) {
      n += 1;
    }
  }
  return n;
}