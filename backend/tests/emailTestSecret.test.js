import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { denyUnlessEmailTestSecret } from '../src/routes/userRoutes.js';

const makeRes = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
  };
  return res;
};

const REAL_SECRET = 'a-real-operator-secret';
let saved;

beforeEach(() => {
  saved = process.env.EMAIL_TEST_SECRET;
});
afterEach(() => {
  if (saved === undefined) delete process.env.EMAIL_TEST_SECRET;
  else process.env.EMAIL_TEST_SECRET = saved;
});

test('fails closed with 503 when EMAIL_TEST_SECRET is unset', () => {
  delete process.env.EMAIL_TEST_SECRET;
  const res = makeRes();
  const result = denyUnlessEmailTestSecret({ body: { secret: 'anything' } }, res);
  assert.ok(result, 'request should be rejected');
  assert.equal(res.statusCode, 503);
  assert.match(res.body.error, /not configured/);
});

test('unset secret rejects any arbitrary hardcoded value (regression: the old default)', () => {
  delete process.env.EMAIL_TEST_SECRET;
  const res = makeRes();
  // Sentinel stands in for the retired hardcoded default without reproducing it.
  const result = denyUnlessEmailTestSecret({ body: { secret: 'retired-hardcoded-default' } }, res);
  assert.ok(result);
  assert.equal(res.statusCode, 503);
});

test('unset secret rejects an empty string secret', () => {
  delete process.env.EMAIL_TEST_SECRET;
  const res = makeRes();
  assert.ok(denyUnlessEmailTestSecret({ body: { secret: '' } }, res));
  assert.equal(res.statusCode, 503);
});

test('missing secret is 401 when the feature is configured', () => {
  process.env.EMAIL_TEST_SECRET = REAL_SECRET;
  const res = makeRes();
  assert.ok(denyUnlessEmailTestSecret({ body: {} }, res));
  assert.equal(res.statusCode, 401);
});

test('undefined body is 401 rather than a crash', () => {
  process.env.EMAIL_TEST_SECRET = REAL_SECRET;
  const res = makeRes();
  assert.ok(denyUnlessEmailTestSecret({ body: undefined }, res));
  assert.equal(res.statusCode, 401);
});

test('non-string secret is rejected without a type error', () => {
  process.env.EMAIL_TEST_SECRET = REAL_SECRET;
  for (const bad of [123, true, null, {}, []]) {
    const res = makeRes();
    assert.ok(denyUnlessEmailTestSecret({ body: { secret: bad } }, res));
    assert.equal(res.statusCode, 401);
  }
});

test('wrong secret is 403', () => {
  process.env.EMAIL_TEST_SECRET = REAL_SECRET;
  const res = makeRes();
  assert.ok(denyUnlessEmailTestSecret({ body: { secret: 'wrong' } }, res));
  assert.equal(res.statusCode, 403);
});

test('correct secret is allowed and sends no response', () => {
  process.env.EMAIL_TEST_SECRET = REAL_SECRET;
  const res = makeRes();
  const result = denyUnlessEmailTestSecret({ body: { secret: REAL_SECRET } }, res);
  assert.equal(result, null, 'handler should continue');
  assert.equal(res.statusCode, null);
  assert.equal(res.body, null);
});

test('the response never echoes the configured secret', () => {
  process.env.EMAIL_TEST_SECRET = REAL_SECRET;
  const res = makeRes();
  denyUnlessEmailTestSecret({ body: { secret: 'wrong' } }, res);
  assert.ok(!JSON.stringify(res.body).includes(REAL_SECRET));
});
