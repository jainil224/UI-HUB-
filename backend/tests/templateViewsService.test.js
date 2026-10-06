import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createComponentViewsService,
  createTemplateViewsService,
  isValidViewViewerId,
} from '../src/services/templateViewsService.js';

const SESSION_A = 'b5730d08-99df-4eb1-9d0f-b52509eb9a5b';
const SESSION_B = 'fe6b5be2-ad33-4e5a-ae90-d8196ec949b8';
const SESSION_C = '2f9c1d64-0d1a-4a2f-9c6e-6f6b1f2a3c4d';
const VIEWER_A = `a:${SESSION_A}`;
const VIEWER_B = `a:${SESSION_B}`;
const VIEWER_C = `a:${SESSION_C}`;

const duplicateKeyError = () => {
  const error = new Error('E11000 duplicate key error');
  error.code = 11000;
  return error;
};

/**
 * Models both unique indexes that exist in MongoDB: the legacy
 * `{itemId, sessionId}` index and the partial `{itemId, viewerId}` one.
 */
const createFakeCollection = (idField) => {
  const events = new Map();
  const createdIndexes = [];

  // An event without a viewerId is exempt from the viewer index (that is what
  // partialFilterExpression buys us), so its identity is its session.
  const viewerKeyOf = (event) => (event.viewerId ? `${event[idField]}:${event.viewerId}` : null);
  const sessionKeyOf = (event) => `${event[idField]}:session:${event.sessionId}`;

  const findByFilter = (filter) => {
    for (const [key, event] of events) {
      if (event[idField] !== filter[idField]) continue;
      if (filter.viewerId !== undefined && event.viewerId !== filter.viewerId) continue;
      return key;
    }
    return null;
  };

  return {
    events,
    createdIndexes,
    indexes: async () => [{ name: '_id_', key: { _id: 1 } }, ...createdIndexes],
    createIndex: async (keys, options) => {
      createdIndexes.push({
        key: keys,
        keys,
        options,
        name: options.name,
        unique: options.unique,
        partialFilterExpression: options.partialFilterExpression,
      });
    },
    insertOne: async (event) => {
      const viewerKey = viewerKeyOf(event);
      const sessionKey = sessionKeyOf(event);
      const collides = [...events.keys()].some((key) => (
        key === sessionKey || (viewerKey !== null && key === viewerKey)
      ));
      if (collides) throw duplicateKeyError();
      events.set(viewerKey ?? sessionKey, event);
      return { acknowledged: true };
    },
    updateOne: async (filter, update) => {
      const key = findByFilter(filter);
      if (key === null) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
      const merged = { ...events.get(key), ...update.$set };
      const mergedViewerKey = viewerKeyOf(merged);
      if (mergedViewerKey !== null && mergedViewerKey !== key && events.has(mergedViewerKey)) {
        throw duplicateKeyError();
      }
      events.delete(key);
      events.set(mergedViewerKey ?? key, merged);
      return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    },
    countDocuments: async (filter) =>
      [...events.values()].filter((event) => event[idField] === filter[idField]).length,
    aggregate: (pipeline) => ({
      toArray: async () => {
        const ids = pipeline[0].$match[idField].$in;
        const counts = new Map();
        for (const event of events.values()) {
          if (ids.includes(event[idField])) {
            counts.set(event[idField], (counts.get(event[idField]) || 0) + 1);
          }
        }
        return [...counts].map(([_id, views]) => ({ _id, views }));
      },
    }),
  };
};

test('records one event per viewer per template, even in a later browser session', async () => {
  const collection = createFakeCollection('templateId');
  const service = createTemplateViewsService(async () => collection);

  const first = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_A,
    viewerId: VIEWER_A,
  });
  // Same person, new browser session. This is the repeat-visit case that used to
  // inflate the count: the session changed, the visitor did not.
  const returningVisitor = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_B,
    viewerId: VIEWER_A,
  });
  const otherTemplate = await service.recordTemplateView({
    templateId: 'portfolio-closing',
    sessionId: SESSION_A,
    viewerId: VIEWER_A,
  });
  const otherViewer = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_C,
    viewerId: VIEWER_C,
  });

  assert.deepEqual(first, { templateId: 'mood-hero', viewRecorded: true, views: 1 });
  assert.deepEqual(returningVisitor, { templateId: 'mood-hero', viewRecorded: false, views: 1 });
  assert.equal(otherTemplate.views, 1);
  assert.equal(otherViewer.views, 2);
  assert.equal(collection.events.size, 3);
  assert.equal(collection.events.get(`mood-hero:${VIEWER_A}`).userId, null);
  assert.equal(collection.events.get(`portfolio-closing:${VIEWER_A}`).userId, null);
});

