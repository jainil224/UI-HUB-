import { z } from 'zod';
import { createTool } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';
export const search_by_behavior = createTool('search_by_behavior', 'Search UI HUB components by visual BEHAVIOR or vibe descriptions (e.g. "magnetic pull", "scroll reveal parallax", "accretion disk", "glow on hover"). Matches behavior descriptions, requirements, and AI vibe prompts. Premium components are returned for free-tier keys as locked results (access: "premium-required") — their code is never included and cannot be fetched without Pro.', z.object({
    query: z.string().min(2).describe('Behavior or vibe keyword to search for, e.g. "particle swirl"'),
    category: z.string().optional().describe('Optionally restrict results to a single category (e.g. "cursor")'),
    limit: z.number().min(1).max(50).optional().describe('Max results (default 20)'),
}), { requiresPremium: false }, async (args, user) => {
    const canPremium = permissionService.canAccessPremium(user);
    const hits = componentService.searchComponentHits({ query: args.query });
    const filtered = args.category
        ? hits.filter((h) => h.item.category === args.category.toLowerCase())
        : hits;
    const limit = args.limit || 20;
    const components = filtered.slice(0, limit).map((h) => ({
        ...h.item,
        access: h.item.isPremium ? (canPremium ? 'premium-available' : 'premium-required') : 'free',
        ...(h.matchedOn ? { matchedOn: h.matchedOn } : {}),
        ...(h.score ? { score: Math.round(h.score) } : {}),
    }));
    await analyticsService.track({
        event: 'behavior_search',
        userId: user.userId,
        apiKeyId: user.keyId,
        tier: user.tier,
        keyPrefix: user.keyPrefix,
        tool: 'search_by_behavior',
        query: args.query,
        timestamp: Date.now(),
        success: components.length > 0,
    });
    return {
        count: components.length,
        query: args.query,
        components,
    };
});
//# sourceMappingURL=searchByBehavior.js.map