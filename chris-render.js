// chris-render.js v3 — Glass lookdev renders for Seven Heavens Studio
// Approach: request interception patches:
//   1. GLSL hardcoded blue terms → uniforms
//   2. cubeMat uniform init with neutral defaults
//   3. window exposure of key lights + cubeMat + lerp state setters

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SITE_JS = '/home/tawfeeq/ramadan-clock-site/glass-cube-clock.js';
const OUT_DIR = '/home/openclaw-agent/.openclaw/workspace';
const URL = 'http://localhost:7748/';

// ── Patch GLSL and JS ────────────────────────────────────────────────────────

function patchJS(src) {
  // 1. Add new uniforms to dichroicFrag header
  // Find the 'uniform float uIorR' line and add our new vec3 uniforms before it
  src = src.replace(
    '  uniform float     uIorR, uIorG, uIorB;',
    [
      '  uniform float     uIorR, uIorG, uIorB;',
      '  uniform vec3      uGlassTint;    // base refraction tint',
      '  uniform vec3      uFresnelColor; // fresnel edge color',
      '  uniform vec3      uSideAmbient;  // side-face ambient fill',
      '  uniform vec3      uSkyFill;      // top-face sky reflection',
      '  uniform vec3      uEdgeCatch;    // edge catch rim',
      '  uniform vec3      uShadowFill;   // shadow side fill',
      '  uniform vec3      uShadowEdge;   // shadow side edge',
    ].join('\n')
  );

  // 2. Replace hardcoded blue GLSL terms with uniforms
  src = src.replace(
    'vec3 col = refracted * vec3(0.94, 0.97, 1.06) * 2.8 * bottomAtten;',
    'vec3 col = refracted * uGlassTint * 2.8 * bottomAtten;'
  );
  src = src.replace(
    'col += vec3(0.80, 0.92, 1.00) * fresnel * 0.35;',
    'col += uFresnelColor * fresnel * 0.35;'
  );
  src = src.replace(
    'col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.30;',
    'col += uSideAmbient * sideFacing * 0.30;'
  );
  src = src.replace(
    'col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.38;',
    'col += pow(skyFacing, 1.8) * uSkyFill * 0.38;'
  );
  src = src.replace(
    'col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.80;',
    'col += uEdgeCatch * edgeCatch * 1.80;'
  );
  src = src.replace(
    'col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.35; // cool blue fill, subtle',
    'col += uShadowFill * shadowSide * 0.35;'
  );
  src = src.replace(
    'col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.45;',
    'col += uShadowEdge * edgeCatch * shadowSide * 0.45;'
  );

  // 3. Add new uniforms to cubeMat initialization
  src = src.replace(
    'uInternalGlow:  { value: 0.0 }, // crystal-fix: 0.24→0.0 — warm amber emission = jello/subsurface. Crystal is cold.',
    [
      'uInternalGlow:  { value: 0.0 }, // crystal-fix: 0.24→0.0 — warm amber emission = jello/subsurface. Crystal is cold.',
      '    // ── Chris glass color controls (lookdev injection) ──',
      '    uGlassTint:    { value: new THREE.Color().setRGB(0.94, 0.97, 1.06) },',
      '    uFresnelColor: { value: new THREE.Color().setRGB(0.80, 0.92, 1.00) },',
      '    uSideAmbient:  { value: new THREE.Color().setRGB(0.22, 0.28, 0.45) },',
      '    uSkyFill:      { value: new THREE.Color().setRGB(0.90, 0.94, 1.00) },',
      '    uEdgeCatch:    { value: new THREE.Color().setRGB(0.70, 0.85, 1.00) },',
      '    uShadowFill:   { value: new THREE.Color().setRGB(0.15, 0.18, 0.30) },',
      '    uShadowEdge:   { value: new THREE.Color().setRGB(0.50, 0.60, 0.80) },',
    ].join('\n')
  );

  // 4. Expose key lights and lerp state on window
  src += `
// ── CHRIS LOOKDEV INJECTION (runtime only, not saved) ──
window._back = back;
window._cubeBack = cubeBack;
window._violetRim = violetRim;
window._rim = rim;
window._plinthRectLight = _plinthRect;
window._plinthSpotLight = _plinthSpot;
window._cubeMat = cubeMat;
// Lerp state setters (bypass the prayer lerp system)
window._setBackLerpI = function(v) { _backLerpIntensity = v; };
window._setCubeSunLerpI = function(v) { _cubeSunLerpIntensity = v; };
window._setCubeBackLerpI = function(v) { _cubeBackLerpIntensity = v; };
window._setPlinthRectI = function(v) { _plinthRectIntensity = v; };
window._setPlinthSpotI = function(v) { _plinthSpotIntensity = v; };
window._setBackLerpC = function(r,g,b) { _backLerpColor.setRGB(r,g,b); };
window._setCubeBackLerpC = function(r,g,b) { _cubeBackLerpColor.setRGB(r,g,b); };
window._setPlinthRectC = function(r,g,b) { _plinthRectColor.setRGB(r,g,b); };
window._setPlinthSpotC = function(r,g,b) { _plinthSpotColor.setRGB(r,g,b); };
window._getLerpState = function() {
  return { backI: _backLerpIntensity, backC: _backLerpColor.getHex() };
};
console.log('[chris injection] lights and cubeMat exposed on window');
`;

  return src;
}

