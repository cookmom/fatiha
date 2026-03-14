# AGOT v04 Autonomous Blender Loop Report

## Objective
Pass all hard gates:
1. **Glass-read**: visible transparency/refraction + strong Fresnel edges, not opaque.
2. **Composition**: balanced key/fill/rim with readable silhouette.
3. **Deliverable**: side-by-side baseline vs improved framing.

---

## Round 1 (Initial candidate)
- Rendered A/B from current scene state via `tools/blender-bridge.py exec`.
- External self-critique (vision check):
  - **Glass-read: FAIL** (object reading too dark/opaque, weak interior refraction).
  - **Composition: mixed** (A marginal pass, B fail due aggressive crop / weak separation).
- Decision: continue iterating (no partial stop).

## Round 2 (Lighting/material/framing correction)
Applied scene changes via MCP bridge:
- **Cycles quality/pathing**
  - Samples 384, denoise on
  - Max bounces 20, transmission 16, glossy 10, diffuse 6
  - Refractive + reflective caustics enabled
- **World / environment lift**
  - Background color lifted from near-black to dark blue-gray
  - Background strength increased to improve transmitted/refraction readability
- **Glass material tuning (`Glass_AGOT`)**
  - Roughness reduced for crisper edge response
  - IOR nudged up for stronger Fresnel behavior
  - Specular IOR level increased for edge pop
- **Lighting rebalance**
  - Key increased, fill significantly lifted, rim strengthened and repositioned
  - Goal: readable silhouette and more intentional key/fill/rim split
- **Camera framing update**
  - Pass A: hero framing with full object readability
  - Pass B: widened/reframed to avoid crop and preserve silhouette

Re-rendered A/B and re-checked:
- **Image A**: Glass-read PASS, Composition PASS
- **Image B**: Glass-read PASS, Composition PASS
- **Final verdict**: **PASS**

---

## Final Outputs
- Blend file: `.crew/blender-research/agot-v04-loop-final.blend`
- Final renders:
  - `.crew/blender-research/renders/agot-v04-pass-A.png`
  - `.crew/blender-research/renders/agot-v04-pass-B.png`
- Baseline vs improved comparison:
  - `.crew/blender-research/renders/agot-v04-baseline-compare.png`

## Final Pass Rationale
The final images clearly read as glass (transparent body, visible refractive distortion, bright Fresnel edges on grazing bevels) and no longer read as a dark opaque block. Lighting now provides an intentional key/fill/rim structure with consistent silhouette separation in both final framings. Baseline-vs-improved comparison is included as requested.