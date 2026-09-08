import { keyLabel } from '../config.js';
import { dim, out } from '../output.js';
export const whoami = {
    help: 'Show your current endpoint and connection status',
    usage: 'ui-hub whoami',
    async run(ctx, _args) {
        const list = await ctx.client.listTools();
        out(`Endpoint: ${ctx.endpoint}`);
        out(`API key:  ${keyLabel(ctx.apiKey)}`);
        out(`Tools:    ${list.tools.length} available`);
        out(dim('Auth: OK — your plan tier is enforced server-side.'));
    },
};
