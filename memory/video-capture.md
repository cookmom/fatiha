# Video Capture Workflow — AGOT Launch/Social Media

## Overview
Capture the real webapp's splash SVG draw-on → crossfade → 3D scene as a video for social media. Uses CDP `Page.screencastFrame` for real-time capture at native framerate (~55fps), then encodes to 30fps.

## Key Lessons (Learned the Hard Way)

### 1. Timezone Matters
- Headless Chrome uses the **system timezone** (e.g., PDT)
- Prayer times from AlAdhan API are returned relative to the browser's timezone
- If you want 10:10 PM **Isha in Makkah**, you MUST set Chrome to Makkah's timezone:
  ```js
  await page.emulateTimezone('Asia/Riyadh');
  ```
- Without this, Isha maps to 9:29 AM PDT — completely wrong prayer window/lighting

### 2. Time Override: Use `_forceTimeMin` (NOT `_devTimeOverride`)
- `_devTimeOverride` uses `_devSimMinutes` which only updates via the dev slider — clock freezes
- `_forceTimeMin` is checked every frame and drives H/M/S directly
- Use a getter for ticking seconds:
  ```js
  var startMs = performance.now();
  var baseMin = 22 * 60 + 10; // 10:10 PM = 1330
  Object.defineProperty(window, '_forceTimeMin', {
    get: () => baseMin + (performance.now() - startMs) / 60000,
    configurable: true
  });
  ```

### 3. SVG Flash/Restart Bug
- The splash SVG builds on first render, then the `100lvh` resize handler triggers a re-render → SVG rebuilds → CSS animations restart → visible flash
- **Fix**: Wait 3s for scene to settle, then:
  1. Remove the old SVG
  2. Clone it with fresh animation restarts
  3. Start screencast capture AFTER the fresh SVG is appended
  ```js
  var oldSvg = splash.querySelector('svg');
  var newSvg = oldSvg.cloneNode(true);
  newSvg.querySelectorAll('path').forEach(p => {
    var style = p.getAttribute('style') || '';
    p.setAttribute('style', style.replace(/animation:[^;]+;?/, ''));
    void p.offsetWidth; // force reflow
    p.setAttribute('style', style);
  });
  oldSvg.remove();
  splash.appendChild(newSvg);
  ```

### 4. Hide Splash Text (Keep SVG)
- Inject CSS via patched HTTP server:
  ```css
  #splashBismillah, #splashTitle, #splashVerse, #splash>p, #splash>h1 {
    display: none !important;
  }
  ```
- The SVG cube renders independently of the text elements

### 5. Dev Var Overrides
- `var _devActive` and `var _devTimeOverride` are in `glass-cube-clock.js`, NOT `index.html`
- `evaluateOnNewDocument` values get overwritten by the script's `var` declarations
- **Fix**: Use a patched HTTP server that modifies the JS/HTML on the fly:
  ```js
  const srv = http.createServer((req, res) => {
    if (fp.endsWith('index.html')) { /* patch HTML */ }
    if (fp.endsWith('glass-cube-clock.js')) { /* patch JS vars */ }
  });
  ```

### 6. Screencast vs Screenshots
- Frame-by-frame `page.screenshot()` takes ~150ms each → desyncs from browser's animation clock
- CDP `Page.screencastFrame` captures at native framerate (~55fps) preserving proper animation timing
- Always use screencast for animations, screenshots only for stills
- Wrap `screencastFrameAck` in try/catch to avoid crash on browser close

### 7. Video Assembly Pipeline
1. **Part A**: Text overlay (static frame → ffmpeg fade out to black)
   ```
   ffmpeg -loop 1 -t 4.5 -i text-frame.png -vf "fps=30,fade=out:st=3.5:d=1" pa.mp4
   ```
2. **Part B**: Native webapp screencast (SVG draw + crossfade + 3D scene)
   - Fade in from black at start: `-vf "fade=in:st=0:d=0.5"`
3. **Concat**: Simple concat (A fades to black, B fades in from black)
   ```
   ffmpeg -f concat -safe 0 -i concat.txt -movflags +faststart final.mp4
   ```

### 8. Chrome UI Cleanup
- Remove these elements every 300ms during capture:
  ```js
  '.clock-onboard,.compass-onboard,#navPill,#fsVersionTag,#_devPanel,.mode-pill,#headerBar,#_currentPrayerLabel,#_prayerDots,.mode-label,#fsTapHint'
  ```

### 9. Resolution & Format
- Viewport: `{ width: 430, height: 932, deviceScaleFactor: 3 }` → 1290×2796 (iPhone Pro Max)
- Screencast: `maxWidth: 1290, maxHeight: 2796, everyNthFrame: 1`
- Encode: `libx264, crf 16, preset slow, movflags +faststart`
- Perfect for Instagram Reels, TikTok, YouTube Shorts (9:16 vertical)

### 10. Location Setup
```js
localStorage.setItem('agot_loc', JSON.stringify({lat:21.4225, lon:39.8262, name:'Makkah'}));
localStorage.setItem('agot_clock_onboarded', '1');
```

## Quick Reference — Full Render Command
See `/tmp/render-v13.cjs` for the latest working version. Key structure:
1. Patched HTTP server (port 7799) — hides splash text
2. Text frame screenshot
3. Navigate to patched page with `emulateTimezone('Asia/Riyadh')`
4. Set `_forceTimeMin` getter for 10:10 PM
5. Wait 3s for settle
6. Reset SVG animation
7. Start screencast, capture 12s
8. Encode Part A (text) + Part B (webapp) → concat → final.mp4

## GPU Chrome Requirements
```bash
GALLIUM_DRIVER=d3d12 MESA_D3D12_DEFAULT_ADAPTER_NAME=NVIDIA LD_LIBRARY_PATH=/usr/lib/wsl/lib
```
Chrome args: `--no-sandbox --disable-gpu-sandbox --use-gl=angle --use-angle=gl-egl --ozone-platform=headless --ignore-gpu-blocklist --disable-dev-shm-usage --in-process-gpu --enable-webgl`
