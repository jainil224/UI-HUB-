import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequireAdmin } from '../src/middleware/auth.js';

/** Minimal Express-like response double. */
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

const collectionReturning = (doc) => ({
  findOne: async () => doc,
});

const ADMIN = { isAdmin: true, email: 'admin@ui-hub.test', uid: 'admin-uid' };
const NON_ADMIN = { isAdmin: false, email: 'user@ui-hub.test', uid: 'user-uid' };

const run = async ({ user, doc, dbThrows = false }) => {
  const mw = createRequireAdmin(async () => {
    if (dbThrows) throw new Error('mongo unreachable');
    return collectionReturning(doc);
  });
  const req = { user, headers: {} };
  const res = makeRes();
  let nexted = false;
  await mw(req, res, () => {
    nexted = true;
  });
  return { res, nexted, req };
};

test('unauthenticated request is rejected with 401 and never reaches the handler', async () => {
  const { res, nexted } = await run({ user: undefined, doc: ADMIN });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.error, /Unauthorized/);
});

test('authenticated non-admin is rejected with 403', async () => {
  const { res, nexted } = await run({
    user: { uid: 'user-uid', email: 'user@ui-hub.test' },
    doc: NON_ADMIN,
  });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 403);
  assert.match(res.body.error, /Forbidden/);
});

test('user document missing isAdmin entirely is treated as non-admin', async () => {
  const { res, nexted } = await run({
    user: { uid: 'user-uid', email: 'user@ui-hub.test' },
    doc: { email: 'user@ui-hub.test' },
  });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 403);
});

test('a truthy non-boolean isAdmin is not treated as admin', async () => {
  const { res, nexted } = await run({
    user: { uid: 'user-uid', email: 'user@ui-hub.test' },
    doc: { isAdmin: 'true', email: 'user@ui-hub.test' },
  });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 403);
});

test('no matching user document is rejected with 403', async () => {
  const { res, nexted } = await run({
    user: { uid: 'ghost', email: 'ghost@ui-hub.test' },
    doc: null,
  });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 403);
});

test('authorized admin is allowed through and flagged on req.user', async () => {
  const { res, nexted, req } = await run({
    user: { uid: 'admin-uid', email: 'admin@ui-hub.test' },
    doc: ADMIN,
  });
  assert.equal(nexted, true);
  assert.equal(res.statusCode, null, 'no error response should be sent on success');
  assert.equal(req.user.isAdmin, true);
});

test('a token carrying no uid and no email cannot be resolved to an admin', async () => {
  const { res, nexted } = await run({ user: { displayName: 'x' }, doc: ADMIN });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 403);
});

test('admin lookup failure fails closed with 503 instead of allowing the request', async () => {
  const { res, nexted } = await run({
    user: { uid: 'admin-uid', email: 'admin@ui-hub.test' },
    doc: null,
    dbThrows: true,
  });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 503);
});

test('a findOne that rejects also fails closed', async () => {
  const mw = createRequireAdmin(async () => ({
    findOne: async () => {
      throw new Error('socket hang up');
    },
  }));
  const res = makeRes();
  let nexted = false;
  await mw({ user: { uid: 'admin-uid', email: 'a@b.test' } }, res, () => {
    nexted = true;
  });
  assert.equal(nexted, false);
  assert.equal(res.statusCode, 503);
});

test('the email clause is lowercased and covers both email and _id keying', async () => {
  let seen = null;
  const mw = createRequireAdmin(async () => ({
    findOne: async (filter) => {
      seen = filter;
      return ADMIN;
    },
  }));
  const res = makeRes();
  await mw({ user: { uid: 'admin-uid', email: 'Admin@UI-Hub.TEST' } }, res, () => {});
  assert.deepEqual(seen.$or, [
    { uid: 'admin-uid' },
    { email: 'admin@ui-hub.test' },
    { _id: 'admin@ui-hub.test' },
  ]);
});

test('only the needed fields are projected', async () => {
  let projection = null;
  const mw = createRequireAdmin(async () => ({
    findOne: async (_filter, options) => {
      projection = options?.projection;
      return ADMIN;
    },
  }));
  await mw({ user: { uid: 'admin-uid' } }, makeRes(), () => {});
  assert.deepEqual(Object.keys(projection).sort(), ['email', 'isAdmin', 'uid']);
});

test('uid-only identity still works when the document has no email', async () => {
  const { nexted } = await run({
    user: { uid: 'admin-uid' },
    doc: { isAdmin: true, uid: 'admin-uid' },
  });
  assert.equal(nexted, true);
});
