import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { templateViewLimiter } from '../middleware/rateLimiters.js';
import { isMongoConnected } from '../services/mongoService.js';
import {
  isValidTemplateId,
  isValidViewSessionId,
  listTemplateViewCounts,
  recordTemplateView,
} from '../services/templateViewsService.js';

const router = express.Router();

const dbUnavailable = (res) =>
  res.status(503).json({
    error: 'DATABASE_UNAVAILABLE',
    message: 'View counts are temporarily unavailable.',
  });

const optionalFirebaseAuth = (req, res, next) => {
  if (!req.headers.authorization) return next();
  return verifyToken(req, res, next);
};

router.get('/views', templateViewLimiter, async (req, res) => {
  const rawIds = req.query.ids;
  if (typeof rawIds !== 'string') {
    return res.status(400).json({ error: 'INVALID_TEMPLATE_IDS' });
  }

  const templateIds = [...new Set(rawIds.split(',').filter(Boolean))];
  if (
    templateIds.length > 200 ||
    templateIds.some((templateId) => !isValidTemplateId(templateId))
  ) {
    return res.status(400).json({ error: 'INVALID_TEMPLATE_IDS' });
  }

  try {
    const counts = await listTemplateViewCounts(templateIds);
    return res.json({ counts });
  } catch (error) {
    console.error('[TemplateViews] Count query failed:', error?.message || error);
    if (!isMongoConnected()) return dbUnavailable(res);
    return res.status(500).json({ error: 'FAILED_TO_LOAD_TEMPLATE_VIEWS' });
  }
});

router.post('/views', templateViewLimiter, optionalFirebaseAuth, async (req, res) => {
  const { templateId, sessionId } = req.body || {};
  if (!isValidTemplateId(templateId)) {
    return res.status(400).json({ error: 'INVALID_TEMPLATE_ID' });
  }
  if (!isValidViewSessionId(sessionId)) {
    return res.status(400).json({ error: 'INVALID_SESSION_ID' });
  }

  try {
    const result = await recordTemplateView({
      templateId,
      sessionId,
      userId: req.user?.uid || null,
    });
    return res.json(result);
  } catch (error) {
    console.error('[TemplateViews] Record failed:', error?.message || error);
    if (!isMongoConnected()) return dbUnavailable(res);
    return res.status(500).json({ error: 'FAILED_TO_RECORD_TEMPLATE_VIEW' });
  }
});

export default router;
