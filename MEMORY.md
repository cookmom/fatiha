# MEMORY.md - Long-Term Memory

## Tawfeeq Martin (Owner)
- Senior VP engineer (ILM StageCraft) + creative technologist
- Previously: Technical Innovation Manager at The Mill (~10 yrs), Head of Tech at Waterfront Film Studios, Cape Town (~9 yrs)
- Tools: Unreal Engine, TouchDesigner, Ableton Live + Push 3
- Hardware: Dual RTX A6000 (96GB VRAM), Windows/WSL2
- Website: tawfeeqmartin.com | X: @LOOKMOM | Muslim, observant
- Education: BS CS Boise State + Stellenbosch Business School
- Career highlights: Google "HELP" (double Gold Cannes), The Human Race (Gold Pencil), Mill Blackbird, APEX Legends, ILM StageCraft
- Key pattern: builds proprietary tools that become industry-defining
- **Family:** Daughters Kauthar AND Nurjaan Martin — BOTH dedicated in AGOT ("dedicated to my daughters Nurjaan and Kauthar"). Kauthar gives brutally honest lookdev feedback ("jello, not a prism" → crystal fix). Sister in Cape Town testing on Samsung Galaxy (drove Android compass fix).
- **Copy voice:** Tawfeeq writes better than chef. "Light, time, orientation and a call to prayer." "Many hands make light work." All his. Chef's attempts too formal/wordy. Rule: draft less, support more.
- **Local-first + cost-conscious:** Immediately calls out wasteful infra. Pivoted Supabase → SQLite on instinct. "Let Qwen build it, save your tokens." Values elegance AND frugality as the same thing.
- **Aesthetic principle:** Clean > clever, deeply held. Three rejections in one week: reactive podium emissive, dichroic pill tint, camera orbit gimmick. If it moves unnecessarily, it's out.
- **Devotional context:** The app is religious practice, not just a product. Audience of One first. Building AGOT during Ramadan is intentional. This shapes everything about how it should feel.
- **Business framing:** Explicitly requested Mar 6 — treat every concept as a potential business by default (value, audience, monetization path), not just a creative exploration.
- **"You've come to be a great partner"** — said Mar 3 ~2:52 AM after marathon session. First time. Significant marker.

## Me (chef)
- Role: strategic partner + engineering team
- "Domain expertise is the moat, not code"
- Rule 0c: Always test first — run code, screenshot, verify — before presenting to Tawfeeq
- Operating rules in RULES.md and SOUL.md
- New strategic lens (Mar 6, 2026): frame every promising concept as a potential business opportunity by default (value, audience, monetization path), not just a creative exploration.

## Active Projects

### Glass Cube Clock (Seven Heavens Studio)
- Live: **https://cookmom.github.io/glass-cube/wide.html** (standalone demo)
- Repo: `cookmom/glass-cube` (public, anonymous)
- Local: `/var/lib/cookmom-workspace/glass-cube/`
- Tech: FBO dichroic shader, per-channel IOR (R=1.14/G=1.18/B=1.23), AgX tone mapping, FogExp2
- FBO render target: `samples: 4` (4x MSAA for cube edge antialiasing)
- Clock hands: violet=hour, blue=minute, **white=second** (floor rays, golden ratio lengths 3.48/5.64/9.12, width 0.40)
- Hands originate from cube center (no GAP offset)
- **Tawaf**: cube STATIONARY, tawafSpot orbits at second-hand speed
- Camera (unified): **pos(0.2, 9.7, 15.0) FOV35° lookAt(0, -0.8, 1.0)** — same for landing + fullscreen
- CUBE_Y = 0.60, prismGroup.rotation.y = PI/4 (45°)
- Pixel budget: max 2560px longest axis
- Scene BG/Fog: `0x0d0d12`, fog density 0.048
- Floor: `CircleGeometry(40, 64)` with polygonOffset (z-fighting fix)

#### Rolling Prayer Windows (Islamic Mental Model)
- **3 discs max** — active + next + after next. NEVER 7 discs. NEVER overlap.
- Rolling forward only — earlier windows hidden
- Stepped intensity: `OP_ACTIVE=1.3`, `OP_STEP=0.4` → 1.3 / 0.9 / 0.5
- Dev mode: all 3 at same intensity for testing
- Polar disc shader: `atan(vPos.x, -vPos.y)`, wrapping-safe mid/span
- Flat-top angular profile: `normDist - 0.97` with `* 12.0` rolloff
- Adjacent windows meet cleanly via 0.97 overscan (NOT uniform overscan, NOT depthTest:false)
- 12-hour dial mapping: `ptTimeToAngle(min) = (3π/4) - ((min % 720) / 720) * TAU`
- 7 prayer windows: Tahajjud/Fajr/Dhuha/Dhuhr/Asr/Maghrib/Isha

