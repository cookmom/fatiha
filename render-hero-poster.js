const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');

(async () => {
  // Ensure dev server is running
  try {
    execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:7747/', { timeout: 3000 });
    console.log('Dev server already running on 7747');
  } catch {
    console.log('Starting dev server on 7747...');
    const { spawn } = require('child_process');
    const srv = spawn('python3', ['-m', 'http.server', '7747'], {
      cwd: '/home/tawfeeq/ramadan-clock-site/',
      detached: true,
      stdio: 'ignore'
    });
    srv.unref();
    await new Promise(r => setTimeout(r, 2000));
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
      '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
      '--in-process-gpu', '--enable-webgl'
    ],
    headless: true,
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || '')
    }
  });

  const page = await browser.newPage();

  // Phone viewport at 3x DPR
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 3 });
  await page.emulateTimezone('Asia/Riyadh');

  // Monkey-patch seconds to lock second hand at 0
  await page.evaluateOnNewDocument(() => {
    const origGetSeconds = Date.prototype.getSeconds;
    const origGetMilliseconds = Date.prototype.getMilliseconds;
    Date.prototype.getSeconds = function() { return 0; };
    Date.prototype.getMilliseconds = function() { return 0; };
  });

  console.log('Navigating to site...');
  await page.goto('http://localhost:7747/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Hide chrome UI, set Isha lighting
  await page.evaluate(() => {
    document.body.classList.add('chrome-hidden');
    window._forceTimeMin = 1200;
  });

  console.log('Waiting 14s for Three.js + HDRI load...');
  await new Promise(r => setTimeout(r, 14000));

  // Re-assert forceTimeMin and wait for lighting settle
  await page.evaluate(() => { window._forceTimeMin = 1200; });
  console.log('Waiting 3s for lighting settle...');
  await new Promise(r => setTimeout(r, 3000));

  // Inject the title overlay with Instrument Serif
  await page.evaluate(() => {
    // Load Instrument Serif font
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap';
    document.head.appendChild(link);
  });

  console.log('Waiting 3s for font load...');
  await new Promise(r => setTimeout(r, 3000));

  // Inject the title and subtitle overlay
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 12%;
      left: 0;
      right: 0;
      z-index: 99999;
      text-align: center;
      pointer-events: none;
    `;

    const title = document.createElement('div');
    title.textContent = 'a Gift of Time.';
    title.style.cssText = `
      font-family: 'Instrument Serif', serif;
      font-weight: 400;
      font-size: clamp(2.2rem, 6vw, 3.8rem);
      letter-spacing: -0.02em;
      color: rgba(232, 228, 220, 0.9);
      line-height: 1;
      text-align: center;
    `;

    const subtitle = document.createElement('div');
    subtitle.textContent = 'a study in light, time, orientation and a call to prayer.';
    subtitle.style.cssText = `
      font-family: 'Instrument Serif', serif;
      font-weight: 400;
      font-size: 0.9rem;
      color: rgba(232, 228, 220, 0.45);
      margin-top: 12px;
      letter-spacing: 0.02em;
      text-align: center;
    `;

    overlay.appendChild(title);
    overlay.appendChild(subtitle);
    document.body.appendChild(overlay);
  });

  // Small extra wait for overlay render
  await new Promise(r => setTimeout(r, 500));

  console.log('Taking screenshot...');
  await page.screenshot({
    path: '/home/openclaw-agent/.openclaw/workspace/poster-hero-instrument-serif.png',
    type: 'png',
    fullPage: false
  });

  console.log('Screenshot saved!');
  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
