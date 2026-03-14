const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_DIR = '/home/tawfeeq/ramadan-clock-site';
const PORT = 9924;

function startServer() {
  const mimeTypes = {
    '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.hdr': 'application/octet-stream', '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json', '.woff2': 'font/woff2', '.woff': 'font/woff',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
    '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
  };
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(SITE_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      const ext = path.extname(filePath);
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function main() {
  const server = await startServer();
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: ['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl',
           '--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage',
           '--in-process-gpu','--enable-webgl'],
    env: { ...process.env, GALLIUM_DRIVER:'d3d12', MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA',
           LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'') },
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 3 });
  await page.emulateTimezone('Asia/Riyadh');
  await page.evaluateOnNewDocument(() => {
    Date.prototype.getSeconds = function(){ return 0; };
    Date.prototype.getMilliseconds = function(){ return 0; };
  });
  await page.evaluateOnNewDocument(() => {
    window._forceTimeMin = 150; // 2:30 AM Last Third
    window._forceLocation = { lat:21.4225, lon:39.8262, name:'Makkah' };
  });

  await page.goto(`http://localhost:${PORT}/`, { waitUntil:'domcontentloaded', timeout:30000 });
  console.log('Waiting 14s...');
  await new Promise(r => setTimeout(r, 14000));
  
  await page.evaluate(() => {
    window._forceTimeMin = 150;
    window._forceLocation = { lat:21.4225, lon:39.8262, name:'Makkah' };
  });
  await new Promise(r => setTimeout(r, 3000));

  // Inject overlay with SVG nav icons
  await page.evaluate(async () => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    await new Promise(r => setTimeout(r, 3000));

    // Nuclear hide
    document.body.classList.add('chrome-hidden');
    document.querySelectorAll('body > *:not(canvas):not(.poster-overlay)').forEach(el => {
      if (!el.classList.contains('poster-overlay')) el.style.display = 'none';
    });
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.display = 'block'; canvas.style.position = 'fixed';
      canvas.style.top = '0'; canvas.style.left = '0';
      canvas.style.width = '100vw'; canvas.style.height = '100vh'; canvas.style.zIndex = '0';
    }

    // Title
    const titleEl = document.createElement('div');
    titleEl.className = 'poster-overlay';
    titleEl.style.cssText = 'position:fixed; top:10%; left:0; width:100%; text-align:center; z-index:9999; pointer-events:none; font-family:"Instrument Serif",serif; font-size:2.8rem; font-weight:400; letter-spacing:-0.02em; color:rgba(232,228,220,0.9); line-height:1.1;';
    titleEl.textContent = 'a Gift of Time.';
    document.body.appendChild(titleEl);

    // Subtitle
    const subEl = document.createElement('div');
    subEl.className = 'poster-overlay';
    subEl.style.cssText = 'position:fixed; top:calc(10% + 3.8rem); left:0; width:100%; text-align:center; z-index:9999; pointer-events:none; font-family:"Instrument Serif",serif; font-size:0.85rem; font-weight:400; color:rgba(232,228,220,0.4); padding:0 15%;';
    subEl.textContent = 'seek the night of decree.';
    document.body.appendChild(subEl);

    // Section label
    const labelEl = document.createElement('div');
    labelEl.className = 'poster-overlay';
    labelEl.style.cssText = 'position:fixed; bottom:13%; left:0; width:100%; text-align:center; z-index:9999; pointer-events:none; font-family:system-ui,sans-serif; font-size:0.75rem; font-weight:400; letter-spacing:0.35em; color:rgba(232,228,220,0.3); text-transform:uppercase;';
    labelEl.textContent = 'CLOCK';
    document.body.appendChild(labelEl);

    // SVG Nav icons — 28px each, consistent sizing
    const navEl = document.createElement('div');
    navEl.className = 'poster-overlay';
    navEl.style.cssText = 'position:fixed; bottom:8%; left:0; width:100%; text-align:center; z-index:9999; pointer-events:none; display:flex; justify-content:center; align-items:center; gap:2.5rem;';
    const SZ = 28, SW = 1.5;
    const svgIcons = [
      `<svg width="${SZ}" height="${SZ}" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="none" stroke="STROKE" stroke-width="${SW}"/></svg>`,
      `<svg width="${SZ}" height="${SZ}" viewBox="0 0 28 28"><rect x="5" y="5" width="18" height="18" rx="2" fill="none" stroke="STROKE" stroke-width="${SW}" transform="rotate(45 14 14)"/></svg>`,
      `<svg width="${SZ}" height="${SZ}" viewBox="0 0 28 28"><polygon points="14,3 26,25 2,25" fill="none" stroke="STROKE" stroke-width="${SW}"/></svg>`,
    ];
    const activeIdx = 0; // clock active
    svgIcons.forEach((svg, i) => {
      const span = document.createElement('span');
      const isActive = (i === activeIdx);
      const color = isActive ? 'rgba(232,228,220,1)' : 'rgba(232,228,220,0.3)';
      span.innerHTML = svg.replace(/STROKE/g, color);
      if (isActive) span.style.filter = 'drop-shadow(0 0 8px rgba(232,228,220,0.5))';
      navEl.appendChild(span);
    });
    document.body.appendChild(navEl);
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/home/openclaw-agent/.openclaw/workspace/test-nav-icons.png', type: 'png' });
  console.log('Done — test-nav-icons.png');

  await browser.close();
  server.close();
}
main().catch(e => { console.error(e); process.exit(1); });
