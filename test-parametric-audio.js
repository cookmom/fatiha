const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || '')
    },
    args: ['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl',
           '--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage',
           '--in-process-gpu','--enable-webgl','--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Loading page...');
  await page.goto('http://localhost:9981/fatiha-parametric.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForFunction('window._setupDone === true', { timeout: 30000 });

  // Reload for clean t=0
  await page.goto('http://localhost:9981/fatiha-parametric.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForFunction('window._setupDone === true', { timeout: 30000 });

  // Inject pixel snapshot function that reads from the p5 canvas
  await page.evaluate(() => {
    window._snapPixels = function() {
      const c = document.querySelector('canvas');
      // For WebGL, need to use preserveDrawingBuffer or readPixels
      const gl = c.getContext('webgl') || c.getContext('webgl2');
      if (gl) {
        const w = c.width, h = c.height;
        // Sample a grid of pixels for speed
        const step = 10;
        const samples = [];
        const buf = new Uint8Array(4);
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
            samples.push(buf[0], buf[1], buf[2]);
          }
        }
        return samples;
      }
      // Fallback: 2D context
      const ctx = c.getContext('2d');
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const samples = [];
      const step = 40; // sample every 40th pixel
      for (let i = 0; i < d.length; i += step * 4) {
        samples.push(d[i], d[i+1], d[i+2]);
      }
      return samples;
    };
  });

  // Capture 13 snapshots at t=0, 0.5, 1.0, ..., 6.0
  const snapshots = [];
  for (let i = 0; i <= 12; i++) {
    const t = i * 0.5;
    if (i > 0) await new Promise(r => setTimeout(r, 500));
    const pixels = await page.evaluate(() => window._snapPixels());
    snapshots.push({ t, pixels });
    console.log(`  captured t=${t.toFixed(1)} (${pixels.length} samples)`);
  }

  await browser.close();

  // Compare all consecutive pairs
  console.log('\n--- Frame-to-frame change analysis ---');
  let allPass = true;
  const results = [];
  for (let i = 0; i < snapshots.length - 1; i++) {
    const a = snapshots[i], b = snapshots[i + 1];
    let diffCount = 0;
    const total = Math.min(a.pixels.length, b.pixels.length) / 3;
    for (let j = 0; j < total * 3; j += 3) {
      const dr = Math.abs(a.pixels[j] - b.pixels[j]);
      const dg = Math.abs(a.pixels[j+1] - b.pixels[j+1]);
      const db = Math.abs(a.pixels[j+2] - b.pixels[j+2]);
      if (dr + dg + db > 5) diffCount++;
    }
    const pct = (diffCount / total * 100).toFixed(1);
    const pass = parseFloat(pct) >= 10.0;
    if (!pass) allPass = false;
    const mark = pass ? '✓' : 'FAIL';
    console.log(`  ${mark} t=${a.t.toFixed(1)}→${b.t.toFixed(1)}: ${pct}% changed (${diffCount}/${total} samples)`);
    results.push({ pair: `${a.t.toFixed(1)}→${b.t.toFixed(1)}`, pct: parseFloat(pct), pass });
  }

  console.log(`\n${allPass ? 'ALL PAIRS PASS (>10%)' : 'SOME PAIRS FAIL (<10%)'}`);
  const failures = results.filter(r => !r.pass);
  if (failures.length) {
    console.log('Failing pairs:', failures.map(f => `${f.pair}=${f.pct}%`).join(', '));
  }
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
