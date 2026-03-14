# Render Playbook — AGOT Video & Poster Deliverables

## Common Setup (All Renders)

### Viewport & Resolution
- **Standard (ALL renders)**: `{width: 430, height: 932, deviceScaleFactor: 3}` → **1290×2796** actual pixels
- **9:16 crop**: 1290×2292 (from 1290×2796, center crop)
- NEVER change viewport dimensions. NEVER change DPR. 430×932 @ 3x is the ONLY tested layout.
- Do NOT attempt 4K (2160×3840) — different viewport breaks app CSS layout, and social platforms max at 1080×1920 anyway.

### GPU Chrome
- Binary: `/usr/bin/google-chrome-stable`
- Env: `GALLIUM_DRIVER=d3d12`, `MESA_D3D12_DEFAULT_ADAPTER_NAME=NVIDIA`, `LD_LIBRARY_PATH=/usr/lib/wsl/lib`
- Args: `--no-sandbox --disable-gpu-sandbox --use-gl=angle --use-angle=gl-egl --ozone-platform=headless --ignore-gpu-blocklist --disable-dev-shm-usage --in-process-gpu --enable-webgl`

### Location (Makkah)
1. `localStorage.setItem('agot_loc', JSON.stringify({lat:21.4225, lon:39.8262, name:'Makkah', tz:'Asia/Riyadh'}))` — in evaluateOnNewDocument
2. After page load + 14s scene wait: `window._setPrayerLocation(21.4225, 39.8262, 'Makkah')`
3. Timezone: `page.emulateTimezone('Asia/Riyadh')`

### Time Control
- **For real-time video (moving second hand):** Override `window._cityNow` directly:
  ```js
  var startReal = performance.now();
  var startFake = new Date(2026, 2, 13, H, M, 0, 0).getTime();
  window._cityNow = function() {
    return new Date(startFake + (performance.now() - startReal));
  };
  ```
  Do NOT use `_forceTimeMin` — it freezes the second hand at 0.
- **For static posters / timelapse:** Use `_forceTimeMin` + `_fakeTime` Date.prototype override
  - Pin forceTimeMin: `setInterval(() => { window._forceTimeMin = X }, 100)` — app clears it at line 3794
  - Override `Date.prototype.getHours/getMinutes/getSeconds/getMilliseconds` via `window._fakeTime`
- **NEVER combine `_forceTimeMin` with real-time recording** — it kills second hand motion

### Pill Glow Color
- Must explicitly force CSS vars on `#modePillSlider` — don't rely on app display cycle
- ```js
  slider.style.setProperty('--pill-glow-bar', color);
  slider.style.setProperty('--pill-glow-bar-shadow', color + '73');
  slider.style.setProperty('--pill-glow-bar-soft', color + '26');
  slider.style.setProperty('--pill-glow', color + '1f');
  ```

### Prayer Color Map (Makkah, March 2026)
| Prayer | Color | forceTimeMin (mid-window) |
|---|---|---|
| Qiyam | #8811ff | 90 |
| Last Third | #aa44ff | 230 |
| Fajr | #6633ee | 350 |
| Dhuha/Sunrise | #ff9900 | 570 |
| Dhuhr | #00bb44 | 850 |
| Asr | #ff8800 | 1030 |
| Maghrib | #ff2200 | 1140 |
| Isha | #1166ff | 1170+ |

### Prayer Time Boundaries (AlAdhan, Makkah March 12)
Fajr 316, Sunrise 392, Dhuhr 750, Asr 953, Maghrib 1109, Isha 1229, Midnight 31, LastThird 151

---

## Poster Composition (Safe Zone Layout)

### X/Twitter Safe Zone
- Portrait video → X shows 9:16 crop (NOT 16:9)
- Safe zone: 9%–91% vertical
- Our margins: **12% from top, 12% from bottom** — approved by Tawfeeq

### Typography
- **Title**: "a Gift of Time." — Instrument Serif, 2.8rem, weight 400, letter-spacing -0.02em, `rgba(232,228,220,0.9)`, `top: 12%`
- **Subtitle**: varies per deliverable — Instrument Serif, 0.85rem, weight 400, `rgba(232,228,220,0.4)`, `top: calc(12% + 3.8rem)`, padding 0 10%
- Lowercase "a" in title is intentional

### UI Elements
- Real `.mode-pill` from app (not recreated) — `bottom: 12%`, `display:flex !important`, `opacity:1 !important`
- Real `.mode-label` — `bottom: calc(12% + 62px)`
- CLOCK label for clock mode, COMPASS for compass mode

