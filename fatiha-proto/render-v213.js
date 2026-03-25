const puppeteer = require('/home/openclaw-agent/.openclaw/workspace/node_modules/puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
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
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib',
    }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 600 });

  // Collect console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  const filePath = path.resolve('/home/openclaw-agent/.openclaw/workspace/fatiha-proto/test-arch-fill-latest.html');
  await page.goto('file://' + filePath, { waitUntil: 'domcontentloaded' });

  // Wait for p5 sketch to finish drawing (noLoop + enough time for watercolor compositing)
  await new Promise(r => setTimeout(r, 8000));

  // Check renderer
  const renderer = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 'no canvas';
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (!gl) return 'no webgl';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'no ext';
  });
  console.log('GPU Renderer:', renderer);

  if (errors.length > 0) {
    console.log('Console errors:', errors.join('\n'));
  } else {
    console.log('No console errors');
  }

  await page.screenshot({
    path: '/home/openclaw-agent/.openclaw/workspace/fatiha-proto/renders/alejandro-v213.png',
    fullPage: false
  });

  console.log('Screenshot saved');
  await browser.close();
})();
