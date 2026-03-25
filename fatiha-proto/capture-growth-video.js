const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8769;
const TOTAL_FRAMES = 480;
const OUT = path.join(__dirname, 'frames-growth');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, {recursive:true});

const server = http.createServer((req, res) => {
  let fp = path.join(__dirname, req.url === '/' ? '/fatiha-parametric.html' : req.url);
  const ext = path.extname(fp);
  const mime = {'.html':'text/html','.js':'application/javascript','.mp3':'audio/mpeg'}[ext]||'application/octet-stream';
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type':mime}); res.end(data);
  });
});

(async () => {
  await new Promise(r => server.listen(PORT, r));
  console.log('Server on ' + PORT);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('ERR:', err.message));
  await page.setViewport({width:1080, height:1920});
  await page.goto('http://localhost:'+PORT, {waitUntil:'networkidle0', timeout:30000});

  // Click tap overlay
  await page.click('#tap').catch(()=>{});

  // Wait for setup
  await page.waitForFunction('typeof setupDone !== "undefined" && setupDone === true', {timeout:30000});
  console.log('Setup done');

  // Inject gate: draw() runs only when __canDraw is true, sets __frameDone after each frame
  await page.evaluate(() => {
    window.__canDraw = false;
    window.__frameDone = false;
    window.__capturedFrame = 0;
    const origDraw = draw;
    noLoop(); // stop p5 auto-loop
    window.__gatedDraw = function() {
      frameCount = window.__capturedFrame + 1;
      origDraw();
      window.__frameDone = true;
    };
  });

  // Give p5.brush time to finish any pending async work from setup
  await new Promise(r => setTimeout(r, 2000));

  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    // Trigger one draw frame
    await page.evaluate((frameNum) => {
      window.__frameDone = false;
      window.__capturedFrame = frameNum - 1;
      window.__gatedDraw();
    }, i);

    // Wait for draw to complete + give p5.brush fill compositing time
    await page.waitForFunction('window.__frameDone === true', {timeout: 10000});
    // Extra delay for fill compositing (2D canvas → WebGL texture upload)
    await new Promise(r => setTimeout(r, 80));

    const fname = `f${String(i).padStart(5,'0')}.png`;
    await page.screenshot({path: path.join(OUT, fname), fullPage:false});

    if (i % 50 === 0 || i === 1) {
      console.log(`Frame ${i}/${TOTAL_FRAMES}`);
    }
  }

  console.log('All frames captured');
  await browser.close();
  server.close();
})();
