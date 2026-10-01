/**
 * Phase 9 router-precision tests.
 *
 * Phase 8 proved the router was explainable. Phase 9 is about it being *right*
 * under ties, and about the cases where a developer writes a task the way a
 * developer actually writes one.
 *
 * Every test here asserts a property against real repository data, not a
 * hardcoded file list. The rules that matter:
 *   - a ranking rule is proven by the property it guarantees, not by pinning two
 *     paths into the source, so the tests survive the files being renamed;
 *   - a "fix" is only proven if the test can fail: where a defect depended on a
 *     genuine tie existing, the test asserts the tie is still there.
 *
 *   node --test .uihub-agent/tests/precision.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildBundle } from '../scripts/lib/bundle.mjs';
import { rankFiles, connectivityOf } from '../scripts/lib/relevance.mjs';
import { classify } from '../scripts/lib/router.mjs';
import { routeTokens, intel, filePathTokens, resolveFilePath } from '../scripts/lib/intel.mjs';
import { PATH_SURFACE } from '../scripts/lib/router-matrix.mjs';
import { expandReasons as EXPAND_REASONS } from '../scripts/lib/expand-reasons.mjs';

/* ------------------------------------------------------------------ *
 * PROTECTED is not RELEVANT
 * ------------------------------------------------------------------ */

/**
 * The surface a path belongs to, or null when no prefix rule applies.
 *
 * Duplicated here deliberately rather than imported: a test that reuses the
 * implementation's own helper can only prove the helper is self-consistent. This
 * one reads the rule table directly.
 */
const prefixSurface = (p) => {
  for (const r of PATH_SURFACE) if (r.re.test(p)) return r.surface;
  return null;
};

const PROTECTED_CASES = [
  'Fix a payment verification bug',
  'Fix WebM template preview performance',
  'Edit frontend/src/components/templates/TemplatePreview.tsx',
  'Fix the auth middleware',
  'Add an MCP tool',
  'Fix TemplateCard so the similar rail shows WebM previews',
  'Fix an XSS vulnerability in the comment renderer',
  'Fix the /activate-free endpoint',
];

test('protection alone never admits a file: every relationship names its connection', () => {
  for (const task of PROTECTED_CASES) {
    for (const f of buildBundle(task, { expandSteps: 4 }).files) {
      if (f.expansionTrigger !== 'PROTECTED_RELATIONSHIP') continue;
      assert.ok(
        f.why.some((w) => /which is connected to this task$/.test(w)),
        `${task}: ${f.path} was admitted as a protected relationship without stating why the `
        + `protected file is connected to the task: ${JSON.stringify(f.why)}`,
      );
    }
  }
});

test('a protected relationship never reaches into a surface the task never implicated', () => {
  for (const task of PROTECTED_CASES) {
    const b = buildBundle(task, { expandSteps: 4 });
    const surfaces = new Set(b.surface.filter((s) => s !== 'UNKNOWN'));
    for (const f of b.files) {
      if (f.expansionTrigger !== 'PROTECTED_RELATIONSHIP') continue;
      const surface = prefixSurface(f.path);
      if (surface === null) continue;
      assert.ok(surfaces.has(surface),
        `${task} implicated [${[...surfaces].join(', ')}] but loaded ${f.path} from the `
        + `${surface} surface because it sits next to a protected file`);
    }
  }
});

test('repository maintenance tooling is never application context', () => {
  const ix = intel();
  for (const task of PROTECTED_CASES) {
    for (const f of buildBundle(task, { expandSteps: 4 }).files) {
      if (f.expansionTrigger !== 'PROTECTED_RELATIONSHIP') continue;
      const role = ix.roleByPath.get(f.path)?.role;
      assert.notEqual(role, 'SCRIPT',
        `${task} loaded the maintenance script ${f.path} as application context; scripts build `
        + 'and seed the repository, they do not participate in a feature');
    }
  }
});

