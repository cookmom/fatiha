// بسم الله الرحمن الرحيم
// render-posters-final.js — Re-render ALL posters with correct Makkah prayer times + real nav pill
const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_DIR = '/home/tawfeeq/ramadan-clock-site';
const OUTPUT_DIR = '/home/openclaw-agent/.openclaw/workspace';
const PORT = 9923;

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
    server.listen(PORT, () => { console.log(`Server on port ${PORT}`); resolve(server); });
  });
}

// Build overlay JS — surgical chrome hiding, real nav pill preserved
function getOverlayJS(config) {
  const { title, titleSize, subtitle, sectionLabel, showUrl } = config;
  const ts = titleSize || '2.8rem';
  // Offset subtitle below title based on title size
  const subTop = titleSize === '3.5rem' ? 'calc(10% + 4.8rem)' : 'calc(10% + 3.8rem)';

  return `
    // Load Instrument Serif from Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    // Wait for font to load
    await new Promise(r => setTimeout(r, 3000));

    // Nuclear hide — hide ALL body children EXCEPT canvas and .nav-pill
    document.body.classList.add('chrome-hidden');
    document.querySelectorAll('body > *').forEach(el => {
      if (el.tagName === 'CANVAS') return;
      if (el.classList && el.classList.contains('mode-pill')) return;
      if (el.id === 'modePill') return;
      if (el.classList && el.classList.contains('mode-label')) return;
      if (el.id === 'modeLabel') return;
      if (el.classList && el.classList.contains('poster-overlay')) return;
      el.style.display = 'none';
    });
    // Also hide any overlays/panels inside remaining visible containers
    document.querySelectorAll('.overlay, #splash, .bottom-sheet, #prayer-times-panel, #settings-panel, #dev-panel, [id*="version"], [id*="countdown"]').forEach(el => el.style.display = 'none');

    // Ensure canvas fills screen
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
    // Ensure mode pill + label are visible (override chrome-hidden CSS)
    const pill = document.querySelector('.mode-pill') || document.getElementById('modePill');
    if (pill) {
      pill.style.setProperty('display', 'flex', 'important');
      pill.style.setProperty('opacity', '1', 'important');
      pill.style.setProperty('pointer-events', 'auto', 'important');
      pill.style.zIndex = '999';
    }
    const modeLabel = document.querySelector('.mode-label') || document.getElementById('modeLabel');
    if (modeLabel) {
      modeLabel.style.setProperty('display', 'block', 'important');
      modeLabel.style.setProperty('opacity', '1', 'important');
    }

    // Title overlay
    const existingOverlays = document.querySelectorAll('.poster-overlay');
    existingOverlays.forEach(el => el.remove());

    const titleEl = document.createElement('div');
    titleEl.className = 'poster-overlay';
    titleEl.style.cssText = [
      'position:fixed', 'top:10%', 'left:0', 'width:100%',
      'text-align:center', 'z-index:9999', 'pointer-events:none',
      'font-family:"Instrument Serif",serif',
      'font-size:' + ${JSON.stringify(ts)},
      'font-weight:400', 'letter-spacing:-0.02em',
      'color:rgba(232,228,220,0.9)', 'line-height:1.1'
    ].join(';') + ';';
    titleEl.textContent = ${JSON.stringify(title)};
    document.body.appendChild(titleEl);

    ${subtitle ? `
    // Subtitle
    const subEl = document.createElement('div');
    subEl.className = 'poster-overlay';
    subEl.style.cssText = [
      'position:fixed', 'top:' + ${JSON.stringify(subTop)}, 'left:0', 'width:100%',
      'text-align:center', 'z-index:9999', 'pointer-events:none',
      'font-family:"Instrument Serif",serif',
      'font-size:0.85rem', 'font-weight:400',
      'color:rgba(232,228,220,0.4)',
      'padding:0 15%', 'box-sizing:border-box'
    ].join(';') + ';';
    subEl.textContent = ${JSON.stringify(subtitle)};
    document.body.appendChild(subEl);
    ` : ''}

    ${sectionLabel ? `
    // Section label (e.g. CLOCK / COMPASS)
    const labelEl = document.createElement('div');
    labelEl.className = 'poster-overlay';
    labelEl.style.cssText = [
      'position:fixed', 'bottom:13%', 'left:0', 'width:100%',
      'text-align:center', 'z-index:9999', 'pointer-events:none',
      'font-family:system-ui,sans-serif',
      'font-size:0.75rem', 'font-weight:400',
      'letter-spacing:0.35em',
      'color:rgba(232,228,220,0.3)',
      'text-transform:uppercase'
    ].join(';') + ';';
    labelEl.textContent = ${JSON.stringify(sectionLabel)};
    document.body.appendChild(labelEl);
    ` : ''}

    ${showUrl ? `
    // URL watermark
    const urlEl = document.createElement('div');
    urlEl.className = 'poster-overlay';
    urlEl.style.cssText = [
      'position:fixed', 'bottom:5%', 'left:0', 'width:100%',
      'text-align:center', 'z-index:9999', 'pointer-events:none',
      'font-family:system-ui,sans-serif',
      'font-size:0.7rem', 'font-weight:400',
      'letter-spacing:0.2em',
      'color:rgba(232,228,220,0.25)'
    ].join(';') + ';';
    urlEl.textContent = 'agiftoftime.app';
    document.body.appendChild(urlEl);
    ` : ''}
  `;
}

