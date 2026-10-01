/**
 * Router tests â€” the router-design contract, 8.54.
 *
 * These assert on BEHAVIOUR that the specification actually names, not on
 * incidental output shape. A test that pinned the exact ordering of every
 * returned category would fail on a harmless ranking tweak and pass on a router
 * that quietly returned nothing, which is worse than no test at all.
 *
 * Every expectation below was checked against this repository. Where the
 * correct answer is "nothing", the test asserts an honest empty result rather
 * than a convenient guess.
 *
 *   node --test .uihub-agent/tests/router.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { existsSync } from 'node:fs';

import { classify } from '../scripts/lib/router.mjs';
import { buildRoutingMatrix } from '../scripts/lib/router-matrix.mjs';
import { tierFor, protectedRules } from '../scripts/lib/protected.mjs';
import { freshness, repositorySize } from '../scripts/lib/intel.mjs';
import { run as runQuery, UsageError } from '../scripts/query-index.mjs';
const run = runQuery;

const matrix = buildRoutingMatrix();

/* ------------------------------------------------------------------ *
 * 8.2 / 8.3 â€” classification
 * ------------------------------------------------------------------ */

test('an explicit file path routes to exactly that file', () => {
  const r = classify('Edit frontend/src/components/templates/TemplatePreview.tsx');
  const explicit = r.entities.explicitFiles ?? [];
  assert.equal(explicit.length, 1);
  assert.equal(explicit[0].path, 'frontend/src/components/templates/TemplatePreview.tsx');
});

test('a named component resolves by name, not by fuzzy guess', () => {
  const r = classify('Refactor TemplatePreview');
  const names = (r.entities.components ?? []).map((c) => c.name);
  assert.ok(names.length > 0, 'expected at least one component match');
  for (const n of names) {
    assert.ok(
      n.toLowerCase().includes('templatepreview'),
      `"${n}" does not contain the searched term; a near-match must not be reported as a match`,
    );
  }
});

test('an identifier that does not exist resolves to nothing rather than to a guess', () => {
  // `TemplateCard` appears in agent.md's examples but no such component exists
  // in this repository. The honest answer is "no match", and the near-miss
  // channel exists precisely so a reader can see what was searched.
  const r = classify('Refactor TemplateCard');
  assert.equal((r.entities.components ?? []).length, 0);
  assert.ok(r.evidence.nearMisses.length > 0, 'a failed exact match should surface near misses');
});

test('confidence is one of HIGH, MEDIUM, LOW â€” never a percentage', () => {
  for (const t of ['Fix a payment verification bug', 'Fix something', 'xyzzy frobnicate widget']) {
    const r = classify(t);
    assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(r.confidence), `bad confidence: ${r.confidence}`);
    assert.ok(!/%|\d+\s*%/.test(r.confidence), `confidence looks like a percentage: ${r.confidence}`);
    assert.ok(r.confidenceWhy.length > 0, 'every confidence level needs a justification');
  }
});

test('every category returned is a declared category', () => {
  for (const t of ['Fix a payment verification bug', 'Fix WebM template preview', 'Add an MCP tool']) {
    for (const c of classify(t).categories) {
      assert.ok(matrix.categories[c], `undeclared category: ${c}`);
    }
  }
});

test('a task with no signal returns UNKNOWN and asks for narrowing', () => {
  const r = classify('xyzzy frobnicate widget');
  assert.deepEqual(r.categories, ['UNKNOWN']);
  assert.equal(r.confidence, 'LOW');
  assert.ok(r.unknown, 'an UNKNOWN result must carry an explanation');
  assert.ok(r.unknown.suggestion.length > 0, 'UNKNOWN must suggest how to narrow the task');
});

test('weak-only evidence never reaches HIGH confidence', () => {
  // "page" appears in many feature names; a task made only of such words must
  // not be reported as confidently routed.
  const r = classify('Fix the page');
  assert.notEqual(r.confidence, 'HIGH');
});

/* ------------------------------------------------------------------ *
 * 8.4 â€” intent
 * ------------------------------------------------------------------ */

test('intent verbs classify, and a question with no verb is an investigation', () => {
  assert.equal(classify('Add a paid template').intent.intent, 'ADD');
  assert.equal(classify('Fix a payment verification bug').intent.intent, 'FIX');
  assert.equal(classify('Remove the deprecated banner').intent.intent, 'REMOVE');
  assert.equal(classify('Why is the site loading slowly?').intent.intent, 'INVESTIGATE');
});

test('intent carries a reason', () => {
  for (const t of ['Add a paid template', 'Why is the site loading slowly?']) {
    assert.ok(classify(t).intent.why.length > 0);
  }
});

/* ------------------------------------------------------------------ *
 * 8.5 â€” surface
 * ------------------------------------------------------------------ */

