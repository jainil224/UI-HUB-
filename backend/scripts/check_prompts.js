import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compData = fs.readFileSync(path.resolve(__dirname, '../../frontend/src/data/componentData.tsx'), 'utf8');
const idMatches = [...compData.matchAll(/id:\s*["']([^"']+)["']/g)].map(m => m[1]);
const uniqueIds = Array.from(new Set(idMatches));

console.log('Total Unique Component IDs:', uniqueIds.length);
console.log('Component IDs list:\n', JSON.stringify(uniqueIds, null, 2));
