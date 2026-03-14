const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const OUT_DIR = '/tmp/promo-frames';
const URL = 'http://localhost:7747/';
const TOTAL_MS = 40000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    defaultViewport: { width: 430, height: 932, deviceScaleFactor: 3 },
    args: [
      '--no-sandbox',
      '--disable-gpu-sandbox',
      '--use-gl=angle',
      '--use-angle=gl-egl',
      '--ozone-platform=headless',
      '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage',
      '--in-process-gpu',
      '--enable-webgl'
    ]
  });

  const page = await browser.newPage();
  await page.emulateTimezone('Asia/Riyadh');

  // Warm-up load so Three.js assets settle before real capture run.
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await sleep(15000);

  // Fresh load for the actual 40s recording (keeps native splash in shot).
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  // Lock seconds hand exactly at 12.
  await page.evaluate(() => {
    const _origGetSeconds = Date.prototype.getSeconds;
    const _origGetMilliseconds = Date.prototype.getMilliseconds;
    Object.defineProperty(Date.prototype, 'getSeconds', {
      configurable: true,
      writable: true,
      value: function() { return 0; }
    });
    Object.defineProperty(Date.prototype, 'getMilliseconds', {
      configurable: true,
      writable: true,
      value: function() { return 0; }
    });
    window.__origGetSeconds = _origGetSeconds;
    window.__origGetMilliseconds = _origGetMilliseconds;
  });

  const cdp = await page.target().createCDPSession();
  let frameCount = 0;

  cdp.on('Page.screencastFrame', async ({ data, sessionId }) => {
    try {
      frameCount += 1;
      const file = path.join(OUT_DIR, `frame-${String(frameCount).padStart(5, '0')}.png`);
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
    } finally {
      await cdp.send('Page.screencastFrameAck', { sessionId });
    }
  });

  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 2 });

  const t0 = Date.now();

  // ~8s: splash should be done; ensure scene is ready, dismiss splash naturally after readiness,
  // then apply dev time override.
  while (Date.now() - t0 < 8000) await sleep(100);
  await page.waitForFunction('window._sceneReady === true', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 1200);
    }
    window._devActive = true;
    window._devTimeOverride = { h: 22, m: 10 };
  });

  // 20s: show Maghrib overlay
  while (Date.now() - t0 < 20000) await sleep(100);
  await page.evaluate(() => {
    if (typeof window._showMaghribHadith === 'function') window._showMaghribHadith();
  });

  // 25s: hide Maghrib and show Qiyam overlay
  while (Date.now() - t0 < 25000) await sleep(100);
  await page.evaluate(() => {
    if (typeof window._hideMaghribHadith === 'function') window._hideMaghribHadith();
    if (typeof window._showQiyamDua === 'function') window._showQiyamDua();
  });

  // 35s: hide Qiyam, return to clock
  while (Date.now() - t0 < 35000) await sleep(100);
  await page.evaluate(() => {
    if (typeof window._hideQiyamDua === 'function') window._hideQiyamDua();
  });

  while (Date.now() - t0 < TOTAL_MS) await sleep(100);

  await cdp.send('Page.stopScreencast');
  await sleep(500);
  await browser.close();

  console.log(`Captured ${frameCount} frames to ${OUT_DIR}`);
})();