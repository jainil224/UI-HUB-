import { usage } from '../errors.js';
import type { Ctx } from '../ctx.js';
import type { ParsedArgs } from '../args.js';
import type { Command } from './index.js';
import { green, out, printJson } from '../output.js';
import { strFlag } from '../args.js';
import { printDepsNote, resolveOutputPath, writeCodeFile } from './util.js';

export const code: Command = {
  help: 'Print component source code (or write it to a file)',
  usage: 'ui-hub code <componentId> [-o <file>] [--framework react] [--styling tailwind|css|scss] [--json]',
  async run(ctx: Ctx, args: ParsedArgs) {
    const id = args.pos[0];
    if (!id) usage('ui-hub code <componentId>');

    const params: Record<string, unknown> = { componentId: id };
    const framework = strFlag(args.flags, 'framework');
    if (framework) params.framework = framework;
    const styling = strFlag(args.flags, 'styling');
    if (styling) params.styling = styling;

    const res = await ctx.client.callTool('get_component_code', params);
    if (ctx.json) {
      printJson(res);
      return;
    }

    const name = res?.name ?? id;
    const source = typeof res?.code === 'string' ? res.code : JSON.stringify(res, null, 2);

    const output = strFlag(args.flags, 'output') ?? strFlag(args.flags, 'o');
    if (output) {
      const path = resolveOutputPath(output, id, name);
      writeCodeFile(path, source);
      out(green(`Saved ${name} to ${path}`));
      printDepsNote(res?.dependencies);
    } else {
      process.stdout.write(source);
      if (!source.endsWith('\n')) process.stdout.write('\n');
      printDepsNote(res?.dependencies);
    }
  },
};