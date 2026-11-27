import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
    evaluateAiCreditUse,
    recordAiCreditUse,
    PREMIUM_AI_TOOLS,
} from '../services/userService.js';
import { logActivity } from '../services/activityLogService.js';

const router = express.Router();

const VALID_SYSTEMS = new Set(['advance', 'antigravity', 'claude', 'cursor', 'lovable']);
const VALID_SURFACES = new Set(['component', 'template', 'build']);

// Activity logging is best-effort: a logging outage must never turn a charged
// copy into a 500, nor turn a deliberate 403 into a server error.
const recordActivity = (payload) => {
    void logActivity(payload).catch((error) => {
        console.error('[PromptConsume] Activity log failed:', error?.message || error);
    });
};

/**
 * Authoritative gate for every AI prompt copy across the app.
 *
 * The client builds the prompt text locally, but it must call this endpoint
 * before writing to the clipboard. That keeps the daily limit and the
 * Pro-only tool allowlist server-controlled, so clearing browser storage or
 * editing client state cannot bypass them.
 *
 * Free: 5 credits / UTC day, Lovable + Cursor only.
 * Pro: 5 daily + 50 monthly credits, all tools.
 * Ultimate / Lifetime / Elite: all tools, plan credits from their own policy.
 * Purchased credit packs are consumed first by recordAiCreditUse.
 */
router.post('/consume', verifyToken, async (req, res) => {
    const { system, surface, itemId } = req.body || {};

    if (!VALID_SYSTEMS.has(system)) {
        return res.status(400).json({ error: 'Unknown AI prompt tool.', code: 'INVALID_SYSTEM' });
    }
    if (!VALID_SURFACES.has(surface)) {
        return res.status(400).json({ error: 'Unknown prompt surface.', code: 'INVALID_SURFACE' });
    }

    const uid = req.user?.uid;
    const email = req.user?.email;
    if (!uid && !email) {
        return res.status(401).json({ error: 'Unauthorized: Missing token', code: 'AUTH_REQUIRED' });
    }

    try {
        const before = await evaluateAiCreditUse(uid, email);

        // Advance / Antigravity / Claude are Pro+ only. A free user cannot
        // spend daily credits on them either — the tool itself is locked.
        if (PREMIUM_AI_TOOLS.includes(system) && before.tier === 'free') {
            recordActivity({
                type: 'ai.prompt_denied',
                userId: uid,
                email,
                level: 'warn',
                metadata: { system, surface, itemId: itemId || null, reason: 'TOOL_LOCKED' },
            });
            return res.status(403).json({
                error: 'This AI prompt tool is available on Pro and above.',
                code: 'PROMPT_TOOL_LOCKED',
                remaining: before.remaining,
            });
        }

        if (!before.allowed) {
            return res.status(403).json({
                error: 'Your AI credits are used up. Buy more credits or upgrade your plan.',
                code: 'TRIAL_LIMIT',
                reason: before.reason || 'COUNT',
                remaining: before.remaining,
                expiresAt: before.expiresAt ?? null,
            });
        }

        const after = await recordAiCreditUse(uid, email);
        if (!after.recorded) {
            return res.status(403).json({
                error: 'Could not reserve an AI credit. Please retry.',
                code: 'TRIAL_LIMIT',
                reason: 'COUNT',
                remaining: after.remaining,
                expiresAt: after.expiresAt ?? null,
            });
        }

        recordActivity({
            type: 'ai.prompt_generated',
            userId: uid,
            email,
            level: 'info',
            metadata: { system, surface, itemId: itemId || null, tier: after.tier },
        });

        return res.json({
            ok: true,
            remaining: after.remaining,
            unlimited: Boolean(after.unlimited),
            tier: after.tier,
            expiresAt: after.expiresAt ?? null,
        });
    } catch (error) {
        console.error('[PromptConsume] Failed to consume AI credit:', error);
        return res.status(500).json({ error: 'Failed to reserve an AI credit.', code: 'ERROR' });
    }
});

export default router;
