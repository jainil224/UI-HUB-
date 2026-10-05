import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemplateViewsService } from '../src/services/templateViewsService.js';

const SESSION_A = 'b5730d08-99df-4eb1-9d0f-b52509eb9a5b';
const SESSION_B = 'fe6b5be2-ad33-4e5a-ae90-d8196ec949b8';

const createFakeCollection = () => {
  const events = new Map();
  const indexes = [];

  return {
    events,
    indexes,
    createIndex: async (keys, options) => {
      indexes.push({ keys, options });
    },
    insertOne: async (event) => {
      const key = `${event.templateId}:${event.sessionId}`;
      if (events.has(key)) {
        const error = new Error('duplicate key');
        error.code = 11000;
        throw error;
      }
      events.set(key, event);
      return { acknowledged: true };
    },
    countDocuments: async ({ templateId }) =>
      [...events.values()].filter((event) => event.templateId === templateId).length,
    aggregate: (pipeline) => ({
      toArray: async () => {
        const templateIds = pipeline[0].$match.templateId.$in;
        const counts = new Map();
        for (const event of events.values()) {
          if (templateIds.includes(event.templateId)) {
            counts.set(event.templateId, (counts.get(event.templateId) || 0) + 1);
          }
        }
        return [...counts].map(([_id, views]) => ({ _id, views }));
      },
    }),
  };
};

test('records one event per template and session and returns persistent counts', async () => {
  const collection = createFakeCollection();
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
  assert.equal(collection.indexes.length, 2);
  assert.equal(collection.indexes[0].options.unique, true);
});

test('returns counts for requested template IDs using one aggregate', async () => {
  const collection = createFakeCollection();
  const service = createTemplateViewsService(async () => collection);
  await service.recordTemplateView({ templateId: 'mood-hero', sessionId: SESSION_A });
  await service.recordTemplateView({ templateId: 'mood-hero', sessionId: SESSION_B });
  await service.recordTemplateView({ templateId: 'portfolio-closing', sessionId: SESSION_A });

  assert.deepEqual(
    await service.listTemplateViewCounts(['mood-hero', 'portfolio-closing', 'unknown-template']),
    { 'mood-hero': 2, 'portfolio-closing': 1, 'unknown-template': 0 },
  );
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
