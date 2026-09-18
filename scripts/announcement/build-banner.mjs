/**
 * UI-HUB — Animated GIF banner composer for the announcement email.
 *
 * Reads the 10 curated component PNG screenshots captured by
 * capture-previews.mjs, resizes each to a consistent canvas, and encodes
 * them into a single animated GIF using gifenc (pure-JS, no native deps).
 *
 * Usage:
 *   node scripts/announcement/build-banner.mjs
 *   node scripts/announcement/build-banner.mjs --fps 1   # one frame per second (~10s)
 *   node scripts/announcement/build-banner.mjs --width 640 --height 360
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const assetsDir = path.join(repoRoot, 'frontend', 'public', 'assets', 'component-previews');

const args = process.argv.slice(2);
const fpsIdx = args.indexOf('--fps');
const fps = fpsIdx !== -1 && args[fpsIdx + 1] ? Number(args[fpsIdx + 1]) : (1 / 3); // ~3s per frame
const widthIdx = args.indexOf('--width');
const width = widthIdx !== -1 && args[widthIdx + 1] ? Number(args[widthIdx + 1]) : 640;
const heightIdx = args.indexOf('--height');
const height = heightIdx !== -1 && args[heightIdx + 1] ? Number(args[heightIdx + 1]) : 360;

const BANNER_IDS = [
    'gravitational-vortex',
    'black-hole-3d',
    'blooming-flower',
    'chandelier',
    'spider-web',
    'twin-galaxy-rings',
    'tornado',
    'globe-mesh',
    'ascii-water',
    'ocean-swell',
];

const OUT_PATH = path.join(assetsDir, 'announcement-banner.gif');
const FRAME_DELAY_MS = Math.round(1000 / fps);
// gifenc uses centiseconds (1/100s) for delay.
const GIF_DELAY_CS = Math.max(1, Math.round(FRAME_DELAY_MS / 10));

async function main() {
    const { createRequire } = await import('node:module');
    const require = createRequire(path.join(repoRoot, 'frontend', 'package.json'));
    const sharp = require('sharp');
    const { default: { PNG } } = await import('pngjs');
    const gifenc = await import('gifenc');
    const GIFEncoder = gifenc.GIFEncoder || gifenc.default.GIFEncoder;
    const quantize = gifenc.quantize || gifenc.default.quantize;
    const applyPalette = gifenc.applyPalette || gifenc.default.applyPalette;

    fs.mkdirSync(assetsDir, { recursive: true });

    const frames = [];

    for (const id of BANNER_IDS) {
        const p = path.join(assetsDir, `${id}.png`);
        if (!fs.existsSync(p)) {
            console.error(`  ⚠️  Missing ${id}.png — skipping. Run capture-previews.mjs first.`);
            continue;
        }
        const { data: resized, info } = await sharp(p)
            .resize(width, height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
            .raw()
            .toBuffer({ resolveWithObject: true });
        frames.push({ id, raw: resized, width: info.width, height: info.height });
    }

    if (frames.length === 0) {
        console.error('❌ No frames found. Run capture-previews.mjs first.');
        process.exit(1);
    }

    console.log(`[GIF] Encoding ${frames.length} frames at ${width}×${height} | delay = ${(GIF_DELAY_CS / 100).toFixed(2)}s per frame`);

    // gifenc v1: GIFEncoder() then applyPalette(data, palette) to index.
    const gif = GIFEncoder();
    const paletteSize = 128;

    for (const frame of frames) {
        const palette = quantize(frame.raw, paletteSize);
        const indexed = applyPalette(frame.raw, palette);
        gif.writeFrame(indexed, width, height, { delay: GIF_DELAY_CS, palette });
    }

    gif.finish();
    const buffer = gif.bytes();
    fs.writeFileSync(OUT_PATH, buffer);

    const stats = fs.statSync(OUT_PATH);
    console.log(`[GIF] ✅ Written ${OUT_PATH}`);
    console.log(`[GIF]    Size: ${(stats.size / 1024).toFixed(0)} KB | Frames: ${frames.length} | ${width}×${height}`);
}

main().catch((err) => {
    console.error('[GIF] Fatal:', err);
    process.exit(1);
});