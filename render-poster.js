const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');

(async () => {
  // Start local server
  const server = require('child_process').spawn('python3', ['-m', 'http.server', '7780'], {
    cwd: '/home/tawfeeq/ramadan-clock-site/',
    env: { ...process.env },
    stdio: 'ignore',
    detached: true
  });
  server.unref();
  
  // Wait for server to start
  await new Promise(r => setTimeout(r, 2000));

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu-sandbox',
      '--use-gl=angle',
      '--use-angle=gl-egl',
      '--ozone-platform=headless',
      '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage',
      '--in-process-gpu',
      '--enable-webgl'
    ],
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || '')
    }
  });

  const page = await browser.newPage();
  
  // 3x DPR for maximum sharpness
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 3 });
  await page.emulateTimezone('Asia/Riyadh');

  // Navigate
  await page.goto('http://localhost:7780/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Force Isha time (1200 min = 20:00)
  await page.evaluate(() => {
    window._forceTimeMin = 1200;
  });

  // Wait for Three.js + HDRI to load
  console.log('Waiting 14s for scene load...');
  await new Promise(r => setTimeout(r, 14000));

  // Hide chrome, lock seconds
  await page.evaluate(() => {
    document.body.classList.add('chrome-hidden');
    
    // Lock second hand at 0
    Date.prototype.getSeconds = function() { return 0; };
    Date.prototype.getMilliseconds = function() { return 0; };
  });

  // Wait for lighting to settle
  console.log('Waiting 3s for lighting settle...');
  await new Promise(r => setTimeout(r, 3000));

  // Inject poster typography overlay
  await page.evaluate(() => {
    // Load Instrument Serif
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  });

  // Wait for font to load
  await new Promise(r => setTimeout(r, 3000));

  // Add typography overlay
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.id = 'poster-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    
    // Title
    const title = document.createElement('div');
    title.textContent = 'a Gift of Time.';
    title.style.cssText = `
      position:absolute; top:10%; left:0; width:100%; text-align:center;
      font-family:'Instrument Serif',serif; font-size:2.8rem; font-weight:400;
      letter-spacing:-0.02em; color:rgba(232,228,220,0.9);
    `;
    overlay.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('div');
    subtitle.textContent = 'a study in light, time, orientation and a call to prayer.';
    subtitle.style.cssText = `
      position:absolute; top:calc(10% + 3.5rem); left:0; width:100%; text-align:center;
      font-family:'Instrument Serif',serif; font-size:0.85rem; font-weight:400;
      color:rgba(232,228,220,0.4);
    `;
    overlay.appendChild(subtitle);

    // Section label
    const section = document.createElement('div');
    section.textContent = 'CLOCK';
    section.style.cssText = `
      position:absolute; bottom:12%; left:0; width:100%; text-align:center;
      font-family:system-ui,sans-serif; font-size:0.65rem; font-weight:400;
      letter-spacing:0.35em; color:rgba(232,228,220,0.3);
    `;
    overlay.appendChild(section);

    // Nav dots
    const nav = document.createElement('div');
    nav.style.cssText = `
      position:absolute; bottom:8%; left:0; width:100%; text-align:center;
      font-size:0.9rem; letter-spacing:0.5em;
    `;
    
    const circle = document.createElement('span');
    circle.textContent = '○';
    circle.style.cssText = 'color:rgba(232,228,220,1); text-shadow:0 0 8px rgba(232,228,220,0.6);';
    
    const diamond = document.createElement('span');
    diamond.textContent = ' ◇';
    diamond.style.cssText = 'color:rgba(232,228,220,0.3);';
    
    const triangle = document.createElement('span');
    triangle.textContent = ' △';
    triangle.style.cssText = 'color:rgba(232,228,220,0.3);';
    
    nav.appendChild(circle);
    nav.appendChild(diamond);
    nav.appendChild(triangle);
    overlay.appendChild(nav);

    document.body.appendChild(overlay);
  });

  // Brief settle for overlay render
  await new Promise(r => setTimeout(r, 500));

  // Screenshot
  const outputPath = '/home/openclaw-agent/.openclaw/workspace/poster-clock-clean.png';
  await page.screenshot({ path: outputPath, type: 'png' });
  console.log('Clean poster saved to:', outputPath);

  // Check renderer
  const renderer = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return 'NO WEBGL';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'no debug info';
  });
  console.log('GPU Renderer:', renderer);

  await browser.close();
  
  // Kill server
  try { process.kill(-server.pid); } catch(e) {}
  
  console.log('Done!');
})().catch(e => { console.error(e); process.exit(1); });
