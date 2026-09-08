import mongoService from './mongoService.js';

const COLLECTIONS_COLLECTION = 'collections';
const FAVORITES_COLLECTION = 'favorites';

export const FREE_VAULT_LIMIT = 5;

/**
 * Builds the stable _id for a user's collection.
 * @param {string} userId
 * @param {string} collectionId
 */
const collectionKey = (userId, collectionId) => `${userId}_${collectionId}`;

const toCollection = (doc) => {
  if (!doc) return null;
  return {
    id: doc.collectionId,
    name: doc.name || 'Untitled collection',
    description: doc.description || '',
    icon: doc.icon || '',
    itemCount: Array.isArray(doc.itemIds) ? doc.itemIds.length : 0,
    items: Array.isArray(doc.items) ? doc.items : [],
    createdAt: doc.createdAt ? new Date(doc.createdAt).getTime() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).getTime() : null,
  };
};

/**
 * Lists a user's collections, newest first.
 * @param {string} userId
 */
export const listCollections = async (userId) => {
  return mongoService.executeWithRetry(async (db) => {
    const collections = db.collection(COLLECTIONS_COLLECTION);
    const docs = await collections.find({ userId }).sort({ updatedAt: -1 }).toArray();
    return docs.map(toCollection);
  });
};

/**
 * Gets a single collection (with items) by user + collectionId.
 * @param {string} userId
 * @param {string} collectionId
 */
export const getCollection = async (userId, collectionId) => {
  return mongoService.executeWithRetry(async (db) => {
    const collections = db.collection(COLLECTIONS_COLLECTION);
    const doc = await collections.findOne({ _id: collectionKey(userId, collectionId) });
    return toCollection(doc);
  });
};

/**
 * Counts a user's total saved items across favorites AND collections, so the
 * free-tier vault limit applies globally (favorites + collection membership).
 * @param {string} userId
 */
const countTotalSavedItems = async (db, userId) => {
  const favoriteCount = await db.collection(FAVORITES_COLLECTION).countDocuments({ userId });
  const collections = db.collection(COLLECTIONS_COLLECTION);
  const docs = await collections.find({ userId }, { projection: { itemIds: 1 } }).toArray();
  const collectionItemIds = new Set();
  for (const doc of docs) {
    if (Array.isArray(doc.itemIds)) {
      for (const id of doc.itemIds) collectionItemIds.add(id);
    }
  }
  return favoriteCount + collectionItemIds.size;
};

/**
 * Creates a collection for a user.
 * @param {string} userId
 * @param {object} input { name, description?, icon? }
 * @returns {Promise<{ ok: boolean, collection?: object, error?: string }>}
 */
export const createCollection = async (userId, { name, description, icon } = {}) => {
  return mongoService.executeWithRetry(async (db) => {
    if (!userId) return { ok: false, error: 'Authentication required' };
    const cleanName = String(name || '').trim();
    if (!cleanName) return { ok: false, error: 'Collection name is required' };

    const collectionId =
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || `collection-${Date.now()}`;

    const now = new Date();
    const doc = {
      _id: collectionKey(userId, collectionId),
      userId,
      collectionId,
      name: cleanName.slice(0, 80),
      description: String(description || '').slice(0, 300),
      icon: String(icon || '').slice(0, 20),
      itemIds: [],
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(COLLECTIONS_COLLECTION).updateOne(
      { _id: doc._id },
      { $setOnInsert: doc },
      { upsert: true }
    );

    return { ok: true, collection: toCollection(doc) };
  });
};

/**
 * Updates a collection's metadata.
 * @param {string} userId
 * @param {string} collectionId
 * @param {object} input { name?, description?, icon? }
 */
export const updateCollection = async (userId, collectionId, { name, description, icon } = {}) => {
  return mongoService.executeWithRetry(async (db) => {
    const key = collectionKey(userId, collectionId);
    const setFields = { updatedAt: new Date() };
    if (name !== undefined) setFields.name = String(name).trim().slice(0, 80);
    if (description !== undefined) setFields.description = String(description).slice(0, 300);
    if (icon !== undefined) setFields.icon = String(icon).slice(0, 20);

    const result = await db.collection(COLLECTIONS_COLLECTION).updateOne(
      { _id: key, userId },
      { $set: setFields }
    );

    if (result.matchedCount === 0) return { ok: false, error: 'Collection not found' };
    return { ok: true };
  });
};

/**
 * Deletes a collection and removes its item membership.
 * @param {string} userId
 * @param {string} collectionId
 */
export const deleteCollection = async (userId, collectionId) => {
  return mongoService.executeWithRetry(async (db) => {
    const key = collectionKey(userId, collectionId);
    const result = await db.collection(COLLECTIONS_COLLECTION).deleteOne({ _id: key, userId });
    return { ok: result.deletedCount > 0 };
  });
};

/**
 * Adds a component to a collection (respects the global free-tier vault limit).
 * @param {string} userId
 * @param {string} collectionId
 * @param {object} item { componentId, title, category, code }
 * @returns {Promise<{ ok: boolean, overLimit: boolean, error?: string }>}
 */
export const addToCollection = async (userId, collectionId, { componentId, title, category, code } = {}) => {
  return mongoService.executeWithRetry(async (db) => {
    const key = collectionKey(userId, collectionId);
    const collection = db.collection(COLLECTIONS_COLLECTION);
    const existing = await collection.findOne({ _id: key, userId });
    if (!existing) return { ok: false, overLimit: false, error: 'Collection not found' };

    if (!Array.isArray(existing.itemIds)) existing.itemIds = [];
    if (existing.itemIds.includes(componentId)) {
      return { ok: true, overLimit: false };
    }

    const total = await countTotalSavedItems(db, userId);
    if (total >= FREE_VAULT_LIMIT) {
      return { ok: false, overLimit: true };
    }

    const item = {
      componentId,
      title: String(title || 'Untitled').slice(0, 120),
      category: String(category || 'custom').slice(0, 40),
      code: String(code || ''),
      addedAt: new Date(),
    };

    await collection.updateOne(
      { _id: key, userId },
      {
        $addToSet: { itemIds: componentId },
        $push: { items: item },
        $set: { updatedAt: new Date() },
      }
    );

    return { ok: true, overLimit: false };
  });
};

/**
 * Removes a component from a collection.
 * @param {string} userId
 * @param {string} collectionId
 * @param {string} componentId
 */
export const removeFromCollection = async (userId, collectionId, componentId) => {
  return mongoService.executeWithRetry(async (db) => {
    const key = collectionKey(userId, collectionId);
    const result = await db.collection(COLLECTIONS_COLLECTION).updateOne(
      { _id: key, userId },
      {
        $pull: { itemIds: componentId, items: { componentId } },
        $set: { updatedAt: new Date() },
      }
    );
    return { ok: true, modified: result.modifiedCount > 0 };
  });
};

export const collectionsService = {
  listCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection,
  FREE_VAULT_LIMIT,
};
