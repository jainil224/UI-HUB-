import { z } from 'zod';
import { createTool, mcpError } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
export const get_ai_prompts = createTool('get_ai_prompts', 'Return ready-to-use AI generation prompts (Claude, Antigravity, Lovable) for a specific UI HUB component. Requires a UI HUB Pro subscription.', z.object({
    componentId: z.string().min(1).describe('The unique ID of the component'),
    system: z
        .enum(['claude', 'antigravity', 'lovable'])
        .optional()
        .describe('Optionally request only one prompt system instead of all available'),
}), { requiresPremium: true }, async (args, user) => {
    const meta = componentService.getComponentMeta(args.componentId);
    if (!meta) {
        return mcpError('COMPONENT_NOT_FOUND', `The requested UI HUB component "${args.componentId}" was not found.`);
    }
    const prompts = componentService.getAiPrompts(args.componentId);
    await analyticsService.track({
        event: 'ai_prompt_fetch',
        userId: user.userId,
        apiKeyId: user.keyId,
        tier: user.tier,
        keyPrefix: user.keyPrefix,
        componentId: args.componentId,
        tool: 'get_ai_prompts',
        timestamp: Date.now(),
        success: !!prompts,
    });
    if (!prompts) {
        return mcpError('PROMPTS_NOT_FOUND', `No AI prompts are available for "${args.componentId}". Try get_component_code for its source instead.`);
    }
    const available = args.system
        ? { [args.system]: prompts[args.system] }
        : prompts;
    const filtered = Object.fromEntries(Object.entries(available).filter(([, v]) => typeof v === 'string'));
    return {
        componentId: args.componentId,
        name: meta.title,
        prompts: filtered,
        availableSystems: Object.keys(prompts),
    };
});
//# sourceMappingURL=getAiPrompts.js.map