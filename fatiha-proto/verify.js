// بسم الله الرحمن الرحيم
// fatiha.app verification script — runs BEFORE capture, logs actual computed state
// Usage: node verify.js [check1,check2,...] or node verify.js (runs all)
// Checks: curve, garden, canvas, all

const puppeteer = require('puppeteer-core');

const CHECKS = (process.argv[2] || 'all').split(',');
const runAll = CHECKS.includes('all');

(async () => {
  const b = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: ['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl',
      '--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage',
      '--in-process-gpu','--enable-webgl','--autoplay-policy=no-user-gesture-required']
  });

  const p = await b.newPage();
  await p.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });
  await p.goto('http://localhost:9980/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Start playback briefly to populate state
  await p.click('#play-btn');
  await p.evaluate((t) => { window._synthTime = t; }, 0.5);
  await p.evaluate(() => new Promise(r => requestAnimationFrame(r)));
  await p.evaluate(() => new Promise(r => requestAnimationFrame(r)));

  const state = await p.evaluate(() => {
    const result = {};

    // Canvas
    result.canvas = { W, H, dpr, orientation: W > H ? 'LANDSCAPE' : 'PORTRAIT' };

    // Curve endpoints
    if (typeof curvePoints !== 'undefined' && curvePoints.length > 0) {
      const first = curvePoints[0];
      const last = curvePoints[curvePoints.length - 1];
      const pctFirst = { x: (first.x / W * 100).toFixed(1) + '%', y: (first.y / H * 100).toFixed(1) + '%' };
      const pctLast = { x: (last.x / W * 100).toFixed(1) + '%', y: (last.y / H * 100).toFixed(1) + '%' };

      // Determine corner names
      const cornerName = (px, py) => {
        const lr = parseFloat(px) > 50 ? 'right' : 'left';
        const tb = parseFloat(py) > 50 ? 'bottom' : 'top';
        return `${tb}-${lr}`;
      };

      result.curve = {
        totalPoints: curvePoints.length,
        start: { px: { x: Math.round(first.x), y: Math.round(first.y) }, pct: pctFirst, corner: cornerName(pctFirst.x, pctFirst.y) },
        end: { px: { x: Math.round(last.x), y: Math.round(last.y) }, pct: pctLast, corner: cornerName(pctLast.x, pctLast.y) },
      };

      // Sample 5 points along curve to show the path
      result.curve.path = [];
      for (let i = 0; i < 5; i++) {
        const idx = Math.floor(i * (curvePoints.length - 1) / 4);
        const pt = curvePoints[idx];
        result.curve.path.push({
          progress: (i * 25) + '%',
          px: { x: Math.round(pt.x), y: Math.round(pt.y) },
          pct: { x: (pt.x / W * 100).toFixed(1) + '%', y: (pt.y / H * 100).toFixed(1) + '%' }
        });
      }
    }

    // Garden state
    if (typeof garden !== 'undefined') {
      result.garden = {
        elementCount: garden.length,
        first3: garden.slice(0, 3).map(g => ({
          kind: g.kind, ci: g.ci, side: g.side,
          curvePos: curvePoints[Math.min(g.ci, curvePoints.length-1)]
            ? { x: Math.round(curvePoints[Math.min(g.ci, curvePoints.length-1)].x),
                y: Math.round(curvePoints[Math.min(g.ci, curvePoints.length-1)].y) }
            : null
        }))
      };
    }

    // Falling petals
    if (typeof fallingPetals !== 'undefined') {
      result.fallingPetals = { count: fallingPetals.length };
    }

    return result;
  });

  // Pretty print with pass/fail indicators
  console.log('\n═══ FATIHA VERIFY ═══\n');

  if (runAll || CHECKS.includes('canvas')) {
    const c = state.canvas;
    console.log(`📐 Canvas: ${c.W}×${c.H} @ ${c.dpr}x DPR = ${c.W}px × ${c.H}px`);
    console.log(`   Orientation: ${c.orientation}`);
  }

  if (runAll || CHECKS.includes('curve')) {
    const cv = state.curve;
    if (cv) {
      console.log(`\n📈 Curve: ${cv.totalPoints} points`);
      console.log(`   START (progress=0): ${JSON.stringify(cv.start.px)} = ${cv.start.pct.x}, ${cv.start.pct.y} → ${cv.start.corner.toUpperCase()}`);
      console.log(`   END   (progress=1): ${JSON.stringify(cv.end.px)} = ${cv.end.pct.x}, ${cv.end.pct.y} → ${cv.end.corner.toUpperCase()}`);
      console.log('   Path:');
      for (const pt of cv.path) {
        console.log(`     ${pt.progress}: (${pt.pct.x}, ${pt.pct.y})`);
      }
    }
  }

  if (runAll || CHECKS.includes('garden')) {
    const g = state.garden;
    if (g) {
      console.log(`\n🌹 Garden: ${g.elementCount} elements`);
      for (const el of g.first3) {
        console.log(`   ${el.kind} @ ci=${el.ci}, side=${el.side}, curvePos=${JSON.stringify(el.curvePos)}`);
      }
    }
  }

  console.log('\n═══════════════════\n');

  await b.close();
})();
