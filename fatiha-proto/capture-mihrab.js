const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
      '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
      '--in-process-gpu', '--enable-webgl'
    ]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  // Capture console messages
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  const url = 'http://localhost:9981/test-mihrab.html';
  console.log('Loading:', url);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for p5.brush rendering to complete
  await new Promise(r => setTimeout(r, 25000));

  const outPath = path.join(__dirname, 'renders', 'mihrab-v1.png');
  await page.screenshot({ path: outPath, type: 'png' });
  console.log('Saved:', outPath);

  await browser.close();
})();