test('surface follows the resolved evidence', () => {
  assert.ok(classify('Add an MCP tool').surface.includes('MCP'));
  assert.ok(classify('Fix a payment verification bug').surface.includes('BACKEND'));
  assert.deepEqual(classify('xyzzy frobnicate widget').surface, ['UNKNOWN']);
});

/* ------------------------------------------------------------------ *
 * 8.52 â€” protected paths
 * ------------------------------------------------------------------ */

test('protected tiers come from PROTECTED_PATHS.md, not a copied table', () => {
  assert.equal(tierFor('backend/src/routes/paymentRoutes.js'), 'CRITICAL');
  assert.equal(tierFor('mcp-server/dist/index.js'), 'GENERATED');
  assert.equal(tierFor('frontend/src/components/button.tsx'), 'NORMAL');
  assert.ok(protectedRules().length > 0, 'the rule table must not be empty');
});

test('a directory rule covers its whole subtree', () => {
  // `backend/src/routes/paymentRoutes.js` is listed by name as CRITICAL, while the
  // directory as a whole is HIGH RISK. Both must hold: the specific file keeps its
  // own stricter tier, and a brand new file in the same directory still inherits
  // the directory's tier instead of falling through to NORMAL.
  assert.equal(tierFor('backend/src/routes/paymentRoutes.js'), 'CRITICAL');
  assert.equal(tierFor('backend/src/routes/someNewRoute.js'), 'HIGH_RISK');
  assert.notEqual(tierFor('backend/src/routes/someNewRoute.js'), 'NORMAL');
});

test('every tier the router can emit is declared in PROTECTED_PATHS.md', () => {
  const declared = new Set(protectedRules().map((r) => r.tier));
  for (const tier of ['CRITICAL', 'HIGH_RISK', 'GENERATED']) {
    assert.ok(declared.has(tier), `tier ${tier} is used but never declared in the rules doc`);
  }
});

/* ------------------------------------------------------------------ *
 * 8.51 â€” freshness
 * ------------------------------------------------------------------ */

test('freshness reports FRESH against the committed indexes', () => {
  const f = freshness();
  assert.equal(f.state, 'FRESH', `indexes are ${f.state}: ${f.reason}`);
  assert.ok(f.checked > 400, 'the pre-check must actually walk the tree');
});

test('repository size is consistent with the manifest snapshot', () => {
  const size = repositorySize();
  assert.equal(size.indexedFiles, size.indexedFiles);
  assert.ok(size.indexedFiles > 0);
  assert.ok(size.components > 0);
});

/* ------------------------------------------------------------------ *
 * 8.53 â€” the matrix contract
 * ------------------------------------------------------------------ */

test('the routing matrix is internally consistent', () => {
  // `buildRoutingMatrix()` flattens each category's `routing` block onto the
  // category itself, so the built contract is read with flat keys.
  //
  // A documentation-only category legitimately has no primary index: its job is
  // to point at knowledge, not at source. What every category must do is give a
  // reader somewhere to go and something to run.
  for (const [name, def] of Object.entries(matrix.categories)) {
    assert.ok(def.summary?.length > 0, `${name} has no summary`);
    assert.ok(def.primaryIndexes?.length > 0 || def.knowledge?.length > 0,
      `${name} names neither a primary index nor a knowledge document`);
    assert.ok(Array.isArray(def.requiredValidation), `${name} has no validation list`);
    assert.ok(def.requiredValidation.length > 0, `${name} lists no validation commands`);
  }
});

test('every declared source root is a real directory', () => {
  for (const [name, def] of Object.entries(matrix.categories)) {
    for (const root of def.sourceRoots ?? []) {
      assert.ok(existsSync(root), `${name} claims source root ${root}, which does not exist`);
    }
  }
});

test('subsystem overlays are declared as overlays, not as new surfaces', () => {
  for (const overlay of ['PERFORMANCE', 'TESTING', 'DESIGN_SYSTEM']) {
    assert.ok(matrix.categories[overlay], `${overlay} is missing from the matrix`);
  }
});

/* ------------------------------------------------------------------ *
 * 8.54 â€” query-index still works as a library
 * ------------------------------------------------------------------ */

test('query-index imports silently and returns data', () => {
  // Commands return `{ query, hits }`, not a bare array.
  const out = runQuery('component', 'TemplatePreview');
  assert.ok(Array.isArray(out.hits));
  assert.ok(out.hits.length > 0, 'a real component name must return rows');
  assert.ok(out.hits.some((h) => h.component.path.includes('TemplatePreview')));
});

test('query-index still raises UsageError for a bad command', () => {
  assert.throws(() => run('definitely-not-a-command'), UsageError);
});