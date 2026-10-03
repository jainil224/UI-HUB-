/**
 * F2 change-simulation harness — a throwaway copy of the repository that the
 * agent scripts can be pointed at.
 *
 * WHY THIS EXISTS
 *
 * Freshness is only provable against a tree that has actually drifted. The
 * existing stale-index test (`prepare-task.test.mjs` TEST 7) gets a STALE state
 * by copying `.uihub-agent` alone and letting the recorded source snapshot go
 * unsatisfied — which is a valid way to reach STALE, but it cannot tell the
 * difference between "the snapshot is missing files" and "the snapshot is
 * wrong about a file that exists".
 *
 * F2 needs the second kind: a tree that starts genuinely FRESH, then has one
 * controlled mutation applied, so recovery can be measured against the state it
 * started from. That requires copying the indexed source tree as well.
 *
 * WHY A PARTIAL COPY IS FAITHFUL
 *
 * `query-index.mjs` derives ROOT from `import.meta.url`, not `process.cwd()`, so a
 * copy of `.uihub-agent` is enough to relocate the whole intelligence layer. The
 * source tree must accompany it because `freshness()` walks `ALL_ROOTS` from
 * `walk.mjs` to find files the snapshot never saw — a copy without those roots
 * would report every indexed path as removed, which is STALE for the wrong
 * reason and would make every scenario indistinguishable.
 *
 * So this copies exactly `walk.mjs`'s roots plus the root-level files the
 * generator reads, and nothing else. `node_modules`, `dist`, and `.git` are
 * deliberately not copied: they are excluded from indexing anyway, and copying
 * them would turn a 19 MB fixture into a 580 MB one. `check-generated.mjs` needs
 * them, so `mcpBuild: true` adds them on demand (see below).
 *
 * NOTHING HERE TOUCHES THE REAL WORKING TREE. Every copy lives under the
 * OS temp directory and `cleanup()` removes it. Callers are expected to use
 * try/finally; `cleanup()` also registers an exit hook so an assertion failure
 * mid-scenario still cannot leave a copy behind.
 */

