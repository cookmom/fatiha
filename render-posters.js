const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_DIR = '/home/tawfeeq/ramadan-clock-site';
const OUTPUT_DIR = '/home/openclaw-agent/.openclaw/workspace';
const PORT = 9922;

// Start a simple static file server
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
    server.listen(PORT, () => { console.log(`Server on ${PORT}`); resolve(server); });
  });
}

// Common overlay injection JS
function getOverlayJS(config) {
  const { title, titleSize, subtitle, sectionLabel, navActive, showNav, showUrl } = config;
  
  return `
    // Load Instrument Serif
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    await new Promise(r => setTimeout(r, 3000));

    // NUCLEAR HIDE — kill ALL chrome
    document.body.classList.add('chrome-hidden');
    document.querySelectorAll('#prayer-bar, #countdown, #version-tag, #hijri-header, .prayer-dots, .nav-pill, #compass-btn, #dev-panel, .overlay, #splash, .swipe-hint, [id*="version"], [id*="countdown"], #prayer-times-panel, #settings-panel, .bottom-sheet, #toast, .toast, #debug, .debug').forEach(el => el.style.display = 'none');
    // Nuclear: hide everything except canvas
    document.querySelectorAll('body > *:not(canvas):not(.poster-overlay)').forEach(el => {
      if (!el.classList.contains('poster-overlay')) el.style.display = 'none';
    });
    // Re-show canvas
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.display = 'block';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.zIndex = '0';
    }

    // Title
    const titleEl = document.createElement('div');
    titleEl.className = 'poster-overlay';
    titleEl.style.cssText = 'position:fixed; top:10%; left:0; width:100%; text-align:center; z-index:9999; pointer-events:none; font-family:"Instrument Serif",serif; font-size:${titleSize || '2.8rem'}; font-weight:400; letter-spacing:-0.02em; color:rgba(232,228,220,0.9); line-height:1.1;';
    titleEl.textContent = ${JSON.stringify(title)};
    document.body.appendChild(titleEl);

    // Subtitle
    ${subtitle ? `
    const subEl = document.createElement('div');
    subEl.className = 'poster-overlay';
    subEl.style.cssText = 'position:fixed; top:calc(10% + ${titleSize === '3.5rem' ? '4.5rem' : '3.8rem'}); left:0; width:100%; text-align:center; z-index:9999; pointer-events:none; font-family:"Instrument Serif",serif; font-size:0.85rem; font-weight:400; color:rgba(232,228,220,0.4); padding:0 15%;';
    subEl.textContent = ${JSON.stringify(subtitle)};
    document.body.appendChild(subEl);
    ` : ''}

    // Section label
    ${sectionLabel ? `
    const labelEl = document.createElement('div');
    labelEl.className = 'poster-overlay';
    labelEl.style.cssText = 'position:fixed; bottom:13%; left:0; width:100%; text-align:center; z-index:9999; pointer-events:none; font-family:system-ui,sans-serif; font-size:0.75rem; font-weight:400; letter-spacing:0.35em; color:rgba(232,228,220,0.3); text-transform:uppercase;';
    labelEl.textContent = ${JSON.stringify(sectionLabel)};
    document.body.appendChild(labelEl);
    ` : ''}

    // Nav icons — SVG for consistent sizing (28px each)
    ${showNav ? `
    const navEl = document.createElement('div');
    navEl.className = 'poster-overlay';
    navEl.style.cssText = 'position:fixed; bottom:8%; left:0; width:100%; text-align:center; z-index:9999; pointer-events:none; display:flex; justify-content:center; align-items:center; gap:2.5rem;';
    const SZ = 28; const SW = 1.5;
    const svgIcons = [
      '<svg width="'+SZ+'" height="'+SZ+'" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="none" stroke="STROKE" stroke-width="'+SW+'"/></svg>',
      '<svg width="'+SZ+'" height="'+SZ+'" viewBox="0 0 28 28"><rect x="5" y="5" width="18" height="18" rx="2" fill="none" stroke="STROKE" stroke-width="'+SW+'" transform="rotate(45 14 14)"/></svg>',
      '<svg width="'+SZ+'" height="'+SZ+'" viewBox="0 0 28 28"><polygon points="14,3 26,25 2,25" fill="none" stroke="STROKE" stroke-width="'+SW+'"/></svg>',
    ];
    const activeIdx = ${navActive};
    svgIcons.forEach((svg, i) => {
      const span = document.createElement('span');
      const isActive = (i === activeIdx);
      const color = isActive ? 'rgba(232,228,220,1)' : 'rgba(232,228,220,0.3)';
      span.innerHTML = svg.replace(/STROKE/g, color);
      if (isActive) span.style.filter = 'drop-shadow(0 0 8px rgba(232,228,220,0.5))';
      navEl.appendChild(span);
    });
    document.body.appendChild(navEl);
    ` : ''}

    // URL at bottom
    ${showUrl ? `
    const urlEl = document.createElement('div');
    urlEl.className = 'poster-overlay';
    urlEl.style.cssText = 'position:fixed; bottom:5%; left:0; width:100%; text-align:center; z-index:9999; pointer-events:none; font-family:system-ui,sans-serif; font-size:0.7rem; font-weight:400; letter-spacing:0.2em; color:rgba(232,228,220,0.25);';
    urlEl.textContent = 'agiftoftime.app';
    document.body.appendChild(urlEl);
    ` : ''}
  `;
}

