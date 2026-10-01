/**
 * Module specifier resolution — the part of indexing that silently loses edges
 * if done naively.
 *
 * Measured on this repository before implementation, every one of these classes
 * is real:
 *
 *   1. RELATIVE      `./x`, `../../y`                         — 264 files
 *   2. NODENEXT      `./config/env.js` meaning `env.ts`      — 238 files
 *   3. ALIAS         `@/…`, `@stores/…`, `@constants/…`      — 32 files
 *   4. QUERY/ASSET   `./x.css`, `../y.tsx?raw`               — 32 imports
 *
 * A resolver that only handles (1) drops 328 edges out of 864 attempts and
 * produces a graph that looks complete while missing the `mcp-server` entry
 * point entirely. Anything that still cannot be resolved is returned as
 * UNRESOLVED with its specifier attached — never dropped.
 */

import { existsSync, statSync, readFileSync } from 'node:fs';
import { join, resolve, dirname, extname, isAbsolute } from 'node:path';

/** Tried in order when a specifier has no extension. */
const EXT_CANDIDATES = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];
/** Tried when the specifier already names a file or a directory. */
const DIRECT_CANDIDATES = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];
const INDEX_CANDIDATES = ['index.ts', 'index.tsx', 'index.js', 'index.jsx', 'index.mjs'];
/**
 * NodeNext substitution: `.js` specifier → `.ts`/`.tsx` source.
 *
 * 238 of the 471 files in this repository use it (`import … from './env.js'`
 * meaning `env.ts`). These MUST be tried during resolution, not reported as
 * failures afterwards — otherwise the entire `mcp-server` and `cli` graphs
 * vanish, because every one of their edges is written this way.
 */
const NODENEXT_EXT = ['.ts', '.tsx', '.js', '.mjs', '.cjs'];

/** A specifier that points at something that is not code. */
const ASSET_RE = /\.(css|scss|less|svg|png|jpe?g|webp|gif|ico|glb|gltf|json5?|mp4|webm|wav|woff2?|ttf|otf|mdx?)$/i;

/**
 * Alias table, read from the repository's own configuration.
 *
 * Hardcoding this would be exactly the mistake the Phase 6 precedence rules
 * warn about: a stale copy of `vite.config.ts` inside a generator. It is parsed
 * from `frontend/vite.config.ts` and `frontend/tsconfig.json` at load time.
 */
export function loadAliases(root) {
  const aliases = [];

  const vite = join(root, 'frontend', 'vite.config.ts');
  if (existsSync(vite)) {
    const text = readFileSync(vite, 'utf8');
    const block = text.match(/alias\s*:\s*\{([\s\S]*?)\n\s*\}/);
    if (block) {
      const re = /['"]([^'"]+)['"]\s*:\s*(?:path\.)?resolve\([^,]*?,\s*['"]([^'"]+)['"]\s*\)/g;
      let m;
      while ((m = re.exec(block[1]))) {
        aliases.push({
          find: m[1],
          // `path.resolve(__dirname, '.')` yields the frontend root.
          target: normalizeTarget(root, m[2], 'frontend'),
          source: 'frontend/vite.config.ts',
        });
      }
    }
  }

  const tsconfig = join(root, 'frontend', 'tsconfig.json');
  if (existsSync(tsconfig)) {
    try {
      const json = JSON.parse(stripJsonComments(readFileSync(tsconfig, 'utf8')));
      const baseUrl = resolve(root, 'frontend', json.compilerOptions?.baseUrl ?? '.');
      for (const [find, targets] of Object.entries(json.compilerOptions?.paths ?? {})) {
        const target = Array.isArray(targets) ? targets[0] : targets;
        if (!target || !target.startsWith('.')) continue;
        if (aliases.some((a) => a.find === find)) continue;
        aliases.push({ find, target: resolve(baseUrl, target), source: 'frontend/tsconfig.json' });
      }
    } catch {
      /* a malformed tsconfig must not abort indexing; the vite table suffices */
    }
  }

  // Longest prefix wins, so `@app/stores` beats `@app` and `@` beats both.
  aliases.sort((a, b) => b.find.length - a.find.length);
  return aliases;
}

function normalizeTarget(root, target, base) {
  if (isAbsolute(target)) return target;
  return resolve(root, base, target);
}

function stripJsonComments(text) {
  return text
    .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, group) => (group ? '' : m))
    .replace(/,\s*([}\]])/g, '$1');
}

/**
 * Alias matching that cannot be fooled by npm scopes.
 *
 * The alias table contains `@` (the frontend root). A naive `startsWith('@')`
 * therefore swallows every scoped package in the tree — `@gsap/react`,
 * `@types/react`, `@radix-ui/react-dialog` — and reports them as broken alias
 * imports. Two guards:
 *
 *   1. An EXACT match wins outright, so a deliberately named alias such as
 *      `@stores` resolves before any prefix rule is considered.
 *   2. A prefix match must land on a path boundary (`@/…`), so `@` matches
 *      `@/components/x` and not `@gsap/react`.
 */
