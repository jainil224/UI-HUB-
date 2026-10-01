/**
 * Context bundle tests — agent.md tasks 8.55, 8.56.
 *
 * The properties asserted here are the ones that make a context bundle
 * trustworthy: every file explains itself, an empty result says why, protected
 * paths are never silently included, expansion only ever fires for a permitted
 * reason, and no bundle ever grows to "the whole repository".
 *
 *   node --test .uihub-agent/tests/context.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildBundle, validateBundle } from '../scripts/lib/bundle.mjs';
import { rankFiles, REASON_WEIGHTS } from '../scripts/lib/relevance.mjs';
import { classify } from '../scripts/lib/router.mjs';
import { expandReasons, reasonsForPath } from '../scripts/lib/expand-reasons.mjs';
import { intel } from '../scripts/lib/intel.mjs';
import { scanText } from '../scripts/secret-scan.mjs';
import { load } from '../scripts/query-index.mjs';
import { readFileSync } from 'node:fs';

const TASKS = [
  'Fix a payment verification bug',
  'Fix WebM template preview',
  'Edit frontend/src/components/templates/TemplatePreview.tsx',
  'Fix the auth middleware',
  'Add an MCP tool',
  'Write tests for the payment flow',
  'Why is the site loading slowly?',
  'Fix an XSS vulnerability in the comment renderer',
  'xyzzy frobnicate widget',
];

/* ------------------------------------------------------------------ *
 * 8.15 / 8.39 — the bundle contract
 * ------------------------------------------------------------------ */

test('every bundle validates against the generated schema', () => {
  for (const t of TASKS) {
    const v = validateBundle(buildBundle(t));
    assert.ok(v.ok, `bundle for "${t}" is invalid:\n  ${v.problems.join('\n  ')}`);
  }
});

test('the schema is generated, not hand-written, and describes what we emit', () => {
  const schema = load('generated/CONTEXT_BUNDLE_SCHEMA.json');
  const bundle = buildBundle(TASKS[0]);
  for (const prop of schema.properties) {
    assert.ok(prop.path in bundle, `schema declares "${prop.path}" but the bundle has no such key`);
  }
  assert.ok(schema.counts.features > 0, 'schema counts must be real numbers, not null');
  assert.ok(schema.counts.components > 0);
});

test('a bundle carries no file contents — only paths, names and reasons', () => {
  const bundle = buildBundle('Fix WebM template preview');
  const text = JSON.stringify(bundle);
  // A source file's own code would contain imports and JSX. None may appear.
  assert.ok(!/^\s*import\s/m.test(text), 'bundle appears to embed source code');
  assert.ok(!/<\/[A-Z][a-zA-Z]*>/.test(text), 'bundle appears to embed JSX');
  for (const f of bundle.files) {
    assert.equal(typeof f.path, 'string');
    assert.ok(Array.isArray(f.why));
    assert.equal(f.contents, undefined, 'a file entry must not carry contents');
  }
});

test('a bundle is deterministic apart from its timestamp', () => {
  const a = buildBundle('Fix a payment verification bug');
  const b = buildBundle('Fix a payment verification bug');
  delete a.generatedAt;
  delete b.generatedAt;
  assert.deepEqual(a, b, 'the same task and indexes must produce the same bundle');
});

/* ------------------------------------------------------------------ *
 * 8.10 / 8.47 — explainability and honesty
 * ------------------------------------------------------------------ */

test('every selected file has at least one reason', () => {
  for (const t of TASKS) {
    for (const f of buildBundle(t).files) {
      assert.ok(f.why.length > 0, `${f.path} in "${t}" has no reason`);
      for (const w of f.why) assert.ok(w.length > 0, 'an empty reason is not a reason');
    }
  }
});

test('an empty context explains itself instead of returning nothing', () => {
  const b = buildBundle('xyzzy frobnicate widget');
  assert.equal(b.files.length, 0);
  assert.ok(b.emptyReason, 'an empty bundle must carry emptyReason');
  assert.ok(b.emptyReason.why.length > 0);
  assert.ok(b.emptyReason.note.length > 0);
});

test('an emptyReason and a non-empty file list never coexist', () => {
  for (const t of TASKS) {
    const b = buildBundle(t);
    if (b.files.length > 0) {
      assert.equal(b.emptyReason, null, `"${t}" listed files but also claimed nothing matched`);
    }
  }
});

