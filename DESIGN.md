# fatiha.app — Design Document

## Vision
Real-time voice recitation → procedural Islamic calligraphic art that builds stroke by stroke. Each verse/word maps to a visual element. On surah completion, the full piece reveals itself — you don't know the shape until you finish. The recitation literally grows a garden.

## Core Concept: Rose Garden
At audio hotspots, organically grow stems with roses using golden ratio petal arrangement. Roses are **permanent** — they don't die. By end of recitation = bouquet of roses along the path. The beauty isn't decorative — it's a visualization of the sacred structure of the recitation itself.

---

## Tajweed → Visual Mapping

| Tajweed Rule | Arabic | Sound | Visual Element |
|---|---|---|---|
| **Madd** (elongation) | مد | Vowel stretched 2/4/6 beats | Long trailing vine/tendril grows from the curve. Longer madd = longer vine. "Raḥīm" (يـ madd, 4 beats) gets the longest tendril |
| **Shaddah** (doubling) | شدة | Letter pronounced twice, emphatic | Twin buds or a fuller double-bloom rose. "Allāh" has shaddah on the lām → the most prominent rose |
| **Sukoon** (rest/stillness) | سكون | Letter stops cleanly | Thorn or closed bud. Quiet moment, nothing blooms |
| **Ghunnah** (nasalization) | غنة | Humming on noon/meem | Soft glow/aura radiating from the curve — warm resonance |
| **Tafkheem** (heavy letters) | تفخيم | ص ض ط ظ خ غ ق ر | Larger roses, deeper crimson. These are the "heavy" sounds |
| **Tarqeeq** (light letters) | ترقيق | Most other letters | Small delicate buds, lighter pink/blush |
| **Waqf** (pause/breath) | وقف | Natural stopping point | Full bloom moment — rose opens completely |

### Design Principles
- Every visual element has meaning grounded in tajweed
- Madd stretches because the reciter is literally extending devotion
- Shaddah doubles because emphasis demands it
- Sukoon rests because silence has its own beauty
- The word **Allah** always gets special treatment — biggest golden rose

---

## Bismillah Breakdown

**بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ**

| Segment | Letters | Tajweed Events | Visual |
|---|---|---|---|
| **بِ** | Ba + kasra | Kasra = downward energy | Small downward-facing bud |
| **سْ** | Seen + sukoon | Sukoon = rest | Thorn or closed bud |
| **مِ** | Meem + kasra | Meem = ghunnah potential | Small ghunnah glow |
| **اللَّـ** | Alif-Laam + shaddah on laam | Shaddah = doubled emphasis | **THE moment** — biggest golden rose |
| **ـهِ** | Ha + kasra | Light letter, breath | Delicate small element |
| **الرَّ** | Alif-Laam-Ra + shaddah | Heavy letter (ra) + doubled | Strong rose, deep crimson |
| **حْ** | Ha + sukoon | Sukoon = rest | Thorn/closed bud |
| **مَـٰ** | Meem + alif madd | Madd = elongation (~2 beats) | Trailing vine/tendril |
| **نِ** | Noon + kasra | Noon = ghunnah | Soft glow |
| **الرَّ** | Alif-Laam-Ra + shaddah | Heavy + doubled (again) | Strong rose |
| **حِـ** | Ha + kasra | Light, breath | Delicate bud |
| **ـيـمِ** | Ya-madd + meem | Ya-madd (~4 beats, longest stretch) | **Longest trailing vine** — the final flourish |

### Mishary Al-Afasy Bismillah Timing
- Audio: `bismillah.mp3` (6.0 seconds)
- Source: `cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3`
- TODO: Timestamp each tajweed event precisely against this audio

---

## Technical Architecture

### Current Stack (v20)
- **Renderer**: Canvas 2D, single HTML file
- **Audio**: Web Audio API (analyser node) + waveform.json fallback for headless capture
- **Curve**: 8-segment cubic bezier (S-curve), 1200 curve points
- **Split**: Dot-presence-driven displacement — lines diverge only where living dots exist
- **Traveling petals**: 5 procedural teardrop variants (offscreen canvas sprites), rose-family gradients
- **Permanent roses**: Golden angle spiral (137.508°) petal arrangement, stems with leaves, peak-detection spawning
- **Capture**: Puppeteer + GPU Chrome (RTX A6000), synthetic time injection (`window._synthTime`)

