# Mixbox & p5.brush Soft Edge Research

## p5.brush Soft Edge Technique

### Core Finding: The Saturating Blend Mode

The #1 technique from p5.brush is NOT about individual stamp softness — it's about **how stamps accumulate**. The blend mode `gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE)` is the key.

**How it works:**
```
result.rgb = src.rgb * (1 - dst.a) + dst.rgb
result.a   = src.a   * (1 - dst.a) + dst.a
```

- First stamp: full contribution (dst.a = 0)
- Subsequent stamps: contribution diminishes as area fills
- Alpha approaches 1.0 asymptotically — natural saturation
- Prevents the "ring" artifact where overlapping semi-transparent stamps create visible edges

**Contrast with standard premultiplied alpha** (`ONE, ONE_MINUS_SRC_ALPHA`):
- Standard: each new stamp covers the old → banding rings at overlap boundaries
- Saturating: new paint goes "behind" old → smooth, even tone buildup

### Secondary Techniques

1. **Directional perpendicular scatter**: Jitter stamps perpendicular to stroke direction with Gaussian distribution, not uniform random
2. **Per-stamp alpha & size randomization**: ±15% size, ±25% alpha breaks up mechanical regularity
3. **Stochastic stamp culling** (grain): Skip stamps randomly for textured effects
4. **Pressure-squared size scaling**: `pressure^2` for stamp diameter gives natural taper
5. **Smoothstep antialiased circle**: Individual stamps use `smoothstep` with `fwidth` for 1-2px AA edge — softness comes from overlap, not blur
6. **Multi-pass buildup at endpoints**: Scale stamps from small to full size at stroke start/end for graduated ramp

### Architecture Insight

p5.brush renders stamps to a **monochrome mask buffer** first, then composites to the canvas with spectral (Kubelka-Munk) color mixing. Our engine has color per-stamp, but the saturating blend still works — earlier stamps dominate, creating natural "first stroke wins" watercolor behavior.

---

## Mixbox Integration

### What It Does

Mixbox replaces standard RGB interpolation with Kubelka-Munk pigment mixing:
- Blue + Yellow → **Green** (not gray like RGB lerp)
- Red + Blue → **Purple** (not muddy brown)
- Red + White → Natural **Pink** (not washed-out)

### How It Works

1. **Latent Space**: Each RGB color maps to 7 values (4 pigment coefficients + 3 RGB residuals)
2. **256KB LUT**: A 512x512 RGBA texture stores the 64^3 RGB-to-pigment mapping
3. **Polynomial**: A degree-3 polynomial with 20 terms maps pigment coefficients back to RGB
4. **Mixing**: Interpolation in latent space, then convert back via polynomial + residual

### GLSL API

```glsl
// Available after injecting mixbox.glsl():
vec3  mixbox_lerp(vec3 rgb1, vec3 rgb2, float t);  // simple 2-color mix
vec4  mixbox_lerp(vec4 rgba1, vec4 rgba2, float t); // with alpha

mixbox_latent mixbox_rgb_to_latent(vec3 rgb);       // for multi-color mixing
vec3 mixbox_latent_to_rgb(mixbox_latent latent);
```

### JavaScript API

```javascript
mixbox.glsl()          // Returns GLSL code string to inject into shaders
mixbox.lutTexture(gl)  // Returns ready-to-use WebGLTexture (512x512 RGBA LUT)
mixbox.lerp(c1, c2, t) // JS-side mixing (for non-shader use)
```

### Integration Architecture

We use **ping-pong compositing FBOs** with a Mixbox shader:

1. Clear accumulation FBO A with background color
2. For each layer:
   - Shader reads: acc FBO (previous result) + layer FBO texture
   - Mixbox-blends them together
   - Writes to acc FBO B
   - Swap A ↔ B
3. Blit final accumulation to screen

This gives pigment-based blending between layers (green leaves + red petals = natural warm tones, not gray).

### Pigment Reference Colors (built into Mixbox)

| Pigment | Hex |
|---------|-----|
| Cadmium Yellow | #FE9E00 |
| Cadmium Red | #FE2702 |
| Cobalt Blue | #002186 |
| Ultramarine Blue | #190059 |
| Phthalo Green | #003C32 |
| Sap Green | #6B9403 |
| Burnt Sienna | #7B4800 |

These map to real oil/watercolor tube pigments — ideal for Ottoman garden palette.

### Performance

- LUT texture: 1 texture unit, 512x512 RGBA (~1MB)
- Per `mixbox_lerp()`: 4 texture lookups + polynomial evaluation
- Impact: negligible for our compositing pass (one fullscreen quad per layer)

### License

CC BY-NC 4.0 (non-commercial). Commercial use requires license from mixbox@scrtwpns.com.

---

## Implementation Summary

### Changes to fatiha-brush.js

1. **Stamp→FBO blend**: `ONE_MINUS_DST_ALPHA, ONE` (saturating blend for soft edges)
2. **Mixbox compositing**: Ping-pong FBOs with Mixbox GLSL shader
3. **Graceful fallback**: If Mixbox JS not loaded, falls back to standard compositing

### Changes to fatiha-brush-demo.html

1. Add `<script src="https://scrtwpns.com/mixbox.js"></script>` before engine script