test('confidence is never dressed up as a probability', () => {
  for (const t of TASKS) {
    const b = buildBundle(t);
    assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(b.confidence));
    assert.ok(!/\d/.test(b.confidence), `confidence "${b.confidence}" contains a number`);
  }
});

/* ------------------------------------------------------------------ *
 * 8.13 / 8.43 — minimality and budget
 * ------------------------------------------------------------------ */

test('a context is a small fraction of the repository', () => {
  const maxFiles = 25;
  const perStep = 10;
  for (const t of TASKS) {
    const b = buildBundle(t);
    const ratio = b.efficiency.selectionRatio;
    assert.ok(ratio <= 0.25, `"${t}" selected ${(ratio * 100).toFixed(1)}% of the repository`);

    // The cap governs what relevance selected. Expansion is budgeted separately
    // ("+5-10 files at a time"), so the ceiling is the cap plus one step's worth
    // per expansion step the caller allowed.
    assert.ok(b.efficiency.initialFiles <= maxFiles,
      `"${t}" ranked ${b.efficiency.initialFiles} files, over the ${maxFiles} cap`);
    const ceiling = maxFiles + perStep * b.expansionSteps;
    assert.ok(b.files.length <= ceiling,
      `"${t}" reached ${b.files.length} files, over the ${ceiling} ceiling for ${b.expansionSteps} step(s)`);
  }
});

test('selection ratio is measured against the repository, not the candidate list', () => {
  const b = buildBundle('Fix a payment verification bug');
  const size = intel().filePaths.length;
  assert.equal(b.efficiency.totalIndexedFiles, size);
  assert.ok(b.efficiency.selectionRatio < 1);
});

test('naming a file explicitly returns that file first and stays small', () => {
  const b = buildBundle('Edit frontend/src/components/templates/TemplatePreview.tsx');
  assert.equal(b.files[0].path, 'frontend/src/components/templates/TemplatePreview.tsx');
  assert.ok(b.files.length <= 5, `explicit-path fast path returned ${b.files.length} files`);
});

/* ------------------------------------------------------------------ *
 * 8.12 — expansion
 * ------------------------------------------------------------------ */

test('expansion only ever fires for one of the seven permitted reasons', () => {
  const permitted = new Set(Object.keys(expandReasons));
  for (const t of TASKS) {
    for (const e of buildBundle(t).expansionLog) {
      assert.ok(permitted.has(e.trigger), `unpermitted expansion trigger: ${e.trigger}`);
      assert.ok(e.how.length > 0, `${e.path} was added without a recorded reason`);
      assert.ok(e.reason, `${e.path} has no human-readable trigger description`);
    }
  }
});

test('expansion can be disabled, and then nothing is added', () => {
  const on = buildBundle('Fix the CloudScroll animation', { expandSteps: 1 });
  const off = buildBundle('Fix the CloudScroll animation', { expandSteps: 0 });
  assert.ok(on.expansionCount > 0, 'the fixture must actually expand, or the test proves nothing');
  assert.equal(off.expansionCount, 0);
  assert.ok(off.stopReason.includes('disabled'));
});

test('expansion always reports why it stopped', () => {
  for (const t of TASKS) {
    const b = buildBundle(t);
    assert.ok(typeof b.stopReason === 'string' && b.stopReason.length > 10,
      `"${t}" stopped without a usable reason`);
  }
});

test('an expanded file is flagged as expanded and carries its trigger', () => {
  const b = buildBundle('Fix the CloudScroll animation', { expandSteps: 1 });
  for (const f of b.files.filter((x) => x.addedByExpansion)) {
    assert.ok(f.expansionTrigger, `${f.path} is marked expanded but has no trigger`);
    assert.ok(f.why.some((w) => w.length > 0));
  }
});

/*
 * Every one of the seven triggers must actually fire against real repository
 * data. Three of them were dead code until this test existed:
 *   - PROTECTED_RELATIONSHIP read `e.from` off `inboundOf`, which stores plain
 *     path strings, so the comparison was always `undefined === path`;
 *   - API_DEPENDENCY read `r.endpoint.handlers` off the public route entity,
 *     which does not carry `endpoint`;
 *   - SHARED_SERVICE is a strict subset of DIRECT_DEPENDENCY, so trigger-major
 *     iteration let DIRECT_DEPENDENCY claim every shared service first and it
 *     could never be the recorded trigger.
 * A trigger that can never fire is worse than no trigger, because 8.12 promises
 * it. Each case below is a real task against real indexed relationships.
 */
