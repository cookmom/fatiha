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
      '--enable-webgl'
    ],
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib'
    }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 600, deviceScaleFactor: 2 });

  const filePath = 'file:///home/openclaw-agent/.openclaw/workspace/fatiha-proto/niche-pattern-options.html';
  await page.goto(filePath, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500));

  const outPath = '/home/openclaw-agent/.openclaw/workspace/fatiha-proto/renders/niche-pattern-options.png';
  await page.screenshot({ path: outPath, fullPage: false });

  console.log('Screenshot saved to:', outPath);
  await browser.close();
})();
