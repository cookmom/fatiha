const puppeteer = require('puppeteer-core');

const FONTS = [
  {
    name: 'Libre Caslon Display',
    file: 'font-7-libre-caslon-display.png',
    url: 'https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&display=swap',
    family: "'Libre Caslon Display', serif",
    letterSpacing: '0.02em',
    weight: 400,
    extraStyle: '',
  },
  {
    name: 'Bodoni Moda',
    file: 'font-8-bodoni-moda.png',
    url: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400&display=swap',
    family: "'Bodoni Moda', serif",
    letterSpacing: '0.06em',
    weight: 400,
    extraStyle: '',
  },
  {
    name: 'Fraunces',
    file: 'font-9-fraunces.png',
    url: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300&display=swap',
    family: "'Fraunces', serif",
    letterSpacing: '-0.01em',
    weight: 300,
    extraStyle: "font-variation-settings: 'opsz' 72;",
  },
  {
    name: 'Lora',
    file: 'font-10-lora.png',
    url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400&display=swap',
    family: "'Lora', serif",
    letterSpacing: '0.01em',
    weight: 400,
    extraStyle: '',
  },
];

const OUTPUT_DIR = '/home/openclaw-agent/.openclaw/workspace';

(async () => {
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
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib' + (process.env.LD_LIBRARY_PATH ? ':' + process.env.LD_LIBRARY_PATH : ''),
    },
  });

  for (const font of FONTS) {
    console.log(`\n=== Rendering: ${font.name} ===`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1290, height: 2796, deviceScaleFactor: 1 });
    await page.emulateTimezone('Asia/Riyadh');

    await page.goto('http://localhost:7746/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Set forced time and hide chrome
    await page.evaluate(() => {
      window._forceTimeMin = 1200;
      document.body.classList.add('chrome-hidden');
    });

    // Wait for Three.js + HDRI to load
    console.log('  Waiting 14s for scene...');
    await new Promise(r => setTimeout(r, 14000));

    // Wait for lighting to settle after forceTimeMin
    console.log('  Waiting 3s for lighting...');
    await new Promise(r => setTimeout(r, 3000));

    // Inject Google Font
    console.log(`  Loading font: ${font.name}...`);
    await page.evaluate(async (fontUrl) => {
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      await new Promise(r => setTimeout(r, 3000));
    }, font.url);

    // Remove any existing title overlay, then inject styled title
    await page.evaluate((f) => {
      // Remove existing title elements
      document.querySelectorAll('.font-test-overlay').forEach(e => e.remove());

      // Title container
      const container = document.createElement('div');
      container.className = 'font-test-overlay';
      container.style.cssText = `
        position: fixed; top: 12%; left: 0; right: 0; z-index: 9998;
        text-align: center; pointer-events: none;
      `;

      // Main title
      const title = document.createElement('div');
      title.textContent = 'A Gift of Time.';
      title.style.cssText = `
        font-family: ${f.family};
        font-size: clamp(5.3rem, 14.4vw, 9.1rem);
        font-weight: ${f.weight};
        letter-spacing: ${f.letterSpacing};
        color: rgba(232, 228, 220, 0.9);
        line-height: 1.1;
        ${f.extraStyle}
      `;
      container.appendChild(title);

      // Subtitle
      const sub = document.createElement('div');
      sub.textContent = 'a study in light, time, orientation and a call to prayer.';
      sub.style.cssText = `
        font-family: ${f.family};
        font-size: 18px;
        font-weight: 300;
        color: rgba(232, 228, 220, 0.5);
        margin-top: 20px;
        letter-spacing: 0.03em;
        ${f.extraStyle}
      `;
      container.appendChild(sub);

      document.body.appendChild(container);

      // Font label
      const label = document.createElement('div');
      label.className = 'font-test-overlay';
      label.textContent = f.name;
      label.style.cssText = 'position:fixed;bottom:40px;left:40px;font-family:system-ui;font-size:14px;color:rgba(255,255,255,0.4);z-index:9999;pointer-events:none;letter-spacing:2px;text-transform:uppercase;';
      document.body.appendChild(label);
    }, { family: font.family, weight: font.weight, letterSpacing: font.letterSpacing, extraStyle: font.extraStyle, name: font.name });

    // Small extra wait for font rendering
    await new Promise(r => setTimeout(r, 1000));

    const outPath = `${OUTPUT_DIR}/${font.file}`;
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`  Saved: ${outPath}`);

    await page.close();
  }

  await browser.close();
  console.log('\nDone! All 4 font screenshots rendered.');
})().catch(err => { console.error(err); process.exit(1); });
