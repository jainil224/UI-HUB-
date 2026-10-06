import express from 'express';
import { verifyOptionalToken } from '../middleware/auth.js';
import { templateViewLimiter } from '../middleware/rateLimiters.js';
import { isMongoConnected } from '../services/mongoService.js';
import {
  isValidTemplateId,
  isValidViewSessionId,
  isValidViewViewerId,
  listTemplateViewCounts,
  recordTemplateView,
  listComponentViewCounts,
  recordComponentView,
} from '../services/templateViewsService.js';

const router = express.Router();

const dbUnavailable = (res) =>
  res.status(503).json({
    error: 'DATABASE_UNAVAILABLE',
    message: 'View counts are temporarily unavailable.',
  });

router.get('/views', templateViewLimiter, async (req, res) => {
  const type = req.query.type === undefined ? 'template' : req.query.type;
  if (type !== 'template' && type !== 'component') {
    return res.status(400).json({ error: 'INVALID_VIEW_TYPE' });
  }
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
    const counts = type === 'component'
      ? await listComponentViewCounts(templateIds)
      : await listTemplateViewCounts(templateIds);
    return res.json({ counts });
  } catch (error) {
    console.error('[TemplateViews] Count query failed:', error?.message || error);
    if (!isMongoConnected()) return dbUnavailable(res);
    return res.status(500).json({ error: 'FAILED_TO_LOAD_TEMPLATE_VIEWS' });
  }
});

router.post('/views', templateViewLimiter, verifyOptionalToken, async (req, res) => {
  const { type = 'template', templateId, componentId, sessionId, viewerId } = req.body || {};
  if (type !== 'template' && type !== 'component') {
    return res.status(400).json({ error: 'INVALID_VIEW_TYPE' });
  }
  const itemId = type === 'component' ? componentId : templateId;
  if (!isValidTemplateId(itemId)) {
    return res.status(400).json({ error: type === 'component' ? 'INVALID_COMPONENT_ID' : 'INVALID_TEMPLATE_ID' });
  }
  if (!isValidViewSessionId(sessionId)) {
    return res.status(400).json({ error: 'INVALID_SESSION_ID' });
  }
  // Optional: a client deployed before per-visitor counting omits it and keeps
  // the legacy per-session behaviour. A malformed value is still rejected.
  if (viewerId !== undefined && !isValidViewViewerId(viewerId)) {
    return res.status(400).json({ error: 'INVALID_VIEWER_ID' });
  }

  try {
    const result = type === 'component'
      ? await recordComponentView({
          componentId: itemId,
          sessionId,
          viewerId,
          userId: req.user?.uid || null,
        })
      : await recordTemplateView({
          templateId: itemId,
          sessionId,
          viewerId,
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
