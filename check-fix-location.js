const puppeteer=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
const SITE_DIR='/home/tawfeeq/ramadan-clock-site',PORT=9936;
function startServer(){const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':m[path.extname(fp)]||'application/octet-stream'});res.end(d)})});s.listen(PORT,()=>r(s))})}

const PRAYER_COLORS = {
  '#aa44ff':'Tahajjud/LastThird', '#8811ff':'Qiyam', '#6633ee':'Fajr',
  '#ff9900':'Sunrise/Dhuha', '#00bb44':'Dhuhr', '#ff8800':'Asr',
  '#ff2200':'Maghrib', '#1166ff':'Isha'
};

async function main(){
  const server=await startServer();
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}});
  const page=await browser.newPage();
  await page.setViewport({width:430,height:932,deviceScaleFactor:1});
  await page.emulateTimezone('Asia/Riyadh');
  
  // Pre-set localStorage with Makkah coordinates BEFORE page load
  await page.evaluateOnNewDocument(()=>{
    window._forceTimeMin = 750;
    // Set agot_loc in localStorage 
    try {
      localStorage.setItem('agot_loc', JSON.stringify({lat:21.4225, lon:39.8262, name:'Makkah', tz:'Asia/Riyadh'}));
    } catch(e){}
  });
  
  await page.goto(`http://localhost:${PORT}/`,{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,14000));
  
  // Also call _setPrayerLocation directly
  await page.evaluate(()=>{
    if(window._setPrayerLocation) window._setPrayerLocation(21.4225, 39.8262, 'Makkah');
  });
  await new Promise(r=>setTimeout(r,5000));

  // Now test different forceTimeMin values
  const testMins = [90, 230, 350, 570, 850, 1030, 1170, 1300];
  for(const min of testMins) {
    await page.evaluate((m)=>{window._forceTimeMin=m},min);
    await new Promise(r=>setTimeout(r,3000));
    const info = await page.evaluate(()=>{
      const slider=document.getElementById('modePillSlider');
      const glowBar=slider?slider.style.getPropertyValue('--pill-glow-bar'):'none';
      return { glowBar, activePrayerColor: window._activePrayerColor||'none' };
    });
    const colorName = PRAYER_COLORS[info.activePrayerColor] || `unknown(${info.activePrayerColor})`;
    console.log(`min=${String(min).padStart(4)} (${String(Math.floor(min/60)).padStart(2)}:${String(min%60).padStart(2,'0')}): ${info.activePrayerColor} → ${colorName}`);
  }
  
  await browser.close();server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
