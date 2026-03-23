// wc-render-test.js — Test watercolor rendering fix
// Verifies: 1) fills render, 2) no re-render, 3) three strokes visible

const puppeteer = require('puppeteer-core');

const URL = 'http://localhost:9981/studio.html';
const CHROME = '/usr/bin/google-chrome-stable';
const ENV = {
  GALLIUM_DRIVER: 'd3d12',
  MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
  LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || ''),
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pointerEvent(page, type, x, y, pressure = 0.5) {
  await page.evaluate(({ type, x, y, pressure }) => {
    const c = document.querySelector('#canvas-container canvas');
    const rect = c.getBoundingClientRect();
    c.dispatchEvent(new PointerEvent(type, {
      clientX: rect.left + x,
      clientY: rect.top + y,
      pressure,
      pointerId: 1,
      pointerType: 'mouse',
      bubbles: true,
      cancelable: true,
    }));
  }, { type, x, y, pressure });
}

async function drawWatercolorStroke(page, sx, sy, ex, ey, steps = 10) {
  await pointerEvent(page, 'pointerdown', sx, sy, 0.7);
  await sleep(30);
  for (let i = 1; i <= steps; i++) {
    const x = sx + (ex - sx) * i / steps;
    const y = sy + (ey - sy) * i / steps;
    await pointerEvent(page, 'pointermove', x, y, 0.7);
    await sleep(20);
  }
  await pointerEvent(page, 'pointerup', ex, ey);
  await sleep(500); // let draw() process pendingWatercolorRender
}

async function run() {
  console.log('\n=== Watercolor Render Fix Test ===\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--use-gl=angle', '--use-angle=swiftshader',
      '--enable-webgl', '--enable-webgl-software-rasterizer',
      '--ignore-gpu-blocklist', '--disable-gpu-sandbox',
      '--window-size=1024,768',
    ],
    env: { ...process.env, ...ENV },
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() =>
    document.querySelector('#canvas-container canvas') !== null,
    { timeout: 20000 }
  );
  await sleep(2000);

  // Get paper mapping
  const m = await page.evaluate(() => ({
    vScale, vOffX, vOffY, PAPER_W, PAPER_H
  }));

  // Set up watercolor brush
  await page.evaluate(() => {
    state.tool = 'draw';
    state.brush = 'watercolor';
    state.color = '#1a3a8a'; // Lapis blue
    state.weight = 8;
    state.opacity = 200;
  });

  // ── TEST 1: pendingWatercolorRender flag exists ──
  const hasPending = await page.evaluate(() =>
    typeof pendingWatercolorRender !== 'undefined' && pendingWatercolorRender === null
  );
  console.log(`  ${hasPending ? '✓' : '✗'} 1. pendingWatercolorRender variable exists`);

  // ── TEST 2: Draw first watercolor stroke and check it was queued ──
  const sx = m.vOffX + m.PAPER_W * m.vScale * 0.2;
  const ex = m.vOffX + m.PAPER_W * m.vScale * 0.8;
  const y1 = m.vOffY + m.PAPER_H * m.vScale * 0.25;
  const y2 = m.vOffY + m.PAPER_H * m.vScale * 0.45;
  const y3 = m.vOffY + m.PAPER_H * m.vScale * 0.65;

  // Instrument renderWatercolorPolygon to count calls
  await page.evaluate(() => {
    window._wcRenderCalls = 0;
    const orig = renderWatercolorPolygon;
    window._origRenderWC = orig;
    window.renderWatercolorPolygon = function(...args) {
      window._wcRenderCalls++;
      return orig.apply(this, args);
    };
  });

  // Draw stroke 1
  await drawWatercolorStroke(page, sx, y1, ex, y1);
  await sleep(500);

  const calls1 = await page.evaluate(() => window._wcRenderCalls);
  console.log(`  ${calls1 === 1 ? '✓' : '✗'} 2. First stroke: renderWatercolorPolygon called ${calls1} time(s) (expected 1)`);

  // ── TEST 3: Draw second stroke — should NOT re-render first ──
  await page.evaluate(() => { state.color = '#c83c28'; }); // Vermillion red
  await drawWatercolorStroke(page, sx, y2, ex, y2);
  await sleep(500);

  const calls2 = await page.evaluate(() => window._wcRenderCalls);
  console.log(`  ${calls2 === 2 ? '✓' : '✗'} 3. Second stroke: total renderWatercolorPolygon calls = ${calls2} (expected 2, no re-render)`);

  // ── TEST 4: Draw third stroke ──
  await page.evaluate(() => { state.color = '#4a7a4a'; }); // Terre Verte green
  await drawWatercolorStroke(page, sx, y3, ex, y3);
  await sleep(1000); // extra wait for draw() to pick up pending

  // Debug: check if pendingWatercolorRender got stuck
  const pendingState = await page.evaluate(() => ({
    pending: pendingWatercolorRender,
    strokeCount: strokes.length,
    lastBrush: strokes.length > 0 ? strokes[strokes.length - 1].brush : null,
    lastPoints: strokes.length > 0 ? strokes[strokes.length - 1].points.length : 0,
    isDrawing: isDrawing,
    frameCount: typeof frameCount !== 'undefined' ? frameCount : -1,
  }));
  console.log(`     debug: pending=${JSON.stringify(pendingState.pending)}, strokes=${pendingState.strokeCount}, lastBrush=${pendingState.lastBrush}, lastPts=${pendingState.lastPoints}, isDrawing=${pendingState.isDrawing}`);

  const calls3 = await page.evaluate(() => window._wcRenderCalls);
  console.log(`  ${calls3 === 3 ? '✓' : '✗'} 4. Third stroke: total renderWatercolorPolygon calls = ${calls3} (expected 3)`);

  // ── TEST 5: All three strokes in strokes array ──
  const strokeInfo = await page.evaluate(() => {
    return strokes.filter(s => s.brush === 'watercolor').map(s => ({
      color: s.color,
      points: s.points.length,
      hidden: s.hidden
    }));
  });
  const allThree = strokeInfo.length === 3;
  console.log(`  ${allThree ? '✓' : '✗'} 5. Three watercolor strokes in array: ${JSON.stringify(strokeInfo.map(s => s.color))}`);

  // ── TEST 6: needsFullRedraw was NOT triggered ──
  const noFullRedraw = await page.evaluate(() => needsFullRedraw === false);
  console.log(`  ${noFullRedraw ? '✓' : '✗'} 6. needsFullRedraw is false (no unnecessary re-render)`);

  // ── TEST 7: No JS errors ──
  const realErrors = errors.filter(e =>
    !e.includes('favicon') && !e.includes('404') &&
    !e.includes('Failed to load resource') && !e.includes('net::ERR_')
  );
  console.log(`  ${realErrors.length === 0 ? '✓' : '✗'} 7. No JS errors${realErrors.length > 0 ? ': ' + realErrors[0] : ''}`);

  // Take screenshot
  await page.screenshot({ path: '/home/openclaw-agent/.openclaw/workspace/fatiha-proto/wc-render-test.png' });
  console.log('\n  Screenshot: wc-render-test.png');

  // ── SUMMARY ──
  const passed = [hasPending, calls1 === 1, calls2 === 2, calls3 === 3, allThree, noFullRedraw, realErrors.length === 0];
  const total = passed.length;
  const ok = passed.filter(Boolean).length;
  console.log(`\n  RESULT: ${ok}/${total} passed\n`);

  await browser.close();
  process.exit(ok === total ? 0 : 1);
}

run().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
