const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');
const SITE_DIR = '/home/tawfeeq/ramadan-clock-site';
const PORT = 9930;
function startServer() {
  const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
  return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':m[path.extname(fp)]||'application/octet-stream'});res.end(d);});});s.listen(PORT,()=>r(s));});
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
    Date.prototype.getSeconds=function(){return 0;};Date.prototype.getMilliseconds=function(){return 0;};
    window._forceTimeMin=1300;window._forceLocation={lat:21.4225,lon:39.8262,name:'Makkah'};
  });
  await page.goto(`http://localhost:${PORT}/`,{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,16000));
  await page.evaluate(()=>{window._forceTimeMin=1300;});
  await new Promise(r=>setTimeout(r,3000));

  // Crop just the bottom ~200px of the real app (no hiding, just the pill area)
  await page.screenshot({
    path:'/home/openclaw-agent/.openclaw/workspace/pill-real-app.png',
    type:'png',
    clip:{x:0, y:832, width:430, height:100}  // bottom 100px CSS (300px at 3x)
  });
  console.log('Saved pill-real-app.png');

  // Now do the poster version with hide + force pill visible
  await page.evaluate(async()=>{
    document.body.classList.add('chrome-hidden');
    document.querySelectorAll('body > *').forEach(el=>{
      if(el.tagName==='CANVAS')return;
      if(el.classList&&el.classList.contains('mode-pill'))return;
      if(el.id==='modePill')return;
      if(el.classList&&el.classList.contains('poster-overlay'))return;
      el.style.display='none';
    });
    const canvas=document.querySelector('canvas');
    if(canvas){canvas.style.display='block';canvas.style.position='fixed';canvas.style.top='0';canvas.style.left='0';canvas.style.width='100vw';canvas.style.height='100vh';canvas.style.zIndex='0';}
    const pill=document.querySelector('.mode-pill')||document.getElementById('modePill');
    if(pill){pill.style.setProperty('display','flex','important');pill.style.setProperty('opacity','1','important');pill.style.setProperty('pointer-events','auto','important');pill.style.zIndex='999';}
  });
  await new Promise(r=>setTimeout(r,1000));

  // Crop same area from poster version
  await page.screenshot({
    path:'/home/openclaw-agent/.openclaw/workspace/pill-poster-version.png',
    type:'png',
    clip:{x:0, y:832, width:430, height:100}
  });
  console.log('Saved pill-poster-version.png');

  // Also get pill computed styles
  const pillInfo = await page.evaluate(()=>{
    const pill=document.querySelector('.mode-pill');
    if(!pill) return 'no pill found';
    const cs=getComputedStyle(pill);
    const btns=pill.querySelectorAll('.mode-pill-btn');
    const btnInfo=Array.from(btns).map(b=>({
      text:b.textContent.trim(),
      font:getComputedStyle(b).fontFamily,
      fontSize:getComputedStyle(b).fontSize,
      width:b.getBoundingClientRect().width,
      height:b.getBoundingClientRect().height,
    }));
    return JSON.stringify({
      pillBottom:cs.bottom, pillDisplay:cs.display, pillOpacity:cs.opacity,
      pillWidth:pill.getBoundingClientRect().width,
      pillHeight:pill.getBoundingClientRect().height,
      buttons:btnInfo
    },null,2);
  });
  console.log('Pill info:', pillInfo);

  await browser.close();server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
