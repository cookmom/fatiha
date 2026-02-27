# Performance Audit — agiftoftime.app
**Date:** 2026-02-17 | **Grade: B**

## Page Size & Weight

| Resource | Size | Notes |
|----------|------|-------|
| **index.html** | **79 KB** | Single-file landing + all inline JS/CSS |
| **clock.js** | ~97 KB | Three.js clock engine (ES module) |
| **studio.hdr** | Unknown (200 OK) | HDRI environment map — likely 2-8 MB |
| **Total HTML+JS** | ~176 KB | Before Three.js + deps |

### Verdict
- HTML at 79KB is large but acceptable — it's a single-page app with all CSS/JS inlined
- The real weight is in Three.js and the HDR environment map loaded at runtime

## External Resources

| Resource | Type | Render-blocking? |
|----------|------|-----------------|
| Google Fonts (Inter + Lateef) | CSS | ⚠️ Yes — `<link>` in `<head>` |
| Phosphor Icons (thin + fill) | CSS | ⚠️ Yes — two stylesheets |
| Three.js via esm.sh | JS module | No (import map + module) |
| Aladhan API | Fetch | No (async) |
| Nominatim reverse geocode | Fetch | No (async) |
| Quranic Audio CDN | Audio | No (on-demand) |
| Islamic.network audio | Audio | No (on-demand) |
| Supabase REST | Fetch | No (async) |

**Total external CSS files: 3** (Google Fonts + 2 Phosphor Icon sheets)
**Total external JS: 1** (clock.js as module, which imports Three.js tree)

## Render-Blocking Resources

### 🔴 Issues
1. **Google Fonts** — blocks first paint until downloaded
   - Fix: Add `&display=swap` ✅ (already present)
   - Better: Self-host Inter/Lateef with `font-display: swap`

2. **Phosphor Icons (2 sheets from unpkg.com)** — render-blocking CSS
   - `https://unpkg.com/@phosphor-icons/web@2.0.3/src/thin/style.css`
   - `https://unpkg.com/@phosphor-icons/web@2.0.3/src/fill/style.css`
   - Fix: Load async or inline only the ~10 icons actually used
   - These are full icon libraries loaded for ~6 icon glyphs

3. **No preload for critical resources**
   - Fix: `<link rel="preload" href="clock.js" as="script" crossorigin>`
   - Fix: `<link rel="preload" href="studio.hdr" as="fetch" crossorigin>`

## Three.js Bundle Considerations

- **Import map** points to `esm.sh/three@0.170.0` — CDN-served, tree-shaken per import
- Imports: `Three`, `EffectComposer`, `RenderPass`, `UnrealBloomPass`, `RectAreaLightUniformsLib`, `RGBELoader`
- **Estimated Three.js download: ~600-800 KB** (gzipped ~180-250 KB)
- esm.sh provides good caching + CDN edge distribution
- ⚠️ No local fallback if esm.sh is down

### Recommendations
- Consider bundling Three.js locally (Vite/Rollup) to control versioning and reduce CDN dependency
- Tree-shake unused Three.js modules
- The HDR file (`studio.hdr`) should be compressed or replaced with a lighter `.env` format

## Caching Headers

| Resource | Cache-Control | Notes |
|----------|--------------|-------|
| index.html | `max-age=600` (10 min) | GitHub Pages default — fine for static |
| clock.js | `max-age=600` | Uses `?v=115` cache-buster ✅ |
| sw.js | `max-age=600` | ⚠️ SW should have short/no cache |
| studio.hdr | `max-age=600` | ⚠️ Large asset, should cache longer |

- GitHub Pages doesn't allow custom cache headers — acceptable tradeoff
- CDN assets (esm.sh, unpkg, Google Fonts) have their own long caching ✅

## Image Optimization

- **No `<img>` tags on the page** — everything is CSS/SVG/Canvas
- ✅ Icons use Phosphor font icons (vector)
- ✅ Clock rendered via WebGL canvas
- 🔴 `og-image.png` doesn't exist (404) — when created, optimize to WebP with PNG fallback

## Service Worker

- ✅ Present (`sw.js`) with network-first strategy
- ✅ Caches: `/`, `/index.html`, `/manifest.json`, icons
- ⚠️ Does NOT cache: `clock.js`, `studio.hdr`, Three.js CDN resources
- Fix: Add `clock.js` and `studio.hdr` to ASSETS array for offline support

## Estimated Load Time Assessment

| Connection | Est. First Paint | Est. Interactive |
|-----------|-----------------|-----------------|
| 4G (good) | ~1.5s | ~3-4s |
| 3G | ~3-4s | ~6-8s |
| WiFi | <1s | ~2-3s |

**Bottlenecks:**
1. Render-blocking Phosphor Icon CSS (~2 full sheets for 6 icons)
2. Three.js + HDR download for clock render
3. Geolocation permission prompt delays prayer time fetch

## Summary & Priority Fixes

1. **🔴 Inline or async-load Phosphor Icons** — biggest quick win for FCP
2. **🔴 Add clock.js and studio.hdr to service worker cache** — offline support
3. **🟡 Preload clock.js and studio.hdr** — faster clock render
4. **🟡 Self-host fonts** — eliminate Google Fonts render-blocking
5. **🟢 Consider lighter HDR format** — EXR or compressed HDR
6. **🟢 Bundle Three.js locally** — remove CDN dependency risk
