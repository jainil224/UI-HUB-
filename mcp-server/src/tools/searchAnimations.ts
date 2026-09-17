import { z } from 'zod';
import { createTool } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';

export const search_animations = createTool(
  'search_animations',
  'Search UI HUB animation resources (text, scroll, and effect animations). Premium animations are hidden completely for free-tier keys.',
  z.object({
    query: z.string().optional().describe('Free-text search keyword, e.g. "scroll reveal"'),
    category: z.string().optional().describe('Category to filter animations by'),
    isPremium: z.boolean().optional().describe('Filter by premium status'),
  }),
  { requiresPremium: false },
  async (args, user) => {
    let results = componentService.searchAnimations(args as any);

    // Free-tier keys: premium animations are completely hidden.
    results = permissionService.filterVisibleByTier(results, user);

    await analyticsService.track({
      event: 'animation_fetch',
      userId: user.userId,
      apiKeyId: user.keyId,
      tier: user.tier,
      keyPrefix: user.keyPrefix,
      tool: 'search_animations',
      query: args.query,
      timestamp: Date.now(),
      success: results.length > 0,
    });

    return { count: results.length, animations: results };
  }
);

