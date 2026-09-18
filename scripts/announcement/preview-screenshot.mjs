import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prevDir = path.join(__dirname, '..', '..', 'backend', 'email-previews');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 620, height: 1000 } });
await page.goto('file:///' + prevDir.replace(/\\/g, '/') + '/announcement-email.html', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);
const h = await page.evaluate(() => document.body.scrollHeight);
await page.screenshot({ path: path.join(prevDir, 'announcement-email.png'), fullPage: true });
await browser.close();
console.log('screenshot saved:', path.join(prevDir, 'announcement-email.png'), 'height', h, 'px');