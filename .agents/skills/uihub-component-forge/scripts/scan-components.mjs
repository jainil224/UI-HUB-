#!/usr/bin/env node
/**
 * scan-components.mjs
 *
 * UI-HUB Component Forge - Phase 1 maintenance script.
 *
 * Refreshes per-file derived fields inside `data/component-index.json` by
 * re-walking the `filePath` of every existing entry and recomputing:
 *   - lineCount
 *   - dependencies  (package/relative imports found in the file)
 *   - stylingMethod (tailwind / CSS modules / inline-styles / none)
 *   - animationTech (heuristics from the source text)
 *
 * RULES (hard constraints):
 *   1. It NEVER adds or removes entries, and NEVER derives categories,
 *      names, or slugs from filenames. The index is the source of truth.
 *   2. It NEVER writes outside the skill folder (only data/component-index.json).
 *   3. Zero external dependencies; runs on plain Node (>=18) ESM.
 *   4. Write is atomic: write to a temp file, then rename over the target.
 *
 * Usage (from the skill folder):
 *   node scripts/scan-components.mjs
 *
 * Exit codes: 0 = ok (files possibly rewritten), 1 = missing/misread file,
 *             2 = index missing or malformed.
 */

import { readFile, writeFile, rename, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(SKILL_ROOT, 'data', 'component-index.json');
const TMP_PATH = path.join(SKILL_ROOT, 'data', '.component-index.json.tmp');

/** Medley of likely external packages so pure relative imports don't get counted. */
const PACKAGE_IMPORT = /^import\s+(?:[\s\S]*?\s+from\s+)?['"]([a-zA-Z@][^'"]*)['"]/gm;

/** Detect mention of a styling/anim tech in the source text. */
const INLINE_STYLE_RE = /style=\{\{|style=\{object|cx\s*\(/;
const TAILWIND_RE = /\b(?:flex|grid|absolute|fixed|relative|rounded|px-|py-|m[trblxy]?-|items-|justify-|bg-|text-|w-|h-|z-)[\w-]+/;
const WEBGL_RE = /webgl|getContext\(['"]webgl|WebGLRenderer|THREE\./;
const CANVAS_RE = /getContext\(['"]2d['"]\)/;
const RAF_RE = /requestAnimationFrame/;
const REACT_SPRING_RE = /@react-spring|useSpring|animated\b/;
const FRAMER_RE = /framer-motion|motion\/react|useMotionValue|useMotionTemplate|useAnimationControl|useAnimate\b|\bmotion\.|<motion\./;
const CSS_ANIM_RE = /@keyframes|animation:\s|animationName/;
const REVEAL_RE = /IntersectionObserver|onScroll\(|\bdata-aos\b/;

/**
 * Pull dependency names out of an import statement.
 * Handles default/named/namespace imports plus inline side-effect imports.
 */
function depsFromSource(source) {
  const deps = new Set();
  const lines = source.split('\n');
  for (const line of lines) {
    const isImport = /^import\s/.test(line.trim()) || /^import\s*\(/.test(line.trim());
    if (!isImport) continue;
    const relaxed = /import\s*\(?\s*['"]([^'"]+)['"]/.exec(line);
    const from = /from\s+['"]([^'"]+)['"]/.exec(line);
    const raw = from ? from[1] : relaxed ? relaxed[1] : null;
    if (!raw) continue;
    const clean = raw.startsWith('.') ? null : raw.split('/')[0].startsWith('@') ? raw.split('/').slice(0, 2).join('/') : raw.split('/')[0];
    if (clean && !deps.has(clean)) deps.add(clean);
  }
  return [...deps].sort();
}

function stylingFromSource(source) {
  if (INLINE_STYLE_RE.test(source)) return 'inline-styles';
  if (TAILWIND_RE.test(source)) return 'tailwind';
  return 'none';
}

function animationTechFromSource(source) {
  const tech = [];
  if (WEBGL_RE.test(source)) tech.push('webgl');
  if (CANVAS_RE.test(source)) tech.push('canvas');
  if (RAF_RE.test(source)) tech.push('requestAnimationFrame');
  if (REACT_SPRING_RE.test(source)) tech.push('react-spring');
  if (FRAMER_RE.test(source)) tech.push('framer-motion');
  if (CSS_ANIM_RE.test(source)) tech.push('css-keyframes');
  if (REVEAL_RE.test(source)) tech.push('scroll-reveal');
  return tech;
}

async function main() {
  let index;
  try {
    index = JSON.parse(await readFile(INDEX_PATH, 'utf8'));
  } catch (err) {
    console.error(`[scan] FAILED: cannot read index at ${INDEX_PATH}: ${err.message}`);
    process.exit(2);
  }
  if (!Array.isArray(index) || index.length === 0) {
    console.error('[scan] FAILED: index is not a non-empty array.');
    process.exit(2);
  }

  let changed = false;
  const root = path.resolve(SKILL_ROOT, '..', '..', '..'); // repo root (three levels up from .agents/skills/<skill>)

  for (const entry of index) {
    const rel = entry.filePath;
    const abs = path.resolve(root, rel);
    try {
      await stat(abs);
    } catch {
      console.error(`[scan] ERROR: ${rel} does not exist (entry: ${entry.slug})`);
      process.exit(1);
    }
    const source = await readFile(abs, 'utf8');
    const lines = source.split('\n');
    const next = {
      lineCount: lines.length,
      dependencies: depsFromSource(source),
      stylingMethod: stylingFromSource(source),
      animationTech: animationTechFromSource(source),
    };
    for (const [k, v] of Object.entries(next)) {
      if (JSON.stringify(entry[k]) !== JSON.stringify(v)) {
        entry[k] = v;
        changed = true;
      }
    }
  }

  if (changed) {
    await writeFile(TMP_PATH, JSON.stringify(index, null, 2) + '\n', 'utf8');
    await rename(TMP_PATH, INDEX_PATH);
    console.log(`[scan] OK: refreshed ${index.length} entries (changes written).`);
  } else {
    console.log(`[scan] OK: refreshed ${index.length} entries (no changes).`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(`[scan] UNEXPECTED: ${err.stack || err.message}`);
  process.exit(1);
});