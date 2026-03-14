# DESIGN-SYSTEM.md — Tawfeeq Martin / Ramadan Clock

The canonical design language for all web, print, and digital output. Every sub-agent, every page, every PDF must follow this.

## Reference
- Aesthetic benchmark: bauhausclock.com — clean, editorial, premium product feel
- We are NOT bauhausclock. We take the discipline, not the identity.

## Color

### Light Theme (default — websites, PDFs, print)
| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#f8f7f4` | Page background (warm white) |
| `--fg` | `#1a1a1a` | Primary text |
| `--dim` | `rgba(26,26,26,.55)` | Secondary text |
| `--muted` | `rgba(26,26,26,.3)` | Tertiary text, labels |
| `--accent` | `#c8a44e` | Gold accent — use sparingly |
| `--accent2` | `#4ade80` | Green — Qibla/Islamic alignment only |
| `--border` | `rgba(26,26,26,.08)` | Card borders, dividers |
| `--card-bg` | `rgba(26,26,26,.03)` | Card backgrounds |

### Dark Theme (clock app, overlays)
| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0a0a0a` | Background |
| `--fg` | `#f5f5f0` | Primary text |
| `--dim` | `rgba(245,245,240,.5)` | Secondary text |
| `--muted` | `rgba(245,245,240,.25)` | Tertiary text |
| `--glass` | `rgba(255,255,255,.04)` | Glass card bg |
| `--glass-border` | `rgba(255,255,255,.08)` | Glass card border |

### Dial Colors (Ramadan Clock)
| Name | Hex |
|------|-----|
| White | `#e8e4dc` |
| Tennis | `#c0392b` |
| Salmon | `#e8967a` |
| Slate | `#4a5568` |
| Signal Blue | `#2563eb` |
| Cream | `#f5f0e0` |

## Typography

### Font
**Inter** — the only font. Load weights 200, 300, 400, 500, 600.
```
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');
```
Exception: **Lateef** for Arabic script numerals on the clock only.

### Scale
| Element | Weight | Size | Letter-spacing |
|---------|--------|------|----------------|
| Hero h1 | 200 | `clamp(3rem, 8vw, 6rem)` | `-0.03em` |
| Section h2 | 200 | `clamp(2rem, 4vw, 3.5rem)` | `-0.02em` |
| Section h3 | 400 | `clamp(1rem, 2vw, 1.4rem)` | `-0.01em` |
| Body | 300 | `clamp(.95rem, 1.3vw, 1.15rem)` | `0` |
| Label | 500 | `clamp(.65rem, .9vw, .8rem)` | `0.15em` uppercase |
| Small / caption | 300 | `0.85rem` | `0` |

### Rules
- **Never use weight 700+** in user-facing text (600 max, for small labels only)
- **Ultralight (200) for all headings** — this is the signature
- **Generous line-height**: headings 1.05–1.15, body 1.7
- **No bold body text** — use weight 500 or color/opacity for emphasis
- Headlines can break across lines — embrace it

### Sticky Text (Zero Layout Shift)
Any text that updates dynamically (countdowns, headings, coordinates, prayer times) MUST NOT cause layout shift:
- **`font-variant-numeric: tabular-nums`** — every digit gets equal width
- **Zero-pad numbers** to fixed width: `009°` not `9°`, `02:14` not `2:14`
- **Never change `font-weight` on dynamic text** — weight affects character width, causes reflow
- **Never add/remove `text-decoration`** — underlines change line box height
- **Use `opacity` and `color` for emphasis** — these are paint-only, zero layout cost
- **Rule of thumb:** if a value changes at 60fps (compass heading) or on user interaction (swipe preview), it must be sticky text. No exceptions.

## Icons

### Phosphor Icons — Thin weight ONLY
```html
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css">
<i class="ph-thin ph-moon-stars"></i>
```

### Rules
- **NO standard emoji** anywhere — not in HTML, not in notifications, not in PDFs
- **Thin weight only** — matches the ultralight typography
- Icon size: typically 1.5–2.5rem, matching nearby text hierarchy
- Color: inherit from text color, or use `--muted` for decorative icons
- Common icons we use:
  - `ph-moon-stars` — night / Islamic
  - `ph-sun` — day mode
  - `ph-hand-tap` — tap gesture
  - `ph-arrows-horizontal` — swipe
  - `ph-compass` — qibla
  - `ph-clock-countdown` — countdown / timer
  - `ph-bell-simple` — prayer alarm
  - `ph-palette` — dials / customization
  - `ph-device-mobile` — mobile / PWA
  - `ph-envelope-simple` — contact
  - `ph-arrow-up-right` — external link

## Layout

### Spacing
- Section padding: `clamp(100px, 15vh, 180px)` vertical
- Container max-width: `1200px`
- Container padding: `clamp(24px, 5vw, 64px)` horizontal
- Between elements: use multiples of 8px (8, 16, 24, 32, 48, 64)
- **Let it breathe** — when in doubt, add more whitespace

### Cards
- Border-radius: `16–20px`
- Border: `1px solid var(--border)`
- Background: `var(--card-bg)`
- Padding: `28–32px`
- Hover: subtle lift `translateY(-2px)` with transition
- **No drop shadows on light theme** — borders only
- **No glass morphism on light theme** — that's dark-theme only

### Buttons
- Border-radius: `12px`
- Primary: `bg: var(--fg), color: var(--bg)` (inverted)
- Secondary: `bg: transparent, border: 1px solid var(--border)`
- Padding: `14px 32px`
- Font: inherit, weight 500, size 0.95rem
- Hover: primary gets subtle lift + shadow; secondary gets light fill

