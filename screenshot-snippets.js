const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: [
      '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
      '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
      '--in-process-gpu', '--enable-webgl'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 860, height: 2000, deviceScaleFactor: 2 });

  const htmlPath = path.resolve(__dirname, 'code-snippets.html');
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
  // Wait for fonts to load
  await new Promise(r => setTimeout(r, 3000));

  const outDir = __dirname;
  const cards = [
    { id: 'card-dichroic', file: 'code-snippet-dichroic.png' },
    { id: 'card-prayer', file: 'code-snippet-prayer.png' },
    { id: 'card-iridescence', file: 'code-snippet-iridescence.png' },
  ];

  for (const card of cards) {
    const el = await page.$('#' + card.id);
    if (el) {
      await el.screenshot({ path: path.join(outDir, card.file), type: 'png' });
      console.log('Saved', card.file);
    } else {
      console.error('NOT FOUND:', card.id);
    }
  }

  // Combined: screenshot the full page content area
  // Clip to just the cards area
  const body = await page.$('body');
  const bbox = await body.boundingBox();
  await page.screenshot({
    path: path.join(outDir, 'code-snippets-combined.png'),
    type: 'png',
    clip: { x: 0, y: 0, width: bbox.width, height: bbox.height }
  });
  console.log('Saved code-snippets-combined.png');

  await browser.close();
  console.log('Done!');
})();
