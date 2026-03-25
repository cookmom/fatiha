const puppeteer = require('/home/openclaw-agent/.openclaw/workspace/node_modules/puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox',
      '--disable-gpu-sandbox',
      '--use-gl=angle',
      '--use-angle=gl-egl',
      '--ozone-platform=headless',
      '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage',
      '--in-process-gpu',
      '--enable-webgl'
    ],
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib'
    },
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 600 });

  const filePath = 'file:///home/openclaw-agent/.openclaw/workspace/fatiha-proto/test-arch-fill-v2.html';
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  
  // Wait for p5.brush to render (give it enough time)
  await new Promise(r => setTimeout(r, 8000));

  // Check renderer
  const renderer = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 'no canvas';
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (!gl) return 'no webgl';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'no debug info';
  });
  console.log('Renderer:', renderer);

  await page.screenshot({ path: '/home/openclaw-agent/.openclaw/workspace/fatiha-proto/renders/alejandro-v2-match.png', fullPage: false });
  console.log('Screenshot saved');
  
  if (errors.length > 0) {
    console.log('ERRORS:', errors.join('\n'));
  } else {
    console.log('No console errors');
  }

  await browser.close();
})();
