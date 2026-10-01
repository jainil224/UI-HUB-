#!/usr/bin/env node
/**
 * Knowledge-base validator — agent.md task 6.22.
 *
 * Checks that .uihub-agent/ is validated engineering knowledge rather than a
 * pile of unchecked Markdown:
 *
 *   - PROJECT_MAP.json parses
 *   - references between knowledge files resolve
 *   - required knowledge files exist
 *   - links to repository files resolve
 *   - no knowledge file is empty
 *
 * Exit: 0 = valid, 1 = invalid, 2 = could not evaluate.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const KB = '.uihub-agent';
const problems = [];
const notes = [];

function problem(msg) {
  problems.push(msg);
}

/** Files the knowledge base is expected to contain. */
const REQUIRED = [
  'AGENT.md',
  'PROJECT_MAP.json',
  'CONFLICTS.md',
  'PROJECT_CONTEXT.md',
  'APIs/API_OVERVIEW.md',
  'APIs/API_ARCHITECTURE.md',
  'APIs/CORS_CONTRACT.md',
  'architecture/ARCHITECTURE.md',
  'data/DATA_OVERVIEW.md',
  'design-system/DESIGN_SYSTEM.md',
  'features/FEATURES.md',
  'infrastructure/ENVIRONMENT_CONTRACT.md',
  'infrastructure/INFRASTRUCTURE.md',
  'infrastructure/DEPLOYMENT_MAP.md',
  'infrastructure/DEPLOYMENT_CONFLICTS.md',
  'infrastructure/CONFIGURATION_OWNERSHIP.md',
  'infrastructure/GENERATED_ARTIFACTS.md',
  'rules/DO_NOT_CHANGE.md',
  'rules/PROTECTED_PATHS.md',
  'security/SECURITY_OVERVIEW.md',
  'security/SECRET_HANDLING.md',
  'security/SECURITY_VALIDATION.md',
  'tasks/OWNER_DECISIONS.md',
  'runtime/DOCUMENTATION_ENDPOINT_AUDIT.md',
];

// ---------------------------------------------------------------------------
// 1. Required files exist and are non-empty
// ---------------------------------------------------------------------------

for (const rel of REQUIRED) {
  const p = join(KB, rel);
  if (!existsSync(p)) {
    problem(`required knowledge file missing: ${KB}/${rel}`);
    continue;
  }
  if (statSync(p).size < 200) {
    problem(`knowledge file suspiciously small (${statSync(p).size}B): ${KB}/${rel}`);
  }
}

// ---------------------------------------------------------------------------
// 2. PROJECT_MAP.json parses
// ---------------------------------------------------------------------------

let map = null;
{
  const p = join(KB, 'PROJECT_MAP.json');
  if (existsSync(p)) {
    try {
      map = JSON.parse(readFileSync(p, 'utf8'));
      notes.push('PROJECT_MAP.json parses');
    } catch (e) {
      problem(`PROJECT_MAP.json does not parse: ${e.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. References between knowledge files resolve
// ---------------------------------------------------------------------------

{
  let checked = 0;
  for (const rel of REQUIRED) {
    const p = join(KB, rel);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, 'utf8');
    // Markdown links to sibling knowledge files: [x](../foo/Bar.md)
    for (const m of text.matchAll(/\]\((\.{1,2}\/[^)#\s]+\.md)\)/g)) {
      const target = resolve(dirname(p), m[1]);
      checked++;
      if (!existsSync(target)) {
        problem(`${KB}/${rel}: link target does not exist: ${m[1]}`);
      }
    }
  }
  notes.push(`${checked} knowledge-file link(s) resolved`);
}

// ---------------------------------------------------------------------------
// 4. Backtick-quoted repository paths in required docs must exist
//    (skipped for glob/placeholder-ish references)
// ---------------------------------------------------------------------------

{
  const CANDIDATE = /`((?:backend|mcp-server|frontend|cli|\.github|\.uihub-agent)\/[A-Za-z0-9_\-./]+\.[a-z]{1,4})(?::\d+)?`/g;
  let checked = 0;
  for (const rel of REQUIRED) {
    const p = join(KB, rel);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, 'utf8');
    for (const m of text.matchAll(CANDIDATE)) {
      const target = m[1];
      if (target.includes('*') || target.includes('<')) continue;
      checked++;
      if (!existsSync(target)) {
        problem(`${KB}/${rel}: references non-existent path \`${target}\``);
      }
    }
  }
  notes.push(`${checked} in-document source path reference(s) resolved`);
}

// ---------------------------------------------------------------------------
// 5. PROJECT_MAP.json internal references
// ---------------------------------------------------------------------------

if (map) {
  // PROJECT_MAP.json records entries keyed by service area ("services.backend.key")
  // whose values are bare filenames like "accessService.js". Those are names,
  // not repo-root-relative paths, so they must not be checked as paths.
  //
  // Only values that are unambiguously repo-root-relative (contain a directory
  // component) are path references. This distinction is deliberate: a previous
  // version of this validator reported 29 false failures by treating service
  // names as paths.
  // A value is only treated as a repository path reference when ALL hold:
  //   - extension is a source/asset extension
  //   - no whitespace (excludes npm script commands and prose)
  //   - it begins with a known repository top-level directory
  // Everything else — service names ("accessService.js"), script commands
  // ("node src/server.js"), prose lists ("a.js, b.js") — is not a path.
  const TOP_LEVEL = /^(backend|mcp-server|frontend|cli|api|docs|component-specs|public)\//;
  const PATH_EXT = /\.(md|json|mjs|cjs|ts|tsx|js|jsx|ya?ml)$/;

  const walk = (node, path) => {
    if (typeof node === 'string') {
      if (PATH_EXT.test(node) && !/\s/.test(node) && TOP_LEVEL.test(node) && !node.includes('*')) {
        if (!existsSync(node)) problem(`PROJECT_MAP.json references missing file: ${node} (at ${path})`);
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, `${path}[${i}]`));
      return;
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(map, '');
  notes.push('PROJECT_MAP.json references walked');
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

for (const n of notes) console.log(`  ok    ${n}`);
for (const p of problems) console.log(`  FAIL  ${p}`);

console.log('');
console.log(
  `[check-knowledge] ${problems.length === 0 ? 'VALID' : 'INVALID'} — ${notes.length} check(s) passed, ${problems.length} problem(s)`,
);
process.exit(problems.length > 0 ? 1 : 0);