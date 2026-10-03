/**
 * F5 — freshness cost regression.
 *
 * What is under test
 * ------------------
 * `freshness()` runs on every `agent:prepare`. It walks the whole source tree to
 * find files the manifest has never seen, and `discover()` used to sniff the
 * content of every file with a code extension while doing so. A Phase 10 dry run
 * measured that at ~500 content reads and ~8.9 MB to select a context of about
 * eleven files.
 *
 * The optimisation makes the walk metadata-only and applies the binary sniff only
 * to paths the manifest has never recorded. The invariant protected here is
 * therefore NOT "prepare got faster" — a millisecond budget would be flaky and
 * machine-specific. It is structural:
 *
 *   routine freshness does not read the content of files it has already recorded,
 *   and the files it does read are bounded by what actually changed rather than by
 *   the size of the repository.
 *
 * Both are asserted by counting real filesystem calls in a child process. The
 * counter has to live in a `--import` preload that patches `node:fs` and calls
 * `syncBuiltinESMExports()`, because `intel.mjs` uses ESM named imports whose
 * bindings are snapshotted when the module graph is linked. A plain
 * `fs.readFileSync = ...` assignment in the same process is silently ignored —
 * which is exactly how the first Phase 10 trace wrongly reported that the agent
 * read zero generated indexes.
 *
 * Cost
 * ----
 * Four child processes over a throwaway tree. Nothing is built, and the harness
 * junctions `node_modules`, so this is far cheaper than the staleness suite.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createSimRepo } from './helpers/sim-repo.mjs';

const NEW_TEXT = 'backend/src/services/f5Newcomer.js';
const NEW_BLOB = 'backend/src/services/f5Blob.ts';

/**
 * Counts content reads of first-party source files inside the measured child.
 *
 * `readFileSync` is counted directly rather than through `openSync`: Node's
 * internal implementation calls the exported `openSync`, so attributing reads to
 * `openSync` conflates two different operations.
 */
const PRELOAD = [
  "import fs from 'node:fs';",
  "import { syncBuiltinESMExports } from 'node:module';",
  'const source = new Set();',
  'const real = fs.readFileSync;',
  'fs.readFileSync = function (p, ...rest) {',
  "  if (typeof p === 'string') {",
  "    const n = p.replace(/\\\\/g, '/');",
  "    if (/\\/(src|scripts|tests)\\//.test(n) && !n.includes('/.uihub-agent/')) source.add(n);",
  '  }',
  '  return real.call(this, p, ...rest);',
  '};',
  'syncBuiltinESMExports();',
  "process.on('exit', () => fs.writeFileSync(process.env.F5_COUNT_OUT, JSON.stringify({",
  '  sourceContentReads: source.size,',
  '  paths: [...source].sort(),',
  '})));',
].join('\n');

/** Installs the counting preload and a freshness probe into the sim. */
function installProbe(sim) {
  const preload = join(sim.root, '.uihub-agent', 'f5-cost-preload.mjs');
  const probe = join(sim.root, '.uihub-agent', 'scripts', 'lib', 'f5-cost-probe.mjs');
  const counter = join(sim.root, '.uihub-agent', 'f5-count.json');
  writeFileSync(preload, PRELOAD);
  writeFileSync(probe,
    "import { freshness } from './intel.mjs';\n"
    + 'process.stdout.write(JSON.stringify(freshness()));');
  // `--import` needs a URL, not a path: on Windows an absolute path arrives as
  // the scheme `c:` and the ESM loader rejects it.
  return { preload: pathToFileURL(preload).href, probe, counter };
}

/** Runs `freshness()` under the counting preload and returns state plus reads. */
function measureFreshness(sim, installed) {
  const r = spawnSync(process.execPath, ['--import', installed.preload, installed.probe], {
    cwd: sim.root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 600000,
    env: { ...process.env, F5_COUNT_OUT: installed.counter },
  });
  assert.equal(r.status, 0, `freshness probe failed: ${r.stderr}`);
  return {
    freshness: JSON.parse(r.stdout),
    reads: JSON.parse(sim.read('.uihub-agent/f5-count.json')),
  };
}

test('F5: routine freshness reads no already-indexed file content', async (t) => {
  const sim = createSimRepo({ label: 'uihub-f5-cost-' });
  t.after(() => sim.cleanup());
  const installed = installProbe(sim);

  // The manifest must describe a tree big enough for the bound below to mean
  // something; a three-file fixture would pass a naive assertion for free.
  const indexed = sim.readJson('.uihub-agent/generated/INTELLIGENCE_MANIFEST.json').sourceSnapshot;
  assert.ok(indexed.length > 100,
    `expected a realistically sized tree, got ${indexed.length} indexed paths`);

  // 1. An unchanged tree must cost zero source content reads.
  const clean = measureFreshness(sim, installed);
  assert.equal(clean.freshness.state, 'FRESH',
    `the fixture must start fresh: ${JSON.stringify(clean.freshness)}`);
  assert.equal(clean.reads.sourceContentReads, 0,
    `freshness on an unchanged tree read ${clean.reads.sourceContentReads} source file(s): `
    + `${clean.reads.paths.slice(0, 5).join(', ')}`);

  // 2. The cost must not scale with the repository: hundreds of indexed files
  //    still cost zero reads when nothing changed.
  assert.ok(clean.reads.sourceContentReads < indexed.length,
    `content reads (${clean.reads.sourceContentReads}) must not scale with `
    + `indexed files (${indexed.length})`);

  // 3. One new source file costs exactly one content read — the new file — and is
  //    still reported. Detection is not weakened in order to save the read.
  sim.write(NEW_TEXT, 'export const f5 = 1;\n');
  const changed = measureFreshness(sim, installed);
  assert.equal(changed.freshness.state, 'STALE');
  assert.deepEqual(changed.freshness.added, [NEW_TEXT]);
  assert.equal(changed.reads.sourceContentReads, 1,
    `expected exactly the one new file to be sniffed, read ${changed.reads.sourceContentReads}: `
    + `${changed.reads.paths.join(', ')}`);

  // 4. A new file that is binary under a code extension is still not reported as
  //    added. This is the case that made the sniff look load-bearing.
  sim.write(NEW_BLOB, Buffer.from([0, 1, 2, 0, 3]));
  const withBlob = measureFreshness(sim, installed);
  assert.equal(withBlob.freshness.added.includes(NEW_BLOB), false,
    'a binary blob under a code extension must not be reported as an added source file');
  assert.equal(withBlob.freshness.state, 'STALE',
    'the genuinely new text file must still keep the tree stale');
  assert.equal(withBlob.reads.sourceContentReads, 2,
    `only the two new paths should ever be sniffed, read ${withBlob.reads.sourceContentReads}`);
});

test('F5: the generator still refuses to index binary blobs', async (t) => {
  const sim = createSimRepo({ label: 'uihub-f5-binary-' });
  t.after(() => sim.cleanup());

  sim.write(NEW_BLOB, Buffer.from([0, 1, 2, 0, 3]));
  sim.write('backend/src/services/f5Text.ts', 'export const fine = 1;\n');
  assert.equal(sim.run('generate-index.mjs').code, 0, 'agent:index must succeed');

  const snapshot = sim.readJson('.uihub-agent/generated/INTELLIGENCE_MANIFEST.json').sourceSnapshot
    .map((e) => e.path);
  assert.equal(snapshot.includes(NEW_BLOB), false,
    'the index must never contain a binary blob under a code extension');
  assert.equal(snapshot.includes('backend/src/services/f5Text.ts'), true,
    'the index must contain the ordinary new source file');
});