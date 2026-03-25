const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8774;
const HTML_FILE = 'fatiha-parametric.html';
const TOTAL_FRAMES = 480;
const FRAMES_DIR = path.join(__dirname, 'frames');

if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR);

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? HTML_FILE : req.url.slice(1));
  const ext = path.extname(filePath);
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.mp3': 'audio/mpeg' }[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    if (req.url === '/' || req.url === '/' + HTML_FILE) {
      let html = data.toString();
      // Don't change frameRate — we control via noLoop/loop
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else {
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    }
  });
});

(async () => {
  await new Promise(r => server.listen(PORT, r));
  console.log(`Capturing ${TOTAL_FRAMES} frames...`);

  const useGPU = process.env.GALLIUM_DRIVER === 'd3d12';
  const args = [
    '--no-sandbox', '--disable-setuid-sandbox',
    '--enable-webgl', '--ignore-gpu-blocklist',
    '--disable-dev-shm-usage', '--js-flags=--max-old-space-size=8192',
    '--disable-gpu-sandbox',
  ];
  if (!useGPU) {
    args.push('--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader');
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 0,
    args
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  page.on('console', msg => {
    const t = msg.text();
    if (t.startsWith('Vine:') || t.startsWith('Flower') || t.startsWith('FRAME'))
      console.log('PAGE:', t);
  });
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.click('#tap').catch(() => {});
  await page.waitForFunction('typeof frameCount !== "undefined" && frameCount > 0', { timeout: 60000 });

  // Set up frame-by-frame capture: pause after each frame
  await page.evaluate(() => {
    window._captureReady = false;
    window._captureFrame = 0;
    const origDraw = draw;
    window.draw = function() {
      origDraw.call(this);
      window._captureFrame = frameCount;
      window._captureReady = true;
      noLoop();
    };
  });

  const startTime = Date.now();
  for (let f = 1; f <= TOTAL_FRAMES; f++) {
    // Resume for one frame
    await page.evaluate(() => { window._captureReady = false; loop(); });
    await page.waitForFunction('window._captureReady === true', { timeout: 300000 });

    const filename = `f${String(f).padStart(5, '0')}.png`;
    await page.screenshot({ path: path.join(FRAMES_DIR, filename), fullPage: false });

    if (f % 30 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const fps = (f / (Date.now() - startTime) * 1000).toFixed(1);
      console.log(`Frame ${f}/${TOTAL_FRAMES} (${elapsed}s, ${fps} fps)`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Done! ${TOTAL_FRAMES} frames in ${totalTime}s`);

  await browser.close();
  server.close();
  process.exit(0);
})();