### Grid
- Feature sections: alternating 2-column (text | visual), swap each row
- Card grids: 3-column on desktop, 1-column on mobile
- Gallery: horizontal scroll with `scroll-snap-type: x mandatory`

## Clock Page UI Overlay (index-threejs.html)

The clock page has its own overlay UI that appears on tap. It must match the main site's design language while being minimal enough to not compete with the clock face.

### Hierarchy (top to bottom)
| Element | Position | Weight | Size | Spacing | Opacity |
|---------|----------|--------|------|---------|---------|
| Prayer times | Top-left | 300 | .65rem | .12em | 0.55 |
| Mode toggle | Top-right | — | 20px icon | — | inherit |
| Dial name | Above dots | 500 | .7rem | .15em uppercase | 0.7 |
| Surah name | After dial name | 200 | .75rem | .04em | 0.5 |
| Listen button | Inline with surah | — | 12px icon | — | 0.4 |
| Dial dots | Bottom area | — | 6px | 7px gap | 0.25 border |
| Date (hijri) | Bottom center | 300 | .8rem | .04em | inherit |
| Date (gregorian) | Below hijri | 200 | .7rem | — | 0.6 |

### Rules
- All text inherits dial theme color (`c.text`)
- Auto-hide after 4s of no interaction
- Fade in/out with `.4s` transition
- Prayer bar shows all 5 salawat: `Fajr · Dhuhr · Asr · Maghrib · Isha`
- Dial dots: 6px, 1.5px border, active state = filled with higher opacity
- Text never competes with the clock face — opacity is key

## Animation

### Scroll Reveal
```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
```
- Fade up: `opacity 0→1, translateY(40px→0)`
- Duration: `0.8s cubic-bezier(.4,0,.2,1)`
- Stagger children with delay classes (0.1s increments)
- **Respect `prefers-reduced-motion`** — disable all animation

### Transitions
- Default easing: `cubic-bezier(.4,0,.2,1)` (material standard)
- Spring curves for playful elements: `cubic-bezier(.175,.885,.32,1.275)`
- Duration: 0.3s for micro-interactions, 0.6–0.8s for reveals
- **No flashy/gimmicky CSS animations** — subtle and purposeful only

### Clock-specific
- Tawaf: mechanical, CCW, ease-out landing
- Mode transitions: smooth blend (0.04 rate per frame)
- Split-flap: per-character 3D flip with stagger

## Content Rules

### Voice
- Understated and confident — not salesy, not corporate
- Short sentences. Let the work speak.
- Labels are uppercase, letter-spaced, minimal words
- Body text is warm but concise

### Islamic Content
- No standard emoji for Islamic symbols (no ☪ 🕌 🕋 🌙)
- Use Phosphor icons or custom SVG instead
- Subtle, respectful integration of faith — never performative
- No music/audio references in Tawfeeq's personal content

### What NOT to include on public pages
- No GitHub links (we're a product, not an open source project)
- No @LOOKMOM / X alias (that's a separate identity)
- No "open source" language
- No developer jargon aimed at end users
- No job titles in hero sections — show, don't tell

## File Structure
- Single self-contained HTML files where possible
- Inline `<style>` and `<script>` — no build step
- External dependencies: Google Fonts + Phosphor Icons CDN only
- Mobile-first responsive with `clamp()` for fluid sizing

## Brand Hierarchy
- **tawfeeqmartin.com** — personal site, the builder
- **Ramadan Clock** — product, "by Tawfeeq Martin"
- **fatiha.app** — future Quran app, separate brand (when ready)

---

## Stars — Islamic Meaning

Stars in our night mode are not decorative. They carry meaning from the Quran and Hadith:

- **Prophet Yusuf's Dream (Surah Yusuf 12:4)**: Eleven stars, the sun, and the moon prostrating — foretelling reconciliation with his eleven brothers (stars), father (sun), and mother (moon)
- **Navigation & Guidance (6:97)**: Stars created for guidance in the darkness of land and sea
- **Adornment**: Stars beautify the sky as signs of creation
- **Reflection**: Muslims are encouraged to look at the sky and reflect on the Creator's work

### Implementation
- Night mode renders **exactly 11 stars** — a reference to Yusuf's dream
- Stars are not random scatter — they are intentional, placed with care
- The moon is the companion to the 11 stars (already in our night mode)
- This should be mentioned on the website as a meaningful design choice

## Research & Execution Philosophy

Every feature we build goes through this process:

1. **Go wide** — research the history, theology, science, culture behind the concept. Don't stop at the obvious.
2. **Go deep** — find the primary sources (Quran, hadith, tafsir, scholarly consensus). Not Wikipedia summaries.
3. **Find the elegant intersection** — where meaning meets design. The 11 stars aren't random dots — they prostrate because the Quran says they prostrated. The tawaf is CCW because that's the real direction around the Kaaba. The first gong lands exactly at Maghrib because that's when the fast breaks.
4. **Execute with restraint** — the detail should reward the curious, not overwhelm the casual user. If you know the story, the stars move you. If you don't, they're still beautiful.
5. **Document the meaning** — every intentional choice gets a comment in the code and a line on the website. This is what makes the work special.

**The standard:** If someone knowledgeable in Islam looks at our work, they should find nothing careless and everything considered. If someone who knows nothing about Islam looks at it, they should find it beautiful and want to learn more.

_This is a living document. Update it as the design evolves._
