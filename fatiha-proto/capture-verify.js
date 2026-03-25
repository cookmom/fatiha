const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8765;
const CAPTURE_FRAMES = [10, 60, 150, 250];
const OUT_DIR = path.join(__dirname, 'captures');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? '/fatiha-parametric-v14.html' : req.url);
  const ext = path.extname(filePath);
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.mp3': 'audio/mpeg', '.css': 'text/css' }[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    if (req.url === '/') {
      // Scale down for SwiftShader + uncap framerate
      let html = data.toString();
      html = html.replace('const W = 1080, H = 1920;', 'const _SCALE = 2/3; const W = Math.round(1080*_SCALE), H = Math.round(1920*_SCALE);');
      html = html.replace('const doorW = 720, doorH = 1500;', 'const doorW = Math.round(720*_SCALE), doorH = Math.round(1500*_SCALE);');
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
  await page.setViewport({ width: 720, height: 1280 });

  page.on('console', msg => {
    const txt = msg.text();
    if (!txt.includes('WebGL')) console.log('PAGE:', txt);
  });
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await page.click('#tap').catch(() => {});
  await page.waitForFunction('typeof frameCount !== "undefined" && frameCount > 0', { timeout: 30000 });
  console.log('p5 running, capturing at full 1080x1920');

  for (const targetFrame of CAPTURE_FRAMES) {
    console.log(`Waiting for frame ${targetFrame}...`);
    await page.waitForFunction(`frameCount >= ${targetFrame}`, { timeout: 600000 });

    const fc = await page.evaluate(() => frameCount);
    const fi = await page.evaluate(() => flowerIdx);
    console.log(`  frame=${fc}, flowerIdx=${fi}`);

    const filename = `f${String(targetFrame).padStart(5, '0')}.png`;
    await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: false });
    console.log(`  Captured ${filename}`);
  }

  console.log('\nAll captures done.');
  await browser.close();
  server.close();
}

run().catch(err => { console.error(err); process.exit(1); });
