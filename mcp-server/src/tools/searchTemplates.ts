import { z } from 'zod';
import { createTool } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';

export const search_templates = createTool(
  'search_templates',
  'Search UI HUB templates (full-page/hero layouts built from components).',
  z.object({
    query: z.string().optional().describe('Free-text search keyword, e.g. "SaaS dashboard"'),
    category: z.string().optional().describe('Category to filter templates by'),
    isPremium: z.boolean().optional().describe('Filter by premium status'),
  }),
  { requiresPremium: false },
  async (args, user) => {
    const results = componentService.searchTemplates(args as any);

    await analyticsService.track({
      event: 'template_fetch',
      userId: user.userId,
      apiKeyId: user.keyId,
      tool: 'search_templates',
      query: args.query,
      timestamp: Date.now(),
      success: results.length > 0,
    });

    return { count: results.length, templates: results };
  }
);
