import { Router, Request, Response } from 'express';
import { apiKeyService } from '../services/apiKeyService.js';
import { firebaseService } from '../services/firebase.js';
import { analyticsService } from '../services/analyticsService.js';
import { getCollection as mongoCollection } from '../services/mongo.js';
import { verifyFirebaseToken } from '../middleware/dashboardAuth.js';
import config from '../config/env.js';
import { configService } from '../config/configService.js';

/**
 * Dashboard routes for MCP.
 * These are used by the UI HUB frontend dashboard to manage API keys.
 * Auth uses Firebase ID tokens (verifyIdToken), matching the existing website.
 */

export const dashboardRouter = Router();

const requireAdminMetrics = async (req: Request, res: Response): Promise<boolean> => {
  const { uid, email } = req as any;
  const tier = await firebaseService.getUserTier(uid, email);
  if (tier !== 'ADMIN' && tier !== 'ELITE') {
    res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' });
    return false;
  }
  (req as any).tier = tier;
  return true;
};

// GET /api/dashboard/mcp/keys — list user's API keys
dashboardRouter.get('/keys', verifyFirebaseToken, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const keys = await apiKeyService.listApiKeys(uid);
  res.json({ keys });
});

// POST /api/dashboard/mcp/keys — create a new API key (1 per 24 hours; deletion does NOT reset the limit)
dashboardRouter.post('/keys', verifyFirebaseToken, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const isAdmin = (req as any).isAdmin === true;
  const name = (req.body?.name || 'MCP Key').toString().slice(0, 100);

  // ── Daily key creation limit (skip for admins) ──────────────────────────────
  if (!isAdmin) {
    const col = await mongoCollection('mcp_api_keys');
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    // Count ALL keys created in the last 24h — including revoked/deleted ones.
    // This ensures deleting a key does NOT reset the daily creation limit.
    const recentCount = await col.countDocuments({
      user_id: uid,
      created_at: { $gte: oneDayAgo },
    });
    if (recentCount >= 1) {
      // Find the most recently created key to compute the retry-after time
      const lastKey = await col.findOne(
        { user_id: uid, created_at: { $gte: oneDayAgo } },
        { sort: { created_at: -1 } }
      );
      const retryAfterMs = lastKey ? (lastKey.created_at + 24 * 60 * 60 * 1000) - Date.now() : 0;
      const retryAfterSeconds = Math.max(0, Math.ceil(retryAfterMs / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        error: 'DAILY_KEY_LIMIT',
        message: 'You can only create 1 API key per 24 hours.',
        retryAfterMs: Math.max(0, retryAfterMs),
      });
    }
  }

  const { plaintextKey, record } = await apiKeyService.createApiKey(uid, name);
  const { key_hash, ...safeRecord } = record;

  res.status(201).json({
    key: plaintextKey,
    record: safeRecord,
  });
});

// POST /api/dashboard/mcp/keys/:id/revoke — revoke a key
dashboardRouter.post('/keys/:id/revoke', verifyFirebaseToken, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const id = req.params.id;
  const success = await apiKeyService.revokeApiKey(id, uid);
  if (!success) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'API key not found' });
  }
  res.json({ success: true });
});

// DELETE /api/dashboard/mcp/keys/:id — delete a key
dashboardRouter.delete('/keys/:id', verifyFirebaseToken, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const id = req.params.id;
  const success = await apiKeyService.deleteApiKey(id, uid);
  if (!success) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'API key not found' });
  }
  res.json({ success: true });
});

// GET /api/dashboard/mcp/usage — current user's MCP usage summary
dashboardRouter.get('/usage', verifyFirebaseToken, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const keys = await apiKeyService.listApiKeys(uid);

  const activeKeys = keys.filter((k) => k.status === 'active');
  const now = Date.now();
  const todayKey = new Date().toISOString().split('T')[0];

  // Count today's usage from the keys' last_used_at
  const usedToday = activeKeys.some((k) => {
    if (!k.last_used_at) return false;
    const t = typeof k.last_used_at === 'number' ? k.last_used_at : (k.last_used_at as any)?._seconds ? (k.last_used_at as any)._seconds * 1000 : new Date(k.last_used_at as any).getTime();
    return new Date(t).toISOString().split('T')[0] === todayKey;
  });

  res.json({
    totalKeys: keys.length,
    activeKeys: activeKeys.length,
    usedToday,
    status: activeKeys.length > 0 ? 'active' : 'inactive',
  });
});

// GET /api/dashboard/mcp/status — MCP status/config info for dashboard
dashboardRouter.get('/status', verifyFirebaseToken, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const email = (req as any).email;

  const tier = await firebaseService.getUserTier(uid, email);
  const keys = await apiKeyService.listApiKeys(uid);
  const activeKeys = keys.filter((k) => k.status === 'active');
  const cfg = await configService.get();

  res.json({
    endpoint: `${config.mcpServerUrl}/mcp`,
    headerAuth: 'Authorization: Bearer uh_live_...',
    tier,
    keys: {
      total: keys.length,
      active: activeKeys.length,
    },
    rateLimit: {
      free: cfg.rateLimitFree,
      pro: cfg.rateLimitPro,
    },
    features: await configService.getToolStates(),
  });
});

// GET /api/dashboard/mcp/overview — combined status + keys + usage in one round-trip
dashboardRouter.get('/overview', verifyFirebaseToken, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const email = (req as any).email;

  const tier = await firebaseService.getUserTier(uid, email);
  const keys = await apiKeyService.listApiKeys(uid);
  const activeKeys = keys.filter((k) => k.status === 'active');
  const cfg = await configService.get();
  const now = Date.now();
  const todayKey = new Date().toISOString().split('T')[0];

  const usedToday = activeKeys.some((k) => {
    if (!k.last_used_at) return false;
    const t = typeof k.last_used_at === 'number' ? k.last_used_at : (k.last_used_at as any)?._seconds ? (k.last_used_at as any)._seconds * 1000 : new Date(k.last_used_at as any).getTime();
    return new Date(t).toISOString().split('T')[0] === todayKey;
  });

  res.json({
    endpoint: `${config.mcpServerUrl}/mcp`,
    headerAuth: 'Authorization: Bearer uh_live_...',
    tier,
    keys: {
      total: keys.length,
      active: activeKeys.length,
    },
    items: keys,
    rateLimit: {
      free: cfg.rateLimitFree,
      pro: cfg.rateLimitPro,
    },
    features: await configService.getToolStates(),
    usage: {
      totalKeys: keys.length,
      activeKeys: activeKeys.length,
      usedToday,
      status: activeKeys.length > 0 ? 'active' : 'inactive',
    },
  });
});

// GET /api/dashboard/mcp/admin/metrics — Platform-wide telemetry (Admin only)
dashboardRouter.get('/admin/metrics', verifyFirebaseToken, async (req: Request, res: Response) => {
  const allowed = await requireAdminMetrics(req, res);
  if (!allowed) return;

  const todayKey = new Date().toISOString().split('T')[0];
  const summary = await analyticsService.getDailySummary(todayKey);

  let dbConnected = false;
  try {
    const col = await mongoCollection('mcp_analytics');
    await col.findOne({});
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  res.json({
    date: todayKey,
    ...summary,
    dbConnected,
    server: {
      status: dbConnected ? 'healthy' : 'degraded',
      uptime: Math.round(process.uptime()),
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      environment: config.nodeEnv,
      version: '1.0.0',
    },
  });
});

