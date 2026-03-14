const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_DIR = '/home/tawfeeq/ramadan-clock-site';
const PORT = 9925;

function startServer() {
  const mimeTypes = {
    '.html':'text/html','.js':'application/javascript','.css':'text/css',
    '.json':'application/json','.png':'image/png','.jpg':'image/jpeg',
    '.hdr':'application/octet-stream','.glb':'model/gltf-binary',
    '.woff2':'font/woff2','.svg':'image/svg+xml','.ico':'image/x-icon',
    '.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav',
  };
  return new Promise(r => {
    const server = http.createServer((req, res) => {
      let fp = path.join(SITE_DIR, req.url==='/'?'index.html':req.url.split('?')[0]);
      fs.readFile(fp, (err, data) => {
        if(err){res.writeHead(404);res.end();return;}
        res.writeHead(200,{'Content-Type':mimeTypes[path.extname(fp)]||'application/octet-stream'});
        res.end(data);
      });
    });
    server.listen(PORT, () => r(server));
  });
}

async function main() {
  const server = await startServer();
  const browser = await puppeteer.launch({
    executablePath:'/usr/bin/google-chrome-stable', headless:true,
    args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl',
          '--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage',
          '--in-process-gpu','--enable-webgl'],
    env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',
         LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')},
  });

  const page = await browser.newPage();
  await page.setViewport({width:430,height:932,deviceScaleFactor:3});
  await page.emulateTimezone('America/Los_Angeles');
  
  await page.goto(`http://localhost:${PORT}/`, {waitUntil:'domcontentloaded',timeout:30000});
  console.log('Waiting for scene + fonts...');
  await new Promise(r=>setTimeout(r,16000));

  // Scroll to info section to see the headings
  await page.evaluate(() => {
    const el = document.querySelector('.info-content') || document.querySelector('#info-overlay');
    // Toggle info mode
    if(window.switchMode) window.switchMode('info');
  });
  await new Promise(r=>setTimeout(r,2000));

  // Screenshot the full info page
  await page.screenshot({path:'/home/openclaw-agent/.openclaw/workspace/font-test-info.png',type:'png',fullPage:false});
  console.log('Saved font-test-info.png');

  // Scroll down to see more headings
  await page.evaluate(() => window.scrollBy(0, 600));
  await new Promise(r=>setTimeout(r,1000));
  await page.screenshot({path:'/home/openclaw-agent/.openclaw/workspace/font-test-info-2.png',type:'png'});
  console.log('Saved font-test-info-2.png');

  // Scroll more for compass section
  await page.evaluate(() => window.scrollBy(0, 600));
  await new Promise(r=>setTimeout(r,1000));
  await page.screenshot({path:'/home/openclaw-agent/.openclaw/workspace/font-test-info-3.png',type:'png'});
  console.log('Saved font-test-info-3.png');

  await browser.close();
  server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