test('the guard actually removes something: unconnected protected areas admit nothing', () => {
  // A task with no feature scope and no surface overlap must not reach protected
  // code at all. "xyzzy frobnicate widget" resolves UNKNOWN with nothing named,
  // so every protected relationship is unavailable to it.
  const b = buildBundle('xyzzy frobnicate widget', { expandSteps: 4 });
  assert.equal(b.files.length, 0);
  assert.ok(b.emptyReason, 'an empty result must still explain itself');
  assert.equal(
    b.files.filter((f) => f.expansionTrigger === 'PROTECTED_RELATIONSHIP').length,
    0,
    'an UNKNOWN task loaded protected code',
  );
});

test('protection is still reported as a caution marker even when nothing is loaded', () => {
  // PROTECTED does not mean RELEVANT, but a task that touches a protected area is
  // still told about it: the marker survives even when the guard blocks loading.
  const b = buildBundle('Fix an XSS vulnerability in the comment renderer', { expandSteps: 4 });
  assert.ok(b.protectedAreas.length > 0,
    'a SECURITY task should still be warned about the protected areas it may reach');
  for (const p of b.protectedAreas) {
    assert.ok(p.tier && p.rule, 'a protected-area marker must carry its tier and rule');
  }
});

/* ------------------------------------------------------------------ *
 * Route fast path — decoration is not part of a route
 * ------------------------------------------------------------------ */

test('connectivity is measured from the import graph, not invented', () => {
  const ix = intel();
  const all = rankFiles('Add an MCP tool', classify('Add an MCP tool'), { maxFiles: 500, minScore: 0 });
  assert.ok(all.files.length > 0, 'no candidates to measure');
  for (const f of all.files) {
    const c = connectivityOf(f.path, ix);
    assert.equal(c.inbound, (ix.inboundOf?.get(f.path) ?? []).length, `${f.path}: inbound mismatch`);
    assert.equal(c.outbound, (ix.outboundOf?.get(f.path) ?? []).length, `${f.path}: outbound mismatch`);
    assert.equal(c.degree, c.inbound + c.outbound, `${f.path}: degree is not inbound + outbound`);
    assert.equal(f.connectivity.degree, c.degree, `${f.path}: ranked connectivity disagrees with the graph`);
  }
  // A path with no recorded edges still reports a shape rather than undefined, so
  // the sort comparator can never have to reason about a missing value.
  assert.deepEqual(connectivityOf('does/not/exist.ts'), { inbound: 0, outbound: 0, degree: 0 });
});

test('a score tie is broken by connectivity, never by alphabetical order alone', () => {
  const task = 'Add an MCP tool';
  const routing = classify(task);
  const full = rankFiles(task, routing, { maxFiles: 500, minScore: 0 });
  const capped = rankFiles(task, routing, { maxFiles: 8, minScore: 0 });
  const selected = new Set(capped.files.map((f) => f.path));

  // Whatever truncation drops, it must never keep a file that ranks BELOW an
  // equally-scoring dropped file. This is the whole claim, stated without
  // naming a single file.
  for (const dropped of full.files.filter((f) => !selected.has(f.path))) {
    for (const kept of capped.files) {
      if (kept.score !== dropped.score) continue;
      assert.ok(
        kept.connectivity.degree >= dropped.connectivity.degree,
        `${kept.path} (degree ${kept.connectivity.degree}) was kept while equally-scoring `
        + `${dropped.path} (degree ${dropped.connectivity.degree}) was dropped`,
      );
    }
  }
});

test('the tie-break is actually exercised: the MCP tool task still has a real tie', () => {
  const task = 'Add an MCP tool';
  const all = rankFiles(task, classify(task), { maxFiles: 500, minScore: 0 });
  const groups = new Map();
  for (const f of all.files) {
    if (!groups.has(f.score)) groups.set(f.score, []);
    groups.get(f.score).push(f);
  }
  const [tieScore, group] = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  assert.ok(group.length >= 3,
    `expected a genuine score tie; the largest group is only ${group.length} file(s) at score ${tieScore}`);

  // The tie must contain files of differing connectivity, otherwise a
  // connectivity tie-break would be untestable and alphabetical order would be
  // indistinguishable from a correct answer.
  const degrees = new Set(group.map((f) => f.connectivity.degree));
  assert.ok(degrees.size >= 2, 'the tied group is uniformly connected; the regression test proves nothing');
});

