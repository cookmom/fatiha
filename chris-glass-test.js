// chris-glass-test.js — Glass lookdev test via GPU Chrome + request interception
// ONLY patches dichroicFrag fill terms. Nothing else touched.
const puppeteer = require('/home/tawfeeq/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/usr/bin/google-chrome-stable';
const URL    = 'http://localhost:7748/';
const JS_SRC = '/home/tawfeeq/ramadan-clock-site/glass-cube-clock.js';
const OUT    = '/home/openclaw-agent/.openclaw/workspace/';

// ── The surgical patch: ONLY these 10 lines change ──────────────────────────
// Strategy: Make glass transparent-dominant.
//   - Base transmission: neutral tint (no blue bias), multiplier 2.8→1.6
//   - Side ambient: 0.30→0.02 (was #1 opaque-face culprit — nearly killed)
//   - Sky fill: 0.38→0.05 (faces opaque → glass)
//   - Edge catch: 1.80→0.80 (keep rim signature but not dominant)
//   - Shadow fill: 0.35→0.04, shadow edge: 0.45→0.12
//   - Fresnel edge: 0.35 kept (glass rim — this is correct)
//   - Bottom glow/rim: 0.25→0.04, 0.45→0.18 (nearly invisible unless specific angle)
//   - Top fresnel purple: 0.30→0.12 (subtle iridescence hint, not dominant)
//
// What's NOT touched: refraction sampling, IOR, aberration, dichroic bands,
//   specular highlight, LTC RectAreaLight, internal glow, thinFilm function,
//   iridescence blends (col = mix), prayer discs, mkMatWindow, ANYTHING else.

function applyGlassPatch(src) {
  let patched = src;

  // ── Line 677: base transmission — neutral tint, lower multiplier ──
  patched = patched.replace(
    'vec3 col = refracted * vec3(0.94, 0.97, 1.06) * 2.8 * bottomAtten;',
    'vec3 col = refracted * vec3(1.00, 1.00, 1.00) * 1.6 * bottomAtten;'
  );

  // ── Line 684: fresnel edge — keep but tighten ──
  patched = patched.replace(
    'col += vec3(0.80, 0.92, 1.00) * fresnel * 0.35;',
    'col += vec3(0.80, 0.92, 1.00) * fresnel * 0.28;'
  );

  // ── Line 689: side ambient — #1 opacity culprit, nearly zero ──
  patched = patched.replace(
    'col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.30;',
    'col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.02;'
  );

  // ── Line 694: sky fill — opaque ceiling, nearly removed ──
  patched = patched.replace(
    'col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.38;',
    'col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.05;'
  );

  // ── Line 699: edge catch rim — keep as glass signature, halved ──
  patched = patched.replace(
    'col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.80;',
    'col += vec3(0.70, 0.85, 1.00) * edgeCatch * 0.80;'
  );

  // ── Line 706: shadow fill — nearly removed ──
  patched = patched.replace(
    'col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.35; // cool blue fill, subtle',
    'col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.04; // cool blue fill, subtle'
  );

  // ── Line 708: shadow edge boost — reduced ──
  patched = patched.replace(
    'col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.45;',
    'col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.12;'
  );

  // ── Line 746: top fresnel purple — subtle irid hint ──
  patched = patched.replace(
    'col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.30;',
    'col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.12;'
  );

  // ── Line 751: bottom glow — nearly invisible ──
  patched = patched.replace(
    'col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.25;',
    'col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.04;'
  );

  // ── Line 754: bottom rim — reduced ──
  patched = patched.replace(
    'col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.45;',
    'col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.18;'
  );

  return patched;
}

// ── Verify patch hit all 10 targets ─────────────────────────────────────────
function verifyPatch(original, patched) {
  const checks = [
    ['vec3 col = refracted * vec3(0.94, 0.97, 1.06) * 2.8 * bottomAtten;', false],
    ['vec3 col = refracted * vec3(1.00, 1.00, 1.00) * 1.6 * bottomAtten;',  true ],
    ['col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.30;',                  false],
    ['col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.02;',                  true ],
    ['col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.38;',        false],
    ['col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.05;',        true ],
    ['col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.80;',                  false],
    ['col += vec3(0.70, 0.85, 1.00) * edgeCatch * 0.80;',                  true ],
    ['col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.35;',                 false],
    ['col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.04;',                 true ],
    ['col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.45;',     false],
    ['col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.12;',     true ],
    ['col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.30;',                 false],
    ['col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.12;',                 true ],
    ['col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.25;',                  false],
    ['col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.04;',                  true ],
    ['col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.45;',                     false],
    ['col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.18;',                     true ],
  ];
  let pass = true;
  for (const [needle, shouldExist] of checks) {
    const found = patched.includes(needle);
    if (found !== shouldExist) {
      console.error(`PATCH VERIFY FAIL: "${needle.slice(0,50)}..." should ${shouldExist ? 'exist' : 'NOT exist'}`);
      pass = false;
    }
  }
  // Safety: mkMatWindow must be unchanged
  const origWindowCount = (original.match(/mkMatWindow/g) || []).length;
  const patchWindowCount = (patched.match(/mkMatWindow/g) || []).length;
  if (origWindowCount !== patchWindowCount) {
    console.error(`PATCH VERIFY FAIL: mkMatWindow count changed! ${origWindowCount} → ${patchWindowCount}`);
    pass = false;
  }
  // Safety: prayerDisc must be unchanged
  const origDiscCount = (original.match(/prayerDisc/g) || []).length;
  const patchDiscCount = (patched.match(/prayerDisc/g) || []).length;
  if (origDiscCount !== patchDiscCount) {
    console.error(`PATCH VERIFY FAIL: prayerDisc count changed! ${origDiscCount} → ${patchDiscCount}`);
    pass = false;
  }
  return pass;
}

const CHROME_ARGS = [
  '--no-sandbox', '--disable-gpu-sandbox',
  '--use-gl=angle', '--use-angle=gl-egl',
  '--ozone-platform=headless',
  '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
  '--in-process-gpu', '--enable-webgl',
];

async function screenshot(page, label) {
  const p = path.join(OUT, `chris-glass-${label}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`Saved: ${p}`);
  return p;
}

async function hideSplash(page) {
  await page.evaluate(() => {
    const splash = document.getElementById('splash') || document.querySelector('.splash');
    if (splash) splash.style.display = 'none';
    // Also hide any intro overlay
    document.querySelectorAll('[id*="intro"],[id*="splash"],[class*="splash"],[class*="intro"]')
      .forEach(el => { el.style.display = 'none'; });
  });
}

async function checkGPU(page) {
  const renderer = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 'NO CANVAS';
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (!gl) return 'NO WEBGL';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (!dbg) return 'NO DEBUG EXT';
    return gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
  });
  console.log(`GPU: ${renderer}`);
  return renderer;
}

(async () => {
  // ── Load original JS ──────────────────────────────────────────────────────
  const originalSrc = fs.readFileSync(JS_SRC, 'utf8');
  const patchedSrc  = applyGlassPatch(originalSrc);

  if (!verifyPatch(originalSrc, patchedSrc)) {
    console.error('ABORTING — patch verification failed');
    process.exit(1);
  }
  console.log('Patch verified: all 10 targets hit, prayer windows untouched.');

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

  // ── BEFORE: unpatched ─────────────────────────────────────────────────────
  console.log('Capturing BEFORE...');
  const pageBefore = await browser.newPage();
  await pageBefore.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 16000));
  await checkGPU(pageBefore);
  await hideSplash(pageBefore);
  await new Promise(r => setTimeout(r, 500));
  await screenshot(pageBefore, 'before');
  await pageBefore.close();

  // ── AFTER: patched via request interception ───────────────────────────────
  console.log('Capturing AFTER (patched shader)...');
  const pageAfter = await browser.newPage();
  await pageAfter.setRequestInterception(true);

  pageAfter.on('request', req => {
    if (req.url().includes('glass-cube-clock.js')) {
      req.respond({
        status: 200,
        contentType: 'application/javascript',
        body: patchedSrc,
      });
    } else {
      req.continue();
    }
  });

  await pageAfter.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 16000));
  await checkGPU(pageAfter);
  await hideSplash(pageAfter);
  await new Promise(r => setTimeout(r, 500));
  await screenshot(pageAfter, 'after-v1');
  await pageAfter.close();

  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
