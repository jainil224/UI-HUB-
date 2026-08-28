import { z } from 'zod';
import { createTool } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';

export const search_animations = createTool(
  'search_animations',
  'Search UI HUB animation resources (text, scroll, and effect animations).',
  z.object({
    query: z.string().optional().describe('Free-text search keyword, e.g. "scroll reveal"'),
    category: z.string().optional().describe('Category to filter animations by'),
    isPremium: z.boolean().optional().describe('Filter by premium status'),
  }),
  { requiresPremium: false },
  async (args, user) => {
    const results = componentService.searchAnimations(args as any);

    await analyticsService.track({
      event: 'animation_fetch',
      userId: user.userId,
      apiKeyId: user.keyId,
      tool: 'search_animations',
      query: args.query,
      timestamp: Date.now(),
      success: results.length > 0,
    });

    return { count: results.length, animations: results };
  }
);
