// capture-v2-opacity-test.js — render v2 opacity tests with GPU Chrome
const puppeteer = require('/home/openclaw-agent/.openclaw/workspace/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const WORKDIR = '/home/openclaw-agent/.openclaw/workspace/fatiha-proto';
const RENDERS = path.join(WORKDIR, 'renders');

const OPACITIES = [100, 130, 160, 200];

async function capture(opacity) {
  const htmlFile = path.join(WORKDIR, `v2-opacity-${opacity}.html`);
  const outFile = path.join(RENDERS, `v2-opacity-${opacity}.png`);
  const url = `file://${htmlFile}`;

  console.log(`Rendering opacity ${opacity}...`);

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
    },
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 600, height: 600, deviceScaleFactor: 1 });

    // Collect console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for p5 to render (watercolor fill takes time)
    await new Promise(r => setTimeout(r, 8000));

    // Check if canvas rendered
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { found: false };
      return {
        found: true,
        width: canvas.width,
        height: canvas.height,
        id: canvas.id,
      };
    });
    console.log(`  Canvas: ${JSON.stringify(canvasInfo)}`);

    if (errors.length > 0) {
      console.log(`  Errors: ${errors.slice(0, 3).join('; ')}`);
    }

    await page.screenshot({ path: outFile, fullPage: false });
    console.log(`  Saved: ${outFile}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  if (!fs.existsSync(RENDERS)) {
    fs.mkdirSync(RENDERS, { recursive: true });
  }

  for (const opacity of OPACITIES) {
    await capture(opacity);
  }

  console.log('\nAll done!');
})();
