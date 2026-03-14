const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const CHROME = '/usr/bin/google-chrome-stable';
const PORT = 7755;
const URL_BASE = `http://localhost:${PORT}/#clock`;
const OUT = path.join(__dirname, 'night-frames-v6');
const FRAMES = 600;
const OUTPUT_MP4 = path.join(__dirname, 'agot-timelapse-night-v6.mp4');
const TEST_SCREENSHOT = path.join(__dirname, 'timelapse-v6-test.png');

// Makkah: Maghrib ~18:20, Fajr ~05:00 (approx March 2026)
const START_MIN = 18 * 60 + 20;  // 18:20 Maghrib
const END_MIN = 29 * 60;         // 05:00 next day (29h = 1740 min)
const RANGE = END_MIN - START_MIN; // 640 min
const STEP = RANGE / FRAMES;      // ~1.07 min/frame

async function run() {
  if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
      '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
      '--in-process-gpu', '--enable-webgl',
    ],
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || ''),
    },
  });

  const page = await browser.newPage();
  await page.emulateTimezone('Asia/Riyadh');
  await page.setViewport({ width: 1290, height: 2796, deviceScaleFactor: 1 });

  await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' });

  // Set Makkah location + skip onboarding
  await page.evaluate(() => {
    localStorage.setItem('agot_clock_onboarded', '1');
    localStorage.setItem('agot_splash_seen', '1');
    localStorage.setItem('agot_loc', JSON.stringify({ lat: 21.4225, lon: 39.8262, name: 'Makkah' }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

  console.log('Waiting 14s for Three.js + HDRI...');
  await new Promise(r => setTimeout(r, 14000));

  // Check GPU
  const gpu = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const gl = c && (c.getContext('webgl2') || c.getContext('webgl'));
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });
  console.log('GPU:', gpu);
  if (!gpu.includes('NVIDIA')) {
    console.error('WARNING: Not using NVIDIA GPU!');
  }

  // Wait for prayer sectors
  for (let i = 0; i < 30; i++) {
    const n = await page.evaluate(() => {
      if (window._prayerTimingsReady && typeof window.buildPrayerSectors === 'function' && window.prayerSectors.length === 0)
        window.buildPrayerSectors();
      return window.prayerSectors ? window.prayerSectors.length : 0;
    });
    if (n > 0) { console.log(`Prayer sectors: ${n}`); break; }
    await new Promise(r => setTimeout(r, 500));
  }

  // Hide chrome + inject title (20% smaller than v5, weight 200) + lock second hand
  await page.evaluate(() => {
    // Hide all chrome
    document.body.classList.add('chrome-hidden');
    document.querySelectorAll('.fs-header,.mode-pill,.compass-chrome,#fsTapHint,.mode-label,.clock-onboard').forEach(el => {
      el.style.visibility = 'hidden';
    });

    // Title overlay — 80% of v5 size, light weight (not bold)
    const title = document.createElement('div');
    title.textContent = 'A Gift of Time.';
    title.style.cssText = 'position:fixed;top:12%;left:0;right:0;text-align:center;font-family:inherit;font-size:clamp(5.3rem,14.4vw,9.1rem);font-weight:200;letter-spacing:-0.02em;color:rgba(232,228,220,0.9);z-index:9999;pointer-events:none;line-height:1;';
    document.body.appendChild(title);

    // NO wireframe cube logo

    // Lock second hand at 12 o'clock
    Date.prototype.getSeconds = function() { return 0; };
    Date.prototype.getMilliseconds = function() { return 0; };
  });

  // Let branding render + verify
  await new Promise(r => setTimeout(r, 2000));

  // Set initial time to Maghrib for test screenshot
  await page.evaluate(m => {
    window._forceTimeMin = m;
    window._swipeTimeOverride = null;
    window._swipeTimeTarget = null;
    if (window._swipeRevertTimer) clearTimeout(window._swipeRevertTimer);
  }, START_MIN);
  await new Promise(r => setTimeout(r, 500));

  // Take test screenshot to verify placement
  await page.screenshot({ path: TEST_SCREENSHOT, type: 'png' });
  console.log(`Test screenshot: ${TEST_SCREENSHOT}`);

  console.log(`Capturing ${FRAMES} frames (Maghrib ${START_MIN} → Fajr ${END_MIN})...`);

  for (let i = 0; i < FRAMES; i++) {
    const rawMin = START_MIN + (i * STEP);
    const min = rawMin % 1440; // wrap around midnight

    await page.evaluate(m => {
      window._forceTimeMin = m;
      window._swipeTimeOverride = null;
      window._swipeTimeTarget = null;
      if (window._swipeRevertTimer) clearTimeout(window._swipeRevertTimer);
    }, min);

    // Let render loop process
    await new Promise(r => setTimeout(r, 150));

    const padded = String(i).padStart(4, '0');
    await page.screenshot({ path: path.join(OUT, `frame-${padded}.png`), type: 'png' });

    const h = Math.floor(min / 60), m2 = Math.floor(min % 60);
    if (i % 50 === 0) {
      process.stdout.write(`  ${padded}/${FRAMES} (${String(h).padStart(2,'0')}:${String(m2).padStart(2,'0')})\n`);
    }
  }

  await browser.close();
  console.log(`\n${FRAMES} frames captured in ${OUT}`);

  // Encode MP4
  console.log('Encoding H.264 MP4...');
  execSync(`ffmpeg -y -framerate 30 -i "${OUT}/frame-%04d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium "${OUTPUT_MP4}"`, { stdio: 'inherit' });

  const size = (fs.statSync(OUTPUT_MP4).size / 1024 / 1024).toFixed(1);
  console.log(`✓ ${OUTPUT_MP4} (${size}MB)`);

  // Clean up frames
  fs.rmSync(OUT, { recursive: true });
  console.log('Frames cleaned up.');
}

run().catch(e => { console.error(e); process.exit(1); });
