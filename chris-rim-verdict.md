# Uniform Edge Rim — QC Verdict
**Chris | Seven Heavens Studio | v572**
**Date:** 2026-03-11
**Status:** ✅ PASS (with watchlist items)

---

## Render

`chris-rim-final.png` — GPU Chrome, 3x DPR, RTX A6000, 16s settle, Makkah locale.

---

## Evaluation

### 1. `pow(3.5)` — Right falloff?
**YES.**

At NdotV = 0.5 (face center), `pow(3.5) × 0.18` = **0.016** — essentially invisible. Face flood is not happening at this intensity. The falloff sits correctly between `pow(2.0)` (flood territory, 0.045 at center) and `pow(4.5)` (edgeCatch — too tight to add net new signal). 3.5 is the right number for a rim that "extends" the edge zone without touching the face body.

### 2. `0.18` intensity — Visible on iPhone 3x?
**YES, in the transition band.**

Here's the key insight: the clip zone extends to **NdotV ≈ 0.12** (blue channel already > 1.0 from edgeCatch + fresnel). Inside that zone, `uniformRim` is invisible — the hardware clamps. The effect *actually fires* in the **NdotV 0.12–0.40 transition band**, where it adds ~16% more edge signal on top of edgeCatch. That zone is visible on any display. 0.18 is conservative — won't blow out anything that isn't already blowing out.

### 3. Compounding with `edgeCatch × 1.30` + `fresnel × 0.40`?

| NdotV | fresnel×0.40 | edgeCatch×1.30 | uniformRim×0.18 | Total (B ch) |
|-------|-------------|----------------|-----------------|-------------|
| 0.00  | 0.400       | 1.300          | **0.180**       | **1.88 🔴 CLIP** |
| 0.05  | 0.326       | 1.032          | **0.150**       | **1.51 🔴 CLIP** |
| 0.10  | 0.262       | 0.809          | **0.125**       | **1.20 🔴 CLIP** |
| 0.15  | 0.209       | 0.626          | **0.102**       | 0.94 ✅ |
| 0.20  | 0.164       | 0.476          | **0.082**       | 0.72 ✅ |
| 0.30  | 0.096       | 0.261          | **0.052**       | 0.41 ✅ |

**The clip zone is pre-existing.** edgeCatch alone clips the B channel at 1.30 intensity the moment NdotV drops below ~0.05. `uniformRim` contributes inside an already-clipped region (invisible) and then adds a modest 16% boost in the transition zone (NdotV 0.12–0.35). No new blowout created by this change.

The additive stack peak at silhouette is 1.88 (blue channel) — but that's the edgeCatch × 1.30 architecture's problem, not uniformRim's. **If this ever needs fixing, reduce edgeCatch from 1.30 → 1.10 first.** uniformRim is not the culprit.

### 4. `vec3(0.75, 0.85, 1.00)` — Right color?
**YES, essentially identical to edgeCatch.**

- uniformRim: `vec3(0.75, 0.85, 1.00)`
- edgeCatch: `vec3(0.70, 0.85, 1.00)`

R-channel delta is 0.05 raw → **0.009 effective** (scaled by 0.18 intensity). Perceptually zero. G and B are an exact match. The two effects will blend seamlessly. No chroma shift.

*Optional cleanup: align R to 0.70 for code consistency — no visual impact.*

### 5. Consistency across faces?
**Better than before — but NdotV is never truly uniform.**

The old code had bottom-only hacks both zeroed to 0.0. This change gives every face access to the rim based on its view angle. Oblique faces get more rim, face-on faces get less — which is **physically correct for glass** (Fresnel is view-dependent by definition). What it *doesn't* give you is equal intensity on all faces simultaneously from a fixed viewpoint. That's fine. The name "uniform" means "not restricted to bottom face," not "mathematically equal on all faces."

The render confirms: rim reads on all four visible faces during the orbit, not just the bottom. Objective achieved.

---

## Render Observations

The cube in `chris-rim-final.png` reads with strong edge lighting and a blown-out top face. The uniformRim **is not the cause** of either:

- **Blown-out top**: Driven by `topIrid × 1.6` + `col = mix(col, col * topIrid + ...)` at `topFace × 0.40`. The top face treatment is a separate subsystem — hot independently of uniformRim.
- **Emissive/glowing read**: Driven by edgeCatch × 1.30 (extremely aggressive for a glass material) and the base transmission boost of 2.8×. These predate this change.

uniformRim × 0.18 adds a visible rim extension in the transition band. It does not worsen the glowing-cube issue in any meaningful way.

---

## Verdict

**✅ PASS**

The change is technically sound. pow(3.5) is the correct falloff for this role. 0.18 is appropriately conservative. Color is a match. The compounding concern is real but the liability sits with edgeCatch × 1.30, not this PR. Dead code (bottomFace × 0.0, bottomRim × 0.0) has been replaced with a physically motivated, visually correct contribution.

---

## Watchlist (not blocking)

1. **edgeCatch × 1.30 is the edge budget's debt**: If the overall rim ever needs dialing back, this is line 699, not line 754. Consider `1.10` as a softer ceiling.
2. **Code comment says "consistent" — should say "available to all faces"**: NdotV-based effects are inherently view-dependent. Accurate comment prevents future confusion.
3. **R-channel alignment**: Optionally change `vec3(0.75, 0.85, 1.00)` → `vec3(0.70, 0.85, 1.00)` to match edgeCatch exactly. Zero visual impact, cleaner code.

---

*— Chris, Lookdev*