const TRIGGER_CASES = [
  ['DIRECT_DEPENDENCY', 'Fix a payment verification bug'],
  ['SHARED_SERVICE', 'Fix activity logging in backend/src/routes/userRoutes.js and backend/src/routes/favoritesRoutes.js'],
  ['RELEVANT_CONSUMER', 'Fix the theme toggle in frontend/src/App.tsx'],
  ['API_DEPENDENCY', 'Fix the /activate-free endpoint'],
  ['STATE_DEPENDENCY', 'Fix the theme toggle in frontend/src/App.tsx and frontend/src/components/ui/ScrollToTop.tsx'],
  ['PROTECTED_RELATIONSHIP', 'Fix a payment verification bug'],
  ['TEST_DEPENDENCY', 'Fix frontend/src/utils/apiConfig.ts'],
];

test('all seven permitted triggers fire against real repository data', () => {
  const fired = new Map();
  for (const [trigger, task] of TRIGGER_CASES) {
    const b = buildBundle(task, { expandSteps: 4 });
    const hit = b.expansionLog.find((e) => e.trigger === trigger);
    assert.ok(hit, `${trigger} never fired. Task: "${task}". Fired: ${[...new Set(b.expansionLog.map((e) => e.trigger))].join(', ') || 'nothing'}`);
    assert.ok(hit.how.length > 0, `${trigger} fired for ${hit.path} without a justification`);
    assert.ok(hit.reason && hit.reason.length > 0, `${trigger} has no human-readable description`);
    fired.set(trigger, hit);
  }
  assert.equal(fired.size, 7, 'expected all seven triggers to be reachable');
});

test('a test file is classified TEST by filename, not by its directory', () => {
  const ix = intel();
  // Lives under `utils/`, which PATH_RULES map to UTILITY. It is a test.
  assert.equal(ix.roleByPath.get('frontend/src/utils/apiConfig.test.ts')?.role, 'TEST');
});

/*
 * Phase 8 closure found that 16 of the repository's 18 real test files were
 * absent from the index entirely, because they live in sibling `tests/`
 * directories that SOURCE_ROOTS never walked into. Only the two tests that happen
 * to sit inside `frontend/src` were reachable, and purely by accident of location.
 *
 * The consequence was not cosmetic: with almost no test files indexed,
 * TEST_DEPENDENCY had almost nothing to admit, so the trigger the contract
 * promises was effectively dead outside `frontend/src`.
 */
test('all 18 real test files are indexed and classified TEST', () => {
  const ix = intel();
  const frm = JSON.parse(
    readFileSync(new URL('../codebase/FILE_ROLE_MAP.json', import.meta.url), 'utf8'),
  );
  const indexed = frm.files.filter((f) => f.role === 'TEST').map((f) => f.path);

  // Taken from the runner configs, not guessed:
  //   frontend/vitest.config.ts   src, recursive, .test.ts
  //   mcp-server/vitest.config.ts tests, recursive, .test.ts
  //   backend/package.json        node --test over tests, recursive, .test.js
  //   cli/package.json            tests/*.test.ts named explicitly
  const expected = [
    'backend/tests/accessService.test.js',
    'backend/tests/broadcastAuth.test.js',
    'backend/tests/collectionsService.test.js',
    'backend/tests/cors.test.js',
    'backend/tests/emailTestSecret.test.js',
    'backend/tests/health.test.js',
    'cli/tests/args.test.ts',
    'cli/tests/config.test.ts',
    'cli/tests/mcp.test.ts',
    'cli/tests/output.test.ts',
    'frontend/src/routing/vercelRouting.test.ts',
    'frontend/src/utils/apiConfig.test.ts',
    'mcp-server/tests/apiKey.test.ts',
    'mcp-server/tests/auth.test.ts',
    'mcp-server/tests/configService.test.ts',
    'mcp-server/tests/cors.test.ts',
    'mcp-server/tests/permissions.test.ts',
    'mcp-server/tests/tools.test.ts',
  ];

  assert.equal(expected.length, 18, 'the expected list itself drifted from the repository');
  assert.equal(indexed.length, expected.length,
    `expected ${expected.length} TEST files in FILE_ROLE_MAP, found ${indexed.length}`);
  for (const p of expected) {
    assert.ok(indexed.includes(p), `${p} is not indexed as TEST`);
    assert.ok(ix.roleByPath.has(p), `${p} is not loadable from the index`);
    assert.equal(ix.roleByPath.get(p)?.role, 'TEST', `${p} is not classified TEST`);
  }
});

