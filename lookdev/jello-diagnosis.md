# Jello Diagnosis — Dichroic Glass Cube
**File:** `/home/tawfeeq/ramadan-clock-site/glass-cube-clock.js`  
**Date:** 2026-03-02  
**Verdict:** She's right. The cube is reading as a gelatinous organic mass. Here's why.

---

## Primary Culprit: `uInternalGlow` — The Jello Core

```glsl
// Current
uInternalGlow: { value: 0.24 }

// Shader code:
float glowFresnel = pow(1.0 - cosT, 2.5);
vec3 glowCol = mix(vec3(1.0, 0.88, 0.55), vec3(1.0, 0.65, 0.2), glowFresnel);
col += glowCol * uInternalGlow * (0.2 + 0.8 * glowFresnel);
```

**This is the smoking gun.** A warm amber emission concentrated at the Fresnel grazing angles is the exact visual signature of *subsurface scattering* — how light looks passing through flesh, jello, wax, or fruit. Crystal and glass do NOT emit from inside. They are cold, clear, and surface-reflective. 

At 0.24 with a `pow(cosT, 2.5)` roll-off, this creates a thick orange-amber glow around every edge of the cube. That is biologically organic. It reads as warm flesh.

**Recommendation:** Drop `uInternalGlow` to `0.0` first. Then optionally reintroduce it at `0.03–0.06` max during prayer-time only, with the color shifted toward `vec3(0.9, 0.95, 1.0)` (cool white-blue), which reads as an internal cavity rather than internal tissue.

---

## Second Culprit: Fresnel Power Too Low (`uFresnel: 2.0`)

```glsl
// Current
uFresnel: { value: 2.0 }

// Used as:
float fresnel = pow(1.0 - cosT, uFresnel);
col += fresnel * 0.55;
col += irid * diagF * fresnel * 0.75;
```

A Fresnel exponent of `2.0` produces a broad, soft halo across the entire surface. This is the Fresnel response of soft materials — skin, wax, rubber, silicone. 

**Real optical glass Fresnel**: Sharp, narrow, appears only at extreme grazing angles. Exponent of `5.0–8.0` is physically correct for glass. At `5.0`, the Fresnel is contained to the very edges; at `2.0`, it bleeds across 40-50% of the visible face area. That coverage is the jello read.

The additive `col += fresnel * 0.55` at power 2.0 is also washing the entire non-edge surface with a soft grey/white haze — it desaturates the refracted color behind the glass and makes it look like a thick translucent blob rather than a transparent surface.

**Recommendation:** 
- `uFresnel: 5.5` (glass), or `7.0` (crystal/prism)
- Reduce the additive fresnel white: `col += fresnel * 0.25` (half the current value)

---

## Third Culprit: Specular Exponent Too Soft (`pow(dot(Hw), 24.0)`)

```glsl
// Current
float spec = pow(max(dot(Nw, Hw), 0.0), 24.0);
col += vec3(1.0, 0.95, 0.9) * uSpecIntensity * spec * (0.4 + 0.6 * fresnelW);
```

Specular power of `24` is roughly equivalent to a slightly glossy plastic or oiled skin. It produces a wide, soft, diffuse highlight blob. 

Crystal and optical glass have *razor-sharp* specular reflections. You should be able to see the actual shape of the light source as a small, brilliant point — not a soft smear. For prism-grade glass the equivalent Blinn-Phong exponent is `256–512`.

The wide highlight is currently merging with the soft Fresnel glow to create one large luminous zone — that combined read is indistinguishable from subsurface scattering. Separate them: a tiny bright spec + sharp narrow Fresnel = crystal. A diffuse spec + broad Fresnel = jello.

**Recommendation:**
- `pow(dot(Nw, Hw), 0.0), 256.0)` — razor sharp
- Keep `uSpecIntensity` at `2.8` or increase to `3.5` to compensate for the tighter lobe
- Consider adding a *secondary* tight specular at `pow(512.0)` at reduced intensity for the "needle" highlight that prisms show

---

## Fourth Culprit: Chromatic Aberration Too Wide (`uAb: 0.10`)

```glsl
// Current
uAb: { value: 0.10 }

// Used as:
vec2 abXY = vec2(uAb / uAspect, uAb);
float R = texture2D(uScene, clamp(uv + rR.xy * abXY, ...)).r;
float G = texture2D(uScene, clamp(uv + rG.xy * abXY, ...)).g;
float B = texture2D(uScene, clamp(uv + rB.xy * abXY, ...)).b;
```

`uAb: 0.10` means the RGB channel separation can displace up to 10% of the screen height. This is extreme — real prism dispersion separates colors by a few degrees, not 10% of the FOV. 

The key perceptual problem: *large* chromatic separation with *smeared* channel offsets (because the refraction vectors from low-IOR values are gentle) creates a soft RGB blur rather than distinct prismatic bands. The smear reads as the light passing *through* a thick medium — optically, that's what you see in gelatin. A prism should show *crisp* separated color bands, not a thick RGB blur.

**Recommendation:** `uAb: 0.04–0.06`. Reduce aberration, rely more on the per-channel IOR values (uIorR/G/B) to create the actual dispersion geometry.

