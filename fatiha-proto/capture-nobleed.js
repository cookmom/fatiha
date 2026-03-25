const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8766;
const CAPTURE_FRAMES = [10, 60, 90, 120, 300, 500];
const OUT_DIR = path.join(__dirname, 'captures-nobleed');

const server = http.createServer((req, res) => {
  // Serve fatiha-parametric-rebuild.html (the correct polygon flower version)
  let filePath = path.join(__dirname, req.url === '/' ? '/fatiha-parametric-rebuild.html' : req.url);
  const ext = path.extname(filePath);
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.mp3': 'audio/mpeg', '.css': 'text/css' }[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    if (req.url === '/') {
      let html = data.toString();
      // Halve canvas for faster SwiftShader
      html = html.replace('const W = 1080, H = 1920;', 'const W = 540, H = 960;');
      if (html.includes('var W = 1080, H = 1920')) {
        html = html.replace('var W = 1080, H = 1920', 'var W = 540, H = 960');
      }
      // Remove frameRate limit
      html = html.replace('frameRate(30);', 'frameRate(999);');
      // DISABLE fillBleed to avoid SwiftShader OOM - shapes still render as polygons
      html = html.replace(/brush\.fillBleed\([^)]*\)/g, 'brush.fillBleed(0)');
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
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 540, height: 960 });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await page.click('#tap').catch(() => {});
  await page.waitForFunction('typeof frameCount !== "undefined" && frameCount > 0', { timeout: 30000 });
  console.log('p5 running');

  for (const targetFrame of CAPTURE_FRAMES) {
    console.log(`Waiting for frame ${targetFrame}...`);
    try {
      await page.waitForFunction(`frameCount >= ${targetFrame}`, { timeout: 300000 });
      const fc = await page.evaluate(() => frameCount);
      console.log(`  At frame ${fc}`);
      const filename = `f${String(targetFrame).padStart(5, '0')}.png`;
      await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: false });
      console.log(`  Captured ${filename}`);
    } catch(e) {
      console.error(`  FAILED at frame ${targetFrame}: ${e.message}`);
      // Take crash screenshot
      try {
        await page.screenshot({ path: path.join(OUT_DIR, `crash_f${targetFrame}.png`), fullPage: false });
      } catch(e2) {}
      break;
    }
  }

  console.log('\nDone. Check captures-nobleed/ directory.');
  await browser.close();
  server.close();
}

run().catch(err => { console.error(err); process.exit(1); });
