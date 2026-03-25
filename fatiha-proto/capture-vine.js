const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8770;
const HTML_FILE = 'fatiha-parametric.html';
const CAPTURE_FRAMES = (process.argv[2] || '10').split(',').map(Number);
const VERIFY_DIR = path.join(__dirname, 'captures-vine');
const FRAMES_DIR = path.join(__dirname, 'frames');

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
  const mode = process.argv[3] || 'verify';

  if (!fs.existsSync(VERIFY_DIR)) fs.mkdirSync(VERIFY_DIR);
  if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR);

  await new Promise(r => server.listen(PORT, r));
  console.log(`Server on http://localhost:${PORT} — mode: ${mode}`);

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
  await page.setViewport({ width: 540, height: 960, deviceScaleFactor: 1 });
  page.on('console', msg => {
    const t = msg.text();
    if (!t.includes('GL Driver') && !t.includes('WebGL:')) console.log('PAGE:', t);
  });
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.click('#tap').catch(() => {});
  await page.waitForFunction('typeof frameCount !== "undefined" && frameCount > 0', { timeout: 60000 });
  console.log('p5 running');

  if (mode === 'full') {
    // Full frame capture for video
    const totalFrames = CAPTURE_FRAMES[0] || 450;
    let seqNum = 1;
    for (let targetFrame = 1; targetFrame <= totalFrames; targetFrame++) {
      try {
        await page.waitForFunction(`frameCount >= ${targetFrame}`, { timeout: 300000 });
        const filename = `f${String(seqNum).padStart(5, '0')}.png`;
        await page.screenshot({ path: path.join(FRAMES_DIR, filename), fullPage: false });
        seqNum++;
        if (targetFrame % 50 === 0) console.log(`  Frame ${targetFrame}/${totalFrames}`);
      } catch(e) {
        console.error(`  FAILED at frame ${targetFrame}: ${e.message}`);
        break;
      }
    }
    console.log(`All frames captured. Total: ${seqNum-1}`);
  } else {
    // Verify mode — capture specific frames (pause to get exact frame)
    // First, inject a frame-pause mechanism
    await page.evaluate(() => {
      window._targetFrame = -1;
      window._origDraw = draw;
      const _realDraw = draw;
      // We'll use a pre-draw hook via p5's registerMethod if available,
      // or just pause after reaching target
    });

    for (const targetFrame of CAPTURE_FRAMES) {
      console.log(`Waiting for frame ${targetFrame}...`);
      try {
        // Set up: pause when we reach target frame
        await page.evaluate((tf) => {
          window._pauseAtFrame = tf;
          window._paused = false;
          // Override draw to pause at target
          const origDraw = window._origDraw || draw;
          window.draw = function() {
            origDraw.call(this);
            if (frameCount >= window._pauseAtFrame && !window._paused) {
              window._paused = true;
              noLoop();
            }
          };
        }, targetFrame);

        // Resume if paused from previous iteration
        await page.evaluate(() => { if (!isLooping()) loop(); });

        await page.waitForFunction(`window._paused === true`, { timeout: 600000 });
        const fc = await page.evaluate(() => frameCount);
        console.log(`  Paused at frame ${fc}`);
        const filename = `f${String(targetFrame).padStart(5, '0')}.png`;
        await page.screenshot({ path: path.join(VERIFY_DIR, filename), fullPage: false });
        console.log(`  Captured ${filename}`);
      } catch(e) {
        console.error(`  FAILED at frame ${targetFrame}: ${e.message}`);
        break;
      }
    }
  }

  await browser.close();
  server.close();
  console.log('DONE');
}

run().catch(err => { console.error(err); process.exit(1); });
