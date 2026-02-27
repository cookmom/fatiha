import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-gpu-sandbox',
    '--use-gl=angle',
    '--use-angle=gl-egl',
    '--ozone-platform=headless',
    '--ignore-gpu-blocklist',
    '--disable-dev-shm-usage',
    '--in-process-gpu',
    '--enable-webgl',
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

// Wait for Three.js scene to load and settle
await new Promise(r => setTimeout(r, 4500));

// Verify GPU
const gpuRenderer = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return 'NO CANVAS';
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return 'NO GL';
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'ext unavailable';
});
console.log('GPU:', gpuRenderer);

await page.screenshot({ path: '/tmp/glass-cube.png' });
console.log('DONE');
await browser.close();
