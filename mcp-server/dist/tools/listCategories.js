import { z } from 'zod';
import { createTool } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';
export const list_categories = createTool('list_categories', 'Return all available UI HUB component categories with counts. Counts exclude premium components for free-tier keys.', z.object({}), { requiresPremium: false }, async (args, user) => {
    // Free-tier keys: category counts exclude premium components entirely.
    const categories = componentService.listCategories(!permissionService.canAccessPremium(user));
    await analyticsService.track({
        event: 'component_search',
        userId: user.userId,
        apiKeyId: user.keyId,
        tier: user.tier,
        keyPrefix: user.keyPrefix,
        tool: 'list_categories',
        timestamp: Date.now(),
        success: true,
    });
    return {
        categories,
        total: categories.reduce((sum, c) => sum + c.count, 0),
    };
});
//# sourceMappingURL=listCategories.js.map