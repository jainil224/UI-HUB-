import { usage } from '../errors.js';
import type { Ctx } from '../ctx.js';
import type { ParsedArgs } from '../args.js';
import type { Command } from './index.js';
import { dim, out, printJson } from '../output.js';

export const deps: Command = {
  help: "List a component's dependencies",
  usage: 'ui-hub deps <componentId> [--json]',
  async run(ctx: Ctx, args: ParsedArgs) {
    const id = args.pos[0];
    if (!id) usage('ui-hub deps <componentId>');

    const res = await ctx.client.callTool('get_dependencies', { componentId: id });
    if (ctx.json) {
      printJson(res);
      return;
    }
    const list: string[] = Array.isArray(res?.dependencies) ? res.dependencies : [];
    if (list.length === 0) {
      out(dim('No dependencies.'));
      return;
    }
    out(`${list.length} dependencies for ${id}:`);
    for (const dep of list) out(`  ${dep}`);
  },
};