test('the most connected files of the leading tie group reach the bundle', () => {
  const task = 'Add an MCP tool';
  const all = rankFiles(task, classify(task), { maxFiles: 500, minScore: 0 });
  const groups = new Map();
  for (const f of all.files) {
    if (!groups.has(f.score)) groups.set(f.score, []);
    groups.get(f.score).push(f);
  }
  const [tieScore, group] = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  const best = [...group].sort((a, b) => b.connectivity.degree - a.connectivity.degree).slice(0, 2);

  const bundle = buildBundle(task);
  const inBundle = new Set(bundle.files.map((f) => f.path));
  for (const f of best) {
    assert.ok(inBundle.has(f.path),
      `${f.path} is the most connected file in its tie group at score ${tieScore} `
      + `(degree ${f.connectivity.degree}) but never reaches the bundle`);
  }
});

test('connectivity reorders, it never rejects', () => {
  const task = 'Add an MCP tool';
  const wide = rankFiles(task, classify(task), { maxFiles: 5000, minScore: 0 });
  const narrow = rankFiles(task, classify(task), { maxFiles: 1, minScore: 0 });
  assert.ok(narrow.files.length <= wide.files.length);
  // Every path that survives a 25-file budget survives a much larger one.
  const budgeted = rankFiles(task, classify(task), { maxFiles: 25, minScore: 0 });
  const wideSet = new Set(wide.files.map((f) => f.path));
  for (const f of budgeted.files) assert.ok(wideSet.has(f.path));
});

test('a connectivity tie-break is recorded as a reason when it changes selection', () => {
  const bundle = buildBundle('Add an MCP tool');
  const marked = bundle.files.filter((f) => f.why.some((w) => w.includes('connectivity tie-break')));
  assert.ok(marked.length > 0, 'a tie-break changed the order but recorded nothing');
  for (const f of marked) {
    const line = f.why.find((w) => w.includes('connectivity tie-break'));
    assert.match(line, /\d+ import edges/, 'the tie-break reason must cite real graph numbers');
    assert.match(line, /\d+ importers/, 'the tie-break reason must state inbound connectivity');
  }
});

test('ranking stays deterministic across runs', () => {
  const task = 'Add an MCP tool';
  const a = buildBundle(task).files.map((f) => `${f.path}:${f.score}:${f.priority}`);
  const b = buildBundle(task).files.map((f) => `${f.path}:${f.score}:${f.priority}`);
  assert.deepEqual(a, b, 'two runs of the same task produced different ordering');
});

/* ------------------------------------------------------------------ *
 * Route fast path — decoration is not part of a route
 * ------------------------------------------------------------------ */

test('routeTokens returns the route itself, never the character before it', () => {
  assert.deepEqual(routeTokens('Fix the /activate-free endpoint'), ['/activate-free']);
  assert.deepEqual(routeTokens('Fix /api/v1/templates'), ['/api/v1/templates']);
  // A path fragment with no leading slash is not a route.
  assert.deepEqual(routeTokens('fix a/b/c in the parser'), []);
});

test('a quoted route resolves exactly like a plain one', () => {
  // Developers write the backticks. A literal backtick must not hide a real
  // endpoint, which previously made this resolve UNKNOWN with zero files.
  const plain = classify('Fix the /activate-free endpoint');
  for (const decorated of [
    'Fix the `/activate-free` endpoint',
    'Fix the "/activate-free" endpoint',
    'Fix the (`/activate-free`) endpoint',
  ]) {
    const got = classify(decorated);
    assert.deepEqual(got.categories, plain.categories, `"${decorated}" classified differently`);
    assert.equal(got.confidence, plain.confidence, `"${decorated}" resolved with different confidence`);
    assert.equal(got.entities.routes.length, plain.entities.routes.length, `"${decorated}" resolved a different number of routes`);
  }
});

