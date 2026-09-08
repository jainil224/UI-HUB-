/**
 * Adds premium component source into backend/src/data/componentFullSources.js.
 *
 * The backend serves premium source from embedded maps ordered before the
 * filesystem fallback. sourceCodeData.js (EMBEDDED_SOURCE_CODE) holds most
 * sources, but some premium-only ids (black-hole, rubiks-cube, toonhub-hero)
 * are absent from it, so this script reads their real .tsx files and merges
 * them into the full-sources map.
 *
 * Idempotent: never overwrites an existing key. Only ever ADDS.
 *
 * Usage: node src/scripts/embedPremiumSources.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..');
const DATA_DIR = path.join(ROOT, 'backend', 'src', 'data');
const UI_DIR = path.join(ROOT, 'frontend', 'src', 'components', 'ui');

const ADDITIONS = {
  'black-hole': 'BlackHole.tsx',
  'rubiks-cube': 'RubiksCube.tsx',
  'toonhub-hero': 'ToonhubHero.tsx',
};

const FILE = path.join(DATA_DIR, 'componentFullSources.js');
let src = fs.readFileSync(FILE, 'utf8');

if (!src.includes('export const COMPONENT_FULL_SOURCES')) {
  console.error('embedPremiumSources: unexpected file format in ' + FILE);
  process.exit(1);
}

const existing = new Set();
const idRe = /^\s{2}"([^"]+)":/gm;
let m;
while ((m = idRe.exec(src)) !== null) existing.add(m[1]);

let added = 0;
for (const [id, file] of Object.entries(ADDITIONS)) {
  if (existing.has(id)) continue;
  const fp = path.join(UI_DIR, file);
  if (!fs.existsSync(fp)) {
    console.warn(`embedPremiumSources: source file missing for ${id}: ${fp}`);
    continue;
  }
  const content = fs.readFileSync(fp, 'utf8');
  const json = JSON.stringify(content);
  src = src.replace(/\n};/, `\n  "${id}": ${json},\n};`);
  console.log(`  added ${id} (${content.length} chars)`);
  added++;
}

if (added > 0) {
  fs.writeFileSync(FILE, src, 'utf8');
  console.log(`embedPremiumSources: merged ${added} premium source(s) into ${path.basename(FILE)}`);
} else {
  console.log('embedPremiumSources: nothing to add — all premium sources already present');
}
