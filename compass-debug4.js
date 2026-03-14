const puppeteer=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
const SITE_DIR='/home/tawfeeq/ramadan-clock-site',PORT=9948;
function startServer(){const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml','.mp3':'audio/mpeg'};return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':m[path.extname(fp)]||'application/octet-stream'});res.end(d)})});s.listen(PORT,()=>r(s))})}
async function main(){
  const server=await startServer();
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}});
  const page=await browser.newPage();
  page.on('pageerror', err => console.log(`[pageerror] ${err.message}`));
  page.on('requestfailed', req => console.log(`[reqfail] ${req.url()} ${req.failure()?.errorText}`));
  await page.setViewport({width:430,height:932,deviceScaleFactor:3});
  // Load WITHOUT ?compass, then toggle compass via JS
  await page.goto(`http://localhost:${PORT}/`,{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,20000));
  
  const pre = await page.evaluate(()=>({clockRays:!!window.clockRays, renderer:!!window._threeRenderer}));
  console.log('Before compass toggle:', JSON.stringify(pre));
  
  // Toggle compass mode
  await page.evaluate(()=>{
    if(typeof window._clockToggleCompass==='function') window._clockToggleCompass(true);
  });
  await new Promise(r=>setTimeout(r,2000));
  
  // Override needle to 9 o'clock + re-render
  await page.evaluate(()=>{
    const r2 = window.clockRays[2];
    r2.mesh.rotation.y = r2.initY + Math.PI/2;
    r2.mesh.children[0].material.uniforms.op.value = 0.95;
    if(window._threeRenderer) window._threeRenderer.render(window._threeScene, window._threeCamera);
  });
  await page.screenshot({path:'compass-9.png'});
  
  // Override to 12 o'clock + re-render
  await page.evaluate(()=>{
    const r2 = window.clockRays[2];
    r2.mesh.rotation.y = r2.initY;
    r2.mesh.children[0].material.uniforms.op.value = 0.95;
    if(window._threeRenderer) window._threeRenderer.render(window._threeScene, window._threeCamera);
  });
  await page.screenshot({path:'compass-12.png'});
  
  console.log('Done - check compass-9.png and compass-12.png');
  await browser.close();server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
