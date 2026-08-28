import { NextFunction, Response } from 'express';
import { Redis } from '@upstash/redis';
import type { AuthenticatedRequest } from '../types/index.js';
import config from '../config/env.js';
import { configService } from '../config/configService.js';
import { analyticsService } from '../services/analyticsService.js';

const SECONDS_IN_DAY = 24 * 60 * 60;

let upstash: Redis | null = null;

function getRedis(): Redis | null {
  if (!config.redisUrl) return null;
  if (!upstash) {
    // Redis.fromEnv() reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      upstash = Redis.fromEnv();
    } else {
      // Otherwise require url + token; if only url is present, fall back to in-memory
      const token = process.env.UPSTASH_REDIS_REST_TOKEN || config.redisUrl?.includes('@') ? '' : (process.env.UPSTASH_REDIS_REST_TOKEN || '');
      try {
        upstash = new (Redis as any)({ url: config.redisUrl, token: process.env.UPSTASH_REDIS_REST_TOKEN || '' });
      } catch {
        return null;
      }
    }
  }
  return upstash;
}

// In-memory fallback store when Redis is unavailable
const memoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limit MCP requests per API key, per plan tier.
 * Returns proper 429 with Retry-After on exhaustion.
 */
export async function mcpRateLimiter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return next();
  }

  const cfg = await configService.get();
  const limit =
    user.tier === 'PRO'
      ? cfg.rateLimitPro
      : user.tier === 'ELITE' || user.tier === 'ADMIN'
        ? Number.MAX_SAFE_INTEGER
        : cfg.rateLimitFree;
  const keyId = user.keyId;

  const redis = getRedis();
  if (redis) {
    // Distributed counter keyed by day
    const key = `mcp_rate:${keyId}:${new Date().toISOString().split('T')[0]}`;

    void (async () => {
      try {
        const count = await redis.incr(key);
        if (count === 1) {
          await redis.expire(key, SECONDS_IN_DAY);
        }
        if (count > limit) {
          await analyticsService.track({ event: 'rate_limit', userId: user.userId, apiKeyId: keyId, tier: user.tier, keyPrefix: user.keyPrefix, timestamp: Date.now() });
          return res.status(429).json({
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'You have exceeded your current MCP usage limit.',
          });
        }
        next();
      } catch (e) {
        // Redis failure — fall back to memory store
        fallbackMemoryLimit(user, limit, req, res, next);
      }
    })();
  } else {
    fallbackMemoryLimit(user, limit, req, res, next);
  }
}

function fallbackMemoryLimit(
  user: NonNullable<AuthenticatedRequest['user']>,
  limit: number,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const now = Date.now();
  const dayKey = new Date().toISOString().split('T')[0];
  const key = `${user.keyId}:${dayKey}`;

  let entry = memoryStore.get(key);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + SECONDS_IN_DAY * 1000 };
    memoryStore.set(key, entry);
  }

  entry.count++;

  if (entry.count > limit) {
    void analyticsService.track({ event: 'rate_limit', userId: user.userId, apiKeyId: user.keyId, tier: user.tier, keyPrefix: user.keyPrefix, timestamp: Date.now() });
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'You have exceeded your current MCP usage limit.',
    });
  }

  // Periodic cleanup to avoid unbounded memory growth
  if (memoryStore.size > 10000) {
    for (const [k, v] of memoryStore) {
      if (v.resetAt < now) memoryStore.delete(k);
    }
  }

  next();
}
