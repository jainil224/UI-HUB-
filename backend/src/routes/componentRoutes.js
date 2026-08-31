import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { generateVibePrompt, getComponentSource } from '../services/promptService.js';
import { checkProStatus, checkEliteStatus, evaluateAiTrial, recordPremiumTrialUse, PREMIUM_AI_TOOLS } from '../services/userService.js';
import { logActivity } from '../services/activityLogService.js';
import { syncAllComponentsToMongo, inferCategory, formatTitle } from '../services/componentSyncService.js';
import { getCollection } from '../services/mongoService.js';

const router = express.Router();

/**
 * Endpoint to get the AI prompt for a component.
 * Protected by Firebase ID Token.
 */
// Middleware to optionally verify token
const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continue without user
  }
  return verifyToken(req, res, (err) => {
    // Continue even if token verification fails so prompts remain testable
    next();
  });
};

const isPremiumTool = (system) => PREMIUM_AI_TOOLS.includes(system);

/**
 * Enforcement for premium AI tools (advance/antigravity/claude).
 * Non-pro users get MAX_FREE_AI_TRIALS (2) uses within a 24h window from first use.
 * Returns { status, data } or null to fall through to serving the prompt.
 */
const enforcePremiumTrial = async (req, res, system) => {
  const { id } = req.params;
  const user = req.user;

  // 1. Premium tools require an authenticated user.
  if (!user) {
    res.status(403).json({ error: 'Authentication required for premium AI prompts.', code: 'AUTH_REQUIRED' });
    return false;
  }

  const email = user.email;
  const uid = user.uid;

  // 2. Pro/Elite users are unlimited.
  let isPro = false;
  try {
    isPro = (await checkProStatus(email)) || (await checkEliteStatus(email));
  } catch (e) {
    console.error('[Prompt] Pro status check failed:', e.message);
  }
  if (isPro) {
    const prompt = await generateVibePrompt(id, system);
    return res.json({ prompt, consumed: false, trialsRemaining: -1, expiresAt: null });
  }

  // 3. Evaluate trial state for non-pro users.
  let trial;
  try {
    trial = await evaluateAiTrial(uid, email);
  } catch (e) {
    console.error('[Prompt] Trial evaluation failed:', e.message);
    trial = { allowed: false, reason: 'EXPIRY', remaining: 0, expiresAt: null };
  }

  if (!trial.allowed) {
    res.status(403).json({
      error: 'Your free Premium AI trial has ended. Upgrade to Pro for unlimited elite prompts.',
      code: 'TRIAL_LIMIT',
      reason: trial.reason || 'COUNT',
      remaining: trial.remaining,
      expiresAt: trial.expiresAt,
    });
    return false;
  }

  // 4. Allowed — record this use (increments count, sets 24h clock on first use).
  let recorded = trial;
  try {
    recorded = await recordPremiumTrialUse(uid, email);
  } catch (e) {
    console.error('[Prompt] Recording trial use failed:', e.message);
  }

  const prompt = await generateVibePrompt(id, system);
  logActivity({
    type: 'ai.prompt_generated',
    userId: user?.uid,
    email: user?.email,
    level: 'info',
    metadata: { componentId: id, system, tier: isPro ? 'pro' : 'trial' },
  });
  return res.json({
    prompt,
    consumed: true,
    trialsRemaining: recorded.remaining,
    expiresAt: recorded.expiresAt,
  });
};

router.get('/:id/prompt/:system', optionalVerifyToken, async (req, res) => {
  const { id, system } = req.params;

  try {
    if (isPremiumTool(system)) {
      // enforcePremiumTrial always sends a response (prompt consumed, or 403).
      await enforcePremiumTrial(req, res, system);
      return;
    }

    const prompt = await generateVibePrompt(id, system);
    logActivity({
      type: 'ai.prompt_generated',
      userId: req.user?.uid,
      email: req.user?.email,
      level: 'info',
      metadata: { componentId: id, system, tool: 'free' },
    });
    res.json({ prompt });
  } catch (error) {
    console.error(`Error generating prompt for ${id}:`, error);
    res.status(500).json({ error: 'Failed to generate prompt' });
  }
});

/**
 * Endpoint to get the source code for a component.
 * Protected by Firebase ID Token.
 */
router.get('/:id/source', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const source = await getComponentSource(id);
    if (!source) {
      return res.status(404).json({ error: 'Source code not found' });
    }
    logActivity({
      type: 'component.source_fetch',
      userId: req.user?.uid,
      email: req.user?.email,
      level: 'info',
      metadata: { componentId: id },
    });
    res.json({ source });
  } catch (error) {
    console.error(`Error getting source for ${id}:`, error);
    res.status(500).json({ error: 'Failed to get source code' });
  }
});

/**
 * @route POST /api/v1/components/sync
 * @desc Synchronize all website components into MongoDB Atlas
 * @access Public (safe upsert, non-destructive)
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await syncAllComponentsToMongo();
    res.json(result);
  } catch (error) {
    console.error('[ComponentSyncRoute] Sync failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/v1/components
 * @desc Upsert a new or updated component into MongoDB Atlas
 * @access Public / Authenticated
 */
router.post('/', async (req, res) => {
  try {
    const { id, title, category, code, isPro = false, vibePrompt = '', framework = 'react', styling = 'tailwind', tags } = req.body || {};

    if (!id) {
      return res.status(400).json({ success: false, error: 'Component ID is required.' });
    }

    const cleanId = String(id).trim().toLowerCase();
    const finalCategory = category || inferCategory(cleanId);
    const finalTitle = title || formatTitle(cleanId);
    const finalTags = Array.isArray(tags) && tags.length > 0
      ? tags
      : [finalCategory, isPro ? 'pro' : 'free', 'react', 'tailwind', ...cleanId.split('-')];

    const col = await getCollection('components');
    const now = new Date();

    await col.updateOne(
      { _id: cleanId },
      {
        $set: {
          _id: cleanId,
          title: finalTitle,
          category: finalCategory,
          framework,
          styling,
          isPro: Boolean(isPro),
          code: typeof code === 'string' ? { react: code } : (code || {}),
          vibePrompt: vibePrompt || '',
          tags: finalTags,
          updatedAt: now,
        },
        $setOnInsert: {
          viewsCount: 0,
          copyCount: 0,
          createdAt: now,
        },
      },
      { upsert: true }
    );

    await logActivity({
      type: 'component.registered',
      level: 'info',
      metadata: {
        componentId: cleanId,
        title: finalTitle,
        category: finalCategory,
        isPro: Boolean(isPro),
      },
    });

    res.json({
      success: true,
      message: `Component "${cleanId}" successfully updated in MongoDB.`,
      component: {
        _id: cleanId,
        title: finalTitle,
        category: finalCategory,
        isPro: Boolean(isPro),
      },
    });
  } catch (error) {
    console.error('[RegisterComponent] Error updating component in MongoDB:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/v1/components/db
 * @desc Get summary of components stored in MongoDB Atlas
 */
router.get('/db', async (req, res) => {
  try {
    const col = await getCollection('components');
    const total = await col.countDocuments();
    const items = await col.find({}, { projection: { _id: 1, title: 1, category: 1, isPro: 1, updatedAt: 1 } }).toArray();
    res.json({ total, components: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
