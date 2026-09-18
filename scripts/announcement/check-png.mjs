import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const require = createRequire(path.join(repoRoot, 'package.json'));
const { PNG } = require('pngjs');

const dir = path.join(repoRoot, 'frontend', 'public', 'assets', 'component-previews');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png') && !f.startsWith('announcement'));

for (const f of files) {
  const png = PNG.sync.read(fs.readFileSync(path.join(dir, f)));
  const { data, width, height } = png;
  let sum = 0, sum2 = 0, nonBlack = 0, bright = 0, n = 0;
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const lum = 0.2126*r + 0.7152*g + 0.0722*b;
    sum += lum; sum2 += lum*lum; n++;
    if (lum > 12) nonBlack++;
    if (lum > 150) bright++;
    const key = `${r >> 4},${g >> 4},${b >> 4}`;
    buckets.set(key, (buckets.get(key)||0)+1);
  }
  const mean = sum / n;
  const variance = (sum2 / n) - mean*mean;
  let top = 0;
  for (const c of buckets.values()) if (c > top) top = c;
  const topPct = (top / (width*height) * 100).toFixed(1);
  const verdict = mean < 5 && nonBlack < 100 ? '  ⚠️ BLANK' : '';
  console.log(
    `${f.padEnd(28)} lum=(${mean.toFixed(0).padStart(3)}, σ=${Math.sqrt(Math.max(variance,0)).toFixed(0).padStart(3)}) nonBlack=${(nonBlack/n*100).toFixed(1).padStart(5)}% bright=${(bright/n*100).toFixed(1).padStart(5)}% topBucket=${topPct.padStart(5)}%${verdict}`
  );
}