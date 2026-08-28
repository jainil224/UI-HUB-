import { NextFunction, Response } from 'express';
import type { AuthenticatedRequest, McpUser } from '../types/index.js';
import { apiKeyService } from '../services/apiKeyService.js';
import { firebaseService } from '../services/firebase.js';
import { analyticsService } from '../services/analyticsService.js';

/**
 * Middleware to authenticate requests using a UI HUB API key.
 * Header: Authorization: Bearer uh_live_xxx
 */
export async function authenticateMcp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await analyticsService.track({ event: 'auth_failure', timestamp: Date.now(), errorCode: 'MISSING_API_KEY' });
    return res.status(401).json({
      error: 'INVALID_API_KEY',
      message: 'Missing Authorization header. Use: Authorization: Bearer <UI_HUB_API_KEY>',
    });
  }

  const apiKey = authHeader.slice(7).trim();
  const record = await apiKeyService.validateApiKey(apiKey);

  if (!record) {
    await analyticsService.track({ event: 'auth_failure', timestamp: Date.now(), errorCode: 'INVALID_API_KEY' });
    return res.status(401).json({
      error: 'INVALID_API_KEY',
      message: 'The provided UI HUB API key is invalid.',
    });
  }

  // Touch last_used_at (async, fire-and-forget)
  void apiKeyService.touchApiKey(record.id);

  // Determine the user's plan tier from Firestore
  const tier = await firebaseService.getUserTier(record.user_id, undefined);

  const user: McpUser = {
    userId: record.user_id,
    email: '',
    name: record.name,
    tier,
    keyId: record.id,
    keyPrefix: record.key_prefix,
    keyStatus: record.status,
  };

  req.user = user;
  req.apiKeyId = record.id;

  next();
}
