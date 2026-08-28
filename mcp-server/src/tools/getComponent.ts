import { z } from 'zod';
import { createTool, mcpError } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';

export const get_component = createTool(
  'get_component',
  'Retrieve complete information about a specific UI HUB component, including metadata, code, dependencies, and usage.',
  z.object({
    componentId: z.string().min(1).describe('The unique ID of the component, e.g. "pricing-card-pro"'),
  }),
  { requiresPremium: false },
  async (args, user) => {
    const meta = componentService.getComponentMeta(args.componentId);
    if (!meta) {
      return mcpError('COMPONENT_NOT_FOUND', `The requested UI HUB component "${args.componentId}" was not found.`);
    }

    // Premium components require Pro for full code access
    if (meta.isPremium) {
      const auth = permissionService.authorize(user, { isPremium: true });
      if (!auth.allowed) {
        await analyticsService.track({
          event: 'premium_denied',
          userId: user.userId,
          apiKeyId: user.keyId,
          tier: user.tier,
          keyPrefix: user.keyPrefix,
          componentId: args.componentId,
          tool: 'get_component',
          timestamp: Date.now(),
        });
        return mcpError('PREMIUM_ACCESS_REQUIRED', 'This component requires a UI HUB Pro subscription.');
      }
    }

    const result = await componentService.getComponent(args.componentId, true);

    await analyticsService.track({
      event: 'component_fetch',
      userId: user.userId,
      apiKeyId: user.keyId,
      tier: user.tier,
      keyPrefix: user.keyPrefix,
      componentId: args.componentId,
      tool: 'get_component',
      timestamp: Date.now(),
      success: !!result,
    });

    if (!result) {
      return mcpError('COMPONENT_NOT_FOUND', `The requested UI HUB component "${args.componentId}" was not found.`);
    }

    return result;
  }
);

