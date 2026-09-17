import { z } from 'zod';
import { createTool, mcpError } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';

export const get_dependencies = createTool(
  'get_dependencies',
  'Return the dependencies required by a specific UI HUB component. Premium components require a Pro subscription.',
  z.object({
    componentId: z.string().min(1).describe('The unique ID of the component'),
  }),
  { requiresPremium: false },
  async (args, user) => {
    const meta = componentService.getComponentMeta(args.componentId);
    if (!meta) {
      return mcpError('COMPONENT_NOT_FOUND', `The requested UI HUB component "${args.componentId}" was not found.`);
    }

    // Premium components require Pro for dependency access too.
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
          tool: 'get_dependencies',
          timestamp: Date.now(),
        });
        return mcpError('PREMIUM_ACCESS_REQUIRED', 'This component requires a UI HUB Pro subscription.');
      }
    }

    const dependencies = await componentService.getDependencies(args.componentId);

    await analyticsService.track({
      event: 'component_fetch',
      userId: user.userId,
      apiKeyId: user.keyId,
      tier: user.tier,
      keyPrefix: user.keyPrefix,
      componentId: args.componentId,
      tool: 'get_dependencies',
      timestamp: Date.now(),
      success: !!dependencies,
    });

    if (!dependencies) {
      return mcpError('COMPONENT_NOT_FOUND', `Dependencies for "${args.componentId}" were not found.`);
    }

    return { componentId: args.componentId, dependencies };
  }
);

