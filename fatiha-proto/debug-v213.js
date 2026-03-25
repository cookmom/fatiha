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

  // Collect ALL console messages
  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));

  const filePath = path.resolve('/home/openclaw-agent/.openclaw/workspace/fatiha-proto/test-arch-fill-latest.html');
  await page.goto('file://' + filePath, { waitUntil: 'domcontentloaded' });

  // Wait for sketch to attempt rendering
  await new Promise(r => setTimeout(r, 5000));

  // Check what's available on the brush object
  const brushInfo = await page.evaluate(() => {
    if (typeof brush === 'undefined') return 'brush is undefined';
    const keys = Object.keys(brush);
    return {
      keys: keys,
      hasFillBleed: typeof brush.fillBleed,
      hasBleed: typeof brush.bleed,
      hasFill: typeof brush.fill,
      hasBeginShape: typeof brush.beginShape,
    };
  });

  console.log('Brush API info:', JSON.stringify(brushInfo, null, 2));
  console.log('\nAll console logs:');
  logs.forEach(l => console.log(l));

  await browser.close();
})();
