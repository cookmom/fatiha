// chris-glass-v2.js — Corrected strategy:
// Keep base transmission AT 2.8 (refracted scene stays bright/visible)
// ONLY kill the flat ambient fills that paint opaque solid color
// Keep: fresnel edge, edge catch, specular — these ARE the glass signature
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

// V2 STRATEGY:
// The 2.8 multiplier is GOOD — it makes the refracted scene bright and dominant.
// The problem was the FLAT AMBIENT FILLS that paint blue/purple on faces uniformly.
// Those fills have no view-dependence — they paint ALL fragments equally, creating
// a solid-looking face. Real glass doesn't have diffuse ambient — it has fresnel + spec.
//
// Kill list (near-zero):
//   - sideFacing ambient: 0.30 → 0.00 (pure flat face fill, the #1 culprit)
//   - skyFacing fill: 0.38 → 0.02 (flat top face fill)
//   - shadowSide fill: 0.35 → 0.00 (flat shadow fill)
//   - shadowSide edge: 0.45 → 0.05 (minor shadow contribution)
//   - bottomFace glow: 0.25 → 0.00 (flat bottom fill)
//
// Reduce but keep (these are view-dependent — fresnel, so they're OK for glass):
//   - fresnel edge: 0.35 → 0.40 (boost slightly — THIS is the glass signature)
//   - edge catch: 1.80 → 1.20 (rim light, important but reduce overall intensity)
//   - topFresnel purple: 0.30 → 0.15 (view-dependent, keep subtle)
//   - bottomRim: 0.45 → 0.25 (physical rim, keep but reduce)
//
// Keep exactly:
//   - Base transmission: 2.8 (KEEP — don't dim the refracted scene)
//   - Tint: change 0.94,0.97,1.06 → 1.0,1.0,1.0 (neutral, less blue bias)
//   - Specular, LTC, iridescence: UNTOUCHED
//   - Prayer windows, mkMatWindow: UNTOUCHED

function applyV2Patch(src) {
  let s = src;

  // Line 677: neutral tint, KEEP 2.8 multiplier
  s = s.replace(
    'vec3 col = refracted * vec3(0.94, 0.97, 1.06) * 2.8 * bottomAtten;',
    'vec3 col = refracted * vec3(1.00, 1.00, 1.00) * 2.8 * bottomAtten;'
  );

  // Line 684: fresnel edge — boost slightly (this IS glass)
  s = s.replace(
    'col += vec3(0.80, 0.92, 1.00) * fresnel * 0.35;',
    'col += vec3(0.80, 0.92, 1.00) * fresnel * 0.40;'
  );

  // Line 689: side ambient — KILL (pure flat fill, makes faces opaque)
  s = s.replace(
    'col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.30;',
    'col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.00;'
  );

  // Line 694: sky fill — KILL (flat top fill)
  s = s.replace(
    'col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.38;',
    'col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.02;'
  );

  // Line 699: edge catch — reduce (keep rim but less dominant)
  s = s.replace(
    'col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.80;',
    'col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.10;'
  );

  // Line 706: shadow fill — KILL (flat shadow face fill)
  s = s.replace(
    'col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.35; // cool blue fill, subtle',
    'col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.00; // cool blue fill, subtle'
  );

  // Line 708: shadow edge — nearly zero
  s = s.replace(
    'col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.45;',
    'col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.05;'
  );

  // Line 746: top fresnel — halve (view-dependent, keep subtle)
  s = s.replace(
    'col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.30;',
    'col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.15;'
  );

  // Line 751: bottom glow — KILL (flat bottom fill)
  s = s.replace(
    'col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.25;',
    'col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.00;'
  );

  // Line 754: bottom rim — reduce (physical effect, keep but lighter)
  s = s.replace(
    'col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.45;',
    'col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.25;'
  );

  return s;
}

// Safety verify: prayer window code untouched
function safetyCheck(orig, patched) {
  const keys = ['mkMatWindow', 'prayerDisc', '_prayerDiscMat', '_nextDisc', '_thirdDisc', 'SECTOR_RADIUS'];
  for (const k of keys) {
    const oc = (orig.match(new RegExp(k, 'g')) || []).length;
    const pc = (patched.match(new RegExp(k, 'g')) || []).length;
    if (oc !== pc) { console.error(`SAFETY FAIL: ${k} count changed (${oc}→${pc})`); return false; }
  }
  // Verify specific old strings are gone and new ones present
  const mustBeGone = [
    'col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.30;',
    'col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.38;',
    'col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.35;',
  ];
  const mustExist = [
    'col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.00;',
    'col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.02;',
    'col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.00;',
  ];
  for (const s of mustBeGone) {
    if (patched.includes(s)) { console.error(`SAFETY FAIL: old string still present: "${s.slice(0,50)}"`); return false; }
  }
  for (const s of mustExist) {
    if (!patched.includes(s)) { console.error(`SAFETY FAIL: new string missing: "${s.slice(0,50)}"`); return false; }
  }
  console.log('Safety check PASSED — prayer windows untouched, all 10 targets hit');
  return true;
}

const CUBE_CROP = { x: 30, y: 80, width: 370, height: 400 };

(async () => {
  const originalSrc = fs.readFileSync(JS_SRC, 'utf8');
  const patchedSrc  = applyV2Patch(originalSrc);
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

  // ── AFTER V2: full page + crop ────────────────────────────────────────────
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

  // Full page
  await page.screenshot({ path: path.join(OUT, 'chris-glass-after-v2.png') });
  console.log('Saved: chris-glass-after-v2.png');

  // Cube crop
  await page.screenshot({ path: path.join(OUT, 'chris-glass-after-v2-crop.png'), clip: CUBE_CROP });
  console.log('Saved: chris-glass-after-v2-crop.png');

  await browser.close();
  console.log('V2 done.');
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