test('a file merely CONTAINING the word test is not a test', () => {
  const ix = intel();
  // These three exist in the repository and all contain "test" in their name or
  // path. None of them is a test suite, and a substring rule would have
  // misclassified every one of them.
  assert.equal(ix.roleByPath.get('backend/src/scripts/sendAllTestEmails.js')?.role, 'SCRIPT');
  assert.equal(ix.roleByPath.get('backend/src/scripts/testEmailRequest.js')?.role, 'SCRIPT');
  assert.equal(ix.roleByPath.get('frontend/src/components/ui/testimonials-card.tsx')?.role, 'COMPONENT');
});

test('TEST_DEPENDENCY resolves in BOTH directions from real edges', () => {
  const ix = intel();
  const ig = JSON.parse(
    readFileSync(new URL('../generated/IMPORT_GRAPH.json', import.meta.url), 'utf8'),
  );
  const rd = JSON.parse(
    readFileSync(new URL('../generated/REVERSE_DEPENDENCY_MAP.json', import.meta.url), 'utf8'),
  ).reverse;

  // test -> what it covers, via the outbound edge
  const covered = ig.edges.filter(
    (e) => e.from === 'backend/tests/health.test.js' && e.resolution === 'internal',
  );
  assert.ok(
    covered.some((e) => e.to === 'backend/src/services/healthService.js'),
    'health.test.js has no internal edge to the service it tests',
  );

  // source -> the tests that cover it, via inboundOf
  const covering = rd['backend/src/services/healthService.js'].importers;
  assert.ok(
    covering.includes('backend/tests/health.test.js'),
    'healthService.js does not list the test that covers it',
  );

  // And the trigger is what actually admits it into a bundle.
  const b = buildBundle('Fix backend/src/services/healthService.js', { expandSteps: 1 });
  const hit = b.expansionLog.find((e) => e.path === 'backend/tests/health.test.js');
  assert.ok(hit, 'the covering test was not added to the bundle');
  assert.equal(hit.trigger, 'TEST_DEPENDENCY',
    'a test covering a named file should be recorded as TEST_DEPENDENCY');
});

test('TEST_DEPENDENCY is not used for unrelated tests', () => {
  // A test that imports nothing the task named must never be admitted by this
  // trigger. `broadcastAuth.test.js` imports middleware/auth.js, which this task
  // does not name.
  const b = buildBundle('Fix backend/src/services/accessService.js', { expandSteps: 1 });
  const byTestTrigger = b.expansionLog.filter((e) => e.trigger === 'TEST_DEPENDENCY');
  assert.ok(byTestTrigger.length > 0, 'TEST_DEPENDENCY fired nothing at all');
  for (const e of byTestTrigger) {
    const outboundOfTest = ix_outbound(e.path);
    assert.ok(
      outboundOfTest.some((t) => t.includes('accessService')),
      `${e.path} was admitted by TEST_DEPENDENCY but imports nothing accessService-related`,
    );
  }
});

function ix_outbound(p) {
  const ig = JSON.parse(
    readFileSync(new URL('../generated/IMPORT_GRAPH.json', import.meta.url), 'utf8'),
  );
  return ig.edges
    .filter((e) => e.from === p && e.resolution === 'internal')
    .map((e) => e.to);
}

test('a fixture route inside a test is not published as a real API endpoint', () => {
  // backend/tests/cors.test.js and mcp-server/tests/cors.test.ts each build a
  // throwaway express app with app.get('/probe'). Once tests were indexed, `app`
  // matched the router receiver pattern and `GET /probe` was published in
  // API_MAP as an endpoint owned by a TEST file.
  const api = JSON.parse(
    readFileSync(new URL('../codebase/API_MAP.json', import.meta.url), 'utf8'),
  );
  const probe = (api.endpoints ?? []).filter((e) => e.path === '/probe');
  assert.equal(probe.length, 0,
    'a /probe endpoint declared only inside a test fixture was published as real API surface');
});

