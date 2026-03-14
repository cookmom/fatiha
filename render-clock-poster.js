const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');

(async () => {
  // Start local server
  const server = require('child_process').spawn('python3', ['-m', 'http.server', '7760'], {
    cwd: '/home/tawfeeq/ramadan-clock-site/',
    stdio: 'ignore',
    detached: true
  });
  server.unref();
  await new Promise(r => setTimeout(r, 1500));

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: [
      '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
      '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
      '--in-process-gpu', '--enable-webgl'
    ],
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || '')
    }
  });

  const page = await browser.newPage();
  await page.emulateTimezone('Asia/Riyadh');
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 3 });

  // Monkey-patch seconds/ms to lock second hand at 12
  await page.evaluateOnNewDocument(() => {
    Date.prototype.getSeconds = function() { return 0; };
    Date.prototype.getMilliseconds = function() { return 0; };
  });

  await page.goto('http://localhost:7760/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for Three.js + HDRI to load
  console.log('Waiting 14s for Three.js + HDRI...');
  await new Promise(r => setTimeout(r, 14000));

  // Hide app chrome
  await page.evaluate(() => {
    document.body.classList.add('chrome-hidden');
    // Also force-hide version tag and any other UI overlays
    document.querySelectorAll('[class*="version"], [id*="version"], [class*="dev"]').forEach(el => el.style.display = 'none');
    const allEls = document.querySelectorAll('*');
    for (const el of allEls) {
      if (el.textContent && el.textContent.match(/^v\d+$/) && el.children.length === 0) {
        el.style.display = 'none';
      }
    }
  });

  // Force Isha lighting (dramatic night)
  await page.evaluate(() => {
    window._forceTimeMin = 1200;
  });

  console.log('Waiting 3s for lighting update...');
  await new Promise(r => setTimeout(r, 3000));

  // Load Instrument Serif font
  await page.evaluate(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap';
    document.head.appendChild(link);
  });

  console.log('Waiting 3s for font load...');
  await new Promise(r => setTimeout(r, 3000));

  // Add typography overlays
  await page.evaluate(() => {
    // Title
    const title = document.createElement('div');
    title.textContent = 'a Gift of Time.';
    title.style.cssText = 'position:fixed;top:10%;left:0;right:0;text-align:center;font-family:"Instrument Serif",serif;font-size:2.8rem;font-weight:400;letter-spacing:-0.02em;color:rgba(232,228,220,0.9);z-index:9999;pointer-events:none;line-height:1;';
    document.body.appendChild(title);

    // Subtitle
    const sub = document.createElement('div');
    sub.textContent = 'a study in light, time, orientation and a call to prayer.';
    sub.style.cssText = 'position:fixed;top:calc(10% + 3.5rem);left:10%;right:10%;text-align:center;font-family:"Instrument Serif",serif;font-size:0.85rem;font-weight:400;letter-spacing:0.01em;color:rgba(232,228,220,0.4);z-index:9999;pointer-events:none;line-height:1.4;';
    document.body.appendChild(sub);

    // Section label
    const section = document.createElement('div');
    section.textContent = 'CLOCK';
    section.style.cssText = 'position:fixed;bottom:12%;left:0;right:0;text-align:center;font-family:system-ui,sans-serif;font-size:0.65rem;font-weight:300;letter-spacing:0.35em;color:rgba(232,228,220,0.3);z-index:9999;pointer-events:none;text-transform:uppercase;';
    document.body.appendChild(section);

    // Nav pills
    const nav = document.createElement('div');
    nav.innerHTML = '<span style="opacity:1;text-shadow:0 0 8px rgba(150,140,255,0.6)">○</span><span style="opacity:0.3;margin:0 24px">◇</span><span style="opacity:0.3">△</span>';
    nav.style.cssText = 'position:fixed;bottom:8%;left:0;right:0;text-align:center;font-size:1.1rem;color:rgba(232,228,220,0.7);z-index:9999;pointer-events:none;letter-spacing:0.1em;';
    document.body.appendChild(nav);
  });

  // Brief pause for render
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot
  const outputPath = '/home/openclaw-agent/.openclaw/workspace/poster-clock-v1.png';
  await page.screenshot({ path: outputPath, type: 'png' });
  console.log('Saved poster to:', outputPath);

  // Check console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });

  await browser.close();

  // Kill the server
  try { process.kill(-server.pid); } catch(e) {}

  console.log('Done!');
  process.exit(0);
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
