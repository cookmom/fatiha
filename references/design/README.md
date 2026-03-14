# Design References — A Gift of Time

## Mockups

### mockup-mode-pill (v1) — 2026-02-28
- **SVG + PNG** — First mockup of three-mode navigation
- Floating pill with primitive geometry icons: ○ ◇ △
- Countdown top-left, Hijri center, prayer bar bottom of header
- Golden ratio pill width (375/φ = 232px)

### mockup-v2 — 2026-02-28
- **SVG + PNG** — Updated header: location top-left, countdown top-right
- Location with pin icon + chevron (tappable, expands to picker)
- Same mode pill, same cube positioning

### mockup-location-picker — 2026-02-28
- **SVG + PNG** — Full-screen location picker (expanded state)
- Search bar + "Use Current Location" (GPS) + iOS-style roller
- Popular Muslim cities pre-loaded
- Prayer times preview updates live per selected city
- Frosted glass sheet, cube dimmed behind

## Design Philosophy

### Mathematical Composition
- **Golden ratio (φ = 1.618)** — pill width, spacing, proportions
- **Rule of thirds** — cube placement, element positioning
- **Modular type scale** — base × φⁿ

### Primitive Geometry Icons
- ○ Circle = Clock (cycle, time, wholeness)
- ◇ Diamond = Compass (Ka'bah from above, direction)
- △ Triangle = Info (directive, knowledge, pointing)
- Three building blocks of all geometry — connects 3D cube hero to 2D UI

### Design Ethos
- Islamic geometric art tradition = mathematics made visual
- Every proportion intentional, not arbitrary
- Tech + sacred geometry + meditative calm
- Apple Camera-style "floating pill" pattern (HIG: immersive content apps)
- Minimal chrome — content IS the experience

### Color & Material
- Background: #0d0d12
- Frosted glass: rgba(18,18,22,0.75) + blur(20px) saturate(180%)
- Text: rgba(232,228,220) at varying opacities
- Active: glow + dot indicator, Inactive: 35% opacity
- Accent: rgba(120,160,255) for interactive elements

### Typography
- SF Pro / system-ui for UI
- SF Mono for countdown
- Inter ultralight for body copy (per DESIGN-SYSTEM.md)

### Composition References
- Apple Camera mode switcher
- Apple Maps bottom sheet
- iOS UIPickerView roller
- Apple HIG: immersive content navigation