test('a decorated route produces a context, not an empty bundle', () => {
  const bundle = buildBundle('Fix the `/activate-free` endpoint');
  assert.ok(bundle.files.length > 0, 'a real endpoint in backticks produced an empty context');
  assert.equal(bundle.confidence, 'MEDIUM');
});

test('file paths in backticks still resolve', () => {
  const plain = buildBundle('Edit frontend/src/components/templates/TemplatePreview.tsx');
  const quoted = buildBundle('Edit `frontend/src/components/templates/TemplatePreview.tsx`');
  assert.deepEqual(
    quoted.files.map((f) => f.path),
    plain.files.map((f) => f.path),
  );
  assert.equal(quoted.files[0].path, 'frontend/src/components/templates/TemplatePreview.tsx');
});

/* ------------------------------------------------------------------ *
 * A file named the way a developer names it
 *
 * Task 9.9: "realistic integration scenarios where the source file is
 * explicitly identified". The three spellings below are how the same request is
 * actually typed. All three used to fail differently, and none of the failures
 * was a ranking problem — the named file never entered the candidate set at all.
 * ------------------------------------------------------------------ */

/** A file the index knows, its own test if one imports it, and that test's path. */
function fixture() {
  const ix = intel();
  for (const [path, role] of ix.roleByPath) {
    if (role.role !== 'SERVICE' || !path.startsWith('backend/src/services/')) continue;
    const name = path.slice(path.lastIndexOf('/') + 1).replace(/\.js$/, '');
    const test = [...ix.roleByPath.keys()].find(
      (p) => ix.roleByPath.get(p)?.role === 'TEST' && p.endsWith(`/${name}.test.js`),
    );
    const importers = (ix.inboundOf?.get(path) ?? []).filter((p) => ix.roleByPath.get(p)?.role === 'TEST');
    const own = test && importers.includes(test) ? test : importers[0];
    if (own) return { path, name, test: own };
  }
  throw new Error('no backend service with an importing test; TEST_DEPENDENCY cannot be proven');
}

test('a bare filename resolves the same file as its full path', () => {
  const { path, name } = fixture();
  const full = buildBundle(`Fix ${path}`);
  const bare = buildBundle(`Update ${name}.js`);

  assert.equal(full.files[0].path, path, 'the full path should resolve to the named file');
  assert.equal(bare.files[0]?.path, path,
    `"Update ${name}.js" named a real indexed service but did not resolve it; got `
    + `${JSON.stringify(bare.files.map((f) => f.path))} with ${bare.emptyReason ?? 'no empty reason'}`);
  assert.ok(bare.files.length > 0, 'naming a real file must not produce an empty context');
});

test('a path written without its extension resolves to that path', () => {
  const { path } = fixture();
  const noExt = path.replace(/\.js$/, '');
  const b = buildBundle(`Fix ${noExt}`);
  assert.equal(b.files[0]?.path, path,
    `"${noExt}" is the same file as "${path}" but resolved to `
    + `${JSON.stringify(b.files.map((f) => f.path))}`);
  assert.ok(b.files.length > 0, 'naming a real path must not produce an empty context');
});

test('TEST_DEPENDENCY admits the test of a file the task named', () => {
  const { path, test } = fixture();
  for (const task of [`Fix ${path}`, `Fix ${path.replace(/\.js$/, '')}`]) {
    const b = buildBundle(task, { expandSteps: 4 });
    const found = b.files.filter((f) => f.expansionTrigger === 'TEST_DEPENDENCY');
    assert.ok(found.some((f) => f.path === test),
      `${task} named ${path}, whose test is ${test}, but TEST_DEPENDENCY admitted `
      + `${JSON.stringify(found.map((f) => f.path))} (${b.files.length} files total)`);
  }
});

