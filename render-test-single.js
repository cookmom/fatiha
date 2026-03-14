const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');
const SITE_DIR = '/home/tawfeeq/ramadan-clock-site';
const PORT = 9928;
function startServer() {
  const mimeTypes = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
  return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':mimeTypes[path.extname(fp)]||'application/octet-stream'});res.end(d);});});s.listen(PORT,()=>r(s));});
}
async function main(){
  const server=await startServer();
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,
    args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],
    env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}});
  const page=await browser.newPage();
  await page.setViewport({width:430,height:932,deviceScaleFactor:3});
  await page.emulateTimezone('Asia/Riyadh');
  await page.evaluateOnNewDocument(()=>{
    Date.prototype.getSeconds=function(){return 0;};
    Date.prototype.getMilliseconds=function(){return 0;};
    window._forceTimeMin=1300; // Isha (mid-window for Makkah)
    window._forceLocation={lat:21.4225,lon:39.8262,name:'Makkah'};
  });
  await page.goto(`http://localhost:${PORT}/`,{waitUntil:'domcontentloaded',timeout:30000});
  console.log('Waiting 14s...');
  await new Promise(r=>setTimeout(r,14000));
  await page.evaluate(()=>{
    window._forceTimeMin=1300;
    window._forceLocation={lat:21.4225,lon:39.8262,name:'Makkah'};
  });
  await new Promise(r=>setTimeout(r,3000));

  // Nuclear hide — keep canvas + nav pill only
  await page.evaluate(async()=>{
    const link=document.createElement('link');
    link.href='https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap';
    link.rel='stylesheet';document.head.appendChild(link);
    await new Promise(r=>setTimeout(r,3000));

    document.body.classList.add('chrome-hidden');
    document.querySelectorAll('body > *').forEach(el=>{
      if(el.tagName==='CANVAS')return;
      if(el.classList&&el.classList.contains('nav-pill'))return;
      if(el.classList&&el.classList.contains('poster-overlay'))return;
      el.style.display='none';
    });
    document.querySelectorAll('.overlay,#splash,.bottom-sheet,#prayer-times-panel,#settings-panel,#dev-panel,[id*="version"],[id*="countdown"]').forEach(el=>el.style.display='none');

    const canvas=document.querySelector('canvas');
    if(canvas){canvas.style.display='block';canvas.style.position='fixed';canvas.style.top='0';canvas.style.left='0';canvas.style.width='100vw';canvas.style.height='100vh';canvas.style.zIndex='0';}
    const pill=document.querySelector('.nav-pill');
    if(pill){pill.style.display='';pill.style.zIndex='999';pill.style.position='fixed';}

    // Title
    const t=document.createElement('div');t.className='poster-overlay';
    t.style.cssText='position:fixed;top:10%;left:0;width:100%;text-align:center;z-index:9999;pointer-events:none;font-family:"Instrument Serif",serif;font-size:2.8rem;font-weight:400;letter-spacing:-0.02em;color:rgba(232,228,220,0.9);line-height:1.1;';
    t.textContent='a Gift of Time.';document.body.appendChild(t);
    // Subtitle
    const s=document.createElement('div');s.className='poster-overlay';
    s.style.cssText='position:fixed;top:calc(10% + 3.8rem);left:0;width:100%;text-align:center;z-index:9999;pointer-events:none;font-family:"Instrument Serif",serif;font-size:0.85rem;font-weight:400;color:rgba(232,228,220,0.4);padding:0 15%;';
    s.textContent='a study in light, time, orientation and a call to prayer.';document.body.appendChild(s);
  });
  await new Promise(r=>setTimeout(r,1000));
  await page.screenshot({path:'/home/openclaw-agent/.openclaw/workspace/test-isha-final.png',type:'png'});
  console.log('Done');
  await browser.close();server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
