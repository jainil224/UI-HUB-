import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createComponentViewsService,
  createTemplateViewsService,
} from '../src/services/templateViewsService.js';

const SESSION_A = 'b5730d08-99df-4eb1-9d0f-b52509eb9a5b';
const SESSION_B = 'fe6b5be2-ad33-4e5a-ae90-d8196ec949b8';

const createFakeCollection = (idField) => {
  const events = new Map();
  const createdIndexes = [];

  return {
    events,
    createdIndexes,
    indexes: async () => [{ name: '_id_', key: { _id: 1 } }, ...createdIndexes],
    createIndex: async (keys, options) => {
      createdIndexes.push({ key: keys, keys, options, name: options.name, unique: options.unique });
    },
    insertOne: async (event) => {
      const key = `${event[idField]}:${event.sessionId}`;
      if (events.has(key)) {
        const error = new Error('duplicate key');
        error.code = 11000;
        throw error;
      }
      events.set(key, event);
      return { acknowledged: true };
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

test('records one event per template and session and returns persistent counts', async () => {
  const collection = createFakeCollection('templateId');
  const service = createTemplateViewsService(async () => collection);

  const first = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_A,
    userId: 'firebase-user-1',
  });
  const duplicate = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_A,
  });
  const otherTemplate = await service.recordTemplateView({
    templateId: 'portfolio-closing',
    sessionId: SESSION_A,
  });
  const otherSession = await service.recordTemplateView({
    templateId: 'mood-hero',
    sessionId: SESSION_B,
  });

  assert.deepEqual(first, { templateId: 'mood-hero', viewRecorded: true, views: 1 });
  assert.deepEqual(duplicate, { templateId: 'mood-hero', viewRecorded: false, views: 1 });
  assert.equal(otherTemplate.views, 1);
  assert.equal(otherSession.views, 2);
  assert.equal(collection.events.size, 3);
  assert.equal(collection.events.get(`mood-hero:${SESSION_A}`).userId, 'firebase-user-1');
  assert.equal(collection.events.get(`portfolio-closing:${SESSION_A}`).userId, null);
  assert.equal(collection.createdIndexes.length, 2);
  assert.equal(collection.createdIndexes[0].options.unique, true);
  assert.deepEqual(collection.createdIndexes.map((index) => index.options.name), [
    'template_session_unique',
    'created_at_template',
  ]);
});

test('returns counts for requested template IDs using one aggregate', async () => {
  const collection = createFakeCollection('templateId');
  const service = createTemplateViewsService(async () => collection);
  await service.recordTemplateView({ templateId: 'mood-hero', sessionId: SESSION_A });
  await service.recordTemplateView({ templateId: 'mood-hero', sessionId: SESSION_B });
  await service.recordTemplateView({ templateId: 'portfolio-closing', sessionId: SESSION_A });

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
    userId: 'firebase-user-1',
  });
  const duplicate = await service.recordComponentView({
    componentId: 'target-cursor',
    sessionId: SESSION_A,
  });
  const otherComponent = await service.recordComponentView({
    componentId: 'black-hole-cursor',
    sessionId: SESSION_A,
  });

  assert.deepEqual(first, { componentId: 'target-cursor', viewRecorded: true, views: 1 });
  assert.deepEqual(duplicate, { componentId: 'target-cursor', viewRecorded: false, views: 1 });
  assert.equal(otherComponent.views, 1);
  assert.equal(collection.events.size, 2);
  assert.equal(collection.events.get(`target-cursor:${SESSION_A}`).userId, 'firebase-user-1');
  assert.deepEqual(
    await service.listComponentViewCounts(['target-cursor', 'black-hole-cursor', 'missing']),
    { 'target-cursor': 1, 'black-hole-cursor': 1, missing: 0 },
  );
  assert.equal(collection.createdIndexes[0].options.unique, true);
  assert.deepEqual(collection.createdIndexes.map((index) => index.options.name), [
    'componentId_session_unique',
    'created_at_componentId',
  ]);
});

test('reuses existing indexes even when MongoDB assigned different names', async () => {
  const collection = createFakeCollection('componentId');
  collection.indexes = async () => [
    { name: '_id_', key: { _id: 1 } },
    { name: 'legacy_unique_name', key: { componentId: 1, sessionId: 1 }, unique: true },
    { name: 'legacy_recent_name', key: { createdAt: -1, componentId: 1 } },
  ];
  const service = createComponentViewsService(async () => collection);

  const result = await service.recordComponentView({
    componentId: 'target-cursor',
    sessionId: SESSION_A,
  });

  assert.equal(result.views, 1);
  assert.equal(collection.createdIndexes.length, 0);
});

test('validates template and session identifiers', async () => {
  const {
    isValidTemplateId,
    isValidViewSessionId,
  } = await import('../src/services/templateViewsService.js');

  assert.equal(isValidTemplateId('valid-template-1'), true);
  assert.equal(isValidTemplateId('not valid'), false);
  assert.equal(isValidViewSessionId(SESSION_A), true);
  assert.equal(isValidViewSessionId('spoofed-session'), false);
});
