import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';

let store = undefined;

if (process.env.REDIS_URL) {
  try {
    const redisClient = new Redis(process.env.REDIS_URL);
    store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });
    console.log('[RateLimiter] Connected to Redis for persistent rate limiting.');
  } catch (err) {
    console.warn('[RateLimiter] Failed to connect to Redis. Falling back to memory store.');
  }
} else {
  console.log('[RateLimiter] REDIS_URL not set. Using memory store for rate limiting.');
}

// ─── Tier 1: Global catch-all (all routes) ────────────────────────────────
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  ...(store && { store })
});

// ─── Tier 2: Auth-sensitive routes ────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts.' },
  skipSuccessfulRequests: false,
  ...(store && { store })
});

// ─── Tier 3: Config key fetch (public, no auth) ───────────────────────────
export const configLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, error: 'Config request rate exceeded.' },
  ...(store && { store })
});

// ─── Tier 4: Create Order (authenticated, strict) ─────────────────────────
export const createOrderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Max 5 order creations per minute per IP
  standardHeaders: true,
  message: { success: false, error: 'Order creation rate exceeded. Please wait.' },
  ...(store && { store })
});

// ─── Tier 5: Verify Payment (strictest — write operation) ─────────────────
export const verifyPaymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 verifications per minute per IP
  standardHeaders: true,
  message: { success: false, error: 'Payment verification rate exceeded.' },
  ...(store && { store })
});

// ─── Tier 6: Webhook (Razorpay IP range only) ─────────────────────────────
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // Razorpay can send multiple events in bursts
  message: { success: false, error: 'Webhook rate exceeded.' },
  ...(store && { store })
});
