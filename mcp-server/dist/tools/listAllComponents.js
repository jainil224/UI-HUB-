import { z } from 'zod';
import { createTool } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';
export const list_all_components = createTool('list_all_components', 'List the ENTIRE UI HUB component catalog with pagination. Premium components are hidden completely for free-tier keys and only appear for Pro/Elite/Admin keys.', z.object({
    category: z.string().optional().describe('Optionally filter by category (e.g. "cursor", "background", "form")'),
    limit: z.number().min(1).max(200).optional().describe('Max results to return (default 100)'),
    offset: z.number().min(0).optional().describe('Pagination offset, 0-based (default 0)'),
}), { requiresPremium: false }, async (args, user) => {
    const canPremium = permissionService.canAccessPremium(user);
    const all = componentService.getFullCatalog();
    let visible = permissionService.filterVisibleByTier(all, user);
    if (args.category) {
        const category = args.category.toLowerCase();
        visible = visible.filter((c) => c.category === category);
    }
    const total = visible.length;
    const offset = args.offset || 0;
    const start = Math.min(offset, total);
    const page = visible.slice(start, start + (args.limit || 100));
    await analyticsService.track({
        event: 'component_search',
        userId: user.userId,
        apiKeyId: user.keyId,
        tier: user.tier,
        keyPrefix: user.keyPrefix,
        tool: 'list_all_components',
        timestamp: Date.now(),
        success: page.length > 0,
    });
    return {
        total,
        count: page.length,
        offset: start,
        components: page.map((c) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            isPremium: c.isPremium,
            access: c.isPremium ? (canPremium ? 'premium-available' : 'premium-required') : 'free',
        })),
    };
});
//# sourceMappingURL=listAllComponents.js.map