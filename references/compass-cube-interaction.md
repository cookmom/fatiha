# Compass Mode — Cube Light Interaction Brief
*Chris (lookdev) + chef — 2026-02-27*

## The Problem
In compass mode, the prismatic fan beam appears on the floor but there's no visual story of light **entering** the cube, being **transformed** inside, and **exiting** as the rainbow spectrum. The cube and the beam feel disconnected.

## The Story We Want
1. **ENTRY**: A focused white/warm beam hits the cube from the Qibla direction
2. **INSIDE**: Light bounces and intensifies inside — the cube glows with trapped energy
3. **EXIT**: Concentrated rainbow caustics emerge from the opposite face → becomes the prismatic floor fan

## Top 3 Ideas (Impact vs Effort)

### 1. Entry Beam + Internal Glow (HIGH impact, LOW effort)
**What:** Add a visible light beam entering the cube from the compass direction, plus an emissive glow inside the cube that activates during compass alignment.

**Entry beam:** A thin PlaneGeometry strip (additive blend, soft edges) extending from beyond the cube toward its entry face. Color: warm white fading to the dominant spectral color. Aligns to compass heading.

**Internal glow:** Increase the cube's FBO shader emissive term when `_compassAligned = true`. Add a uniform `uInternalGlow` that ramps 0→1 on alignment. In the fragment shader, mix in a warm emissive color modulated by fresnel (brighter at edges = light bouncing off inner walls).

**Performance:** One extra plane mesh + one uniform change. Trivial.

### 2. Exit Face Caustic Hotspot (HIGH impact, MEDIUM effort)
**What:** A bright, concentrated spectral hotspot on the exit face of the cube where the refracted beam emerges. Like looking at the rainbow band on the exit face of a real prism.

**Implementation:** Small PlaneGeometry (or disc) positioned at the exit face of the cube, facing outward. Custom shader with:
- Piecewise spectral gradient (same as FRAG_PRISM_FAN but tighter)
- High intensity, small size (~0.3 units)
- Additive blending
- Fades in only when compass is aligned
- Position tracks the opposite face from entry direction

**This bridges the gap** between the cube and the floor fan — you see the rainbow concentrate on the exit face, then spread into the floor fan below.

**Performance:** One small mesh + shader. Trivial.

### 3. Animated Internal Caustic Pattern (MEDIUM impact, MEDIUM effort)
**What:** A caustic/refraction pattern visible on the cube's faces during compass mode — like you're seeing light bounce around inside.

**Implementation:** Add a second pass or overlay to the cube's faces using a scrolling noise-based caustic pattern. Could be:
- A slightly larger BoxGeometry (1.01x scale) with a caustic ShaderMaterial
- Animated voronoi/cellular noise for the caustic pattern
- Tinted with spectral colors, additive blend
- Only visible during compass alignment (opacity ramps with alignment)

**Performance:** One extra box mesh with a simple noise shader. ~0.5ms.

## Recommended Combo
Implement #1 (entry beam + internal glow) and #2 (exit face caustic) together. They tell the complete story:
- Entry beam → hits cube → cube glows internally → exit face shows concentrated spectrum → floor fan spreads the rainbow

Skip #3 for now — the internal glow from #1 may be enough, and #3 adds complexity.

## Technical Notes
- Entry beam direction = opposite of Qibla bearing (light comes FROM Mecca direction toward cube)
- Exit face = face closest to camera on the Qibla side
- Both effects should ramp in/out with `_compassAligned` flag
- Internal glow uniform can piggyback on existing `cubeMat.uniforms`
- All new meshes go into `prismGroup` so they inherit the PI/4 rotation
