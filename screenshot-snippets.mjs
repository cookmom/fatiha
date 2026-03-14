import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'code-snippets.html');
const outDir = __dirname;

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  args: [
    '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=gl-egl',
    '--ozone-platform=headless', '--ignore-gpu-blocklist', '--disable-dev-shm-usage',
    '--in-process-gpu', '--enable-webgl'
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 860, height: 2400, deviceScaleFactor: 2 });
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

// Wait for font to load
await page.waitForFunction(() => document.fonts.ready.then(() => true), { timeout: 10000 });
await new Promise(r => setTimeout(r, 2000));

// Screenshot individual cards
const cards = [
  { id: 'card-bismillah', file: 'code-snippet-bismillah.png' },
  { id: 'card-dichroic', file: 'code-snippet-dichroic.png' },
  { id: 'card-prayer', file: 'code-snippet-prayer.png' },
  { id: 'card-iridescence', file: 'code-snippet-iridescence.png' },
];

for (const { id, file } of cards) {
  const el = await page.$(`#${id}`);
  const box = await el.boundingBox();
  // Add some padding around the card
  const pad = 20;
  await page.screenshot({
    path: path.join(outDir, file),
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });
  console.log(`✅ ${file} (${Math.round(box.width)}x${Math.round(box.height)})`);
}

// Combined: all 4 cards + watermark
// Get bounding box from first card to watermark
const firstCard = await page.$('#card-bismillah');
const lastWatermark = await page.$('.watermark');
const firstBox = await firstCard.boundingBox();
const wmBox = await lastWatermark.boundingBox();

const combinedPad = 20;
const combinedClip = {
  x: Math.max(0, firstBox.x - combinedPad),
  y: Math.max(0, firstBox.y - combinedPad),
  width: firstBox.width + combinedPad * 2,
  height: (wmBox.y + wmBox.height) - firstBox.y + combinedPad * 2,
};

await page.screenshot({
  path: path.join(outDir, 'code-snippets-combined.png'),
  clip: combinedClip,
});
console.log(`✅ code-snippets-combined.png (${Math.round(combinedClip.width)}x${Math.round(combinedClip.height)})`);

await browser.close();
console.log('Done!');
