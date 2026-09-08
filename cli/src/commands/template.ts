import { usage } from '../errors.js';
import type { Ctx } from '../ctx.js';
import type { ParsedArgs } from '../args.js';
import type { Command } from './index.js';
import { bold, dim, green, out, printJson, printSummaries, yellow } from '../output.js';
import { boolFlag, strFlag } from '../args.js';
import { writeCodeFile } from './util.js';

export const template: Command = {
  help: 'Inspect templates or fetch the full source of a website template',
  usage: 'ui-hub template <templateId> | template search [query] | template source <templateId> [-o <file>]',
  async run(ctx: Ctx, args: ParsedArgs) {
    const [sub, second] = args.pos;

    if (sub === 'search') {
      const params: Record<string, unknown> = {};
      if (second) params.query = second;
      const category = strFlag(args.flags, 'category');
      if (category) params.category = category;
      const premium = boolFlag(args.flags, 'premium');
      const free = boolFlag(args.flags, 'free');
      if (premium) params.isPremium = true;
      if (free) params.isPremium = false;
      const res = await ctx.client.callTool('search_templates', params);
      if (ctx.json) {
        printJson(res);
        return;
      }
      printSummaries(res?.templates, 'templates');
      out(dim(`${res?.count ?? res?.templates?.length ?? 0} template(s).`));
      return;
    }

    if (sub === 'source') {
      if (!second) usage('ui-hub template source <templateId>');
      const res = await ctx.client.callTool('get_template_source', { templateId: second });
      if (ctx.json) {
        printJson(res);
        return;
      }
      out(bold(String(res?.title ?? second)));
      if (res?.isPro) out(yellow('premium template'));
      if (res?.description) out(String(res.description));
      out('');
      const source = res?.source;
      if (!source) {
        out(dim('No source attached to this template.'));
        return;
      }
      const sourceText = typeof source === 'string' ? source : JSON.stringify(source, null, 2);
      const output = strFlag(args.flags, 'output') ?? strFlag(args.flags, 'o');
      if (output) {
        writeCodeFile(output, sourceText);
        out(green(`Saved source to ${output}`));
      } else {
        process.stdout.write(sourceText);
        if (!sourceText.endsWith('\n')) process.stdout.write('\n');
      }
      return;
    }

    if (!sub) usage('ui-hub template <templateId>');
    const res = await ctx.client.callTool('get_template', { templateId: sub });
    if (ctx.json) {
      printJson(res);
      return;
    }
    out(bold(String(res?.name ?? sub)));
    out(res?.isPremium ? yellow('premium template — Pro required') : green('free template'));
    if (res?.description) out(`${dim('Description  ')}${res.description}`);
    if (Array.isArray(res?.dependencies) && res.dependencies.length)
      out(`${dim('Dependencies')}  ${res.dependencies.join(', ')}`);
    if (typeof res?.code === 'string') {
      out('');
      out(bold('Source:'));
      out(res.code);
    }
  },
};