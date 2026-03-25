const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 800 });
  
  await page.goto('http://localhost:8765/ottoman-skill-test.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('Waiting 60s for ottoman...');
  await new Promise(r => setTimeout(r, 60000));
  
  const info = await page.evaluate(() => `frame: ${typeof frame !== 'undefined' ? frame : 'N/A'}`);
  console.log(info);
  await page.screenshot({ path: '/tmp/ottoman-ref.png', fullPage: false });
  console.log('Done');
  await browser.close();
})();
