#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseArgs } from './args.js';
import { effectiveConfig } from './config.js';
import { CliError, EXIT } from './errors.js';
import { McpClient } from './mcp.js';
import { out, red } from './output.js';
import { commands } from './commands/index.js';
import { printHelp } from './help.js';
function readVersion() {
    try {
        const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
        return typeof pkg.version === 'string' ? pkg.version : '0.0.0';
    }
    catch {
        return '0.0.0';
    }
}
async function main() {
    const argv = process.argv.slice(2);
    const { pos, flags } = parseArgs(argv);
    const [command, ...rest] = pos;
    const json = flags.json === true;
    if (flags.help === true || command === 'help' || argv.length === 0) {
        printHelp(commands);
        return;
    }
    if (command === 'version' || flags.version === true) {
        out(`ui-hub ${readVersion()}`);
        return;
    }
    const cmd = commands[command ?? ''];
    if (!cmd) {
        throw new CliError('USAGE_ERROR', `Unknown command "${command ?? ''}".`, EXIT.USAGE);
    }
    const cfg = effectiveConfig({
        endpoint: typeof flags.endpoint === 'string' ? flags.endpoint : undefined,
        apiKey: typeof flags.key === 'string' ? flags.key : undefined,
    });
    const needsKey = !['login', 'config', 'logout'].includes(command);
    if (needsKey && !cfg.apiKey) {
        throw new CliError('AUTH_ERROR', 'No UI HUB API key found. Authenticate first: "ui-hub login" — or set UI_HUB_API_KEY.', EXIT.AUTH);
    }
    const client = new McpClient(cfg.endpoint, needsKey ? cfg.apiKey : undefined);
    const ctx = { client, json, endpoint: cfg.endpoint, apiKey: cfg.apiKey };
    await cmd.run(ctx, { pos: rest, flags });
}
main().catch((err) => {
    const e = err;
    const code = e?.code ?? 'ERROR';
    const message = e?.message ?? String(err);
    const json = process.argv.includes('--json');
    if (json) {
        out(JSON.stringify({ error: code, message }, null, 2));
    }
    else {
        console.error(red(`error: ${message}`));
        if (code === 'USAGE_ERROR')
            console.error('Run "ui-hub help" for usage.');
    }
    process.exitCode = e?.exitCode ?? EXIT.TOOL;
});
