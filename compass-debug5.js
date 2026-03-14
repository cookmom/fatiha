const puppeteer=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
const SITE_DIR='/home/tawfeeq/ramadan-clock-site',PORT=9950;
function startServer(){const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':m[path.extname(fp)]||'application/octet-stream'});res.end(d)})});s.listen(PORT,()=>r(s))})}
async function main(){
  const server=await startServer();
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}});
  const page=await browser.newPage();
  page.on('console', msg => console.log('[page]', msg.text()));
  page.on('pageerror', err => console.log('[pageerror]', err.message));
  await page.setViewport({width:430,height:932,deviceScaleFactor:3});
  await page.emulateTimezone('Asia/Riyadh');
  await page.evaluateOnNewDocument(()=>{
    window._forceTimeMin=230;
    Date.prototype.getHours=function(){return 3};
    Date.prototype.getMinutes=function(){return 50};
    Date.prototype.getSeconds=function(){return 0};
    Date.prototype.getMilliseconds=function(){return 0};
    try{localStorage.setItem('agot_loc',JSON.stringify({lat:21.4225,lon:39.8262,name:'Makkah',tz:'Asia/Riyadh'}))}catch(e){}
  });
  // WITHOUT ?compass first, to see if clockRays exists
  await page.goto(`http://localhost:${PORT}/`,{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,16000));
  
  const s0 = await page.evaluate(()=>({
    clockRays: !!window.clockRays,
    clockRaysLen: window.clockRays ? window.clockRays.length : 0,
    updateCompass: typeof window._clockUpdateCompass,
    toggleCompass: typeof window._clockToggleCompass,
  }));
  console.log('WITHOUT ?compass:', JSON.stringify(s0));

  // Now try with ?compass
  await page.goto(`http://localhost:${PORT}/?compass`,{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,16000));
  
  const s1 = await page.evaluate(()=>({
    clockRays: !!window.clockRays,
    clockRaysLen: window.clockRays ? window.clockRays.length : 0,
    updateCompass: typeof window._clockUpdateCompass,
    toggleCompass: typeof window._clockToggleCompass,
  }));
  console.log('WITH ?compass:', JSON.stringify(s1));

  console.log('Done');
  await browser.close();server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
