# Three.js “Showroom Piece” Research — Dichroic Ka'bah Cube

## TL;DR verdict
Your bottleneck is **not mainly the glass shader**.

It’s ~**25% material** and ~**75% staging**:
- lighting architecture
- environment/reflection story
- camera choreography
- atmosphere (fog/particulates)
- post chain
- ground/podium quality
- motion timing + sound

A perfect shader in a dead scene still looks like a demo. A good-enough shader inside a cinematic system looks premium.

---

## 18 reference experiences (jaw-dropping / award-proven)

> Notes: Focused on Three.js/WebGL ecosystem, award circuits (Awwwards/FWA/Webby/Codrops), plus Apple/luxury product-hero language.

### 1) Bruno Simon Portfolio — https://bruno-simon.com/
**Why it feels premium:** Full world, playful physics, authored lighting moods, excellent micro-feedback.
**What drives the wow:** Interaction + camera + environment (not just shader quality).
**Tech cues:** Real-time shadows, stylized PBR, physics-driven object response, audio cues.
**Apply to cube:** Give the cube a “world,” not a void. Add interaction consequences (subtle light/sound reaction).

### 2) Active Theory v5 (Webby nominee) — https://activetheory.net / https://www.webbyawards.com/crafted-with-code/active-theory/
**Why premium:** Multi-environment storytelling, strong transitions, cinematic pacing.
**Primary lever:** Environment sequencing and transitions.
**Tech cues:** Scene-to-scene cuts, atmospheric lighting, shader FX, strong art direction.
**Apply:** Build 2–3 distinct “modes” around the same cube (sanctum dawn/noon/night) with transition choreography.

### 3) Resn “Pioneer — Corn Revolutionized” (Awwwards SOTM) — https://www.awwwards.com/resns-pioneer-corn-revolutionized-wins-site-of-the-month-july-2020.html
**Why premium:** Scroll-choreographed 3D narrative, high visual polish, flow.
**Primary lever:** Motion direction + continuity.
**Tech cues:** Scroll-tied animation, cinematic CGI framing, performance-aware pipeline.
**Apply:** Tie camera arcs and bloom/intensity to scroll/progress; make cube reveal a journey.

### 4) RIMOWA Unique (Awwwards SOTD) — https://www.awwwards.com/sites/rimowa-unique
**Why premium:** Product-as-hero framing, restrained palette, controlled reflections.
**Primary lever:** Product cinematography discipline.
**Tech cues:** Studio-like lighting, clean backdrop, precise material read, UX integration.
**Apply:** Treat Ka'bah cube like luxury watch photography: fewer lights, better lights.

### 5) TAG Heuer Eyewear (Awwwards SOTD) — https://www.awwwards.com/sites/tag-heuer-eyewear
**Why premium:** Sport-luxury motion language, object readability during movement.
**Primary lever:** Camera motion tuning and object silhouette preservation.
**Tech cues:** Controlled rotational shots, anisotropic highlights, glancing reflections.
**Apply:** Keep cube edges readable with rim-light choreography during every move.

### 6) Osklen Digital Flagship (Awwwards SOTD) — https://www.awwwards.com/sites/osklen-digital-flagship
**Why premium:** Fashion-grade atmosphere and transitions.
**Primary lever:** Atmosphere and editorial pacing.
**Tech cues:** Mist/fog layers, typography-motion sync, restrained color scripts.
**Apply:** Add atmospheric volume around podium; lock typography timing to camera beats.

### 7) North Kingdom “3 Dreams of Black / RO.ME” case context — https://www.northkingdom.com/case/google-rome
**Why premium:** World immersion + narrative intent.
**Primary lever:** Story + environment depth.
**Tech cues:** Layered worldbuilding, progression, mood shifts.
**Apply:** Frame cube as artifact in a designed space, not isolated object on plain bg.

### 8) North Kingdom “Journey Through Middle-earth” — https://www.northkingdom.com/case/thehobbit
**Why premium:** Cinematic journey feeling inside browser.
**Primary lever:** Sense of travel and scale.
**Tech cues:** Long-form camera paths, scenic depth cues, dramatic lighting.
**Apply:** Add large-scale background depth to make cube feel monumental.

### 9) David Heckhoff portfolio — https://david-hckh.com/
**Why premium:** Minimal composition + clean motion + modern material handling.
**Primary lever:** Visual restraint and timing.
**Tech cues:** Sparse UI, smooth easing, tasteful reflections.
**Apply:** Remove clutter; prioritize one elegant camera loop and 1–2 hero interactions.

