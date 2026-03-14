# Video 2 Research Notes — Glass in Blender Cycles (Silverwing VFX)
Source: https://youtu.be/5mZr7xvsa8E?si=ZuVy_sdYkJ3m7pgN  
Date: 2026-03-08  
Lane: AMAS-BLEND (research-only)

## Quick context
- Video length: ~25m50s
- Content type: glass shading + lighting workflow in Cycles, with practical node setups and render optimization notes.
- Review method: extracted representative frames across timeline and analyzed recurring setup patterns.

---

## 1) Shot breakdown (camera / light ratios / material cues / post)

## A. Intro + host setup (00:00–~02:00)
- **Camera**: static medium close-up (host), shallow depth of field, center-framed.
- **Lighting ratio**: approx **Key:Fill:Rim = 1.0 : 0.35 : 0.25** (soft key camera-left, gentle fill, warm hair edge).
- **Material cue relevance**: demonstrates preferred visual language: soft gradients, not hard contrast.
- **Post**: mild contrast and warm skin tone bias.

## B. Blender viewport + split render demonstrations (~02:00–~09:00)
- **Camera in render**: mostly static product-style framing; mild perspective; object centered with generous negative space.
- **Lighting ratio (rendered object)**: typical **1.0 : 0.45 : 0.6** for glass readability.
  - Key is broad and soft (area/gradient source).
  - Fill stays low-mid to preserve refraction contrast.
  - Rim/spec edge intentionally strong enough to define silhouette through transparency.
- **Material cues**:
  - Principled with **Transmission 1.0**, roughness near 0 for hero clarity.
  - IOR around ~1.45 (standard glass region).
  - Environment is doing heavy lifting (“glass is a product of environment”).
- **Post**:
  - Clean, restrained bloom/glow.
  - No aggressive chromatic aberration in main tutorial passes.

## C. Node/theory section (caustics, light-path, shadow control) (~09:00–~18:00)
- **Camera**: instructional UI-first, not cinematic.
- **Lighting takeaway**: clarity comes from controlled source geometry and bounce settings more than from complex post.
- **Material cues**:
  - Transparent+Principled mixes using Light Path logic to control expensive/shadow behavior.
  - Emphasis on transmission/refraction bounce budgets for stability.
- **Post**: none; this section is technical.

## D. Advanced looks + hero renders (~18:00–end)
- **Camera**: static hero product angles, occasional close crop for detail.
- **Lighting ratio**: for final hero shots approx **1.0 : 0.3 : 0.75** (strong edge definition on transparent silhouette).
- **Material cues**:
  - Volume Absorption for tint depth.
  - Procedural displacement/noise for ice-like breakup in some examples.
  - Optional stylized dispersion/iridescent accents only in showcase frames.
- **Post**:
  - Subtle bloom, soft tonal rolloff.
  - Black/gradient backgrounds used to maximize refraction readability.

---

## 2) Shader/material notes (dispersion / roughness / caustics)

## Glass base model (practical baseline)
- **Transmission**: 1.0
- **IOR**: ~1.45 (start here; tweak only if art direction demands)
- **Base roughness strategy**:
  - Hero glass surfaces: **0.0–0.03**
  - Micro-imperfect / frosted patches (if needed): **0.06–0.18** via mask/noise
  - Keep roughness layered, not uniform.

## Dispersion strategy
- Keep dispersion **subtle and selective**.
- Use as accent on edge highlights/high-contrast boundaries only; avoid global rainbowing.
- For AGOT cube style realism, dispersion should read as a whisper, not neon separation.

## Caustic cues
- Video repeatedly reinforces: caustics are tied to light-path depth + source shape + geometry thickness.
- Use broad sources with clear directionality to get readable caustics.
- Ensure enough transmission/refraction bounces before touching post tricks.
- If using cheat paths (light-path mixes), preserve camera-ray fidelity and avoid fake shadow disconnect.

## Tint strategy
- Prefer **Volume Absorption** for physical tint in thick glass rather than surface-base color hacks.
- Density should be low/moderate to avoid muddy interiors.

---

## 3) Concrete mapping to AGOT glass cube scene

## Change first (highest ROI, lowest risk)
1. **Lighting architecture first (before shader tweaks)**
   - Build a clear 3-source logic: broad key + controlled fill + pronounced rim.
   - Target readability ratios around **1 : 0.35 : 0.6**.
2. **Stabilize glass baseline**
   - Transmission 1.0, IOR ~1.45, roughness near zero on hero faces.
   - Add tiny roughness breakup only where needed to kill CG-perfect flatness.
3. **Enable believable thickness tint**
   - Add very light volume absorption (cool-neutral or art-directed AGOT tint).
4. **Fix caustic legibility with lighting + bounce budget**
   - Don’t fake first; verify bounce/refraction settings and source placement first.
5. **Only then apply restrained post**
   - Soft bloom + mild contrast shaping, no heavy CA.

## Secondary pass (after baseline locks)
- Edge-selective dispersion micro-accent.
- Localized micro-surface imperfections for breakup.
- Composition polish: keep cube silhouette clean against gradient/dark backdrop.

## What NOT to touch right now
- Do **not** introduce aggressive stylized dispersion globally.
- Do **not** over-frost all faces with uniform roughness.
- Do **not** rely on post to “manufacture” glass readability.
- Do **not** keep reworking geometry if lighting hierarchy is still unresolved.

---

## 4) Practical recipe for AGOT next lookdev pass
- Lock camera and background first.
- Place key/fill/rim with explicit intensity targets.
- Validate silhouette and interior refraction in grayscale first.
- Add volume absorption (very low density).
- Add tiny roughness modulation mask only after clean base render.
- Evaluate caustic readability; adjust source size/distance before shader complexity.
- Add final post (minimal bloom, soft highlight rolloff).

---

## 5) Executive takeaway
This tutorial’s core lesson is simple: **great glass is mostly lighting discipline + physically coherent baseline shader, not exotic node tricks.** For AGOT cube, biggest wins come from re-establishing key/fill/rim hierarchy, clean transmission/IOR baseline, and subtle volume tint; leave stylized dispersion and heavier effects for the final 10% polish.