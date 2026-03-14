# Special Prayer Highlights — Ideas (v103 baseline)

*Brainstormed from Opus notes + current glass cube system. For Tawfeeq to review at suhoor.*

## The Palette We Have to Work With

The current system gives us these levers per prayer window:
- **Beam color** (already per-prayer via `floorRay` tint/tip colors)
- **Prayer disc color** (via `mkMatWindow` shader — currently all same blue-ish)
- **Disc intensity, spread, width, hole size** (all uniform-driven, dev panel ready)
- **Cube emissive** (bottom face glow, already dynamic)
- **Podium face emissives** (per-face control)
- **Scene fog color/density**
- **Background color**

What we *don't* have yet but could add:
- Per-prayer disc color (easy — just set `uColor` uniform per prayer)
- Per-prayer fog/bg tint
- Cube material property shifts (IOR, dispersion amount)
- Temporal effects (breathing, pulsing, shimmer rate changes)

---

## 1. Friday Mode — "The Hidden Hour"

**Opus said:** Golden spectrum shift. "The hidden hour is somewhere in this afternoon. Stay present."

**Visual idea:** On Fridays between Dhuhr and Maghrib, the entire scene shifts warmer:
- Prayer disc color → warm gold (`0xffd700`) instead of cool blue
- Fog tint shifts from `0x0d0d12` → `0x12100d` (barely perceptible warmth)
- Cube's chromatic dispersion bias shifts toward amber/gold channels
- Podium key face emissive → gold instead of lavender
- A subtle golden shimmer in the prayer disc (caustic-like sine modulation)

**Not shown:** Exact time. The whole afternoon glows. That IS the point — you don't know when, so stay present for all of it.

**Implementation:** `Date.getDay() === 5` check in render loop. Lerp all color uniforms toward gold palette. Maybe 10 lines of code.

---

## 2. Tahajjud — "The Descent"

**Opus said:** Last third of night. Darker, quieter. "Our Lord descends now. Who is calling?"

**Visual idea:** The last third of the night (calculated: 2/3 of Isha→Fajr span) triggers:
- **Deepest, most intimate scene** — fog density increases (world contracts around the cube)
- Prayer disc becomes a very deep violet, almost black, with extremely subtle luminance
- The cube itself becomes the primary light source — as if everything else dims and only the sacred object remains
- Clock hand beams dim to near-invisible — time itself becomes less important
- Breathing pulse on cube opacity: slow, 4-second cycle (inhale/exhale rhythm)
- Podium goes nearly black — just the faintest edge definition

**The feeling:** 3am. Alone. The world has fallen away. Just you and the light.

**Implementation:** Calculate `lastThirdStart = isha + (fajr - isha) * 2/3`. Lerp fog density up, all intensities down except cube. ~20 lines.

---

## 3. Al-Asr — "The Oath"

**Opus said:** Special visual gravity. "The prayer the Quran swears by."

**Visual idea:** Asr window gets a unique treatment:
- Prayer disc color → deep amber/burnt orange (the color of late afternoon sun)
- The disc has a sharper, more defined edge than other prayers (like a cut gemstone)
- Cube dispersion shifts toward warm end — more orange/red refraction, less blue
- A very slow rotation speed increase on the tawaf orbit (urgency without panic)
- The hand beams take on a slight amber tinge

**The feeling:** Weight. Gravity. This one matters and you feel it in the light.

**Implementation:** Per-prayer color map + edge fade override. ~15 lines.

---

## 4. Fajr — "First Light"

**Not in Opus explicitly but follows the pattern.**

**Visual idea:** Fajr's window represents the first crack of light:
- Prayer disc → pale blue transitioning to soft rose (dawn colors)
- Very wide, soft spread — dawn light is diffuse, not focused
- Cube picks up the gentlest pink refraction
- Fog lifts slightly (world becoming visible)
- The second hand's white beam becomes the brightest element — first ray of sun

**The feeling:** Waking. The world resolving from darkness. Gentle.

---

## 5. Maghrib — "The Closing"

**Visual idea:** Maghrib is the fastest prayer window — sunset to darkness:
- Prayer disc → deep red/magenta that fades to indigo over the window duration
- Disc intensity starts high and visibly diminishes (you can watch the window closing)
- This is the ONLY prayer where intensity changes *within* the window — all others are steady
- Creates real urgency: the light is literally leaving

**The feeling:** The door is closing. Pray now.

**Implementation:** Lerp disc intensity based on position within Maghrib window. ~10 lines.

---

## 6. Breathing Pulse (All Prayers)

**Opus said:** Subtle living pulse. Presence indicator.

**Visual idea:** During any active prayer window:
- Cube opacity/emissive does a very slow sine wave: `0.95 + 0.05 * sin(t * 0.4)` (7.5 second cycle)
- The prayer disc mirrors it inversely: as cube brightens, disc dims slightly, and vice versa
- Creates a barely-perceptible "breathing" — the scene is alive

**When no prayer is active** (between windows): The breathing stops. The scene becomes perfectly still. Waiting.

**The contrast** between alive-during-prayer and still-between is the design.

---

## 7. Per-Prayer Disc Colors (Foundation for All Above)

The prerequisite for everything above. Currently all discs share one shader color.

**Proposed palette:**
| Prayer | Disc Color | Hex | Feel |
|--------|-----------|-----|------|
| Tahajjud | Deep violet | `#1a0033` | Intimate darkness |
| Fajr | Pale rose-blue | `#3344aa` | First light |
| Dhuha | Warm gold | `#aa8833` | Morning sun |
| Dhuhr | Pure white-blue | `#4466cc` | Zenith clarity |
| Asr | Burnt amber | `#cc7722` | Afternoon weight |
| Maghrib | Deep magenta | `#aa2255` | Sunset urgency |
| Isha | Cool indigo | `#2233aa` | Night begins |

These are starting points for Chris to refine. The exact values need lookdev.

---

## Priority Order (What to Build First)

1. **Per-prayer disc colors** — foundation, enables everything else
2. **Friday mode** — simple conditional, high emotional impact
3. **Breathing pulse** — subtle but transforms the scene from static to alive
4. **Tahajjud mode** — powerful, but only visible at 3am (fewer eyeballs)
5. **Asr weight** — meaningful but subtle
6. **Maghrib fade** — technically interesting, needs careful tuning
7. **Fajr dawn** — beautiful but the gentlest change

---

## What NOT to Do (Opus's Anti-Gimmick Principle)

- ❌ No text overlays on the 3D scene (quotes go in info mode, not on the clock)
- ❌ No notification-style popups breaking the visual
- ❌ No "AI-powered" anything
- ❌ No dramatic sudden transitions — everything lerps
- ❌ Don't make the differences so strong that the unified aesthetic breaks
- The clock should always feel like ONE object — the prayer highlights are tonal shifts, not costume changes

*All visual changes should be things you'd notice on the third or fourth viewing, not the first. Subtlety is the point.*
