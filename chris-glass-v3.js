// chris-glass-v3.js — Final refinement pass
// V2 confirmed: killing ambient fills = good glass. 8/10 transparency.
// V3 goals: address center void + top face flatness
//   - Restore a tiny sky fill (0.02 → 0.06) so top face has faint catch light
//   - Boost edge catch slightly (1.10 → 1.30) for crisper silhouette
//   - Add micro bottom glow (0.00 → 0.03) to lift cube off black pedestal
//   - Everything else: same as V2

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

function applyV3Patch(src) {
  let s = src;

  // Line 677: neutral tint, keep 2.8 (proven good in V2)
  s = s.replace(
    'vec3 col = refracted * vec3(0.94, 0.97, 1.06) * 2.8 * bottomAtten;',
    'vec3 col = refracted * vec3(1.00, 1.00, 1.00) * 2.8 * bottomAtten;'
  );

  // Line 684: fresnel edge — keep boosted from V2
  s = s.replace(
    'col += vec3(0.80, 0.92, 1.00) * fresnel * 0.35;',
    'col += vec3(0.80, 0.92, 1.00) * fresnel * 0.40;'
  );

  // Line 689: side ambient — KILL (V2 proved this was the #1 opaque culprit)
  s = s.replace(
    'col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.30;',
    'col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.00;'
  );

  // Line 694: sky fill — tiny amount back to lift top face off black
  s = s.replace(
    'col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.38;',
    'col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.06;'
  );

  // Line 699: edge catch — slightly boost from V2 for crisper silhouette
  s = s.replace(
    'col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.80;',
    'col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.30;'
  );

  // Line 706: shadow fill — KILL
  s = s.replace(
    'col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.35; // cool blue fill, subtle',
    'col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.00; // cool blue fill, subtle'
  );

  // Line 708: shadow edge — minimal (slight rim on shadow side only)
  s = s.replace(
    'col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.45;',
    'col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.05;'
  );

  // Line 746: top fresnel — halve
  s = s.replace(
    'col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.30;',
    'col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.15;'
  );

  // Line 751: bottom glow — tiny lift to separate from pedestal darkness
  s = s.replace(
    'col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.25;',
    'col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.03;'
  );

  // Line 754: bottom rim — reduce but keep visible
  s = s.replace(
    'col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.45;',
    'col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.25;'
  );

  return s;
}

function safetyCheck(orig, patched) {
  const keys = ['mkMatWindow', 'prayerDisc', '_prayerDiscMat', '_nextDisc', '_thirdDisc'];
  for (const k of keys) {
    const oc = (orig.match(new RegExp(k, 'g')) || []).length;
    const pc = (patched.match(new RegExp(k, 'g')) || []).length;
    if (oc !== pc) { console.error(`SAFETY FAIL: ${k}`); return false; }
  }
  // Verify the opaque fills are gone
  if (patched.includes('sideFacing * 0.30')) { console.error('SAFETY FAIL: old side ambient still present'); return false; }
  if (patched.includes('shadowSide * 0.35')) { console.error('SAFETY FAIL: old shadow fill still present'); return false; }
  if (patched.includes('bottomFace * 0.25')) { console.error('SAFETY FAIL: old bottom glow still present'); return false; }
  console.log('V3 safety check PASSED');
  return true;
}

const CUBE_CROP = { x: 30, y: 80, width: 370, height: 400 };

(async () => {
  const originalSrc = fs.readFileSync(JS_SRC, 'utf8');
  const patchedSrc  = applyV3Patch(originalSrc);
  if (!safetyCheck(originalSrc, patchedSrc)) { process.exit(1); }

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

  const hideSplash = async (page) => {
    await page.evaluate(() => {
      document.querySelectorAll('[id*="splash"],[id*="intro"],[class*="splash"],[class*="intro"]')
        .forEach(el => { el.style.display = 'none'; });
    });
    await new Promise(r => setTimeout(r, 500));
  };

  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('glass-cube-clock.js')) {
      req.respond({ status: 200, contentType: 'application/javascript', body: patchedSrc });
    } else {
      req.continue();
    }
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 16000));
  await hideSplash(page);

  await page.screenshot({ path: path.join(OUT, 'chris-glass-after-v3.png') });
  console.log('Saved: chris-glass-after-v3.png');

  await page.screenshot({ path: path.join(OUT, 'chris-glass-after-v3-crop.png'), clip: CUBE_CROP });
  console.log('Saved: chris-glass-after-v3-crop.png');

  await browser.close();
  console.log('V3 done.');
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
