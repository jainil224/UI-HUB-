import type { Ctx } from '../ctx.js';
import type { ParsedArgs } from '../args.js';

export interface Command {
  help: string;
  usage: string;
  run: (ctx: Ctx, args: ParsedArgs) => Promise<void>;
}

import { login } from './login.js';
import { configCmd, logout } from './config.js';
import { search } from './search.js';
import { show } from './show.js';
import { code } from './code.js';
import { deps } from './deps.js';
import { categories } from './categories.js';
import { prompt } from './prompt.js';
import { template } from './template.js';
import { animation } from './animation.js';
import { behavior } from './behavior.js';
import { useCommand } from './use.js';
import { whoami } from './whoami.js';

export const commands: Record<string, Command> = {
  login,
  logout,
  config: configCmd,
  search,
  show,
  code,
  deps,
  categories,
  prompt,
  template,
  animation,
  behavior,
  use: useCommand,
  whoami,
};