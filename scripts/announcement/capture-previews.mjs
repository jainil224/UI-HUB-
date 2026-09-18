/**
 * UI-HUB — Playwright screenshot capture for the announcement email banner.
 *
 * Starts the Vite dev server (if not already running), mounts the hidden
 * PreviewCapturePage for each curated banner + featured id, waits for
 * WebGL/animation settle, then screenshots each component panel into
 * frontend/public/assets/component-previews/<id>.png at exactly 1600×900.
 *
 * Usage:
 *   node scripts/announcement/capture-previews.mjs              # defaults
 *   node scripts/announcement/capture-previews.mjs --ids id1,id2
 *   node scripts/announcement/capture-previews.mjs --dev-url http://localhost:5173
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const outDir = path.join(repoRoot, 'frontend', 'public', 'assets', 'component-previews');

const args = process.argv.slice(2);
const idsArg = args.includes('--ids') ? args[args.indexOf('--ids') + 1] : null;
const devUrlArg = args.includes('--dev-url') ? args[args.indexOf('--dev-url') + 1] : null;

const CURATED_IDS = [
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
    'reflect-shader',
    'infinite-tendrils',
    'star-burst',
];

const captureIds = idsArg ? idsArg.split(',').map((s) => s.trim()).filter(Boolean) : CURATED_IDS;

const VITE_PORT = 3000;
let startedServer = false;
let baseUrl = devUrlArg || `http://localhost:${VITE_PORT}`;
let devServer = null;

async function ensureDevServer() {
    try {
        const res = await fetch(`${baseUrl}/api/v1/config/firebase`).catch(() => null);
        // Even a 404/500 means the server is up.
        if (res) return;
    } catch {
        // not running
    }

    console.log('[Capture] Starting Vite dev server...');
    devServer = spawn('npx', ['vite', 'dev', '--port', String(VITE_PORT)], {
        cwd: path.join(repoRoot, 'frontend'),
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
    });
    startedServer = true;

    // Wait until Vite is ready
    const deadline = Date.now() + 45_000;
    const check = async () => {
        if (Date.now() > deadline) throw new Error('Vite dev server failed to start within 45s');
        try {
            await fetch(`${baseUrl}/package.json`);
            return;
        } catch {
            await new Promise((r) => setTimeout(r, 800));
            return check();
        }
    };
    await check();
    console.log('[Capture] Vite dev server ready.');
}

async function run() {
    await ensureDevServer();
    fs.mkdirSync(outDir, { recursive: true });

    const { chromium } = await import('playwright');

    console.log(`[Capture] Launching Chromium and capturing ${captureIds.length} components...`);
    const browser = await chromium.launch({ args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
    const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();

    const url = `${baseUrl}/preview-capture?ids=${captureIds.join(',')}`;
    console.log(`[Capture] Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    // Allow animations + lazy loads + WebGL context setup to settle.
    await page.waitForTimeout(5000);

    for (const id of captureIds) {
        const selector = `[data-capture-id="${id}"]`;
        const outPath = path.join(outDir, `${id}.png`);

        try {
            const info = await page.evaluate((sel) => {
                const el = document.querySelector(sel);
                if (!el) return null;
                const rect = el.getBoundingClientRect();
                return { y: rect.y + window.scrollY, height: rect.height };
            }, selector);

            if (!info) {
                console.error(`  ❌ ${id}.png — element not found in DOM`);
                continue;
            }

            await page.screenshot({
                path: outPath,
                fullPage: true,
                clip: { x: 0, y: info.y, width: 1600, height: Math.max(info.height, 900) },
                animations: 'disabled',
            });
            const stats = fs.statSync(outPath);
            console.log(`  ✅ ${id}.png  (${(stats.size / 1024).toFixed(0)} KB)`);
        } catch (err) {
            console.error(`  ❌ ${id}.png — ${err.message.split('\n')[0]}`);
        }
    }

    await browser.close();
    console.log(`[Capture] Done. Screenshots saved to ${path.relative(repoRoot, outDir)}/`);
}

run()
    .catch((err) => {
        console.error('[Capture] Fatal error:', err);
        process.exit(1);
    })
    .finally(() => {
        if (devServer) {
            console.log('[Capture] Stopping Vite dev server...');
            devServer.kill('SIGINT');
        }
        process.exit(0);
    });