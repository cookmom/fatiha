// Crop test — confirm cube changes + get precise crop coordinates
const puppeteer = require('/home/tawfeeq/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/usr/bin/google-chrome-stable';
const URL    = 'http://localhost:7748/';
const JS_SRC = '/home/tawfeeq/ramadan-clock-site/glass-cube-clock.js';
const OUT    = '/home/openclaw-agent/.openclaw/workspace/';

const CHROME_ARGS = [
  '--no-sandbox', '--disable-gpu-sandbox',
  '--use-gl=angle', '--use-angle=gl-egl',
  '--ozone-platform=headless',
  '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
  '--in-process-gpu', '--enable-webgl',
];

async function launchPage(patchFn) {
  const originalSrc = fs.readFileSync(JS_SRC, 'utf8');
  const patchedSrc = patchFn ? patchFn(originalSrc) : originalSrc;

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    args: CHROME_ARGS,
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || ''),
    },
    headless: true,
    defaultViewport: { width: 430, height: 932, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();

  if (patchFn) {
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (req.url().includes('glass-cube-clock.js')) {
        req.respond({ status: 200, contentType: 'application/javascript', body: patchedSrc });
      } else {
        req.continue();
      }
    });
  }

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 16000));

  // Hide splash/intro overlays
  await page.evaluate(() => {
    document.querySelectorAll('[id*="splash"],[id*="intro"],[class*="splash"],[class*="intro"]')
      .forEach(el => { el.style.display = 'none'; });
  });
  await new Promise(r => setTimeout(r, 500));

  return { browser, page };
}

async function saveScreenshot(page, label, clip) {
  const p = path.join(OUT, `chris-glass-${label}.png`);
  const opts = { path: p };
  if (clip) opts.clip = clip;
  await page.screenshot(opts);
  console.log(`Saved: ${p}`);
}

// Cube is approximately in the upper-center of a 430x932 viewport
// Based on TOOLS.md: full clock at {x:60, y:190, width:740, height:740} (2x DPR coords)
// In puppeteer screenshot (deviceScaleFactor:2), use CSS pixels: {x:30, y:95, width:370, height:370}
// Let's try a range of crops to find the cube
const CUBE_CROP = { x: 30, y: 80, width: 370, height: 400 }; // CSS px at 2x DPR

(async () => {
  // ── EXTREME test: cube = pure additive fills only (refraction * 0.0) ──────
  // If cube changes color, interception + shader are working
  console.log('--- EXTREME TEST (refraction=0) ---');
  const { browser: b1, page: p1 } = await launchPage(src =>
    src.replace(
      'vec3 col = refracted * vec3(0.94, 0.97, 1.06) * 2.8 * bottomAtten;',
      'vec3 col = refracted * vec3(0.94, 0.97, 1.06) * 0.0 * bottomAtten;'
    )
  );
  await saveScreenshot(p1, 'extreme-fullpage');
  await saveScreenshot(p1, 'extreme-crop', CUBE_CROP);
  await b1.close();

  // ── BEFORE: no patch, cropped ─────────────────────────────────────────────
  console.log('--- BEFORE (no patch, crop) ---');
  const { browser: b2, page: p2 } = await launchPage(null);
  await saveScreenshot(p2, 'before-crop', CUBE_CROP);
  await b2.close();

  // ── AFTER v1: our glass patch, cropped ───────────────────────────────────
  console.log('--- AFTER v1 (glass patch, crop) ---');
  const { browser: b3, page: p3 } = await launchPage(src => {
    let s = src;
    s = s.replace('vec3 col = refracted * vec3(0.94, 0.97, 1.06) * 2.8 * bottomAtten;',
                  'vec3 col = refracted * vec3(1.00, 1.00, 1.00) * 1.6 * bottomAtten;');
    s = s.replace('col += vec3(0.80, 0.92, 1.00) * fresnel * 0.35;',
                  'col += vec3(0.80, 0.92, 1.00) * fresnel * 0.28;');
    s = s.replace('col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.30;',
                  'col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.02;');
    s = s.replace('col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.38;',
                  'col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.05;');
    s = s.replace('col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.80;',
                  'col += vec3(0.70, 0.85, 1.00) * edgeCatch * 0.80;');
    s = s.replace('col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.35; // cool blue fill, subtle',
                  'col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.04; // cool blue fill, subtle');
    s = s.replace('col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.45;',
                  'col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.12;');
    s = s.replace('col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.30;',
                  'col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.12;');
    s = s.replace('col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.25;',
                  'col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.04;');
    s = s.replace('col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.45;',
                  'col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.18;');
    return s;
  });
  await saveScreenshot(p3, 'after-v1-crop', CUBE_CROP);
  await b3.close();

  console.log('Done.');
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
