const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    env: {
      ...process.env,
      GALLIUM_DRIVER: 'd3d12',
      MESA_D3D12_DEFAULT_ADAPTER_NAME: 'NVIDIA',
      LD_LIBRARY_PATH: '/usr/lib/wsl/lib:' + (process.env.LD_LIBRARY_PATH || '')
    },
    args: ['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl',
           '--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage',
           '--in-process-gpu','--enable-webgl','--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', err => { console.log('PAGE ERROR:', err.message); errors.push(err.message); });
  page.on('console', msg => console.log('CONSOLE:', msg.text()));

  console.log('Loading page...');
  await page.goto('http://localhost:9981/fatiha-parametric.html', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for setup to complete (p5.brush rendering)
  console.log('Waiting for setup...');
  await page.waitForFunction('window._setupDone === true', { timeout: 30000 });
  console.log('Setup done! Starting timed captures...');

  // Now reload to get clean timing from t=0
  await page.goto('http://localhost:9981/fatiha-parametric.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForFunction('window._setupDone === true', { timeout: 30000 });

  // t=0: right after setup — should be mostly cream paper with faint top
  // Give 1 draw frame to render
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'param-t0.png' });
  console.log('✓ param-t0.png — cream paper, faint hint');

  // t=2
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'param-t2.png' });
  console.log('✓ param-t2.png — top half emerging');

  // t=4
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'param-t4.png' });
  console.log('✓ param-t4.png — mostly visible, breathing');

  // t=5.5
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'param-t5.5.png' });
  console.log('✓ param-t5.5.png — full painting, active');

  if (errors.length) console.log('ERRORS:', errors.slice(0,3).join(' | '));
  else console.log('No errors!');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