// ── 6 Glass Looks ────────────────────────────────────────────────────────────
// glass colors: neutral (0.97,0.97,0.97) = no tint, warm (1.05,0.97,0.90) = amber bias
// The uGlassTint, uFresnelColor, etc. are the key new controls.
// Combined with back light intensity/color and IOR, these create truly distinct looks.

const LOOKS = [
  {
    id: '01',
    name: 'Diamond Dust',
    ref: 'Swarovski showroom / max dispersion. Near-neutral glass tint. Rainbow caustics dominant. Pure spectral',
    back:       { color: 0xc0c0c0, intensity: 2.0 },   // neutral gray — no blue wash
    cubeBack:   { color: 0xffe8c0, intensity: 14.0 },
    cubeSun:    { color: 0xfffaf0, intensity: 100 },
    violetRim:  { color: 0xd0c0ff, intensity: 7.0 },   // silver-violet, not saturated blue
    rim:        { color: 0x9080c0, intensity: 4.0 },
    plinthRect: { color: 0xe0ecff, intensity: 14.0, pos: [-3.1,-8,1.6], target: [0.25,0,1.1] },
    plinthSpot: { color: 0xffa030, intensity: 12.0, pos: [2.0,3,2.5],   target: [-0.2,-0.5,1.0] },
    ior:        { r: 1.55, g: 1.57, b: 1.58 },
    dich:       0.9, fresnel: 3.5,
    // Glass shader colors — all near-neutral, let the lighting do the work
    glass: {
      tint:       [0.97, 0.97, 0.97],    // neutral white refraction
      fresnel:    [0.90, 0.92, 0.95],    // cool silver edge
      sideAmbient:[0.12, 0.12, 0.18],    // barely-there fill (near-black)
      skyFill:    [0.88, 0.90, 0.94],    // slight cool sky
      edgeCatch:  [0.75, 0.85, 0.95],    // silver edge catch
      shadowFill: [0.10, 0.10, 0.15],    // very subtle
      shadowEdge: [0.45, 0.50, 0.70],    // cooler
    },
  },
  {
    id: '02',
    name: 'Ember Glass',
    ref: 'Deakins Sicario / fire inside cold vessel. Amber glass tint + warm rims = glowing amber crystal',
    back:       { color: 0x4a1800, intensity: 2.5 },
    cubeBack:   { color: 0xff6000, intensity: 18.0 },
    cubeSun:    { color: 0xffa030, intensity: 85 },
    violetRim:  { color: 0xff8040, intensity: 7.0 },   // WARM ORANGE rim
    rim:        { color: 0xff5010, intensity: 4.5 },
    plinthRect: { color: 0xFFC188, intensity: 12.0, pos: [-3.5,-8,3.2], target: [0.65,0,1.35] },
    plinthSpot: { color: 0x7090e0, intensity: 10.0, pos: [2.8,3,-2.4],  target: [-0.15,-0.5,0.95] },
    ior:        { r: 1.70, g: 1.58, b: 1.50 },
    dich: 0.75, fresnel: 4.5,
    glass: {
      tint:       [1.08, 0.96, 0.88],    // AMBER tint — warm
      fresnel:    [1.00, 0.88, 0.72],    // warm amber fresnel edge
      sideAmbient:[0.35, 0.20, 0.08],    // warm amber side fill
      skyFill:    [0.95, 0.88, 0.75],    // warm sky
      edgeCatch:  [1.00, 0.75, 0.40],    // ORANGE edge catch
      shadowFill: [0.20, 0.12, 0.05],    // dark amber shadow
      shadowEdge: [0.60, 0.40, 0.15],    // amber shadow edge
    },
  },
  {
    id: '03',
    name: 'Void Crystal',
    ref: 'Kubrick 2001 / deep space monolith. Minimal fill — cube is almost invisible, then: electric edges',
    back:       { color: 0x0a0a10, intensity: 1.2 },
    cubeBack:   { color: 0xd0e0ff, intensity: 5.0 },
    cubeSun:    { color: 0xf8f8ff, intensity: 95 },
    violetRim:  { color: 0xa060ff, intensity: 14.0 },  // electric violet
    rim:        { color: 0x6040d0, intensity: 9.0 },
    plinthRect: { color: 0xc8d8ff, intensity: 11.6, pos: [-2.7,-8,0.8], target: [0.15,0,1.0] },
    plinthSpot: { color: 0xe0e8ff, intensity: 11.0, pos: [2.7,3,0.8],   target: [-0.15,-0.5,1.0] },
    ior:        { r: 1.40, g: 1.42, b: 1.44 },
    dich: 0.5, fresnel: 5.0,
    glass: {
      tint:       [0.95, 0.96, 0.97],    // near-neutral, clean
      fresnel:    [0.85, 0.90, 0.95],    // silver-cool edge
      sideAmbient:[0.02, 0.02, 0.03],    // near-ZERO fill → maximum transparency
      skyFill:    [0.80, 0.84, 0.90],
      edgeCatch:  [0.65, 0.80, 1.00],    // electric blue-white edge (main visual)
      shadowFill: [0.02, 0.02, 0.04],    // almost off
      shadowEdge: [0.40, 0.50, 0.80],    // blue shadow edge
    },
  },
  {
    id: '04',
    name: 'Mihrab Moonbeam',
    ref: 'Tawfeeq\'s favorite. Lunar blue-silver glass. Standard IOR signature. Devotional cool.',
    back:       { color: 0x141c2a, intensity: 2.8 },
    cubeBack:   { color: 0xd8e8ff, intensity: 8.0 },
    cubeSun:    { color: 0xdde8ff, intensity: 70 },
    violetRim:  { color: 0x5870d0, intensity: 8.0 },
    rim:        { color: 0x3850a0, intensity: 5.0 },
    plinthRect: { color: 0xBFD4FF, intensity: 12.9, pos: [-3.1,-8,1.6], target: [0.25,0,1.1] },
    plinthSpot: { color: 0xFFB978, intensity: 8.0,  pos: [2.0,3,2.5],   target: [-0.2,-0.5,1.0] },
    ior:        { r: 1.50, g: 1.56, b: 1.63 },
    dich: 0.70, fresnel: 4.0,
    glass: {
      tint:       [0.92, 0.95, 1.00],    // subtle cool tint (close to original)
      fresnel:    [0.78, 0.90, 1.00],    // lunar blue edge
      sideAmbient:[0.10, 0.14, 0.25],    // reduced but cool
      skyFill:    [0.85, 0.90, 0.98],
      edgeCatch:  [0.65, 0.82, 1.00],
      shadowFill: [0.08, 0.10, 0.20],
      shadowEdge: [0.40, 0.55, 0.80],
    },
  },
  {
    id: '05',
    name: 'Electric Mihrab',
    ref: 'Tadao Ando chapel + neon voltage. Electric violet/blue. Maximum rim drama. Dark gallery gem.',
    back:       { color: 0x080812, intensity: 1.0 },
    cubeBack:   { color: 0x2050ff, intensity: 8.0 },
    cubeSun:    { color: 0x90c0ff, intensity: 80 },
    violetRim:  { color: 0x8840ff, intensity: 16.0 },
    rim:        { color: 0x4090ff, intensity: 11.0 },
    plinthRect: { color: 0x9eb8ff, intensity: 10.5, pos: [-3.2,-8,5.6], target: [0.2,0,1.0] },
    plinthSpot: { color: 0xffb46e, intensity: 12.0, pos: [2.6,3,2.7],   target: [-0.4,-0.5,1.2] },
    ior:        { r: 1.48, g: 1.55, b: 1.70 },
    dich: 0.85, fresnel: 3.0,
    glass: {
      tint:       [0.88, 0.92, 1.05],    // electric blue tint (intentional — this look IS blue electric)
      fresnel:    [0.70, 0.85, 1.00],    // neon edge
      sideAmbient:[0.05, 0.05, 0.08],    // reduced fill — transparency dominant
      skyFill:    [0.85, 0.90, 1.00],
      edgeCatch:  [0.60, 0.78, 1.00],    // electric blue-white
      shadowFill: [0.05, 0.05, 0.10],
      shadowEdge: [0.40, 0.55, 0.90],    // electric shadow edge
    },
  },
  {
    id: '06',
    name: 'Sahara Dusk',
    ref: 'Deakins Ember Silence / desert fajr. Warmest look. Amber-gold glass body. Gallery precious object.',
    back:       { color: 0x2a1206, intensity: 4.0 },
    cubeBack:   { color: 0xff5808, intensity: 14.0 },
    cubeSun:    { color: 0xffc050, intensity: 68 },
    violetRim:  { color: 0x4020a0, intensity: 5.0 },
    rim:        { color: 0x281040, intensity: 2.5 },
    plinthRect: { color: 0xFFC188, intensity: 11.3, pos: [-3.5,-8,3.2], target: [0.65,0,1.35] },
    plinthSpot: { color: 0xFFD080, intensity: 9.0,  pos: [2.8,3,-1.5],  target: [-0.15,-0.5,0.95] },
    ior:        { r: 1.75, g: 1.60, b: 1.48 },
    dich: 0.65, fresnel: 4.5,
    glass: {
      tint:       [1.10, 0.95, 0.85],    // WARM AMBER glass tint — strongest warm
      fresnel:    [1.00, 0.85, 0.65],    // gold-amber fresnel edge
      sideAmbient:[0.40, 0.25, 0.10],    // WARM amber side fill
      skyFill:    [0.98, 0.88, 0.70],    // warm sky tint
      edgeCatch:  [1.00, 0.72, 0.35],    // GOLD edge catch
      shadowFill: [0.22, 0.14, 0.05],    // dark amber shadow
      shadowEdge: [0.65, 0.42, 0.18],    // amber shadow edge
    },
  },
];

