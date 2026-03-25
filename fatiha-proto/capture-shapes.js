const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8768;
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? '/test-polygon-shapes.html' : req.url);
  const ext = path.extname(filePath);
  const mime = { '.html': 'text/html', '.js': 'application/javascript' }[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

async function run() {
  await new Promise(r => server.listen(PORT, r));
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  // Wait a bit for p5 to render
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'polygon-shapes-test.png', fullPage: false });
  console.log('Captured polygon-shapes-test.png');
  await browser.close();
  server.close();
}
run().catch(err => { console.error(err); process.exit(1); });