test('the most specific trigger is the one recorded', () => {
  const b = buildBundle('Fix activity logging in backend/src/routes/userRoutes.js and backend/src/routes/favoritesRoutes.js', { expandSteps: 4 });
  const svc = b.expansionLog.find((e) => e.path === 'backend/src/services/activityLogService.js');
  assert.ok(svc, 'the shared service was not added at all');
  assert.equal(svc.trigger, 'SHARED_SERVICE',
    'a service imported by two named files is a SHARED_SERVICE, not a bare DIRECT_DEPENDENCY');
});

test('a trigger never justifies a path it does not actually relate to', () => {
  const ix = intel();
  const routing = classify('Fix a payment verification bug');
  const named = new Set((routing.entities.explicitFiles ?? []).map((f) => f.path));
  for (const trigger of Object.keys(expandReasons)) {
    for (const f of ['frontend/src/components/ui/button.tsx', 'cli/src/index.ts']) {
      const why = reasonsForPath(f, { routing, initial: { files: [] }, ix, trigger, named });
      if (why.length > 0) {
        assert.ok(why[0].includes(f), `${trigger} justified ${f} with a reason about something else`);
      }
    }
  }
});

/* ------------------------------------------------------------------ *
 * 8.52 — protected paths
 * ------------------------------------------------------------------ */

test('a protected path is reported with a tier, never as ordinary context', () => {
  const b = buildBundle('Fix a payment verification bug');
  assert.ok(b.protectedAreas.length > 0, 'a payment task must surface its protected paths');
  for (const p of b.protectedAreas) {
    assert.ok(['CRITICAL', 'HIGH_RISK', 'GENERATED'].includes(p.tier), `bogus tier: ${p.tier}`);
    assert.ok(p.path.length > 0);
  }
  const critical = b.protectedAreas.find((p) => p.tier === 'CRITICAL');
  assert.ok(critical, 'expected at least one CRITICAL path for a payment task');
});

test('a CRITICAL protected file is never silently ranked as ordinary context', () => {
  const b = buildBundle('Fix a payment verification bug');
  const critical = b.protectedAreas.filter((p) => p.tier === 'CRITICAL').map((p) => p.path);
  for (const f of b.files) {
    if (critical.includes(f.path)) {
      // It may appear, but only if the reason explains it and the bundle warns.
      assert.ok(f.why.length > 0);
      assert.ok(b.protectedAreas.some((p) => p.path === f.path));
    }
  }
});

/* ------------------------------------------------------------------ *
 * 8.21 / 8.51 — validation and safety
 * ------------------------------------------------------------------ */

test('the bundle names the indexes it queried (agent.md 8.14)', () => {
  for (const t of TASKS) {
    const b = buildBundle(t);
    if (b.categories.includes('UNKNOWN')) continue;
    assert.ok(Array.isArray(b.indexes), `"${t}" does not report which indexes were queried`);
    assert.ok(b.indexes.length > 0, `"${t}" queried nothing yet still returned files`);
  }
});

test('dependencies agree exactly with the expansion log (agent.md 8.14)', () => {
  for (const t of TASKS) {
    const b = buildBundle(t);
    assert.equal(b.dependencies.length, b.expansionLog.length,
      `"${t}" reports ${b.dependencies.length} dependencies but ${b.expansionLog.length} expansions`);
    b.dependencies.forEach((d, i) => {
      assert.equal(d.path, b.expansionLog[i].path);
      assert.equal(d.trigger, b.expansionLog[i].trigger);
    });
  }
});

