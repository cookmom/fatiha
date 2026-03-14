const puppeteer=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
const SITE_DIR='/home/tawfeeq/ramadan-clock-site',PORT=9932;
function startServer(){const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':m[path.extname(fp)]||'application/octet-stream'});res.end(d)})});s.listen(PORT,()=>r(s))})}
async function main(){
  const server=await startServer();
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}});

  // Test a range of forceTimeMin values and read what prayer the app thinks is active
  const testMins = [0, 90, 151, 230, 316, 350, 400, 540, 750, 850, 953, 1030, 1109, 1170, 1229, 1300, 1400];
  
  for(const min of testMins) {
    const page=await browser.newPage();
    await page.setViewport({width:430,height:932,deviceScaleFactor:1});
    await page.emulateTimezone('Asia/Riyadh');
    await page.evaluateOnNewDocument((m)=>{window._forceTimeMin=m;window._forceLocation={lat:21.4225,lon:39.8262,name:'Makkah'}},min);
    await page.goto(`http://localhost:${PORT}/`,{waitUntil:'domcontentloaded',timeout:30000});
    await new Promise(r=>setTimeout(r,8000));
    await page.evaluate((m)=>{window._forceTimeMin=m},min);
    await new Promise(r=>setTimeout(r,2000));
    
    const info = await page.evaluate(()=>{
      const label=document.getElementById('modeLabel');
      const pill=document.querySelector('.mode-pill-slider');
      const pillStyle=pill?getComputedStyle(pill):{};
      const glowBar=document.documentElement.style.getPropertyValue('--pill-glow-bar');
      // Try to read the active prayer from app state
      const prayerLabel=document.getElementById('_currentPrayerLabel');
      return {
        modeLabel: label?label.textContent:'none',
        glowBar: glowBar||'default',
        prayerLabel: prayerLabel?prayerLabel.textContent:'none',
        activePrayer: window._activePrayer||window._currentPrayer||'unknown',
      };
    });
    console.log(`min=${String(min).padStart(4)}: prayer=${info.activePrayer}, label=${info.prayerLabel}, glow=${info.glowBar}`);
    await page.close();
  }
  
  await browser.close();server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
