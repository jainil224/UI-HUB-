import { usage } from '../errors.js';
import type { Ctx } from '../ctx.js';
import type { ParsedArgs } from '../args.js';
import type { Command } from './index.js';
import { dim, out, printComponents, printJson, printSummaries } from '../output.js';
import { boolFlag, strFlag } from '../args.js';

export const search: Command = {
  help: 'Search components, templates, or animations',
  usage:
    'ui-hub search [query] [--kind components|templates|animations] [--category <cat>] [--framework react] [--styling tailwind|css|scss] [--tags a,b] [--premium|--free] [--json]',
  async run(ctx: Ctx, args: ParsedArgs) {
    const query = args.pos[0];
    const kinds: Record<string, string> = {
      components: 'search_components',
      templates: 'search_templates',
      animations: 'search_animations',
    };
    const kind = strFlag(args.flags, 'kind') ?? 'components';
    const tool = kinds[kind];
    if (!tool) usage(`Unknown kind "${kind}". Use components, templates, or animations.`);

    const params: Record<string, unknown> = {};
    if (query) params.query = query;
    const category = strFlag(args.flags, 'category');
    if (category) params.category = category;
    const framework = strFlag(args.flags, 'framework');
    if (framework) params.framework = framework;
    const styling = strFlag(args.flags, 'styling');
    if (styling) params.styling = styling;
    const tags = strFlag(args.flags, 'tags');
    if (tags) params.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    const premium = boolFlag(args.flags, 'premium');
    const free = boolFlag(args.flags, 'free');
    if (premium) params.isPremium = true;
    if (free) params.isPremium = false;

    const res = await ctx.client.callTool(tool, params);

    if (ctx.json) {
      printJson(res);
      return;
    }
    if (kind === 'components') {
      printComponents(res?.components);
      out(dim(`${res?.count ?? res?.components?.length ?? 0} component(s).`));
    } else if (kind === 'templates') {
      printSummaries(res?.templates, 'templates');
      out(dim(`${res?.count ?? res?.templates?.length ?? 0} template(s).`));
    } else {
      printSummaries(res?.animations, 'animations');
      out(dim(`${res?.count ?? res?.animations?.length ?? 0} animation(s).`));
    }
  },
};