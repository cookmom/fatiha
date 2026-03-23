const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle','--use-angle=swiftshader','--disable-gpu-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  await page.goto('file://' + path.resolve('fatiha-parametric.html'), { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => document.getElementById('tap').style.display = 'none');
  
  // Wait ~70s for frame 500+
  console.log('Waiting 70s...');
  await new Promise(r => setTimeout(r, 70000));
  
  const state = await page.evaluate(() => ({
    frame: frameCount,
    totalFlowers: totalFlowerElements,
    flowersDrawn: Math.min(Math.floor((frameCount - 201) / 4), totalFlowerElements)
  }));
  console.log('State:', JSON.stringify(state));

  await page.screenshot({ path: 'flowers-full.png' });
  console.log('Done');
  await browser.close();
})();