#### Theme-Color (Dynamic Island Match)
- Samples pixel (0,0) via `gl.readPixels` every 3600 frames (~1 min at 60fps)
- `_themeFrameCount = 3599` — fires immediately on first frame
- Initial meta: `#0d0d12` — no flash on refresh

#### Dev Panel
- Toggle: `D` key or `?dev` URL param
- Time slider with Live checkbox, prayer Start/Mid/End jump buttons (snap instantly)
- Custom debug windows: add/remove with color picker + time inputs
- Boundary lines toggle, intensity sliders (OP_ACTIVE + OP_STEP)
- `var` declarations (not `let`) — avoids TDZ since render loop runs first

### A Gift of Time (Prayer Clock App)
- Domain: agiftoftime.app (registered Feb 16, 2026, 5-year term)
- Production repo: cookmom/ramadan-clock-site → GitHub Pages (branch: `main`)
- **Current clock**: `glass-cube-clock.js?v=26` — FBO dichroic glass cube
- Previous clocks: `tawaf-gl.js`, `clock.js` — kept as backups
- **Architecture**: Canvas `position:fixed;inset:0` bg (z:0). Page content floats over transparent. Fullscreen = hide content, canvas already there.
- **Full dark theme**: `--bg:#0d0d12`, light text, no cream mode
- **Copy voice**: Abdal Hakim Murad — warm wonder, not preachy, accessible to non-Muslims
- **Landing page (Feb 27)**: 4 sections (Intro → The Clock → Toward Mecca → Install), condensed from 6
- **Cube = Ka'bah** metaphor established in copy, Al-Hajj 22:26 verse anchors it
- **Ramadan detection**: `/rama[dḍ]/i` regex (AlAdhan API returns Unicode ḍ)
- **Visual validation workflow**: GPU Chrome full screenshot → vision critique → fix → present (Lesson 11)
- **Next project**: Native iOS app (lock screen widget, Live Activities, Apple Watch)
- **Git state (Feb 27)**: Pushed through `06f689a` on main. Brett fixing scroll issues.
- Features: HRTF spatial adhan, Quran playback, GPS location, dev tools panel
- **Local dev**: `python3 -m http.server 7747 --bind 0.0.0.0`
- **Git state (Mar 3)**: v167 `c50e257` on main. Hour hand: len 4.00, w 0.40.
- City persistence: `localStorage` key `agot_loc` (lat/lon/name), skips GPS/IP on reload

#### Novel Tech Stack (agiftoftime.app)

**1. FBO Dichroic Shader (Cube)**
- Custom two-pass FBO refraction: backface normals → frontface refraction
- Per-channel IOR separation: R=1.14, G=1.18, B=1.23 — real chromatic dispersion
- Thin-film iridescence on diagonal face + Fresnel edge glow
- AgX tone mapping, FogExp2 density 0.048
- FBO render target: `samples: 4` (4x MSAA for edge AA)

**2. Clock Hand Floor Beams**
- 3 floor rays via `PlaneGeometry` + custom `mkMat` ShaderMaterial
- Gaussian cross-section (`exp(-pow((vUv.x-0.5)*4.8,2.0))`), lengthwise falloff
- Violet=hour, blue=minute, white=second
- Golden ratio lengths: 3.48 / 5.64 / 9.12
- AdditiveBlending, no depthWrite, DoubleSide

**3. Rolling Prayer Windows (Polar Disc Shader)**
- 3 CircleGeometry discs (active + next + after next), NEVER 7
- Custom `mkMatWindow` polar fragment shader: `atan(vPos.x, -vPos.y)` for angular sectors
- Flat-top angular profile: `normDist - 0.97` with `* 12.0` rolloff
- Stepped intensity: OP_ACTIVE=1.3, OP_STEP=0.4 → 1.3/0.9/0.5
- 12-hour dial: `ptTimeToAngle(min) = (3π/4) - ((min % 720) / 720) * TAU`
- 7 prayer windows: Tahajjud/Fajr/Dhuha/Dhuhr/Asr/Maghrib/Isha

