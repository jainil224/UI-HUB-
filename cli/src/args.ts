import { usage } from './errors.js';

const BOOLEAN_FLAGS = new Set(['json', 'help', 'version', 'premium', 'free']);

export interface ParsedArgs {
  pos: string[];
  flags: Record<string, string | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const pos: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--') {
      for (let j = i + 1; j < argv.length; j++) pos.push(argv[j]!);
      break;
    }
    if (arg.startsWith('--')) {
      let name = arg.slice(2);
      let value: string | boolean = true;
      const eq = name.indexOf('=');
      if (eq !== -1) {
        value = name.slice(eq + 1);
        name = name.slice(0, eq);
      }
      if (!name) usage(`Invalid flag "${arg}".`);
      if (value === true && !BOOLEAN_FLAGS.has(name)) {
        value = argv[++i];
        if (value === undefined) usage(`Flag "--${name}" requires a value.`);
      }
      flags[name] = value;
      continue;
    }
    if (arg.length > 1 && arg.startsWith('-') && arg !== '-') {
      if (arg === '-h') {
        flags.help = true;
        continue;
      }
      if (arg === '-v') {
        flags.version = true;
        continue;
      }
      const value = argv[++i];
      if (value === undefined) usage(`Flag "${arg}" requires a value.`);
      flags[arg.slice(1)] = value;
      continue;
    }
    pos.push(arg);
  }
  return { pos, flags };
}

export function strFlag(flags: Record<string, string | boolean>, name: string): string | undefined {
  const v = flags[name];
  return typeof v === 'string' ? v : undefined;
}

export function boolFlag(flags: Record<string, string | boolean>, name: string): boolean {
  return flags[name] === true;
}

export function numFlag(flags: Record<string, string | boolean>, name: string, fallback: number): number {
  const v = strFlag(flags, name);
  if (v === undefined) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) usage(`Flag "--${name}" expects a number, got "${v}".`);
  return n;
}