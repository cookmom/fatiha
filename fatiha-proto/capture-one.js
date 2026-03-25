const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8771;
const HTML_FILE = 'fatiha-parametric.html';
const targetFrame = parseInt(process.argv[2] || '80');
const VERIFY_DIR = path.join(__dirname, 'captures-vine');

if (!fs.existsSync(VERIFY_DIR)) fs.mkdirSync(VERIFY_DIR);

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? HTML_FILE : req.url.slice(1));
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

(async () => {
  await new Promise(r => server.listen(PORT, r));
  console.log(`Capturing frame ${targetFrame}...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--use-gl=angle', '--use-angle=swiftshader',
      '--enable-webgl', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage', '--js-flags=--max-old-space-size=8192',
      '--disable-gpu-sandbox',
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  page.on('console', msg => {
    const t = msg.text();
    if (!t.includes('GL Driver') && !t.includes('WebGL:') && !t.includes('resource'))
      console.log('PAGE:', t);
  });
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.click('#tap').catch(() => {});
  await page.waitForFunction('typeof frameCount !== "undefined" && frameCount > 0', { timeout: 60000 });
  console.log('p5 running, advancing to frame', targetFrame);

  // Pause at target frame
  await page.evaluate((tf) => {
    window._pauseAtFrame = tf;
    window._paused = false;
    const origDraw = draw;
    window.draw = function() {
      origDraw.call(this);
      if (frameCount >= window._pauseAtFrame && !window._paused) {
        window._paused = true;
        noLoop();
      }
    };
  }, targetFrame);

  await page.waitForFunction('window._paused === true', { timeout: 600000 });
  const fc = await page.evaluate(() => frameCount);
  console.log(`Paused at frame ${fc}`);

  const filename = `f${String(targetFrame).padStart(5, '0')}.png`;
  await page.screenshot({ path: path.join(VERIFY_DIR, filename), fullPage: false });
  console.log(`Captured ${filename}`);

  await browser.close();
  server.close();
  process.exit(0);
})();