const POSTERS = [
  {
    name: 'poster-clock-isha',
    forceTimeMin: 1200,
    overlay: { title: 'a Gift of Time.', subtitle: 'a study in light, time, orientation and a call to prayer.', sectionLabel: 'CLOCK', navActive: 0, showNav: true },
  },
  {
    name: 'poster-clock-maghrib',
    forceTimeMin: 1100,
    overlay: { title: 'a Gift of Time.', subtitle: 'a study in light, time, orientation and a call to prayer.', sectionLabel: 'CLOCK', navActive: 0, showNav: true },
  },
  {
    name: 'poster-clock-fajr',
    forceTimeMin: 350,
    overlay: { title: 'a Gift of Time.', subtitle: 'a study in light, time, orientation and a call to prayer.', sectionLabel: 'CLOCK', navActive: 0, showNav: true },
  },
  {
    name: 'poster-clock-qiyam',
    forceTimeMin: 180,
    overlay: { title: 'a Gift of Time.', subtitle: 'a study in light, time, orientation and a call to prayer.', sectionLabel: 'CLOCK', navActive: 0, showNav: true },
  },
  {
    name: 'poster-compass',
    forceTimeMin: 1200,
    compass: true,
    overlay: { title: 'a Gift of Time.', subtitle: "turn towards what's best for you.", sectionLabel: 'COMPASS', navActive: 1, showNav: true },
  },
  {
    name: 'poster-title',
    forceTimeMin: 1200,
    overlay: { title: 'a Gift of Time.', titleSize: '3.5rem', subtitle: 'a study in light, time, orientation and a call to prayer.', showNav: false, showUrl: true },
  },
];

async function renderPoster(browser, poster) {
  console.log(`\n=== Rendering ${poster.name} ===`);
  const page = await browser.newPage();
  
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 3 });
  await page.emulateTimezone('Asia/Riyadh');

  // Monkey-patch Date to lock second hand at 0
  await page.evaluateOnNewDocument(() => {
    Date.prototype.getSeconds = function() { return 0; };
    Date.prototype.getMilliseconds = function() { return 0; };
  });

  // Set force time BEFORE page loads
  await page.evaluateOnNewDocument((forceMin) => {
    window._forceTimeMin = forceMin;
  }, poster.forceTimeMin);

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for Three.js + HDRI
  console.log('  Waiting 14s for scene load...');
  await new Promise(r => setTimeout(r, 14000));

  // Set force time again (in case it was overwritten)
  await page.evaluate((forceMin) => {
    window._forceTimeMin = forceMin;
  }, poster.forceTimeMin);

  // Wait 3s for lighting to settle
  console.log('  Waiting 3s for lighting...');
  await new Promise(r => setTimeout(r, 3000));

  // Compass mode
  if (poster.compass) {
    console.log('  Activating compass mode...');
    await page.evaluate(() => {
      if (window._toggleCompassMode) window._toggleCompassMode(true);
      window._compassLocked = true;
      // Set heading toward qibla from Riyadh (~245°)
      if (typeof window._compassHeading !== 'undefined') window._compassHeading = 245;
    });
    await new Promise(r => setTimeout(r, 2000));
  }

  // Inject overlay
  console.log('  Injecting overlay...');
  await page.evaluate(async (overlayJS) => {
    await (new Function('return (async () => {' + overlayJS + '})()'))();
  }, getOverlayJS(poster.overlay));

  // Extra wait for font rendering
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot
  const outputPath = path.join(OUTPUT_DIR, `${poster.name}.png`);
  await page.screenshot({ path: outputPath, type: 'png' });
  console.log(`  Saved: ${outputPath}`);

  // Check console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  Console error: ${msg.text()}`);
  });

  await page.close();
  return outputPath;
}

async function main() {
  const server = await startServer();
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: [
      '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
      '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
      '--in-process-gpu', '--enable-webgl',
    ],
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || ''),
    },
  });

  console.log('Browser launched');

  // Verify GPU
  const testPage = await browser.newPage();
  await testPage.goto('chrome://gpu', { waitUntil: 'domcontentloaded' });
  const gpuInfo = await testPage.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('GPU info:', gpuInfo.substring(0, 200));
  await testPage.close();

  const rendered = [];
  for (const poster of POSTERS) {
    try {
      const p = await renderPoster(browser, poster);
      rendered.push(p);
    } catch (err) {
      console.error(`FAILED ${poster.name}:`, err.message);
    }
  }

  await browser.close();
  server.close();

  console.log(`\n=== Rendered ${rendered.length}/${POSTERS.length} posters ===`);
  return rendered;
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
