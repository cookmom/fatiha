# Launch Checklist — agiftoftime.app
**Date:** 2026-02-17 | **Verdict: CONDITIONAL GO** ✅ (fix 4 blockers)

## 🔴 Blockers (Must Fix Before Launch)

- [ ] **og-image.png returns 404** — social shares show no image
- [ ] **apple-touch-icon.png returns 404** — iOS home screen shows no icon
- [ ] **manifest.json `start_url` is `/ramadan-clock/`** — should be `/` or `/#clock`; PWA install will fail
- [ ] **Service worker doesn't cache clock.js or studio.hdr** — clock won't work offline

## Infrastructure

- [x] SSL/HTTPS working — GitHub Pages, valid cert
- [x] Custom domain resolving — `agiftoftime.app` → GitHub Pages
- [x] DNS propagated
- [x] robots.txt present and correct
- [x] sitemap.xml present with 4 URLs
- [x] 200 response on all key pages (index, manifest, sw.js, clock.js)

## Content & Functionality

- [x] Landing page loads and renders
- [x] All 7 scroll sections display correctly
- [x] Quranic verses display in Arabic + English
- [x] Prayer times fetched from Aladhan API
- [x] Hijri date calculation (client-side Intl API)
- [x] 11 dial designs cycle correctly
- [x] Night mode CSS transition (day ↔ night variables)
- [ ] Night mode Three.js transition — needs testing on device
- [x] Dial picker (dots + prev/next arrows)
- [x] Verse audio playback (Islamic.network CDN)
- [x] Surah audio playback (Quranic Audio CDN)
- [x] Spatial adhan with HRTF + StereoPanner
- [x] Adhan background/foreground handoff (visibility API)
- [x] Auto-adhan at prayer times with fallback banner
- [x] Qibla compass calculation (great circle bearing)

## Mobile & Responsive

- [x] Viewport meta tag with `viewport-fit=cover`
- [x] CSS clamp() for responsive typography
- [x] `--clock-size: min(480px, 85vw)` responsive sizing
- [x] Media queries for 768px and 1200px breakpoints
- [x] Touch swipe on dial hero (horizontal = dial change)
- [x] Touch swipe in fullscreen (vertical = day/night toggle)
- [x] Safe area insets for notched phones (`env(safe-area-inset-*)`)
- [ ] **iOS Safari tested** — needs manual device testing
- [ ] **Android Chrome tested** — needs manual device testing
- [ ] **iPad/tablet tested** — needs manual testing

## PWA

- [x] manifest.json exists and serves with 200
- [ ] **manifest.json start_url incorrect** (`/ramadan-clock/` should be `/`)
- [x] Service worker registered (`sw.js`)
- [x] SW caches core HTML + icons
- [ ] **SW missing clock.js, studio.hdr, Three.js** — clock broken offline
- [x] Icons: 192px and 512px defined in manifest
- [ ] **Icon files existence** — not verified (icon-192.png, icon-512.png)
- [x] `display: standalone` in manifest
- [x] `orientation: portrait`
- [x] Install instructions section on landing page (3-step Safari guide)

## SEO & Social

- [x] Title tag — keyword-rich, branded
- [x] Meta description — comprehensive
- [x] Open Graph tags — complete set
- [ ] **OG image 404** — must upload og-image.png
- [x] Twitter Card tags — summary_large_image
- [ ] Missing `twitter:site` / `twitter:creator`
- [x] JSON-LD WebApplication schema
- [x] JSON-LD FAQPage schema (5 Q&As)
- [x] Canonical URL set
- [x] `lang="en"` on html element

## Accessibility

- [x] Semantic HTML (`<nav>`, `<section>`, `<footer>`, headings)
- [x] aria-labels on navigation buttons
- [ ] Missing `lang="ar"` on Arabic text elements
- [ ] Gold label text fails WCAG AA contrast
- [ ] Fullscreen overlay text too low contrast
- [ ] No focus trap in fullscreen overlay
- [ ] No visible focus indicators (`:focus-visible`)
- [ ] No skip-to-content link
- [x] `prefers-reduced-motion` partially respected

## Analytics & Tracking

- [x] Supabase configured (signups table, anon key)
- [x] Supporter count fetched for sticky CTA
- [ ] No page view analytics — consider lightweight option (Plausible, Umami)
- [x] No third-party trackers (privacy-friendly ✅)
- [x] Formspree backup for form submissions

## Error Handling

- [x] Geolocation fallback (timezone-based city, then hardcoded LA)
- [x] Prayer API fallback (coords → city-based)
- [x] Adhan playback fallback chain (HRTF → plain Audio → banner)
- [x] Gyroscope permission handling (iOS 13+ requestPermission)
- [x] WebGL graceful handling (Three.js manages this)
- [ ] No error reporting/logging to server
- [x] Service worker fetch: network-first with cache fallback

## Audio

- [x] Adhan: Mishary Rashid al-Afasy from GitHub CDN
- [x] HRTF spatial panning toward Qibla
- [x] MediaSession API for lock screen controls
- [x] iOS audioSession.type = 'playback' (iOS 17+)
- [x] Background audio handoff (HRTF ↔ plain Audio on visibility change)
- [x] Pre-unlock Audio on first touch (iOS)
- [x] Verse audio from Islamic.network CDN
- [x] Surah audio from Quranic Audio CDN

## Performance

- [x] HTML < 80KB (single page)
- [ ] Phosphor Icons: 2 full CSS sheets for ~6 icons (render-blocking)
- [x] Google Fonts with `display=swap`
- [x] Preconnect hints for fonts
- [x] Clock.js uses `?v=115` cache buster
- [ ] No preload hints for critical assets
- [x] esm.sh CDN for Three.js (cached, edge-distributed)

## Legal & Content

- [x] Privacy page linked in footer (`privacy.html`)
- [x] Support page linked (`support.html`)
- [x] Author attribution (Tawfeeq Martin)
- [x] Feedback email in footer
- [x] "No ads, no tracking" claim — verified ✅

## Launch Day Tasks

1. [ ] Upload `og-image.png` (1200×630) to site root
2. [ ] Upload `apple-touch-icon.png` (180×180) to site root
3. [ ] Fix manifest.json `start_url` to `/` or `/#clock`
4. [ ] Add `clock.js` and `studio.hdr` to SW cache
5. [ ] Verify icon-192.png and icon-512.png exist
6. [ ] Test PWA install on iOS Safari
7. [ ] Test PWA install on Android Chrome
8. [ ] Test adhan playback on iOS (background + foreground)
9. [ ] Share test: paste URL in WhatsApp/Twitter/iMessage — verify preview card
10. [ ] Lighthouse run for baseline scores

---

**Bottom line:** The app is feature-complete and beautifully crafted. Four blocking issues (all asset/config related, no code changes needed) stand between this and a clean launch. Fix those, do a quick device test pass, and ship it. 🚀
