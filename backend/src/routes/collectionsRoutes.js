import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { isMongoConnected } from '../services/mongoService.js';
import {
  listCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection,
} from '../services/collectionsService.js';
import { logActivity } from '../services/activityLogService.js';

const router = express.Router();

const dbUnavailable = (res) =>
  res.status(503).json({ error: 'DATABASE_UNAVAILABLE', message: 'Storage service is temporarily unavailable. Please try again.' });

const userIdOf = (req) => req.user?.uid || '';

// ── Collections (requires Firebase auth) ────────────────────────────────────

router.get('/collections', verifyToken, async (req, res) => {
  try {
    const collections = await listCollections(userIdOf(req));
    res.json({ collections });
  } catch (error) {
    console.error('[Collections] List error:', error);
    if (!isMongoConnected()) return dbUnavailable(res);
    res.status(500).json({ error: 'Failed to load collections' });
  }
});

router.get('/collections/:collectionId', verifyToken, async (req, res) => {
  try {
    const collection = await getCollection(userIdOf(req), req.params.collectionId);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json({ collection });
  } catch (error) {
    console.error('[Collections] Get error:', error);
    if (!isMongoConnected()) return dbUnavailable(res);
    res.status(500).json({ error: 'Failed to load collection' });
  }
});

router.post('/collections', verifyToken, async (req, res) => {
  try {
    const { name, description, icon } = req.body || {};
    const result = await createCollection(userIdOf(req), { name, description, icon });
    if (!result.ok) {
      return res.status(400).json({ error: 'INVALID_COLLECTION', message: result.error || 'Could not create collection' });
    }
    logActivity({
      type: 'collection.created',
      userId: userIdOf(req),
      email: req.user?.email,
      level: 'info',
      metadata: { collectionId: result.collection.id, name },
    });
    res.status(201).json({ ok: true, collection: result.collection });
  } catch (error) {
    console.error('[Collections] Create error:', error);
    if (!isMongoConnected()) return dbUnavailable(res);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

router.patch('/collections/:collectionId', verifyToken, async (req, res) => {
  try {
    const { name, description, icon } = req.body || {};
    const result = await updateCollection(userIdOf(req), req.params.collectionId, { name, description, icon });
    if (!result.ok) return res.status(404).json({ error: 'Collection not found' });
    logActivity({
      type: 'collection.updated',
      userId: userIdOf(req),
      email: req.user?.email,
      level: 'info',
      metadata: { collectionId: req.params.collectionId },
    });
    res.json({ ok: true });
  } catch (error) {
    console.error('[Collections] Update error:', error);
    if (!isMongoConnected()) return dbUnavailable(res);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

router.delete('/collections/:collectionId', verifyToken, async (req, res) => {
  try {
    const result = await deleteCollection(userIdOf(req), req.params.collectionId);
    if (!result.ok) return res.status(404).json({ error: 'Collection not found' });
    logActivity({
      type: 'collection.deleted',
      userId: userIdOf(req),
      email: req.user?.email,
      level: 'info',
      metadata: { collectionId: req.params.collectionId },
    });
    res.json({ ok: true });
  } catch (error) {
    console.error('[Collections] Delete error:', error);
    if (!isMongoConnected()) return dbUnavailable(res);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// ── Collection items ────────────────────────────────────────────────────────

router.post('/collections/:collectionId/items', verifyToken, async (req, res) => {
  try {
    const { id: componentId, title, category, code } = req.body || {};
    if (!componentId) {
      return res.status(400).json({ error: 'Component id is required' });
    }
    const result = await addToCollection(userIdOf(req), req.params.collectionId, {
      componentId,
      title,
      category,
      code,
    });
    if (!result.ok && result.overLimit) {
      return res.status(403).json({ error: 'VAULT_LIMIT', message: 'Free members can save up to 5 components. Upgrade to Pro for unlimited storage.' });
    }
    if (!result.ok) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    logActivity({
      type: 'collection.item_added',
      userId: userIdOf(req),
      email: req.user?.email,
      level: 'info',
      metadata: { collectionId: req.params.collectionId, componentId, title, category },
    });
    res.status(201).json({ ok: true, collection: await getCollection(userIdOf(req), req.params.collectionId) });
  } catch (error) {
    console.error('[Collections] Add item error:', error);
    if (!isMongoConnected()) return dbUnavailable(res);
    res.status(500).json({ error: 'Failed to add item to collection' });
  }
});

router.delete('/collections/:collectionId/items/:componentId', verifyToken, async (req, res) => {
  try {
    const { collectionId, componentId } = req.params;
    await removeFromCollection(userIdOf(req), collectionId, componentId);
    logActivity({
      type: 'collection.item_removed',
      userId: userIdOf(req),
      email: req.user?.email,
      level: 'info',
      metadata: { collectionId, componentId },
    });
    res.json({ ok: true, collection: await getCollection(userIdOf(req), collectionId) });
  } catch (error) {
    console.error('[Collections] Remove item error:', error);
    if (!isMongoConnected()) return dbUnavailable(res);
    res.status(500).json({ error: 'Failed to remove item from collection' });
  }
});

export default router;
