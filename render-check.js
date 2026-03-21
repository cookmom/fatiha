const puppeteer = require('puppeteer-core');
const path = require('path');
const file = process.argv[2] || 'eid-calligraphy-v2.html';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || '')
    },
    args: ['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl',
           '--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage',
           '--in-process-gpu','--enable-webgl']
  });
  const page = await browser.newPage();
  await page.setViewport({width:1080, height:1920, deviceScaleFactor:1});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if(m.type()==='error') errors.push(m.text()); });
  await page.goto('http://localhost:9981/' + file, {waitUntil:'domcontentloaded'});
  await new Promise(r => setTimeout(r, 20000));
  const outPath = file.replace('.html', '-render.png');
  await page.screenshot({path: outPath});
  console.log(errors.length ? 'ERRORS: ' + errors.join('\n') : 'CLEAN');
  console.log('Screenshot:', outPath);
  await browser.close();
})();
