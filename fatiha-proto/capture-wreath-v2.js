const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
           '--enable-webgl', '--ignore-gpu-blocklist', '--disable-gpu-sandbox'],
    executablePath: '/usr/bin/google-chrome-stable'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  const filePath = 'file://' + path.resolve(__dirname, 'test-wreath-packed.html');
  console.log('Loading:', filePath);
  await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 120000 });

  // Wait for render
  await page.waitForFunction(() => window._renderComplete === true, { timeout: 120000 });
  console.log('Render complete');

  // Extra wait for p5.brush watercolor to settle
  await new Promise(r => setTimeout(r, 5000));

  await page.screenshot({ path: path.resolve(__dirname, 'renders/wreath-packed-v2.png'), fullPage: false });
  console.log('Saved renders/wreath-packed-v2.png');

  // Get stats from console
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));

  await browser.close();
})();
