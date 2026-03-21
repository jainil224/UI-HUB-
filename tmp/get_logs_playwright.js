const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR:', err.message, '\n', err.stack));

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  } catch(e) {
    console.log("NAV_ERROR:", e.message);
  }
  await browser.close();
})();
