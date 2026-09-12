import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

const sourceSvg = fs.readFileSync(path.join(publicDir, 'favicon.svg'), 'utf8');

const lightSvg = sourceSvg.replace(
  /<style>[\s\S]*?<\/style>/,
  '<style>:root{color-scheme:light}.logo-base{fill:#000000}</style>'
);

const outputs = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'favicon-48x48.png', size: 48 },
  { file: 'favicon-96x96.png', size: 96 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'android-chrome-192x192.png', size: 192 },
  { file: 'android-chrome-512x512.png', size: 512 },
];

const pngBlobs = {};

for (const { file, size } of outputs) {
  const png = await sharp(Buffer.from(lightSvg), { density: 300 })
    .resize(size, size)
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(publicDir, file), png);
  pngBlobs[size] = png;
  console.log(`Generated ${file} (${size}x${size})`);
}

const icoSizes = [16, 32, 48];
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);

const entries = [];
const offsets = [];
let offset = 6 + icoSizes.length * 16;

for (const size of icoSizes) {
  const png = pngBlobs[size];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  entries.push(entry);
  offsets.push(png);
  offset += png.length;
}

const ico = Buffer.concat([header, ...entries, ...offsets]);
await fs.promises.writeFile(path.join(publicDir, 'favicon.ico'), ico);
console.log(`Generated favicon.ico (${icoSizes.join('/')}px)`);