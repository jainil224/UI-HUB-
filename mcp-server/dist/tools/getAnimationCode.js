import { z } from 'zod';
import { createTool, mcpError } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';
export const get_animation_code = createTool('get_animation_code', 'Return the implementation/code for a selected animation.', z.object({
    animationId: z.string().min(1).describe('The unique ID of the animation (prefix "anim-...")'),
}), { requiresPremium: false }, async (args, user) => {
    const componentId = args.animationId.replace(/^anim-/, '');
    const meta = componentService.getComponentMeta(componentId);
    if (!meta) {
        return mcpError('COMPONENT_NOT_FOUND', `The requested animation "${args.animationId}" was not found.`);
    }
    if (meta.isPremium) {
        const auth = permissionService.authorize(user, { isPremium: true });
        if (!auth.allowed) {
            await analyticsService.track({
                event: 'premium_denied',
                userId: user.userId,
                apiKeyId: user.keyId,
                tier: user.tier,
                keyPrefix: user.keyPrefix,
                componentId,
                tool: 'get_animation_code',
                timestamp: Date.now(),
            });
            return mcpError('PREMIUM_ACCESS_REQUIRED', 'This animation requires a UI HUB Pro subscription.');
        }
    }
    const result = await componentService.getAnimationCode(args.animationId);
    await analyticsService.track({
        event: 'animation_fetch',
        userId: user.userId,
        apiKeyId: user.keyId,
        tier: user.tier,
        keyPrefix: user.keyPrefix,
        componentId,
        tool: 'get_animation_code',
        timestamp: Date.now(),
        success: !!result,
    });
    if (!result) {
        return mcpError('COMPONENT_NOT_FOUND', `The animation "${args.animationId}" was not found.`);
    }
    return result;
});
//# sourceMappingURL=getAnimationCode.js.map