### 10) drei MeshTransmissionMaterial docs/demo — https://drei.docs.pmnd.rs/shaders/mesh-transmission-material
**Why premium:** Better glass behavior (aberration, blur, distortion) with plausible cost/perf options.
**Primary lever:** Material fidelity (important, but only one layer).
**Tech cues:** Chromatic aberration, anisotropic blur, thickness/IOR control, extra buffer pass.
**Apply:** Use MTM-style controls for dichroic feel; drive aberration by incidence angle.

### 11) pmndrs drei-vanilla transmission storybook — https://pmndrs.github.io/drei-vanilla/?path=/story/shaders-meshtransmissionmaterial--mtm-story
**Why premium:** Fast iteration of glass parameter space.
**Primary lever:** Lookdev velocity.
**Tech cues:** Rapid A/B for roughness/thickness/samples/background.
**Apply:** Build preset bank ("Crystal Clean", "Sacred Prism", "Smoked Reverence").

### 12) Three.js physical transmission examples — https://threejs.org/examples/ (search: transmission/physical)
**Why premium when done right:** Correct base PBR/transmission defaults.
**Primary lever:** Baseline realism sanity.
**Tech cues:** IOR, thickness, envMap intensity, PMREM discipline.
**Apply:** Establish physically coherent baseline before stylization.

### 13) Codrops “Infinite Tubes with Three.js” — https://tympanus.net/codrops/2017/05/09/infinite-tubes-with-three-js/
**Why premium:** Strong motion identity + user-responsive deformation.
**Primary lever:** Signature motion.
**Tech cues:** Curves + camera travel + subtle interactivity.
**Apply:** Give cube a signature idle behavior (breathing rotation + refractive pulse).

### 14) Codrops Three.js experiments hub/tag — https://tympanus.net/codrops/tag/three-js/
**Why premium:** Repeated pattern: one core idea executed with strict visual taste.
**Primary lever:** Concept clarity.
**Tech cues:** Limited color scripts, intentional post FX, coherent timing.
**Apply:** Pick one clear thesis for scene ("sacred glass monolith in cosmic dusk").

### 15) Awwwards Three.js collection — https://www.awwwards.com/awwwards/collections/three-js/
**Why premium (meta-pattern):** Top pieces prioritize art direction over tech novelty.
**Primary lever:** Direction + composition.
**Tech cues:** Cinematic framing, spacing, typography discipline.
**Apply:** Build a style guide first; shader tuning second.

### 16) Awwwards WebGL collection — https://www.awwwards.com/awwwards/collections/webgl/
**Why premium (meta-pattern):** Layer stacks (env + post + animation + sound) outperform isolated shader demos.
**Primary lever:** Layered system.
**Tech cues:** Bloom+grain+vignette+fog combos, synchronized motion.
**Apply:** Implement full render pipeline, not one-off FX.

### 17) Gucci Beauty Wishes (MONOGRID, Three.js mention) — https://brandsawesome.com/project/gucci-beauty-wishes-a-webgl-experience-designed-by-monogrid/
**Why premium:** Luxury color/material styling with playful but controlled interaction.
**Primary lever:** Brand-grade art direction.
**Tech cues:** curated palette, polished transitions, interaction gamification.
**Apply:** Use strict luxury palette + elegant easing; avoid noisy rainbow glass.

### 18) Apple product hero pattern (AirPods/MacBook style scroll cinema) — reference discussion: https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/
**Why premium:** Ruthless focus on silhouette, light sweep, timing, typography sync.
**Primary lever:** Cinematic reveal rhythm.
**Tech cues:** image-sequence/WebGL hybrid, scroll-linked key poses, controlled highlights.
**Apply:** Build 6–8 key hero poses of the cube + polished interpolations.

---

## Cross-reference pattern extraction (what actually makes “showroom”)

1. **Lighting architecture > shader hacks**
   - Premium pieces use 3–5 purposeful lights with roles (key/fill/rim/kicker), not random HDRI brute force.

2. **Reflections tell the story**
   - Glass feels expensive only when it reflects an expensive world (light cards, gradient walls, set geometry).

3. **Camera is a luxury language**
   - Slow dolly, arc, parallax drift, breathing eases.
   - No twitchy orbit-cam default behavior.

4. **Atmosphere adds scale and depth**
   - Volumetric haze, particulate dust, faint god-rays create “air” between camera and subject.

