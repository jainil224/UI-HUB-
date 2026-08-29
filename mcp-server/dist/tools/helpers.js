import { permissionService } from '../services/permissionService.js';
import { analyticsService } from '../services/analyticsService.js';
/**
 * Helper to build an MCP tool with input validation and permission checks.
 */
export function createTool(name, description, inputSchema, options, handler) {
    return {
        name,
        description,
        inputSchema: inputSchema,
        handler: async (rawArgs, context) => {
            const user = context.user;
            // Permission check for premium resources
            if (options.requiresPremium) {
                const auth = permissionService.authorize(user, { isPremium: true });
                if (!auth.allowed) {
                    await analyticsService.track({
                        event: 'premium_denied',
                        userId: user.userId,
                        apiKeyId: user.keyId,
                        tier: user.tier,
                        keyPrefix: user.keyPrefix,
                        tool: name,
                        timestamp: Date.now(),
                    });
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({ error: auth.error, message: auth.message }),
                            },
                        ],
                        isError: true,
                    };
                }
            }
            // Validate inputs
            const parsed = inputSchema.safeParse(rawArgs);
            if (!parsed.success) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                error: 'VALIDATION_ERROR',
                                message: 'Invalid parameters.',
                                details: parsed.error.flatten(),
                            }),
                        },
                    ],
                    isError: true,
                };
            }
            try {
                const result = await handler(parsed.data, user);
                // If the handler already returned an MCP result (with content/isError), pass it through
                if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                    return result;
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                error: error?.error || 'TOOL_ERROR',
                                message: error?.message || 'The tool failed to execute.',
                            }),
                        },
                    ],
                    isError: true,
                };
            }
        },
    };
}
/**
 * Wrap a result into an MCP success result.
 */
export function mcpResult(data) {
    return {
        content: [
            {
                type: 'text',
                text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
            },
        ],
    };
}
/**
 * Wrap an error into an MCP error result.
 */
export function mcpError(error, message) {
    return {
        content: [{ type: 'text', text: JSON.stringify({ error, message }, null, 2) }],
        isError: true,
    };
}
//# sourceMappingURL=helpers.js.map