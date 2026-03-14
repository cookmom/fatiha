const puppeteer=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
const SITE_DIR='/home/tawfeeq/ramadan-clock-site',PORT=9945;
function startServer(){const m={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml'};return new Promise(r=>{const s=http.createServer((req,res)=>{let fp=path.join(SITE_DIR,req.url==='/'?'index.html':req.url.split('?')[0]);fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':m[path.extname(fp)]||'application/octet-stream'});res.end(d)})});s.listen(PORT,()=>r(s))})}
async function main(){
  const server=await startServer();
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],env:{...process.env,GALLIUM_DRIVER:'d3d12',MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}});
  const page=await browser.newPage();
  await page.setViewport({width:430,height:932,deviceScaleFactor:3});
  await page.goto(`http://localhost:${PORT}/?compass`,{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,16000));
  
  // Check what's available
  const state = await page.evaluate(()=>({
    clockRays: !!window.clockRays,
    clockRaysLen: window.clockRays ? window.clockRays.length : 0,
    renderer: !!window._threeRenderer,
    scene: !!window._threeScene,
    camera: !!window._threeCamera,
    ray2initY: window.clockRays?.[2]?.initY,
    ray2rot: window.clockRays?.[2]?.mesh?.rotation?.y,
    ray2visible: window.clockRays?.[2]?.mesh?.visible,
    ray2opacity: window.clockRays?.[2]?.mesh?.children?.[0]?.material?.uniforms?.op?.value
  }));
  console.log('STATE:', JSON.stringify(state, null, 2));
  
  // Try to change rotation and re-render
  const before = await page.evaluate(()=>window.clockRays[2].mesh.rotation.y);
  console.log('Before:', before);
  
  await page.evaluate(()=>{
    window.clockRays[2].mesh.rotation.y = window.clockRays[2].initY - Math.PI/2;
    window.clockRays[2].mesh.children[0].material.uniforms.op.value = 0.95;
    if(window._threeRenderer) window._threeRenderer.render(window._threeScene, window._threeCamera);
  });
  
  await page.screenshot({path:'compass-debug-after.png'});
  
  const after = await page.evaluate(()=>window.clockRays[2].mesh.rotation.y);
  console.log('After:', after);
  console.log('Diff:', after - before);
  
  await browser.close();server.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