### Golden Ratio in Roses
- **Golden angle**: 137.508° (360° × (1 - 1/φ)) — the angle between successive petals
- **Fibonacci spiral**: Petal distance from center follows `sqrt(index/total)` pattern
- This is how real rose petals arrange in nature — phyllotaxis
- Louder peak = more petals (8–26), bigger radius

### Dot Mechanics
- Dots store `{ci, side, offX, offY}` — curve index + which split path + local offset
- Position recalculated every frame from current displacement → dots ride the moving line
- Life: 0.09 progress units (~0.54 seconds)
- Spacing: 0.005 + random * 0.004

### Color Palette (Rose Family)
```
Deep crimson  → #8B1A3A (progress 0.00)
Rose          → #C2185B (progress 0.15)
Hot pink      → #E83E6C (progress 0.30)
Coral pink    → #FF6B8A (progress 0.45)
Salmon        → #FF8E72 (progress 0.60)
Peach/amber   → #FFAA5C (progress 0.75)
Dusty rose    → #E87C5E (progress 0.90)
Warm crimson  → #C25252 (progress 1.00)
```

---

## Visual References
- **Primary**: @jerrythe2d metaball/blob stamping along bezier paths (preferred style)
- **Secondary**: @ayushsoni_io bezier stroke compositions
- **Calligraphic**: Bismillah tulip calligraphy (Arabic letters forming flower shape)
- **Ink**: IOivm (Aluan Campos Uribe) / p5.brush — ink edge effects
- **Paint**: Anderson Mancini — Three.js WebGPU light painting (stroke-based progressive reveal)
- Saved in: `references/fatiha/`

## Maqam → Color Mapping (future, for full surahs)
| Maqam | Color | Feel |
|---|---|---|
| Bayati | Amber/gold | Warm, meditative |
| Hijaz | Red-gold | Passionate, yearning |
| Saba | Blue-purple | Sorrowful, devotional |
| Nahawand | Green | Gentle, flowing |
| Ajam | Bright white/yellow | Joyful, celebratory |
| Rast | Silver | Balanced, neutral |
| Sikah | Indigo | Deep, mystical |

---

## Roadmap

### Phase 1: Bismillah Prototype (current)
- [x] Audio-reactive bezier curve with split paths
- [x] Traveling rose petal sprites
- [x] Dot-presence-driven line splitting
- [x] Permanent golden-angle roses at peaks
- [ ] Timestamp tajweed events in Bismillah audio
- [ ] Map tajweed events to visual elements (vines, thorns, glows, blooms)
- [ ] Tune rose garden density and variation
- [ ] Special golden rose for "Allah"

### Phase 2: Full Fatiha (7 ayahs)
- [ ] Drive animation with verse-by-verse timing
- [ ] Different curve segment per ayah
- [ ] Progressive reveal — you don't see the full composition until complete
- [ ] Ayah transitions (pause/waqf = bloom moments)

### Phase 3: Real-time Voice Input
- [ ] Tarteel AI integration (Quran speech recognition API)
- [ ] Live microphone → real-time visualization
- [ ] Track recitation accuracy / tajweed quality → visual quality
- [ ] Different surah = different compositional form

### Phase 4: Generative Calligraphy
- [ ] p5.brush integration for ink-feel strokes
- [ ] Train stroke prediction model on Islamic calligraphy datasets
- [ ] Arabic text → bezier curves + pressure + stroke order
- [ ] Each surah produces a unique calligraphic artwork

---

## Design Changelog

