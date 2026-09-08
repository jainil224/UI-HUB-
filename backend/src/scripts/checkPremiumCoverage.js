/**
 * Verifies every canonical premium component is resolvable by the backend.
 *
 * The backend serves source in this order: COMPONENT_FULL_SOURCES map, then
 * EMBEDDED_SOURCE_CODE map, then a filesystem fallback into
 * frontend/src/components. On the unified Render deploy the whole repo is
 * shipped, so the fs fallback is available; on a Vercel-function-only deploy
 * the maps must carry everything.
 *
 * This guard fails if any premium id is absent from BOTH the embedded maps AND
 * the frontend filesystem — an id in that state (e.g. black-hole, rubiks-cube,
 * toonhub-hero before they were embedded) silently 404s for Pro users.
 *
 * Usage: node src/scripts/checkPremiumCoverage.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PREMIUM_COMPONENT_IDS } from '../config/premiumComponents.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..');
const DATA_DIR = path.join(ROOT, 'backend', 'src', 'data');
const COMPONENTS_DIR = path.join(ROOT, 'frontend', 'src', 'components');

const full = await import(pathToFileURL(path.join(DATA_DIR, 'componentFullSources.js')).href);
const embedded = await import(pathToFileURL(path.join(DATA_DIR, 'sourceCodeData.js')).href);

const available = new Set([
  ...Object.keys(full.COMPONENT_FULL_SOURCES || {}),
  ...Object.keys(embedded.EMBEDDED_SOURCE_CODE || {}),
]);

// An id is OK if it is embedded OR resolvable on disk in frontend/src/components.
// Match the backend's fallback patterns: <PascalCase(id)>.tsx or <id>.tsx.
const kebabToPascal = (str) => str.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
const onDisk = (id) => {
  const candidates = new Set([`${kebabToPascal(id)}.tsx`, `${kebabToPascal(id)}.tsx`.toLowerCase(), `${id}.tsx`]);
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isFile() && candidates.has(entry.name)) return true;
      if (entry.isDirectory()) {
        if (walk(p)) return true;
      }
    }
    return false;
  };
  return walk(COMPONENTS_DIR);
};

const premiumIds = [...PREMIUM_COMPONENT_IDS];
const missing = premiumIds.filter((id) => !available.has(id) && !onDisk(id));

if (missing.length > 0) {
  console.error(`\ncheckPremiumCoverage FAILED: ${missing.length} premium component(s) unresolvable by the backend (not embedded, not on disk):`);
  for (const id of missing) console.error(`  - ${id}`);
  console.error('\nRun: node src/scripts/embedPremiumSources.js');
  console.error('This keeps premium source available to Pro users without a filesystem.\n');
  process.exit(1);
}

console.log(
  `checkPremiumCoverage OK: ${premiumIds.length}/${premiumIds.length} premium components resolvable (${premiumIds.filter((id) => available.has(id)).length} embedded, ${premiumIds.filter((id) => !available.has(id)).length} via filesystem fallback)`
);