test('a task that resolved no source file does not expand into the protected closure', () => {
  // No indexed entity contains "comment", so there is nothing to open. Before the
  // guard in PROTECTED_RELATIONSHIP this bundle returned 10 files — payment
  // routes, a payment controller — purely because unrelated protected config
  // depends on them. Each entry had a true justification and no relation to the
  // task, which is the failure mode 8.12 exists to prevent.
  const b = buildBundle('Fix an XSS vulnerability in the comment renderer');
  assert.equal(b.expansionCount, 0,
    `expanded ${b.expansionCount} file(s) for a task that named nothing: ${b.files.map((f) => f.path).join(', ')}`);
  assert.equal(b.files.length, 0);
  assert.ok(b.emptyReason, 'an empty result must explain itself');
  assert.ok(b.emptyReason.searchedTerms.length > 0, 'emptyReason must record what was searched for');
  // The genuinely useful output survives: which protected areas and knowledge apply.
  assert.ok(b.protectedAreas.length > 0, 'the XSS task should still surface its protected areas');
});

test('PROTECTED_RELATIONSHIP evidence states the direction of the import', () => {
  // `inboundOf(area)` is the set of files that IMPORT `area`. The justification
  // used to read "<path> is depended on by a protected file (<area>)", asserting
  // the reverse. No source file imports a test, so the sentence was false in
  // every bundle it appeared in — and expansion evidence is worthless if it is
  // merely true-sounding. Assert the direction against the import graph itself
  // rather than against a sample string.
  const ix = intel();
  let checked = 0;
  for (const t of TASKS) {
    const b = buildBundle(t, { expandSteps: 4 });
    for (const e of b.expansionLog) {
      if (e.trigger !== 'PROTECTED_RELATIONSHIP') continue;
      const m = /^(\S+) imports the protected file \((.+)\)$/.exec(e.how[0] || '');
      assert.ok(m,
        `PROTECTED_RELATIONSHIP for ${e.path} does not state the import direction: "${e.how[0]}"`);
      const [importer, area] = [m[1], m[2]];
      // The named importer really does import the named protected file...
      assert.ok((ix.outboundOf?.get(importer) ?? []).includes(area),
        `${importer} does not import ${area}, so the justification is wrong`);
      // ...and the protected file does NOT import the importer.
      assert.ok(!(ix.outboundOf?.get(area) ?? []).includes(importer),
        `${area} imports ${importer}; the "is depended on by" wording would be correct`);
      checked++;
    }
  }
  assert.ok(checked > 0, 'no PROTECTED_RELATIONSHIP evidence found to check');
});

test('every bundle lists the commands that must pass', () => {
  for (const t of TASKS) {
    const b = buildBundle(t);
    if (b.categories.includes('UNKNOWN')) continue;
    assert.ok(b.validation.length > 0, `"${t}" names no validation commands`);
  }
});

test('validation commands name the test suites that actually exist', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const scripts = JSON.stringify(pkg.scripts ?? {});
  for (const t of TASKS) {
    for (const v of buildBundle(t).validation) {
      assert.ok(v.length > 2, `validation command "${v}" is not actionable`);
      if (v.includes('tests')) assert.ok(scripts.includes('test'), `no test script exists to satisfy "${v}"`);
    }
  }
});

test('a bundle never carries a secret value', () => {
  const findings = scanText(JSON.stringify(buildBundle('Fix a payment verification bug')), 'bundle');
  assert.deepEqual(findings, [], `bundle tripped the secret scanner: ${JSON.stringify(findings)}`);
});

test('the secret scanner still catches a planted credential', () => {
  const findings = scanText('AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', 'test');
  assert.ok(findings.length > 0, 'the scanner must still fire on a real-looking key');
});

/* ------------------------------------------------------------------ *
 * 8.37 — ranking internals
 * ------------------------------------------------------------------ */

test('every reason kind carries a defined weight', () => {
  for (const kind of Object.keys(REASON_WEIGHTS)) {
    assert.equal(typeof REASON_WEIGHTS[kind], 'number');
    assert.ok(REASON_WEIGHTS[kind] > 0, `${kind} has a non-positive weight`);
  }
});

test('files are returned strongest first', () => {
  const r = rankFiles('Fix WebM template preview', classify('Fix WebM template preview'), { maxFiles: 10 });
  for (let i = 1; i < r.files.length; i += 1) {
    assert.ok(r.files[i - 1].score >= r.files[i].score, 'ranking is not monotonic');
  }
});

test('relevance never returns a file that is not indexed', () => {
  const ix = intel();
  for (const t of TASKS) {
    for (const f of buildBundle(t).files) {
      assert.ok(ix.roleByPath.has(f.path), `${f.path} is not an indexed file`);
    }
  }
});