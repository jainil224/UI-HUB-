import { getCollection } from './mongoService.js';

const COLLECTION = 'template_views';
const TEMPLATE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidTemplateId = (value) =>
  typeof value === 'string' && value.length <= 100 && TEMPLATE_ID_PATTERN.test(value);

export const isValidViewSessionId = (value) =>
  typeof value === 'string' && SESSION_ID_PATTERN.test(value);

export const createTemplateViewsService = (getCollectionForService = getCollection) => {
  let indexesReady = null;

  const ensureIndexes = async (views) => {
    if (!indexesReady) {
      indexesReady = Promise.all([
        views.createIndex(
          { templateId: 1, sessionId: 1 },
          { unique: true, name: 'template_session_unique' },
        ),
        views.createIndex(
          { createdAt: -1, templateId: 1 },
          { name: 'created_at_template' },
        ),
      ]).catch((error) => {
        indexesReady = null;
        throw error;
      });
    }
    await indexesReady;
  };

  const listTemplateViewCounts = async (templateIds) => {
    const views = await getCollectionForService(COLLECTION);
    await ensureIndexes(views);

    const counts = Object.fromEntries(templateIds.map((templateId) => [templateId, 0]));
    if (templateIds.length === 0) return counts;

    const groupedCounts = await views.aggregate([
      { $match: { templateId: { $in: templateIds } } },
      { $group: { _id: '$templateId', views: { $sum: 1 } } },
    ]).toArray();

    for (const result of groupedCounts) {
      counts[result._id] = result.views;
    }
    return counts;
  };

  const recordTemplateView = async ({ templateId, sessionId, userId = null }) => {
    const views = await getCollectionForService(COLLECTION);
    await ensureIndexes(views);

    let viewRecorded = true;
    try {
      await views.insertOne({
        templateId,
        sessionId,
        userId,
        createdAt: new Date(),
      });
    } catch (error) {
      if (error?.code !== 11000) throw error;
      viewRecorded = false;
    }

    const count = await views.countDocuments({ templateId });
    return { templateId, viewRecorded, views: count };
  };

  return { listTemplateViewCounts, recordTemplateView };
};

const service = createTemplateViewsService();
export const listTemplateViewCounts = service.listTemplateViewCounts;
export const recordTemplateView = service.recordTemplateView;

export const templateViewsService = {
  listTemplateViewCounts,
  recordTemplateView,
  isValidTemplateId,
  isValidViewSessionId,
  createTemplateViewsService,
};

export default templateViewsService;