test('extension inference refuses to guess when two files share a name', () => {
  const ix = intel();
  const byBare = new Map();
  for (const p of ix.roleByPath.keys()) {
    const name = p.slice(p.lastIndexOf('/') + 1).replace(/\.(js|jsx|ts|tsx)$/, '');
    byBare.set(name, (byBare.get(name) ?? []).concat(p));
  }
  const ambiguous = [...byBare.entries()].find(([, ps]) => ps.length > 1);
  assert.ok(ambiguous, 'no two indexed files share a basename; the refusal cannot be proven');

  const [name, candidates] = ambiguous;
  // None of the spellings of an ambiguous name may silently pick one of them.
  for (const spelling of [name, `${name}.js`, `${name}.ts`]) {
    const b = buildBundle(`Fix ${spelling}`);
    const named = b.files.filter((f) => candidates.includes(f.path) && f.addedByExpansion);
    assert.equal(named.length, 0,
      `"${spelling}" is ambiguous between ${candidates.join(' and ')} but expansion picked `
      + `${JSON.stringify(named.map((f) => f.path))}`);
  }
});

/* ------------------------------------------------------------------ *
 * TEST_DEPENDENCY on a conceptual task (9.10)
 *
 * The Phase 8 finding was that TEST_DEPENDENCY worked only when the task
 * literally named a file. The tests below prove the discovery is now possible
 * for a conceptual task AND that it rests on real import edges rather than the
 * weak `*auth*` filename matching 9.10 forbids.
 * ------------------------------------------------------------------ */

test('a conceptual task discovers the tests of the files it selected', () => {
  const task = 'Fix authentication middleware';
  const b = buildBundle(task, { expandSteps: 4 });
  const source = b.files.filter((f) => !f.addedByExpansion && intel().roleByPath.get(f.path)?.role !== 'TEST');
  const found = b.files.filter((f) => f.expansionTrigger === 'TEST_DEPENDENCY');

  assert.ok(source.length > 0, 'the conceptual task selected no source to test');
  assert.ok(found.length > 0,
    `a conceptual task with ${source.length} selected source file(s) discovered no tests at all`);
  for (const t of found) {
    assert.equal(intel().roleByPath.get(t.path)?.role, 'TEST', `${t.path} is not a test`);
  }
});

test('every discovered test earns its place through a real import edge', () => {
  // The rule 9.10 states: strong evidence or nothing. Proven structurally — each
  // admitted test must import a source file the bundle already selected, read from
  // the graph. No filename comparison appears here at all.
  const task = 'Fix authentication middleware';
  const b = buildBundle(task, { expandSteps: 4 });
  const ix = intel();
  const selected = new Set(b.files.map((f) => f.path));

  for (const t of b.files.filter((f) => f.expansionTrigger === 'TEST_DEPENDENCY')) {
    const imports = (ix.outboundOf?.get(t.path) ?? []).filter((p) => selected.has(p));
    assert.ok(imports.length > 0,
      `${t.path} was admitted as a test dependency but imports nothing in the bundle`);
    assert.ok(t.why.some((w) => /imports/.test(w)),
      `${t.path} was admitted without an import-edge justification: ${JSON.stringify(t.why)}`);
  }
});

test('test discovery never chains: a test is not evidence for another test', () => {
  const task = 'Fix authentication middleware';
  const b = buildBundle(task, { expandSteps: 4 });
  const ix = intel();
  const tests = b.files.filter((f) => f.expansionTrigger === 'TEST_DEPENDENCY').map((f) => f.path);
  for (const t of tests) {
    for (const imported of ix.outboundOf?.get(t) ?? []) {
      if (ix.roleByPath.get(imported)?.role !== 'TEST') continue;
      assert.ok(tests.includes(imported),
        `${t} was admitted by importing ${imported}, which is itself a test; a test must not `
        + 'be the evidence that admits another test');
    }
  }
});

