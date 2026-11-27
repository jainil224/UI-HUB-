import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_CREDITS, PLANS } from '../src/config/plans.js';
import { PREMIUM_AI_TOOLS } from '../src/services/userService.js';

test('free accounts get five prompt copies per UTC day', () => {
  assert.equal(AI_CREDITS.freeDaily, 5);
});

test('pro accounts get five daily and fifty monthly AI credits', () => {
  assert.equal(AI_CREDITS.proDaily, 5);
  assert.equal(AI_CREDITS.proMonthly, 50);
  assert.ok(PLANS.pro.features.includes('5 Daily + 50 Monthly AI Credits'));
  assert.ok(!PLANS.pro.features.some((feature) => feature.includes('100 Monthly')));
});

test('advance, antigravity and claude are the only Pro-only prompt tools', () => {
  assert.deepEqual([...PREMIUM_AI_TOOLS].sort(), ['advance', 'antigravity', 'claude']);
  assert.equal(PREMIUM_AI_TOOLS.includes('lovable'), false);
  assert.equal(PREMIUM_AI_TOOLS.includes('cursor'), false);
});
