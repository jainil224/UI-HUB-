import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const DEFAULT_ENDPOINT = 'https://ui-hub-mcp.onrender.com/mcp';

export interface CliConfig {
  endpoint: string;
  apiKey?: string;
}

const CONFIG_DIR = () => join(homedir(), '.config', 'ui-hub');
export const userConfigPath = () => join(CONFIG_DIR(), 'config.json');
const projectConfigPath = () => join(process.cwd(), '.ui-hubrc.json');

function readJson(file: string): Record<string, unknown> {
  try {
    if (!existsSync(file)) return {};
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/**
 * Pure config resolution with explicit precedence.
 * API keys intentionally never come from project config (avoids accidental commits).
 */
export function resolveConfig(input: {
  flag?: Partial<CliConfig>;
  env?: Partial<CliConfig>;
  project?: Partial<CliConfig>;
  user?: Partial<CliConfig>;
}): CliConfig {
  const { flag = {}, env = {}, project = {}, user = {} } = input;
  const endpoint =
    flag.endpoint ??
    env.endpoint ??
    project.endpoint ??
    user.endpoint ??
    DEFAULT_ENDPOINT;
  const apiKey = flag.apiKey ?? env.apiKey ?? user.apiKey;
  return { endpoint, apiKey };
}

export function effectiveConfig(flag: Partial<CliConfig> = {}): CliConfig {
  const env: Partial<CliConfig> = {
    endpoint: process.env.UI_HUB_ENDPOINT,
    apiKey: process.env.UI_HUB_API_KEY,
  };
  return resolveConfig({
    flag,
    env,
    project: readJson(projectConfigPath()),
    user: readJson(userConfigPath()),
  });
}

export function saveUserConfig(cfg: CliConfig): void {
  mkdirSync(CONFIG_DIR(), { recursive: true });
  writeFileSync(userConfigPath(), JSON.stringify(cfg, null, 2) + '\n');
  try {
    chmodSync(userConfigPath(), 0o600);
  } catch {
    // best effort (e.g. Windows)
  }
}

export function keyLabel(key: string | undefined): string {
  if (!key) return 'not set';
  return key.startsWith('uh_live_') ? 'uh_live_…' : `…${key.slice(-4)}`;
}