import { z } from 'zod';
import { createTool, mcpError } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';
export const get_component_code = createTool('get_component_code', 'Return copy-paste-ready source code for a specific UI HUB component.', z.object({
    componentId: z.string().min(1).describe('The unique ID of the component'),
    framework: z.enum(['react']).optional().describe('Target framework (currently React)'),
    styling: z.enum(['tailwind', 'css', 'scss']).optional().describe('Styling approach'),
}), { requiresPremium: false }, async (args, user) => {
    const meta = componentService.getComponentMeta(args.componentId);
    if (!meta) {
        return mcpError('COMPONENT_NOT_FOUND', `The requested UI HUB component "${args.componentId}" was not found.`);
    }
    // Premium components require Pro for code access
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
                tool: 'get_component_code',
                timestamp: Date.now(),
            });
            return mcpError('PREMIUM_ACCESS_REQUIRED', 'This component requires a UI HUB Pro subscription.');
        }
    }
    const code = await componentService.getComponentCode(args.componentId);
    await analyticsService.track({
        event: 'code_fetch',
        userId: user.userId,
        apiKeyId: user.keyId,
        tier: user.tier,
        keyPrefix: user.keyPrefix,
        componentId: args.componentId,
        tool: 'get_component_code',
        timestamp: Date.now(),
        success: !!code,
    });
    if (!code) {
        return mcpError('COMPONENT_NOT_FOUND', `Source code for "${args.componentId}" was not found.`);
    }
    return {
        componentId: args.componentId,
        name: meta.title,
        framework: args.framework || 'react',
        styling: args.styling || 'tailwind',
        code,
        dependencies: meta.dependencies,
    };
});
//# sourceMappingURL=getComponentCode.js.map