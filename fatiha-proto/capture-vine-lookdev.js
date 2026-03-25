const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8771;
const server = http.createServer((req, res) => {
  let fp = path.join(__dirname, req.url === '/' ? '/test-vine-lookdev.html' : req.url);
  const ext = path.extname(fp);
  const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css'}[ext]||'application/octet-stream';
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type': mime}); res.end(data);
  });
});

async function run() {
  await new Promise(r => server.listen(PORT, r));
  console.log('Server on', PORT);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--use-gl=angle', '--use-angle=swiftshader',
      '--enable-webgl', '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
      '--js-flags=--max-old-space-size=4096'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  let done = false;
  page.on('console', msg => {
    if (msg.text().includes('LOOKDEV DONE')) done = true;
  });

  console.log('Loading page...');
  await page.goto('http://localhost:' + PORT, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Poll for completion instead of waitForFunction (avoids frame detach)
  console.log('Waiting for render...');
  for (let i = 0; i < 120; i++) {
    if (done) break;
    await new Promise(r => setTimeout(r, 2000));
    if (i % 10 === 0) console.log('  still waiting... ' + (i*2) + 's');
  }

  if (!done) {
    console.log('WARNING: LOOKDEV DONE not received, taking screenshot anyway');
  }
  await new Promise(r => setTimeout(r, 3000)); // let final renders settle

  const outPath = path.join(__dirname, 'test-vine-lookdev.png');
  await page.screenshot({ path: outPath, type: 'png', fullPage: false });
  console.log('Saved:', outPath);

  const rendersDir = path.join(__dirname, 'renders');
  if (!fs.existsSync(rendersDir)) fs.mkdirSync(rendersDir);
  fs.copyFileSync(outPath, path.join(rendersDir, 'test-vine-lookdev.png'));
  console.log('Copied to renders/');

  await browser.close();
  server.close();
}

run().catch(err => { console.error(err); process.exit(1); });
