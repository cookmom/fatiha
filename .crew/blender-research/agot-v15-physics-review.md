# AMAS v15 Physics Review

Date: 2026-03-08
Reviewer: Physics compliance audit (v15 task)

## Scope checked
- No fake RGB split-light rig in final beauty frames
- Method alignment with SOTA guide first-choice stack
- Spectral separation present and believable
- AGOT composition lock preserved

---

## Artifact status (hard blocker)
I could not find any explicit **v15** scene/renders in `.crew/blender-research` (no `agot-v15*` files).
Latest available deliverable is **v14** (`agot-v14.blend`, `agot-v14-A/B.png`, `agot-v14-dispersion-proof.png`, `agot-v14-lock-values.json`).

**Therefore this audit is necessarily against latest available output (v14-as-submitted-for-v15 check), and v15 traceability is currently non-compliant.**

---

## Findings by requirement

### 1) Fake RGB split-light rig in final beauty frames
**Result: PASS (for latest available frames)**
- Build script explicitly removes `Prism_*` and `PrismCastRig` objects.
- Final beauty frames do not show obvious tri-light RGB edge-offset signatures.

### 2) Method aligns with SOTA first-choice stack
**Result: FAIL (hard)**
- SOTA doc ranks first-choice as:
  1) LuxCore spectral (best), or
  2) Cycles multi-band wavelength approximation (5–9 bands) as best Blender-native.
- Current build uses **BLENDER_EEVEE** and a **noise-driven pseudo-spectral color ramp + IOR map**.
- This is not spectral transport and not Cycles multi-band wavelength implementation.

### 3) Spectral separation present and believable
**Result: FAIL (hard)**
- Separation read in finals is weak and appears mostly material-color modulation driven, not robust physically-derived dispersion behavior.
- The approach couples color to procedural noise/curves rather than wavelength-band refraction architecture from SOTA guidance.
- Proof frame shows stronger color, but method basis remains approximation outside accepted first-choice stack.

### 4) AGOT composition lock preserved
**Result: PASS**
- `agot-v14-lock-values.json` reports all lock checks true:
  - camera position lock: true
  - look target lock: true
  - cube Y lock: true
  - cube yaw lock: true
  - overall pass: true

---

## Overall score and decision
**Score: 3.8 / 10**
**Decision: FAIL**

### Hard reasons for fail
1. **Version traceability failure:** no v15 artifacts provided (`agot-v15*` missing), so v15 cannot be strictly audited.
2. **Method non-compliance:** implementation does not match SOTA first-choice stack (no LuxCore spectral, no Cycles 5–9 band spectral approximation).
3. **Physics credibility gap:** visible chromatic behavior is largely procedural/lookdev-driven rather than physically grounded wavelength-separation workflow.

---

## Minimum fix required to pass next review
- Produce explicit v15 artifacts: `agot-v15.blend`, `agot-v15-A.png`, `agot-v15-B.png`, `agot-v15-dispersion-proof.png`, `agot-v15-lock-values.json`.
- Implement one of SOTA-approved primary methods:
  - LuxCore spectral, or
  - Cycles 5–9 band wavelength approximation using Sellmeier/Cauchy-derived per-band IOR.
- Re-run lock dump and include direct v15 lock proof.
