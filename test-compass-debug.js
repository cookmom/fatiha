const puppeteer=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
const SITE_DIR='/home/tawfeeq/ramadan-clock-site',PORT=9945;
function startServer(){const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':m[path.extname(fp)]||'application/octet-stream'});res.end(d)})});s.listen(PORT,()=>r(s))})}
async function main(){
  const server=await startServer();
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}});
  const page=await browser.newPage();
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
  await page.goto(`http://localhost:${PORT}/`,{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,14000));
  await page.evaluate(()=>{if(window._setPrayerLocation)window._setPrayerLocation(21.4225,39.8262,'Makkah')});
  await new Promise(r=>setTimeout(r,5000));
  
  // Enable compass
  await page.evaluate(()=>{if(typeof window._clockToggleCompass==='function')window._clockToggleCompass(true)});
  await new Promise(r=>setTimeout(r,2000));

  // Check state
  const state1 = await page.evaluate(()=>({
    compassMode: !!document.body.classList.contains('mode-compass'),
    adhanHeading: typeof window.adhanDeviceHeading,
    adhanQibla: typeof window.adhanQiblaAngle,
    adhanHeadingVal: window.adhanDeviceHeading,
    adhanQiblaVal: window.adhanQiblaAngle,
    clockRaysExist: !!window.clockRays,
    clockRaysLen: window.clockRays ? window.clockRays.length : 0,
    ray2rot: window.clockRays && window.clockRays[2] ? window.clockRays[2].mesh.rotation.y : 'n/a',
    ray2initY: window.clockRays && window.clockRays[2] ? window.clockRays[2].initY : 'n/a',
  }));
  console.log('State before heading set:', JSON.stringify(state1, null, 2));

  // Set heading
  await page.evaluate(()=>{
    window._compassCalibrated = true;
    window._compassAccuracy = 5;
    var qibla = window.adhanQiblaAngle || 4.276;
    window._lockedQibla = qibla;
    window.adhanDeviceHeading = qibla; // needle at 12 (aligned)
    window.adhanQiblaAngle = qibla;
    if(typeof window._clockUpdateCompass==='function') window._clockUpdateCompass(qibla, qibla);
  });
  await new Promise(r=>setTimeout(r,1000));

  const state2 = await page.evaluate(()=>({
    adhanHeadingVal: window.adhanDeviceHeading,
    adhanQiblaVal: window.adhanQiblaAngle,
    ray2rot: window.clockRays && window.clockRays[2] ? window.clockRays[2].mesh.rotation.y : 'n/a',
  }));
  console.log('State after heading=qibla (should be at 12):', JSON.stringify(state2, null, 2));

  // Now set heading offset (needle at 3 o'clock)
  await page.evaluate(()=>{
    var qibla = window._lockedQibla || 4.276;
    window.adhanDeviceHeading = qibla - Math.PI/2;
    if(typeof window._clockUpdateCompass==='function') window._clockUpdateCompass(qibla - Math.PI/2, qibla);
  });
  await new Promise(r=>setTimeout(r,1000));

  const state3 = await page.evaluate(()=>({
    adhanHeadingVal: window.adhanDeviceHeading,
    ray2rot: window.clockRays && window.clockRays[2] ? window.clockRays[2].mesh.rotation.y : 'n/a',
  }));
  console.log('State after heading offset PI/2 (should be at 3):', JSON.stringify(state3, null, 2));

  // Check if rotation actually changed
  console.log('Rotation changed?', state2.ray2rot !== state3.ray2rot);

  await browser.close(); server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
