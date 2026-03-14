const puppeteer=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
const SITE_DIR='/home/tawfeeq/ramadan-clock-site',PORT=9935;
function startServer(){const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':m[path.extname(fp)]||'application/octet-stream'});res.end(d)})});s.listen(PORT,()=>r(s))})}
async function main(){
  const server=await startServer();
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}});
  const page=await browser.newPage();
  await page.setViewport({width:430,height:932,deviceScaleFactor:1});
  await page.emulateTimezone('Asia/Riyadh');
  await page.evaluateOnNewDocument(()=>{
    window._forceTimeMin=750;
    window._forceLocation={lat:21.4225,lon:39.8262,name:'Makkah'};
  });
  await page.goto(`http://localhost:${PORT}/`,{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,14000));
  
  // Read all prayer-related state
  const state = await page.evaluate(()=>{
    return {
      forceTimeMin: window._forceTimeMin,
      forceLocation: window._forceLocation,
      prayerTimes: window._prayerTimes || window._lastPrayerTimes || 'none',
      activePrayerColor: window._activePrayerColor,
      locationName: window._locationName || window._cityName || 'none',
      // Check what location the app actually used
      storedLoc: window._loc || window._location || 'none',
      // Read the AlAdhan response if cached
      cachedPrayer: window._cachedPrayerData || 'none',
      // Any timezone info
      tzOffset: new Date().getTimezoneOffset(),
      dateString: new Date().toString(),
    };
  });
  console.log(JSON.stringify(state, null, 2));
  
  await browser.close();server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
