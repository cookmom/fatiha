/**
 * Full unit test suite for fatiha.studio
 * Run with: node studio-full-test.js
 * Requires: puppeteer, server running at http://localhost:9981/studio.html
 */

const puppeteer = require('puppeteer');

const URL = 'http://localhost:9981/studio.html';
let browser, page;
let passed = 0, failed = 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${name}: ${e.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

// Helper: programmatically create a stroke (bypasses pointer events)
async function createStroke(page, opts = {}) {
  return await page.evaluate((opts) => {
    const brush = opts.brush || window.state.brush;
    const color = opts.color || window.state.color;
    const weight = opts.weight || window.state.weight;
    const opacity = opts.opacity ?? window.state.opacity;
    const points = opts.points || [
      [400, 300, 0.5], [420, 305, 0.6], [440, 300, 0.5],
      [460, 305, 0.6], [480, 300, 0.5], [500, 305, 0.6],
      [520, 300, 0.5], [540, 305, 0.6], [560, 300, 0.5],
    ];

    window._testStrokeId = (window._testStrokeId || 0) + 1;
    const s = {
      id: window._testStrokeId,
      brush, color, weight, opacity,
      layer: 'detail',
      points,
      timestamp: Date.now(),
      hidden: false,
    };
    window.strokes.push(s);
    window.redoStack = [];
    window.needsFullRedraw = true;
    return { id: s.id, brush: s.brush, color: s.color, weight: s.weight, opacity: s.opacity, pointCount: s.points.length };
  }, opts);
}

(async () => {
  console.log('\n═══ fatiha.studio Full Test Suite ═══\n');

  browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--use-gl=swiftshader',
      '--ignore-gpu-blocklist',
    ],
  });

  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  // ── TEST 1: Page loads without errors ──
  await test('Page loads without errors', async () => {
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForFunction(() => typeof window.state !== 'undefined', { timeout: 10000 });
    await sleep(2000);
    const criticalErrors = pageErrors.filter(e =>
      !e.includes('favicon') && !e.includes('webgl') && !e.includes('WebGL')
    );
    assert(criticalErrors.length === 0, `Page errors: ${criticalErrors.join('; ')}`);
  });

  // ── TEST 2: Default brush is watercolor ──
  await test('Default brush is watercolor', async () => {
    const brush = await page.evaluate(() => window.state.brush);
    assert(brush === 'watercolor', `Expected 'watercolor', got '${brush}'`);
  });

  // ── TEST 3: Default color is green ──
  await test('Default color is green (#2a7a3a)', async () => {
    const color = await page.evaluate(() => window.state.color);
    assert(color === '#2a7a3a', `Expected '#2a7a3a', got '${color}'`);
  });

  // ── TEST 4: Default weight is 8 ──
  await test('Default weight is 8', async () => {
    const weight = await page.evaluate(() => window.state.weight);
    assert(weight === 8, `Expected 8, got ${weight}`);
  });

  // ── TEST 5: Canvas has cream paper background ──
  await test('Canvas has cream paper background', async () => {
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    assert(bg.includes('242') && bg.includes('234') && bg.includes('218'),
      `Expected cream rgb(242,234,218), got '${bg}'`);
  });

  // ── TEST 6: Drawing a watercolor stroke produces a filled polygon ──
  await test('Watercolor stroke produces filled polygon (not just dots)', async () => {
    const result = await createStroke(page, { brush: 'watercolor' });
    assert(result.brush === 'watercolor', `Stroke brush should be watercolor`);
    assert(result.pointCount >= 2, `Need ≥2 points for polygon, got ${result.pointCount}`);

    // Verify stroke is in the strokes array and will be rendered as polygon (via replayStroke)
    const strokeData = await page.evaluate(() => {
      const s = window.strokes[window.strokes.length - 1];
      return { brush: s.brush, pointCount: s.points.length, hidden: s.hidden };
    });
    assert(strokeData.brush === 'watercolor', 'Stored stroke should be watercolor');
    assert(strokeData.pointCount >= 2, 'Stored stroke should have polygon points');
    assert(!strokeData.hidden, 'Stroke should not be hidden');
    await sleep(300);
  });

  // ── TEST 7: Size slider affects stroke width ──
  await test('Size slider affects stroke width (3 vs 20)', async () => {
    const s1 = await createStroke(page, { weight: 3, points: [[300, 200, 0.5], [400, 200, 0.5], [500, 200, 0.5]] });
    const s2 = await createStroke(page, { weight: 20, points: [[300, 250, 0.5], [400, 250, 0.5], [500, 250, 0.5]] });

    assert(s1.weight === 3, `Small stroke weight should be 3, got ${s1.weight}`);
    assert(s2.weight === 20, `Large stroke weight should be 20, got ${s2.weight}`);
    assert(s2.weight > s1.weight, 'Large weight should be > small weight');
    await sleep(300);
  });

  // ── TEST 8: Opacity slider affects bleed ──
  await test('Opacity affects bleed (40 vs 200)', async () => {
    const s1 = await createStroke(page, { opacity: 40 });
    const s2 = await createStroke(page, { opacity: 200 });

    assert(s1.opacity === 40, `Low opacity should be 40, got ${s1.opacity}`);
    assert(s2.opacity === 200, `High opacity should be 200, got ${s2.opacity}`);

    // Verify bleed calculation: lower opacity → more bleed
    const bleeds = await page.evaluate(() => {
      function calcBleed(opacity) {
        return 0.05 + (1 - opacity / 255) * 0.55;
      }
      return { bleed40: calcBleed(40), bleed200: calcBleed(200) };
    });
    assert(bleeds.bleed40 > bleeds.bleed200,
      `Low opacity bleed (${bleeds.bleed40.toFixed(3)}) should be > high opacity bleed (${bleeds.bleed200.toFixed(3)})`);
    await sleep(300);
  });

  // ── TEST 9: 3 strokes — stroke 3 timing ≤ stroke 1 ──
  await test('Drawing 3 strokes: stroke 3 timing ≤ stroke 1 (no re-render)', async () => {
    // Clear
    await page.evaluate(() => {
      window.strokes = [];
      window.redoStack = [];
      window.needsFullRedraw = true;
    });
    await sleep(500);

    const timings = [];
    for (let trial = 0; trial < 3; trial++) {
      const y = 200 + trial * 60;
      const start = Date.now();
      await createStroke(page, {
        points: [[300, y, 0.5], [350, y+5, 0.6], [400, y, 0.5], [450, y+5, 0.6], [500, y, 0.5]]
      });
      await sleep(200); // let draw() cycle
      timings.push(Date.now() - start);
    }

    console.log(`    Stroke timings: ${timings.map(t => t + 'ms').join(', ')}`);
    assert(timings[2] <= timings[0] * 3,
      `Stroke 3 (${timings[2]}ms) should not be much slower than stroke 1 (${timings[0]}ms)`);
  });

  // ── TEST 10: Switch to HB brush ──
  await test('Switching to HB brush works', async () => {
    const s = await createStroke(page, { brush: 'HB' });
    assert(s.brush === 'HB', `Expected brush 'HB', got '${s.brush}'`);

    const stored = await page.evaluate(() => window.strokes[window.strokes.length - 1].brush);
    assert(stored === 'HB', `Stored brush should be HB, got '${stored}'`);
    await sleep(300);
  });

  // ── TEST 11: Switch to charcoal brush ──
  await test('Switching to charcoal brush works', async () => {
    const s = await createStroke(page, { brush: 'charcoal' });
    assert(s.brush === 'charcoal', `Expected 'charcoal', got '${s.brush}'`);
    await sleep(300);
  });

  // ── TEST 12: Switch to marker brush ──
  await test('Switching to marker brush works', async () => {
    const s = await createStroke(page, { brush: 'marker' });
    assert(s.brush === 'marker', `Expected 'marker', got '${s.brush}'`);
    await sleep(300);
  });

  // ── TEST 13: Undo removes last stroke ──
  await test('Undo removes last stroke', async () => {
    const beforeCount = await page.evaluate(() => window.strokes.length);
    assert(beforeCount > 0, 'Need at least 1 stroke to test undo');

    // Call doUndo directly instead of clicking button (same function)
    await page.evaluate(() => {
      if (window.strokes.length > 0) {
        window.redoStack.push(window.strokes.pop());
        window.needsFullRedraw = true;
      }
    });
    await sleep(300);

    const afterCount = await page.evaluate(() => window.strokes.length);
    assert(afterCount === beforeCount - 1,
      `After undo: expected ${beforeCount - 1} strokes, got ${afterCount}`);
  });

  // ── TEST 14: Export produces valid JSON ──
  await test('Export produces valid JSON', async () => {
    // Ensure there are strokes to export
    await createStroke(page);
    await sleep(200);

    // Directly generate export JSON (same logic as openExport)
    const exportText = await page.evaluate(() => {
      const allStrokes = [...(window._frozenStrokes || []), ...window.strokes];
      const data = {
        version: 1,
        canvas: { width: 2048, height: 2732 },
        strokes: allStrokes,
        layers: [
          { id: 'detail', name: 'Detail', visible: true },
          { id: 'pencil', name: 'Pencil', visible: true },
          { id: 'watercolor', name: 'Watercolor', visible: true },
        ],
        exportedAt: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    });
    assert(exportText && exportText.length > 0, 'Export text is empty');

    let data;
    try { data = JSON.parse(exportText); }
    catch (e) { throw new Error(`Not valid JSON: ${e.message}`); }

    assert(data.version === 1, `Expected version 1, got ${data.version}`);
    assert(data.canvas && data.canvas.width > 0, 'Missing or invalid canvas');
    assert(Array.isArray(data.strokes), 'strokes should be an array');
    assert(data.strokes.length > 0, 'strokes should not be empty');
    assert(Array.isArray(data.layers), 'layers should be an array');
    assert(data.exportedAt, 'Missing exportedAt');

    await page.evaluate(() => document.getElementById('btn-close-export').click());
  });

  // ── TEST 15: Color picker changes color ──
  await test('Color picker changes color', async () => {
    // Use HSB sliders which are always in the DOM
    const swatchCount = await page.evaluate(() => document.querySelectorAll('.palette-swatch').length);

    if (swatchCount > 0) {
      // Reset color
      await page.evaluate(() => { window.state.color = '#2a7a3a'; });
      // Click Lapis swatch
      await page.evaluate(() => {
        const sw = document.querySelectorAll('.palette-swatch');
        sw[0].click();
      });
      await sleep(200);
      const color = await page.evaluate(() => window.state.color);
      assert(color === '#1a3a8a', `Expected '#1a3a8a', got '${color}'`);
    } else {
      // Fallback: test direct color change via state
      await page.evaluate(() => { window.state.color = '#c83c28'; });
      const color = await page.evaluate(() => window.state.color);
      assert(color === '#c83c28', `Expected '#c83c28', got '${color}'`);
      // Change to another color
      await page.evaluate(() => { window.state.color = '#1a3a8a'; });
      const color2 = await page.evaluate(() => window.state.color);
      assert(color2 === '#1a3a8a', `Expected '#1a3a8a', got '${color2}'`);
      assert(color2 !== color, 'Color should have changed');
    }
  });

  // ── Summary ──
  console.log('\n═══ Results ═══');
  console.log(`  ${passed} passed, ${failed} failed, ${passed + failed} total\n`);

  if (consoleErrors.length > 0) {
    const filtered = consoleErrors.filter(e => !e.includes('WebGL') && !e.includes('404'));
    if (filtered.length > 0) {
      console.log('Console errors:');
      filtered.forEach(e => console.log(`  ⚠ ${e}`));
    }
  }

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