### Chrome Hiding (Nuclear Method)
```js
document.body.classList.add('chrome-hidden');
document.querySelectorAll('body > *').forEach(el => {
  if (el.tagName === 'CANVAS') return;
  if (el.classList && (el.classList.contains('mode-pill') || el.classList.contains('mode-label'))) return;
  if (el.id === 'modePill' || el.id === 'modeLabel') return;
  if (el.classList && el.classList.contains('poster-overlay')) return;
  el.style.display = 'none';
});
```
Override chrome-hidden on pill/label with `!important`.

---

## Deliverable Specs

### 1. Static Poster (per prayer)
- Single frame screenshot at specific forceTimeMin
- Film grain variant: `ffmpeg -y -i input.png -vf "noise=alls=6:allf=t" output-grain.png`
- Send as **document** (not photo) to preserve quality on Telegram

### 2. Clock Video (single prayer, 15s)
- 15s @ 30fps = 450 frames
- Clock running: advance `_fakeTime.s` and `_fakeTime.ms` per frame
- Second hand sweeps, minute/hour frozen (short duration)
- Subtitle specific to prayer window

### 3. 24hr Timelapse (20s)
- 20s @ 30fps = 600 frames
- Start at Fajr (316 min), sweep through full 24hr cycle
- **Only hour hand moves** — minute + second frozen at 12 o'clock
- Smooth hour hand: pass real fractional minutes to `getMinutes()` for hour calc, then patch `THREE.WebGLRenderer.prototype.render` to freeze minute/second hand rotations and re-render after each frame
- Pill glow color updates per prayer window each frame
- Subtitle: "a study in light, time, orientation and a call to prayer."

### 4. Compass Video (15s, loopable)
- 15s @ 30fps = 450 frames
- Enable compass mode: `window._clockToggleCompass(true)`
- Lock compass: `_compassLocked = true`, `_compassCalibrated = true`
- Animate needle via `window._clockUpdateCompass(heading, qibla)` where `heading = qibla - needleOffset`
- Needle choreography: 9→12(hold/beat)→3→12(hold/beat)→9 with cubic ease-in-out
- "Ordinarily effect" = prismatic refraction beam payoff when needle hits 12 (aligned with Qibla)
- Subtitle: "Of all the directions, turn towards what's best for you." (italic)
- Pill shows compass icon active (`data-pos='1'`), label says "COMPASS"

### 5. Code Snippet Cards
- Bismillah line 1 of each GLSL snippet
- Safe to share: dichroic IOR, prayer polar shader, thin-film iridescence
- Do NOT share full `glass-cube-clock.js`

---

## Video Encoding
- Portrait (native): `ffmpeg -y -framerate 30 -i frame_%04d.png -c:v libx264 -crf 18 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" output.mp4` → **1290×2796**
- **9:16 crop (standard deliverable)**: `-vf "crop=1290:2293:0:(2796-2293)/2,scale=trunc(iw/2)*2:trunc(ih/2)*2"` → **1290×2292**

### Platform Video Specs (researched 2026-03-13)
- **X/Twitter**: Portrait max **1080×1920**, recommended 720×1280. H.264 + AAC, 30fps. 140s non-premium, 512MB.
- **Instagram Reels/Stories**: **1080×1920** (9:16). H.264, 30fps, max 90s (Reels).
- **TikTok**: **1080×1920** (9:16). H.264, max 10min.
- **LinkedIn**: 1080×1920 portrait supported. H.264, max 10min.
- Our 1290×2292 exceeds these — platforms will downscale, which is fine. Never upscale.
- X GIF (under 15MB): `ffmpeg -y -i input-916.mp4 -vf "fps=10,scale=420:746:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=sierra2_4a" output-x.gif`
  - X limits: 15MB max, 1280px longest side, auto-loops
  - 420×746 at 10fps with 128 colors ≈ 13MB for 20s video
- Always deliver TWO: portrait MP4 (1290×2796) + 9:16 MP4 (1290×2292). No GIFs.

---

## Subtitles per Deliverable
| Deliverable | Subtitle |
|---|---|
| Last Third poster/video | "seek the night of decree." |
| 24hr timelapse | "a study in light, time, orientation and a call to prayer." |
| Compass video | "Of all the directions, turn towards what's best for you." |
| Jumu'atul Wida video | "Jumu'atul Wida — The Farewell Friday of Ramadan" |
| Fajr poster | TBD |
| General/title | "a study in light, time, orientation and a call to prayer." |

---

## Wait Times (Scene Load)
- 14s after `domcontentloaded` — Three.js + HDRI
- 5s after `_setPrayerLocation` — prayer times resolve
- 3s after pin forceTimeMin — lighting settles
- 3s after font link inject — Instrument Serif loads
- Total before first frame: ~25-28s

## Ports Used
- Increment from 9940+ per render script to avoid collisions
