// Puppeteer test: draw watercolor strokes and screenshot
const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable', headless: 'new',
    args: ['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl']
  });
  const page = await browser.newPage();
  await page.setViewport({width:1080, height:1920, deviceScaleFactor:1});

  const errors = [];
  page.on('pageerror', e => errors.push(e.message.substring(0,300)));
  page.on('console', m => { if(m.type()==='error' && !m.text().includes('404')) errors.push(m.text().substring(0,300)); });

  await page.goto('http://localhost:9981/studio.html', {waitUntil:'domcontentloaded', timeout:60000});
  await new Promise(r => setTimeout(r, 8000));

  const hasState = await page.evaluate(() => typeof window.state);
  console.log('window.state type:', hasState);

  // Helper: simulate a smooth stroke with many intermediate points
  async function drawStroke(points) {
    const first = points[0];
    await page.mouse.move(first[0], first[1]);
    await page.mouse.down();
    for (let i = 1; i < points.length; i++) {
      await page.mouse.move(points[i][0], points[i][1], {steps: 3});
      await new Promise(r => setTimeout(r, 8));
    }
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 4000));
  }

  // ── STROKE 1: Wide lapis blue sweep across top ──
  await page.evaluate(() => {
    window.state.brush = 'watercolor';
    window.state.weight = 12;
    window.state.opacity = 190;
    window.state.color = '#1a3a8a';
  });
  await drawStroke([
    [120, 350], [180, 330], [260, 315], [340, 310], [420, 310],
    [500, 315], [580, 325], [660, 340], [740, 365], [800, 395]
  ]);

  // ── STROKE 2: Vermillion diagonal ──
  await page.evaluate(() => {
    window.state.color = '#c83c28';
    window.state.weight = 14;
    window.state.opacity = 160;
  });
  await drawStroke([
    [180, 550], [250, 510], [330, 480], [420, 460], [510, 455],
    [600, 465], [680, 490], [750, 530], [810, 580]
  ]);

  // ── STROKE 3: Terre verte wide wash ──
  await page.evaluate(() => {
    window.state.color = '#4a7a4a';
    window.state.weight = 10;
    window.state.opacity = 200;
  });
  await drawStroke([
    [100, 700], [200, 680], [310, 665], [420, 660], [530, 665],
    [640, 680], [740, 705], [830, 740]
  ]);

  // ── STROKE 4: Gold vertical wash (wet, low opacity) ──
  await page.evaluate(() => {
    window.state.color = '#c8a832';
    window.state.weight = 16;
    window.state.opacity = 110;
  });
  await drawStroke([
    [450, 250], [460, 340], [465, 430], [468, 520], [465, 610],
    [460, 700], [452, 790], [440, 880]
  ]);

  // ── STROKE 5: Rose/pink accent ──
  await page.evaluate(() => {
    window.state.color = '#c86478';
    window.state.weight = 8;
    window.state.opacity = 175;
  });
  await drawStroke([
    [550, 800], [590, 785], [640, 775], [700, 770], [760, 775],
    [810, 790], [850, 810]
  ]);

  // ── STROKE 6: Dark lapis thin accent ──
  await page.evaluate(() => {
    window.state.color = '#0a1a5a';
    window.state.weight = 5;
    window.state.opacity = 220;
  });
  await drawStroke([
    [200, 900], [280, 880], [360, 870], [440, 865], [520, 870],
    [600, 885], [680, 910]
  ]);

  await new Promise(r => setTimeout(r, 3000));

  for(const e of errors) console.log('ERR:', e);
  if(!errors.length) console.log('CLEAN');

  await page.screenshot({path:'studio-wc-test.png'});
  console.log('Screenshot: studio-wc-test.png');
  await browser.close();
})();