---

## Fifth Culprit: IOR Values Too Low (`1.14 / 1.18 / 1.23`)

```glsl
// Current
uIorR: { value: 1.14 },
uIorG: { value: 1.18 },
uIorB: { value: 1.23 },
```

Real glass: **1.5**. Crystal/Swarovski: **1.7–1.9**. Dense optical glass (prism grade): **1.6–1.7**.

IOR of `1.14–1.23` is below actual water (1.33). These values produce weak, underpowered refraction rays. The geometry of the bend is closer to air-to-water than air-to-glass, so the visual sensation is of a soft, low-density medium — which maps perceptually to gel.

Counterintuitively, the high `uAb` is *compensating* for the weak IOR — it's doing the heavy lifting of the visual offset, but it's doing it as a screen-space 2D smear rather than physically bent geometry. That's the gummy read: smeared pixels rather than geometrically bent light paths.

**Recommendation:**
- `uIorR: 1.50`, `uIorG: 1.56`, `uIorB: 1.63` — physical glass baseline
- Or for dramatic prism: `uIorR: 1.60`, `uIorG: 1.68`, `uIorB: 1.78`
- Paired with reduced `uAb: 0.04`, this shifts the work from 2D smear to proper per-channel refraction geometry

---

## Sixth Issue: Dichroic Iridescence Muddying the Interior (`uDich: 0.70`)

```glsl
// Current
uDich: { value: 0.70 }

// Used as:
float diagF = exp(-abs(vLocalPos.x + vLocalPos.y) * 7.0) * uDich;
col = mix(col, col * irid * 1.6, diagF * 0.65);
col += irid * diagF * fresnel * 0.75;
```

The diagonal dichroic at `0.70` with a `0.65` mix factor to `col * irid * 1.6` is creating a large zone of colored internal murk. Multiplying the refracted color by `irid * 1.6` and mixing at 65% partially obscures the scene behind the glass — you lose the sense of clear material depth. Combined with the irid additive at Fresnel edges, the cube's interior reads as a colored volume (like dyed jello) rather than a clear medium with surface coating.

The iridescence should be a thin-surface phenomenon — visible only at specific angles, not blanketing the bulk of the visible faces.

**Recommendation:**
- Keep `uDich: 0.70` (the effect is right in concept) but reduce mix factor: `mix(col, col * irid * 1.6, diagF * 0.35)` — half the current blend
- Reduce additive: `col += irid * diagF * fresnel * 0.40` (was 0.75)
- This keeps the dichroic effect but preserves the see-through clarity that defines optical glass

---

## Minor Issue: Soft Top-Face Scrim Creates Density Read

```glsl
col *= 1.0 - 0.55 * smoothstep(0.4, 0.92, Nw.y);
```

The top face is darkened up to 55% from center to edge. This gradient darkening on a flat face reads as the surface of a thick solid — like the meniscus of a gel. A glass prism's top face should show a bright, angular specular flash and otherwise be as transparent as the sides. The gradual attenuation gives it "body."

**Recommendation:** Reduce to `0.25` or remap with a sharper threshold: `smoothstep(0.7, 0.95, Nw.y)` — keep darkening only at extreme top-face grazing, not across the whole face.

---

## Summary: Recommended Parameter Changes

| Parameter | Current | Recommended | Why |
|-----------|---------|-------------|-----|
| `uInternalGlow` | `0.24` | `0.0` (or `0.04` cool) | Warm amber = subsurface scatter = jello |
| `uFresnel` | `2.0` | `6.0` | Glass needs sharp Fresnel, not broad halo |
| Specular exponent | `24.0` | `256.0` | Needle highlight, not soft blob |
| `uAb` | `0.10` | `0.05` | Less smear, more geometry |
| `uIorR/G/B` | `1.14/1.18/1.23` | `1.50/1.56/1.63` | Physical glass baseline |
| Dichroic mix | `diagF * 0.65` | `diagF * 0.35` | Keep surface irid, not interior murk |
| Irid additive | `fresnel * 0.75` | `fresnel * 0.40` | Surface sheen, not volume color |
| Fresnel white add | `fresnel * 0.55` | `fresnel * 0.20` | Stop the diffuse whitening |
| Top-face scrim | `smoothstep(0.4, 0.92)` | `smoothstep(0.7, 0.95)` | Less density read on flat top |

**Priority order:** Internal glow → Fresnel power → Specular → IOR/Ab. First two will have the biggest immediate impact.

---

## What "Crystal" Should Feel Like vs What We Have

| Quality | Current (Jello) | Target (Crystal/Prism) |
|---------|-----------------|------------------------|
| Interior | Warm amber emission, volume glow | Cold, clear, invisible medium |
| Edges | Soft warm halo bleeding inward | Sharp, narrow Fresnel flash, blue-white |
| Specular | Wide soft blob | Tiny razor-bright needle |
| Refraction | 2D RGB smear via uAb | Geometrically bent light, crisp bands |
| Dichroic | Interior color murk | Thin surface iridescence at specific angles |
| Overall read | Thick warm organic blob | Cold transparent solid with hot surface flash |

The goal is to feel like you could cut yourself on it. Right now it feels like you'd bounce off it.
