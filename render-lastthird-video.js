// <!-- بسم الله الرحمن الرحيم -->
const puppeteer=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const SITE_DIR='/home/tawfeeq/ramadan-clock-site',PORT=9939,FPS=30,DURATION=15,TOTAL=FPS*DURATION;
const OUT_DIR='/home/openclaw-agent/.openclaw/workspace/lastthird-frames';

function startServer(){
  const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
  return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':m[path.extname(fp)]||'application/octet-stream'});res.end(d)})});s.listen(PORT,()=>r(s))});
}

async function main(){
  if(!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR,{recursive:true});
  // Clean old frames
  fs.readdirSync(OUT_DIR).forEach(f=>fs.unlinkSync(path.join(OUT_DIR,f)));

  const server=await startServer();
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,
    args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],
    env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}});

  const page=await browser.newPage();
  await page.setViewport({width:430,height:932,deviceScaleFactor:3});
  await page.emulateTimezone('Asia/Riyadh');

  // Fake time starting at 3:50:00 AM, advancing per frame
  let fakeSeconds=0;
  await page.evaluateOnNewDocument(()=>{
    window._forceTimeMin=230; // Last Third 3:50 AM
    window._fakeTime={h:3,m:50,s:0,ms:0};
    Date.prototype.getHours=function(){return window._fakeTime.h};
    Date.prototype.getMinutes=function(){return window._fakeTime.m};
    Date.prototype.getSeconds=function(){return window._fakeTime.s};
    Date.prototype.getMilliseconds=function(){return window._fakeTime.ms};
    try{localStorage.setItem('agot_loc',JSON.stringify({lat:21.4225,lon:39.8262,name:'Makkah',tz:'Asia/Riyadh'}))}catch(e){}
  });

  await page.goto(`http://localhost:${PORT}/`,{waitUntil:'domcontentloaded',timeout:30000});
  console.log('Waiting 14s for scene...');
  await new Promise(r=>setTimeout(r,14000));

  // Set location + pin forceTimeMin
  await page.evaluate(()=>{
    if(window._setPrayerLocation) window._setPrayerLocation(21.4225,39.8262,'Makkah');
  });
  await new Promise(r=>setTimeout(r,5000));

  await page.evaluate(()=>{
    window._forceTimeMin=230;
    window.__pin=setInterval(()=>{window._forceTimeMin=230},100);
    // Force pill glow to Last Third violet
    const gc='#aa44ff';
    const slider=document.getElementById('modePillSlider');
    if(slider){
      slider.style.setProperty('--pill-glow-bar',gc);
      slider.style.setProperty('--pill-glow-bar-shadow',gc+'73');
      slider.style.setProperty('--pill-glow-bar-soft',gc+'26');
      slider.style.setProperty('--pill-glow',gc+'1f');
    }
  });
  await new Promise(r=>setTimeout(r,3000));

  // Inject overlay + hide chrome
  await page.evaluate(async()=>{
    const link=document.createElement('link');link.href='https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap';link.rel='stylesheet';document.head.appendChild(link);
    await new Promise(r=>setTimeout(r,3000));
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
    const pill=document.querySelector('.mode-pill');
    if(pill){pill.style.setProperty('display','flex','important');pill.style.setProperty('opacity','1','important');pill.style.zIndex='999'}
    const ml=document.querySelector('.mode-label')||document.getElementById('modeLabel');
    if(ml){ml.style.setProperty('display','block','important');ml.style.setProperty('opacity','1','important')}
    // Title
    const t=document.createElement('div');t.className='poster-overlay';
    t.style.cssText='position:fixed;top:10%;left:0;width:100%;text-align:center;z-index:9999;pointer-events:none;font-family:"Instrument Serif",serif;font-size:2.8rem;font-weight:400;letter-spacing:-0.02em;color:rgba(232,228,220,0.9);line-height:1.1';
    t.textContent='a Gift of Time.';document.body.appendChild(t);
    // Subtitle
    const s=document.createElement('div');s.className='poster-overlay';
    s.style.cssText='position:fixed;top:calc(10% + 3.8rem);left:0;width:100%;text-align:center;z-index:9999;pointer-events:none;font-family:"Instrument Serif",serif;font-size:0.85rem;font-weight:400;color:rgba(232,228,220,0.4);padding:0 15%';
    s.textContent='seek the night of decree.';document.body.appendChild(s);
  });
  await new Promise(r=>setTimeout(r,1000));

  console.log(`Capturing ${TOTAL} frames at ${FPS}fps (${DURATION}s)...`);
  for(let i=0;i<TOTAL;i++){
    // Advance fake clock: 0s to 15s real time
    const totalMs=i*(1000/FPS);
    const s=Math.floor(totalMs/1000);
    const ms=Math.floor(totalMs%1000);
    await page.evaluate((s,ms)=>{
      window._fakeTime.s=s;
      window._fakeTime.ms=ms;
    },s,ms);

    // Small wait for render frame
    await new Promise(r=>setTimeout(r,50));

    const frame=String(i).padStart(4,'0');
    await page.screenshot({path:`${OUT_DIR}/frame_${frame}.png`,type:'png'});
    if(i%30===0) console.log(`  Frame ${i}/${TOTAL} (${s}s)`);
  }

  console.log('Encoding to MP4...');
  execSync(`ffmpeg -y -framerate ${FPS} -i "${OUT_DIR}/frame_%04d.png" -c:v libx264 -crf 18 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" /home/openclaw-agent/.openclaw/workspace/poster-lastthird-video.mp4`);
  
  const stat=fs.statSync('/home/openclaw-agent/.openclaw/workspace/poster-lastthird-video.mp4');
  console.log(`Done! poster-lastthird-video.mp4 (${(stat.size/1024/1024).toFixed(1)}MB)`);

  await browser.close();server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
