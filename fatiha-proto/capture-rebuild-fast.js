const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8769;
const HTML_FILE = 'fatiha-parametric-rebuild.html';
const TOTAL_FRAMES = 500;
const STEP = 2; // capture every Nth frame
const OUT_DIR = path.join(__dirname, 'frames-rebuild');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? HTML_FILE : req.url);
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

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--use-gl=angle', '--use-angle=swiftshader',
      '--enable-webgl', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await page.click('#tap').catch(() => {});
  await page.waitForFunction('typeof frameCount !== "undefined" && frameCount > 0', { timeout: 30000 });
  console.log('p5 running — capturing via canvas.toDataURL');

  // Inject capture helper into page
  await page.evaluate(() => {
    window._captureCanvas = () => {
      const c = document.querySelector('canvas');
      if (!c) return null;
      return c.toDataURL('image/png').split(',')[1]; // base64
    };
  });

  let seqNum = 1;
  const t0 = Date.now();
  for (let targetFrame = 1; targetFrame <= TOTAL_FRAMES; targetFrame += STEP) {
    try {
      await page.waitForFunction(`frameCount >= ${targetFrame}`, { timeout: 300000 });
      const b64 = await page.evaluate(() => window._captureCanvas());
      if (b64) {
        const filename = `f${String(seqNum).padStart(5, '0')}.png`;
        fs.writeFileSync(path.join(OUT_DIR, filename), Buffer.from(b64, 'base64'));
        seqNum++;
      }
      if (targetFrame % 100 === 1) {
        const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
        console.log(`  Frame ${targetFrame}/${TOTAL_FRAMES} (seq ${seqNum-1}) — ${elapsed}s`);
      }
    } catch(e) {
      console.error(`  FAILED at frame ${targetFrame}: ${e.message}`);
      break;
    }
  }
  const total = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`Done. ${seqNum-1} frames captured in ${total}s`);
  await browser.close();
  server.close();
}

run().catch(err => { console.error(err); process.exit(1); });
