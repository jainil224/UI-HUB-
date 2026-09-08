import { usage } from '../errors.js';
import { dim, out, printJson } from '../output.js';
export const deps = {
    help: "List a component's dependencies",
    usage: 'ui-hub deps <componentId> [--json]',
    async run(ctx, args) {
        const id = args.pos[0];
        if (!id)
            usage('ui-hub deps <componentId>');
        const res = await ctx.client.callTool('get_dependencies', { componentId: id });
        if (ctx.json) {
            printJson(res);
            return;
        }
        const list = Array.isArray(res?.dependencies) ? res.dependencies : [];
        if (list.length === 0) {
            out(dim('No dependencies.'));
            return;
        }
        out(`${list.length} dependencies for ${id}:`);
        for (const dep of list)
            out(`  ${dep}`);
    },
};
