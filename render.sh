#!/bin/bash
# Usage: ./render.sh filename.html [output.png]
FILE="${1:-fatiha-door.html}"
OUT="${2:-${FILE%.html}-render.png}"
export GALLIUM_DRIVER=d3d12
export MESA_D3D12_DEFAULT_ADAPTER_NAME=NVIDIA
export LD_LIBRARY_PATH=/usr/lib/wsl/lib:$LD_LIBRARY_PATH

node -e "
const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable', headless: 'new',
    args: ['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl']
  });
  const page = await browser.newPage();
  await page.setViewport({width:1080, height:1920, deviceScaleFactor:1});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.substring(0,200)));
  page.on('console', m => { if(m.type()==='error' && !m.text().includes('404')) errors.push(m.text().substring(0,200)); });
  await page.goto('http://localhost:9981/' + '${FILE}', {waitUntil:'domcontentloaded', timeout:60000});
  await new Promise(r => setTimeout(r, 25000));
  for(const e of errors) console.log('ERR:', e);
  if(!errors.length) console.log('CLEAN');
  await page.screenshot({path:'${OUT}'});
  console.log('Screenshot: ${OUT}');
  await browser.close();
})();
"
