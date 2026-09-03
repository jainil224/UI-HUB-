import { getCollection, executeWithRetry } from './mongoService.js';

const FAVORITES_COLLECTION = 'favorites';
const COMPONENTS_COLLECTION = 'components';
const FREE_VAULT_LIMIT = 5;

const toComponentItem = (doc) => {
  return {
    id: String(doc._id),
    title: doc.componentName || doc.title || 'Untitled',
    componentName: doc.componentName || doc.title || 'Untitled',
    description: doc.description || 'Community contributed component',
    category: doc.category || 'custom',
    code: doc.code || '// No code available',
    isPremium: false,
    vibePrompt: doc.vibePrompt || doc.description || '',
    uploader: doc.uploaderName || doc.uploader || 'Anonymous',
    createdAt: doc.createdAt ? new Date(doc.createdAt).getTime() : null,
  };
};

/**
 * Lists community-submitted components, newest first.
 * @returns {Promise<Array<object>>}
 */
export const listCommunityComponents = async () => {
  return executeWithRetry(async (db) => {
    const components = db.collection(COMPONENTS_COLLECTION);
    const docs = await components.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(toComponentItem);
  });
};

/**
 * Fetches a single community component by id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const getCommunityComponent = async (id) => {
  return executeWithRetry(async (db) => {
    const components = db.collection(COMPONENTS_COLLECTION);
    const doc = await components.findOne({ _id: String(id) });
    return doc ? toComponentItem(doc) : null;
  });
};

/**
 * Lists a user's favorites by user id (or email).
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
export const listUserFavorites = async (userId) => {
  return executeWithRetry(async (db) => {
    const favorites = db.collection(FAVORITES_COLLECTION);
    const docs = await favorites
      .find({ $or: [{ userId }, { email: userId }] })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((doc) => ({
      id: String(doc._id),
      ...doc,
      id: String(doc._id),
    }));
  });
};

/**
 * Adds a component to a user's favorites.
 * @param {string} userId
 * @param {object} component { id, title, category, code }
 * @returns {Promise<{ ok: boolean, overLimit: boolean, count: number }>}
 */
export const addFavorite = async (userId, { id, title, category, code }) => {
  return executeWithRetry(async (db) => {
    const favorites = db.collection(FAVORITES_COLLECTION);
    const favId = `${userId}_${id}`;
    const existing = await favorites.findOne({ _id: favId });
    if (existing) return { ok: true, overLimit: false, count: (await favorites.countDocuments({ userId })) };

    const count = await favorites.countDocuments({ userId });
    if (count >= FREE_VAULT_LIMIT) {
      return { ok: false, overLimit: true, count };
    }

    await favorites.updateOne(
      { _id: favId },
      {
        $set: {
          _id: favId,
          userId,
          componentId: id,
          componentName: title || 'Untitled',
          componentCode: code || '',
          category: category || 'custom',
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return { ok: true, overLimit: false, count: (await favorites.countDocuments({ userId })) };
  });
};

/**
 * Removes a component from a user's favorites.
 * @param {string} userId
 * @param {string} componentId
 * @returns {Promise<boolean>}
 */
export const removeFavorite = async (userId, componentId) => {
  return executeWithRetry(async (db) => {
    const favorites = db.collection(FAVORITES_COLLECTION);
    const favId = `${userId}_${componentId}`;
    const result = await favorites.deleteOne({ _id: favId, userId });
    return result.deletedCount > 0;
  });
};
