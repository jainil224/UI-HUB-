import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { generateVibePrompt, getComponentSource } from '../services/promptService.js';
import { evaluateAiCreditUse, PREMIUM_AI_TOOLS } from '../services/userService.js';
import { logActivity } from '../services/activityLogService.js';
import { syncAllComponentsToMongo, inferCategory, formatTitle } from '../services/componentSyncService.js';
import { getCollection } from '../services/mongoService.js';
import { resolveComponentMeta, canAccessComponent } from '../services/accessService.js';
import { sourceLimiter } from '../middleware/rateLimiters.js';

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
 * Access control for premium AI tools (advance/antigravity/claude).
 *
 * Credit consumption now happens at copy time through POST /api/v1/prompts/consume
 * so it covers templates, sections and components with one authoritative gate.
 * This endpoint only guards who may *see* a premium prompt at all: the tools are
 * Pro+ and a free account cannot unlock them by spending daily credits. Users who
 * bought this single component outright keep unlimited premium-tool access.
 */
const enforcePremiumToolAccess = async (req, res, system) => {
  const { id } = req.params;
  const user = req.user;

  // 1. Premium tools require an authenticated user.
  if (!user) {
    res.status(403).json({ error: 'Authentication required for premium AI prompts.', code: 'AUTH_REQUIRED' });
    return false;
  }

  const email = user.email;
  const uid = user.uid;

  // 2. A single-component purchase unlocks its premium prompts permanently.
  try {
    const meta = await resolveComponentMeta(id);
    const access = await canAccessComponent(req.user, meta);
    if (access.allowed && access.tier === 'bundle') {
      const prompt = await generateVibePrompt(id, system);
      logActivity({
        type: 'ai.prompt_generated',
        userId: req.user?.uid,
        email: req.user?.email,
        level: 'info',
        metadata: { componentId: id, system, tier: 'bundle' },
      });
      res.json({ prompt, consumed: false, trialsRemaining: -1, expiresAt: null });
      return false;
    }
  } catch (e) {
    console.error('[Prompt] Entitlement check failed:', e.message);
  }

  // 3. Free users can never copy Advance / Antigravity / Claude prompts.
  let tier = 'free';
  try {
    tier = (await evaluateAiCreditUse(uid, email)).tier || 'free';
  } catch (e) {
    console.error('[Prompt] Tier evaluation failed:', e.message);
  }
  if (tier === 'free') {
    logActivity({
      type: 'ai.prompt_denied',
      userId: req.user?.uid,
      email: req.user?.email,
      level: 'warn',
      metadata: { componentId: id, system, reason: 'TOOL_LOCKED' },
    });
    res.status(403).json({
      error: 'This AI prompt tool is available on Pro and above.',
      code: 'PROMPT_TOOL_LOCKED',
    });
    return false;
  }

  // 4. Serve the prompt. Copy-time credit consumption is handled centrally.
  const prompt = await generateVibePrompt(id, system);
  logActivity({
    type: 'ai.prompt_generated',
    userId: user?.uid,
    email: user?.email,
    level: 'info',
    metadata: { componentId: id, system, tier },
  });
  res.json({ prompt, consumed: false, trialsRemaining: -1, expiresAt: null });
  return false;
};

router.get('/:id/prompt/:system', optionalVerifyToken, async (req, res) => {
  const { id, system } = req.params;

  try {
    // Premium components embed the full source in every vibe prompt, so the
    // same entitlement as /source is required before ANY prompt is served —
    // regardless of which AI tool is requested. Free components short-circuit
    // to allowed=true inside canAccessComponent.
    const meta = await resolveComponentMeta(id);
    const access = await canAccessComponent(req.user, meta);
    if (!access.allowed) {
      logActivity({
        type: 'ai.prompt_denied',
        userId: req.user?.uid,
        email: req.user?.email,
        level: 'warn',
        metadata: { componentId: id, system, reason: access.reason, tier: access.tier },
      });
      return res.status(403).json({
        error: 'Premium component. Upgrade to Pro or purchase this component to access its prompts.',
        code: access.reason === 'AUTH_REQUIRED' ? 'AUTH_REQUIRED' : 'PREMIUM_REQUIRED',
        reason: access.reason,
      });
    }

    if (isPremiumTool(system)) {
      // Always sends a response (prompt served, or 403).
      await enforcePremiumToolAccess(req, res, system);
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
 * Protected by Firebase ID Token. Premium components are additionally gated
 * by the user's plan/entitlements (accessService.canAccessComponent).
 */
router.get('/:id/source', verifyToken, sourceLimiter, async (req, res) => {
  const { id } = req.params;

  try {
    // Resolve premium metadata + enforce entitlements BEFORE serving source.
    const meta = await resolveComponentMeta(id);
    const access = await canAccessComponent(req.user, meta);

    if (!access.allowed) {
      logActivity({
        type: 'component.source_denied',
        userId: req.user?.uid,
        email: req.user?.email,
        level: 'warn',
        metadata: { componentId: id, reason: access.reason, tier: access.tier },
      });
      return res.status(403).json({
        error: 'Premium component. Upgrade to Pro to access the full source code.',
        code: access.reason === 'AUTH_REQUIRED' ? 'AUTH_REQUIRED' : 'PREMIUM_REQUIRED',
        reason: access.reason,
      });
    }

    const source = await getComponentSource(id);
    if (!source) {
      return res.status(404).json({ error: 'Source code not found' });
    }
    logActivity({
      type: 'component.source_fetch',
      userId: req.user?.uid,
      email: req.user?.email,
      level: 'info',
      metadata: { componentId: id, tier: access.tier },
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
