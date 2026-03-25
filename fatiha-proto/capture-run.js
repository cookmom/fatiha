const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 8765;
const FRAMES = [10, 60, 120, 300];
const OUT = path.join(__dirname, 'captures');
const server = http.createServer((req, res) => {
  let fp = path.join(__dirname, req.url === '/' ? '/fatiha-parametric-rebuild.html' : req.url);
  const ext = path.extname(fp);
  const mime = {'.html':'text/html','.js':'application/javascript','.mp3':'audio/mpeg'}[ext]||'application/octet-stream';
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type':mime}); res.end(data);
  });
});
async function run() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
  await new Promise(r => server.listen(PORT, r));
  console.log('Server ready');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']
  });
  const page = await browser.newPage();
  await page.setViewport({width:1080, height:1920});
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  await page.goto('http://localhost:'+PORT, {waitUntil:'networkidle0', timeout:60000});
  await page.click('#tap').catch(()=>{});
  await page.waitForFunction('typeof frameCount !== "undefined" && frameCount > 0', {timeout:30000});
  console.log('p5 running');
  for (const tf of FRAMES) {
    console.log('Waiting for frame ' + tf);
    try {
      await page.waitForFunction('frameCount >= ' + tf, {timeout:600000});
      await page.screenshot({path:path.join(OUT, 'f'+String(tf).padStart(5,'0')+'.png'), fullPage:false});
      console.log('Captured frame ' + tf);
    } catch(e) { console.log('Failed at '+tf+': '+e.message.substring(0,80)); break; }
  }
  await browser.close(); server.close();
}
run().catch(err => { console.error(err); process.exit(1); });
