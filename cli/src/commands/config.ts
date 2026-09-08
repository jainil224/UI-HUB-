import { usage } from '../errors.js';
import type { Ctx } from '../ctx.js';
import type { ParsedArgs } from '../args.js';
import type { Command } from './index.js';
import { effectiveConfig, keyLabel, saveUserConfig, userConfigPath } from '../config.js';
import { dim, out } from '../output.js';

export const configCmd: Command = {
  help: 'Show or change local CLI configuration',
  usage: 'ui-hub config [set-endpoint <url> | logout]',
  async run(_ctx: Ctx, args: ParsedArgs) {
    const [sub, value] = args.pos;
    if (sub === 'set-endpoint') {
      if (!value) usage('ui-hub config set-endpoint <url>');
      saveUserConfig({ endpoint: value, apiKey: effectiveConfig().apiKey });
      out(`Endpoint set to ${value}`);
      return;
    }
    if (sub === 'logout' || sub === 'unset') {
      saveUserConfig({ endpoint: effectiveConfig().endpoint });
      out('Stored API key removed.');
      return;
    }
    if (sub) usage(`Unknown config subcommand "${sub}". Run "ui-hub help".`);

    const cfg = effectiveConfig();
    out(`Endpoint:  ${cfg.endpoint}`);
    out(`API key:   ${keyLabel(cfg.apiKey)}`);
    out(`Stored in: ${userConfigPath()}`);
    out(dim('Override per-run with --endpoint / --key, or set UI_HUB_ENDPOINT / UI_HUB_API_KEY.'));
  },
};

export const logout: Command = {
  help: 'Remove your stored API key',
  usage: 'ui-hub logout',
  async run(_ctx: Ctx) {
    saveUserConfig({ endpoint: effectiveConfig().endpoint });
    out('Stored API key removed.');
  },
};