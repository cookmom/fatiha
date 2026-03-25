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
  await page.setViewport({width: 1080, height: 1920});

  page.on('console', m => console.log('PAGE:', m.text()));
  page.on('pageerror', e => console.log('ERROR:', e.message));

  const filePath = 'file://' + path.resolve(__dirname, 'test-wreath-context.html');
  console.log('Loading:', filePath);
  await page.goto(filePath, {waitUntil: 'networkidle0', timeout: 120000});

  await page.waitForFunction(() => window._renderComplete === true, {timeout: 120000});
  console.log('Render complete');

  await new Promise(r => setTimeout(r, 5000));
  const outPath = path.resolve(__dirname, 'renders/islamic-door-v1.png');
  await page.screenshot({path: outPath, fullPage: false});
  console.log('Saved:', outPath);
  await browser.close();
})();
