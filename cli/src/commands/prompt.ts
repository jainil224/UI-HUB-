import { usage } from '../errors.js';
import type { Ctx } from '../ctx.js';
import type { ParsedArgs } from '../args.js';
import type { Command } from './index.js';
import { dim, out, printJson } from '../output.js';
import { strFlag } from '../args.js';

const SYSTEMS = ['claude', 'antigravity', 'lovable'];

export const prompt: Command = {
  help: 'Print AI generation prompts for a component (Pro required)',
  usage: 'ui-hub prompt <componentId> [--system claude|antigravity|lovable] [--json]',
  async run(ctx: Ctx, args: ParsedArgs) {
    const id = args.pos[0];
    if (!id) usage('ui-hub prompt <componentId>');

    const params: Record<string, unknown> = { componentId: id };
    const system = strFlag(args.flags, 'system');
    if (system) {
      if (!SYSTEMS.includes(system)) usage('--system must be claude, antigravity, or lovable.');
      params.system = system;
    }

    const res = await ctx.client.callTool('get_ai_prompts', params);
    if (ctx.json) {
      printJson(res);
      return;
    }

    const prompts: Record<string, string> = res?.prompts ?? {};
    const entries = Object.entries(prompts);
    if (entries.length === 0) {
      out(dim('No prompts available for this component.'));
      return;
    }
    for (const [systemName, text] of entries) {
      out(dim(`# ${systemName}`));
      out(text ?? '');
      out('');
    }
  },
};