const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const VERSION = process.argv[2] || 'test';
const URL = process.argv[3] || 'http://localhost:9981/fatiha-proto/test-vine-lookdev.html';
const TIMEOUT = parseInt(process.argv[4] || '120000');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox', '--disable-gpu-sandbox',
      '--use-gl=angle', '--use-angle=gl-egl',
      '--ozone-platform=headless', '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage', '--in-process-gpu',
      '--enable-webgl',
      '--js-flags=--max-old-space-size=4096'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  let done = false;
  page.on('console', msg => {
    if (msg.text().includes('LOOKDEV DONE')) done = true;
  });

  console.log('Loading:', URL);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('Waiting for render...');
  const start = Date.now();
  while (!done && Date.now() - start < TIMEOUT) {
    await new Promise(r => setTimeout(r, 2000));
    if ((Date.now() - start) % 20000 < 2000) console.log('  ' + Math.round((Date.now()-start)/1000) + 's...');
  }

  if (!done) console.log('WARNING: LOOKDEV DONE not received, screenshotting anyway');
  await new Promise(r => setTimeout(r, 3000));

  const rendersDir = path.join(__dirname, 'renders');
  if (!fs.existsSync(rendersDir)) fs.mkdirSync(rendersDir);

  const outPath = path.join(rendersDir, `vine-lookdev-${VERSION}.png`);
  await page.screenshot({ path: outPath, type: 'png', fullPage: false });
  console.log('Saved:', outPath);

  await browser.close();
}

run().catch(err => { console.error(err); process.exit(1); });