async function main() {
  const originalJS = fs.readFileSync(SITE_JS, 'utf8');
  const patchedJS = patchJS(originalJS);

  // Verify patches applied
  const checks = [
    ['uGlassTint', 'GLSL uniform declaration'],
    ['refracted * uGlassTint', 'base refraction tint patched'],
    ['uFresnelColor * fresnel', 'fresnel color patched'],
    ['uSideAmbient * sideFacing', 'side ambient patched'],
    ['uEdgeCatch * edgeCatch', 'edge catch patched'],
    ['window._cubeMat = cubeMat', 'cubeMat exposed'],
  ];
  for (const [term, desc] of checks) {
    if (!patchedJS.includes(term)) {
      console.error(`PATCH FAILED: "${desc}" — "${term}" not found`);
    } else {
      console.log(`✓ ${desc}`);
    }
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
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
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

  // Forward console logs from page
  page.on('console', msg => {
    if (msg.text().includes('[chris') || msg.text().includes('Look ')) {
      console.log('[page]', msg.text());
    }
  });

  // ── Serve patched JS ──
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('glass-cube-clock.js')) {
      req.respond({ status: 200, contentType: 'application/javascript; charset=utf-8', body: patchedJS });
    } else {
      req.continue();
    }
  });

  console.log('\nLoading page...');
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const gpuStr = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'UNKNOWN';
  });
  console.log('GPU:', gpuStr);

  console.log('Waiting 16s for scene...');
  await new Promise(r => setTimeout(r, 16000));

  // Hide splash
  await page.evaluate(() => {
    document.querySelectorAll('#splash, .splash, [class*="splash"], [id*="splash"]').forEach(el => {
      el.style.display = 'none';
    });
  });

  const ready = await page.evaluate(() => typeof window._cubeMat !== 'undefined' && typeof window._back !== 'undefined');
  console.log('Patch ready:', ready);

  // ── Apply look ──
  const applyLook = async (l) => {
    await page.evaluate((l) => {
      const h2rgb = (hex) => [((hex>>16)&255)/255, ((hex>>8)&255)/255, (hex&255)/255];

      // Back light
      const [br,bg,bb] = h2rgb(l.back.color);
      window._back.color.setRGB(br,bg,bb); window._back.intensity = l.back.intensity;
      window._setBackLerpI(l.back.intensity); window._setBackLerpC(br,bg,bb);

      // cubeBack
      const [cr,cg,cb] = h2rgb(l.cubeBack.color);
      window._cubeBack.color.setRGB(cr,cg,cb); window._cubeBack.intensity = l.cubeBack.intensity;
      window._setCubeBackLerpI(l.cubeBack.intensity); window._setCubeBackLerpC(cr,cg,cb);

      // cubeSun
      window.cubeSun.color.setHex(l.cubeSun.color); window.cubeSun.intensity = l.cubeSun.intensity;
      window._setCubeSunLerpI(l.cubeSun.intensity);

      // Rim lights
      window._violetRim.color.setHex(l.violetRim.color); window._violetRim.intensity = l.violetRim.intensity;
      window._rim.color.setHex(l.rim.color); window._rim.intensity = l.rim.intensity;

      // Plinth
      const [pr,pg,pb] = h2rgb(l.plinthRect.color);
      window._plinthRectLight.color.setRGB(pr,pg,pb);
      window._plinthRectLight.intensity = l.plinthRect.intensity;
      window._setPlinthRectI(l.plinthRect.intensity); window._setPlinthRectC(pr,pg,pb);
      window._plinthRectLight.position.set(...l.plinthRect.pos);
      window._plinthRectLight.lookAt(...l.plinthRect.target);

      const [sr,sg,sb] = h2rgb(l.plinthSpot.color);
      window._plinthSpotLight.color.setRGB(sr,sg,sb);
      window._plinthSpotLight.intensity = l.plinthSpot.intensity;
      window._setPlinthSpotI(l.plinthSpot.intensity); window._setPlinthSpotC(sr,sg,sb);
      window._plinthSpotLight.position.set(...l.plinthSpot.pos);
      window._plinthSpotLight.target.position.set(...l.plinthSpot.target);
      window._plinthSpotLight.target.updateMatrixWorld();

      // IOR + dichroic
      if (l.ior) {
        window._cubeMat.uniforms.uIorR.value = l.ior.r;
        window._cubeMat.uniforms.uIorG.value = l.ior.g;
        window._cubeMat.uniforms.uIorB.value = l.ior.b;
      }
      if (l.dich != null) window._cubeMat.uniforms.uDich.value = l.dich;
      if (l.fresnel != null) window._cubeMat.uniforms.uFresnel.value = l.fresnel;

      // ── Glass shader color uniforms — THE KEY FIX ──
      if (l.glass) {
        const m = window._cubeMat.uniforms;
        m.uGlassTint.value.setRGB(...l.glass.tint);
        m.uFresnelColor.value.setRGB(...l.glass.fresnel);
        m.uSideAmbient.value.setRGB(...l.glass.sideAmbient);
        m.uSkyFill.value.setRGB(...l.glass.skyFill);
        m.uEdgeCatch.value.setRGB(...l.glass.edgeCatch);
        m.uShadowFill.value.setRGB(...l.glass.shadowFill);
        m.uShadowEdge.value.setRGB(...l.glass.shadowEdge);
      }

      const state = window._getLerpState();
      console.log(`Look ${l.id}: back i=${state.backI.toFixed(1)} glass=${JSON.stringify(l.glass ? l.glass.tint : 'default')}`);
    }, l);
  };

  // ── Render each look ──
  for (const look of LOOKS) {
    console.log(`\nRendering Look ${look.id}: "${look.name}"...`);

    await applyLook(look);
    await new Promise(r => setTimeout(r, 2000)); // let lerp settle
    await applyLook(look); // re-apply to lock values
    await new Promise(r => setTimeout(r, 500));  // FBO settle

    const pngBase64 = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        window._exportFrame({ width: 430, height: 932, dpr: 2, hideChrome: true })
          .then(blob => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }).catch(reject);
      });
    });

    const outPath = path.join(OUT_DIR, `chris-look-${look.id}.png`);
    fs.writeFileSync(outPath, Buffer.from(pngBase64, 'base64'));
    console.log(`Saved: ${outPath}`);
  }

  await browser.close();
  console.log('\nAll 6 looks rendered.');
}

main().catch(e => { console.error(e); process.exit(1); });
