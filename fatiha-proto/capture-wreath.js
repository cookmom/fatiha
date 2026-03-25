const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8772;
const server = http.createServer((req, res) => {
  let fp = path.join(__dirname, req.url === '/' ? '/test-wreath-packed.html' : req.url);
  const ext = path.extname(fp);
  const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css'}[ext]||'application/octet-stream';
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: '+req.url); return; }
    res.writeHead(200, {'Content-Type': mime}); res.end(data);
  });
});

async function run() {
  await new Promise(r => server.listen(PORT, r));
  console.log('Server on', PORT);

  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 300000,
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
    if (msg.text().includes('WREATH PACKED DONE')) done = true;
  });

  await page.goto('http://localhost:' + PORT + '/', {waitUntil:'domcontentloaded', timeout:30000});

  // Wait for render complete — may take minutes with SwiftShader
  for (let i = 0; i < 600; i++) {
    if (done) break;
    await new Promise(r => setTimeout(r, 1000));
    if (i % 30 === 0) console.log('Waiting...', i, 's');
  }
  console.log('Render done, waiting to settle...');
  await new Promise(r => setTimeout(r, 5000));

  await page.screenshot({path:'renders/wreath-packed.png', fullPage:false});
  console.log('Saved renders/wreath-packed.png');
  await browser.close();
  server.close();
}
run().catch(e => { console.error(e); process.exit(1); });
