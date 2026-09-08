import { usage } from '../errors.js';
import { green, out } from '../output.js';
import { componentFileName, joinDir, printDepsNote, writeCodeFile } from './util.js';
export const useCommand = {
    help: 'Download a component into a directory (writes Name.tsx + prints deps)',
    usage: 'ui-hub use <componentId> [dir]',
    async run(ctx, args) {
        const id = args.pos[0];
        const dir = args.pos[1] ?? '.';
        if (!id)
            usage('ui-hub use <componentId> [dir]');
        const res = await ctx.client.callTool('get_component_code', { componentId: id });
        const name = res?.name ?? id;
        const source = typeof res?.code === 'string' ? res.code : JSON.stringify(res, null, 2);
        const fileName = componentFileName(id, name);
        const path = joinDir(dir, fileName);
        writeCodeFile(path, source);
        out(green(`Saved ${name} to ${path}`));
        printDepsNote(res?.dependencies);
    },
};
