import { z } from 'zod';
import { createTool, mcpError } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
import { permissionService } from '../services/permissionService.js';
export const get_template = createTool('get_template', 'Return complete template information and code.', z.object({
    templateId: z.string().min(1).describe('The unique ID of the template (prefix "template-...")'),
}), { requiresPremium: false }, async (args, user) => {
    const componentId = args.templateId.replace(/^template-/, '');
    const meta = componentService.getComponentMeta(componentId);
    if (!meta) {
        return mcpError('COMPONENT_NOT_FOUND', `The requested template "${args.templateId}" was not found.`);
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
                tool: 'get_template',
                timestamp: Date.now(),
            });
            return mcpError('PREMIUM_ACCESS_REQUIRED', 'This template requires a UI HUB Pro subscription.');
        }
    }
    const result = await componentService.getTemplate(args.templateId);
    await analyticsService.track({
        event: 'template_fetch',
        userId: user.userId,
        apiKeyId: user.keyId,
        tier: user.tier,
        keyPrefix: user.keyPrefix,
        componentId,
        tool: 'get_template',
        timestamp: Date.now(),
        success: !!result,
    });
    if (!result) {
        return mcpError('COMPONENT_NOT_FOUND', `The template "${args.templateId}" was not found.`);
    }
    return result;
});
//# sourceMappingURL=getTemplate.js.map