import test from 'node:test';
import assert from 'node:assert/strict';
import { validationResult } from 'express-validator';
import { LIFETIME_PRICE, PLANS } from '../src/config/plans.js';
import { validateCreateOrder, validateVerifyPayment } from '../src/middleware/validators.js';
import { decideAccess } from '../src/services/accessService.js';

const runChecks = async (checks, body) => {
  const req = { body };
  for (const check of checks) {
    await new Promise((resolve, reject) => {
      check(req, {}, (error) => (error ? reject(error) : resolve()));
    });
  }
  return validationResult(req);
};

test('lifetime plan is priced at Rs 3,999 with Ultimate-level benefits', () => {
  assert.equal(LIFETIME_PRICE.inr, 3999);
  assert.equal(PLANS.lifetime.tier, 'lifetime');
  assert.ok(PLANS.lifetime.features.includes('200 AI Credits / Month'));
});

test('create-order validators accept the lifetime plan', async () => {
  const result = await runChecks(validateCreateOrder.slice(0, -1), {
    planId: 'lifetime',
    amount: LIFETIME_PRICE.inr,
    currency: 'INR',
    purchaseType: 'lifetime',
    subscriptionMonths: 0,
  });
  assert.equal(result.isEmpty(), true);
});

test('verify-payment validators accept lifetime tier and planId', async () => {
  const result = await runChecks(validateVerifyPayment.slice(0, -1), {
    razorpay_order_id: 'order_12345678901234',
    razorpay_payment_id: 'pay_12345678901234',
    razorpay_signature: 'a'.repeat(64),
    user_email: 'buyer@example.com',
    tier: 'lifetime',
    amount: LIFETIME_PRICE.inr,
    planId: 'lifetime',
    purchaseType: 'lifetime',
    subscriptionMonths: 0,
  });
  assert.equal(result.isEmpty(), true);
});

test('lifetime subscribers receive full premium access', () => {
  const result = decideAccess(
    { uid: 'uid-lifetime', email: 'buyer@example.com' },
    { id: 'gravitational-vortex', isPro: true, category: 'background' },
    {
      status: 'LIFETIME',
      planType: 'lifetime',
      isFullPro: true,
      isCustom: false,
      selectedCategories: [],
      entitlements: [],
    }
  );
  assert.deepEqual(result, { allowed: true, tier: 'pro' });
});
