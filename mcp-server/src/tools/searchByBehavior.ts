import { z } from 'zod';
import { createTool } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';

export const search_by_behavior = createTool(
  'search_by_behavior',
  'Search UI HUB components by visual BEHAVIOR or vibe descriptions (e.g. "magnetic pull", "scroll reveal parallax", "accretion disk", "glow on hover"). Matches behavior descriptions, requirements, and AI vibe prompts.',
  z.object({
    query: z.string().min(2).describe('Behavior or vibe keyword to search for, e.g. "particle swirl"'),
    category: z.string().optional().describe('Optionally restrict results to a single category (e.g. "cursor")'),
    limit: z.number().min(1).max(50).optional().describe('Max results (default 20)'),
  }),
  { requiresPremium: false },
  async (args, user) => {
    let results = componentService.searchByBehavior(args.query);

    if (args.category) {
      const category = args.category.toLowerCase();
      results = results.filter((c) => c.category === category);
    }
    const limit = args.limit || 20;
    results = results.slice(0, limit);

    await analyticsService.track({
      event: 'behavior_search',
      userId: user.userId,
      apiKeyId: user.keyId,
      tier: user.tier,
      keyPrefix: user.keyPrefix,
      tool: 'search_by_behavior',
      query: args.query,
      timestamp: Date.now(),
      success: results.length > 0,
    });

    return {
      count: results.length,
      query: args.query,
      components: results,
    };
  }
);