const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const URL = 'http://localhost:9981/studio.html';
const CHROME = '/usr/bin/google-chrome-stable';
const SHOT_DIR = path.join(__dirname, 'test-shots');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Simulate a watercolor stroke by dispatching pointer events with pressure
async function drawStroke(page, points, pressure = 0.5) {
  const first = points[0];
  // pointerdown
  await page.evaluate(([x, y, p]) => {
    const canvas = document.querySelector('#canvas-container canvas') || document.querySelector('canvas');
    canvas.dispatchEvent(new PointerEvent('pointerdown', {
      clientX: x, clientY: y, offsetX: x, offsetY: y,
      pressure: p, pointerType: 'pen', bubbles: true
    }));
  }, [first[0], first[1], typeof first[2] === 'number' ? first[2] : pressure]);

  // pointermove for each subsequent point
  for (let i = 1; i < points.length; i++) {
    const pt = points[i];
    const p = typeof pt[2] === 'number' ? pt[2] : pressure;
    await page.evaluate(([x, y, pr]) => {
      const canvas = document.querySelector('#canvas-container canvas') || document.querySelector('canvas');
      canvas.dispatchEvent(new PointerEvent('pointermove', {
        clientX: x, clientY: y, offsetX: x, offsetY: y,
        pressure: pr, pointerType: 'pen', bubbles: true
      }));
    }, [pt[0], pt[1], p]);
    await sleep(10);
  }

  // pointerup
  const last = points[points.length - 1];
  await page.evaluate(([x, y]) => {
    const canvas = document.querySelector('#canvas-container canvas') || document.querySelector('canvas');
    canvas.dispatchEvent(new PointerEvent('pointerup', {
      clientX: x, clientY: y, offsetX: x, offsetY: y,
      pressure: 0, pointerType: 'pen', bubbles: true
    }));
  }, [last[0], last[1]]);
}

// Set slider value programmatically
async function setSlider(page, sliderType, value) {
  await page.evaluate(([type, val]) => {
    // Trigger the slider callback directly via state
    if (type === 'size') {
      window.state.weight = val;
      document.getElementById('size-val').textContent = val.toFixed(1);
    } else if (type === 'opacity') {
      window.state.opacity = Math.round(val);
      document.getElementById('opacity-val').textContent = Math.round(val);
    }
  }, [sliderType, value]);
}

// Select watercolor brush
async function selectWatercolor(page) {
  await page.evaluate(() => {
    window.state.brush = 'watercolor';
    document.querySelectorAll('.brush-btn').forEach(el => {
      el.classList.toggle('active', el.dataset.brush === 'watercolor');
    });
  });
}

// Generate a gentle S-curve of points
function sCurve(startX, startY, endX, endY, steps = 30) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t + Math.sin(t * Math.PI) * 40;
    pts.push([x, y]);
  }
  return pts;
}

async function main() {
  if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--enable-unsafe-swiftshader',
      '--use-gl=swiftshader',
      '--window-size=800,1000',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 1000 });

  // Capture console logs
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Loading studio...');
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2000); // let p5 + brush init

  // Verify state is accessible
  const stateCheck = await page.evaluate(() => JSON.stringify(window.state));
  console.log('Initial state:', stateCheck);

  // ── TEST 1: SIZE=3 watercolor (thin) ──
  console.log('\n=== TEST 1: SIZE=3 (thin watercolor) ===');
  await selectWatercolor(page);
  await setSlider(page, 'size', 3);
  await setSlider(page, 'opacity', 150);
  const state1 = await page.evaluate(() => `weight=${window.state.weight} opacity=${window.state.opacity} brush=${window.state.brush}`);
  console.log('State:', state1);
  await drawStroke(page, sCurve(200, 200, 600, 200, 40), 0.5);
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '1-size3-thin.png') });
  console.log('Screenshot: 1-size3-thin.png');

  // ── TEST 2: SIZE=15 watercolor (wide) ──
  console.log('\n=== TEST 2: SIZE=15 (wide watercolor) ===');
  await setSlider(page, 'size', 15);
  const state2 = await page.evaluate(() => `weight=${window.state.weight} opacity=${window.state.opacity}`);
  console.log('State:', state2);
  await drawStroke(page, sCurve(200, 400, 600, 400, 40), 0.5);
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '2-size15-wide.png') });
  console.log('Screenshot: 2-size15-wide.png');

  // ── TEST 3: OPACITY=50 (very transparent, heavy bleed) ──
  console.log('\n=== TEST 3: OPACITY=50 (transparent) ===');
  await setSlider(page, 'size', 10);
  await setSlider(page, 'opacity', 50);
  const state3 = await page.evaluate(() => `weight=${window.state.weight} opacity=${window.state.opacity}`);
  console.log('State:', state3);
  await drawStroke(page, sCurve(200, 550, 600, 550, 40), 0.5);
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '3-opacity50-transparent.png') });
  console.log('Screenshot: 3-opacity50-transparent.png');

  // ── TEST 4: OPACITY=200 (more opaque, tight edges) ──
  console.log('\n=== TEST 4: OPACITY=200 (opaque) ===');
  await setSlider(page, 'opacity', 200);
  const state4 = await page.evaluate(() => `weight=${window.state.weight} opacity=${window.state.opacity}`);
  console.log('State:', state4);
  await drawStroke(page, sCurve(200, 700, 600, 700, 40), 0.5);
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '4-opacity200-opaque.png') });
  console.log('Screenshot: 4-opacity200-opaque.png');

  // ── TEST 5: Pressure variation (taper in/out) ──
  console.log('\n=== TEST 5: Pressure variation ===');
  await setSlider(page, 'size', 12);
  await setSlider(page, 'opacity', 150);
  // Build points with varying pressure: light → heavy → light
  const pressurePts = [];
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const x = 200 + 400 * t;
    const y = 850 + Math.sin(t * Math.PI) * 30;
    // Pressure: start light (0.1), peak heavy (0.9), end light (0.1)
    const pressure = 0.1 + 0.8 * Math.sin(t * Math.PI);
    pressurePts.push([x, y, pressure]);
  }
  await drawStroke(page, pressurePts);
  await sleep(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, '5-pressure-variation.png') });
  console.log('Screenshot: 5-pressure-variation.png');

  // ── FINAL: full canvas overview ──
  await page.screenshot({ path: path.join(SHOT_DIR, 'all-tests.png') });
  console.log('\nAll screenshots saved to', SHOT_DIR);

  // Log final stroke data for debugging
  const strokeData = await page.evaluate(() => {
    return window.strokes ? window.strokes.map(s => ({
      brush: s.brush, weight: s.weight, opacity: s.opacity,
      pointCount: s.points.length,
      pressureRange: s.points.length > 0 ? [
        Math.min(...s.points.map(p => p[2] || 0.5)).toFixed(2),
        Math.max(...s.points.map(p => p[2] || 0.5)).toFixed(2)
      ] : []
    })) : 'no strokes';
  });
  console.log('\nStroke data:', JSON.stringify(strokeData, null, 2));

  await browser.close();
  console.log('\nDone!');
}

main().catch(err => { console.error(err); process.exit(1); });