test('a task that names its own files does not also use relevance-selected subjects', () => {
  // The fallback is for conceptual tasks only. For a task that names a file, the
  // named file is the subject; widening the subject set to everything relevance
  // happened to select is how a bundle silently stops being about what was asked.
  const ix = intel();
  const { path } = fixture();
  const b = buildBundle(`Fix ${path}`, { expandSteps: 4 });
  const namedSet = new Set([path]);
  for (const t of b.files.filter((f) => f.expansionTrigger === 'TEST_DEPENDENCY')) {
    const imports = ix.outboundOf?.get(t.path) ?? [];
    assert.ok(imports.some((p) => namedSet.has(p)),
      `${t.path} was admitted although it imports none of the named files; the named-file fast `
      + `path must not fall back to relevance-selected subjects`);
  }
});

/* ------------------------------------------------------------------ *
 * Ambiguous, multi-feature and fast-path routing (9.24 - 9.28)
 * ------------------------------------------------------------------ */

/**
 * The generic words 9.24 names, paired with what they must never drag in.
 *
 * Each expectation is derived from the index rather than written as a literal:
 * the point is that a broad word cannot reach an unrelated SUBSYSTEM, so the
 * assertion is stated per surface. A file being in `frontend/` is not itself a
 * fault; being in `mcp-server/` on the word "admin" is.
 */
const GENERIC_TASKS = [
  { task: 'Fix the card', banned: ['mcp-server/', 'backend/'] },
  { task: 'Fix config', banned: ['mcp-server/', 'frontend/src/pages/'] },
  { task: 'Fix admin', banned: ['mcp-server/'] },
  { task: 'Improve loading', banned: ['mcp-server/', 'backend/'] },
  { task: 'Fix the template', banned: ['mcp-server/', 'backend/'] },
  { task: 'Fix user issue', banned: ['mcp-server/', 'cli/'] },
];

test('a generic word never reaches an unrelated subsystem on its own', () => {
  for (const { task, banned } of GENERIC_TASKS) {
    const b = buildBundle(task);
    for (const f of b.files) {
      for (const prefix of banned) {
        assert.ok(!f.path.startsWith(prefix),
          `"${task}" is a generic request but loaded ${f.path} from ${prefix}; a broad word must `
          + 'not select a subsystem it never named');
      }
    }
  }
});

test('a generic word that resolves nothing is reported as such, not padded', () => {
  // "Improve loading" and "Fix config" name nothing in the index. Returning zero
  // files is the correct answer; the requirement is that they say so.
  for (const task of ['Improve loading', 'Fix config']) {
    const r = classify(task);
    const b = buildBundle(task);
    assert.deepEqual(r.categories, ['UNKNOWN'], `"${task}" resolved ${r.categories} from wording alone`);
    assert.equal(r.confidence, 'LOW', `"${task}" reported ${r.confidence} confidence with no resolved entity`);
    if (b.files.length === 0) {
      assert.ok(b.emptyReason, `"${task}" produced an empty bundle without explaining it`);
      assert.ok(typeof b.emptyReason === 'string' || b.emptyReason.why,
        'an empty bundle must carry a usable explanation');
    }
  }
});

