const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const FRAMES = 480;
const URL = 'http://localhost:9981/fatiha-parametric.html';
const OUT = path.join(__dirname, 'frames');

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--disable-gpu-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1080,1920'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  const errors = [];
  page.on('pageerror', err => { console.log('PAGE ERROR:', err.message); errors.push(err.message); });
  page.on('console', msg => console.log('CONSOLE:', msg.text()));

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for p5 + brush to load
  await page.waitForFunction('typeof draw === "function"', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));

  // Stop the animation loop so we can step manually
  await page.evaluate(() => { noLoop(); });

  console.log('Capturing', FRAMES, 'frames...');
  for (let i = 0; i < FRAMES; i++) {
    await page.evaluate(() => { redraw(); });
    await new Promise(r => setTimeout(r, 120));

    const fname = `f${String(i).padStart(5, '0')}.png`;
    await page.screenshot({ path: path.join(OUT, fname), type: 'png' });

    if (i % 30 === 0) console.log(`Frame ${i}/${FRAMES}`);
  }

  console.log('Done capturing', FRAMES, 'frames');
  if (errors.length) console.log('ERRORS:', errors.slice(0, 5).join(' | '));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
