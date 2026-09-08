import { Writable } from 'node:stream';
import readline from 'node:readline';
import { CliError, EXIT, usage } from '../errors.js';
import { saveUserConfig, userConfigPath } from '../config.js';
import { McpClient } from '../mcp.js';
import { dim, green, out } from '../output.js';
import { strFlag } from '../args.js';
function promptHidden(prompt) {
    if (!process.stdin.isTTY) {
        throw new CliError('AUTH_ERROR', 'Interactive login requires a terminal. Pass the key explicitly: ui-hub login --key uh_live_… (or set UI_HUB_API_KEY).', EXIT.AUTH);
    }
    return new Promise((resolve) => {
        const muted = new Writable({
            write(_chunk, _enc, cb) {
                cb();
            },
        });
        process.stdout.write(prompt);
        const rl = readline.createInterface({ input: process.stdin, output: muted, terminal: true });
        rl.question('', (answer) => {
            rl.close();
            process.stdout.write('\n');
            resolve(answer.trim());
        });
    });
}
export const login = {
    help: 'Authenticate and store your UI HUB API key',
    usage: 'ui-hub login [--key <uh_live_…>] [--endpoint <url>]',
    async run(ctx, args) {
        let key = strFlag(args.flags, 'key');
        if (!key)
            key = await promptHidden('UI HUB API key (create one at ui-hub.onrender.com/dashboard/mcp): ');
        if (!key)
            usage('No API key provided.');
        const client = new McpClient(ctx.endpoint, key);
        let toolCount;
        try {
            const list = await client.listTools();
            toolCount = list.tools.length;
        }
        catch (err) {
            throw new CliError(err?.code ?? 'AUTH_ERROR', `${err?.message ?? 'Invalid API key.'} The key was not saved.`, EXIT.AUTH);
        }
        saveUserConfig({ endpoint: ctx.endpoint, apiKey: key });
        out(green('Authenticated.'));
        out(`${toolCount} tools available at ${ctx.endpoint}`);
        out(dim(`Key stored in ${userConfigPath()} (0600).`));
    },
};
