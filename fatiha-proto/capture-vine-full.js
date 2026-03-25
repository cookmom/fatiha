const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    args: [
      '--no-sandbox','--disable-setuid-sandbox',
      '--use-gl=angle','--use-angle=gl-egl',
      '--enable-webgl','--ignore-gpu-blocklist',
      '--disable-gpu-sandbox',
      '--window-size=1080,1920'
    ],
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || '')
    }
  });
  const page = await browser.newPage();
  await page.setViewport({width:1080,height:1920});
  page.on('console', m => console.log('PAGE:', m.text()));
  await page.goto('http://localhost:9981/test-vine-full-context.html', {waitUntil:'networkidle0',timeout:60000});
  console.log('Waiting for render...');
  await new Promise(r => setTimeout(r, 12000));
  await page.screenshot({path:'renders/vine-full-context.png', fullPage:false});
  console.log('Saved renders/vine-full-context.png');
  await browser.close();
})();
