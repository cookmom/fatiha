const puppeteer = require('puppeteer-core');

const OUTPUT_DIR = '/home/openclaw-agent/.openclaw/workspace/';
const SUBTITLE = 'a study in light, time, orientation and a call to prayer.';

// Each font hand-tuned for its best presentation
const fonts = [
  {
    name: 'Instrument Serif',
    hasItalic: true,
    weights: [400],
    titleWeight: 400,
    titleSpacing: '-0.03em',
    titleSize: 'clamp(5.3rem,14.4vw,9.1rem)',
    // Instrument Serif is warm and organic — let it breathe naturally, tight tracking
    subtitleFont: 'Instrument Serif',
    subtitleWeight: 400,
    subtitleStyle: 'italic',
    subtitleSpacing: '0.04em',
    subtitleSize: '1.15rem',
    subtitleOpacity: 0.38,
    subtitleTop: '24.5%',
    file: 'font-1-instrument-serif.png',
  },
  {
    name: 'Cormorant Garamond',
    hasItalic: true,
    weights: [300, 600],
    titleWeight: 300,
    titleSpacing: '0.06em',
    titleSize: 'clamp(5.6rem,15.2vw,9.6rem)',
    // Cormorant at 300 is ethereal — wide spacing lets the hairline strokes sing
    subtitleFont: 'Cormorant Garamond',
    subtitleWeight: 300,
    subtitleStyle: 'italic',
    subtitleSpacing: '0.08em',
    subtitleSize: '1.1rem',
    subtitleOpacity: 0.33,
    subtitleTop: '25%',
    file: 'font-2-cormorant-garamond.png',
  },
  {
    name: 'Playfair Display',
    hasItalic: true,
    weights: [400, 700],
    titleWeight: 700,
    titleSpacing: '-0.02em',
    titleSize: 'clamp(5rem,13.8vw,8.8rem)',
    // Playfair at 700 is bold editorial — tight tracking, dramatic thick/thin contrast
    subtitleFont: 'Playfair Display',
    subtitleWeight: 400,
    subtitleStyle: 'italic',
    subtitleSpacing: '0.02em',
    subtitleSize: '1.05rem',
    subtitleOpacity: 0.35,
    subtitleTop: '24%',
    file: 'font-3-playfair-display.png',
  },
  {
    name: 'DM Serif Display',
    hasItalic: true,
    weights: [400],
    titleWeight: 400,
    titleSpacing: '0.01em',
    titleSize: 'clamp(5.2rem,14vw,9rem)',
    // DM Serif Display is stately, classic — barely any spacing, let the forms speak
    subtitleFont: 'DM Serif Display',
    subtitleWeight: 400,
    subtitleStyle: 'italic',
    subtitleSpacing: '0.05em',
    subtitleSize: '1.1rem',
    subtitleOpacity: 0.35,
    subtitleTop: '24.5%',
    file: 'font-4-dm-serif-display.png',
  },
  {
    name: 'Bricolage Grotesque',
    weights: [200, 400],
    titleWeight: 200,
    titleSpacing: '-0.01em',
    titleSize: 'clamp(5.4rem,14.6vw,9.2rem)',
    // Bricolage at 200 is whisper-thin, modern — slight negative tracking keeps it cohesive
    subtitleFont: 'Bricolage Grotesque',
    subtitleWeight: 400,
    subtitleStyle: 'normal',
    subtitleSpacing: '0.12em',
    subtitleSize: '0.85rem',
    subtitleOpacity: 0.30,
    subtitleTop: '25%',
    file: 'font-5-bricolage-grotesque.png',
  },
  {
    name: 'Sora',
    weights: [200, 300],
    titleWeight: 200,
    titleSpacing: '0.14em',
    titleSize: 'clamp(4.8rem,13vw,8.2rem)',
    // Sora at 200 is geometric and airy — generous letter-spacing for that luxury sans feel
    subtitleFont: 'Sora',
    subtitleWeight: 300,
    subtitleStyle: 'normal',
    subtitleSpacing: '0.22em',
    subtitleSize: '0.8rem',
    subtitleOpacity: 0.28,
    subtitleTop: '25.5%',
    file: 'font-6-sora.png',
  },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
      '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
      '--in-process-gpu', '--enable-webgl',
    ],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1290, height: 2796, deviceScaleFactor: 1 });
  await page.emulateTimezone('Asia/Riyadh');

  for (const font of fonts) {
    console.log(`\n=== ${font.name} — w${font.titleWeight}, spacing: ${font.titleSpacing} ===`);

    await page.goto('http://localhost:7748/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('  Scene loading (13s)...');
    await new Promise(r => setTimeout(r, 13000));

    // Set location, hide chrome, dramatic Isha lighting
    await page.evaluate(() => {
      window._setLocation && window._setLocation(21.4225, 39.8262, 'Makkah');
      document.body.classList.add('chrome-hidden');
      window._forceTimeMin = 1200; // 8 PM
    });
    console.log('  Lighting settling (3s)...');
    await new Promise(r => setTimeout(r, 3000));

    // Load all needed weights for this font
    const fontFamily = font.name.replace(/ /g, '+');
    const weightsStr = font.weights.join(';');
    // Some fonts (Sora, Bricolage) don't have italic axis — use wght only
    // For fonts with italic, load a separate italic URL
    await page.evaluate(async (fontFamily, weightsStr, hasItalic) => {
      // Always load regular weights
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${weightsStr}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      // If font has italic, load italic variant too
      if (hasItalic) {
        const linkItal = document.createElement('link');
        linkItal.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:ital,wght@1,${weightsStr}&display=swap`;
        linkItal.rel = 'stylesheet';
        document.head.appendChild(linkItal);
      }
      // Wait for font network fetch + parse
      await new Promise(r => setTimeout(r, 4000));
      await document.fonts.ready;
    }, fontFamily, weightsStr, font.hasItalic || false);
    console.log('  Font loaded.');

    // Inject the composed title card
    await page.evaluate((f, subtitle) => {
      // Title
      const title = document.createElement('div');
      title.textContent = 'A Gift of Time.';
      title.style.cssText = [
        'position:fixed',
        'top:12%',
        'left:0', 'right:0',
        'text-align:center',
        `font-family:'${f.name}',serif`,
        `font-size:${f.titleSize}`,
        `font-weight:${f.titleWeight}`,
        `letter-spacing:${f.titleSpacing}`,
        'color:rgba(232,228,220,0.92)',
        'z-index:9999',
        'pointer-events:none',
        'line-height:1',
        'text-rendering:optimizeLegibility',
        '-webkit-font-smoothing:antialiased',
      ].join(';');
      document.body.appendChild(title);

      // Subtitle
      const sub = document.createElement('div');
      sub.textContent = subtitle;
      sub.style.cssText = [
        'position:fixed',
        `top:${f.subtitleTop}`,
        'left:10%', 'right:10%',
        'text-align:center',
        `font-family:'${f.subtitleFont}',serif`,
        `font-size:${f.subtitleSize}`,
        `font-weight:${f.subtitleWeight}`,
        `font-style:${f.subtitleStyle}`,
        `letter-spacing:${f.subtitleSpacing}`,
        `color:rgba(232,228,220,${f.subtitleOpacity})`,
        'z-index:9999',
        'pointer-events:none',
        'line-height:1.6',
        'text-rendering:optimizeLegibility',
        '-webkit-font-smoothing:antialiased',
      ].join(';');
      document.body.appendChild(sub);

      // Font name label — refined, minimal
      const label = document.createElement('div');
      label.textContent = f.name;
      label.style.cssText = [
        'position:fixed',
        'bottom:48px', 'left:48px',
        'font-family:system-ui,-apple-system,sans-serif',
        'font-size:11px',
        'font-weight:300',
        'color:rgba(255,255,255,0.25)',
        'z-index:9999',
        'pointer-events:none',
        'letter-spacing:3px',
        'text-transform:uppercase',
      ].join(';');
      document.body.appendChild(label);
    }, font, SUBTITLE);

    // Let everything settle and render
    await new Promise(r => setTimeout(r, 1500));

    const path = OUTPUT_DIR + font.file;
    await page.screenshot({ path, type: 'png' });
    console.log(`  ✓ Saved: ${font.file}`);
  }

  await browser.close();
  console.log('\n✅ All 6 title cards rendered.');
})().catch(e => { console.error(e); process.exit(1); });
