import { Router } from 'express';
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
const requireAdminMetrics = async (req, res) => {
    const { uid, email } = req;
    const tier = await firebaseService.getUserTier(uid, email);
    if (tier !== 'ADMIN' && tier !== 'ELITE') {
        res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' });
        return false;
    }
    req.tier = tier;
    return true;
};
// GET /api/dashboard/mcp/keys — list user's API keys
dashboardRouter.get('/keys', verifyFirebaseToken, async (req, res) => {
    const uid = req.uid;
    const keys = await apiKeyService.listApiKeys(uid);
    res.json({ keys });
});
// POST /api/dashboard/mcp/keys — create a new API key
dashboardRouter.post('/keys', verifyFirebaseToken, async (req, res) => {
    const uid = req.uid;
    const name = (req.body?.name || 'MCP Key').toString().slice(0, 100);
    const { plaintextKey, record } = await apiKeyService.createApiKey(uid, name);
    const { key_hash, ...safeRecord } = record;
    res.status(201).json({
        key: plaintextKey,
        record: safeRecord,
    });
});
// POST /api/dashboard/mcp/keys/:id/revoke — revoke a key
dashboardRouter.post('/keys/:id/revoke', verifyFirebaseToken, async (req, res) => {
    const uid = req.uid;
    const id = req.params.id;
    const success = await apiKeyService.revokeApiKey(id, uid);
    if (!success) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'API key not found' });
    }
    res.json({ success: true });
});
// DELETE /api/dashboard/mcp/keys/:id — delete a key
dashboardRouter.delete('/keys/:id', verifyFirebaseToken, async (req, res) => {
    const uid = req.uid;
    const id = req.params.id;
    const success = await apiKeyService.deleteApiKey(id, uid);
    if (!success) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'API key not found' });
    }
    res.json({ success: true });
});
// GET /api/dashboard/mcp/usage — current user's MCP usage summary
dashboardRouter.get('/usage', verifyFirebaseToken, async (req, res) => {
    const uid = req.uid;
    const keys = await apiKeyService.listApiKeys(uid);
    const activeKeys = keys.filter((k) => k.status === 'active');
    const now = Date.now();
    const todayKey = new Date().toISOString().split('T')[0];
    // Count today's usage from the keys' last_used_at
    const usedToday = activeKeys.some((k) => {
        if (!k.last_used_at)
            return false;
        const t = typeof k.last_used_at === 'number' ? k.last_used_at : k.last_used_at?._seconds ? k.last_used_at._seconds * 1000 : new Date(k.last_used_at).getTime();
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
dashboardRouter.get('/status', verifyFirebaseToken, async (req, res) => {
    const uid = req.uid;
    const email = req.email;
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
dashboardRouter.get('/overview', verifyFirebaseToken, async (req, res) => {
    const uid = req.uid;
    const email = req.email;
    const tier = await firebaseService.getUserTier(uid, email);
    const keys = await apiKeyService.listApiKeys(uid);
    const activeKeys = keys.filter((k) => k.status === 'active');
    const cfg = await configService.get();
    const now = Date.now();
    const todayKey = new Date().toISOString().split('T')[0];
    const usedToday = activeKeys.some((k) => {
        if (!k.last_used_at)
            return false;
        const t = typeof k.last_used_at === 'number' ? k.last_used_at : k.last_used_at?._seconds ? k.last_used_at._seconds * 1000 : new Date(k.last_used_at).getTime();
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
dashboardRouter.get('/admin/metrics', verifyFirebaseToken, async (req, res) => {
    const allowed = await requireAdminMetrics(req, res);
    if (!allowed)
        return;
    const todayKey = new Date().toISOString().split('T')[0];
    const summary = await analyticsService.getDailySummary(todayKey);
    let dbConnected = false;
    try {
        const col = await mongoCollection('mcp_analytics');
        await col.findOne({});
        dbConnected = true;
    }
    catch {
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
//# sourceMappingURL=dashboard.js.map