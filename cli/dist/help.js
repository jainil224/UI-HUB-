import { dim, out } from './output.js';
export function printHelp(commands) {
    out('ui-hub — UI HUB CLI. Search, inspect, and pull components, templates, and animations.');
    out('');
    out('Usage:');
    out('  ui-hub <command> [args] [options]');
    out('');
    out('Commands:');
    const entries = Object.entries(commands);
    const width = Math.max(...entries.map(([name]) => name.length), ...['template', 'animation', 'behavior'].map((n) => n.length)) + 3;
    for (const [name, cmd] of entries) {
        out(`  ${name.padEnd(width)}${cmd.help}`);
    }
    out('');
    out('Options:');
    out('  --json            Print raw JSON instead of formatted output');
    out('  --endpoint <url>  Override the MCP endpoint (default https://ui-hub-mcp.onrender.com/mcp)');
    out('  --key <key>       Override the API key (env: UI_HUB_API_KEY)');
    out('  -h, --help        Show this help');
    out('  -v, --version     Show version');
    out('');
    out('Examples:');
    out('  ui-hub login');
    out('  ui-hub search "pricing card"');
    out('  ui-hub behavior "magnetic pull on hover"');
    out('  ui-hub show spotlight-cards');
    out('  ui-hub code spotlight-cards -o src/components/');
    out('  ui-hub use spotlight-cards ./my-site');
    out('  ui-hub template source sui-overflow -o ./site.tsx');
    out('');
    out(dim('Premium source code and AI prompts require a Pro API key.'));
}
