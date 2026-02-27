# Bauhaus Clock Deep Dive — What to Steal

## About Atilla Taşkıran
- German-based freelance software designer (@_atilla1, 10K followers)
- CODA (Child of Deaf Adults), father of two
- Mechanical watch enthusiast — this isn't just a coding project, it's a passion
- Clients: Deutsche Bank, Mercedes Benz, Samsung, Trivago, Vodafone, Telekom
- Sells on Gumroad: $20, lifetime updates, no discounts ever ("honest pricing")
- Website built with Framer (won One Page Love award)
- Featured by MKBHD ("Dope Tech"), Pocket-lint ("best purchase of 2026"), Product Hunt
- V2.0 completely rewritten in SwiftUI (confirmed via LinkedIn)
- Had IP issue early on — original design was too close to Max Bill watch dial, took it offline to redesign with original "Bauhaus Numerals"

## Design Philosophy (What to Steal)

### 1. Watch Industry Language
- Calls color options "dials" not "themes"
- Calls animation options "movements" not "modes"
- Uses horological terms: "caliber", "lume", "indices", "beats per hour"
- **Steal this**: Our Ramadan clock should speak watch language. "Dials" not "themes". "Complications" for the prayer/fasting overlays.

### 2. Movement Precision
- **Quartz**: 1Hz tick (second hand jumps once per second)
- **Mechanical**: 4Hz sweep = 28,800 beats/hour (second hand sweeps in tiny 8-per-second steps — exactly like a real ETA movement)
- **Digital**: Continuous smooth motion
- **Steal this**: We already have smooth seconds. Add quartz tick AND mechanical 4Hz sweep. The 28,800 BPH is the killer detail — watch enthusiasts will LOVE it.

### 3. Day/Night Dual Modes
- Day: 16 colorful dials (White, Turquoise, Glacier, Ocean, Tennis, Signal Blue, Salmon, Yellow, Beige, Pistachio, Lavender, Rose, Sky Blue, Cream, Slate, Noir)
- Night: Pure black background + choice of 14 luminescence colors (lume)
- Red lume option specifically for preserving night vision
- **Steal this**: Our night mode should go full black + lume. Add a red lume option for nighttime use. The "Tennis" dial we copied IS one of his 16 day dials.

### 4. OLED Burn-In Protection (Pixel Shift)
- Smart algorithm slightly shifts all on-screen elements over time
- Invisible to user but prevents static pixel burn
- Apple-notarized for seamless install
- **Steal this**: Essential for any always-on display or screensaver use. Simple to implement — random subtle xy offset every few minutes.

### 5. Custom Typography
- Created "Bauhaus Numerals" — custom-designed typeface exclusively for the clock
- Originally used Max Bill-inspired numerals but hit IP issues
- **Steal this**: We should consider custom Arabic-Indic numerals designed specifically for our clock. A bespoke numeral set would elevate the whole project.

### 6. Obsessive Detail Culture
- "Built for the ones who notice everything"
- "Obsessive attention that leaves nothing unconsidered"
- Settings panel gets "the full treatment too"
- Even the settings UI is beautiful
- No sales, no discounts — quality speaks
- **Steal this**: Every pixel matters. Settings panel, loading states, prayer time pills — all must feel premium.

### 7. Minimal UI, Maximum Feel
- "Wordless clock" — no text on the dial itself
- "Speaks ten, shows none" (10 languages supported, but clock is universal)
- Two dial sizes: classic and compact
- **Steal this**: Our clock should work wordlessly. The Islamic elements (fasting arc, prayer markers) should communicate without labels.

## Color Palette Analysis

### Day Dials (16 total)
Each dial is a complete color system — not just a background swap. Face, hands, indices, numerals all shift together.

**Warm cluster**: Salmon, Yellow, Beige, Cream
**Cool cluster**: Turquoise, Glacier, Ocean, Sky Blue, Signal Blue
**Neutral cluster**: White, Slate, Noir
**Accent cluster**: Tennis (our current), Pistachio, Lavender, Rose

