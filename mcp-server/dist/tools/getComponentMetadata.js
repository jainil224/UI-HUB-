import { z } from 'zod';
import { createTool, mcpError } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
export const get_component_metadata = createTool('get_component_metadata', 'Return rich metadata (props, behavior/vibe description, CSS properties, requirements) for a UI HUB component. Useful for accurately reproducing or integrating a component.', z.object({
    componentId: z.string().min(1).describe('The unique ID of the component'),
}), { requiresPremium: false }, async (args, user) => {
    const meta = componentService.getComponentMetadata(args.componentId);
    await analyticsService.track({
        event: 'metadata_fetch',
        userId: user.userId,
        apiKeyId: user.keyId,
        tier: user.tier,
        keyPrefix: user.keyPrefix,
        componentId: args.componentId,
        tool: 'get_component_metadata',
        timestamp: Date.now(),
        success: !!meta,
    });
    if (!meta) {
        return mcpError('COMPONENT_NOT_FOUND', `The requested UI HUB component "${args.componentId}" was not found.`);
    }
    return meta;
});
//# sourceMappingURL=getComponentMetadata.js.map