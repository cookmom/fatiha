const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8769;
const HTML_FILE = 'fatiha-parametric-rebuild.html';
const TOTAL_FRAMES = 350;
const OUT_DIR = path.join(__dirname, 'frames-rebuild');
const VERIFY_DIR = path.join(__dirname, 'captures-rebuild');

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
  const mode = process.argv[2] || 'verify';

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
  if (!fs.existsSync(VERIFY_DIR)) fs.mkdirSync(VERIFY_DIR);

  await new Promise(r => server.listen(PORT, r));
  console.log(`Server on http://localhost:${PORT} — mode: ${mode}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--use-gl=angle', '--use-angle=swiftshader',
      '--enable-webgl', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage',
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  page.on('console', msg => {
    const t = msg.text();
    if (!t.includes('GL Driver') && !t.includes('WebGL:')) console.log('PAGE:', t);
  });
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.click('#tap').catch(() => {});
  await page.waitForFunction('typeof frameCount !== "undefined" && frameCount > 0', { timeout: 60000 });
  console.log('p5 running');

  if (mode === 'verify') {
    for (const targetFrame of [10, 100, 300]) {
      console.log(`Waiting for frame ${targetFrame}...`);
      try {
        await page.waitForFunction(`frameCount >= ${targetFrame}`, { timeout: 600000 });
        const fc = await page.evaluate(() => frameCount);
        console.log(`  At frame ${fc}`);
        const filename = `f${String(targetFrame).padStart(5, '0')}.png`;
        await page.screenshot({ path: path.join(VERIFY_DIR, filename), fullPage: false });
        console.log(`  Captured ${filename}`);
      } catch(e) {
        console.error(`  FAILED at frame ${targetFrame}: ${e.message}`);
        break;
      }
    }
  } else {
    // Full capture — every 3rd frame for speed (350/3 ≈ 117 frames ≈ 4s @30fps)
    let seqNum = 1;
    for (let targetFrame = 1; targetFrame <= TOTAL_FRAMES; targetFrame += 3) {
      try {
        await page.waitForFunction(`frameCount >= ${targetFrame}`, { timeout: 300000 });
        const filename = `f${String(seqNum).padStart(5, '0')}.png`;
        await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: false });
        seqNum++;
        if (targetFrame % 99 === 1) console.log(`  Frame ${targetFrame}/${TOTAL_FRAMES} (seq ${seqNum-1})`);
      } catch(e) {
        console.error(`  FAILED at frame ${targetFrame}: ${e.message}`);
        break;
      }
    }
    console.log(`All frames captured. Total: ${seqNum-1}`);
  }

  await browser.close();
  server.close();
  console.log('DONE');
}

run().catch(err => { console.error(err); process.exit(1); });
