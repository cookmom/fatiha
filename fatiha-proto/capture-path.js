const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8769;
const HTML_FILE = 'fatiha-parametric.html';
const TOTAL_FRAMES = 400;
const OUT_DIR = path.join(__dirname, 'captures-path');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? HTML_FILE : req.url);
  const ext = path.extname(filePath);
  const mime = {'.html':'text/html', '.js':'application/javascript', '.mp3':'audio/mpeg'}[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type': mime});
    res.end(data);
  });
});

async function run() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, {recursive: true});
  await new Promise(r => server.listen(PORT, r));
  console.log(`Server on http://localhost:${PORT}`);

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
  await page.setViewport({width: 1080, height: 1920});
  page.on('console', msg => {
    const t = msg.text();
    if (!t.includes('GL Driver') && !t.includes('WebGL:'))
      console.log('PAGE:', t);
  });
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto(`http://localhost:${PORT}`, {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.click('#tap').catch(() => {});
  await page.waitForFunction('typeof frameCount !== "undefined" && frameCount > 0', {timeout: 60000});
  console.log('p5 running');

  // Capture every frame by waiting for frameCount
  let seqNum = 1;
  for (let targetFrame = 1; targetFrame <= TOTAL_FRAMES; targetFrame++) {
    try {
      await page.waitForFunction(`frameCount >= ${targetFrame}`, {timeout: 300000});
      const fname = `f${String(targetFrame).padStart(5,'0')}.png`;
      await page.screenshot({path: path.join(OUT_DIR, fname), fullPage: false});
      seqNum++;

      if ([5,25,100,250,350].includes(targetFrame))
        console.log(`✓ VERIFY f${String(targetFrame).padStart(5,'0')}`);
      if (targetFrame % 50 === 0)
        console.log(`  frame ${targetFrame}/${TOTAL_FRAMES}`);
    } catch(e) {
      console.error(`  FAILED at frame ${targetFrame}: ${e.message}`);
      try { await page.screenshot({path: path.join(OUT_DIR, `crash_f${targetFrame}.png`)}); } catch(e2) { void e2; }
      break;
    }
  }

  console.log(`\nDone. ${seqNum-1} frames → ${OUT_DIR}/`);
  await browser.close();
  server.close();
}

run().catch(err => { console.error(err); process.exit(1); });
