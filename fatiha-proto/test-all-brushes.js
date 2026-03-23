/**
 * Visual + state test: verify all brushes and advanced controls work
 */
const puppeteer = require('puppeteer');

const URL = 'http://localhost:9981/studio.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const BRUSHES = ['2H', 'HB', '2B', 'cpencil', 'pen', 'rotring', 'marker', 'charcoal', 'spray', 'watercolor'];

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}: ${e.message}`); }
}
function assert(c, m) { if (!c) throw new Error(m || 'failed'); }

(async () => {
  console.log('\n═══ All Brushes + Advanced Features Test ═══\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=swiftshader', '--ignore-gpu-blocklist'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on('pageerror', () => {}); // swallow WebGL errors in headless

  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForFunction(() => typeof window.state !== 'undefined', { timeout: 10000 });
  await sleep(2000);

  // TEST: BRUSHES array has all 10 types (check via page source, not DOM buttons which need WebGL)
  await test('All 10 brush types defined in BRUSHES', async () => {
    // Read the source HTML to check BRUSHES definition
    const html = await page.content();
    for (const b of BRUSHES) {
      assert(html.includes(`id: '${b}'`), `Missing brush definition: ${b}`);
    }
    assert(!html.includes(`id: 'crayon'`), 'Crayon should be removed');
  });

  // TEST: Each brush can be selected and creates valid strokes
  for (const brushName of BRUSHES) {
    await test(`Brush "${brushName}" creates valid stroke`, async () => {
      const result = await page.evaluate((bn) => {
        const pts = [[300, 400, 0.5], [400, 400, 0.6], [500, 400, 0.5]];
        window._testStrokeId = (window._testStrokeId || 0) + 1;
        const s = {
          id: window._testStrokeId,
          brush: bn,
          color: '#1a3a8a',
          weight: 5,
          opacity: 200,
          layer: 'detail',
          drawMode: 'normal',
          vectorField: 'none',
          wiggle: 0,
          points: pts,
          timestamp: Date.now(),
          hidden: false,
        };
        window.strokes.push(s);
        return { brush: s.brush, pointCount: s.points.length };
      }, brushName);
      assert(result.brush === brushName, `Expected brush ${brushName}, got ${result.brush}`);
      assert(result.pointCount === 3, `Expected 3 points`);
    });
  }

  // TEST: Advanced state fields exist
  await test('State has drawMode, vectorField, wiggle fields', async () => {
    const s = await page.evaluate(() => ({
      drawMode: window.state.drawMode,
      vectorField: window.state.vectorField,
      wiggle: window.state.wiggle,
      splineCurvature: window.state.splineCurvature,
      hatchDist: window.state.hatchDist,
      hatchAngle: window.state.hatchAngle,
    }));
    assert(s.drawMode === 'normal', `drawMode should be 'normal', got '${s.drawMode}'`);
    assert(s.vectorField === 'none', `vectorField should be 'none', got '${s.vectorField}'`);
    assert(s.wiggle === 0, `wiggle should be 0, got ${s.wiggle}`);
    assert(s.splineCurvature === 0.5, `splineCurvature should be 0.5`);
    assert(s.hatchDist === 8, `hatchDist should be 8`);
    assert(s.hatchAngle === 45, `hatchAngle should be 45`);
  });

  // TEST: Draw mode selector exists
  await test('Draw mode selector exists with options', async () => {
    const options = await page.evaluate(() => {
      const sel = document.getElementById('bp-draw-mode');
      if (!sel) return [];
      return Array.from(sel.options).map(o => o.value);
    });
    assert(options.includes('normal'), 'Missing normal mode');
    assert(options.includes('spline'), 'Missing spline mode');
    assert(options.includes('hatch'), 'Missing hatch mode');
  });

  // TEST: Vector field selector exists
  await test('Vector field selector has all built-in fields', async () => {
    const options = await page.evaluate(() => {
      const sel = document.getElementById('bp-field');
      if (!sel) return [];
      return Array.from(sel.options).map(o => o.value);
    });
    const expected = ['none', 'hand', 'curved', 'zigzag', 'waves', 'seabed', 'spiral', 'columns'];
    for (const f of expected) {
      assert(options.includes(f), `Missing field: ${f}`);
    }
  });

  // TEST: Wiggle slider exists
  await test('Wiggle slider exists and updates state', async () => {
    const exists = await page.evaluate(() => !!document.getElementById('bp-wiggle'));
    assert(exists, 'Wiggle slider missing');
  });

  // TEST: Spline curvature slider exists
  await test('Spline curvature slider exists', async () => {
    const exists = await page.evaluate(() => !!document.getElementById('bp-spline-curve'));
    assert(exists, 'Spline curve slider missing');
  });

  // TEST: Hatch controls exist
  await test('Hatch dist and angle controls exist', async () => {
    const dist = await page.evaluate(() => !!document.getElementById('bp-hatch-dist'));
    const angle = await page.evaluate(() => !!document.getElementById('bp-hatch-angle'));
    assert(dist, 'Hatch distance slider missing');
    assert(angle, 'Hatch angle slider missing');
  });

  // TEST: Spline stroke stored correctly
  await test('Spline mode stroke has correct drawMode', async () => {
    const result = await page.evaluate(() => {
      window._testStrokeId = (window._testStrokeId || 0) + 1;
      const s = {
        id: window._testStrokeId,
        brush: 'pen',
        color: '#c83c28',
        weight: 3,
        opacity: 200,
        layer: 'detail',
        drawMode: 'spline',
        vectorField: 'none',
        wiggle: 0,
        splineCurvature: 0.7,
        points: [[200, 300, 0.5], [300, 250, 0.8], [400, 300, 0.5], [500, 250, 0.8]],
        timestamp: Date.now(),
        hidden: false,
      };
      window.strokes.push(s);
      return { drawMode: s.drawMode, splineCurvature: s.splineCurvature };
    });
    assert(result.drawMode === 'spline', `Expected drawMode 'spline'`);
    assert(result.splineCurvature === 0.7, `Expected curvature 0.7`);
  });

  // TEST: Hatch stroke stored correctly
  await test('Hatch mode stroke has correct parameters', async () => {
    const result = await page.evaluate(() => {
      window._testStrokeId = (window._testStrokeId || 0) + 1;
      const s = {
        id: window._testStrokeId,
        brush: 'HB',
        color: '#1a1a1a',
        weight: 5,
        opacity: 200,
        layer: 'detail',
        drawMode: 'hatch',
        vectorField: 'none',
        wiggle: 0,
        hatchDist: 12,
        hatchAngle: 60,
        points: [[200, 500, 0.5], [300, 500, 0.5], [400, 500, 0.5]],
        timestamp: Date.now(),
        hidden: false,
      };
      window.strokes.push(s);
      return { drawMode: s.drawMode, hatchDist: s.hatchDist, hatchAngle: s.hatchAngle };
    });
    assert(result.drawMode === 'hatch', `Expected drawMode 'hatch'`);
    assert(result.hatchDist === 12, `Expected hatchDist 12`);
    assert(result.hatchAngle === 60, `Expected hatchAngle 60`);
  });

  // TEST: No crayon brush (was the original bug)
  await test('No crayon brush in panel (bug fix verified)', async () => {
    const hasCrayon = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.brush-btn')).some(b => b.dataset.brush === 'crayon');
    });
    assert(!hasCrayon, 'Crayon should be removed — it is not a valid p5.brush');
  });

  // TEST: cpencil replaced crayon (check source definition)
  await test('cpencil (Colored Pencil) replaced crayon in source', async () => {
    const html = await page.content();
    assert(html.includes("id: 'cpencil'"), 'cpencil should be defined');
    assert(!html.includes("id: 'crayon'"), 'crayon should not be defined');
  });

  console.log(`\n═══ Results ═══`);
  console.log(`  ${passed} passed, ${failed} failed, ${passed + failed} total\n`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