import {
  mkdtempSync, cpSync, rmSync, existsSync, readFileSync, writeFileSync,
  appendFileSync, renameSync, mkdirSync, statSync, symlinkSync, readdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** The real repository root. `helpers/` sits at `.uihub-agent/tests/helpers`. */
export const REPO_ROOT = resolve(HERE, '..', '..', '..');

/**
 * Mirrors `walk.mjs` `SOURCE_ROOTS` + `TEST_ROOTS`. Kept as data rather than
 * imported so the harness cannot drift into importing the module it is
 * supposed to be testing; `assertRootsMatchWalker()` below fails loudly if the
 * two ever disagree.
 */
export const INDEXED_ROOTS = [
  'frontend/src',
  'backend/src',
  'mcp-server/src',
  'cli/src',
  'api',
  'scripts',
  'backend/scripts',
  'frontend/scripts',
  'backend/tests',
  'mcp-server/tests',
  'cli/tests',
];

/**
 * Root-level files the index generator and the checks read directly. A missing
 * one changes what `agent:index` produces, so they travel with every copy.
 */
export const ROOT_FILES = [
  'package.json',
  '.gitignore',
  'agent.md',
  'MCP.md',
  'README.md',
  'vercel.json',
  'frontend/vitest.config.ts',
  'frontend/tsconfig.json',
  'backend/package.json',
  'mcp-server/package.json',
  'mcp-server/tsconfig.json',
  'cli/package.json',
  'cli/tsconfig.json',
];

/**
 * Fail if the harness's copy list drifts from the walker's real roots.
 *
 * A stale copy list is the one failure mode that would make every F2 scenario
 * quietly meaningless — the tree would be STALE for a structural reason that
 * has nothing to do with the mutation under test. This is the guard against it.
 */
export async function assertRootsMatchWalker() {
  // A bare Windows path is not a valid ES module specifier; it must be a file URL.
  const walker = pathToFileURL(
    join(REPO_ROOT, '.uihub-agent', 'scripts', 'lib', 'walk.mjs'),
  ).href;
  const { ALL_ROOTS } = await import(walker);
  const mine = [...INDEXED_ROOTS].sort();
  const theirs = [...ALL_ROOTS].sort();
  if (JSON.stringify(mine) !== JSON.stringify(theirs)) {
    throw new Error(
      'sim-repo copy list has drifted from walk.mjs ALL_ROOTS.\n' +
      `  harness: ${mine.join(', ')}\n  walker:  ${theirs.join(', ')}\n` +
      '  Update INDEXED_ROOTS in this file.',
    );
  }
}

/**
 * Create a throwaway repository copy.
 *
 * @param {object} [opts]
 * @param {string} [opts.label]      temp directory prefix, for debuggability
 * @param {boolean} [opts.mcpBuild]  also stage mcp-server/dist + a node_modules
 *                                   junction + a temp git repo, which is what
 *                                   `check:generated` needs (it uses
 *                                   `process.cwd()` and `git ls-files`, unlike
 *                                   every other script).
 */
export function createSimRepo({ label = 'uihub-f2-', mcpBuild = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), label));

  cpSync(join(REPO_ROOT, '.uihub-agent'), join(root, '.uihub-agent'), { recursive: true });

  linkNodeModules(root);

  for (const rel of INDEXED_ROOTS) {
    const src = join(REPO_ROOT, rel);
    if (!existsSync(src)) continue;
    const dest = join(root, rel);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest, { recursive: true });
  }

  for (const rel of ROOT_FILES) {
    const src = join(REPO_ROOT, rel);
    if (!existsSync(src)) continue;
    const dest = join(root, rel);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest);
  }

  copyReferencedPaths(root);

  for (const rel of SUPPORT_PATHS) {
    const src = join(REPO_ROOT, rel);
    if (!existsSync(src)) continue;
    const dest = join(root, rel);
    if (existsSync(dest)) continue;
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest, { recursive: true, filter: (s) => !NEVER_COPY.some((re) => re.test(s)) });
  }

  if (mcpBuild) stageMcpBuild(root);

  let cleaned = false;

  const api = {
    root,

    abs: (rel) => join(root, rel),

    exists: (rel) => existsSync(join(root, rel)),

    read: (rel) => readFileSync(join(root, rel), 'utf8'),

    readJson: (rel) => JSON.parse(readFileSync(join(root, rel), 'utf8')),

    write(rel, content) {
      const dest = join(root, rel);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, content);
    },

    append(rel, content) {
      appendFileSync(join(root, rel), content);
    },

    remove: (rel) => rmSync(join(root, rel), { force: true, recursive: true }),

    rename(from, to) {
      const dest = join(root, to);
      mkdirSync(dirname(dest), { recursive: true });
      renameSync(join(root, from), dest);
    },

    /** Append a deterministic, obviously-inert marker to a source file. */
    touchSource(rel, marker) {
      appendFileSync(join(root, rel), `\n// f2-simulation: ${marker}\n`);
    },

    /**
     * Run a script from the copy. Never throws: exit codes are the thing under
     * test, so they are returned rather than raised.
     *
     * @returns {{code:number, stdout:string, stderr:string, ok:boolean}}
     */
    run(scriptRel, args = [], { cwd, env, timeout = 600000 } = {}) {
      const script = scriptRel.startsWith('.')
        ? scriptRel
        : join('.uihub-agent', 'scripts', scriptRel);
      const r = spawnSync(process.execPath, [join(root, script), ...args], {
        cwd: cwd ? join(root, cwd) : root,
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024,
        timeout,
        env: { ...process.env, ...env },
      });
      const stdout = String(r.stdout ?? '');
      const stderr = String(r.stderr ?? '');
      return {
        code: r.status === null ? -1 : r.status,
        stdout,
        stderr,
        ok: r.status === 0,
        output: stdout + stderr,
      };
    },

    /** Run a script and parse its stdout as JSON. Throws if it is not JSON. */
    runJson(scriptRel, args = [], opts = {}) {
      const r = api.run(scriptRel, args, opts);
      if (r.code !== 0) {
        throw new Error(
          `${scriptRel} exited ${r.code} but JSON was requested.\n${r.output.slice(-2000)}`,
        );
      }
      return { ...r, json: JSON.parse(r.stdout) };
    },

    /** `freshness()` from the copy's own `lib/intel.mjs`. */
    freshness() {
      const r = api.runInline(
        "import { freshness } from './.uihub-agent/scripts/lib/intel.mjs';" +
        'process.stdout.write(JSON.stringify(freshness()));',
      );
      return JSON.parse(r.stdout);
    },

    /** Evaluate an inline ES module inside the copy, with cwd = copy root. */
    runInline(source) {
      const r = spawnSync(process.execPath, ['--input-type=module', '-e', source], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024,
        timeout: 600000,
      });
      return {
        code: r.status === null ? -1 : r.status,
        stdout: String(r.stdout ?? ''),
        stderr: String(r.stderr ?? ''),
        output: String(r.stdout ?? '') + String(r.stderr ?? ''),
      };
    },

    /** `git` inside the copy, for the temp repo created by `mcpBuild`. */
    git(args) {
      const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
      return { code: r.status, stdout: String(r.stdout ?? ''), stderr: String(r.stderr ?? '') };
    },

    /** Every indexed path currently on disk, via the copy's own walker. */
    indexedPaths() {
      const r = api.runInline(
        "import { discover } from './.uihub-agent/scripts/lib/walk.mjs';" +
        "process.stdout.write(JSON.stringify(discover(process.cwd()).indexed.map(f=>f.path)));",
      );
      return JSON.parse(r.stdout);
    },

    /**
     * Run the real `mcp-server` build inside the copy.
     *
     * This is Scenario C's documented recovery path — `check:generated` ends its
     * STALE report with "run `npm run generate`", and `npm run generate` is
     * `cd mcp-server && npm run build`, which is
     * `tsc && check-source-coverage && copy-data`. Running only `tsc`, or
     * running the wrong generator, would leave the gate red for a reason that has
     * nothing to do with the drift under test.
     */
    buildMcp() {
      const scripts = join(root, 'mcp-server', 'scripts');
      // `shell` is needed only for the npx shim, which spawnSync cannot execute
      // directly on Windows. Passing `process.execPath` through a shell is what
      // breaks it: node usually lives under "C:\Program Files", and cmd.exe
      // splits that at the space, so the script step fails with
      // "'C:\Program' is not recognized" instead of running.
      const run = (cmd, args, { shell = false } = {}) => {
        const r = spawnSync(cmd, args, {
          cwd: join(root, 'mcp-server'),
          encoding: 'utf8',
          maxBuffer: 256 * 1024 * 1024,
          shell,
          timeout: 900000,
        });
        return {
          code: r.status === null ? -1 : r.status,
          stdout: String(r.stdout ?? ''),
          stderr: String(r.stderr ?? ''),
          output: String(r.stdout ?? '') + String(r.stderr ?? ''),
        };
      };
      const tsc = run(
        process.platform === 'win32' ? 'npx.cmd' : 'npx',
        ['tsc'],
        { shell: process.platform === 'win32' },
      );
      if (tsc.code !== 0) return { code: tsc.code, steps: { tsc } };
      const coverage = run(process.execPath, [join(scripts, 'check-source-coverage.mjs')]);
      if (coverage.code !== 0) return { code: coverage.code, steps: { tsc, coverage } };
      const copyData = run(process.execPath, [join(scripts, 'copy-data.mjs')]);
      return { code: copyData.code, steps: { tsc, coverage, copyData } };
    },

    cleanup() {
      if (cleaned) return;
      cleaned = true;
      rmSync(root, { recursive: true, force: true });
    },
  };

  // Belt and braces: an assertion that throws before the caller's finally block
  // is written must still not leave a 19 MB copy on disk.
  process.once('exit', () => {
    try { rmSync(root, { recursive: true, force: true }); } catch { /* already gone */ }
  });

  return api;
}

