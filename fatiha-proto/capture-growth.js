const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8766;
const OUT = path.join(__dirname, 'captures-growth');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, {recursive:true});

const FRAMES = [20, 50, 100, 150, 250, 350, 400, 480];

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
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.setViewport({width:1080, height:1920});
  await page.goto('http://localhost:'+PORT, {waitUntil:'networkidle0', timeout:30000});
  console.log('Page loaded');

  // Click tap overlay to dismiss
  await page.click('#tap').catch(()=>{});
  await new Promise(r => setTimeout(r, 3000));

  const state = await page.evaluate(() => ({
    setupDone: typeof setupDone !== 'undefined' ? setupDone : false,
    fc: typeof frameCount !== 'undefined' ? frameCount : -1,
  }));
  console.log('State:', JSON.stringify(state));

  if (!state.setupDone) {
    console.log('Setup failed. Exiting.');
    await browser.close(); server.close(); return;
  }

  for (const targetF of FRAMES) {
    try {
      await page.waitForFunction(`frameCount >= ${targetF}`, {timeout: 120000});
    } catch(e) {
      const fc = await page.evaluate(() => frameCount);
      console.log(`Timeout at target ${targetF}, current: ${fc}`);
      break;
    }
    const fname = `f${String(targetF).padStart(5,'0')}.png`;
    await page.screenshot({path: path.join(OUT, fname), fullPage:false});
    const fc = await page.evaluate(() => frameCount);
    console.log(`Captured ${fname} (fc=${fc})`);
  }

  console.log('All done');
  await browser.close();
  server.close();
})();
