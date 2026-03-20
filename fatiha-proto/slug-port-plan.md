# Slug Calligraphy Port — Plan

## What is Slug?
GPU-native bezier curve rendering. No rasterization, no texture atlases. Each glyph stays as mathematical quadratic Bézier curves evaluated directly in the fragment shader. Resolution-independent, perfectly antialiased at any zoom/angle.

## Source
- Official repo: https://github.com/EricLengyel/Slug (MIT, public domain patent)
- JCGT Paper: https://jcgt.org/published/0006/02/02/
- Blog: https://terathon.com/blog/decade-slug.html
- Shaders: SlugPixelShader.hlsl (281 lines), SlugVertexShader.hlsl (101 lines)

## How It Works
1. Font glyphs decomposed into quadratic Bézier curves
2. Curves stored in a texture (curve data + band data)
3. Vertex shader: positions bounding quad for each glyph, handles dynamic dilation
4. Pixel shader: for each fragment, shoots horizontal + vertical rays through curves
5. Calculates winding number via root finding on the quadratic Bézier polynomials
6. Coverage from ray intersections → antialiased alpha

## Port to WebGL/GLSL

### Phase 1: Core Algorithm Port
- [ ] Translate SlugPixelShader.hlsl → GLSL (HLSL→GLSL is mostly syntax changes)
- [ ] Translate SlugVertexShader.hlsl → GLSL
- [ ] Replace HLSL-specific: `asuint()`, `Load()`, `SV_Position`, etc.
- [ ] Create WebGL2 texture for curve + band data
- [ ] Test with a simple Latin glyph first

### Phase 2: Arabic Font Support
- [ ] Parse Arabic OpenType font → extract quadratic Bézier outlines
- [ ] Handle Arabic ligatures and contextual forms (initial/medial/final/isolated)
- [ ] Right-to-left layout
- [ ] Store curve data for Bismillah verse as proof of concept

### Phase 3: Animated Stroke Drawing
- [ ] Parameterize curves by t (0→1) per stroke
- [ ] Animate t over time = stroke drawing animation
- [ ] Map audio recitation progress → stroke progress
- [ ] Each letter appears as it's being recited

### Phase 4: Mihrab Arch Composition
- [ ] Calligraphy follows mihrab arch form (prayer niche shape)
- [ ] Each verse = a line flowing R→L, stacking within the arch
- [ ] Bismillah crowns the top of the arch
- [ ] Ottoman garden grows AROUND the verses — vines and flowers as illuminated borders
- [ ] Tyler Hobbs watercolor deformation on letterforms
- [ ] The calligraphy IS the content; the garden frames it like a manuscript page
- [ ] Decision: mihrab > spiral. Arabic flows horizontally R→L; spiral fights the script.

## HLSL → GLSL Translation Notes
| HLSL | GLSL |
|------|------|
| `float2/3/4` | `vec2/3/4` |
| `int2/3/4` | `ivec2/3/4` |
| `uint` | `uint` |
| `asuint(x)` | `floatBitsToUint(x)` |
| `Load(int3)` | `texelFetch(sampler, ivec2, 0)` |
| `SV_Position` | `gl_FragCoord` |
| `SV_Target0` | `out vec4 fragColor` |
| `cbuffer` | `uniform` |
| `>>` `&` `|` | same in GLSL ES 3.0+ |

## Key Challenge: Arabic Bezier Data
Standard Latin fonts have simple glyphs. Arabic has:
- 4 forms per letter (isolated, initial, medial, final)
- Complex ligatures (laam-alif etc.)
- Diacritical marks (harakat) as separate overlay glyphs
- We need: font parsing → bezier extraction → texture packing
- Libraries: opentype.js can extract glyph outlines in JS