### Night Mode
- Pure black (#000) background
- 14 lume color options
- Lume applies to: numerals, indices, hand strips
- Everything else disappears into black
- **Key insight**: Night mode isn't a "dark theme" — it's a completely different rendering mode that simulates photoluminescent watch lume in darkness

## Interactive Features

### Implemented
- Dial selection (16 day / 14 night lume colors)
- Movement type switching (quartz/mechanical/digital)
- Day/night toggle
- Classic/compact dial size
- 10-language settings
- Pixel shift burn-in protection
- Responds to macOS light/dark mode

### Not Implemented (Opportunities for Us)
- No complications (date, weather, etc.) — we ADD prayer times
- No interactivity on the clock face itself — just display
- No iOS version (yet) — OPPORTUNITY
- No web version — we're ALREADY there
- No customizable complications — we could let users toggle fasting arc, prayer markers, Hijri date
- No ambient sound — could add subtle adhan notification

## Tech Stack

### Bauhausclock
- **macOS screensaver** (.saver bundle)
- **SwiftUI** (confirmed: V2.0 "completely rewritten in SwiftUI")
- **Sold via Gumroad** ($20, 87 ratings, 4.9 stars)
- Apple-notarized
- No iOS app yet

### What We Need for iOS

#### Option A: Native iOS App (SwiftUI)
- **Language**: Swift + SwiftUI
- **Frameworks**: 
  - SwiftUI for UI
  - Core Animation / Metal for smooth clock rendering
  - WidgetKit for Lock Screen / StandBy widgets
  - Core Location for automatic prayer time location
  - Background App Refresh for prayer time updates
- **Distribution**: App Store ($99/yr developer account)
- **Advantages**: StandBy mode (iPhone as bedside clock), Lock Screen widgets, Apple Watch complications, native performance
- **Claude + Xcode**: Xcode 26.3 just shipped (Feb 2026) with native Claude Agent SDK integration. Claude can capture SwiftUI previews, analyze visual output, iterate on designs autonomously. This is LITERALLY built for this.

#### Option B: PWA (Progressive Web App)
- **What we have now**: Already a web app
- **Add**: Service worker, manifest.json, offline caching
- **Advantages**: Works everywhere, no App Store needed, single codebase
- **Disadvantages**: No StandBy mode, no Lock Screen widgets, no Apple Watch, limited background access, no native feel
- **Good for**: Android users, quick distribution

#### Option C: Hybrid (Capacitor/React Native)
- Not recommended — worst of both worlds for this type of app

### Recommended Path
1. **NOW**: Ship the web version (Ramadan starts Feb 17)
2. **NEXT**: Build native iOS with SwiftUI + Claude in Xcode 26.3
3. **LATER**: Apple Watch complication, iPad StandBy, macOS screensaver

## Skills Needed

### Already Have
- ✅ HTML/CSS/JS (web version)
- ✅ Canvas 2D rendering
- ✅ API integration (Aladhan prayer times)
- ✅ Responsive design
- ✅ Color theory / palette design

### Need to Learn/Build
- 🔧 **Swift/SwiftUI** — for native iOS app (Claude in Xcode 26.3 handles most of this)
- 🔧 **Metal or Core Animation** — for buttery smooth clock rendering on iOS
- 🔧 **WidgetKit** — Lock Screen widget showing next prayer / fasting progress
- 🔧 **StandBy API** — iPhone as bedside Ramadan clock (KILLER feature)
- 🔧 **WatchKit** — Apple Watch complications (fasting countdown on wrist)
- 🔧 **App Store mechanics** — submission, review guidelines, TestFlight beta
- 🔧 **Three.js / WebGL** — for more advanced 3D web version (Ressence-style)
- 🔧 **Pixel shift algorithm** — for OLED burn-in protection
- 🔧 **28,800 BPH mechanical movement** — 4Hz second hand stepping
- 🔧 **Custom Arabic-Indic numeral design** — bespoke typography
- 🔧 **Night/lume mode** — pure black + photoluminescent simulation

### Claude + Xcode 26.3 (Game Changer)
- Apple officially integrated Claude Agent SDK into Xcode (announced Feb 2026)
- Claude can: capture SwiftUI previews, analyze visual output, iterate designs
- Full project-aware context (understands your app architecture)
- Autonomous long-running tasks — not just turn-by-turn
- **This means**: Tawfeeq can direct the design, Claude builds it in Xcode, previews it, fixes it, iterates. Exactly our "creative director + engineering team" model.
- Need: Mac with Xcode 26.3 + Claude subscription (already have)

## Key Takeaways

1. **Speak watch language** — "dials", "movements", "complications", "lume"
2. **28,800 BPH mechanical sweep** — the detail that separates us from every other clock app
3. **Night/lume mode** — pure black + configurable lume color (including red for night vision)
4. **Pixel shift** — essential for always-on/screensaver use
5. **Custom numerals** — bespoke Arabic-Indic type designed for this clock
6. **iOS via SwiftUI + Claude in Xcode 26.3** — the path is clear and the tools are ready
7. **StandBy mode** — iPhone as bedside Ramadan clock is the KILLER feature
8. **No compromises on settings UI** — every screen must feel premium
9. **"Honest pricing"** — buy once, lifetime updates. No subscriptions, no ads.
10. **Ship web first, native second** — Ramadan starts in 5 days

## Monitor
- @_atilla1 — watch for iOS version announcement, design tips, new dials
- bauhausclock.com — changelog, new features
- Xcode 26.3 Claude Agent SDK docs — for iOS development
