import { usage } from '../errors.js';
import type { Ctx } from '../ctx.js';
import type { ParsedArgs } from '../args.js';
import type { Command } from './index.js';
import { dim, out, printComponents, printJson } from '../output.js';
import { numFlag, strFlag } from '../args.js';

export const behavior: Command = {
  help: 'Search components by visual behavior or vibe description',
  usage: 'ui-hub behavior "<describe the effect>" [--category <cat>] [--limit <n>] [--json]',
  async run(ctx: Ctx, args: ParsedArgs) {
    const query = args.pos[0];
    if (!query) usage('ui-hub behavior "<describe the effect>"');

    const params: Record<string, unknown> = { query };
    const category = strFlag(args.flags, 'category');
    if (category) params.category = category;
    params.limit = numFlag(args.flags, 'limit', 20);

    const res = await ctx.client.callTool('search_by_behavior', params);
    if (ctx.json) {
      printJson(res);
      return;
    }
    printComponents(res?.components);
    out(dim(`${res?.count ?? res?.components?.length ?? 0} match(es).`));
  },
};