const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
      '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
      '--in-process-gpu', '--enable-webgl'
    ],
    headless: 'new',
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto('http://localhost:9981/test-flower-final.html', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for render
  try {
    await page.waitForFunction(() => window._renderComplete === true, { timeout: 15000 });
  } catch(e) {
    console.log('Waiting extra time for render...');
  }
  await new Promise(r => setTimeout(r, 5000));

  const outPath = path.join(__dirname, 'renders', 'flower-final-v1.png');
  await page.screenshot({ path: outPath, type: 'png' });
  console.log('Saved:', outPath);

  await browser.close();
})();
