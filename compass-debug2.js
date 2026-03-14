const puppeteer=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
const SITE_DIR='/home/tawfeeq/ramadan-clock-site',PORT=9946;
function startServer(){const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml'};return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':m[path.extname(fp)]||'application/octet-stream'});res.end(d)})});s.listen(PORT,()=>r(s))})}
async function main(){
  const server=await startServer();
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}});
  const page=await browser.newPage();
  await page.setViewport({width:430,height:932,deviceScaleFactor:3});
  await page.goto(`http://localhost:${PORT}/?compass`,{waitUntil:'domcontentloaded',timeout:30000});
  
  // Poll until clockRays is available
  for(let i=0;i<60;i++){
    await new Promise(r=>setTimeout(r,1000));
    const ready = await page.evaluate(()=>!!window.clockRays && window.clockRays.length > 0);
    if(ready){console.log(`clockRays available after ${i+1}s`);break;}
    if(i===59) console.log('TIMEOUT: clockRays never appeared');
  }
  
  const state = await page.evaluate(()=>({
    clockRays: !!window.clockRays,
    clockRaysLen: window.clockRays ? window.clockRays.length : 0,
    renderer: !!window._threeRenderer,
    scene: !!window._threeScene,
    camera: !!window._threeCamera,
    ray2initY: window.clockRays?.[2]?.initY,
    ray2rot: window.clockRays?.[2]?.mesh?.rotation?.y,
    ray2opacity: window.clockRays?.[2]?.mesh?.children?.[0]?.material?.uniforms?.op?.value,
    sceneReady: window._sceneReady
  }));
  console.log('STATE:', JSON.stringify(state, null, 2));
  
  // Override + re-render + screenshot
  await page.evaluate(()=>{
    window.clockRays[2].mesh.rotation.y = window.clockRays[2].initY + Math.PI/2; // 9 o'clock
    window.clockRays[2].mesh.children[0].material.uniforms.op.value = 0.95;
    if(window._threeRenderer) window._threeRenderer.render(window._threeScene, window._threeCamera);
  });
  await page.screenshot({path:'compass-debug-9oclock.png'});
  console.log('Screenshot 1: 9 o\'clock');
  
  await new Promise(r=>setTimeout(r,100));
  await page.evaluate(()=>{
    window.clockRays[2].mesh.rotation.y = window.clockRays[2].initY; // 12 o'clock
    window.clockRays[2].mesh.children[0].material.uniforms.op.value = 0.95;
    if(window._threeRenderer) window._threeRenderer.render(window._threeScene, window._threeCamera);
  });
  await page.screenshot({path:'compass-debug-12oclock.png'});
  console.log('Screenshot 2: 12 o\'clock');
  
  await browser.close();server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
