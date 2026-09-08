import type { Ctx } from '../ctx.js';
import type { ParsedArgs } from '../args.js';
import type { Command } from './index.js';
import { dim, out, printJson, printTable } from '../output.js';

export const categories: Command = {
  help: 'List component categories with counts',
  usage: 'ui-hub categories [--json]',
  async run(ctx: Ctx, _args: ParsedArgs) {
    const res = await ctx.client.callTool('list_categories', {});
    if (ctx.json) {
      printJson(res);
      return;
    }
    const rows = (res?.categories ?? []).map((c: any) => [
      String(c.label ?? c.slug ?? ''),
      String(c.count ?? ''),
    ]);
    printTable(rows, ['CATEGORY', 'COUNT']);
    out(dim(`Total: ${res?.total ?? ''}`));
  },
};