### v10–v17: Finding the Visual Language (Mar 13, 9–10 PM)
- **v10**: Established core: bezier S-curve, gaussian split displacement, colored dots along both paths
- **v11**: Dots on both split paths, two-tier smoothing
- **v12**: Fixed critical bugs — headless Chrome Web Audio returns zero (waveform.json fallback), undefined `energy` variable (NaN positions), `let` vs `var` scope for puppeteer access
- **v13**: Dual chain dots — tighter spacing, minimal scatter, color-synchronized chains. Pixel-perfect reference match attempt
- **v14–v15**: Restored v10 base, tried spring-damper (rejected — "regressing")
- **v16**: Pure v10 + dots on both paths + longer life + 15% smaller. **"Love everything as is"**
- **v17**: **APPROVED BASE** — dots STICK to the line (store curveIdx + side, recalculate position from current displacement every frame). Smaller, denser, less scatter

### v18: Dot-Presence-Driven Split (Mar 13, 10:30 PM)
- Switched audio to Bismillah only (6s)
- Lines only split WHERE DOTS EXIST — diverge on segments with dots, converge when dots die
- `dotPresence[]` Float32Array per curve point, gaussian blur (3 passes) + splitBlur radius (40 indices)
- **"Wohooo we are making progress"**

### v19: Rose Petal Sprites (Mar 13, 10:45 PM)
- Replaced circle dots with procedural teardrop petal shapes (5 variants)
- Pre-rendered to offscreen canvases with rose-family gradients baked in
- Subtle vein line on each petal, gentle rotation drift as they age
- Bug fix: `buildPetals()` before `resize()` → NaN canvas. `multiply` composite on black bg → invisible
- **"looks beautiful"**

### v20: Golden Ratio Rose Garden (Mar 13, 11 PM)
- **Tawfeeq's vision**: Audio peaks → permanent roses using golden ratio (137.508°)
- Peak detection spawns roses that never die → bouquet by end
- `drawRose()`: golden angle spiral, Fibonacci distance pattern
- `drawStem()`: quadratic curve with leaf at midpoint
- Only 2 roses spawned (threshold too conservative)

### v21: Tajweed-Driven Garden (Mar 13, 11:15 PM)
- 14 timestamped tajweed events against Mishary's Bismillah
- Each tajweed rule → specific visual element (see mapping table above)
- Golden rose for "Allah" (shaddah on laam), crimson roses for Ra+shaddah
- Madd stretches → trailing vines, Sukoon → thorns, Ghunnah → soft glows
- **"Great we are making progress!!"**

### v22: Every Syllable (Mar 13, 11:30 PM)
- Expanded to 44 tajweed events — every consonant, vowel release, breath
- Added `leaf` type (standalone leaves without stems)
- Still felt sparse

### v23: Continuous Energy-Driven Fill (Mar 13, 11:40 PM)
- Added automatic spawner between tajweed landmarks
- Spawn rate proportional to audio energy (~200-300 elements by end)
- Weighted: 65% leaves, 23% buds, 8% mini rosettes, 4% thorns

### v24: 3x Denser + Falling Petals (Mar 14, 12:02 AM)
- Size variation 0.4x–2.5x
- **Falling petals**: dying traveling petals convert to physics objects with gravity + wind + tumble instead of just fading
- Feedback: "too big, falling too straight"

### v25: Falling Petal Fix (Mar 14, 12:08 AM)
- Petals 30-65% of original size
- Drift BACKWARD opposite to forward-moving head
- Sinusoidal wobble (side-to-side tumble)
- Feedback: "need more natural wave directions, more floaty"

### v26: Unique Wave Per Petal (Mar 14, 12:12 AM)
- Each petal gets own wave frequency (0.04-0.12), amplitude (0.3-1.5), phase
- Wide backward spread angle (±0.6 radians from reverse tangent)
- Bouquet 9x denser, size 0.2x-3.5x, bigger anchor roses
- Feedback: "lessen gravity, different tumbling speeds, more floaty"

### v27: Floaty Petals (Mar 14, 12:20 AM)
- Gravity cut 4x (0.015 vs 0.06)
- Per-petal tumble speed (0.03–0.18 rad/frame)
- Double-harmonic wave (primary + secondary oscillation at 0.37× frequency)
- Less air drag (0.992), slower fade (0.004)
- Feedback: "3x more length variations, 5x more density"

