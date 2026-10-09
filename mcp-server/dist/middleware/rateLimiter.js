import { Redis } from '@upstash/redis';
import config from '../config/env.js';
import { configService } from '../config/configService.js';
import { analyticsService } from '../services/analyticsService.js';
import { telemetryService } from '../services/telemetryService.js';
import { hashValue } from '../services/redaction.js';
const SECONDS_IN_DAY = 24 * 60 * 60;
/** Next UTC midnight in epoch ms — the moment the daily counter rolls over. */
function nextUtcMidnightMs(now = Date.now()) {
    const d = new Date(now);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
}
function utcDay(now = Date.now()) {
    return new Date(now).toISOString().split('T')[0];
}
/** Record a rate-limited request for the admin observability views. */
function emitRateLimited(req) {
    const ctx = req.mcpTelemetry || {};
    const user = req.user;
    telemetryService.recordRequest({
        correlationId: ctx.correlationId || 'unknown',
        method: typeof req.body?.method === 'string' ? req.body.method : 'tools/call',
        toolName: typeof req.body?.params?.name === 'string' ? req.body.params.name : undefined,
        userId: user?.userId,
        apiKeyId: user?.keyId,
        keyPrefix: user?.keyPrefix,
        tier: user?.tier,
        clientName: ctx.clientName,
        clientVersion: ctx.clientVersion,
        sessionId: ctx.sessionId,
        transport: 'streamable-http',
        status: 'rate_limited',
        success: false,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        errorCategory: 'rate_limit',
        statusCode: 429,
        latencyMs: ctx.startedAt ? Date.now() - ctx.startedAt : undefined,
        ipHash: hashValue(req.ip || ''),
        timestamp: Date.now(),
    });
}
/**
 * Send a machine-readable JSON-RPC 429 with standard rate-limit headers so MCP
 * clients can surface a meaningful message and back off correctly. The old
 * implementation returned a non-JSON-RPC body with no Retry-After header.
 */
function sendRateLimited(req, res, limit, user, resetAt) {
    void analyticsService.track({
        event: 'rate_limit',
        userId: user.userId,
        apiKeyId: user.keyId,
        tier: user.tier,
        keyPrefix: user.keyPrefix,
        timestamp: Date.now(),
    });
    emitRateLimited(req);
    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    res.set('Retry-After', String(retryAfterSeconds));
    res.set('X-RateLimit-Limit', String(limit));
    res.set('X-RateLimit-Remaining', '0');
    res.set('X-RateLimit-Reset', String(Math.floor(resetAt / 1000)));
    res.status(429).json({
        jsonrpc: '2.0',
        id: req.body?.id ?? null,
        error: {
            code: -32029,
            message: 'You have exceeded your current MCP usage limit. Wait for the daily reset or upgrade your plan.',
            data: {
                limit,
                remaining: 0,
                resetAt,
                retryAfterSeconds,
            },
        },
    });
}
let upstash = null;
function getRedis() {
    if (!config.redisUrl)
        return null;
    if (!upstash) {
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            upstash = Redis.fromEnv();
        }
        else {
            try {
                upstash = new Redis({ url: config.redisUrl, token: process.env.UPSTASH_REDIS_REST_TOKEN || '' });
            }
            catch {
                return null;
            }
        }
    }
    return upstash;
}
// In-memory fallback store when Redis is unavailable
const memoryStore = new Map();
function limitForTier(cfg, user) {
    if (user.tier === 'ELITE' || user.tier === 'ADMIN')
        return Number.MAX_SAFE_INTEGER;
    if (user.tier === 'PRO')
        return cfg.rateLimitPro;
    return cfg.rateLimitFree;
}
/**
 * Rate limit MCP requests per API key, per plan tier.
 * Returns a JSON-RPC 429 (with Retry-After + X-RateLimit-*) on exhaustion.
 * The counter resets at UTC midnight.
 */
export async function mcpRateLimiter(req, res, next) {
    const user = req.user;
    if (!user) {
        return next();
    }
    const cfg = await configService.get();
    const limit = limitForTier(cfg, user);
    const redis = getRedis();
    if (!redis) {
        return fallbackMemoryLimit(user, limit, req, res, next);
    }
    const key = `mcp_rate:${user.keyId}:${utcDay()}`;
    // Only a failed INCR falls back to memory. If INCR succeeded we must NOT also
    // count it in memory (that double-counted and tripped limits early).
    let count;
    try {
        count = await redis.incr(key);
    }
    catch {
        return fallbackMemoryLimit(user, limit, req, res, next);
    }
    // TTL is best-effort and never affects the decision. Always ensure a TTL so a
    // crash between INCR and EXPIRE can't leave the key alive forever.
    try {
        if (count === 1) {
            await redis.expire(key, SECONDS_IN_DAY);
        }
        else {
            const ttl = await redis.ttl(key);
            if (typeof ttl === 'number' && ttl < 0) {
                await redis.expire(key, SECONDS_IN_DAY);
            }
        }
    }
    catch {
        // ignore: TTL management is non-critical
    }
    if (count > limit) {
        return sendRateLimited(req, res, limit, user, nextUtcMidnightMs());
    }
    return next();
}
function fallbackMemoryLimit(user, limit, req, res, next) {
    const now = Date.now();
    const dayKey = utcDay(now);
    const key = `${user.keyId}:${dayKey}`;
    let entry = memoryStore.get(key);
    if (!entry || entry.resetAt < now) {
        entry = { count: 0, resetAt: nextUtcMidnightMs(now) };
        memoryStore.set(key, entry);
    }
    entry.count++;
    if (entry.count > limit) {
        return sendRateLimited(req, res, limit, user, entry.resetAt);
    }
    // Periodic cleanup to avoid unbounded memory growth
    if (memoryStore.size > 10000) {
        for (const [k, v] of memoryStore) {
            if (v.resetAt < now)
                memoryStore.delete(k);
        }
    }
    next();
}
//# sourceMappingURL=rateLimiter.js.map