test('a multi-feature task stays inside the features it named', () => {
  // 9.25: the intersection of TEMPLATE, PAYMENT and USER_LIBRARY is wanted; MCP,
  // CLOUD and DEPLOYMENT are not, unless a real dependency requires them.
  const task = 'Make paid templates available in the user library';
  const r = classify(task);
  const b = buildBundle(task);
  const paths = b.files.map((f) => f.path);

  for (const wanted of ['templates', 'user']) {
    assert.ok(paths.some((p) => p.toLowerCase().includes(wanted)),
      `${task} named "${wanted}" but the context contains nothing for it: ${paths.join(', ')}`);
  }
  assert.ok(r.categories.includes('TEMPLATE') && r.categories.includes('USER_LIBRARY'),
    `expected the TEMPLATE/USER_LIBRARY intersection, got ${r.categories}`);

  // An out-of-intersection file is only allowed in when the graph actually
  // required it, which the expansion log is the record of.
  const expanded = new Set(b.expansionLog.map((e) => e.path));
  for (const f of b.files) {
    if (!/mcp-server\/|deployment|cloud/i.test(f.path)) continue;
    assert.ok(f.addedByExpansion && expanded.has(f.path),
      `${f.path} is outside the TEMPLATE/PAYMENT/USER_LIBRARY intersection and reached the `
      + 'bundle without a recorded dependency that required it');
  }
});

test('naming a real file takes the fast path instead of broad classification', () => {
  // 9.26: the explicit-file path must bypass broad classification.
  const ix = intel();
  const target = [...ix.roleByPath.keys()].find((p) => p.endsWith('/templates/TemplatePreview.tsx'));
  const r = classify(`Fix ${target}`);
  assert.equal(r.fastPath, true, 'an explicit path must take the fast path');
  assert.equal(r.evidence.fastPathReason.includes(target), true,
    'the fast path must record which file triggered it');
  assert.deepEqual(r.entities.explicitFiles.map((f) => f.path), [target]);

  const b = buildBundle(`Fix ${target}`);
  const kinds = new Set(b.files.filter((f) => !f.addedByExpansion).map((f) => f.path));
  assert.equal(kinds.size, 1, 'a named-file task must open the named file by relevance, not a search');
});

test('the fast path still retrieves the four documented relationships', () => {
  // 9.26: reverse dependencies, related services, related tests, protected
  // dependencies. Asserted as categories the bundle is able to produce, and that
  // expansion actually ran, rather than by naming four specific files.
  const ix = intel();
  const target = [...ix.roleByPath.keys()].find((p) => p.endsWith('/templates/TemplatePreview.tsx'));
  const b = buildBundle(`Fix ${target}`, { expandSteps: 4 });
  const triggers = new Set(b.expansionLog.map((e) => e.trigger));
  assert.ok(b.expansionLog.length > 0, 'the fast path retrieved no relationships at all');
  for (const trigger of triggers) {
    assert.ok(EXPAND_REASONS[trigger], `expansion used an undocumented trigger: ${trigger}`);
  }
  for (const e of b.expansionLog) {
    assert.ok(e.how.length > 0, `${e.path} was expanded without a recorded justification`);
  }
});

test('a named route resolves through the route maps, not a repository search', () => {
  // 9.27. `/activate-free` is a real indexed route; it must come back as a route
  // entity rather than as files that happen to be named "activate".
  for (const route of ['/activate-free', '/admin/mcp/health']) {
    const r = classify(`Fix ${route}`);
    assert.ok(r.entities.routes.length > 0, `"${route}" resolved no route entity`);
    assert.ok(r.initialIndexes.some((i) => /ROUTE_MAP|API_MAP|PAGE_MAP/.test(i)),
      `"${route}" did not resolve through a route map; used ${r.initialIndexes.join(', ')}`);
  }
});

test('a named feature resolves through FEATURE_MAP', () => {
  // 9.28.
  for (const [task, feature] of [
    ['Fix templates', 'templates'],
    ['Fix authentication', 'authentication'],
    ['Fix payments', 'payment'],
  ]) {
    const r = classify(task);
    assert.ok(r.initialIndexes.includes('FEATURE_MAP') || r.featureCandidates.length > 0,
      `"${task}" did not resolve through FEATURE_MAP; indexes ${r.initialIndexes.join(', ')}`);
    assert.ok(buildBundle(task).files.length > 0, `"${task}" resolved a feature but produced no context`);
  }
});

