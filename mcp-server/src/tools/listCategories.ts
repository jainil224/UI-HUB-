import { z } from 'zod';
import { createTool } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';

export const list_categories = createTool(
  'list_categories',
  'Return all available UI HUB component categories with counts.',
  z.object({}),
  { requiresPremium: false },
  async (args, user) => {
    const categories = componentService.listCategories();

    await analyticsService.track({
      event: 'component_search',
      userId: user.userId,
      apiKeyId: user.keyId,
      tool: 'list_categories',
      timestamp: Date.now(),
      success: true,
    });

    return {
      categories,
      total: categories.reduce((sum, c) => sum + c.count, 0),
    };
  }
);
