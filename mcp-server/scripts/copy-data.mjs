import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const srcJson = path.join(root, 'src', 'data', 'sourceCode.json');
const distDataDir = path.join(root, 'dist', 'data');

if (!existsSync(srcJson)) {
  console.error('[copy-data] Missing src/data/sourceCode.json');
  process.exit(1);
}

mkdirSync(distDataDir, { recursive: true });
copyFileSync(srcJson, path.join(distDataDir, 'sourceCode.json'));
console.log('[copy-data] Copied sourceCode.json to dist/data/');