test('counts one view per account across every browser and session', async () => {
  const collection = createFakeCollection('templateId');
  const service = createTemplateViewsService(async () => collection);

  const first = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_A,
    viewerId: VIEWER_A,
    userId: 'firebase-user-1',
  });
  const sameAccountOtherDevice = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_C,
    viewerId: VIEWER_C,
    userId: 'firebase-user-1',
  });

  assert.deepEqual(first, { templateId: 'mood-hero', viewRecorded: true, views: 1 });
  assert.deepEqual(sameAccountOtherDevice, { templateId: 'mood-hero', viewRecorded: false, views: 1 });
  assert.equal(collection.events.size, 1);
  const stored = [...collection.events.values()][0];
  assert.equal(stored.viewerId, 'u:firebase-user-1');
  assert.equal(stored.userId, 'firebase-user-1');
});

test('adopts the anonymous view when that visitor signs in instead of adding a second one', async () => {
  const collection = createFakeCollection('templateId');
  const service = createTemplateViewsService(async () => collection);

  const anonymous = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_A,
    viewerId: VIEWER_A,
  });
  const afterSignIn = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_A,
    viewerId: VIEWER_A,
    userId: 'firebase-user-1',
  });

  assert.deepEqual(anonymous, { templateId: 'mood-hero', viewRecorded: true, views: 1 });
  assert.deepEqual(afterSignIn, { templateId: 'mood-hero', viewRecorded: false, views: 1 });
  assert.equal(collection.events.size, 1);
  const stored = [...collection.events.values()][0];
  assert.equal(stored.viewerId, 'u:firebase-user-1');
  assert.equal(stored.userId, 'firebase-user-1');
  assert.ok(stored.claimedAt instanceof Date);
});

test('still deduplicates per session when a client sends no viewer id', async () => {
  const collection = createFakeCollection('templateId');
  const service = createTemplateViewsService(async () => collection);

  const first = await service.recordTemplateView({ templateId: 'mood-hero', sessionId: SESSION_A });
  const again = await service.recordTemplateView({ templateId: 'mood-hero', sessionId: SESSION_A });

  assert.deepEqual(first, { templateId: 'mood-hero', viewRecorded: true, views: 1 });
  assert.deepEqual(again, { templateId: 'mood-hero', viewRecorded: false, views: 1 });
  assert.equal(collection.events.size, 1);
});

test('creates a partial unique index on viewer so pre-existing events need no migration', async () => {
  const collection = createFakeCollection('templateId');
  const service = createTemplateViewsService(async () => collection);

  await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_A,
    viewerId: VIEWER_A,
  });

  assert.deepEqual(collection.createdIndexes.map((index) => index.options.name), [
    'template_session_unique',
    'template_viewer_unique',
    'created_at_template',
  ]);
  const viewerIndex = collection.createdIndexes[1];
  assert.equal(viewerIndex.options.unique, true);
  assert.deepEqual(Object.keys(viewerIndex.key), ['templateId', 'viewerId']);
  assert.deepEqual(viewerIndex.options.partialFilterExpression, { viewerId: { $type: 'string' } });
});

test('recovers when the collection has never been created and indexes() throws NamespaceNotFound', async () => {
  const collection = createFakeCollection('templateId');
  collection.indexes = async () => {
    if (collection.createdIndexes.length === 0) {
      const error = new Error('ns does not exist: uihub.template_views');
      error.codeName = 'NamespaceNotFound';
      throw error;
    }
    return [{ name: '_id_', key: { _id: 1 } }, ...collection.createdIndexes];
  };
  const service = createTemplateViewsService(async () => collection);

  const first = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_A,
    viewerId: VIEWER_A,
  });
  const returningViewer = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_B,
    viewerId: VIEWER_A,
  });

  assert.deepEqual(first, { templateId: 'mood-hero', viewRecorded: true, views: 1 });
  assert.deepEqual(returningViewer, { templateId: 'mood-hero', viewRecorded: false, views: 1 });
  assert.deepEqual(collection.createdIndexes.map((index) => index.options.name), [
    'template_session_unique',
    'template_viewer_unique',
    'created_at_template',
  ]);
});

