// <!-- بسم الله الرحمن الرحيم -->
const puppeteer = require('puppeteer-core'), http = require('http'), fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const SITE_DIR = '/home/tawfeeq/ramadan-clock-site', PORT = 9951;
const FPS = 30;
const OUT_DIR = '/home/openclaw-agent/.openclaw/workspace/compass-frames';

// Easing: cubic ease-in-out
function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

// Animation keyframes (in seconds):
// 0-2s:    hold at 9 o'clock (settle in)
// 2-4s:    sweep 9→12 (ease)
// 4-5.5s:  HOLD at 12 (beat — show alignment/qibla effect)
// 5.5-7.5s: sweep 12→3 (ease)
// 7.5-8s:  brief hold at 3
// 8-10s:   sweep 3→12 (ease)
// 10-11.5s: HOLD at 12 (beat — qibla payoff again)
// 11.5-13.5s: sweep 12→9 (ease)
// 13.5-15s: hold at 9 (settle for loop)
const TOTAL_SEC = 15;
const TOTAL = FPS * TOTAL_SEC;

// Needle angles relative to qibla (radians):
// 12 o'clock = 0 (aligned)
// 9 o'clock = -PI/2 (left)
// 3 o'clock = PI/2 (right)
const POS_9 = Math.PI / 2;   // visually LEFT from camera's perspective
const POS_12 = 0;            // visually UP (aligned with qibla)
const POS_3 = -Math.PI / 2;  // visually RIGHT

function getNeedleOffset(sec) {
  // Returns qiblaRel offset (what we add to compassHeading relative to qibla)
  if (sec < 2)       return POS_9;                                          // hold 9
  if (sec < 4)       return POS_9 + (POS_12 - POS_9) * easeInOut((sec-2)/2);  // 9→12
  if (sec < 5.5)     return POS_12;                                         // hold 12 (beat)
  if (sec < 7.5)     return POS_12 + (POS_3 - POS_12) * easeInOut((sec-5.5)/2); // 12→3
  if (sec < 8)       return POS_3;                                          // brief hold 3
  if (sec < 10)      return POS_3 + (POS_12 - POS_3) * easeInOut((sec-8)/2);   // 3→12
  if (sec < 11.5)    return POS_12;                                         // hold 12 (beat)
  if (sec < 13.5)    return POS_12 + (POS_9 - POS_12) * easeInOut((sec-11.5)/2); // 12→9
  return POS_9;                                                              // hold 9 (loop point)
}