/**
 * Non-indexed files the check suite reads directly.
 *
 * These are not index inputs — they are the non-source files `check-docs`,
 * `check-knowledge`, and the render-host rules resolve against. Leaving them out
 * produces failures that belong to the copy, not the contract: `check-docs`
 * reported `render-host:ui-hub-mcp` as drift in a copy that had no `docs/` or
 * `render.yaml` to compare the prose against.
 */
export const SUPPORT_PATHS = [
  'render.yaml',
  'docs',
  '.github',
  'component-specs',
  'frontend/index.html',
  'frontend/public',
  '.vercelignore',
];

/**
 * Names the walker excludes before a file is ever opened, and that the harness
 * must therefore never copy. See `walk.mjs` rule 1: a credential must not reach
 * the index, and copying one into a temp directory would move the problem
 * instead of avoiding it.
 */
const NEVER_COPY = [
  /(^|[\\/])\.env(\.|$)/i,
  /service-account\.json$/i,
];

/**
 * The one path a sim repo is expected NOT to have.
 *
 * `check-knowledge.mjs` reports any referenced path that is absent from disk and
 * has no notion of "tracked" versus "present locally". The real repository
 * satisfies several of its references with untracked local files, and exactly one
 * of those is secret-shaped: `backend/service-account.json`. Copying a credential
 * into a temp directory to quiet a validator would be the wrong trade, so the
 * harness leaves it out on purpose.
 *
 * The consequence is a known, bounded baseline: a sim repo reports knowledge
 * findings that all name this one file. `onlyKnownAbsent()` lets a test assert
 * the baseline is *exactly* that set, so a genuine new knowledge problem is never
 * mistaken for harness noise — and harness noise is never mistaken for a pass.
 */
