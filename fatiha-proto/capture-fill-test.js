const puppeteer = require('/home/openclaw-agent/.openclaw/workspace/node_modules/puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 8766;

const server = http.createServer((req, res) => {
  let fp = path.join(__dirname, req.url === '/' ? '/test-fill-polygon.html' : req.url);
  const ext = path.extname(fp);
  const mime = {'.html':'text/html','.js':'application/javascript','.png':'image/png'}[ext]||'application/octet-stream';
  fs.readFile(fp, (err, data) => {
    if (err) { console.log('404:', req.url); res.writeHead(404); res.end('Not found: ' + req.url); return; }
    res.writeHead(200, {'Content-Type':mime}); res.end(data);
  });
});

async function run() {
  await new Promise(r => server.listen(PORT, r));
  console.log('Server ready on', PORT);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  await page.goto('http://localhost:' + PORT, { waitUntil: 'load', timeout: 120000 });
  console.log('Page loaded');

  // Click the tap overlay
  await page.click('#tap').catch(() => {});

  // Wait for p5 to initialize and render
  try {
    await page.waitForFunction('typeof frameCount !== "undefined" && frameCount > 0', { timeout: 60000 });
    console.log('p5 running, frameCount > 0');
  } catch(e) {
    console.log('Timeout waiting for p5:', e.message.substring(0, 100));
  }

  // Give fills time to render
  await new Promise(r => setTimeout(r, 15000));

  await page.screenshot({ path: 'test-fill-polygon.png', fullPage: false });
  console.log('Screenshot saved');

  await browser.close();
  server.close();
}

run().catch(err => { console.error(err); process.exit(1); });