test('returns counts for requested template IDs using one aggregate', async () => {
  const collection = createFakeCollection('templateId');
  const service = createTemplateViewsService(async () => collection);
  await service.recordTemplateView({ templateId: 'mood-hero', sessionId: SESSION_A, viewerId: VIEWER_A });
  await service.recordTemplateView({ templateId: 'mood-hero', sessionId: SESSION_C, viewerId: VIEWER_C });
  await service.recordTemplateView({ templateId: 'portfolio-closing', sessionId: SESSION_A, viewerId: VIEWER_A });

  assert.deepEqual(
    await service.listTemplateViewCounts(['mood-hero', 'portfolio-closing', 'unknown-template']),
    { 'mood-hero': 2, 'portfolio-closing': 1, 'unknown-template': 0 },
  );
});

test('tracks components independently from templates with their own deduplication', async () => {
  const collection = createFakeCollection('componentId');
  const service = createComponentViewsService(async () => collection);

  const first = await service.recordComponentView({
    componentId: 'target-cursor',
    sessionId: SESSION_A,
    viewerId: VIEWER_A,
    userId: null,
  });
  const returningViewer = await service.recordComponentView({
    componentId: 'target-cursor',
    sessionId: SESSION_B,
    viewerId: VIEWER_A,
  });
  const otherComponent = await service.recordComponentView({
    componentId: 'black-hole-cursor',
    sessionId: SESSION_A,
    viewerId: VIEWER_A,
  });

  assert.deepEqual(first, { componentId: 'target-cursor', viewRecorded: true, views: 1 });
  assert.deepEqual(returningViewer, { componentId: 'target-cursor', viewRecorded: false, views: 1 });
  assert.equal(otherComponent.views, 1);
  assert.equal(collection.events.size, 2);
  assert.deepEqual(
    await service.listComponentViewCounts(['target-cursor', 'black-hole-cursor', 'missing']),
    { 'target-cursor': 1, 'black-hole-cursor': 1, missing: 0 },
  );
  assert.deepEqual(collection.createdIndexes.map((index) => index.options.name), [
    'componentId_session_unique',
    'componentId_viewer_unique',
    'created_at_componentId',
  ]);
});

test('reuses existing indexes even when MongoDB assigned different names', async () => {
  const collection = createFakeCollection('componentId');
  collection.indexes = async () => [
    { name: '_id_', key: { _id: 1 } },
    { name: 'legacy_unique_name', key: { componentId: 1, sessionId: 1 }, unique: true },
    {
      name: 'legacy_viewer_name',
      key: { componentId: 1, viewerId: 1 },
      unique: true,
      partialFilterExpression: { viewerId: { $type: 'string' } },
    },
    { name: 'legacy_recent_name', key: { createdAt: -1, componentId: 1 } },
  ];
  const service = createComponentViewsService(async () => collection);

  const result = await service.recordComponentView({
    componentId: 'target-cursor',
    sessionId: SESSION_A,
    viewerId: VIEWER_A,
  });

  assert.equal(result.views, 1);
  assert.equal(collection.createdIndexes.length, 0);
});

test('validates template, session and viewer identifiers', async () => {
  const {
    isValidTemplateId,
    isValidViewSessionId,
  } = await import('../src/services/templateViewsService.js');

  assert.equal(isValidTemplateId('valid-template-1'), true);
  assert.equal(isValidTemplateId('not valid'), false);
  assert.equal(isValidViewSessionId(SESSION_A), true);
  assert.equal(isValidViewSessionId('spoofed-session'), false);

  assert.equal(isValidViewViewerId(VIEWER_A), true);
  assert.equal(isValidViewViewerId('u:firebase-user-1'), true);
  assert.equal(isValidViewViewerId('u:ab'), false);
  assert.equal(isValidViewViewerId(`a:${SESSION_A}`), true);
  assert.equal(isValidViewViewerId('a:not-a-uuid'), false);
  assert.equal(isValidViewViewerId(VIEWER_A.slice(2)), false);
  assert.equal(isValidViewViewerId('u:someone-else'), true);
  assert.equal(isValidViewViewerId(undefined), false);
});
