# DEEP-RESEARCH-GUIDE-v1 — AGOT Next Iteration

Date: 2026-03-08
Scope: Research-only steering dossier for next AGOT Blender lookdev run
Grounded in:
- YouTube ref 1: https://youtu.be/lEPZ1IUkoB4 (continuous-dispersion method)
- YouTube ref 2: https://youtu.be/5mZr7xvsa8E (Cycles glass + lighting discipline)
- Prior artifacts: v11–v14 reports/renders/notes
- AGOT composition lock constraints

---

## 0) Non-negotiables (composition lock)

Keep these exact (tolerance ±0.001 scalar / yaw ±0.1°):
- Camera position: `(0.2, 9.7, 15.0)`
- Camera look target: `(0.0, -0.8, 1.0)`
- Cube center: `(0.0, 0.6, 1.0)`
- Cube yaw: `45°`

Lock status in artifacts:
- v11: PASS
- v12: PASS
- v13: PASS
- v14: PASS (`agot-v14-lock-values.json`)

Conclusion: **composition drift is not the problem. Lookdev system design is the problem.**

---

## 1) Root-cause analysis — why v11–v14 still looked wrong

## A. Technical root causes

1. **Method conflict (physical glass vs forced prism rig)**
- v11/v13/v14 narrative targets physically coherent continuous dispersion.
- v12 explicitly uses fallback RGB prism lights to force visible split.
- This created unstable visual language across versions: sometimes physically plausible, sometimes theatrical cheat.
- Outcome: no single reliable baseline; each version solved a different problem.

2. **Dispersion validation happened in “proof” frames, not hero frames**
- Multiple versions pass by showing dispersion in dedicated proof renders, but hero finals remain weak/opaque-looking.
- If hero frame does not show believable refraction/edge behavior, proof is irrelevant.

3. **Lighting hierarchy under-defined for hero readability**
- Refs require controlled key/fill/rim with intentional environment content.
- Our versions repeatedly toggled between “too dark/inert” and “RGB-overemphasized,” indicating poor middle-ground calibration.

4. **Receiver strategy overused as crutch**
- Dark receiver planes can reveal spectral cast, but they can also mask poor glass behavior by over-focusing on projected color.
- Real success criterion is cube body read (Fresnel + depth + refraction continuity), not just floor cast.

5. **Shader complexity outran perceptual payoff**
- Noise/ramp/curve dispersion logic was added, but final images still read like solid dark block or demo artifact.
- This means core signal (transmission + edge Fresnel + interior travel) is not surviving final lighting/post decisions.

## B. Aesthetic root causes

1. **Demo look instead of premium devotional look**
- Several outputs read like “dispersion test bench” rather than AGOT hero object.
- Visual tone drifted toward tech proof, away from contemplative luxury.

2. **Form readability lost**
- In failed finals, cube silhouette and body depth did not read as expensive glass.
- Either too dead (matte/black core) or too gimmicky (rainbow-led attention).

3. **Color hierarchy not restrained**
- Ref refs show dispersion as accent at optical edges.
- Failed outputs either buried dispersion too far or over-signaled it as the main subject.

---

## 2) What to emulate from references vs what to avoid

## Emulate (from both YouTube refs)

1. **Lighting discipline first, nodes second**
- Ref 2 is clear: good glass = lighting hierarchy + coherent baseline shader.

2. **Continuous, subtle spectral behavior**
- Ref 1: avoid tri-band RGB splitting; use continuous spectral mapping with nonlinear wavelength bias.

3. **Edge-conditional dispersion**
- Dispersion should appear where optics justify it (grazing/high-contrast transitions), not as universal outlines.

4. **Readable glass body**
- Transmission depth, Fresnel edge brightening, and plausible refraction continuity must be visible in hero frame.

5. **Restrained post**
- Minimal bloom, no fake CA stack trying to “sell” glass.

## Avoid

1. RGB triplet prism-light hacks in final beauty frames.
2. “Proof-only success” where hero still fails.
3. Uniform rainbow fringe around all edges.
4. Over-frosting/roughness haze that kills interior clarity.
5. Underexposed hero where glass reads as black stone.

---

## 3) Concrete AGOT parameter ranges (camera / light / material)

## Camera (LOCKED)
- Position: `(0.2, 9.7, 15.0)`
- Target: `(0.0, -0.8, 1.0)`
- Cube center Y: `0.6`
- Cube yaw: `45°`

## Lighting (start ranges)
- Key:Fill:Rim intensity ratio target: **1.0 : 0.25–0.40 : 0.50–0.80**
- Key type: near-collimated spot or constrained area key with clear directionality
- Fill: cool-neutral, soft, low-energy only
- Rim: neutral/cool edge separator, avoid neon tint
- Ambient/HDRI contribution: low-mid (enough for reflections, not washout)

