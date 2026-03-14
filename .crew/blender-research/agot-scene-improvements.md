# AGOT Scene Improvements Map (Blender Upgrade Plan)

This maps direct upgrades from current AGOT-style Three.js glass cube look to a Blender/Cycles hero pipeline.

## P0 — Must-have (ship baseline)

1. **Physically plausible glass body + volume**
   - Move from single-layer transmissive look to Glass+Principled hybrid with volume absorption.
   - Why: stronger depth cues, less flat crystal look.
   - Impact: immediate realism gain.

2. **Five-point light rig (key/fill/rim/back/practical)**
   - Introduce controlled warm/cool contrast and rim sparkle.
   - Why: current scene is mostly “nice shader”; this adds cinematic intention.
   - Impact: premium framing and readable silhouette.

3. **Floor response upgrade (satin + roughness breakup)**
   - Replace flat or over-mirror response with soft reflection and localized spectral hints.
   - Why: grounds object and improves scale perception.
   - Impact: cleaner product-shot quality.

4. **Camera discipline (85mm hero + DOF target)**
   - Lock a repeatable hero composition that preserves overlay space.
   - Why: avoids drift between renders and aligns with AGOT branding needs.
   - Impact: consistent social/web output.

5. **Cycles caustics + transmission bounce tuning**
   - Turn ON refractive/reflective caustics, set transmission bounces high enough.
   - Why: dispersion and inner refraction need proper path depth.
   - Impact: real glass behavior instead of fake rainbow tint.

---

## P1 — High-value refinement (next pass)

1. **Micro-imperfections on glass**
   - Subtle bump/noise for edge breakup.
   - Prevents sterile CG perfection.

2. **Dual camera set (hero + clean alt)**
   - 85mm hero + 65mm clean variant.
   - Supports different marketing crops without rebuilding lights.

3. **Compositor cinematic stack**
   - Controlled bloom, micro lens distortion, gentle vignette, color split.
   - Adds final polish while preserving realism.

4. **Color-managed output presets**
   - EXR master + web derivative LUT/export path.
   - Ensures consistent look between Blender stills and AGOT web assets.

5. **Turntable proof pass**
   - 120–180 frame slow orbit render for evaluating dispersion continuity.

---

## P2 — R&D / optional hero upgrades

1. **Spectral cheat layer for stronger edge dispersion**
   - Multi-pass RGB IOR offsets or compositor spectral split on luma peaks.
   - Use carefully to avoid “cheap prism” look.

2. **Caustic catcher pass on floor**
   - Dedicated AOV/Light Group for refractive caustics to art-direct intensity in comp.

3. **Animated practicals**
   - Low-frequency intensity modulation (very subtle) to make reflections “breathe.”

4. **Lens package variants**
   - 50/65/85 preset pack with matched transform offsets for campaign flexibility.

5. **AGOT time-of-day grade variants**
   - Fajr/Dhuhr/Maghrib/isha grading overlays from same base render using comp macros.

---

## Port 9877 status and execution implication

- `127.0.0.1:9877` accepts TCP connection but did not respond to HTTP probes.
- No confirmed controllable MCP protocol path available from this environment.
- Therefore this plan is packaged as **manual-precise build steps + parameter presets** for immediate execution in local Blender.

---

## Readiness Note
Plan is implementation-ready: values are concrete, sequencing is deterministic, and quality gates are defined. No branch/main-risk actions were performed.

## Next Actions
1. Build scene in local Blender using `blender-scene-blueprint.md` verbatim.
2. Render 3 stills (Hero, Clean Alt, Tight Crop) at 1080x1350 and 2160x3840.
3. Compare against AGOT reference stills and adjust only exposure/light power by small deltas.
4. Lock preset as `AGOT_GlassCube_v01.blend`.
5. Optional: if MCP protocol details become available, automate setup/export in a follow-up pass.
