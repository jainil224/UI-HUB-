import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCollection,
  updateCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection,
  FREE_VAULT_LIMIT,
} from '../src/services/collectionsService.js';

// Mock executeWithRetry to invoke the callback with a fake db.
const state = {
  collections: new Map(),
  favoritesCount: 0,
};
const db = () => ({
  collection: (name) => ({
    find: () => ({
      sort: () => ({ toArray: async () => [...state.collections.values()] }),
      toArray: async () => [...state.collections.values()],
    }),
    findOne: async (filter) => {
      if (filter?._id !== undefined) return state.collections.get(filter._id) || null;
      return null;
    },
    countDocuments: async () => state.favoritesCount,
    updateOne: async (filter, update) => {
      const key = filter._id;
      let doc = state.collections.get(key);
      if (!doc) {
        doc = { ...(update.$setOnInsert || {}) };
        state.collections.set(key, doc);
        return { matchedCount: 0 };
      }
      if (update.$set) Object.assign(doc, update.$set);
      if (update.$push) {
        doc[Object.keys(update.$push)[0]] = [...(doc[Object.keys(update.$push)[0]] || []), update.$push[Object.keys(update.$push)[0]]];
      }
      if (update.$addToSet) {
        const k = Object.keys(update.$addToSet)[0];
        if (!doc[k]) doc[k] = [];
        if (!doc[k].includes(update.$addToSet[k])) doc[k].push(update.$addToSet[k]);
      }
      if (update.$pull) {
        const k = Object.keys(update.$pull)[0];
        const v = update.$pull[k];
        if (doc[k]) doc[k] = doc[k].filter((x) => (typeof v === 'object' ? x.componentId !== v.componentId : x !== v));
      }
      return { matchedCount: 1, modifiedCount: 1 };
    },
    deleteOne: async (filter) => {
      const existed = state.collections.delete(filter._id);
      return { deletedCount: existed ? 1 : 0 };
    },
  }),
});

// Replace the module's executeWithRetry import before each test run.
const mongoModule = async () => import('../src/services/mongoService.js');
const runWithDb = async (fn) => {
  const mod = await mongoModule();
  const original = mod.default.executeWithRetry;
  mod.default.executeWithRetry = async (cb) => cb(db());
  try {
    await fn();
  } finally {
    mod.default.executeWithRetry = original;
  }
};

const reset = () => {
  state.collections.clear();
  state.favoritesCount = 0;
};

test('createCollection requires a name and returns a collection', async () => {
  await runWithDb(async () => {
    reset();
    const bad = await createCollection('user1', { name: '   ' });
    assert.equal(bad.ok, false);
    assert.equal(bad.error, 'Collection name is required');

    const ok = await createCollection('user1', { name: 'My Favorites Folder', description: 'desc' });
    assert.equal(ok.ok, true);
    assert.equal(ok.collection.name, 'My Favorites Folder');
    assert.equal(ok.collection.id, 'my-favorites-folder');
    assert.equal(ok.collection.itemCount, 0);
  });
});

test('deleteCollection removes only the owner collection', async () => {
  await runWithDb(async () => {
    reset();
    await createCollection('user1', { name: 'A' });
    const mine = await deleteCollection('user1', 'a');
    assert.equal(mine.ok, true);
    const notMine = await deleteCollection('user1', 'nope');
    assert.equal(notMine.ok, false);
  });
});

test('addToCollection enforces the global free vault limit', async () => {
  await runWithDb(async () => {
    reset();
    await createCollection('user1', { name: 'A' });

    state.favoritesCount = FREE_VAULT_LIMIT;
    const blocked = await addToCollection('user1', 'a', { componentId: 'c1', title: 'C1', category: 'button', code: '' });
    assert.equal(blocked.ok, false);
    assert.equal(blocked.overLimit, true);

    state.favoritesCount = FREE_VAULT_LIMIT - 1;
    const added = await addToCollection('user1', 'a', { componentId: 'c1', title: 'C1', category: 'button', code: '' });
    assert.equal(added.ok, true);
    assert.equal(added.overLimit, false);

    // duplicate is idempotent
    const dup = await addToCollection('user1', 'a', { componentId: 'c1', title: 'C1', category: 'button', code: '' });
    assert.equal(dup.ok, true);
    assert.equal(dup.overLimit, false);
  });
});

test('addToCollection refuses missing collection', async () => {
  await runWithDb(async () => {
    reset();
    const res = await addToCollection('user1', 'missing', { componentId: 'c1', title: 'C1', category: 'button', code: '' });
    assert.equal(res.ok, false);
    assert.equal(res.error, 'Collection not found');
  });
});

test('removeFromCollection pulls the item out', async () => {
  await runWithDb(async () => {
    reset();
    state.favoritesCount = 0;
    await createCollection('user1', { name: 'A' });
    await addToCollection('user1', 'a', { componentId: 'c1', title: 'C1', category: 'button', code: '' });
    const res = await removeFromCollection('user1', 'a', 'c1');
    assert.equal(res.ok, true);
  });
});

test('updateCollection renames an owned collection', async () => {
  await runWithDb(async () => {
    reset();
    await createCollection('user1', { name: 'A' });
    const res = await updateCollection('user1', 'a', { name: 'Renamed' });
    assert.equal(res.ok, true);
    const res2 = await updateCollection('user1', 'missing', { name: 'X' });
    assert.equal(res2.ok, false);
  });
});