5. **Post-processing is subtle but essential**
   - Soft bloom, mild vignette, tiny grain, careful tone mapping = cinematic glue.

6. **Ground/podium quality is a huge credibility multiplier**
   - Premium reflection plane + contact shadow + micro-roughness beats transparent “floating object”.

7. **Motion choreography beats static beauty**
   - Posed reveals, synchronized text, and event-based highlight sweeps produce shareable moments.

8. **Audio (even minimal) massively boosts perceived quality**
   - One low hum + crystal shimmer on interaction instantly upgrades emotional response.

---

## Is the problem glass shader or everything else?

**Answer:** Mostly **everything else**.

Approx contribution to “showroom” perception:
- **Scene/environment/lighting:** 40%
- **Camera + motion direction:** 25%
- **Post + atmosphere:** 20%
- **Material/shader itself:** 15%

If the glass is already “decent,” chasing shader perfection first is low ROI.

---

## Ranked “biggest bang for buck” upgrades (specific + actionable)

## 1) Build a real light stage around the cube (highest ROI)
- Add: key area light, cool rim light, warm kicker, soft fill, optional top pin.
- Add 2–4 invisible light cards/geometry for rich reflections.
- Keep background dark gradient + controlled hotspots.
**Impact:** Immediate premium jump in 1 day.

## 2) Replace empty space with a designed environment
- Add podium (stone/obsidian/brushed metal), cyclorama backdrop, distant geometry planes.
- Add physically plausible contact shadow and reflected floor.
**Impact:** Converts “demo object” into “hero product”.

## 3) Camera choreography pass (no user input needed)
- Author a 12–18s loop: slow arc + micro-dolly + slight breathing.
- Hit 3 hero poses where dichroic color split is strongest.
**Impact:** Feels directed/cinematic instead of sandbox.

## 4) Add atmospheric volume + dust particles
- Subtle height fog, low-density floating motes, occasional sparkle streak.
- Keep it almost subliminal.
**Impact:** Adds depth, scale, sacred mood.

## 5) Add restrained post chain
- ACES tone mapping (or AgX-like grade), bloom thresholded to highlights, tiny vignette, 2–4% grain.
- Optional very mild chromatic aberration only in highlights.
**Impact:** “Film finish” glue across scene.

## 6) Upgrade ground/reflection quality
- MeshReflectorMaterial-style floor (or planar reflection), roughness variation map, softened reflection blur.
- Strong but believable contact shadow under cube.
**Impact:** Anchors object; removes “floating toy” vibe.

## 7) Introduce one signature interaction
- Hover/press causes gentle refractive pulse + rim-light sweep + soft chime.
- Don’t gamify heavily; keep luxury.
**Impact:** Memorable, shareable moment.

## 8) Tight color script (luxury discipline)
- Limit scene to 2–3 dominant tones + dichroic accents.
- Avoid saturated rainbow spread except at specific hero moments.
**Impact:** More expensive visual language instantly.

## 9) Sound design micro-layer
- Add low ambient bed + subtle crystalline transient on key transitions.
**Impact:** Big emotional upgrade for little engineering cost.

## 10) Only then, refine shader internals
- Tune transmission thickness, IOR, aberration by angle, roughness breakup, optional micro-normal for imperfections.
**Impact:** Important final 10–15%, not first lever.

---

## Practical production recipe for your Ka'bah cube (fast path)

### Phase A (1–2 days): “Showroom baseline”
1. New light rig + reflection cards
2. Podium + floor reflections + contact shadow
3. Camera loop with 3 hero poses
4. Bloom/vignette/grain + tone mapping

### Phase B (1 day): “Atmosphere pass”
5. Volumetric haze + particles
6. Micro sound layer

### Phase C (1 day): “Material pass”
7. Dichroic shader refinement (angle-driven aberration/color split)
8. Final color grading and performance tuning

If you only do **one thing this week**: do **Lighting + Environment + Camera together**. That is the showroom switch.

---

## Anti-patterns making scenes look “demo-ish”
- OrbitControls default movement as primary presentation
- Overbright HDRI-only lighting without authored key/fill/rim
- No contact shadow / weak grounding
- Excessive aberration or bloom (looks cheap fast)
- Perfectly clean CG air (no atmosphere)
- Static object with no directed narrative timing

---

## Final call
The cube shader can be very good and still fail the brief.

For a **showroom piece**, think like a luxury cinematographer:
**set + light + lens + grade + sound**, then material polish.