// Poster definitions — 12 total, correct Makkah prayer times (March 12, 2026)
// Prayer times reference: Fajr 316, Sunrise 392, Dhuhr 750, Asr 953, Maghrib 1109, Isha 1229
// Last Third: 151 min (2:31 AM) → Fajr (316)
const POSTERS = [
  // ---- CLOCK posters ----
  {
    name: 'poster-clock-fajr',
    forceTimeMin: 350, // 5:50 AM — middle of Fajr window (316–392)
    overlay: {
      title: 'a Gift of Time.',
      subtitle: 'a study in light, time, orientation and a call to prayer.',
      sectionLabel: null,
    },
  },
  {
    name: 'poster-clock-dhuha',
    forceTimeMin: 570, // 9:30 AM — Dhuha / mid-morning
    overlay: {
      title: 'a Gift of Time.',
      subtitle: 'a study in light, time, orientation and a call to prayer.',
      sectionLabel: null,
    },
  },
  {
    name: 'poster-clock-dhuhr',
    forceTimeMin: 850, // 2:10 PM — middle of Dhuhr window (750–953)
    overlay: {
      title: 'a Gift of Time.',
      subtitle: 'a study in light, time, orientation and a call to prayer.',
      sectionLabel: null,
    },
  },
  {
    name: 'poster-clock-asr',
    forceTimeMin: 1030, // 5:10 PM — middle of Asr window (953–1109)
    overlay: {
      title: 'a Gift of Time.',
      subtitle: 'a study in light, time, orientation and a call to prayer.',
      sectionLabel: null,
    },
  },
  {
    name: 'poster-clock-maghrib',
    forceTimeMin: 1120, // 6:40 PM — middle of Maghrib window
    overlay: {
      title: 'a Gift of Time.',
      subtitle: 'a study in light, time, orientation and a call to prayer.',
      sectionLabel: null,
    },
  },
  {
    name: 'poster-clock-isha',
    forceTimeMin: 1300, // 9:40 PM — middle of Isha window (1229–1440)
    overlay: {
      title: 'a Gift of Time.',
      subtitle: 'a study in light, time, orientation and a call to prayer.',
      sectionLabel: null,
    },
  },
  {
    name: 'poster-clock-qiyam',
    forceTimeMin: 90, // 1:30 AM — Qiyam / midnight watch
    overlay: {
      title: 'a Gift of Time.',
      subtitle: 'a study in light, time, orientation and a call to prayer.',
      sectionLabel: null,
    },
  },
  // ---- LAST THIRD posters ----
  {
    name: 'poster-lastthird-early',
    forceTimeMin: 180, // 3:00 AM — early Last Third (starts 151 min)
    overlay: {
      title: 'a Gift of Time.',
      subtitle: 'seek the night of decree.',
      sectionLabel: null,
    },
  },
  {
    name: 'poster-lastthird-mid',
    forceTimeMin: 230, // 3:50 AM — mid Last Third
    overlay: {
      title: 'a Gift of Time.',
      subtitle: 'seek the night of decree.',
      sectionLabel: null,
    },
  },
  {
    name: 'poster-lastthird-late',
    forceTimeMin: 300, // 5:00 AM — late Last Third, approaching Fajr (316)
    overlay: {
      title: 'a Gift of Time.',
      subtitle: 'a study in light, time, orientation and a call to prayer.',
      sectionLabel: null,
    },
  },
  // ---- SPECIAL posters ----
  {
    name: 'poster-compass',
    forceTimeMin: 1300, // Isha
    compass: true,
    overlay: {
      title: 'a Gift of Time.',
      subtitle: "turn towards what's best for you.",
      sectionLabel: null,
    },
  },
  {
    name: 'poster-title',
    forceTimeMin: 1300, // Isha
    overlay: {
      title: 'a Gift of Time.',
      titleSize: '3.5rem',
      subtitle: 'a study in light, time, orientation and a call to prayer.',
      showUrl: true,
    },
  },
];

