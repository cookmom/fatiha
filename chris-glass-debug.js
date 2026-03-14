// Debug: verify interception and check JS URL
const puppeteer = require('/home/tawfeeq/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/usr/bin/google-chrome-stable';
const URL    = 'http://localhost:7748/';
const JS_SRC = '/home/tawfeeq/ramadan-clock-site/glass-cube-clock.js';

const CHROME_ARGS = [
  '--no-sandbox', '--disable-gpu-sandbox',
  '--use-gl=angle', '--use-angle=gl-egl',
  '--ozone-platform=headless',
  '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
  '--in-process-gpu', '--enable-webgl',
];

(async () => {
  const originalSrc = fs.readFileSync(JS_SRC, 'utf8');
  // Mark the patched version clearly
  const markedSrc = originalSrc.replace(
    'vec3 col = refracted * vec3(0.94, 0.97, 1.06) * 2.8 * bottomAtten;',
    'vec3 col = refracted * vec3(1.00, 1.00, 1.00) * 0.0 * bottomAtten; // PATCH_MARKER'
  );

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    args: CHROME_ARGS,
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || ''),
    },
    headless: true,
    defaultViewport: { width: 430, height: 932, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();

  // Track all JS requests
  const jsRequests = [];
  let interceptFired = false;

  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (u.includes('.js')) {
      jsRequests.push(u);
    }
    if (u.includes('glass-cube-clock.js')) {
      console.log(`INTERCEPT HIT: ${u}`);
      interceptFired = true;
      req.respond({
        status: 200,
        contentType: 'application/javascript',
        body: markedSrc,
      });
    } else {
      req.continue();
    }
  });

  // Console from page
  page.on('console', msg => {
    if (msg.text().includes('PATCH') || msg.type() === 'error') {
      console.log(`PAGE CONSOLE [${msg.type()}]: ${msg.text()}`);
    }
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));

  console.log('\nAll JS requests:');
  jsRequests.forEach(u => console.log(' ', u));
  console.log(`\nIntercept fired: ${interceptFired}`);

  await browser.close();
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
