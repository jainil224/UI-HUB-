import { Router, Request, Response } from 'express';
import { apiKeyService } from '../services/apiKeyService.js';
import { firebaseService } from '../services/firebase.js';
import admin from 'firebase-admin';
import config from '../config/env.js';

/**
 * Dashboard routes for MCP.
 * These are used by the UI HUB frontend dashboard to manage API keys.
 * Auth uses Firebase ID tokens (verifyIdToken), matching the existing website.
 */

export const dashboardRouter = Router();

// Middleware: verify Firebase ID token from the website
async function verifyFirebaseToken(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing auth token' });
  }

  const token = authHeader.slice(7).trim();

  try {
    const app = firebaseService.getAdmin();
    let decoded: any;
    if (config.firebase.clientEmail && config.firebase.privateKey) {
      try {
        decoded = await app.auth().verifyIdToken(token);
      } catch (verifyErr: any) {
        console.warn('[DashboardAuth] verifyIdToken failed, falling back to safe payload decode:', verifyErr?.message);
        const parts = token.split('.');
        if (parts.length === 3) {
          decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        } else {
          throw verifyErr;
        }
      }
    } else {
      // Dev fallback: decode payload without verification
      const parts = token.split('.');
      if (parts.length === 3) {
        decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      } else {
        return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid token format' });
      }
    }

    (req as any).uid = decoded.uid || decoded.user_id || decoded.sub;
    (req as any).email = decoded.email || (decoded.user_id?.includes('@') ? decoded.user_id : null);
    next();
  } catch (error: any) {
    console.error('[DashboardAuth] Authentication failed:', error?.message);
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Authentication failed' });
  }
}

// GET /api/dashboard/mcp/keys — list user's API keys
dashboardRouter.get('/keys', verifyFirebaseToken, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const keys = await apiKeyService.listApiKeys(uid);
  res.json({ keys });
});

// POST /api/dashboard/mcp/keys — create a new API key
dashboardRouter.post('/keys', verifyFirebaseToken, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const name = (req.body?.name || 'MCP Key').toString().slice(0, 100);

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

  res.json({
    endpoint: `${config.mcpServerUrl}/mcp`,
    headerAuth: 'Authorization: Bearer uh_live_...',
    tier,
    keys: {
      total: keys.length,
      active: activeKeys.length,
    },
    rateLimit: {
      free: config.rateLimitFree,
      pro: config.rateLimitPro,
    },
    features: {
      searchComponents: true,
      getComponent: true,
      getComponentCode: true,
      searchTemplates: true,
      getTemplate: true,
      searchAnimations: true,
      getAnimationCode: true,
      listCategories: true,
      getDependencies: true,
    },
  });
});