function startServer() {
  const m = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.hdr':'application/octet-stream','.glb':'model/gltf-binary','.woff2':'font/woff2','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
  return new Promise(r => { const s = http.createServer((req, res) => { let fp = path.join(SITE_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]); fs.readFile(fp, (e, d) => { if (e) { res.writeHead(404); res.end(); return } res.writeHead(200, {'Content-Type': m[path.extname(fp)] || 'application/octet-stream'}); res.end(d) }) }); s.listen(PORT, () => r(s)) });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, {recursive: true});
  fs.readdirSync(OUT_DIR).forEach(f => fs.unlinkSync(path.join(OUT_DIR, f)));

  const server = await startServer();
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable', headless: true,
    args: ['--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl','--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage','--in-process-gpu','--enable-webgl'],
    env: {...process.env, GALLIUM_DRIVER:'d3d12', MESA_D3D12_DEFAULT_ADAPTER_NAME:'NVIDIA', LD_LIBRARY_PATH:'/usr/lib/wsl/lib:'+(process.env.LD_LIBRARY_PATH||'')}
  });

  const page = await browser.newPage();
  await page.setViewport({width: 430, height: 932, deviceScaleFactor: 3});
  await page.emulateTimezone('Asia/Riyadh');

  // Use Last Third time for the dark moody look
  await page.evaluateOnNewDocument(() => {
    window._forceTimeMin = 230;
    window._fakeTime = {h: 3, m: 50, s: 0, ms: 0};
    Date.prototype.getHours = function() { return window._fakeTime.h };
    Date.prototype.getMinutes = function() { return window._fakeTime.m };
    Date.prototype.getSeconds = function() { return 0 };
    Date.prototype.getMilliseconds = function() { return 0 };
    try { localStorage.setItem('agot_loc', JSON.stringify({lat:21.4225, lon:39.8262, name:'Makkah', tz:'Asia/Riyadh'})) } catch(e) {}

  });

  // Load normally — we'll enable compass mode after scene loads
  // Load WITHOUT ?compass — ?compass breaks module loading. Toggle via JS after load.
  await page.goto(`http://localhost:${PORT}/`, {waitUntil: 'domcontentloaded', timeout: 30000});
  console.log('Waiting 14s for scene...');
  await new Promise(r => setTimeout(r, 14000));

  await page.evaluate(() => { if (window._setPrayerLocation) window._setPrayerLocation(21.4225, 39.8262, 'Makkah') });
  await new Promise(r => setTimeout(r, 5000));

  // Pin time
  await page.evaluate(() => {
    window._forceTimeMin = 230;
    window.__pin = setInterval(() => { window._forceTimeMin = 230 }, 100);
  });
  await new Promise(r => setTimeout(r, 2000));

  // Toggle compass mode via JS (NOT ?compass — that breaks module loading)
  await page.evaluate(() => {
    if (typeof window._clockToggleCompass === 'function') window._clockToggleCompass(true);
    window._compassCalibrated = true;
    window._compassAccuracy = 5;
  });
  await new Promise(r => setTimeout(r, 2000));

  // Force pill glow to violet (Last Third)
  await page.evaluate(() => {
    const gc = '#aa44ff';
    const slider = document.getElementById('modePillSlider');
    if (slider) {
      slider.style.setProperty('--pill-glow-bar', gc);
      slider.style.setProperty('--pill-glow-bar-shadow', gc + '73');
      slider.style.setProperty('--pill-glow-bar-soft', gc + '26');
      slider.style.setProperty('--pill-glow', gc + '1f');
    }
  });

  // Inject overlay + hide chrome
  await page.evaluate(async () => {
    const link = document.createElement('link'); link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap'; link.rel = 'stylesheet'; document.head.appendChild(link);
    await new Promise(r => setTimeout(r, 3000));

    document.body.classList.add('chrome-hidden');
    document.querySelectorAll('body > *').forEach(el => {
      if (el.tagName === 'CANVAS') return;
      if (el.classList && (el.classList.contains('mode-pill') || el.classList.contains('mode-label'))) return;
      if (el.id === 'modePill' || el.id === 'modeLabel') return;
      if (el.classList && el.classList.contains('poster-overlay')) return;
      el.style.display = 'none';
    });
    const canvas = document.querySelector('canvas');
    if (canvas) { canvas.style.display = 'block'; canvas.style.position = 'fixed'; canvas.style.top = '0'; canvas.style.left = '0'; canvas.style.width = '100vw'; canvas.style.height = '100vh'; canvas.style.zIndex = '0' }

    // Pill at 12% bottom, switch to compass icon active
    const pill = document.querySelector('.mode-pill');
    if (pill) { pill.style.setProperty('display','flex','important'); pill.style.setProperty('opacity','1','important'); pill.style.zIndex = '999'; pill.style.bottom = '12%' }
    // Activate compass button in pill
    document.querySelectorAll('.mode-pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === 'compass');
    });
    var _pillSlider = document.getElementById('modePillSlider');
    if (_pillSlider) _pillSlider.setAttribute('data-pos', '1'); // compass position

    const ml = document.querySelector('.mode-label') || document.getElementById('modeLabel');
    if (ml) { ml.style.setProperty('display','block','important'); ml.style.setProperty('opacity','1','important'); ml.style.bottom = 'calc(12% + 62px)'; ml.textContent = 'COMPASS' }

    // Title at 12%
    const t = document.createElement('div'); t.className = 'poster-overlay';
    t.style.cssText = 'position:fixed;top:12%;left:0;width:100%;text-align:center;z-index:9999;pointer-events:none;font-family:"Instrument Serif",serif;font-size:2.8rem;font-weight:400;letter-spacing:-0.02em;color:rgba(232,228,220,0.9);line-height:1.1';
    t.textContent = 'a Gift of Time.'; document.body.appendChild(t);
    // Subtitle
    const s = document.createElement('div'); s.className = 'poster-overlay';
    s.style.cssText = 'position:fixed;top:calc(12% + 3.8rem);left:0;width:100%;text-align:center;z-index:9999;pointer-events:none;font-family:"Instrument Serif",serif;font-size:0.85rem;font-weight:400;color:rgba(232,228,220,0.4);padding:0 10%;font-style:italic';
    s.textContent = 'Of all the directions, turn towards what\u2019s best for you.'; document.body.appendChild(s);
  });
  await new Promise(r => setTimeout(r, 2000));

  console.log(`Capturing ${TOTAL} frames at ${FPS}fps (${TOTAL_SEC}s compass animation)...`);
  console.log('Sequence: 9→12(hold)→3→12(hold)→9 (loopable)');

  for (let i = 0; i < TOTAL; i++) {
    const sec = i / FPS;
    const needleOffset = getNeedleOffset(sec);

    // Kill animation loop on first frame, then manually control EVERYTHING
    const t = i * 0.033; // fake time advancing at ~30fps
    await page.evaluate((offset, frameIdx, time) => {
      // Kill animation loop once
      if (frameIdx === 0) {
        window.requestAnimationFrame = () => 0;
      }
      // --- NEEDLE ---
      const r2 = window.clockRays[2];
      r2.mesh.rotation.y = r2.initY - offset;
      r2.mesh.children[0].material.uniforms.op.value = 0.95;
      // Hide hour+minute hands
      window.clockRays[0].mesh.children[0].material.uniforms.op.value = 0;
      window.clockRays[1].mesh.children[0].material.uniforms.op.value = 0;

      // --- LIVELINESS: advance time uniforms for shimmer/caustics ---
      const breathe = 0.88 + 0.12 * Math.sin(time * 1.0);
      // Light shaft
      if (window._shaftMat) window._shaftMat.uniforms.time.value = time;
      // Prism only near 12 o'clock
      const nearNoon = Math.abs(offset) < 0.3;
      const prismOp = nearNoon ? (1 - Math.abs(offset) / 0.3) : 0;
      if (window._qiblaFanDisc) {
        window._qiblaFanDisc.visible = nearNoon;
        window._qiblaFanDisc.material.uniforms.op.value = 0.55 * prismOp * breathe;
        window._qiblaFanDisc.material.uniforms.time.value = time;
      }
      if (window._qiblaBloomDisc) {
        window._qiblaBloomDisc.visible = nearNoon;
        window._qiblaBloomDisc.material.uniforms.op.value = 0.22 * prismOp * breathe;
        window._qiblaBloomDisc.material.uniforms.time.value = time;
      }
      if (window._qiblaEntryDisc) {
        window._qiblaEntryDisc.visible = nearNoon;
        window._qiblaEntryDisc.material.uniforms.op.value = 0.18 * prismOp * breathe;
      }
      if (window._qiblaEntryBeam) {
        window._qiblaEntryBeam.visible = nearNoon;
        window._qiblaEntryBeam.material.uniforms.time.value = time;
        window._qiblaEntryBeam.material.uniforms.op.value = 0.35 * prismOp * breathe;
      }
      if (window._qiblaExitCaustic) {
        window._qiblaExitCaustic.visible = nearNoon;
        window._qiblaExitCaustic.material.uniforms.time.value = time;
        window._qiblaExitCaustic.material.uniforms.op.value = 0.5 * prismOp * breathe;
      }
      if (window._qiblaCausticLight) {
        window._qiblaCausticLight.intensity = nearNoon ? 0.5 * prismOp * breathe : 0;
      }
      // Advance gobo spotlight orbit for specular shimmer on cube
      if (window.plinthSun) {
        const orbitR = 6;
        window.plinthSun.position.x = -6 + Math.sin(time * 0.3) * 0.5;
        window.plinthSun.position.z = 3 + Math.cos(time * 0.3) * 0.5;
      }
      // FULL TWO-PASS FBO RENDER (cube refraction updates every frame!)
      // Pass 1: FBO — hide cube + prayer lights, render backface normals
      window._cubeMesh.visible = false;
      var pl = window._prayerLights || {};
      if (pl.wash) pl.wash.visible = false;
      if (pl.rim) pl.rim.visible = false;
      if (pl.slash) pl.slash.visible = false;
      if (pl.glow) pl.glow.visible = false;
      window._threeRenderer.setRenderTarget(window._fboRT);
      window._threeRenderer.render(window._threeScene, window._threeCamera);
      window._threeRenderer.setRenderTarget(null);
      // Pass 2: Screen — restore cube with fresh FBO texture
      window._cubeMesh.visible = true;
      if (pl.wash) pl.wash.visible = true;
      if (pl.rim) pl.rim.visible = true;
      if (pl.slash) pl.slash.visible = true;
      if (pl.glow) pl.glow.visible = true;
      window._cubeMat.uniforms.uScene.value = window._fboRT.texture;
      window._cubeMat.uniforms.uTime.value = time;
      window._threeRenderer.render(window._threeScene, window._threeCamera);
    }, needleOffset, i, t);

    const frame = String(i).padStart(4, '0');
    await page.screenshot({path: `${OUT_DIR}/frame_${frame}.png`, type: 'png'});
    if (i % 45 === 0) {
      const pos = sec < 2 ? '9' : sec < 4 ? '9→12' : sec < 5.5 ? '12(hold)' : sec < 7.5 ? '12→3' : sec < 8 ? '3' : sec < 10 ? '3→12' : sec < 11.5 ? '12(hold)' : sec < 13.5 ? '12→9' : '9';
      console.log(`  Frame ${i}/${TOTAL} — ${sec.toFixed(1)}s — needle: ${pos}`);
    }
  }

  console.log('Encoding portrait MP4...');
  execSync(`ffmpeg -y -framerate ${FPS} -i "${OUT_DIR}/frame_%04d.png" -c:v libx264 -crf 18 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" /home/openclaw-agent/.openclaw/workspace/compass-video-portrait.mp4`);

  console.log('Encoding 9:16 crop...');
  execSync(`ffmpeg -y -framerate ${FPS} -i "${OUT_DIR}/frame_%04d.png" -c:v libx264 -crf 18 -pix_fmt yuv420p -vf "crop=1290:2293:0:(2796-2293)/2,scale=trunc(iw/2)*2:trunc(ih/2)*2" /home/openclaw-agent/.openclaw/workspace/compass-video-916.mp4`);

  const s1 = fs.statSync('/home/openclaw-agent/.openclaw/workspace/compass-video-portrait.mp4');
  const s2 = fs.statSync('/home/openclaw-agent/.openclaw/workspace/compass-video-916.mp4');
  console.log('Done!');
  console.log(`  portrait: ${(s1.size/1024/1024).toFixed(1)}MB`);
  console.log(`  9:16 crop: ${(s2.size/1024/1024).toFixed(1)}MB`);

  await browser.close(); server.close();
}
main().catch(e => { console.error(e); process.exit(1) });