### v28: Extreme Density (Mar 14, 12:27 AM)
- 5x denser (fillRate 0.00007), size 0.1x-10x power curve
- Vines up to 400px, Allah rose ~125px, shaddah ~80px
- Feedback: "need Islamic mathematical relationships, things shouldn't grow over each other"

### v29: Islamic Harmonic Garden (Mar 14, 12:30 AM)
- **φ (Golden Ratio 1.618)** governs neighbor size proportions — close neighbors scale by 1/φ creating large→medium→small cascade
- **√2 (1.414)** governs minimum spacing — same ratio as Islamic star pattern geometry
- **Fibonacci sequence [1,1,2,3,5,8,5,3,2,1]** cycles element sizes in oscillating wave
- Occupancy tracking: elements prefer less-occupied side of curve
- Crowded elements become dust specks instead of being skipped
- Feedback: "way too sparse, more small than large, 10x density"

### v30: Dense Harmonic Garden (Mar 14, 12:36 AM)
- Fill rate 10x (0.000015 base)
- Fibonacci sequence reweighted toward large: [3,5,8,5,3,8,2,5,8,3,5,1,8,5,3]
- Base element sizes doubled across the board
- φ spacing relaxed: only shrinks when directly on top (ci < 3), keeps 40% size not dust
- φ proportional relationships preserved but much more generous
- Stem lengths use φ: `stemLen = budRadius × φ`

---

## Files
| File | Description |
|---|---|
| `index.html` | Main prototype (current: v30 Dense Harmonic Garden) |
| `bismillah.mp3` | Mishary Al-Afasy Bismillah (6s, extracted from Fatiha ayah 1) |
| `bismillah-wave.json` | Pre-computed RMS waveform (200 chunks) for headless capture |
| `mishary-fatiha.mp3` | Full Fatiha recitation (46.5s, 7 ayahs) |
| `waveform.json` | Full Fatiha waveform data |
| `DESIGN.md` | This file |

### v31–v35: Falling Petal Tuning (Mar 14, 12:30–1:20 AM)
- v31: Petals shrink toward zero as they approach canvas floor (95% height). Size × distance-to-floor ratio. Quadratic alpha fade.
- v32: Split difference — shrink to 30% (not zero), keep 15% opacity near floor. **Approved feel.**
- v33: Gravity -15% (0.015 → 0.01275)
- v34: Gravity -25% total (0.01148)
- v35: Gravity -35% total (0.01033). **Approved gravity.**

### v36–v39: Portrait Mode (Mar 14, 1:20–1:45 AM)
- v36: First portrait attempt — squished landscape curve into portrait viewport. Rejected.
- v37: Redesigned curve for portrait (bottom-right → top-left) with smooth S-curves. But still started bottom-LEFT.
- v38: Multiple attempts to fix start position — kept failing. **Root cause found: leftover landscape segment `{p0:{x:.01,y:.72}}` was first array entry.** Verified via `console.log(curvePoints[0])`.
- v39: Removed stale segment. **Verified: START 92%,96% → BOTTOM-RIGHT ✅**
- **Lesson 38 written:** Always log computed values before shipping visual changes.
- **verify.js created:** Pre-capture verification script (curve endpoints, garden positions, canvas state).
- **PREFLIGHT.md Sin #7 added:** Hard gate — no visual send without verification numbers.

### v40–v41: Weaving Paths (Mar 14, 2:02–2:10 AM)
- v40: Split paths weave around each other via sinusoidal modulation. `WEAVE_FREQ = 4.5` crossovers. DNA double helix effect.
- v41: White guide lines hidden. Garden elements follow their respective helix strand. Two distinct bouquet paths.

### v42–v43: Growing Vine Stalks (Mar 14, 2:12–2:18 AM)
- v42: Two green vine stalks drawn along weaving paths, growing progressively with audio progress. Deep green + highlight stroke for depth.
- v43: Split gap widened (60+energy×180 vs 15+energy×120) so stalks read as clearly separate. **Current version.**

