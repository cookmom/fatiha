const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
      '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
      '--in-process-gpu', '--enable-webgl'
    ],
    headless: true,
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || '')
    }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });

  console.log('Loading page...');
  await page.goto('http://localhost:9981/test-flower-final.html', { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for p5.brush fills to render
  console.log('Waiting for rendering...');
  await new Promise(r => setTimeout(r, 15000));

  // Check canvas exists
  const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
  console.log('Canvas found:', hasCanvas);

  await page.screenshot({ path: 'renders/flower-options.png', fullPage: false });
  console.log('Saved renders/flower-options.png');

  await browser.close();
})();