## Material (glass baseline)
- Transmission: `1.0`
- IOR base: `1.45–1.52`
- Refraction roughness: `0.00–0.03` (hero)
- Reflection roughness: `0.02–0.08`
- Dispersion amount (effective): low-to-moderate; only increase until edge accents are visible
- Volume absorption density: very low (just enough to avoid hollow CG look)
- Tint: near-neutral by default

## Render/quality
- Enough transmission/refraction bounces for stable interior behavior
- Samples high enough that noise is not mistaken for dispersion detail

---

## 4) Strict execution protocol for Bob (with pass/fail checkpoints)

## Step 1 — Lock integrity gate
- Load v07 baseline lock scene.
- Verify lock values before any lookdev edit.
- **PASS if** all 4 lock metrics match tolerance.
- **FAIL = stop.**

## Step 2 — Baseline glass readability (dispersion OFF)
- Use physical glass baseline only (no RGB prism rig).
- Render hero A.
- **PASS if** cube reads as transmissive glass at first glance (edge Fresnel + interior depth visible).
- **FAIL if** reads as dark solid/plastic.

## Step 3 — Lighting hierarchy calibration
- Tune key/fill/rim to target ratios.
- Render hero A/B.
- **PASS if** silhouette is clean, receiver not clipped, no washed-out refraction.
- **FAIL if** either underexposed black core or flat overfill.

## Step 4 — Add restrained dispersion
- Enable continuous dispersion logic (no RGB split rig).
- Render hero A + proof frame (same camera, stronger controlled condition allowed).
- **PASS if** hero shows subtle edge-true spectral accent and proof confirms mechanism.
- **FAIL if** dispersion only exists in proof or becomes rainbow gimmick in hero.

## Step 5 — Volume/tone polish
- Add minimal absorption + restrained bloom.
- Render final A/B + before/after.
- **PASS if** premium mood improves while glass physics remain legible.
- **FAIL if** post hides/refakes optics.

## Step 6 — Final lock + acceptance audit
- Re-run lock JSON dump and rubric scoring.
- **PASS if** lock intact + rubric thresholds met.
- **FAIL = reject run.**

---

## 5) Visual acceptance rubric (objective + subjective)

Scoring 0–10 each. Ship gate: **all categories >= threshold** and weighted total >= 8.0.

## Objective criteria

1. Composition lock fidelity (threshold 10/10 hard gate)
- Exact lock values present and passing.

2. Glass physical read (threshold 8.0)
- Visible transmission through body
- Fresnel edge behavior present
- Refraction continuity present (not random fringe)

3. Dispersion correctness (threshold 7.5)
- Continuous/edge-conditional spectral behavior
- No tri-band RGB outlining

4. Lighting structure (threshold 8.0)
- Clear key/fill/rim hierarchy
- No clipped highlights or dead blacks on hero body

## Subjective criteria

5. Premium mood (threshold 8.0)
- Feels expensive, intentional, quiet

6. AGOT brand fit (threshold 8.0)
- Spiritual, restrained, contemplative; not “shader demo”

Weights:
- Glass physical read: 30%
- Dispersion correctness: 25%
- Premium mood: 25%
- Brand fit: 20%

---

## 6) Do-not-do list (prevent RGB-hack/demo look)

1. Do not use RGB prism-light rigs in final beauty renders.
2. Do not pass a run because a “dispersion-proof” frame looks good while hero fails.
3. Do not add global chromatic aberration/bloom to fake dispersion.
4. Do not push saturation until rainbow becomes the subject.
5. Do not crush scene into near-black where glass reads opaque.
6. Do not frost all faces uniformly to hide optical problems.
7. Do not break composition lock to “find a better shot.”

---

## 7) Minimal experiment matrix (max 6, fastest convergence order)

Run in this exact order; stop once rubric passes.

| Variant | Purpose | Key changes | Expected decision |
|---|---|---|---|
| V1 Baseline-Physical | Re-establish true glass read | Dispersion OFF, glass baseline, target lighting ratio | Keep only if glass body reads premium |
| V2 Lighting-Refine | Fix silhouette/depth before color | Adjust key beam angle/size + fill/rim ratio only | Pick best body read |
| V3 Dispersion-Low | Introduce subtle edge spectral | Continuous dispersion at low amount | Accept if edge accents appear without gimmick |
| V4 Dispersion-Mid | Find upper tasteful limit | Same as V3 + moderate dispersion | Reject if RGB/demo feel appears |
| V5 Absorption-Polish | Add depth richness | Tiny volume absorption + no extra saturation | Keep if luxury feel improves |
| V6 Final-Post-Trim | Final presentation trim | Minimal bloom/contrast only | Ship only if rubric passes all gates |

Rule: each variant = same locked camera + one controlled delta class. No multi-variable chaos.

---

## 8) Immediate execution brief for next run

1. Start from v07 lock, not from mixed-method version.
2. Prove premium glass body with dispersion OFF first.
3. Add continuous dispersion only after lighting hierarchy is stable.
4. Judge hero frames, not proof frames.
5. Reject anything that reads like RGB prism demo regardless of technical cleverness.
