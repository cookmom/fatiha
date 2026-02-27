import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
    '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
    '--in-process-gpu', '--enable-webgl'],
  env: { ...process.env, GALLIUM_DRIVER: 'd3d12', MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
    LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || '') },
});

const page = await browser.newPage();
await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));
page.on('requestfailed', req => errors.push('404: ' + req.url()));

await page.goto('http://localhost:7745/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 10000));

if (errors.length) console.log('ERRORS:', errors.slice(0,10).join('\n'));
await page.screenshot({ path: '/tmp/agift-integrated.png' });
console.log('DONE');
await browser.close();
