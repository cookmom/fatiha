const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8768;
const CAPTURE_FRAMES = [10, 65, 110, 300, 500];
const OUT_DIR = path.join(__dirname, 'captures-gpu2');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? '/fatiha-parametric-rebuild.html' : req.url);
  const ext = path.extname(filePath);
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.mp3': 'audio/mpeg' }[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    if (req.url === '/') {
      let html = data.toString();
      html = html.replace('frameRate(30);', 'frameRate(999);');
      res.writeHead(200, { 'Content-Type': mime });
      res.end(html);
    } else {
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    }
  });
});

async function run() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
  await new Promise(r => server.listen(PORT, r));
  console.log(`Server on http://localhost:${PORT}`);

  // Try d3d12 ANGLE backend - uses real GPU via WSL
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--enable-gpu',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--enable-features=Vulkan,UseSkiaRenderer',
      '--disable-gpu-sandbox',
    ],
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || ''),
    }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await page.click('#tap').catch(() => {});
  
  // Check if WebGL is working
  const webglInfo = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return 'NO WEBGL';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  });
  console.log('WebGL renderer:', webglInfo);

  await page.waitForFunction('typeof frameCount !== "undefined" && frameCount > 0', { timeout: 30000 });
  console.log('p5 running');

  for (const targetFrame of CAPTURE_FRAMES) {
    console.log(`Waiting for frame ${targetFrame}...`);
    try {
      await page.waitForFunction(`frameCount >= ${targetFrame}`, { timeout: 600000 });
      const fc = await page.evaluate(() => frameCount);
      console.log(`  At frame ${fc}`);
      const filename = `f${String(targetFrame).padStart(5, '0')}.png`;
      await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: false });
      console.log(`  Captured ${filename}`);
    } catch(e) {
      console.error(`  FAILED at frame ${targetFrame}: ${e.message}`);
      try { await page.screenshot({ path: path.join(OUT_DIR, `crash_f${targetFrame}.png`), fullPage: false }); } catch(e2) {}
      break;
    }
  }

  console.log('\nDone.');
  await browser.close();
  server.close();
}

run().catch(err => { console.error(err); process.exit(1); });
