const puppeteer=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
const SITE_DIR='/home/tawfeeq/ramadan-clock-site',PORT=9940;
function startServer(){const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':m[path.extname(fp)]||'application/octet-stream'});res.end(d)})});s.listen(PORT,()=>r(s))})}
async function main(){
  const server=await startServer();
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}});
  const page=await browser.newPage();
  // Full 3x DPR — no resolution drop
  await page.setViewport({width:430,height:932,deviceScaleFactor:3});
  await page.emulateTimezone('Asia/Riyadh');
  await page.evaluateOnNewDocument(()=>{
    Date.prototype.getSeconds=function(){return 0};Date.prototype.getMilliseconds=function(){return 0};
    window._forceTimeMin=230;
    try{localStorage.setItem('agot_loc',JSON.stringify({lat:21.4225,lon:39.8262,name:'Makkah',tz:'Asia/Riyadh'}))}catch(e){}
  });
  await page.goto(`http://localhost:${PORT}/`,{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,14000));
  await page.evaluate(()=>{if(window._setPrayerLocation)window._setPrayerLocation(21.4225,39.8262,'Makkah')});
  await new Promise(r=>setTimeout(r,5000));
  await page.evaluate(()=>{
    window._forceTimeMin=230;
    window.__pin=setInterval(()=>{window._forceTimeMin=230},100);
    const gc='#aa44ff',slider=document.getElementById('modePillSlider');
    if(slider){slider.style.setProperty('--pill-glow-bar',gc);slider.style.setProperty('--pill-glow-bar-shadow',gc+'73');slider.style.setProperty('--pill-glow-bar-soft',gc+'26');slider.style.setProperty('--pill-glow',gc+'1f')}
  });
  await new Promise(r=>setTimeout(r,3000));

  await page.evaluate(async()=>{
    const link=document.createElement('link');link.href='https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap';link.rel='stylesheet';document.head.appendChild(link);
    await new Promise(r=>setTimeout(r,3000));

    // Nuclear hide
    document.body.classList.add('chrome-hidden');
    document.querySelectorAll('body > *').forEach(el=>{
      if(el.tagName==='CANVAS')return;
      if(el.classList&&(el.classList.contains('mode-pill')||el.classList.contains('mode-label')))return;
      if(el.id==='modePill'||el.id==='modeLabel')return;
      if(el.classList&&el.classList.contains('poster-overlay'))return;
      el.style.display='none';
    });
    const canvas=document.querySelector('canvas');
    if(canvas){canvas.style.display='block';canvas.style.position='fixed';canvas.style.top='0';canvas.style.left='0';canvas.style.width='100vw';canvas.style.height='100vh';canvas.style.zIndex='0'}

    // Move pill + label into X safe zone (bottom 37% → ~63% from top)
    const pill=document.querySelector('.mode-pill');
    if(pill){
      pill.style.setProperty('display','flex','important');
      pill.style.setProperty('opacity','1','important');
      pill.style.zIndex='999';
      pill.style.bottom='35%'; // move up from 8% to 35%
    }
    const ml=document.querySelector('.mode-label')||document.getElementById('modeLabel');
    if(ml){
      ml.style.setProperty('display','block','important');
      ml.style.setProperty('opacity','1','important');
      ml.style.bottom='calc(35% + 62px)'; // just above pill
    }

    // Title in safe zone (top 37% → just above cube)
    const t=document.createElement('div');t.className='poster-overlay';
    t.style.cssText='position:fixed;top:10%;left:0;width:100%;text-align:center;z-index:9999;pointer-events:none;font-family:"Instrument Serif",serif;font-size:2.8rem;font-weight:400;letter-spacing:-0.02em;color:rgba(232,228,220,0.9);line-height:1.1';
    t.textContent='a Gift of Time.';document.body.appendChild(t);
    // Subtitle
    const s=document.createElement('div');s.className='poster-overlay';
    s.style.cssText='position:fixed;top:calc(10% + 3.8rem);left:0;width:100%;text-align:center;z-index:9999;pointer-events:none;font-family:"Instrument Serif",serif;font-size:0.85rem;font-weight:400;color:rgba(232,228,220,0.4);padding:0 15%';
    s.textContent='seek the night of decree.';document.body.appendChild(s);

    // Draw X 16:9 safe zone guides (red lines) for reference
    const guide=document.createElement('div');guide.className='poster-overlay';
    guide.style.cssText='position:fixed;top:37%;left:0;width:100%;height:0;border-top:1px dashed rgba(255,0,0,0.4);z-index:10000;pointer-events:none';
    document.body.appendChild(guide);
    const guide2=document.createElement('div');guide2.className='poster-overlay';
    guide2.style.cssText='position:fixed;top:63%;left:0;width:100%;height:0;border-top:1px dashed rgba(255,0,0,0.4);z-index:10000;pointer-events:none';
    document.body.appendChild(guide2);
  });
  await new Promise(r=>setTimeout(r,1000));
  await page.screenshot({path:'/home/openclaw-agent/.openclaw/workspace/test-safezone.png',type:'png'});
  console.log('Done');
  await browser.close();server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
