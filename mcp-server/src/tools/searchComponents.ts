import { z } from 'zod';
import { createTool } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';

export const search_components = createTool(
  'search_components',
  'Search UI HUB components by name, category, framework, styling, tags, keyword, or free/premium status. Returns structured component metadata. Premium components are hidden completely for free-tier keys.',
  z.object({
    query: z.string().optional().describe('Free-text search keyword, e.g. "pricing card"'),
category: z
      .enum(['3d', 'background', 'button', 'cursor', 'effect', 'footer', 'form', 'image-interaction', 'interactive-background', 'loader', 'navbar', 'scroll', 'text'])
      .optional()
      .describe('Component category'),
    framework: z.enum(['react']).optional().describe('Component framework'),
    styling: z.enum(['tailwind', 'css', 'scss']).optional().describe('Styling approach'),
    tags: z.array(z.string()).optional().describe('Optional tags to filter by'),
    isPremium: z.boolean().optional().describe('Filter by premium status (true = premium only)'),
  }),
  { requiresPremium: false },
  async (args, user) => {
    let results = componentService.searchComponents(args as any);

    // Free-tier keys: premium components are completely hidden from search.
    const canPremium = permissionService.canAccessPremium(user);
    results = permissionService.filterVisibleByTier(results, user);

    await analyticsService.track({
      event: 'component_search',
      userId: user.userId,
      apiKeyId: user.keyId,
      tier: user.tier,
      keyPrefix: user.keyPrefix,
      tool: 'search_components',
      query: args.query,
      timestamp: Date.now(),
      success: results.length > 0,
    });

    const visible = results.map((c) => ({
      ...c,
      access: c.isPremium ? (canPremium ? 'premium-available' : 'premium-required') : 'free',
    }));

    return {
      count: visible.length,
      components: visible,
    };
  }
);

