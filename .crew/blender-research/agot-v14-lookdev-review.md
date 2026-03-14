# AGOT v14 Lookdev Review (Critic Pass)

Date: 2026-03-08
Reviewer: AMAS v14 lookdev critic (evaluation-only, no build)

## Scope
Evaluate latest **v13** renders now, then define **v14 pass/fail gates** for:
1. Glass realism
2. Tasteful dispersion
3. Premium mood
4. AGOT brand fit (spiritual, elegant, restrained)

Hard rule: **Auto-reject if render reads like fake RGB/prism-demo gimmick**.

---

## Files reviewed (v13)
- `.crew/blender-research/renders/agot-v13-final-A.png`
- `.crew/blender-research/renders/agot-v13-final-B.png`
- `.crew/blender-research/renders/agot-v13-dispersion-proof.png`
- `.crew/blender-research/renders/agot-v13-before-vs-after.png`

## v13 Verdict
# **FAIL (Do not ship)**

### Numeric rubric (0–10)
| Category | Score | Gate | Result |
|---|---:|---:|---|
| Glass realism | 2.0 | >= 8.0 | FAIL |
| Tasteful dispersion | 1.0 | >= 7.5 | FAIL |
| Premium mood | 4.0 | >= 8.0 | FAIL |
| AGOT brand fit | 3.0 | >= 8.0 | FAIL |
| **Weighted total** (30/25/25/20) | **2.45 / 10** | **>= 8.0** | **FAIL** |

### Hard critique (v13)
- **Glass does not read as glass.** It reads closer to dark solid/plastic/obsidian than transmissive crystal.
- **Refraction behavior is weak to absent** in hero read. Interior energy is dead; no convincing depth travel.
- **Dispersion is either missing in hero frames or too buried to matter.** If dispersion only appears in “proof” conditions but not in final beauty, it is functionally absent.
- **Mood is test-render, not premium campaign.** Lighting is technically controlled but emotionally flat; lacks expensive photographic intent.
- **Brand mismatch:** AGOT should feel contemplative + sacred + restrained. Current result feels procedural and inert.

### Red flags seen in v13
- Near-zero readable spectral separation in finals.
- No persuasive caustic/refraction storytelling on receiver.
- “Before vs after” does not show enough elevation to justify version progression.

---

## v14 Pass/Fail Gates (must all pass)

## 1) Glass realism gate
Pass only if all are true:
- Clear transmissive read at first glance (not opaque block).
- Believable Fresnel: edges brighten naturally, center retains depth.
- Refraction distorts background/ground with physically plausible continuity.
- Internal light transport visible (subtle but present), no muddy black core.

Auto-fail triggers:
- Cube reads as painted/solid material.
- Edge highlights look screen-space fake or disconnected from scene lighting.

## 2) Dispersion gate (tasteful, not demo)
Pass only if all are true:
- Spectral split appears **only** where optics justify it (grazing edges/high-contrast transitions).
- Intensity remains restrained; color split supports form instead of shouting for attention.
- Zero tri-band “RGB sticker” look.

**Auto-reject conditions (non-negotiable):**
- Obvious red/green/blue outlines around all edges.
- Uniform rainbow glow not tied to angle/thickness.
- Prism-toy aesthetic that steals attention from the object form.

## 3) Premium mood gate
Pass only if all are true:
- Lighting has luxury intent (controlled contrast, intentional highlights, elegant falloff).
- Image feels expensive without gimmicks (quiet confidence, not VFX demo).
- Tonal hierarchy is clean: hero object dominant, base supports, background recedes.

Auto-fail:
- Flat/stale lighting, or noisy over-stylization.

## 4) AGOT brand fit gate
Pass only if all are true:
- Spiritual-contemplative tone (calm, reverent, not flashy-tech).
- Elegance through restraint (minimal moves, maximum precision).
- Visual language aligns with AGOT identity: premium, timeless, intentional.

Auto-fail:
- “Tech demo” vibe, neon spectacle, or social-media bait rainbow treatment.

---

## v14 Acceptance rubric
Use same scoring; release candidate requires:
- **Each category >= gate**
- **Weighted total >= 8.0/10**
- **No auto-reject trigger present**

Recommended quality bar for ship confidence: **8.5+ overall**.

---

## Final call
- **v13: Rejected.**
- **v14: Pending renders.** Evaluate immediately against the gates above when v14 frames land.
