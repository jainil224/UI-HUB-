import { apiKeyService } from '../services/apiKeyService.js';
import { firebaseService } from '../services/firebase.js';
import { analyticsService } from '../services/analyticsService.js';
/**
 * Middleware to authenticate MCP requests using a UI HUB API key.
 * Header: Authorization: Bearer uh_live_xxx
 *
 * NOTE: This middleware intentionally returns JSON-RPC-compatible error
 * responses (not raw HTTP 401) so that MCP clients (Antigravity, Cursor,
 * Claude Code, etc.) can display a meaningful error message instead of
 * silently terminating the session.
 */
export async function authenticateMcp(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        await analyticsService.track({
            event: 'auth_failure',
            timestamp: Date.now(),
            errorCode: 'MISSING_API_KEY',
        });
        // Return a JSON-RPC envelope so MCP clients can parse and display the error
        return res.status(200).json({
            jsonrpc: '2.0',
            id: req.body?.id ?? null,
            error: {
                code: -32001,
                message: 'Unauthorized: Missing API key. Add your UI HUB key as: Authorization: Bearer uh_live_...',
            },
        });
    }
    const apiKey = authHeader.slice(7).trim();
    const record = await apiKeyService.validateApiKey(apiKey);
    if (!record) {
        await analyticsService.track({
            event: 'auth_failure',
            timestamp: Date.now(),
            errorCode: 'INVALID_API_KEY',
        });
        return res.status(200).json({
            jsonrpc: '2.0',
            id: req.body?.id ?? null,
            error: {
                code: -32001,
                message: 'Unauthorized: Invalid or revoked UI HUB API key. Generate a new key at ui-hub-design.com/mcp.',
            },
        });
    }
    // Touch last_used_at (async, fire-and-forget)
    void apiKeyService.touchApiKey(record.id);
    // Determine the user's plan tier from Firestore
    const tier = await firebaseService.getUserTier(record.user_id, undefined);
    const user = {
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
//# sourceMappingURL=auth.js.map