import { z } from 'zod';
import { createTool, mcpError } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';

export const get_component_metadata = createTool(
  'get_component_metadata',
  'Return rich metadata (props, behavior/vibe description, CSS properties, requirements) for a UI HUB component. Useful for accurately reproducing or integrating a component. Premium components require a Pro subscription.',
  z.object({
    componentId: z.string().min(1).describe('The unique ID of the component'),
  }),
  { requiresPremium: false },
  async (args, user) => {
    const meta = componentService.getComponentMeta(args.componentId);
    if (!meta) {
      return mcpError('COMPONENT_NOT_FOUND', `The requested UI HUB component "${args.componentId}" was not found.`);
    }

    // Premium components require Pro for metadata access too.
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
          tool: 'get_component_metadata',
          timestamp: Date.now(),
        });
        return mcpError('PREMIUM_ACCESS_REQUIRED', 'This component requires a UI HUB Pro subscription.');
      }
    }

    const full = componentService.getComponentMetadata(args.componentId);

    await analyticsService.track({
      event: 'metadata_fetch',
      userId: user.userId,
      apiKeyId: user.keyId,
      tier: user.tier,
      keyPrefix: user.keyPrefix,
      componentId: args.componentId,
      tool: 'get_component_metadata',
      timestamp: Date.now(),
      success: !!full,
    });

    if (!full) {
      return mcpError('COMPONENT_NOT_FOUND', `The requested UI HUB component "${args.componentId}" was not found.`);
    }

    return full;
  }
);