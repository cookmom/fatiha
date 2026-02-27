# Grain Texture Technique — Spectral Clone Method

## The Problem
Generate a seamlessly tiling grain texture that reads as "surface material" (like a watch dial or painted metal), not "digital noise" or "TV static."

## What Didn't Work (and Why)

| Approach | Result | Why It Failed |
|----------|--------|---------------|
| Gray-Scott reaction-diffusion | Worm-like patterns | Too coarse, organic shapes not grain |
| Worley/cellular noise | Blobby, sharp edges | Cell boundaries visible, wrong scale |
| Multi-frequency fBm noise | Smooth, characterless | No cellular structure, reads as blur |
| NOMOS dial photo → FFT phase-randomize | TV static / splotchy | Real sandblast grain has too much low-frequency energy |
| Histogram-matching soft textures | Same noise, more contrast | Boosting contrast on bad structure makes it worse |
| Spatial-domain tiling (cross-dissolve, cosine blend) | Visible seam artifacts | Blending in pixel space creates ghosting at boundaries |

## What Worked: Spectral Clone

**Core insight**: A texture's *character* lives in its **frequency spectrum** (the magnitude of its FFT). The *arrangement* of features lives in the **phase**. Randomizing the phase while keeping the magnitude gives you a new texture with identical character that tiles perfectly (FFT output is inherently periodic).

### Step-by-Step

```python
import numpy as np
from PIL import Image

# 1. Load the reference texture (the one whose CHARACTER you want)
ref = np.array(Image.open('reference-grain.png').convert('L'), dtype=float)

# 2. Resize to target tile size (198×198 = anti-seam, not divisible by common screen widths)
ref = np.array(Image.fromarray(ref.astype(np.uint8)).resize((198, 198)), dtype=float)

# 3. FFT — extract magnitude (character) and discard phase (arrangement)
F = np.fft.fft2(ref / 255.0)
magnitude = np.abs(F)

# 4. Generate random phase — this is what makes it "ours"
np.random.seed(42)  # any seed works, try a few
random_phase = np.exp(1j * 2 * np.pi * np.random.rand(198, 198))

# 5. Combine reference magnitude + random phase → inverse FFT
result = np.real(np.fft.ifft2(magnitude * random_phase))

# 6. Normalize to 0-255
result = (result - result.min()) / (result.max() - result.min())
out = (result * 255).astype(np.uint8)

# 7. Histogram-match to reference (same contrast/brightness distribution)
def hist_match(source, template):
    s_flat = source.flatten().astype(float)
    t_flat = template.flatten().astype(float)
    s_order = s_flat.argsort()
    t_sorted = np.sort(t_flat)
    result = np.empty_like(s_flat)
    result[s_order] = t_sorted[:len(s_order)]
    return result.reshape(source.shape)

matched = hist_match(out.astype(float), ref)
final = np.clip(matched, 0, 255).astype(np.uint8)

Image.fromarray(final, 'L').save('grain-tile-198.png')
```

### Why 198×198?
Anti-seam sizing: 198 = 2 × 9 × 11. Not divisible by common screen widths (320, 375, 390, 414, 768, 1024, 1440), so tile repeat boundaries never align with pixel grid → invisible seams.

### Verify Tiling
Always check a 4×4 or 5×5 tile grid visually:
```python
tile = Image.open('grain-tile-198.png')
tiled = Image.new('L', (792, 792))
for r in range(4):
    for c in range(4):
        tiled.paste(tile, (c*198, r*198))
tiled.save('tiled-check.png')
```

## CSS Implementation

### Blend Mode Selection (CRITICAL)

| Blend Mode | Effect | Best For |
|------------|--------|----------|
| `plus-lighter` | Additive (adds brightness) | Light backgrounds (#f0+) only |
| `soft-light` | Symmetric contrast (darkens darks, lightens lights) | Mid-tone backgrounds ✅ |
| `overlay` | Like soft-light but stronger | When soft-light is too subtle |
| `multiply` | Darkens only | Dark textures on light bg |

**Key lesson**: `plus-lighter` washes out mid-gray backgrounds because it literally adds the grain's brightness value. A grain pixel at 128/255 adds 50% brightness × opacity. On a light bg (#f5f5f0) this is barely visible; on mid-gray (#7a7d82) it shifts the entire surface toward white.

`soft-light` preserves the base color and adds texture contrast symmetrically — dark grain pixels darken, light grain pixels lighten. This is what you want for watch-dial / painted-surface aesthetics on any background.

### Final CSS (A Gift of Time v210)
```css
.clock-fs-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image: url(grain-fine.png);
  background-repeat: repeat;
  background-size: 148.5px auto;
  mix-blend-mode: soft-light;
  opacity: 0.4;
  pointer-events: none;
}
.clock-fs-overlay canvas {
  z-index: 20;  /* above grain layer */
}
```

### Z-Index Sandwich Architecture
```
CSS background (dial color)     ← bottom
  ↑ grain ::after (z-index: 1)  ← texture layer
  ↑ transparent canvas (z-index: 20) ← clock elements on top
```
Canvas must be transparent: `scene.background = null` + `renderer.setClearColor(0x000000, 0)` + `renderer.alpha = true`.

## Texture Quality Checklist

Before shipping, verify:
- [ ] **Tile test**: 4×4 grid shows no visible seams or repeat patterns
- [ ] **No low-freq splotches**: Texture should look uniform at arm's length (no bright/dark patches)
- [ ] **Feature size**: Cellular/vermiculate features ~2-4px at tile resolution (reads as "surface" not "noise")
- [ ] **Stats match reference**: `mean` and `std` within 5% of reference after histogram matching
- [ ] **A/B test on target bg**: Side-by-side with reference at same blend mode + opacity
- [ ] **Both day AND night mode**: Verify grain reads well on both light and dark backgrounds

## Texture Character vs Noise
The difference between "surface texture" and "digital noise":
- **Surface texture**: Tight, uniform feature sizes. Cellular or vermiculate (worm-like) patterns. Consistent density across the tile. Reads as physical material.
- **Digital noise**: Broad frequency range. Random pixel-level variation mixed with low-frequency splotches. Reads as camera sensor noise or compression artifacts.

Real sandblasted metal (NOMOS dials) has too much low-frequency variation to work as a CSS overlay — the splotchiness becomes visible when tiled. The Bauhaus vermiculate pattern works because its energy is concentrated in a narrow frequency band.

## Files
- Reference: `references/nomos-campus-pink-closeup-hires.jpg` (1280×854)
- Reference: `references/nomos-campus-teal-closeup.jpg` (1280×854)  
- Production tile: `ramadan-clock-site/grain-fine.png` (198×198, spectral clone)
- Bauhaus reference: saved as `/tmp/bauhaus-grain.png` (198×198, indexed PNG)
- Z-depth skill: `skills/z-depth-layering/SKILL.md`

---
*Developed Feb 17-18, 2026 for A Gift of Time (agiftoftime.app). 10 iterations (v201-v210).*
