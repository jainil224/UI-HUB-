import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const distDataDir = path.join(root, 'dist', 'data');

const dataFiles = [
  'sourceCode.json',
  'aiPrompts.json',
  'componentMetadata.json',
  'componentVibePrompts.json',
  'templates.json',
  'templateSourceCode.json',
];

mkdirSync(distDataDir, { recursive: true });

for (const file of dataFiles) {
  const src = path.join(root, 'src', 'data', file);
  if (!existsSync(src)) {
    console.error(`[copy-data] Missing src/data/${file}`);
    process.exit(1);
  }
  copyFileSync(src, path.join(distDataDir, file));
  console.log(`[copy-data] Copied ${file} to dist/data/`);
}