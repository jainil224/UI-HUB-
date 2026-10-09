import { z } from 'zod';
import { createTool } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';
export const search_components = createTool('search_components', 'Search UI HUB components by name, category, framework, styling, tags, keyword, or free/premium status. Natural-language queries are tokenized and ranked. Premium components are returned for free-tier keys as locked results (access: "premium-required") — their code is never included and cannot be fetched without Pro.', z.object({
    query: z.string().optional().describe('Free-text search keyword, e.g. "pricing card", "particle sun", "hero section"'),
    category: z
        .enum(['3d', 'background', 'button', 'cursor', 'effect', 'footer', 'form', 'image-interaction', 'interactive-background', 'loader', 'navbar', 'particles-background', 'scroll', 'text'])
        .optional()
        .describe('Component category'),
    framework: z.enum(['react']).optional().describe('Component framework'),
    styling: z.enum(['tailwind', 'css', 'scss']).optional().describe('Styling approach'),
    tags: z.array(z.string()).optional().describe('Optional tags to filter by'),
    isPremium: z.boolean().optional().describe('Filter by premium status (true = premium only)'),
}), { requiresPremium: false }, async (args, user) => {
    const canPremium = permissionService.canAccessPremium(user);
    const hits = componentService.searchComponentHits(args);
    await analyticsService.track({
        event: 'component_search',
        userId: user.userId,
        apiKeyId: user.keyId,
        tier: user.tier,
        keyPrefix: user.keyPrefix,
        tool: 'search_components',
        query: args.query,
        timestamp: Date.now(),
        success: hits.length > 0,
    });
    // Premium matches are surfaced as LOCKED (not hidden) so the agent can tell
    // the user a Pro component exists instead of hallucinating one. Code is
    // never part of a search result and remains gated in get_component_code.
    const components = hits.map((h) => ({
        ...h.item,
        access: h.item.isPremium ? (canPremium ? 'premium-available' : 'premium-required') : 'free',
        ...(h.matchedOn ? { matchedOn: h.matchedOn } : {}),
        ...(h.score ? { score: Math.round(h.score) } : {}),
    }));
    return {
        count: components.length,
        components,
    };
});
//# sourceMappingURL=searchComponents.js.map