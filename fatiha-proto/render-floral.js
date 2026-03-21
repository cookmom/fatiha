const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto('http://localhost:9981/eid-floral.html', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for render to complete
  await page.waitForFunction(() => {
    return document.querySelector('canvas') !== null;
  });

  // Extra wait for watercolor layers
  await new Promise(r => setTimeout(r, 8000));

  await page.screenshot({ path: 'eid-floral-v1.png', fullPage: false });
  console.log('Screenshot saved: eid-floral-v1.png');

  await browser.close();
})();
