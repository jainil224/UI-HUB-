import { apiKeyService } from '../services/apiKeyService.js';
import { firebaseService } from '../services/firebase.js';
import { analyticsService } from '../services/analyticsService.js';
/** Max ms to wait for DB-backed auth. On cold start MongoDB can be slow. */
const AUTH_TIMEOUT_MS = 7000;
/**
 * Race a promise against a timeout.
 * Returns the result or throws an error if it takes too long.
 */
function withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`[Auth] ${label} timed out after ${ms}ms`)), ms)),
    ]);
}
/**
 * Middleware to authenticate MCP requests using a UI HUB API key.
 * Header: Authorization: Bearer uh_live_xxx
 *
 * IMPORTANT: This returns JSON-RPC error envelopes (not raw HTTP 401) so that
 * MCP clients (Antigravity, Cursor, Claude Code) can display a meaningful error
 * message instead of silently terminating with "request terminated without response".
 *
 * A hard timeout prevents cold-start MongoDB hangs from blocking the MCP session.
 */
export async function authenticateMcp(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        void analyticsService.track({
            event: 'auth_failure',
            timestamp: Date.now(),
            errorCode: 'MISSING_API_KEY',
        });
        return res.status(200).json({
            jsonrpc: '2.0',
            id: req.body?.id ?? null,
            error: {
                code: -32001,
                message: 'Unauthorized: Missing API key. Send requests with the header `Authorization: Bearer uh_live_...` (create a key at ui-hub-design.com/mcp). Note: pasting only the server URL will not work — the API key header is required.',
            },
        });
    }
    const apiKey = authHeader.slice(7).trim();
    try {
        // Validate the key with a hard timeout to prevent cold-start DB hangs
        const record = await withTimeout(apiKeyService.validateApiKey(apiKey), AUTH_TIMEOUT_MS, 'validateApiKey');
        if (!record) {
            void analyticsService.track({
                event: 'auth_failure',
                timestamp: Date.now(),
                errorCode: 'INVALID_API_KEY',
            });
            return res.status(200).json({
                jsonrpc: '2.0',
                id: req.body?.id ?? null,
                error: {
                    code: -32001,
                    message: 'Unauthorized: Invalid or revoked UI HUB API key. Use the header `Authorization: Bearer uh_live_...` with a valid key. Generate a new key at ui-hub-design.com/mcp.',
                },
            });
        }
        // Touch last_used_at (async, fire-and-forget — never blocks the request)
        void apiKeyService.touchApiKey(record.id);
        // Get tier with timeout — fall back to FREE if Firebase is slow
        let tier = 'FREE';
        try {
            tier = await withTimeout(firebaseService.getUserTier(record.user_id, undefined), AUTH_TIMEOUT_MS, 'getUserTier');
        }
        catch (tierErr) {
            console.warn('[Auth] Tier lookup timed out or failed — defaulting to FREE:', tierErr);
        }
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
    catch (err) {
        console.error('[Auth] Authentication error:', err?.message || err);
        // On timeout or DB error, return a JSON-RPC error so the client knows why
        return res.status(200).json({
            jsonrpc: '2.0',
            id: req.body?.id ?? null,
            error: {
                code: -32003,
                message: err?.message?.includes('timed out')
                    ? 'Server is warming up — please retry in a few seconds. (Auth DB timeout)'
                    : `Authentication error: ${err?.message || 'Internal error'}`,
            },
        });
    }
}
//# sourceMappingURL=auth.js.map