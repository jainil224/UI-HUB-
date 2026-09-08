import { usage } from '../errors.js';
import { bold, dim, green, out, printJson, printSummaries, yellow } from '../output.js';
import { boolFlag, strFlag } from '../args.js';
export const animation = {
    help: "Inspect animations or fetch an animation's code",
    usage: 'ui-hub animation <animationId> | animation search [query]',
    async run(ctx, args) {
        const [sub, second] = args.pos;
        if (sub === 'search') {
            const params = {};
            if (second)
                params.query = second;
            const category = strFlag(args.flags, 'category');
            if (category)
                params.category = category;
            const premium = boolFlag(args.flags, 'premium');
            const free = boolFlag(args.flags, 'free');
            if (premium)
                params.isPremium = true;
            if (free)
                params.isPremium = false;
            const res = await ctx.client.callTool('search_animations', params);
            if (ctx.json) {
                printJson(res);
                return;
            }
            printSummaries(res?.animations, 'animations');
            out(dim(`${res?.count ?? res?.animations?.length ?? 0} animation(s).`));
            return;
        }
        if (!sub)
            usage('ui-hub animation <animationId>');
        const res = await ctx.client.callTool('get_animation_code', { animationId: sub });
        if (ctx.json) {
            printJson(res);
            return;
        }
        out(bold(String(res?.name ?? sub)));
        out(res?.isPremium ? yellow('premium animation — Pro required') : green('free animation'));
        if (res?.description)
            out(`${dim('Description  ')}${res.description}`);
        if (Array.isArray(res?.dependencies) && res.dependencies.length)
            out(`${dim('Dependencies')}  ${res.dependencies.join(', ')}`);
        if (typeof res?.code === 'string') {
            out('');
            out(bold('Code:'));
            out(res.code);
        }
    },
};
