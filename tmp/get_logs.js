const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR:', err.message, '\nSTACK_TRACE:\n', err.stack));

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 15000 });
  } catch(e) {
    console.log("NAV_ERROR:", e.message);
  }

  await browser.close();
})();
