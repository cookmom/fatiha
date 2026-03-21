const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9982;
const DIR = __dirname;

const mime = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.jpg':'image/jpeg', '.png':'image/png', '.json':'application/json' };

const srv = http.createServer((req, res) => {
  let fp = path.join(DIR, decodeURIComponent(req.url === '/' ? '/eid-abstract-geo.html' : req.url));
  if (!fs.existsSync(fp)) { res.writeHead(404); res.end('not found: ' + req.url); return; }
  let ext = path.extname(fp);
  res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});

(async () => {
  await new Promise((resolve, reject) => {
    srv.listen(PORT, '127.0.0.1', resolve);
    srv.on('error', reject);
  });
  console.log(`Serving on http://127.0.0.1:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || '')
    },
    args: [
      '--no-sandbox','--disable-gpu-sandbox',
      '--use-gl=angle','--use-angle=gl-egl',
      '--ozone-platform=headless',
      '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage',
      '--in-process-gpu',
      '--enable-webgl'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  const errors = [];
  page.on('console', m => {
    console.log('PAGE:', m.text());
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', e => { console.error('ERR:', e.message); errors.push(e.message); });

  await page.goto(`http://127.0.0.1:${PORT}/eid-abstract-geo.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Wait for painting — generous timeout for all the brush work
  await new Promise(r => setTimeout(r, 25000));

  await page.screenshot({ path: path.join(DIR, 'render-abstract.png'), fullPage: false });
  console.log('Screenshot saved: render-abstract.png');
  if (errors.length) console.log('ERRORS:', errors.join('\n'));

  await browser.close();
  srv.close();
})();
