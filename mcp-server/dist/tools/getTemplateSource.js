import { z } from 'zod';
import { createTool, mcpError } from './helpers.js';
import { componentService } from '../services/componentService.js';
import { analyticsService } from '../services/analyticsService.js';
export const get_template_source = createTool('get_template_source', 'Return the full source code and metadata for a complete website template from the UI HUB catalog (e.g. "tars-protocol", "sui-overflow"). Requires a UI HUB Pro subscription.', z.object({
    templateId: z.string().min(1).describe('The unique ID of the website template'),
}), { requiresPremium: true }, async (args, user) => {
    const result = componentService.getTemplateSource(args.templateId);
    await analyticsService.track({
        event: 'template_source_fetch',
        userId: user.userId,
        apiKeyId: user.keyId,
        tier: user.tier,
        keyPrefix: user.keyPrefix,
        componentId: args.templateId,
        tool: 'get_template_source',
        timestamp: Date.now(),
        success: !!result,
    });
    if (!result) {
        return mcpError('TEMPLATE_NOT_FOUND', `The website template "${args.templateId}" was not found in the template catalog.`);
    }
    const { template, source } = result;
    return {
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        framework: template.framework,
        styling: template.styling,
        animation: template.animation,
        isPro: template.isPro,
        liveDemoUrl: template.liveDemoUrl,
        githubUrl: template.githubUrl,
        previewGradient: template.previewGradient,
        accentColor: template.accentColor,
        stats: template.stats,
        features: template.features,
        source: source || null,
        hasSource: !!source,
    };
});
//# sourceMappingURL=getTemplateSource.js.map