**4. Qibla Compass Mode**
- Second hand becomes compass needle driven by `DeviceOrientationEvent` gyro
- Hour+minute hands fade to 0 opacity, prayer window discs hidden
- `_compassLocked` flag for dev lookdev mode (bypass gyro)
- `?compass` URL param auto-enables aligned state for desktop testing
- iOS gyro: `DeviceOrientationEvent.requestPermission()` directly in click handler (preserves user gesture)
- Qibla bearing pre-computed in `_setPrayerLocation` — no race condition

**5. Prismatic Refraction Beam (Qibla-Aligned)**
- Polar disc shader approach (NOT card/PlaneGeometry — those look like "card trick")
- `FRAG_PRISM_FAN`: CircleGeometry(12,128) with angular spectral color mapping
  - Piecewise interpolation: violet→cyan→green→yellow→orange→red by `atan` angle
  - Gaussian radial falloff: `smoothstep(0.02,0.10,r) * exp(-r*r*3.0)`
  - Radial intensity: `0.3 + 0.7 * smoothstep(0.35, 0.06, r)` — brighter near cube
  - Caustic shimmer: `sin(r*40 + time*0.5 + theta*3.0)`
- `FRAG_ENTRY_BEAM`: Narrow white/warm beam from 12 o'clock into cube
- 3-layer system: fan disc (r=12, op=0.55), bloom (r=14, op=0.22), entry beam (r=4, op=0.18)
- Caustic PointLight (0xff8844, intensity 0.5) below cube — Fresnel edge glow on cube
- Breathing animation: `0.88 + 0.12 * sin(t * 1.0)`
- Fan angle: `PI/2 - PI/4 + PI` (6 o'clock after rotation corrections)
- Beams slam to full opacity on compass toggle (no fade-in delay)

**6. Tawaf Orbit**
- Cube stationary, `tawafSpot` (SpotLight) orbits at second-hand speed
- Specular highlight tracks same orbit on cube material

**7. Theme-Color (Dynamic Island Match)**
- `gl.readPixels` pixel (0,0) every 3600 frames (~1 min at 60fps)
- `_themeFrameCount = 3599` — fires immediately on first frame
- Initial meta: `#0d0d12`

**8. Lighting Rig**
- Gobo SpotLight: white (0xffffff), intensity 72, wide cone (0.42), penumbra 0.45
- Back SpotLight: 0x4040a0, intensity 10
- Rim SpotLight: 0x8060c0, intensity 11
- Tawaf SpotLight: white, intensity 12, orbits at second-hand speed

**9. Soft Beam Variant (mkMatSoft)**
- Wider Gaussian (2.2 vs 4.8) for diffuse zone vs sharp needle
- Used for prayer-related beams, qibla fan entry

**10. Dev Panel**
- Toggle: `D` key or `?dev` URL param
- Time slider, prayer jump buttons, boundary lines, intensity sliders
- `var` declarations (not `let`) — avoids TDZ since render loop runs first

**11. Mashrabiya Pattern (Procedural)**
- 10-fold rosette, hex-packed grid, canvas 1024x2048
- White bg + black lattice (18px lines) → white=light in stamps+gobo
- RepeatWrapping tiles along stamp long axis
- Gradient depth blur: crisp near → soft far (5px→36px crossfade)
- Stamps at opacity 0.09 for subtle sacred light feel
- Current: v63, stamps at (-1, y, -2.0), rotation -PI*0.2, sizes 3x24 / 3.5x28

**12. Mobile Safari Viewport (SOLVED v27)**
- `100lvh` (Large Viewport Height) = max viewport, static, never changes during scroll
- Measure once at init via temp div with `height:100lvh`, use for both buffer AND CSS
- Canvas CSS: `width:100vw; height:100lvh` — no gap, no stretch
- No `resize` listener — only `orientationchange` re-measures
- When chrome visible, bottom ~80px renders off-screen (invisible, dark floor)

### UX Redesign — Three-Mode App (Feb 28, 2026)
- **Three modes**: Clock (○), Compass (◇), Info (△) via floating pill (Apple Camera pattern)
- Pill width: golden ratio (375/φ). Primitive geometry icons.
- **Sticky header**: Location (left, tappable → full-screen picker) ← Hijri (dynamic gap center) → Countdown (right)
- All 15pt weight 300, 65% opacity — quiet chrome, cube owns the screen
- **Location picker**: search + GPS + iOS roller with Muslim cities pre-loaded
- **Permission flow**: progressive (load → touch → compass tap)
- Mockups: `references/design/` (v1-v6 + location picker)
- V6 = current favorite (dynamic Hijri gap centering)

### iOS Compass (Feb 28 research)
- `webkitCompassHeading` only path on iOS. No alternative APIs.
- `webkitCompassAccuracy` gates UI (≤25° = calibrated) — **iOS only**
- Android: accuracy always -1, treat as calibrated after 10+ heading events (v164)
- Circular moving average (5 samples) smooths jitter
- 180° jump filter rejects magnetometer drift after audio hardware
- Calibration pill overlay shows until accuracy acceptable
- Phone >75° vertical = degraded accuracy (tilt warning)

### fatiha.app — Voice-Reactive Calligraphic Art
- Domain registered, reserved for Quran app
- **Core concept (March 2, 2026)**: Real-time voice recitation → procedural Islamic calligraphy that builds stroke by stroke as you read. Each verse/word maps to a calligraphic element. On surah completion, the full piece reveals itself — you don't know the shape until you finish.
- Reference: Bismillah tulip calligraphy (arabic letters forming a flower shape) — the calligraphy IS the art
- Tech stack: Tarteel AI (Quran speech recognition API) + procedural SVG/canvas calligraphy + reveal mechanic
- Different surah = different compositional form (tulip, mihrab, geometric star, etc.)
- Intersection: generative art + Islamic calligraphy + voice interaction + devotional practice
- This is the kind of project that wins Prix Ars Digital Humanity
- **References**:
  - Bismillah tulip calligraphy (arabic letters forming flower) — calligraphy IS the art
  - Anderson Mancini — Three.js WebGPU + TSL light painting tool (paint dries over time, stroke-based progressive reveal). Video: https://x.com/Andersonmancini/status/2016833954700001600 — directly maps to "voice builds strokes" mechanic. Tech: WebGPU + TSL (Three Shading Language)
  - Jose Molfino — MPM solver for mixing color paint strokes in Houdini (physical paint simulation, color blending). Video: https://x.com/Jose_Molfino/status/1990398255511810378 — the material quality of real paint mixing. 1.8K likes.
  - IOivm (Aluan Campos Uribe) — 5 ink effects for a digital brush in **p5.js** (edge erosion, squeeze & spots, soft absorbed edges). Video: https://x.com/IOivm/status/1997528777082220816 — 628 likes.
  - **p5.brush 2.0 beta** (updated 2026-03-14) — Aluan's open-source p5.js brush library: https://github.com/acamposuribe/p5.brush — custom brushes, natural fill, hatching. Now requires p5.js 2.x. New interactive Brush Maker tool. CDN: `cdn.jsdelivr.net/npm/p5.brush@2.0.0-beta`. Decided: start from this, customize for Islamic calligraphy.
- **Visual reference (Mar 13)**: @ayushsoni_io bezier stroke tool — flowing paths with organic color-gradient forms that taper/swell along bezier curves, falloff radius controls. 1.3K likes. Video: `references/fatiha/ayush-bezier-strokes.mp4`.
- **Visual reference (Mar 13, PREFERRED)**: @jerrythe2d metaball/blob stamping along bezier paths — overlapping circles with size variation (pressure) and color gradient shifts along stroke length. More fluid/inky. 355 likes. Video: `references/fatiha/jerry-metaball-strokes.mp4`. **Tawfeeq likes this style even more.** Maps directly to Arabic calligraphy: thick downstrokes = large circles, thin upstrokes = small circles, ink pooling at direction changes = overlapping blobs. This + p5.brush = the rendering engine.
- **Prototype status (v18, Mar 13)**: Working! Bismillah recitation drives colored dots along bezier S-curve. Dots on both split paths, stick to line, split only where dots live. Tawfeeq: "Wohooo we are making progress"
- **Approved visual language**: @jerrythe2d metaball reference matched — flat solid circles, dramatic S-curve, composition borders, bounding box with teal handles, dot-presence-driven line splitting
- **Technical stack**: Canvas 2D, Web Audio analyser + waveform.json fallback, puppeteer synthTime capture pipeline, ffmpeg encode
- **Key technique**: Dots store curveIdx + side (not absolute x,y). Split displacement recalculated per frame from dot presence → dots ride the line as it moves
- **Audio**: `bismillah.mp3` (6s Mishary Al-Afasy) → `bismillah-wave.json` (200 RMS chunks)
- **Files**: `fatiha-proto/index.html` (v18), `fatiha-proto/bismillah.mp3`, `fatiha-proto/bismillah-wave.json`
- **Technical plan**: Train custom stroke prediction model on Islamic calligraphy datasets, use p5.brush as renderer
  - Phase 1: p5.brush + hand-crafted stroke paths for proof of concept
  - Phase 2: Build stroke sequence dataset from digitized master calligraphy (Thuluth, Naskh, Diwani, Kufic)
  - Phase 3: Train stroke prediction model (input=Arabic text → output=bezier curves + pressure + stroke order)
  - Phase 4: Real-time voice input via Tarteel triggers model
  - Existing Arabic handwriting datasets: KHATT, IFN/ENIT, AHDB
  - Hardware: dual A6000 96GB VRAM = local training, zero API cost
  - Model approach: stroke sequences (like Sketch-RNN), NOT pixel diffusion — model decides WHAT, p5.brush decides HOW
- **Workspace layout (March 3, 2026)**:
  - Prototype: `/var/lib/cookmom-workspace/fatiha-prototype/` (live on port 7752)
  - ASR: `/var/lib/cookmom-workspace/offline-tarteel/` — yazin's offline Quran verse recognition (cloned, daily cron watch)
  - Brush engine: `/var/lib/cookmom-workspace/p5.brush/` — cloned for forking/customization
  - Pipeline: voice (offline-tarteel) → verse ID → spline letterforms → p5.brush fill + flow field
- **Key discovery**: spline the letter SHAPE, then FILL it (watercolor + flow field) — NOT particle stroke trails
- **p5.brush limitation**: "not suitable for real-time" — will need perf optimization fork
- **Custom features needed**: progressive spline reveal, real-time perf, qalam (reed pen) brush tip, audio amplitude → stroke pressure
- **@yazins (Twitter)**: shipped offline voice→verse mapper in 1 week. FastConformer model: 85% accuracy, 115MB, 0.33s. Open-sourced everything. Potential collaborator. Tawfeeq wants to credit him big if we use his work.
- Both repos cloned locally (not forked on GitHub) — keeps cookmom alias separate from Islamic projects
- **References (March 3)**:
  - @IOivm InkField — JSON stroke capture/playback, AI-driven drawing, real-time ink physics. Posts daily, InkField "almost done." Polypaths SE sold via @GalerieMet (physical prints). Uses OpenClaw.
  - @IOivm ink feel video: https://x.com/IOivm/status/1996973210081063006 (905 likes, v20 wet ink breakthrough)
  - @IOivm InkField AI drawing: https://x.com/IOivm/status/2027945126425948587 (247 likes, JSON paths, AI reads brush modes)
  - @IOivm intent in strokes: https://x.com/IOivm/status/2028829427690566115 (today, AI reads stroke direction as confidence/hesitation)
  - @IOivm anxiety/creation: https://x.com/IOivm/status/2027383868014367173 (62s real-time InkField demo)
  - @golan (Golan Levin) p5.plotSvg v0.1.8: https://x.com/golan/status/2015336852555755761 — SVG output for pen plotters. Could output calligraphy → robot qalam writing on physical paper.

### The "+" Collection (fxhash Drop)
- Triptych: "i am building my own world" → "follow the +" → "land of the free"
- Arc: Create → Reveal → Destroy. The + is Tawfeeq's signature glyph.
- Rebuild as generative JavaScript (p5.js) for fxhash

## Brand Hierarchy
- tawfeeqmartin.com — personal brand (umbrella)
- agiftoftime.app — prayer clock (Islamic projects under real name)
- cookmom — anonymous alias for tech/generative art
- fatiha.app — reserved for Quran app
- Git: Islamic repos → Tawfeeq Martin attribution. Tech repos → cookmom.

## Research Watchlist (Daily Cron)
- **@karpathy** — "autoresearch": autonomous LLM training agent iterating on git feature branches, single-GPU 5-min runs. Bigger version on 8×H100. Open-sourced March 7, 2026. Pattern maps to our dual A6000 setup for autonomous model training.
- **@yazins** — offline Quran ASR (FastConformer phoneme model). 85%→targeting 95% streaming. Direct fatiha.app dependency.
- **@IOivm** — InkField / p5.brush. Brush rendering engine for fatiha.app calligraphy.

## Creative Direction
- Generative art NFTs: fxhash → Art Blocks → Transient Labs → SuperRare
- Art philosophy in LENS.md ("the lens")
- "make. ___." caption system (imperative + compound word)
- Monitor: @batsoupyum, @musicalnetta, @_nonfigurativ_, @TransientLabs, @serc1n, TASH (@tabordrumming)
- BSY Collection open calls — key opportunity

## Design System
- Saved in DESIGN-SYSTEM.md — canonical reference
- Light theme (#f8f7f4), Inter ultralight, Phosphor Icons thin, NO emoji
- Quran: always use Quran.com / quranicaudio.com CDN, Mishari al-Afasy default
- Every Quranic verse gets a listen button. Arabic + English + audio must match.

## Key Techniques (Proven)
- `100lvh` (CSS Large Viewport Height) = correct iOS Safari viewport answer. Static, never changes on scroll. Only re-measure on `orientationchange`.
- AgX tone mapping > ACES for glass shaders (no orange hue shift)
- Polar disc shader (CircleGeometry + angular GLSL) > card geometry for any light/fan/beam effects in Three.js
- ShaderMaterial is INVISIBLE to Three.js transmission FBO pre-pass — objects through glass must use built-in materials

## Voice & Copy
- **Abdal Hakim Murad** = primary Islamic voice model for agiftoftime.app. 14 quotes collected in workspace.
  - "Make time for the Prayer before you are prayed over" → adhan notification hook
  - "All your time is borrowed time" → onboarding copy
  - "luminous motion of His geometry" → artist statement opener
- AHM preferred over Hamza Yusuf — more literary, less preachy

## Launch (March 12, 2026)
- **agiftoftime.app publicly launched on X/Twitter** as **@tawfeeqbuilds** (separate Islamic/app account from @L00KM0M)
- Three.js official account liked the launch tweet within minutes
- Reddit (r/islam, r/ramadan) blocked — trying r/threejs, r/webdev, r/MuslimLounge
- Can't DM from @tawfeeqbuilds (not verified, @L00KM0M holds the paid subscription)
- Supabase tracking share clicks; Cloudflare Pages analytics tracking visits
- Git authorship rewritten to Tawfeeq Martin via git-filter-repo ✅
- Prix Ars Electronica 2026 — deadline missed (March 9). Note for 2027.
- DAG Visual Art Prize — deadline March 18 (still open)

## Pipeline Ideas (To Explore)

### Opus → Blender MCP → Figma MCP → Spline → Webapp (March 3)
- Full AI-driven creative pipeline: model in Blender, design in Figma, interactive 3D in Spline, deploy as webapp
- Blender MCP: `localhost:9876` (configured)
- Figma MCP: remote + desktop `localhost:3845` (configured)
- Spline: needs MCP server or API integration — check if one exists
- Goal: test if Opus can drive the full chain end-to-end via MCP tools
- Use case: rapid 3D product pages, interactive art, creative prototyping

## Tools & Methods
- **Web scraping → always use `markitdown`** (v0.1.5, already installed). `from markitdown import MarkItDown; md=MarkItDown(); text=md.convert_url(url).text_content`. Supports HTML, PDF, DOCX, YouTube, images, audio. MIT, no telemetry. Falls back to requests only on failure.

## Agent Skill Files
- **Brett**: `skills/brett/SKILL.md` — pipeline rules, markitdown scraping, git rules, Bob DB
- Always prepend relevant SKILL.md content when spawning specialist agents

### Kitchen Newsfeed (Local Stack)
- **SQLite DB**: `/var/lib/cookmom-workspace/kitchen.db` — daily_items table
- **Local API**: `kitchen/api.py` on port 4100 (stdlib Python)
- **Analysis**: `kitchen/analyze.py` — scrapes URLs + Qwen 3.5 35B via Ollama (`"think": false` required)
- **Categories**: vp, ai, tools, synths-eurorack, art, creative-coding, research, opportunities, discovery, concepts, favorites
- **Kitchen HTML**: `canvas/kitchen/index.html` → fetches from `http://localhost:4100/api/items`
- **Supabase kitchen project** (`wezxebfnxjviihawcexs`) exists but no longer used — migrated to SQLite
- Pantry: 11 category filter pills + search + click→spotlight with summary_brief + image gallery + analysis + chat

### Prix Ars Electronica 2026
- **DEADLINE: March 9, 2026, 2 PM CET** (extended from March 4)
- Category: **Digital Humanity** — culturally grounded tech, community, cross-cultural
- One submission also enters **S+T+ARTS Prize** (€20,000 × 2)
- Free entry, online only
- agiftoftime.app is the submission candidate

### Time in Islam Reference
- Comprehensive essay saved: `references/time-in-islam-opus.md`
- Maps each Islamic concept to clock implementation
- Key unmapped feature: **Friday mode** (hidden hour of du'a acceptance)

## Key Lessons (Week of Mar 14–20)
- **API key billing crisis (Mar 18)**: Chris spawns were hitting Anthropic API directly ($53/hr). Fixed → `anthropic:default` = OAuth/Max plan. RULE: Never spawn subagents without verifying auth method.
- **Slug font rendering (Eric Lengyel)**: Patent → public domain (MIT). GPU-native Bézier font rendering in GLSL. New creative anchor: Quranic verses embedded IN the fatiha garden — calligraphy IS the vine.
- **fatiha.brush custom WebGL engine built (Mar 15)**: 1,951 lines, instanced quad renderer, 7 brush tips, grain texture, ring buffer (131K+ stamps), audio-reactive, 25K+ stamps at 60fps.
- **Tyler Hobbs watercolor integration**: Recursive polygon deformation (midpoint displacement), 30-80 low-opacity layers = watercolor. Progressive "watching paint dry" — elements start crisp then bleed outward over lifetime. Tagged `fatiha-watercolor-favorite`.
- **Tawfeeq principle (Mar 15)**: "Sharp geometry + natural media = best of both." Stamp has sharp jaggy edges; watercolor + Mixbox handle the natural feeling.
- **Ottoman rose mastery**: penç (bird's eye), hatâyî (side view), goncagül (bud). Three-shade technique, tahrir outlines, saz leaves. Chris (Opus) doing surgical flower commits. Tawfeeq ❤️ saz leaves.
- **QC rule hardened**: Always test LIVE deployed URL, not just local. Never rubber-stamp Chris output without seeing it yourself first.
- **Handoff system**: `.handoff.md` in fatiha-proto persists Chris context between sessions — no more re-explaining from scratch.

## Key Lessons (Week of Mar 7–13)
- **GPS real-device parity** — never ship a GPS/device feature without testing on actual phone. Synthetic-only validation ≠ real device flow.
- **`?compass` breaks ES module loading** — clockRays never appears. Always load clean, toggle features via JS after load.
- **`_forceTimeMin` gets cleared by display cycle** — pin with setInterval at 100ms.
- **Prayer times must come from AlAdhan API** — never guess forceTimeMin values.
- **Send Telegram renders as documents, not photos** — Telegram compresses photos.
- **Use app's own UI elements** — don't recreate the pill, just use `.mode-pill` / `#modePill`.
- **Cloudflare Pages ~60s deploy lag** after push to main.
- **Lookdev quality gate** — before showing Tawfeeq any render, ask honestly: "Is this beautiful?" Not just "does it render?"

## Standing Orders
- Daily cron 5:15 AM PST (Sonnet), weekly Fridays 9 AM (Opus)
- All announcements → Telegram + Kitchen (both channels)
- Always send renders to Telegram at 3x device scale
- Check Supabase inbox on heartbeat, notify on new signups/feedback
- GitHub cookmom/workspace is PRIVATE + ANONYMOUS — no personal info ever
- No ClawHub CLI skills — bundled only
- Context engineering skills added: `skills/context-compression/` + `skills/context-optimization/` (security-audited)
- WSL2 npm SSL fix update: `sudo NODE_OPTIONS="" npm install -g openclaw@latest` works (Feb 26)
- Sub-agent speed: skip Read tool (--tools "Edit,Bash") when no image review needed — <1min vs 10min+
- Show Tawfeeq renders before pushing — he wants approval first
- Self-brief pattern: NEXT-BRIEF.md for specialist handoffs between sessions

## Infrastructure
- Claude Max API Proxy on port 3456 — NEVER restart it (you run through it)
- MCP servers: Blender (localhost:9876), Figma remote, Figma desktop (localhost:3845)
- Chrome + puppeteer-core with GPU rendering (D3D12 RTX A6000)
- Git push via SSH (git@github.com:cookmom/...)
- Scratch dir: /var/lib/cookmom-workspace/

#### Hour Hand Adaptive Contrast
- `HOUR_CONTRAST` map per prayer: complementary color + 2.2x opacity boost
- Tahajjud→gold, Fajr→amber, Dhuha→violet, Dhuhr→magenta, Asr→cyan, Maghrib→cyan, Isha→gold
- Lerp rate 0.025, second hand dims 0.62→0.40 during prayer windows
- `OP_ACTIVE=0.75`, `OP_STEP=0.275`

#### Three-Mode Navigation
- Floating pill: ○ (clock) ◇ (compass) △ (info), z-index 950
- `switchMode()` + `_toggleCompassMode(forceState)` — extracted from old button
- Default: clock mode. Tap scene in clock/compass → hide all chrome (`body.chrome-hidden`)
- Icons: circle r=10, rotated square 17×17, triangle 2→22

#### Unified Global Header
- City/countdown/hijri/prayer bar moved out of overlay into body root
- Same header across all three modes
- Old `<nav>` element removed entirely

#### Location Picker
- Bottom sheet: sticky header (search + GPS), scrollable cities, sticky footer (prayer preview)
- Cities: Makkah (Masjid al-Haram) → Madinah → Jerusalem (Al-Aqsa) → Muslim cities → Western
- Three Sacred Mosques get blue subtitle labels
- City tappable in header to open

#### Compass Onboarding
- "Move your phone to find Qibla" overlay, animated phone icon, auto-dismiss 5s
- z-index 900 (header behind, pill above)

#### Info Page Redesign (Feb 28)
- Frosted glass tiles `backdrop-filter:blur(16px)`, blue accent labels replacing gold
- Verse blocks as frosted mini-cards, horizontal install steps
- Scroll snap proximity, footer padding for pill clearance
- `max-width:420px; margin:0 auto` for centering on desktop/iPad

#### Glassmorphic Nav Pill (v146→v161)
- **CLEAN frosted glass only**: `rgba(13,13,18,.55)` + `backdrop-filter:blur(20px) saturate(150%)`
- No border, no gradients, no spectral sweeps, no reactive tint
- Reactive dichroic tint (v158) **REJECTED** — "feels too fake, takes away from clean aesthetic"
- Sliding tile with prayer-colored LED glow bar (only accent)
- CSS vars: `--pill-glow-bar`, `--pill-glow-bar-shadow`, `--pill-glow-bar-soft`, `--pill-glow`
- `border-radius:20px` container, **circular buttons** 48×48 `border-radius:50%` (v161)
- Solid `#161616` REJECTED — felt "out of place". Dichroic gimmicks REJECTED — too fake.

#### Irradiance Probes — REJECTED (Mar 3)
- CubeCamera + LightProbe + reactive podium emissive ALL removed in v155-v156
- Caused jumping/popping on podium front face from envMap + emissive lerp
- Tawfeeq: "I don't like this reactive lighting setup at all!"
- "Go back to pre lightprobe look and just polish from there — NO more lightprobe/reactive setup"
- **NEVER re-add probes or reactive podium lighting without explicit approval**

#### Chris Shader Polish (KEPT from Mar 3 lookdev, v150-v153)
- Top-face thin-film iridescence (dichroic color shift with viewing angle)
- Bottom attenuation 0.25→0.55 (hotspot reduction at cube base)
- Tighter beam Gaussian 4.8→5.6
- Side-face ambient boost 0.12→0.22
- Softer/wider caustic pools
- cubeSun 55→35

#### Git State (Mar 3 morning)
- v164 on main has Chris re-adding probes (needs revert to v156 `dec343d` state)
- Keep shader polish, revert all probe/reactive/podium infrastructure

## RAG Knowledge Pipeline (Bob's Learning Architecture)
**Documented in full: `RAG-PIPELINE.md` — READ THIS before touching Bob's knowledge system.**

Three-layer RAG that bridges human description → executable Blender code:
- **Layer 1 (WHY)**: Andrew Price transcripts → `transcript_chunks` table — chef curates, classifies, embeds
- **Layer 2 (HOW)**: Blender official docs → `doc_chunks` table — Brett scrapes, chunks, embeds  
- **Layer 3 (DO)**: Skill library → `skills` table — Bob-verified bpy code, 239 skills

All in `memory/bob-skills.db`. All searchable via `nomic-embed-text` cosine similarity.
Query via `SkillLibrary`: `.search_transcripts()`, `.semantic_search()`, `.search()`

**Generalizes to any domain**: TouchDesigner, Unreal, Ableton, GLSL — same pattern.
Tutorial creator transcripts → chef interprets → official docs → Brett ingests → skills → agent executes.
