// Pre-built GPU Chrome render script for Chris
// Usage: GALLIUM_DRIVER=d3d12 MESA_D3D12_DEFAULT_ADAPTER_NAME=NVIDIA LD_LIBRARY_PATH=/usr/lib/wsl/lib node render-cube.js [output.png]
const puppeteer = require('puppeteer-core');
const outPath = process.argv[2] || '/home/openclaw-agent/.openclaw/workspace/chris-render.png';
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: ['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],
  });
  const page = await browser.newPage();
  await page.setViewport({width:430, height:932, deviceScaleFactor:3});
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('agot_splash_seen','1');
    localStorage.setItem('agot_loc', JSON.stringify({lat:21.4225,lon:39.8262,name:'Makkah'}));
  });
  await page.goto('http://localhost:7748/', {waitUntil:'domcontentloaded'});
  await new Promise(r => setTimeout(r, 16000));
  await page.evaluate(() => {
    document.querySelectorAll('#qiyamDua, #maghribHadith, #splash, .global-header, #modePill, .sticky-cta, #qadrFloatBtn').forEach(el => el.style.display='none');
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({path: outPath});
  console.log('Saved: ' + outPath);
  await browser.close();
})();
