import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  listUserFavorites,
  addFavorite,
  removeFavorite,
  listCommunityComponents,
  getCommunityComponent,
} from '../services/favoritesService.js';

const router = express.Router();

// ── Favorites (requires Firebase auth) ───────────────────────────────────────

router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid || '';
    const favorites = await listUserFavorites(userId);
    res.json({ favorites });
  } catch (error) {
    console.error('[Favorites] List error:', error);
    res.status(500).json({ error: 'Failed to load favorites' });
  }
});

router.post('/favorites', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid || '';
    const { id, title, category, code } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Component id is required' });
    }
    const result = await addFavorite(userId, { id, title, category, code });
    if (!result.ok && result.overLimit) {
      return res.status(403).json({ error: 'VAULT_LIMIT', message: 'Free members can save up to 5 components. Upgrade to Pro for unlimited storage.' });
    }
    res.status(201).json({ ok: true, favorites: await listUserFavorites(userId) });
  } catch (error) {
    console.error('[Favorites] Add error:', error);
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

router.delete('/favorites/:componentId', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid || '';
    const { componentId } = req.params;
    await removeFavorite(userId, componentId);
    res.json({ ok: true, favorites: await listUserFavorites(userId) });
  } catch (error) {
    console.error('[Favorites] Remove error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// ── Community components (public reads) ─────────────────────────────────────

router.get('/components/community', async (req, res) => {
  try {
    const components = await listCommunityComponents();
    res.json({ components });
  } catch (error) {
    console.error('[Components] List error:', error);
    res.status(500).json({ error: 'Failed to load components' });
  }
});

router.get('/components/community/:id', async (req, res) => {
  try {
    const component = await getCommunityComponent(req.params.id);
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    res.json({ component });
  } catch (error) {
    console.error('[Components] Get error:', error);
    res.status(500).json({ error: 'Failed to load component' });
  }
});

export default router;
