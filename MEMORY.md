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

## Me (chef)
- Role: strategic partner + engineering team
- "Domain expertise is the moat, not code"
- Rule 0c: Always test first — run code, screenshot, verify — before presenting to Tawfeeq
- Operating rules in RULES.md and SOUL.md

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
- **Current clock**: `glass-cube-clock.js?v=5` — FBO dichroic glass cube, real H:M:S hands, tawaf rotation
- Previous clocks: `tawaf-gl.js`, `clock.js` — kept as backups
- **Architecture (Feb 26)**: Canvas is full-viewport fixed bg (z:0). Page content floats over transparent. Fullscreen = hide content, canvas already there.
- **Full dark theme**: `--bg:#0d0d12`, light text, no cream mode, night mode section removed
- No more `window._clockContainer` — canvas appends to body directly
- Features: HRTF spatial adhan, Quran playback, GPS location, dev tools panel
- **Local dev**: `python3 -m http.server 7747 --bind 0.0.0.0` + `localhost:7747` from Windows (mirrored WSL2 networking, needs netsh portproxy)
- **Git state (Feb 26 night)**: 25+ local commits ahead of remote (`bca2e8c` v5). Latest: `1c3fe70`. NOT pushed yet.

### fatiha.app
- Registered, reserved for future Quran app

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

## Standing Orders
- Daily cron 5:15 AM PST (Sonnet), weekly Fridays 9 AM (Opus)
- All announcements → Telegram + Kitchen (both channels)
- Always send renders to Telegram at 3x device scale
- Check Supabase inbox on heartbeat, notify on new signups/feedback
- GitHub cookmom/workspace is PRIVATE + ANONYMOUS — no personal info ever
- No ClawHub CLI skills — bundled only
- Context engineering skills added: `skills/context-compression/` + `skills/context-optimization/` (security-audited)
- WSL2 npm SSL fix update: `sudo NODE_OPTIONS="" npm install -g openclaw@latest` works (Feb 26)

## Infrastructure
- Claude Max API Proxy on port 3456 — NEVER restart it (you run through it)
- MCP servers: Blender (localhost:9876), Figma remote, Figma desktop (localhost:3845)
- Chrome + puppeteer-core with GPU rendering (D3D12 RTX A6000)
- Git push via SSH (git@github.com:cookmom/...)
- Scratch dir: /var/lib/cookmom-workspace/
