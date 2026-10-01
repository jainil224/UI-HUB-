/**
 * Shared CLI argument handling for the agent CLIs.
 *
 * Extracted because route-task.mjs and context-task.mjs need identical
 * behaviour for `--json`, `--help` and positional task text, and two copies of
 * an argument parser is how they drift apart.
 *
 * The caller states explicitly which flags take a value. Inferring that from a
 * spec mapping is what made `--json "Fix MCP tools list"` swallow the task as
 * the value of `--json`, so the distinction is now declared rather than guessed.
 */

export class UsageError extends Error {}

/**
 * @param {string[]} argv
 * @param {{help?: string, booleans?: string[], values?: string[]}} spec
 */
export function parseArgs(argv, spec = {}) {
  const flags = {};
  const positional = [];
  const booleans = new Set(spec.booleans ?? []);
  const values = new Set(spec.values ?? []);
  let help = false;

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];

    if (a === '--') { positional.push(...argv.slice(i + 1)); break; }

    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      const key = eq === -1 ? a.slice(2) : a.slice(2, eq);
      if (eq !== -1) { flags[key] = a.slice(eq + 1); continue; }
      if (values.has(key)) {
        const next = argv[i + 1];
        if (next === undefined) throw new UsageError(`missing value for --${key}`);
        flags[key] = next;
        i += 1;
        continue;
      }
      flags[key] = true;
      continue;
    }

    if (a.startsWith('-') && a.length > 1) {
      for (const ch of a.slice(1)) {
        if (ch === 'h') { help = true; continue; }
        flags[ch] = true;
      }
      continue;
    }

    positional.push(a);
  }

  for (const b of booleans) if (flags[b] === undefined) delete flags[b];
  // `--help` must behave exactly like `-h`. Recognizing only the short form
  // made `agent:context --help` fall through to "a task is required".
  if (flags.help || flags.h) help = true;
  if (help) return { flags, positional, help: spec.help ?? '' };
  return { flags, positional, help: false };
}

export function printHelp(text) {
  process.stdout.write(text);
}