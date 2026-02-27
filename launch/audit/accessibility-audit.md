# Accessibility Audit — agiftoftime.app
**Date:** 2026-02-17 | **Grade: C+**

## aria-labels on Interactive Elements

### ✅ Good
- Close button: `aria-label="Close"`
- Mode toggle: `aria-label="Toggle day/night"`
- Prev/Next arrows: `aria-label="Previous"`, `aria-label="Next"`
- Dial dots: `aria-label="${dialName}"` (dynamically generated)
- Fullscreen dial bar dots: `aria-label="${surahName}"`

### 🔴 Missing
- **"Open Clock" nav button** — no aria-label, but has visible text ✅ (acceptable)
- **"Keep this free" link** — no `role="link"` needed (is already `<a>`) ✅
- **Verse "Listen" buttons** — use `onclick` on `<button>`, have visible text ✅
- **"Play Spatial Adhan" button** — has visible text ✅
- **Sticky CTA ("Keep this free")** — `<a>` tag with visible text ✅
- **`fsListenBtn`** — inline `onclick`, no aria-label but has visible text ✅
- **Dial hero container (`#dialHero`)** — WebGL canvas with no `aria-label` or `role`
  - Fix: Add `role="img" aria-label="Interactive prayer clock with Qibla compass"`

## Color Contrast

### CSS Variables (Day Mode)
| Element | Foreground | Background | Ratio | Pass? |
|---------|-----------|------------|-------|-------|
| Body text | `#1a1a1a` | `#f8f7f4` | ~16:1 | ✅ AAA |
| Muted text | `#6b6b6b` | `#f8f7f4` | ~5.5:1 | ✅ AA |
| Gold label | `#c8a44e` | `#f8f7f4` | ~3.3:1 | 🔴 Fail AA |
| Verse ref | `#6b6b6b` | `#f8f7f4` | ~5.5:1 | ✅ AA |

### CSS Variables (Night Mode)
| Element | Foreground | Background | Ratio | Pass? |
|---------|-----------|------------|-------|-------|
| Body text | `#e8e4dc` | `#0c0c12` | ~14:1 | ✅ AAA |
| Muted text | `#8a8a8a` | `#0c0c12` | ~6:1 | ✅ AA |
| Gold label | `#c8a44e` | `#0c0c12` | ~5:1 | ✅ AA |

### Fullscreen Overlay
| Element | Foreground | Background | Ratio | Pass? |
|---------|-----------|------------|-------|-------|
| Header text | `rgba(255,255,255,.65)` | `#585860` | ~3.5:1 | 🔴 Fail |
| Prayer bar | `rgba(255,255,255,.55)` × 0.55 | `#585860` | ~2.5:1 | 🔴 Fail |
| Close button | `rgba(255,255,255,.6)` | varies | ~3:1 | 🔴 Fail |

### 🔴 Issues
1. **Gold section labels** (`#c8a44e` on `#f8f7f4`) fail WCAG AA (3.3:1 < 4.5:1)
   - Fix: Darken to `#9a7a2e` or similar (~4.5:1)
2. **Fullscreen chrome text** too transparent — fails contrast on all overlays
   - Fix: Increase opacity to at least 0.8 for readable text

## Keyboard Navigation

### 🔴 Issues
1. **No visible focus indicators** — `:focus` styles not defined for buttons
   - Fix: Add `button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }`
2. **No skip-to-content link** — screen reader users must tab through nav
3. **Scroll-snap sections** — not keyboard-navigable by section
4. **Fullscreen overlay** — no focus trap; Tab can reach hidden elements behind overlay
   - Fix: Implement focus trap when `.clock-fs-overlay.active`
5. **WebGL canvas** — not keyboard-accessible (expected for decorative content)

### ✅ Working
- Buttons are `<button>` elements (natively focusable)
- Links are `<a>` elements
- Prev/Next arrows are `<button>` elements

## Screen Reader Considerations

### 🔴 Issues
1. **WebGL canvas has no text alternative** — screen readers see nothing
   - Fix: Add `aria-label` to `#dialHero` and SR-only text describing the clock state
2. **Dynamic prayer times** — `#pcTimes` and `#navNext` update via JS with no `aria-live`
   - Fix: Add `aria-live="polite"` to prayer time containers
3. **Section structure** — uses `<section>` without `aria-labelledby`
   - Fix: Add `id` to section titles and reference via `aria-labelledby`
4. **Arabic verse text** — no `lang="ar"` attribute on `.verse-ar` elements
   - Fix: Add `lang="ar" dir="rtl"` to all Arabic text elements
5. **Adhan banner** (auto-appears at prayer time) — no `role="alert"` or `aria-live`

### ✅ Working
- `<h1>` and `<h2>` hierarchy is correct
- `<nav>` landmark present
- `<footer>` landmark present
- Sections use semantic `<section>` elements

## Missing Alt Text

- ✅ No `<img>` tags on page — all visual content is CSS/SVG/Canvas
- 🔴 WebGL canvas has no text alternative (see above)
- SVG icons are inline, decorative — acceptable without alt

## Focus Management in Fullscreen Mode

### 🔴 Issues
1. **No focus trap** — when fullscreen overlay opens, focus can Tab behind it
2. **No focus restoration** — when closing fullscreen, focus doesn't return to trigger button
3. **Close button** — works but no `Escape` key handler
   - Fix: Add `keydown` listener for Escape to close fullscreen
4. **Auto-scroll tour** — steals scroll from keyboard/screen reader users
   - Fix: Disable tour when screen reader is detected (check `prefers-reduced-motion`)

### ✅ Working
- Close button is focusable `<button>`
- Back button (browser) closes overlay via `popstate`

## Reduced Motion

- ✅ `@media(prefers-reduced-motion:reduce)` disables `.reveal` animations
- 🔴 Does NOT disable:
  - Three.js clock animation (continuous)
  - Heart pulse animation
  - Scroll-snap behavior
  - Guided auto-scroll tour
  - Night mode transitions

## Summary & Priority Fixes

1. **🔴 Focus trap in fullscreen overlay** — critical for keyboard users
2. **🔴 Arabic text needs `lang="ar"`** — screen readers will mispronounce
3. **🔴 Gold label contrast** — fails WCAG AA
4. **🔴 Fullscreen text contrast** — too transparent
5. **🟡 WebGL canvas alt text** — add `aria-label` to `#dialHero`
6. **🟡 `aria-live` on dynamic prayer times** — screen readers miss updates
7. **🟡 Visible focus indicators** — add `:focus-visible` styles
8. **🟡 Skip-to-content link** — standard a11y pattern
9. **🟢 Escape key to close fullscreen** — expected behavior
10. **🟢 Disable auto-tour for `prefers-reduced-motion`**
