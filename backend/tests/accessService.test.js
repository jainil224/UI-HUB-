import test from 'node:test';
import assert from 'node:assert/strict';
import { decideAccess } from '../src/services/accessService.js';

// Mirrors the static SPECIAL_EMAILS list in accessService.js (accessService.default.SPECIAL_EMAILS).
const SPECIAL_EMAILS = [
  'jainil11199@gmail.com',
  'jainil224@gmail.com',
  'jainilpatel2224@gmail.com',
];

const premiumMeta = { id: 'gravitational-vortex', isPro: true, category: 'background' };
const freeMeta = { id: 'globe-mesh', isPro: false, category: 'component' };

const user = (opts = {}) => ({
  uid: opts.uid || 'uid-test-1',
  user_id: undefined,
  email: opts.email !== undefined ? opts.email : 'free.user@example.com',
});

const plan = (over = {}) => ({
  status: 'FREE',
  planType: 'free',
  isFullPro: false,
  isCustom: false,
  selectedCategories: [],
  entitlements: [],
  ...over,
});

test('free components always deny nothing — allowed for any caller (tier free)', () => {
  assert.deepEqual(decideAccess(null, freeMeta, null), { allowed: true, tier: 'free' });
  assert.deepEqual(decideAccess(user(), freeMeta, null), { allowed: true, tier: 'free' });
  assert.deepEqual(decideAccess(user({ email: 'anyone@example.com' }), freeMeta, plan()), { allowed: true, tier: 'free' });
});

test('premium component + no authenticated user -> AUTH_REQUIRED', () => {
  assert.deepEqual(decideAccess(null, premiumMeta, plan()), { allowed: false, reason: 'AUTH_REQUIRED', tier: 'free' });
  assert.deepEqual(decideAccess(undefined, premiumMeta, null), { allowed: false, reason: 'AUTH_REQUIRED', tier: 'free' });
});

test('premium component + authenticated user with no DB record (plan null) -> PREMIUM_REQUIRED', () => {
  assert.deepEqual(decideAccess(user(), premiumMeta, null), { allowed: false, reason: 'PREMIUM_REQUIRED', tier: 'free' });
});

test('special/ELITE emails always allowed (tier elite) without a plan record', () => {
  for (const email of SPECIAL_EMAILS) {
    const res = decideAccess(user({ email }), premiumMeta, null);
    assert.deepEqual(res, { allowed: true, tier: 'elite' }, `expected ${email} to be elite`);
  }
});

test('status PRO -> allowed (tier pro)', () => {
  const res = decideAccess(user(), premiumMeta, plan({ status: 'PRO', isFullPro: true }));
  assert.deepEqual(res, { allowed: true, tier: 'pro' });
});

test('status ELITE -> allowed (tier pro)', () => {
  const res = decideAccess(user(), premiumMeta, plan({ status: 'ELITE', isFullPro: true }));
  assert.deepEqual(res, { allowed: true, tier: 'pro' });
});

test('planType pro -> allowed (tier pro)', () => {
  const res = decideAccess(user(), premiumMeta, plan({ planType: 'pro', isFullPro: true }));
  assert.deepEqual(res, { allowed: true, tier: 'pro' });
});

test('future proExpiry -> allowed (tier pro)', () => {
  const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const res = decideAccess(user(), premiumMeta, plan({ proExpiry: future, isFullPro: true }));
  assert.deepEqual(res, { allowed: true, tier: 'pro' });
});

test('expired proExpiry -> denied PREMIUM_REQUIRED', () => {
  const past = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
  const res = decideAccess(user(), premiumMeta, plan({ proExpiry: past, isFullPro: false }));
  assert.deepEqual(res, { allowed: false, reason: 'PREMIUM_REQUIRED', tier: 'free' });
});

test('custom plan + category in selectedCategories -> allowed (tier custom)', () => {
  const res = decideAccess(user(), premiumMeta, plan({ isCustom: true, selectedCategories: ['background'] }));
  assert.deepEqual(res, { allowed: true, tier: 'custom' });
});

test('custom plan + category NOT selected -> CATEGORY_REQUIRED', () => {
  const res = decideAccess(user(), premiumMeta, plan({ isCustom: true, selectedCategories: ['cursor'] }));
  assert.deepEqual(res, { allowed: false, reason: 'CATEGORY_REQUIRED', tier: 'custom' });
});

test('entitlement matching component id -> allowed (tier bundle)', () => {
  const res = decideAccess(user(), premiumMeta, plan({ entitlements: ['gravitational-vortex'] }));
  assert.deepEqual(res, { allowed: true, tier: 'bundle' });
});

test('entitlement matching category -> allowed (tier bundle)', () => {
  const res = decideAccess(user(), premiumMeta, plan({ entitlements: ['background'] }));
  assert.deepEqual(res, { allowed: true, tier: 'bundle' });
});

test('unrelated entitlements -> denied PREMIUM_REQUIRED', () => {
  const res = decideAccess(user(), premiumMeta, plan({ entitlements: ['cursor', 'other-id'] }));
  assert.deepEqual(res, { allowed: false, reason: 'PREMIUM_REQUIRED', tier: 'free' });
});

test('plain free user with record -> denied PREMIUM_REQUIRED', () => {
  const res = decideAccess(user(), premiumMeta, plan());
  assert.deepEqual(res, { allowed: false, reason: 'PREMIUM_REQUIRED', tier: 'free' });
});