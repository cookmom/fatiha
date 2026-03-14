# Chris — Uniform Edge Rim QC (v572)
**Date:** 2026-03-11  
**Render:** `chris-rim-qc.png` (3x DPR, RTX A6000, 430×932)  
**GPU confirmed:** `ANGLE (Microsoft Corporation, D3D12 (NVIDIA RTX A6000), OpenGL ES 3.1)`

---

## Verdict: **NEEDS ADJUSTMENT**

The intent is right — uniform Fresnel rim on all faces — but the execution has two problems. Bottom edge still reads dark. The falloff is too similar to `edgeCatch` to have a distinct character.

---

## What I See

### Top edge
Thin, concentrated line. Subtle blue-white. Not a soft band — character is closer to a second `edgeCatch` than a warm Fresnel wrap.

### Left / Right vertical edges
Both show the rim but very tightly at the silhouette. Left is slightly brighter due to the blue volumetric light proximity. Right edge is darker.

### Bottom edge
**Still invisible.** Hard dark cut into the pedestal. No blue-white glow. No definition. The very thing this was meant to fix.

---

## Why Bottom Still Fails

The math is correct — at the bottom silhouette, `NdotV ≈ 0` so `uniformRim = 1.0`, giving a full `+0.18` push. The problem is the base `col` there is near-black (dark ambient at grazing horizontal angles, no direct lighting on the lower face). Adding 0.18 linear to a 0.04 base brings it to ~0.22 — technically a change, but invisible in a dark scene with no local reference.

`edgeCatch` at `1.30` intensity survives the same dark base because it's 7× more powerful. At 0.18, `uniformRim` doesn't.

---

## Analysis: pow(3.5) vs edgeCatch pow(4.5)

The claim in the comment is "tighter than 2.0 but wider than edgeCatch 4.5." Let's check what "wider" actually means:

| NdotV | edgeCatch pow(4.5) × 1.30 | uniformRim pow(3.5) × 0.18 |
|-------|--------------------------|---------------------------|
| 0.0   | 1.30                     | 0.18                      |
| 0.2   | 0.685                    | 0.091                     |
| 0.4   | 0.244                    | 0.030                     |
| 0.6   | 0.052                    | 0.007                     |

At NdotV=0.4 (well within the face, not just the silhouette edge), `uniformRim` contributes **0.030** — imperceptible against a dark base. The "wider" character isn't materializing because `pow(3.5)` still concentrates almost all the energy within the last 20% before the silhouette. It reads as a thin edge line, same as `edgeCatch`, just dimmer.

To actually read as a *soft band* — visible even on mid-face areas and dark bottoms — you need the energy to spread further in.

---

## Color Assessment

`vec3(0.75, 0.85, 1.00)` — **correct.** Cool blue-white with slight warmth in the red and green channels. Reads naturally as glass catching ambient sky. Consistent with `edgeCatch` color `(0.70, 0.85, 1.00)`. No notes here.

---

## The Fix

```glsl
// pow(2.5) — genuinely softer, wider band; clearly distinct from edgeCatch (4.5)
// 0.22 — enough punch to read on dark bottom/shadow faces
float uniformRim = pow(1.0 - NdotV, 2.5);
col += vec3(0.75, 0.85, 1.00) * uniformRim * 0.22;
```

**Why pow(2.5):**

| NdotV | pow(3.5) × 0.18 | pow(2.5) × 0.22 | Δ     |
|-------|----------------|----------------|-------|
| 0.0   | 0.18           | 0.22           | +22%  |
| 0.2   | 0.091          | 0.126          | +38%  |
| 0.4   | 0.030          | 0.053          | +77%  |
| 0.6   | 0.007          | 0.016          | +128% |

At NdotV=0.4 (mid-side-face territory), the new version contributes 0.053 vs 0.030 — nearly double, which is the difference between invisible and a visible soft blush. On the dark bottom, at the silhouette edge (NdotV=0.0), it goes from 0.18 to 0.22, which gives the extra push needed to lift off a near-black base.

`edgeCatch` stays completely unchanged. The two effects now have clearly distinct visual characters:
- `edgeCatch pow(4.5) × 1.30` — surgical knife-edge, "you could cut yourself"
- `uniformRim pow(2.5) × 0.22` — soft Fresnel wrap, subtle presence across the whole face

---

## Edit Location

`/home/tawfeeq/ramadan-clock-site/glass-cube-clock.js` — approximately line 753–754:

```glsl
// BEFORE:
float uniformRim = pow(1.0 - NdotV, 3.5);
col += vec3(0.75, 0.85, 1.00) * uniformRim * 0.18;

// AFTER:
float uniformRim = pow(1.0 - NdotV, 2.5);
col += vec3(0.75, 0.85, 1.00) * uniformRim * 0.22;
```

One line change. No structural changes to the shader.

---

## Risk Assessment

**Low.** The fix only changes the falloff curve and intensity of the new `uniformRim` term. It does not touch `edgeCatch`, `topFace`, `fresnelW`, or any other lighting term. At most, mid-face areas pick up a slight cool blush — which is the intended behavior. If it reads too warm on the top face (top already has lots of iridescence and `topFresnel`), the intensity can be walked back to 0.20. But 0.22 is the right starting point.
