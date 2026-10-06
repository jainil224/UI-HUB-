import { getCollection } from './mongoService.js';

const COLLECTION = 'template_views';
const COMPONENT_COLLECTION = 'component_views';
const TEMPLATE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SOURCE = '[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const SESSION_ID_PATTERN = new RegExp(`^${UUID_SOURCE}$`, 'i');
// An anonymous visitor is `a:<uuid>`, an account is `u:<firebase uid>`. The
// server mints the `u:` form from a verified token, so the prefix is the
// authority marker and the browser can only ever supply the `a:` form.
const VIEWER_ID_PATTERN = new RegExp(`^(?:u:[A-Za-z0-9_-]{6,128}|a:${UUID_SOURCE})$`, 'i');

export const isValidTemplateId = (value) =>
  typeof value === 'string' && value.length <= 100 && TEMPLATE_ID_PATTERN.test(value);

export const isValidViewSessionId = (value) =>
  typeof value === 'string' && SESSION_ID_PATTERN.test(value);

export const isValidViewViewerId = (value) =>
  typeof value === 'string' && value.length <= 160 && VIEWER_ID_PATTERN.test(value);

const createViewCollectionService = (
  collectionName,
  idField,
  indexNames,
  getCollectionForService,
) => {
  let indexesReady = null;

  const ensureIndexes = async (views) => {
    if (!indexesReady) {
      indexesReady = (async () => {
        const uniqueKeys = { [idField]: 1, sessionId: 1 };
        const viewerKeys = { [idField]: 1, viewerId: 1 };
        const recentKeys = { createdAt: -1, [idField]: 1 };
        // MongoDB >= ~7 throws NamespaceNotFound here when the collection has
        // never been created, so treat that as "no indexes" and let the
        // createIndex calls below create the collection implicitly.
        let existingIndexes = [];
        try {
          existingIndexes = await views.indexes();
        } catch (error) {
          if (error?.codeName !== 'NamespaceNotFound') throw error;
        }
        const hasIndex = (keys, requireUnique = false) => existingIndexes.some((index) => (
          Object.keys(index.key || {}).length === Object.keys(keys).length &&
          Object.entries(keys).every(([key, direction]) => index.key[key] === direction) &&
          (!requireUnique || index.unique === true)
        ));

        if (!hasIndex(uniqueKeys, true)) {
          await views.createIndex(uniqueKeys, { unique: true, name: indexNames.unique });
        }

        // One view per visitor per item, for good. The index is PARTIAL so that
        // events recorded before viewers existed — which have no `viewerId` — are
        // exempt. That makes the migration free: no backfill, no rewrite, and the
        // session index above keeps those legacy events valid meanwhile.
        const hasViewerIndex = existingIndexes.some((index) => (
          index.unique === true &&
          index.partialFilterExpression?.viewerId?.$type === 'string' &&
          Object.keys(index.key || {}).length === 2 &&
          index.key[idField] === 1 &&
          index.key.viewerId === 1
        ));
        if (!hasViewerIndex) {
          await views.createIndex(viewerKeys, {
            unique: true,
            name: indexNames.viewer,
            partialFilterExpression: { viewerId: { $type: 'string' } },
          });
        }

        if (!hasIndex(recentKeys)) {
          await views.createIndex(recentKeys, { name: indexNames.createdAt });
        }
      })().catch((error) => {
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

  const recordTemplateView = async ({ itemId, sessionId, viewerId, userId = null }) => {
    const views = await getCollectionForService(collectionName);
    await ensureIndexes(views);

    // A signed-in viewer is identified by their account, never by an id the
    // browser supplied. `viewerId` may be absent while an older frontend is still
    // deployed; that request keeps the legacy per-session behaviour.
    const resolvedViewerId = userId ? `u:${userId}` : viewerId;

    // Someone who viewed anonymously and then signed in is the same person, so
    // re-key their existing event onto the account instead of adding a second
    // one. Re-keying does not change the event count, so the number stays put.
    if (userId && viewerId) {
      try {
        await views.updateOne(
          { [idField]: itemId, viewerId },
          { $set: { viewerId: resolvedViewerId, userId, claimedAt: new Date() } },
        );
      } catch (error) {
        // 11000 means the account already owns an event here, so there is
        // nothing to merge. Let the insert below report the duplicate.
        if (error?.code !== 11000) throw error;
      }
    }

    let viewRecorded = true;
    try {
      await views.insertOne({
        [idField]: itemId,
        viewerId: resolvedViewerId,
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
      {
        unique: 'template_session_unique',
        viewer: 'template_viewer_unique',
        createdAt: 'created_at_template',
      },
      getCollectionForService,
    );
    return {
      listTemplateViewCounts: service.listTemplateViewCounts,
      recordTemplateView: ({ templateId, sessionId, viewerId, userId = null }) =>
        service.recordTemplateView({ itemId: templateId, sessionId, viewerId, userId }),
    };
  })();
export const createComponentViewsService = (getCollectionForService = getCollection) =>
  (() => {
    const service = createViewCollectionService(
      COMPONENT_COLLECTION,
      'componentId',
      {
        unique: 'componentId_session_unique',
        viewer: 'componentId_viewer_unique',
        createdAt: 'created_at_componentId',
      },
      getCollectionForService,
    );
    return {
      listComponentViewCounts: service.listTemplateViewCounts,
      recordComponentView: ({ componentId, sessionId, viewerId, userId = null }) =>
        service.recordTemplateView({ itemId: componentId, sessionId, viewerId, userId }),
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
  isValidViewViewerId,
  createTemplateViewsService,
  createComponentViewsService,
};

export default templateViewsService;
