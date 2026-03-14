import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: true,
  args: [
    '--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl',
    '--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage',
    '--in-process-gpu','--enable-webgl'
  ]
});
const page = await browser.newPage();
await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 3 });

const logs=[];
const errors=[];
page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:9960/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await new Promise(r=>setTimeout(r,15000));
await page.screenshot({ path:'/home/openclaw-agent/.openclaw/workspace/lookdev-premium.png', fullPage:false });

await page.evaluate('window._forceTimeMin = 1170');
await new Promise(r=>setTimeout(r,5000));
await page.screenshot({ path:'/home/openclaw-agent/.openclaw/workspace/lookdev-premium-maghrib.png', fullPage:false });

const renderer = await page.evaluate(() => {
  try {
    const c = document.querySelector('canvas');
    const gl = c && (c.getContext('webgl2') || c.getContext('webgl'));
    if (!gl) return 'no-webgl';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  } catch (e) { return 'err:' + e.message; }
});

console.log('RENDERER:', renderer);
console.log('CONSOLE_COUNT:', logs.length);
for (const l of logs) console.log(l);
console.log('PAGEERROR_COUNT:', errors.length);
for (const e of errors) console.log('[pageerror]', e);

await browser.close();