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

// Capture console errors
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:7747/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 8000));

if (errors.length) console.log('ERRORS:', errors.slice(0,5).join('\n'));

const gpu = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return 'NO CANVAS';
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return 'NO GL';
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'ext unavailable';
});
console.log('GPU:', gpu);

await page.screenshot({ path: '/tmp/agift-integrated.png' });
console.log('DONE');
await browser.close();
