import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: 'new',
  args: [
    '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
    '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
    '--in-process-gpu', '--enable-webgl',
  ],
  env: {
    ...process.env,
    GALLIUM_DRIVER: 'd3d12',
    MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
    LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || ''),
  },
});

const page = await browser.newPage();
await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });
await page.goto('https://agiftoftime.app', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 6000));
await page.screenshot({ path: '/tmp/agift-archive.png', fullPage: false });
console.log('DONE');
await browser.close();
