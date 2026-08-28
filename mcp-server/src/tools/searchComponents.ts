import { z } from 'zod';
import { createTool } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';

export const search_components = createTool(
  'search_components',
  'Search UI HUB components by name, category, framework, styling, tags, keyword, or free/premium status. Returns structured component metadata.',
  z.object({
    query: z.string().optional().describe('Free-text search keyword, e.g. "pricing card"'),
    category: z
      .enum(['3d', 'background', 'button', 'cursor', 'effect', 'image-interaction', 'interactive-background', 'scroll', 'text'])
      .optional()
      .describe('Component category'),
    framework: z.enum(['react']).optional().describe('Component framework'),
    styling: z.enum(['tailwind', 'css', 'scss']).optional().describe('Styling approach'),
    tags: z.array(z.string()).optional().describe('Optional tags to filter by'),
    isPremium: z.boolean().optional().describe('Filter by premium status (true = premium only)'),
  }),
  { requiresPremium: false },
  async (args, user) => {
    const results = componentService.searchComponents(args as any);

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

    // Free users: strip premium components or mark them but limit access
    const visible = results.map((c, i) => ({
      ...c,
      // For free users, mask premium code access (they can still see metadata)
      access: permissionAwareNote(c.isPremium, user),
    }));

    return {
      count: visible.length,
      components: visible,
    };
  }
);

function permissionAwareNote(isPremium: boolean, user: any): string {
  if (!isPremium) return 'free';
  if (['PRO', 'ELITE', 'ADMIN'].includes(user.tier)) return 'premium-available';
  return 'premium-required';
}

