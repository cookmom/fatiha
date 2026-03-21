const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9981;
const DIR = __dirname;

const mime = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg' };

const server = http.createServer((req, res) => {
  const fp = path.join(DIR, decodeURIComponent(req.url === '/' ? '/eid-sketch-wash.html' : req.url));
  if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
  const ext = path.extname(fp);
  res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(PORT, r));
  console.log(`Server on ${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || ''),
    },
    args: [
      '--no-sandbox','--disable-gpu-sandbox',
      '--use-gl=angle','--use-angle=gl-egl',
      '--ozone-platform=headless','--ignore-gpu-blocklist',
      '--disable-dev-shm-usage','--in-process-gpu','--enable-webgl',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 2000, deviceScaleFactor: 1 });

  page.on('console', m => console.log('PAGE:', m.text()));
  page.on('pageerror', e => console.error('PAGE ERR:', e.message));

  await page.goto(`http://localhost:${PORT}/eid-sketch-wash.html`, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for rendering
  await new Promise(r => setTimeout(r, 8000));

  const dataUrl = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    return c ? c.toDataURL('image/png') : null;
  });

  if (dataUrl) {
    const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
    const out = path.join(DIR, 'eid-sketch-wash-v1.png');
    fs.writeFileSync(out, buf);
    console.log(`Saved: ${out} (${(buf.length/1024/1024).toFixed(1)}MB)`);
  } else {
    console.error('No canvas found');
  }

  await browser.close();
  server.close();
})();
