const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const FRAMES = 450; // 15s @ 30fps
const FPS = 30;
const FRAME_DIR = '/tmp/jumua-frames-v2';

(async () => {
  fs.mkdirSync(FRAME_DIR, { recursive: true });

  const b = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: ['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl',
      '--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage',
      '--in-process-gpu','--enable-webgl']
  });

  const p = await b.newPage();
  await p.setViewport({ width: 430, height: 932, deviceScaleFactor: 3 });
  await p.emulateTimezone('Asia/Riyadh');

  await p.evaluateOnNewDocument(() => {
    localStorage.setItem('agot_loc', JSON.stringify({lat:21.4225, lon:39.8262, name:'Makkah', tz:'Asia/Riyadh'}));
    localStorage.setItem('agot_splash_seen', '1');
  });

  console.log('Loading page...');
  await p.goto('http://localhost:9971/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 14000));

  // Set prayer location
  await p.evaluate(() => {
    if (typeof _setPrayerLocation === 'function') _setPrayerLocation(21.4225, 39.8262, 'Makkah');
  });
  await new Promise(r => setTimeout(r, 5000));

  // Pin forceTimeMin to Dhuhr (755 = 12:35 PM)
  await p.evaluate(() => {
    window._forceTimePin = setInterval(() => { window._forceTimeMin = 755; }, 100);
  });
  await new Promise(r => setTimeout(r, 3000));

  // Set up fake time at 12:35:00 — will advance per frame
  await p.evaluate(() => {
    window._fakeTime = { h: 12, m: 35, s: 0, ms: 0 };
    const orig = {
      getHours: Date.prototype.getHours,
      getMinutes: Date.prototype.getMinutes,
      getSeconds: Date.prototype.getSeconds,
      getMilliseconds: Date.prototype.getMilliseconds
    };
    Date.prototype.getHours = function() { return window._fakeTime ? window._fakeTime.h : orig.getHours.call(this); };
    Date.prototype.getMinutes = function() { return window._fakeTime ? window._fakeTime.m : orig.getMinutes.call(this); };
    Date.prototype.getSeconds = function() { return window._fakeTime ? window._fakeTime.s : orig.getSeconds.call(this); };
    Date.prototype.getMilliseconds = function() { return window._fakeTime ? window._fakeTime.ms : orig.getMilliseconds.call(this); };
  });
  await new Promise(r => setTimeout(r, 2000));

  // Nuclear chrome hide
  await p.evaluate(() => {
    document.body.classList.add('chrome-hidden');
    document.querySelectorAll('body > *').forEach(el => {
      if (el.tagName === 'CANVAS') return;
      if (el.classList && (el.classList.contains('mode-pill') || el.classList.contains('mode-label'))) return;
      if (el.id === 'modePill' || el.id === 'modeLabel') return;
      if (el.classList && el.classList.contains('poster-overlay')) return;
      el.style.display = 'none';
    });

    // Force pill + label visible at 12% from bottom
    var pill = document.querySelector('.mode-pill');
    if (pill) pill.style.cssText += 'display:flex!important;opacity:1!important;visibility:visible!important;bottom:12%!important;';
    var label = document.querySelector('.mode-label');
    if (label) label.style.cssText += 'display:block!important;opacity:1!important;visibility:visible!important;bottom:calc(12% + 62px)!important;';

    // Pill glow = Dhuhr green
    var slider = document.getElementById('modePillSlider');
    if (slider) {
      slider.style.setProperty('--pill-glow-bar', '#00bb44');
      slider.style.setProperty('--pill-glow-bar-shadow', '#00bb4473');
      slider.style.setProperty('--pill-glow-bar-soft', '#00bb4426');
      slider.style.setProperty('--pill-glow', '#00bb441f');
    }
  });

  // Inject font + poster overlay at 12% from top
  await p.evaluate(() => {
    var link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    var ov = document.createElement('div');
    ov.className = 'poster-overlay';
    ov.style.cssText = 'position:fixed;top:12%;left:0;width:100%;z-index:900;pointer-events:none;display:flex;flex-direction:column;align-items:center;';
    ov.innerHTML = '<div style="font-family:Instrument Serif,serif;font-size:2.8rem;font-weight:400;letter-spacing:-0.02em;color:rgba(232,228,220,0.9)">a Gift of Time.</div>' +
      '<div style="font-family:Instrument Serif,serif;font-size:0.85rem;font-weight:400;color:rgba(232,228,220,0.4);margin-top:0.5rem;padding:0 10%;text-align:center">Jumu\'atul Wida — The Farewell Friday of Ramadan</div>';
    document.body.appendChild(ov);
  });

  // Wait for font to load
  await new Promise(r => setTimeout(r, 3000));

  console.log('Starting frame capture...');
  const msPerFrame = 1000 / FPS; // ~33.33ms per frame

  for (let i = 0; i < FRAMES; i++) {
    // Advance fake time by 1/30th of a second per frame = real time
    await p.evaluate((msAdv) => {
      var ft = window._fakeTime;
      ft.ms += msAdv;
      while (ft.ms >= 1000) { ft.ms -= 1000; ft.s++; }
      while (ft.s >= 60) { ft.s -= 60; ft.m++; }
      while (ft.m >= 60) { ft.m -= 60; ft.h++; }
    }, msPerFrame);

    const frameNum = String(i + 1).padStart(4, '0');
    await p.screenshot({ path: path.join(FRAME_DIR, `frame_${frameNum}.png`) });

    if (i % 90 === 0) console.log(`Frame ${i+1}/${FRAMES}`);
  }

  console.log('All frames captured. Closing browser.');
  await b.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