async function renderPoster(browser, poster) {
  console.log(`\n=== Rendering ${poster.name} (forceTimeMin=${poster.forceTimeMin}) ===`);
  const page = await browser.newPage();

  // Log console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  [console.error] ${msg.text()}`);
  });
  page.on('pageerror', err => console.log(`  [pageerror] ${err.message}`));

  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 3 });
  await page.emulateTimezone('Asia/Riyadh');

  // Set globals BEFORE page loads
  await page.evaluateOnNewDocument((forceMin) => {
    Date.prototype.getSeconds = function() { return 0; };
    Date.prototype.getMilliseconds = function() { return 0; };
    window._forceTimeMin = forceMin;
    // Pre-set localStorage so app reads Makkah location on init
    try { localStorage.setItem('agot_loc', JSON.stringify({lat:21.4225, lon:39.8262, name:'Makkah', tz:'Asia/Riyadh'})); } catch(e){}
  }, poster.forceTimeMin);

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for Three.js + HDRI to load
  console.log('  Waiting 14s for Three.js + HDRI...');
  await new Promise(r => setTimeout(r, 14000));

  // Call _setPrayerLocation directly — this is how the app actually sets location
  await page.evaluate(() => {
    if(window._setPrayerLocation) window._setPrayerLocation(21.4225, 39.8262, 'Makkah');
  });
  
  // Wait for prayer times to fetch + settle
  console.log('  Waiting 5s for prayer times...');
  await new Promise(r => setTimeout(r, 5000));

  // Pin forceTimeMin — app clears it to null after each display cycle (line 3794)
  // Use setInterval to keep it locked
  await page.evaluate((forceMin) => {
    window._forceTimeMin = forceMin;
    window.__pinInterval = setInterval(() => { window._forceTimeMin = forceMin; }, 100);
  }, poster.forceTimeMin);

  // Wait for lighting + prayer display to settle with pinned time
  console.log('  Waiting 5s for lighting to settle with pinned time...');
  await new Promise(r => setTimeout(r, 5000));

  // Activate compass mode if needed
  if (poster.compass) {
    console.log('  Activating compass mode...');
    await page.evaluate(() => {
      if (window._toggleCompassMode) window._toggleCompassMode(true);
      window._compassLocked = true;
      window._compassHeading = 245; // Qibla bearing from Makkah
    });
    await new Promise(r => setTimeout(r, 2000));
  }

  // Inject overlay (font + typography + chrome hiding)
  console.log('  Injecting overlay + hiding chrome (preserving nav pill)...');
  await page.evaluate(async (overlayJS) => {
    await (new Function('return (async () => {' + overlayJS + '})()'))();
  }, getOverlayJS(poster.overlay));

  // Extra settle time after overlay injection
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot
  const outputPath = path.join(OUTPUT_DIR, `${poster.name}.png`);
  await page.screenshot({ path: outputPath, type: 'png' });
  const stat = fs.statSync(outputPath);
  console.log(`  Saved: ${outputPath} (${(stat.size / 1024).toFixed(1)} KB)`);

  await page.close();
  return outputPath;
}

async function addGrain(inputPath) {
  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath, '.png');
  const outputPath = path.join(dir, `${base}-grain.png`);
  execSync(`ffmpeg -i "${inputPath}" -vf "noise=alls=6:allf=t" -y "${outputPath}"`, { stdio: 'pipe' });
  const stat = fs.statSync(outputPath);
  console.log(`  Grain: ${outputPath} (${(stat.size / 1024).toFixed(1)} KB)`);
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

  console.log('Browser launched. Verifying GPU...');
  const testPage = await browser.newPage();
  await testPage.goto('chrome://gpu', { waitUntil: 'domcontentloaded' });
  const gpuInfo = await testPage.evaluate(() => {
    const lines = document.body.innerText.split('\n').filter(l => l.includes('GL_RENDERER') || l.includes('GL_VERSION') || l.includes('Renderer'));
    return lines.slice(0, 3).join(' | ');
  });
  console.log('GPU:', gpuInfo);
  await testPage.close();

  const cleanFiles = [];
  const grainFiles = [];

  for (const poster of POSTERS) {
    try {
      const cleanPath = await renderPoster(browser, poster);
      cleanFiles.push(cleanPath);

      const grainPath = await addGrain(cleanPath);
      grainFiles.push(grainPath);
    } catch (err) {
      console.error(`FAILED ${poster.name}:`, err.message);
      console.error(err.stack);
    }
  }

  await browser.close();
  server.close();

  console.log('\n=============================');
  console.log(`=== DONE: ${cleanFiles.length} clean + ${grainFiles.length} grain ===`);
  console.log('=============================\n');

  const allFiles = [...cleanFiles, ...grainFiles].sort();
  for (const f of allFiles) {
    try {
      const stat = fs.statSync(f);
      console.log(`  ${path.basename(f)}: ${(stat.size / 1024).toFixed(1)} KB`);
    } catch { console.log(`  ${path.basename(f)}: (stat failed)`); }
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