export const KNOWN_ABSENT_IN_SIM = 'backend/service-account.json';

/** Every `FAIL` line from a `check-knowledge` run. */
export function knowledgeFindings(result) {
  return result.output
    .split('\n')
    .filter((l) => /^\s*FAIL\s/.test(l))
    .map((l) => l.trim());
}

/** True when the run found problems and every one is the known-absent secret. */
export function onlyKnownAbsent(result) {
  const findings = knowledgeFindings(result);
  return (
    findings.length > 0 &&
    findings.every((l) => l.includes(KNOWN_ABSENT_IN_SIM))
  );
}

/**
 * Copy the repository files that `PROJECT_MAP.json` names, so that
 * `check:knowledge` behaves in a sim repo the way it does in the real one.
 *
 * `check-knowledge.mjs` treats any referenced path that is absent from disk as a
 * problem — it has no concept of "tracked" versus "present locally". The real
 * repository satisfies it partly with untracked local files, so a copy that only
 * carried the indexed roots would report dozens of phantom failures and Scenario
 * D would be measuring the copy, not the contract.
 *
 * The list is derived from `PROJECT_MAP.json` rather than hardcoded, using the
 * same shape test the validator itself applies, so the harness cannot drift out of
 * step with the validator the way a hand-written list would.
 */
function copyReferencedPaths(root) {
  const mapPath = join(root, '.uihub-agent', 'PROJECT_MAP.json');
  if (!existsSync(mapPath)) return;

  let map;
  try {
    map = JSON.parse(readFileSync(mapPath, 'utf8'));
  } catch {
    return;
  }

  // Same predicates as check-knowledge.mjs section 5.
  const TOP_LEVEL = /^(backend|mcp-server|frontend|cli|api|docs|component-specs|public)\//;
  const PATH_EXT = /\.(md|json|mjs|cjs|ts|tsx|js|jsx|ya?ml)$/;

  const wanted = new Set();
  const visit = (node) => {
    if (typeof node === 'string') {
      if (PATH_EXT.test(node) && !/\s/.test(node) && TOP_LEVEL.test(node) && !node.includes('*')) {
        wanted.add(node);
      }
      return;
    }
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node && typeof node === 'object') { Object.values(node).forEach(visit); }
  };
  visit(map);

  // Section 4 of check-knowledge.mjs resolves backtick-quoted repository paths
  // inside the required knowledge docs. Those docs are already copied, so the
  // paths they name are copied with them.
  for (const rel of docReferencedPaths(root)) wanted.add(rel);

  for (const rel of wanted) {
    if (NEVER_COPY.some((re) => re.test(rel))) continue;
    const src = join(REPO_ROOT, rel);
    if (!existsSync(src) || !statSync(src).isFile()) continue;
    const dest = join(root, rel);
    if (existsSync(dest)) continue;
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest);
  }
}

/**
 * Backtick-quoted repository paths named by the knowledge docs.
 *
 * Mirrors the `CANDIDATE` regex in `check-knowledge.mjs` section 4 so the copy
 * carries what the validator will look for. If that regex is ever widened, this
 * returns too few paths and Scenario D reports phantom missing-reference
 * failures — a visible, self-explaining failure rather than a silent one.
 */