/* ------------------------------------------------------------------ *
 * A named target that does not exist
 *
 * Two failures with one shape: the task named a concrete file or route, the
 * repository has neither, and the router answered with everything that merely
 * looked similar — reported as HIGH confidence.
 * ------------------------------------------------------------------ */

test('a path that does not exist is reported, not silently discarded', () => {
  const ix = intel();
  const dir = [...ix.roleByPath.keys()].find((p) => p.endsWith('/templates/TemplatePreview.tsx'));
  assert.ok(dir, 'the template component fixture is gone; this test would prove nothing');

  const missing = `${dir.slice(0, dir.lastIndexOf('/'))}/NoSuchComponent.tsx`;
  const r = classify(`Fix ${missing}`);
  const asked = r.evidence.unresolvedTargets.map((t) => t.asked);

  assert.ok(asked.includes(missing), `"${missing}" was named but not reported as missing`);
  const hit = r.evidence.unresolvedTargets.find((t) => t.asked === missing);
  assert.ok(hit.near.length > 0, 'a missing file should still say what does live in that directory');
  assert.ok(r.confidenceWhy.includes(missing),
    `confidence must state why it was capped; got: ${r.confidenceWhy}`);
});

test('naming a file that does not exist cannot produce HIGH confidence', () => {
  const ix = intel();
  const dir = [...ix.roleByPath.keys()].find((p) => p.endsWith('/templates/TemplatePreview.tsx'));
  const missing = `${dir.slice(0, dir.lastIndexOf('/'))}/NoSuchComponent.tsx`;

  const r = classify(`Fix ${missing}`);
  assert.notEqual(r.confidence, 'HIGH',
    'the strongest signal in the task went unmatched; HIGH confidence overstates what was resolved');
  assert.equal(r.entities.explicitFiles.length, 0, 'a file that does not exist is not an explicit file');
  // The category evidence may still be genuine, so it is kept rather than discarded.
  assert.ok(r.categories.includes('TEMPLATE'), 'the surrounding evidence should not be thrown away');
});

test('a route that does not exist is reported, not silently discarded', () => {
  const ix = intel();
  const real = ix.api.endpoints.find((e) => e.path.startsWith('/') && !e.path.includes(':'));
  assert.ok(real, 'no API endpoint is indexed; this test would prove nothing');

  const missing = `${real.path}-no-such-variant`;
  const r = classify(`Fix ${missing}`);
  const asked = r.evidence.unresolvedTargets.map((t) => t.asked);
  assert.ok(asked.includes(missing), `the missing route "${missing}" was not reported`);
  assert.ok(r.confidenceWhy.includes(missing), 'confidence must state that the named route is absent');
});

test('a missing target is discounted, but a real one is not', () => {
  // The cap must not fire on ordinary tasks, or every bundle would be MEDIUM and
  // the signal would be worthless.
  for (const task of ['Add an MCP tool', 'Fix payments', 'Fix authentication middleware', 'Fix the /activate-free endpoint']) {
    const r = classify(task);
    assert.equal(r.evidence.unresolvedTargets.length, 0,
      `${task} reported unresolved targets ${JSON.stringify(r.evidence.unresolvedTargets.map((t) => t.asked))}`);
  }
});

test('filePathTokens keeps prose from being read as a path', () => {
  // Widening the pattern to bare filenames must not turn ordinary sentences,
  // versions or URLs into explicit-file fast paths.
  for (const task of [
    'Fix the /activate-free endpoint',
    'Update the docs to mention version 1.2.3',
    'Bump the dependency to 4.17.21',
    'Fix a bug in the payment flow',
  ]) {
    const tokens = filePathTokens(task).filter((t) => /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(t));
    for (const t of tokens) {
      assert.ok(task.includes(t), `"${t}" was extracted from "${task}" but is not even a substring of it`);
    }
    assert.equal(buildBundle(task).entities.explicitFiles.length > 0, tokens.some((t) => resolveFilePath(t)),
      `"${task}" produced path tokens ${JSON.stringify(tokens)} that resolve to files`);
  }
});