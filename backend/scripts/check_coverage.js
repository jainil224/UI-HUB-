import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EMBEDDED_SOURCE_CODE } from '../src/data/sourceCodeData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compData = fs.readFileSync(path.resolve(__dirname, '../../frontend/src/data/componentData.tsx'), 'utf8');
const idMatches = [...compData.matchAll(/id:\s*["']([^"']+)["']/g)].map(m => m[1]);
const uniqueIds = Array.from(new Set(idMatches));

const missingOrShort = [];
for (const id of uniqueIds) {
  const code = EMBEDDED_SOURCE_CODE[id];
  if (!code || code.length < 100) {
    missingOrShort.push({ id, len: code ? code.length : 0 });
  }
}

console.log('Components with missing or short source code in EMBEDDED_SOURCE_CODE:', missingOrShort.length);
console.log(missingOrShort);
