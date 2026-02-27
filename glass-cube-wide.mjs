import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: 'new',
  args: [
    '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle',
    '--use-angle=gl-egl', '--ozone-platform=headless',
    '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
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
await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 2 });
await page.goto('http://localhost:7744/wide.html', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 14000));

const gpu = await page.evaluate(() => {
  const gl = document.querySelector('canvas')?.getContext('webgl2');
  const ext = gl?.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'N/A';
});
console.log('GPU:', gpu);

await page.screenshot({ path: '/tmp/glass-cube-wide.png' });
console.log('DONE');
await browser.close();
