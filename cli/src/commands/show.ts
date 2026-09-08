import { usage } from '../errors.js';
import type { Ctx } from '../ctx.js';
import type { ParsedArgs } from '../args.js';
import type { Command } from './index.js';
import { bold, dim, green, out, printJson, renderKV, yellow } from '../output.js';
import { safeFetch } from './util.js';

export const show: Command = {
  help: 'Show full component info (code, dependencies, metadata)',
  usage: 'ui-hub show <componentId> [--json]',
  async run(ctx: Ctx, args: ParsedArgs) {
    const id = args.pos[0];
    if (!id) usage('ui-hub show <componentId>');

    const detail = await ctx.client.callTool('get_component', { componentId: id });
    const deps = await safeFetch(ctx.client, 'get_dependencies', { componentId: id });
    const meta = await safeFetch(ctx.client, 'get_component_metadata', { componentId: id });

    if (ctx.json) {
      printJson({ ...detail, dependencies: deps?.dependencies, metadata: meta ?? undefined });
      return;
    }

    const name = detail?.name ?? detail?.title ?? id;
    out(bold(String(name)));
    out(detail?.isPremium ? yellow('premium component — Pro required') : green('free component'));
    out('');
    renderKV('ID', detail?.id);
    renderKV('Category', detail?.category);
    renderKV('Framework', detail?.framework);
    renderKV('Styling', detail?.styling);
    if (detail?.description) renderKV('Description', detail.description);
    if (Array.isArray(deps?.dependencies) && deps.dependencies.length) renderKV('Dependencies', deps.dependencies.join(', '));
    if (detail?.installation) renderKV('Install', detail.installation);
    if (detail?.usageExample) renderKV('Usage', detail.usageExample);
    if (Array.isArray(detail?.tags) && detail.tags.length) renderKV('Tags', detail.tags.join(', '));

    if (meta && Array.isArray(meta.props) && meta.props.length) {
      out('');
      out(bold('Props:'));
      for (const p of meta.props) {
        const desc = typeof p.description === 'string' && p.description ? p.description : p.type ?? '';
        out(`  ${p.name}  ${dim(desc)}`);
      }
    }

    if (typeof detail?.code === 'string') {
      out('');
      out(bold(`Source (${id}.tsx):`));
      out(detail.code);
    }
  },
};