function docReferencedPaths(root) {
  const CANDIDATE = /`((?:backend|mcp-server|frontend|cli|\.github|\.uihub-agent)\/[A-Za-z0-9_\-./]+\.[a-z]{1,4})(?::\d+)?`/g;
  const docsDir = join(root, '.uihub-agent');
  const out = new Set();

  const visitDoc = (abs) => {
    let text;
    try {
      text = readFileSync(abs, 'utf8');
    } catch {
      return;
    }
    for (const m of text.matchAll(CANDIDATE)) {
      const target = m[1];
      if (target.includes('*') || target.includes('<')) continue;
      out.add(target);
    }
  };

  const walkDocs = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = join(dir, ent.name);
      if (ent.isDirectory()) walkDocs(abs);
      else if (ent.name.endsWith('.md')) visitDoc(abs);
    }
  };

  walkDocs(docsDir);
  return out;
}

/**
 * Link the real repository's root `node_modules` into the copy.
 *
 * `scripts/lib/parse.mjs` does `createRequire(import.meta.url)` and
 * `require('typescript')`, so the copy needs a resolvable `typescript`. Without
 * it every command that re-parses TypeScript fails with
 * `Cannot find module 'typescript'` — which would look like a broken harness
 * rather than a missing dependency, and would mask the staleness behaviour under
 * test.
 *
 * A junction, not a copy: it keeps the fixture at ~19 MB instead of hundreds of
 * MB. The real tree is only ever read through it.
 */
function linkNodeModules(root) {
  const real = join(REPO_ROOT, 'node_modules');
  const link = join(root, 'node_modules');
  if (!existsSync(real) || existsSync(link)) return;
  mkdirSync(root, { recursive: true });
  try {
    spawnSync('cmd', ['/c', 'mklink', '/J', link, real], { encoding: 'utf8' });
  } catch { /* fall through to symlink */ }
  if (!existsSync(link)) {
    try { symlinkSync(real, link, 'junction'); } catch { /* parse will be unavailable */ }
  }
}

/**
 * Stage what `check-generated.mjs` needs and nothing else.
 *
 * That script is the one outlier in the freshness layer: it reads
 * `process.cwd()` rather than `import.meta.url`, shells out to `tsc`, and asks
 * git which dist files are tracked. So it needs a cwd-rooted tree, a
 * resolvable `tsc`, and a real `git ls-files` answer. `git init` plus
 * `git add` of the staged tree satisfies the third without copying the
 * repository's 19 MB of history.
 *
 * `node_modules` is a directory junction, not a copy: 128 MB stays out of the
 * fixture while `tsc` still resolves. A symlink is used where junctions are
 * unavailable; both are read-only targets, so neither can modify the real tree.
 */
function stageMcpBuild(root) {
  const dist = join(REPO_ROOT, 'mcp-server', 'dist');
  if (existsSync(dist)) {
    cpSync(dist, join(root, 'mcp-server', 'dist'), { recursive: true });
  }

  const realModules = join(REPO_ROOT, 'mcp-server', 'node_modules');
  const link = join(root, 'mcp-server', 'node_modules');
  mkdirSync(join(root, 'mcp-server'), { recursive: true });
  if (existsSync(realModules) && !existsSync(link)) {
    try {
      spawnSync('cmd', ['/c', 'mklink', '/J', link, realModules], { encoding: 'utf8' });
    } catch { /* fall through to symlink */ }
    if (!existsSync(link)) {
      try { symlinkSync(realModules, link, 'junction'); } catch { /* tsc will be unavailable */ }
    }
  }

  const gitInit = spawnSync('git', ['init', '-q'], { cwd: root, encoding: 'utf8' });
  if (gitInit.status === 0) {
    spawnSync('git', ['add', '-A', '-f', '--', 'mcp-server/dist'], { cwd: root, encoding: 'utf8' });
  }
}

/**
 * Convenience for scenarios that need one temp copy and unconditional cleanup.
 *
 * @param {string}   label
 * @param {(sim:object)=>any} body
 */
export function withSimRepo(label, body, opts = {}) {
  const sim = createSimRepo({ label, ...opts });
  try {
    return body(sim);
  } finally {
    sim.cleanup();
  }
}

/**
 * Assert a run produced a specific exit code, with both streams in the message.
 * Stale-state work lives and dies by exit code, so failures must show it.
 */
export function assertCode(result, expected, what) {
  if (result.code !== expected) {
    throw new Error(
      `${what}: expected exit ${expected}, got ${result.code}\n` +
      `--- stdout ---\n${result.stdout.slice(-1500)}\n--- stderr ---\n${result.stderr.slice(-1500)}`,
    );
  }
}
