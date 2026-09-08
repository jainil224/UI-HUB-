import { dim, out, printJson, printTable } from '../output.js';
export const categories = {
    help: 'List component categories with counts',
    usage: 'ui-hub categories [--json]',
    async run(ctx, _args) {
        const res = await ctx.client.callTool('list_categories', {});
        if (ctx.json) {
            printJson(res);
            return;
        }
        const rows = (res?.categories ?? []).map((c) => [
            String(c.label ?? c.slug ?? ''),
            String(c.count ?? ''),
        ]);
        printTable(rows, ['CATEGORY', 'COUNT']);
        out(dim(`Total: ${res?.total ?? ''}`));
    },
};
