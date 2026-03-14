# AGOT Branding & Render Guide

_Last updated: 2026-03-09_

## Brand Mark: Dichroic Refraction Cube

The AGOT logo is a **2D wireframe isometric cube** with clock hands at **10:10** and a **refraction displacement** effect — hands offset downward (+Y) where they pass through the cube faces, simulating light bending through glass.

### Design Spec (Locked)

| Element | Value |
|---------|-------|
| Cube edge stroke | **15px** (SVG units in 1024×1024 viewBox) |
| Hand stroke | **15.5px** |
| Hour hand color | `rgba(180,0,255,1)` — violet |
| Minute hand color | `rgba(50,100,255,1)` — blue |
| Cube edge color | `rgba(255,255,255,0.92)` |
| Background | `#0d0d12` |
| Time shown | **10:10** (classic symmetric) |
| Refraction Y offset | **35px** (down) inside cube |
| Cube faces shown | Outside only (no back vertical, no bottom back edges) |
| Hand origin | `(511.9, 619.0)` — shared pivot |
| Hour hand end | `(269.7, 326.2)` — upper left |
| Minute hand end | `(952.0, 485.3)` — right |
| Cube center | `(512, 512)` in 1024 viewBox |

### Layer Order (Critical)
1. **Inside hands** (offset +35Y, clipped to cube silhouette) — BOTTOM
2. **Outside hands** (original position, clipped to outside cube) — MIDDLE
3. **Cube edges** (white wireframe) — TOP

Hands render BEHIND cube edges. This creates the illusion of light passing through glass.

### Cube Vertices (Projected 2D)

| Vertex | Position |
|--------|----------|
| tLeft | (308.7, 383.1) |
| tBack | (514.6, 287.0) |
| tRight | (715.3, 386.1) |
| tFront | (509.1, 489.9) |
| bLeft | (316.7, 624.8) |
| bFront | (509.1, 737.0) |
| bRight | (707.0, 627.9) |

### Visible Edges (9 total, no inside lines)
- Top face: tLeft→tBack, tBack→tRight, tRight→tFront, tFront→tLeft
- Bottom front: bLeft→bFront, bFront→bRight
- Verticals: tFront→bFront (front), tLeft→bLeft (left), tRight→bRight (right)

---

## Rendering Pipeline

### Source: SVG → Puppeteer → PNG

All brand assets are generated from a single SVG template rendered via headless Chrome (Puppeteer).

**NOT the 3D WebGL scene.** The brand mark is a clean 2D wireframe — completely independent of `glass-cube-clock.js`.

### SVG Construction
```
1. Build SVG string programmatically (Node.js)
2. Wrap in minimal HTML file (body with exact dimensions)
3. Load in Puppeteer with controlled viewport + deviceScaleFactor
4. Screenshot → PNG
```

### Key Rendering Rules

#### 1. Always render at native resolution or higher
- **NEVER render small and expect it to look crisp**
- For icons: render at 1024×1024 native, let the OS downscale
- For OG images: render at 1200×630 with DPR=1 (native pixels)
- For favicons: render at DPR=2 or higher, use png-to-ico for .ico

#### 2. DeviceScaleFactor matters
| Asset | Viewport | DPR | Output |
|-------|----------|-----|--------|
| Master / Touch Icon | 1024×1024 | 1 | 1024×1024 |
| OG Image | 1200×630 | 1 | 1200×630 |
| Favicon ICO | Use master | - | png-to-ico from 16+32px |
| PWA 512 | 512×512 | 2 | 1024×1024 |
| PWA 192 | 192×192 | 2 | 384×384 |

#### 3. Clip paths for inside/outside
SVG `<clipPath>` separates inside vs outside cube:
- **Inside clip**: cube silhouette polygon
- **Outside clip**: full viewport with cube silhouette hole (evenodd)

#### 4. Background color
Always `#0d0d12` — matches the app's scene background. NOT pure black `#000`.

---

## Asset Inventory

| File | Size | Purpose | Location |
|------|------|---------|----------|
| `apple-touch-icon.png` | 1024×1024 | iOS Home Screen | repo root |
| `og-image.png` | 1200×630 | Social sharing (OG/Twitter) | repo root |
| `favicon.ico` | multi-size | Browser tab | repo root |
| `icon-512.png` | 512×512 | PWA manifest | repo root |
| `icon-192.png` | 192×192 | PWA manifest | repo root |
| `icon-master.png` | 1024×1024 | Master source | repo root |

---

## Social Media Renders (from 3D WebGL Scene)

For recording clips / screenshots from the live 3D scene (not the brand mark):

### GPU Chrome Setup (RTX A6000)
```bash
export GALLIUM_DRIVER=d3d12
export MESA_D3D12_DEFAULT_ADAPTER_NAME=NVIDIA
export LD_LIBRARY_PATH=/usr/lib/wsl/lib:$LD_LIBRARY_PATH
```

### Chrome Args (ALL required for WebGL)
```
--no-sandbox --disable-gpu-sandbox --use-gl=angle --use-angle=gl-egl
--ozone-platform=headless --ignore-gpu-blocklist --disable-dev-shm-usage
--in-process-gpu --enable-webgl
```

### Verify GPU
Renderer string MUST show: `ANGLE (Microsoft Corporation, D3D12 (NVIDIA RTX A6000), OpenGL ES 3.1)`
**NEVER use llvmpipe/SwiftShader** — if wrong, fix before proceeding.

### Viewport Presets
| Use case | Viewport | DPR | Wait time |
|----------|----------|-----|-----------|
| Mobile lookdev | 430×932 | 2 | 12s (Three.js + HDRI load) |
| Desktop wide | 1920×1080 | 1 | 12s |
| Instagram square | 1080×1080 | 1 | 12s |
| Twitter/X header | 1500×500 | 1 | 12s |
| Story/Reel | 1080×1920 | 1 | 12s |

### Crop Coordinates (430×932 mobile, 2x DPR)
- **Full clock (landing)**: `{x:60, y:190, width:740, height:740}`
- **Subdial at 6 o'clock**: `{x:280, y:700, width:200, height:200}`
- **Full landing page**: no clip (full viewport)

### Recording Clips
For video/GIF captures of the live scene:
1. Use Puppeteer `page.screencast()` or `page.screenshot()` in a loop
2. ffmpeg to stitch frames or convert to GIF/MP4
3. Target 60fps for smooth hand movement
4. 15-30 second clips for social (posting-schedule.md says video is NON-NEGOTIABLE)

---

## Lessons Learned

1. **Small renders look soft** — always render at highest practical resolution, let target device downscale
2. **Cube edges must be on top** — layer order prevents hands from overlapping cube wireframe
3. **Refraction is Y-only** — simpler than RGB split, cleaner, tells the same story
4. **10:10 is universal** — no prayer-window conflict, classic symmetric pose
5. **#0d0d12 not #000** — matches app background, prevents jarring contrast on embeds
6. **png-to-ico works** — no imagemagick needed, `npx png-to-ico` generates valid .ico from PNGs
7. **SVG clip-rule="evenodd"** — required for inverse clipping (outside-cube mask)

---

## Regenerating Assets

From the repo root:
```bash
node generate-brand-assets.js  # TODO: extract inline script to reusable file
```

Or use the template in `/tmp/brand-offset2.html` as reference.

All coordinates derived from the live webapp's splash SVG (intercepted via `Element.prototype.remove` override on `#splash`).