function matchAlias(specifier, aliases) {
  const exact = aliases.find((a) => a.find === specifier);
  if (exact) return { alias: exact, mode: 'exact' };
  for (const a of aliases) {
    if (a.find.endsWith('*')) {
      const stem = a.find.slice(0, -1);
      if (specifier.startsWith(stem)) return { alias: a, mode: 'wildcard' };
      continue;
    }
    if (specifier.startsWith(a.find) && specifier[a.find.length] === '/') {
      return { alias: a, mode: 'prefix' };
    }
  }
  return null;
}

/** Does this specifier have the shape of an npm package name? */
function looksLikePackage(specifier) {
  if (specifier.startsWith('@')) {
    const parts = specifier.slice(1).split('/');
    // `@scope/name`, or `@scope` alone.
    return parts.length >= 1 && parts[0].length > 0 && !specifier.startsWith('@/');
  }
  return !specifier.startsWith('.') && !specifier.startsWith('/');
}

/**
 * Build a resolver bound to one walk result.
 *
 * `files` is the absolute-path Set of every indexable file, so resolution
 * answers "does this exist in the index?" rather than "does this exist on
 * disk?" — which is what makes UNRESOLVED meaningful.
 */
export function makeResolver(root, files, aliases) {
  const byAbs = new Set(files.map((f) => f.abs));

  const firstExisting = (base) => {
    // NodeNext first: `./env.js` → `./env.ts` before `./env.js` is even tried.
    const baseExt = extname(base);
    if (NODENEXT_EXT.includes(baseExt)) {
      const stem = base.slice(0, -baseExt.length);
      for (const ext of NODENEXT_EXT) {
        if (byAbs.has(stem + ext)) return stem + ext;
      }
    }
    for (const ext of DIRECT_CANDIDATES) {
      const candidate = base + ext;
      if (byAbs.has(candidate)) return candidate;
      if (ext === '' && existsSync(candidate) && statSync(candidate).isDirectory()) {
        for (const idx of INDEX_CANDIDATES) {
          const withIndex = join(candidate, idx);
          if (byAbs.has(withIndex)) return withIndex;
        }
      }
    }
    return null;
  };

  /**
   * @returns {{kind:'internal'|'external'|'asset'|'unresolved', target?:string, specifier:string, detail?:string}}
   */
  function resolveSpecifier(specifier, fromAbs) {
    if (!specifier) return { kind: 'unresolved', specifier, detail: 'empty specifier' };

    // Vite query suffix: `./Thing.tsx?raw` → strip before resolving.
    const qIndex = specifier.indexOf('?');
    const bare = qIndex === -1 ? specifier : specifier.slice(0, qIndex);
    const query = qIndex === -1 ? null : specifier.slice(qIndex + 1);

    // Bare package specifier → external. Resolved by the bundler, not by us.
    if (!bare.startsWith('.') && !bare.startsWith('/')) {
      const m = matchAlias(bare, aliases);
      if (!m) {
        return { kind: 'external', specifier, detail: 'package' };
      }
      const rest = bare.slice(m.alias.find.replace(/\*$/, '').length).replace(/^\//, '');
      const base = m.alias.find.endsWith('*') ? join(m.alias.target, rest) : m.alias.target;
      const hit = firstExisting(base);
      if (hit) {
        return {
          kind: 'internal', target: hit, specifier, via: 'alias',
          detail: `${m.alias.source}:${m.alias.find} (${m.mode})`,
        };
      }
      // An alias whose target is missing is not automatically a broken import:
      // `@` also prefixes every scoped npm package. Only call it unresolved
      // when the specifier cannot be a package name.
      if (looksLikePackage(bare)) {
        return { kind: 'external', specifier, detail: `package (alias "${m.alias.find}" did not match on disk)` };
      }
      return { kind: 'unresolved', specifier, detail: `alias "${m.alias.find}" matched ${m.alias.source} but no file exists` };
    }

    // Absolute filesystem path.
    if (bare.startsWith('/')) {
      const hit = firstExisting(bare);
      return hit
        ? { kind: 'internal', target: hit, specifier }
        : { kind: 'unresolved', specifier, detail: 'absolute path not present in the index' };
    }

    const base = resolve(dirname(fromAbs), bare);
    const hit = firstExisting(base);
    if (hit) {
      return { kind: 'internal', target: hit, specifier, via: 'relative' };
    }

    // Nothing on disk. Classify why, so the failure is legible.
    if (ASSET_RE.test(bare)) {
      return { kind: 'asset', specifier, detail: query ? `asset with ?${query}` : 'asset' };
    }
    if (query) {
      return { kind: 'asset', specifier, detail: `query import ?${query}` };
    }
    const guessedExt = extname(bare);
    if (guessedExt && ['.js', '.mjs'].includes(guessedExt)) {
      return { kind: 'unresolved', specifier, detail: `bare .${guessedExt.slice(1)} specifier with no .ts/.tsx counterpart` };
    }
    if (!guessExt) {
      return { kind: 'unresolved', specifier, detail: 'extensionless specifier with no matching file or directory/index' };
    }
    return { kind: 'unresolved', specifier, detail: `no file matches ${bare}` };
  }

  return { resolveSpecifier, aliases, byAbs };
}