---

## Three.js / WebGL Upgrade Path

### Why Upgrade
Current prototype is pure 2D Canvas — fast to iterate but hitting visual ceiling. Three.js/WebGL unlocks:

### Priority Features (High Impact, Mobile-Safe)
1. **Instanced rendering** — one draw call for 500+ identical petals. Better performance on mobile than current individual canvas draws
2. **Custom petal shaders** — translucent leaves with light transmission, iridescent thin-film on rose petals, procedural vein animation
3. **Bloom/glow post-processing** — golden Allah rose emits real light that bleeds into surroundings (EffectComposer + UnrealBloomPass)
4. **GPU particle system** — 5,000–10,000 pollen/dust motes at zero CPU cost. Falling petals scale 10x+
5. **Sprite materials with alpha** — `SpriteMaterial` with custom fragment shaders for petal translucency
6. **Better anti-aliasing** — WebGL MSAA + FXAA pass

### Stretch Features (Desktop/High-End Mobile)
7. **Depth/parallax** — elements at different Z layers, OrthographicCamera with slight DOF
8. **Point lights on tajweed anchors** — Allah rose = warm point light, shaddah = flash, ghunnah = soft glow
9. **Volumetric atmosphere** — subtle fog between depth layers
10. **Vertex displacement vine growth** — stalks grow via animated vertex shader, not just line drawing
11. **Tilt-shift DOF** — miniature garden feel (BokehPass)

### Mobile Constraints
- **Target: 60fps on iPhone 12+** (A14 GPU)
- **Polygon budget:** Keep geometry simple — flat sprites, not 3D meshes
- **Texture atlas:** All petal variants in one 1024×1024 atlas (one draw call)
- **No heavy post-processing stacking** — bloom OR DOF, not both on mobile
- **`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`** — cap at 2x on 3x screens
- **Power-efficient rendering:** `requestAnimationFrame` with dirty-flag (don't render if nothing changed)
- **Test on real device** — A6000 Chrome ≠ iPhone Safari WebGL

### Architecture Plan
```
Scene (OrthographicCamera)
├── Background plane (dark, optional subtle gradient)
├── Vine stalks (TubeGeometry or custom BufferGeometry, animated growth)
├── Garden layer (InstancedMesh × element type)
│   ├── Petals (instanced sprites, custom ShaderMaterial)
│   ├── Leaves (instanced, translucent shader)
│   ├── Roses (instanced, bloom-emitting)
│   ├── Buds (instanced)
│   └── Thorns (instanced)
├── Traveling dots (small InstancedMesh, animated along curve)
├── Falling petals (GPU particle system or InstancedMesh)
└── Post-processing
    └── UnrealBloomPass (selective bloom on roses only)
```

### Migration Strategy
- **Phase 1:** Port current 2D composition to Three.js with flat sprites (visual parity)
- **Phase 2:** Add bloom on roses + GPU falling petals (first wow moment)
- **Phase 3:** Custom petal shaders (translucency, iridescence)
- **Phase 4:** Depth layers + DOF (if mobile budget allows)

### When to Migrate
When the 2D composition language is locked (curve shape, tajweed mapping, element types, timing). Currently still iterating — 2D Canvas is faster for that. Port when the FEEL is right.

---

## Files
| File | Description |
|---|---|
| `index.html` | Main prototype (current: v43 weaving stalks, portrait) |
| `verify.js` | Pre-capture verification script (curve, garden, canvas state) |
| `bismillah.mp3` | Mishary Al-Afasy Bismillah (6s, extracted from Fatiha ayah 1) |
| `bismillah-wave.json` | Pre-computed RMS waveform (200 chunks) for headless capture |
| `mishary-fatiha.mp3` | Full Fatiha recitation (46.5s, 7 ayahs) |
| `waveform.json` | Full Fatiha waveform data |
| `DESIGN.md` | This file |

---

*"Light, time, orientation and a call to prayer." — Tawfeeq Martin*
