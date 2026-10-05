import { getCollection } from './mongoService.js';

const COLLECTION = 'template_views';
const COMPONENT_COLLECTION = 'component_views';
const TEMPLATE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidTemplateId = (value) =>
  typeof value === 'string' && value.length <= 100 && TEMPLATE_ID_PATTERN.test(value);

export const isValidViewSessionId = (value) =>
  typeof value === 'string' && SESSION_ID_PATTERN.test(value);

const createViewCollectionService = (
  collectionName,
  idField,
  indexNames,
  getCollectionForService,
) => {
  let indexesReady = null;

  const ensureIndexes = async (views) => {
    if (!indexesReady) {
      indexesReady = Promise.all([
        views.createIndex(
          { [idField]: 1, sessionId: 1 },
          { unique: true, name: indexNames.unique },
        ),
        views.createIndex(
          { createdAt: -1, [idField]: 1 },
          { name: indexNames.createdAt },
        ),
      ]).catch((error) => {
        indexesReady = null;
        throw error;
      });
    }
    await indexesReady;
  };

  const listTemplateViewCounts = async (templateIds) => {
    const views = await getCollectionForService(collectionName);
    await ensureIndexes(views);

    const counts = Object.fromEntries(templateIds.map((templateId) => [templateId, 0]));
    if (templateIds.length === 0) return counts;

    const groupedCounts = await views.aggregate([
      { $match: { [idField]: { $in: templateIds } } },
      { $group: { _id: `$${idField}`, views: { $sum: 1 } } },
    ]).toArray();

    for (const result of groupedCounts) {
      counts[result._id] = result.views;
    }
    return counts;
  };

  const recordTemplateView = async ({ itemId, sessionId, userId = null }) => {
    const views = await getCollectionForService(collectionName);
    await ensureIndexes(views);

    let viewRecorded = true;
    try {
      await views.insertOne({
        [idField]: itemId,
        sessionId,
        userId,
        createdAt: new Date(),
      });
    } catch (error) {
      if (error?.code !== 11000) throw error;
      viewRecorded = false;
    }

    const count = await views.countDocuments({ [idField]: itemId });
    return { [idField]: itemId, viewRecorded, views: count };
  };

  return { listTemplateViewCounts, recordTemplateView };
};

export const createTemplateViewsService = (getCollectionForService = getCollection) =>
  (() => {
    const service = createViewCollectionService(
      COLLECTION,
      'templateId',
      { unique: 'template_session_unique', createdAt: 'created_at_template' },
      getCollectionForService,
    );
    return {
      listTemplateViewCounts: service.listTemplateViewCounts,
      recordTemplateView: ({ templateId, sessionId, userId = null }) =>
        service.recordTemplateView({ itemId: templateId, sessionId, userId }),
    };
  })();
export const createComponentViewsService = (getCollectionForService = getCollection) =>
  (() => {
    const service = createViewCollectionService(
      COMPONENT_COLLECTION,
      'componentId',
      { unique: 'componentId_session_unique', createdAt: 'created_at_componentId' },
      getCollectionForService,
    );
    return {
      listComponentViewCounts: service.listTemplateViewCounts,
      recordComponentView: ({ componentId, sessionId, userId = null }) =>
        service.recordTemplateView({ itemId: componentId, sessionId, userId }),
    };
  })();

const templateService = createTemplateViewsService();
const componentService = createComponentViewsService();
export const listTemplateViewCounts = templateService.listTemplateViewCounts;
export const recordTemplateView = templateService.recordTemplateView;
export const listComponentViewCounts = componentService.listComponentViewCounts;
export const recordComponentView = componentService.recordComponentView;

export const templateViewsService = {
  listTemplateViewCounts,
  recordTemplateView,
  listComponentViewCounts,
  recordComponentView,
  isValidTemplateId,
  isValidViewSessionId,
  createTemplateViewsService,
  createComponentViewsService,
};

export default templateViewsService;
