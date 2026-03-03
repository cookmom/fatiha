---
name: lookdev-artist
description: >-
  Look development for 3D materials, texturing, and visual quality. PBR material authoring,
  Three.js MeshPhysicalMaterial mastery, Blender Principled BSDF mapping, procedural textures,
  color grading, environment/HDRI selection, and specialized lookdev for watches, jewelry,
  and automotive paint. Use when asked to: create or tune PBR materials, set up realistic
  material properties, choose roughness/metalness/IOR values, author clearcoat/transmission/
  sheen/iridescence/anisotropy effects, develop procedural textures, select HDRIs, do color
  grading, or achieve specific real-world material looks.
---

# Lookdev Artist

Guide users through look development — achieving photorealistic or stylized material appearance in Three.js and Blender.

## Core Workflow

1. **Identify the look** — What real-world material or aesthetic are we targeting?
2. **Select base values** — Pull from the PBR reference table below
3. **Layer effects** — Add clearcoat, transmission, sheen, iridescence, anisotropy as needed
4. **Texture** — Apply procedural or image-based textures for micro-detail
5. **Light & environment** — Choose HDRI and lighting to complement the material
6. **Iterate** — Tweak values, compare to reference photos

## Quick Reference: When to Use Which Property

| Effect | Key Properties | Example |
|--------|---------------|---------|
| Shiny metal | metalness=1, roughness=0.05–0.3 | Chrome, gold, copper |
| Matte surface | metalness=0, roughness=0.8–1.0 | Concrete, chalk, fabric |
| Glass/crystal | transmission=1, ior=1.5+, roughness≈0 | Window glass, sapphire |
| Car paint | clearcoat=1, clearcoatRoughness=0.03 | Metallic automotive |
| Fabric | sheen=1, sheenRoughness=0.3–0.8 | Velvet, satin, silk |
| Soap bubble | iridescence=1, iridescenceIOR=1.3 | Thin-film interference |
| Brushed metal | anisotropy=0.5–1.0, anisotropyRotation | Brushed steel, hair |
| Subsurface | thickness + transmission + color | Skin, wax, marble, jade |

---

## PBR Material Reference Table

> Load `references/pbr-material-library.md` for the full 200+ material library.
> Below: essential quick-reference (50+ materials).

### Metals (metalness = 1.0)

| Material | Color (hex) | Roughness | IOR | Notes |
|----------|-------------|-----------|-----|-------|
| Polished gold | #FFD700 | 0.05–0.10 | — | F0 reflectance ~0.95 |
| Brushed gold | #DAA520 | 0.25–0.35 | — | Add anisotropy 0.5–0.8 |
| Rose gold | #B76E79 | 0.08–0.15 | — | Copper-gold alloy |
| Polished silver | #C0C0C0 | 0.05–0.10 | — | F0 ~0.95, tarnishes easily |
| Brushed silver | #A8A8A8 | 0.25–0.40 | — | Anisotropy for directional |
| Polished platinum | #E5E4E2 | 0.05–0.10 | — | Slightly warmer than silver |
| Polished chrome | #DCDCDC | 0.02–0.05 | — | Mirror-like |
| Brushed steel | #8A8A8A | 0.30–0.45 | — | Anisotropy 0.6–1.0 |
| Cast iron | #3B3B3B | 0.60–0.80 | — | Dark, rough |
| Copper (polished) | #B87333 | 0.05–0.12 | — | Warm orange tone |
| Copper (aged) | #5F8575 | 0.40–0.60 | — | Green patina overlay |
| Bronze | #CD7F32 | 0.20–0.35 | — | Warmer than brass |
| Brass (polished) | #D4A843 | 0.08–0.15 | — | Yellow-gold |
| Titanium | #878681 | 0.20–0.35 | — | Gray with slight warmth |
| Aluminum (polished) | #D6D6D6 | 0.10–0.20 | — | Lighter than steel |
| Aluminum (anodized) | varies | 0.30–0.50 | — | Colored oxide layer |

### Dielectrics (metalness = 0.0)

| Material | Color (hex) | Roughness | IOR | Notes |
|----------|-------------|-----------|-----|-------|
| Glass (clear) | #FFFFFF | 0.0–0.02 | 1.52 | transmission=1 |
| Sapphire crystal | #F0F8FF | 0.0–0.01 | 1.77 | transmission=1, very hard |
| Diamond | #F0F0F0 | 0.0 | 2.42 | transmission=1, high dispersion |
| Ruby | #E0115F | 0.02 | 1.77 | transmission=0.8 |
| Emerald | #50C878 | 0.03 | 1.57 | transmission=0.7 |
| Water | #C6E6F0 | 0.0 | 1.33 | transmission=1 |
| Ice | #D6F0FF | 0.15–0.30 | 1.31 | Slightly rough surface |
| Quartz | #F5F5F5 | 0.01 | 1.54 | transmission=0.95 |
| Amber | #FFBF00 | 0.05 | 1.55 | transmission=0.7, warm |
| Plastic (glossy) | varies | 0.15–0.30 | 1.46 | ABS, polycarbonate |
| Plastic (matte) | varies | 0.60–0.80 | 1.46 | — |
| Rubber | #2A2A2A | 0.85–1.0 | 1.52 | Very diffuse |
| Wood (polished) | #8B6914 | 0.25–0.40 | 1.55 | Lacquered furniture |
| Wood (raw) | #A0784A | 0.70–0.90 | 1.55 | Unfinished |
| Leather | #6B3A2A | 0.50–0.70 | 1.50 | Varies by treatment |
| Concrete | #7C7C7C | 0.80–1.0 | 1.50 | Very rough |
| Marble (polished) | #F0EDE4 | 0.05–0.15 | 1.49 | Add subsurface |
| Marble (honed) | #E8E4DA | 0.35–0.50 | 1.49 | Matte finish |
| Ceramic (glazed) | #F5F5F0 | 0.05–0.15 | 1.50 | Porcelain, tile |
| Ceramic (unglazed) | #D4C4A8 | 0.70–0.90 | 1.50 | Terracotta, bisque |
| Paper | #F5F2E8 | 0.80–0.95 | 1.50 | Very diffuse |
| Fabric (cotton) | varies | 0.85–1.0 | 1.50 | Use sheen for shiny fabrics |
| Fabric (silk) | varies | 0.30–0.50 | 1.50 | sheen=1, sheenRoughness=0.3 |
| Fabric (velvet) | varies | 0.90–1.0 | 1.50 | sheen=1, sheenRoughness=0.5 |
| Skin (human) | #FFCBA4 | 0.40–0.60 | 1.40 | Subsurface scattering |
| Wax | #FFF5E0 | 0.30–0.50 | 1.45 | Subsurface, translucent |
| Jade | #00A86B | 0.15–0.30 | 1.62 | Subsurface green scatter |
| Asphalt | #3A3A3A | 0.85–1.0 | 1.64 | Very rough |
| Snow | #FAFAFA | 0.80–0.95 | 1.31 | Subsurface scattering |
| Sand | #C2B280 | 0.90–1.0 | 1.50 | Granular |

### Special Materials

| Material | Color | Roughness | Metalness | Special |
|----------|-------|-----------|-----------|---------|
| SuperLuminova (glow) | #C8F7C5 | 0.60–0.80 | 0.0 | emissive=#C8F7C5, emissiveIntensity=0.3–2.0 |
| Carbon fiber | #1A1A1A | 0.20–0.35 | 0.0 | clearcoat=1, anisotropy for weave |
| Mother of pearl | #F8E8E0 | 0.10–0.20 | 0.0 | iridescence=1, iridescenceIOR=1.3 |
| Enamel (watch dial) | varies | 0.05–0.15 | 0.0 | Glossy, opaque, slight depth |

---

## Three.js MeshPhysicalMaterial — Complete Property Guide

### Base Properties

```js
new THREE.MeshPhysicalMaterial({
  color: 0xffffff,        // Base color (albedo)
  metalness: 0.0,         // 0 = dielectric, 1 = metal
  roughness: 0.5,         // 0 = mirror, 1 = fully diffuse
  ior: 1.5,               // Index of refraction (1.0–2.333)
  reflectivity: 0.5,      // Alternative to IOR for dielectrics (0–1)
  envMapIntensity: 1.0,   // Environment map contribution
})
```

**Metalness**: Controls whether the surface is metallic. Metals have colored reflections (albedo tints the specular), dielectrics have white reflections. No in-between for real materials — use 0 or 1, with maps for transitions (rust on metal).

**Roughness**: Microsurface scattering. 0 = perfect mirror. 0.5 = semi-glossy. 1.0 = fully diffuse. Most real materials fall in 0.3–0.7 range.

**IOR**: Index of refraction. Controls Fresnel reflectance for dielectrics. Higher IOR = more reflective at normal incidence. Glass=1.52, water=1.33, diamond=2.42.

### Clearcoat

```js
{
  clearcoat: 1.0,              // 0–1, strength of clear layer
  clearcoatRoughness: 0.03,    // Roughness of the clear layer
  clearcoatNormalMap: texture,  // Independent normal for clearcoat (orange peel)
  clearcoatNormalScale: new THREE.Vector2(0.3, 0.3),
}
```

**What it simulates**: A thin transparent glossy layer on top of the base material. Think car paint (glossy clear over metallic flake), lacquered wood, varnished surfaces.

**Recipes**:
- **Car paint**: clearcoat=1.0, clearcoatRoughness=0.02–0.05, base metalness=0.9, base roughness=0.4–0.6
- **Lacquered wood**: clearcoat=0.8, clearcoatRoughness=0.05, base metalness=0, base roughness=0.5
- **Varnished surface**: clearcoat=0.5–0.8, clearcoatRoughness=0.1–0.2
- **Orange peel (car)**: Use clearcoatNormalMap with subtle noise, scale ~0.1–0.3
- **Watch case polish**: clearcoat=0.3, clearcoatRoughness=0.01 (subtle gloss boost)

### Transmission (Transparency)

```js
{
  transmission: 1.0,           // 0–1, how transparent
  thickness: 0.5,              // Thickness for absorption/refraction
  attenuationColor: 0x88ccff,  // Color absorbed over distance
  attenuationDistance: 0.5,     // Distance for absorption (smaller = more colored)
  ior: 1.52,                   // Refraction index
  dispersion: 0.0,             // Chromatic dispersion (≥0, new in r165)
}
```

**Recipes**:
- **Clear glass**: transmission=1, ior=1.52, roughness=0, thickness=0.5
- **Frosted glass**: transmission=1, ior=1.52, roughness=0.3–0.5, thickness=0.5
- **Sapphire crystal**: transmission=1, ior=1.77, roughness=0, thickness=1.0, attenuationColor=#F0F8FF
- **Water**: transmission=1, ior=1.33, roughness=0, attenuationColor=#C6E6F0, attenuationDistance=2
- **Colored glass (wine bottle)**: transmission=1, ior=1.52, attenuationColor=#004400, attenuationDistance=0.3
- **Diamond**: transmission=1, ior=2.42, roughness=0, dispersion=0.044
- **Gemstone (ruby)**: transmission=0.8, ior=1.77, attenuationColor=#E0115F, attenuationDistance=0.1

### Subsurface Scattering (via transmission + thickness)

Three.js approximates SSS through transmission and thickness. For light passing through thin geometry:

```js
{
  transmission: 0.5,           // Partial transparency
  thickness: 1.0–5.0,         // How deep light penetrates
  attenuationColor: 0xff9966,  // Scatter color (warm for skin)
  attenuationDistance: 0.5,    // Scatter distance
  roughness: 0.5,
}
```

**Recipes**:
- **Skin**: transmission=0.1, thickness=2.0, attenuationColor=#FF7744, attenuationDistance=0.3, roughness=0.5
- **Wax/candle**: transmission=0.4, thickness=1.5, attenuationColor=#FFE0A0, attenuationDistance=0.2, roughness=0.4
- **Marble**: transmission=0.15, thickness=3.0, attenuationColor=#F5E6D3, attenuationDistance=1.0, roughness=0.1
- **Jade**: transmission=0.3, thickness=2.0, attenuationColor=#00A86B, attenuationDistance=0.5, roughness=0.2
- **Milk**: transmission=0.6, thickness=1.0, attenuationColor=#FFF8F0, attenuationDistance=0.05

### Sheen

```js
{
  sheen: 1.0,                  // 0–1, sheen layer intensity
  sheenRoughness: 0.5,         // Roughness of sheen layer
  sheenColor: 0xffffff,        // Color of sheen highlight
}
```

**What it simulates**: Soft highlight at grazing angles — fabric microfibers catching light.

**Recipes**:
- **Velvet**: sheen=1.0, sheenRoughness=0.5, sheenColor=lighter-than-base, roughness=0.9
- **Satin**: sheen=0.8, sheenRoughness=0.3, roughness=0.4
- **Silk**: sheen=1.0, sheenRoughness=0.2, roughness=0.3, add anisotropy=0.3
- **Peach fuzz / felt**: sheen=0.5, sheenRoughness=0.8, roughness=0.9
- **Watch strap (leather)**: sheen=0.3, sheenRoughness=0.6, roughness=0.6

### Iridescence

```js
{
  iridescence: 1.0,            // 0–1, effect intensity
  iridescenceIOR: 1.3,         // IOR of thin-film layer
  iridescenceThicknessRange: [100, 400], // nm range of film thickness
  iridescenceThicknessMap: texture,       // Spatial variation
}
```

**What it simulates**: Thin-film interference — light splitting into spectral colors based on viewing angle and film thickness.

**Recipes**:
- **Soap bubble**: iridescence=1.0, iridescenceIOR=1.3, thicknessRange=[100,500], transmission=0.9
- **Oil slick**: iridescence=1.0, iridescenceIOR=1.5, thicknessRange=[200,500], roughness=0.0
- **Beetle shell**: iridescence=0.8, iridescenceIOR=1.6, thicknessRange=[300,600], color=#1A3A1A
- **Mother of pearl**: iridescence=1.0, iridescenceIOR=1.3, thicknessRange=[200,400], roughness=0.15
- **PVD coating (watch)**: iridescence=0.3–0.6, iridescenceIOR=1.5, metalness=1, thicknessRange=[100,300]

### Anisotropy

```js
{
  anisotropy: 0.8,             // -1 to 1 (strength and direction)
  anisotropyRotation: 0,       // Rotation in radians
  anisotropyMap: texture,      // Per-pixel direction/strength
}
```

**What it simulates**: Directional stretching of specular highlights from aligned microstructure.

**Recipes**:
- **Brushed metal**: anisotropy=0.8, anisotropyRotation=0 (horizontal brushing), metalness=1, roughness=0.3
- **Radial brushed (watch)**: Use anisotropyMap with radial UV direction
- **Hair/fur**: anisotropy=1.0, roughness=0.3, use tangent maps along strand direction
- **Silk**: anisotropy=0.3, sheen=1.0, roughness=0.3
- **Vinyl record**: anisotropy=0.5, concentric anisotropyMap, metalness=0, roughness=0.2
- **Circular brushed steel (watch caseback)**: anisotropy=0.7, radial anisotropyMap

---

## Blender Principled BSDF ↔ Three.js Mapping

| Blender Principled BSDF | Three.js MeshPhysicalMaterial | Notes |
|--------------------------|-------------------------------|-------|
| Base Color | color | Direct map |
| Metallic | metalness | Same range 0–1 |
| Roughness | roughness | Same range 0–1 |
| IOR | ior | Same meaning |
| Transmission Weight | transmission | Same 0–1 |
| Coat Weight | clearcoat | Same concept |
| Coat Roughness | clearcoatRoughness | Same |
| Coat Normal | clearcoatNormalMap | Same |
| Sheen Weight | sheen | Same |
| Sheen Roughness | sheenRoughness | Same |
| Sheen Tint → Color | sheenColor | Blender tints from base; Three.js uses explicit color |
| Subsurface Weight | ~transmission | Three.js SSS via transmission+thickness |
| Subsurface Radius | ~attenuationColor+Distance | Approximate mapping |
| Thin Film (via nodes) | iridescence | Similar concept |
| Anisotropic | anisotropy | Same |
| Anisotropic Rotation | anisotropyRotation | Blender 0–1 → Three.js 0–2π |
| Emission Color | emissive | Direct map |
| Emission Strength | emissiveIntensity | Direct map |
| Alpha | opacity (+ transparent:true) | Remember to set transparent |
| Normal Map | normalMap + normalScale | Same |

---

## Procedural Texture Recipes

> For complete GLSL/shader implementations, see the `shader-workshop` skill.

### Common Patterns (conceptual, apply via shader or texture)

**Grain/Noise** — Adds organic randomness
- Fine grain: high-frequency noise, low amplitude. Use for paper, matte paint, skin pores
- Scale: 50–200 for fine, 5–20 for coarse
- Apply to roughness map for surface variation

**Scratches** — Linear wear marks
- Random lines at varied angles on roughness map (decrease roughness along scratch = shinier)
- Concentrated scratches on edges and high-contact areas
- For watch: fine hairline scratches, roughness variation ±0.05

**Patina/Oxidation** — Age-based color shift
- Copper: overlay green (#5F8575) in exposed areas, blend with noise mask
- Bronze: darken in crevices, green highlights on raised surfaces
- Use cavity/AO map to drive patina placement

**Brushed Metal** — Directional micro-grooves
- Anisotropy map with consistent direction
- Tangent-space normal map with horizontal lines
- Roughness 0.3–0.4 with directional variation

**Leather Texture** — Organic surface detail
- Large-scale pore pattern (normal map)
- Roughness variation: 0.4 in valleys, 0.7 on peaks
- Slight sheen for treated leather

**Fingerprints/Smudges** — Realism touch
- Overlay on roughness map: reduce roughness in touched areas (oils make surfaces shinier)
- Subtle, partial coverage

---

## Environment / HDRI Selection Guide

| Look | HDRI Type | Characteristics |
|------|-----------|-----------------|
| Product shot (watch/jewelry) | Studio | Even, controlled, soft gradients, white/gray |
| Automotive | Overcast outdoor or studio | Long reflections, smooth gradients |
| Architectural | Urban/interior | Window patterns, geometric reflections |
| Natural/organic | Forest, field | Green tones, soft dappled light |
| Dramatic | Sunset, storm | High contrast, warm/cool color story |
| Neutral reference | Gray studio | Unbiased evaluation of material |

**Tips**:
- Glossy metals need interesting environment reflections to look real
- For product shots: studio HDRI with 2–3 gradient strips (not fully uniform)
- Rotate HDRI to place key reflection where you want the main highlight
- envMapIntensity: 1.0 default; increase to 1.5–2.0 for more punch, decrease for moodier
- Use PMREMGenerator for proper mip-mapped environment in Three.js

---

## Watch & Jewelry Lookdev Guide

> This is our primary use case. Load `references/watch-jewelry-lookdev.md` for expanded recipes.

### Watch Case Materials

**Polished Stainless Steel**:
```js
{ metalness: 1.0, roughness: 0.05, color: 0xC8C8C8, envMapIntensity: 1.2 }
```

**Brushed Stainless Steel** (lugs, sides):
```js
{ metalness: 1.0, roughness: 0.35, color: 0xB0B0B0, anisotropy: 0.7 }
```

**Polished Yellow Gold**:
```js
{ metalness: 1.0, roughness: 0.08, color: 0xFFD700, envMapIntensity: 1.3 }
```

**Polished Rose Gold**:
```js
{ metalness: 1.0, roughness: 0.08, color: 0xB76E79 }
```

**Titanium (matte)**:
```js
{ metalness: 1.0, roughness: 0.30, color: 0x878681 }
```

**PVD Black Coating**:
```js
{ metalness: 1.0, roughness: 0.15, color: 0x1A1A1A }
```

### Watch Dial

**Matte dial (white)**:
```js
{ metalness: 0.0, roughness: 0.85, color: 0xF5F5F0 }
```

**Sunburst dial** — Radial brushed metallic finish:
```js
{ metalness: 0.7, roughness: 0.25, color: 0x1A3366, anisotropy: 0.5 }
// Use radial anisotropyMap for the sunburst pattern
```

**Enamel dial** — Deep glossy:
```js
{ metalness: 0.0, roughness: 0.05, color: 0x000033, clearcoat: 0.5 }
```

**SuperLuminova indices/hands**:
```js
{ metalness: 0.0, roughness: 0.70, color: 0xC8E6C0,
  emissive: 0xC8F7C5, emissiveIntensity: 0.5 }
// Increase emissiveIntensity for "charged" glow-in-dark look
```

### Watch Crystal

**Sapphire crystal** (flat or domed):
```js
{ transmission: 1.0, ior: 1.77, roughness: 0.0, thickness: 1.0,
  metalness: 0.0, color: 0xF8F8FF, envMapIntensity: 1.0 }
// Add anti-reflective coating: slightly reduce envMapIntensity or tint blue
```

**AR coating effect**: Slight blue-purple tint in reflections. Can approximate with thin clearcoat tinted blue or post-processing.

### Watch Strap

**Leather strap**:
```js
{ metalness: 0.0, roughness: 0.60, color: 0x5C3A1E, sheen: 0.3, sheenRoughness: 0.6 }
```

**Rubber/silicone strap**:
```js
{ metalness: 0.0, roughness: 0.85, color: 0x1A1A1A }
```

**Metal bracelet**: Same as case material, mix polished (center links) and brushed (outer links).

### Jewelry-Specific

**Diamond setting**: See transmission recipes above. Use dispersion for rainbow fire.

**Pearl**: iridescence=0.5, iridescenceIOR=1.3, roughness=0.15, color=#FFF5EE, sheen=0.3

**Gemstone cabochon**: clearcoat=1, roughness=0.02, color=gem-specific, no transmission (opaque)

---

## Automotive Paint Lookdev

### Solid Paint
```js
{ metalness: 0.0, roughness: 0.3, color: paintColor,
  clearcoat: 1.0, clearcoatRoughness: 0.03 }
```

### Metallic Paint
```js
{ metalness: 0.9, roughness: 0.45, color: paintColor,
  clearcoat: 1.0, clearcoatRoughness: 0.03 }
// Base roughness higher because metallic flakes scatter light
```

### Pearlescent Paint
```js
{ metalness: 0.5, roughness: 0.35, color: paintColor,
  clearcoat: 1.0, clearcoatRoughness: 0.03,
  iridescence: 0.3, iridescenceIOR: 1.5, iridescenceThicknessRange: [200, 400] }
```

### Matte Paint
```js
{ metalness: 0.0, roughness: 0.7, color: paintColor,
  clearcoat: 0.0 }
// No clearcoat — that's what makes it matte
```

### Orange Peel Texture
Apply a subtle noise normal map to clearcoatNormalMap with scale ~0.1–0.2. This is the slight waviness visible in real car paint.

---

## Color Grading & Tone Mapping

### Three.js Tone Mapping Options

| Tone Mapping | Character | Best For |
|--------------|-----------|----------|
| ACESFilmicToneMapping | Cinematic, rich contrast | Product shots, realism |
| AgXToneMapping | Neutral, accurate | Reference, calibration |
| NeutralToneMapping | Balanced | General purpose |
| ReinhardToneMapping | Soft, low contrast | Gentle/dreamy looks |
| LinearToneMapping | Raw, no curve | HDR displays |
| NoToneMapping | Unmodified | Post-processing pipeline |

**Recommendation**: Use `ACESFilmicToneMapping` for watch/jewelry product shots. It handles bright specular highlights gracefully and produces rich colors.

```js
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0; // Adjust 0.5–2.0
```

### Color Temperature Guide
- **Cool/clinical** (6500K+): Blue-white light, technical product shots
- **Neutral** (5500K): Daylight balanced, honest material representation
- **Warm/luxury** (3500–4500K): Golden ambient, jewelry and watches
- **Dramatic** (mixed): Cool key + warm fill for depth

---

## Aging & Weathering Techniques

### Metal Aging Progression

1. **New** → Base material values from reference table
2. **Light wear** → Add ±0.05 roughness noise; fine scratches on roughness map
3. **Used** → Edge wear (lower roughness on edges = shinier from handling), fingerprints
4. **Aged** → Darkening in crevices (AO-driven), broader roughness variation ±0.15
5. **Weathered** → Patina (color shift), pitting (normal map bumps), significant roughness increase

### Specific Aging Recipes

**Tarnished Silver**: Darken base color toward #3A3A3A, increase roughness to 0.3–0.5, add warm yellow-brown tint

**Patinated Copper**: Overlay green (#4A8B6B) driven by exposed-area mask, roughness 0.4–0.6

**Rusted Steel**: Transition metalness 1→0 in rust areas, color→#8B4513, roughness→0.8+

**Worn Leather**: Lighten color in creases and edges, reduce roughness slightly in worn areas

**Faded Paint**: Increase roughness, desaturate color, reduce clearcoat

---

## Tips & Best Practices

1. **Always use reference photos** — Don't guess material values; match to reality
2. **Roughness is king** — It has the biggest visual impact after color. Get it right first.
3. **Metalness is binary** — Real materials are either metal (1.0) or not (0.0). Use maps for transitions (paint over metal, rust)
4. **Fresnel is automatic** — IOR controls it for dielectrics. Don't fight it.
5. **Environment makes the material** — A material can look completely different under different HDRIs
6. **Micro-detail sells realism** — Subtle roughness variation, tiny scratches, dust. Perfection looks fake.
7. **Less is more with special effects** — Don't max out clearcoat AND iridescence AND sheen. Pick what the material actually has.
8. **Profile your render** — Heavy features (transmission, clearcoat) cost GPU. Use only where visible.
9. **sRGB for color textures, Linear for data** — Color/albedo maps = sRGB. Roughness/metalness/normal = Linear.
10. **Normal map intensity** — normalScale default Vector2(1,1) is often too strong. Start at (0.5, 0.5) and increase.

---

## State-of-the-Art (2025 Research)

> Research pass by Chris (lookdev). Last updated: Feb 2025.
> Sources: Three.js docs (r183), pmndrs/drei, Codrops, Maxime Heckel's blog, Poly Haven, modelviewer.dev PBR Neutral guide.

---

### 1. MeshTransmissionMaterial (MTM) — The State-of-the-Art Glass Material

The pmndrs/drei `MeshTransmissionMaterial` is now the gold standard for real-time glass in Three.js. It layers FBO-based refraction on top of `MeshPhysicalMaterial`, giving dramatically better results than native transmission alone.

**Why it's better than native MeshPhysicalMaterial for glass:**
- Can "see" other transmissive/transparent objects (native MPM can't — they're invisible to each other)
- Chromatic aberration built in (`chromaticAberration`, default 0.03)
- Noise-based roughness blur (looks like frosted glass, not just blurred)
- Anisotropic blur support
- Backside rendering — renders the inner faces of a closed mesh, crucial for a solid glass cube

**Vanilla Three.js** (no React): use `drei-vanilla` package.

```js
import { MeshTransmissionMaterial } from 'drei-vanilla';

const material = new MeshTransmissionMaterial({
  transmission: 1,
  thickness: 0.5,           // Controls refraction depth
  roughness: 0,
  ior: 1.5,
  chromaticAberration: 0.03,
  anisotropicBlur: 0.1,
  backside: true,           // Render backfaces — huge quality boost for solid glass
  backsideThickness: 0.3,
  samples: 6,               // Refraction samples (quality vs perf)
  resolution: 512,          // FBO resolution — use 256 or even 64 for roughness
});

// Must render into an FBO each frame:
const fbo = new THREE.WebGLRenderTarget(512, 512);
function animate() {
  // Temporarily hide the glass mesh
  glassMesh.visible = false;
  renderer.setRenderTarget(fbo);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  glassMesh.visible = true;
  // Pass the FBO texture to the material
  material.buffer = fbo.texture;
  renderer.render(scene, camera);
}
```

**Performance tiers:**
| Quality | samples | resolution | Use case |
|---------|---------|------------|----------|
| High | 10 | 1024 | Hero shot, still frame |
| Medium | 6 | 512 | Product viewer |
| Low | 4 | 128 | Mobile, many objects |
| Frosted only | 4 | 32–64 | Rough glass, blur dominant |

**Gotcha**: Setting roughness=1.0 makes MeshTransmissionMaterial **completely invisible** — it scatters all light to diffuse. Stay below 0.7 for frosted glass.

---

### 2. MeshPhysicalMaterial `dispersion` Property (r165+)

Native built-in chromatic dispersion was added in r165 (2024). No shader needed.

```js
const glassMat = new THREE.MeshPhysicalMaterial({
  transmission: 1.0,
  thickness: 0.5,
  ior: 1.52,
  roughness: 0.0,
  dispersion: 0.1,   // 0 = no color split, 1 = extreme rainbow edges
  // Realistic glass: dispersion 0.02–0.05
  // Diamond: dispersion 0.044
  // Artistic exaggeration: 0.1–0.3
});
```

`dispersion` simulates how different wavelengths of light bend at different angles through glass. It splits refracted rays into R, G, B channels — gives the rainbow fringing visible on real glass edges.

**Glass dispersion reference:**
| Material | Dispersion |
|----------|-----------|
| Crown glass | 0.017 |
| Flint glass | 0.044 |
| Diamond | 0.044 |
| Crystal / lead glass | 0.06+ |
| Artistic effect | 0.1–0.3 |

---

### 3. FBO Refraction Technique vs Native Transmission Buffer

Two competing approaches for glass refraction in Three.js:

| Approach | How it works | Pros | Cons |
|----------|-------------|------|------|
| **Native MPM transmission** | Three.js renders scene once to transmission sampler buffer, all MPM objects share it | Fast, zero extra passes | Glass objects invisible to each other; limited control |
| **MTM FBO approach** | Each transmissive object gets its own render pass to an FBO | Glass sees other glass; controllable resolution; supports backside | Extra render pass per object (GPU cost) |
| **Custom ShaderMaterial** | Manual FBO + custom GLSL refraction shader | Full control, chromatic dispersion per-channel | Complex to implement |

**When to use which:**
- **One glass object** → MTM FBO, `resolution: 512`, `backside: true`
- **Many glass objects** → MTM with `transmissionSampler: true` (shared buffer, faster)
- **Custom dichroic/iridescent glass** → Custom ShaderMaterial (see section 5)
- **Max performance** → Native MPM transmission (but objects won't see each other)

**Native MPM: shared buffer trick for multiple glass objects:**
```js
// All objects share the same scene-render buffer
// Faster but glass objects are invisible to each other
mat1.transmissionSampler = true;
mat2.transmissionSampler = true;
```

---

### 4. Per-Channel IOR Chromatic Dispersion (Custom GLSL)

For maximum control over rainbow/prismatic effects — e.g., a dichroic crystal or cut diamond — use a custom ShaderMaterial. This implements true per-wavelength IOR splitting.

**Conceptual GLSL approach (fragment shader):**
```glsl
// Three separate refraction samples at slightly different IOR values
uniform sampler2D envMap;
uniform vec2 resolution;
uniform float iorR;   // ~1.50
uniform float iorG;   // ~1.52
uniform float iorB;   // ~1.55

varying vec3 worldNormal;
varying vec3 eyeVector;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;

  // Fresnel factor
  float fresnel = pow(1.0 + dot(eyeVector, worldNormal), 5.0);

  // Refract each channel separately
  vec3 refR = refract(eyeVector, worldNormal, 1.0 / iorR);
  vec3 refG = refract(eyeVector, worldNormal, 1.0 / iorG);
  vec3 refB = refract(eyeVector, worldNormal, 1.0 / iorB);

  float r = texture2D(envMap, uv + refR.xy).r;
  float g = texture2D(envMap, uv + refG.xy).g;
  float b = texture2D(envMap, uv + refB.xy).b;

  // Mix refraction + white reflection based on Fresnel
  vec3 refracted = vec3(r, g, b);
  vec3 reflected = vec3(1.0);
  gl_FragColor = vec4(mix(refracted, reflected, fresnel), 1.0);
}
```

**The three-step FBO refraction pipeline (classic approach, Codrops 2019):**
1. Render background scene to `envFBO`
2. Render backfaces of glass mesh to `backfaceFBO` (normal data)
3. Render frontface of glass with custom shader that samples both FBOs

---

### 5. Iridescence as Dichroic / Thin-Film Simulation

For physically-based thin-film coatings (dichroic filters, PVD coatings, oil films, soap bubbles):

```js
// Dichroic glass coating (cool → warm angle shift)
const dichroicMat = new THREE.MeshPhysicalMaterial({
  metalness: 0.0,
  roughness: 0.05,
  transmission: 0.6,
  thickness: 0.3,
  ior: 1.52,
  iridescence: 1.0,
  iridescenceIOR: 2.2,          // Higher = stronger shift
  iridescenceThicknessRange: [150, 800], // Wide range = more colors
  envMapIntensity: 1.2,
});

// Soap bubble (very thin film, uniform)
const bubbleMat = new THREE.MeshPhysicalMaterial({
  transmission: 0.95,
  roughness: 0.0,
  ior: 1.33,
  iridescence: 1.0,
  iridescenceIOR: 1.3,
  iridescenceThicknessRange: [100, 500],
  side: THREE.DoubleSide,       // Must render both sides for bubbles
});
```

**IridescenceThicknessRange tuning:**
- Narrow range (e.g. [200, 250]) → single dominant color, PVD-like
- Wide range (e.g. [100, 800]) → full rainbow, soap bubble / oil
- Values in nm (nanometers); visible light ~380–700nm

---

### 6. Tone Mapping: 2024 State of the Art

**Decision tree for tone mapping:**

```
Product / e-commerce (color accuracy critical)?
  → NeutralToneMapping  ← NEW: Khronos PBR Neutral (r158+, default in model-viewer v4)
  
Cinematic / filmic look?
  → ACESFilmicToneMapping  ← but beware: blues shift purple, paper-white is gray

Color-accurate filmic (better than ACES)?
  → AgXToneMapping  ← from Blender; better hue preservation in saturated regions

HDR display output?
  → LinearToneMapping (let the display handle it)

Custom pipeline / post-processing?
  → NoToneMapping  ← plus OutputPass with correct colorspace
```

**NeutralToneMapping** (Khronos PBR Neutral — adopted 2024):
```js
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
// Key advantage: paper-white material → white pixels (ACES makes it gray)
// Better for e-commerce where color fidelity matters
// Correctly desaturates overexposed highlights (gold highlight stays warm, not yellow)
```

**AgXToneMapping** (Blender's default since 3.5):
```js
renderer.toneMapping = THREE.AgXToneMapping;
// - No hue shift (ACES shifts blues toward purple)
// - Perceptually uniform response
// - Better for scenes with saturated colors (colored gems, enamel dials)
// - Slightly lower contrast than ACES; can feel flat in product shots
```

**The ACES gotcha for glass/jewels**: ACES compresses highlights and shifts hues. A yellow gemstone can lose saturation; a blue sapphire can shift purple. For gemstones and colored glass, use AgX or Neutral.

**OutputPass (required for correct colorspace in post pipelines):**
```js
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
// Add AFTER all other passes
composer.addPass(new OutputPass());
// This handles sRGB conversion + tone mapping in the correct order
// Without it, post-processing breaks the linear workflow
```

---

### 7. Linear Workflow & Color Management

```js
// ✅ CORRECT setup — always do this
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Textures: set colorSpace based on content
colorTexture.colorSpace = THREE.SRGBColorSpace;    // Albedo/color maps
roughnessTexture.colorSpace = THREE.LinearSRGBColorSpace; // Data maps (roughness, metalness, normal)

// Scene-level environment control (r152+)
scene.environmentIntensity = 1.0;   // Global multiplier for env map IBL
scene.backgroundIntensity = 0.8;    // Separate background exposure
scene.backgroundBlurriness = 0.05;  // Subtle depth-of-field on background HDRI
scene.environmentRotation.y = Math.PI * 0.3; // Rotate HDRI without touching background

// ❌ WRONG: Don't use these deprecated patterns
// renderer.outputEncoding = THREE.sRGBEncoding;  // pre-r152, gone in r165
// texture.encoding = THREE.sRGBEncoding;         // pre-r152
```

**`scene.environmentIntensity` vs `material.envMapIntensity`:**
- `scene.environmentIntensity` → global multiplier applied to ALL materials (r152+)
- `material.envMapIntensity` → per-material override (still works, multiplies with scene)
- For glass lookdev: use `scene.environmentIntensity: 1.5–2.0` to boost IBL without affecting direct lights

---

### 8. Glass Cube Lookdev — Making Glass Read Lighter Than Background

This is the core challenge: by default, a transmission glass cube looks darker than its surroundings because it inherits the background color without the direct light contribution.

**The fundamental rule**: Glass reveals what's behind it + its own Fresnel reflections. To make glass look *lighter* than a dark background, you must put light *behind* the glass.

#### Technique 1: Bright Background (Light Box)

```js
// Place a bright emissive plane or RectAreaLight BEHIND the glass
// The glass will transmit this brightness through itself

// Emissive backplane (simple, no light calculation)
const backPanel = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 3),
  new THREE.MeshBasicMaterial({ color: 0xFFFFFF }) // Pure white, unlit
);
backPanel.position.z = -1.5; // Behind the glass cube

// OR: Use a bright background HDR environment
// The glass will transmit the bright sky/panels of the HDRI
```

#### Technique 2: Backlight / Rim Light for Glass

```js
// RectAreaLight behind the glass = transmitted light shows as bright core
// SpotLight from behind = glass edge catches caustic-like rim

// BACKLIGHT — behind the glass, facing camera
const backLight = new THREE.RectAreaLight(0xFFFFFF, 15, 2, 2);
backLight.position.set(0, 0, -2);
backLight.lookAt(0, 0, 0); // Points forward through the glass

// RIM LIGHTS — side lights at 90° catch the glass edges
const rimL = new THREE.RectAreaLight(0xCCDDFF, 8, 0.3, 3);
rimL.position.set(-2, 0, 0);
rimL.lookAt(0, 0, 0);

const rimR = new THREE.RectAreaLight(0xCCDDFF, 8, 0.3, 3);
rimR.position.set(2, 0, 0);
rimR.lookAt(0, 0, 0);
```

**Why this works**: Transmission materials refract the behind-camera-side scene. A bright backlight gets refracted and appears as a bright glowing core inside the glass, naturally lighter than the surroundings.

#### Technique 3: The "Light Tent" HDRI Trick

For product glass photography, use a Poly Haven studio HDRI with bright panels. The glass transmits the bright HDRI panels and appears to glow from within.

**Recommended Poly Haven HDRIs for glass:**
- `monochrome_studio_03` — Soft, large rectangular softbox, dark ceiling. Clean glass refraction, no distracting reflections
- `pav_studio_01` — High-contrast key + soft window. Creates bright "reading" on glass face
- `ferndale_studio_11` — Warm tube + rectangular softbox. Good for warm-toned glass
- `photo_studio_loft_01` — High key windows, even fill. Good for crystal/sapphire
- **Custom**: High-contrast black/white studio (bright top panel on dark background) → glass reads as bright cylinder/cube against dark bg

**HDRI for glass — specific tuning:**
```js
// After loading HDRI:
scene.environment = envTexture;
scene.environmentIntensity = 2.0;        // Boost IBL for glass brightness
scene.backgroundBlurriness = 0.1;        // Soften background for product focus
// Per-material:
glassMat.envMapIntensity = 1.5;          // Boost reflections on glass surface
```

---

### 9. Contact Shadow for Glass on a Surface

Glass is transparent, so standard shadow maps show no shadow (the light passes through). Real glass casts faint caustic shadows — complex to simulate exactly, but here are practical approaches:

#### Approach A: Fake Contact Shadow (ShadowMaterial)

```js
// Use a directional light and ShadowMaterial plane
// Glass casts a faint geometric shadow that approximates the real caustic
const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light.castShadow = true;
light.shadow.mapSize.set(2048, 2048);

// CRITICAL for glass shadows: reduce opacity, add blue tint
const shadowMat = new THREE.ShadowMaterial({
  color: 0x001144,   // Blue tint — caustic light is cool
  opacity: 0.08,     // Very faint — glass doesn't block much light
});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), shadowMat);
ground.receiveShadow = true;
ground.rotation.x = -Math.PI / 2;

// Make the glass cast shadows (even though it's transparent)
glassMesh.castShadow = true;
```

#### Approach B: Caustic Simulation (Maxime Heckel / drei-vanilla Caustics)

A proper physics-based caustic using FBO normal maps and refracted ray projection:

```js
// High-level approach (from Maxime Heckel's Jan 2024 blog post):
// 1. Render glass mesh normals to FBO (normalRenderTarget)
// 2. On a FullScreenQuad, compute refracted ray for each vertex
//    using the normal texture + light direction
// 3. Compare pre- and post-refraction surface areas (dFdx/dFdy)
//    - oldArea/newArea > 1 → rays converged → bright caustic
//    - oldArea/newArea < 1 → rays diverged → dark region
// 4. Project caustic texture onto floor plane, scaled by distance

// drei-vanilla Caustics component parameters:
// frames: 1 for static, Infinity for animated glass
// ior: 1.1 typical for subtle caustics
// intensity: 0.1–0.5
// causticsOnly: false (render glass + caustics together)
// worldRadius: 0.3125 (texel coverage radius)
```

**Simpler approximation** — projected texture caustic:
```js
// Use a pre-baked caustic texture projected onto the floor
// Animate its distortion with time for "live" caustics
// This is the most performance-friendly approach for product shots
const causticMat = new THREE.MeshBasicMaterial({
  map: causticTexture,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  opacity: 0.3,
  transparent: true,
});
```

---

### 10. PMREM / IBL — Setup & Best Practices

PMREM (Pre-filtered Mipmap Radiant Environment Map) is the backbone of all IBL in Three.js. Without it, materials get wrong reflections.

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
// NOTE: r180+ renamed RGBELoader → HDRLoader, but RGBELoader still works in r183

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader(); // Pre-compile shader (perf)

new RGBELoader().load('env.hdr', (hdrTexture) => {
  const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
  scene.environment = envMap;         // IBL for materials
  scene.background = envMap;          // Optional visible background
  hdrTexture.dispose();               // Free the raw HDR (keep only PMREM)
  pmremGenerator.dispose();           // Free generator after use
});
```

**LightProbe from HDRI** — cheaper diffuse IBL:
```js
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';

// After cube camera setup or from existing cubemap:
const lightProbe = LightProbeGenerator.fromCubeTexture(cubeTexture);
lightProbe.intensity = 1.0;
scene.add(lightProbe);
// LightProbe: spherical harmonics — accurate diffuse, zero specular
// Combined with envMap: full IBL (LightProbe for diffuse, envMap for specular)
```

**`scene.environmentIntensity` control (r152+):**
```js
// Dim the IBL at night without re-loading HDRI:
scene.environmentIntensity = 0.1;    // Night: barely any ambient
scene.environmentIntensity = 1.0;    // Day: normal
scene.environmentIntensity = 2.0;    // Bright product shot
```

---

### 11. HDRI Recommendations for Glass / Jewellery Lookdev

**Poly Haven** (polyhaven.com) — all CC0, free:

| HDRI | Key Character | Best For |
|------|---------------|----------|
| `monochrome_studio_03` | Soft rectangular softbox, dark ceiling, 20K | Glass lookdev — clean, minimal distracting reflections |
| `pav_studio_01` | High-contrast key + window diffusion, 20K | Jewelry, diamonds — crisp light/dark contrast |
| `ferndale_studio_11` | Warm tube + rectangular softbox, infinity cove | Warm-toned glass, amber, warm crystals |
| `photo_studio_loft_01` | High-key windows, even fill | Sapphire crystal, clear glass with detail |
| `studio_small_08` | Classic small studio, balanced | General product lookdev baseline |
| `venice_sunset_1k` | Warm directional sunset | Lifestyle glass photography, amber bottles |

**For maximum glass pop**: Use **high-contrast studio** HDRI where the dominant feature is a single bright panel on a dark background. The glass will transmit the bright panel and appear to glow.

**HDRI resolution guidance for glass:**
- Reflective metals: 1K is fine (reflections are blurry)
- Glass / transparent: 2K–4K minimum (refracted content is sharp)
- Background visible: 4K for clean rendering

---

### 12. MeshPhysicalMaterial Full Current API Reference (r183)

Complete property summary including all 2024–2025 additions:

```js
const mat = new THREE.MeshPhysicalMaterial({
  // --- Base (inherited from MeshStandardMaterial) ---
  color: 0xffffff,
  metalness: 0.0,
  roughness: 0.0,
  normalMap: texture,
  normalScale: new THREE.Vector2(0.5, 0.5),
  aoMap: texture,
  emissive: 0x000000,
  emissiveIntensity: 1.0,
  envMapIntensity: 1.0,

  // --- Transmission (glass) ---
  transmission: 1.0,           // 0–1: opacity via refraction
  thickness: 0.5,              // World-space depth for absorption
  attenuationColor: 0xffffff,  // Color glass absorbs light as
  attenuationDistance: Infinity, // Distance to full attenuation (world units)
  ior: 1.5,                    // 1.0–2.333 (glass=1.52, sapphire=1.77, diamond=2.42)
  dispersion: 0.0,             // ≥0; chromatic aberration strength (r165+)

  // --- Clearcoat ---
  clearcoat: 0.0,
  clearcoatRoughness: 0.0,
  clearcoatNormalMap: texture,
  clearcoatNormalScale: new THREE.Vector2(1, 1),

  // --- Iridescence ---
  iridescence: 0.0,
  iridescenceIOR: 1.3,
  iridescenceThicknessRange: [100, 400], // nm

  // --- Sheen ---
  sheen: 0.0,
  sheenRoughness: 1.0,
  sheenColor: 0x000000,

  // --- Anisotropy ---
  anisotropy: 0.0,             // 0–1
  anisotropyRotation: 0,       // radians
  anisotropyMap: texture,

  // --- Specular ---
  specularIntensity: 1.0,      // Non-metallic F0 multiplier
  specularColor: 0xffffff,     // Non-metallic F0 color tint
});
```

---

### 13. Common Glass Lookdev Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| No environment map | Flat, dark glass | ALWAYS set `scene.environment` — glass is 90% reflection + refraction |
| roughness > 0 but no FBO | Blocky noise artifacts | Use MTM with low resolution (32px) for frosted glass |
| thickness = 0 | No refraction/bending | Set `thickness` to match geometry depth in world units |
| transmission on wrong side | Weirdly dark interior | Set `side: THREE.FrontSide` + use MTM `backside: true` instead of DoubleSide |
| Wrong colorSpace on HDRI | Washed out or over-bright | PMREM handles this automatically; don't set encoding on HDRI manually |
| ACES with colored gems | Blue sapphire looks purple | Switch to AgX or Neutral tonemapping |
| No dispersion on diamond | Looks like plain glass | Set `dispersion: 0.044` for physical accuracy |
| Dark glass on dark bg | Glass invisible | Add backlight or bright HDRI panel behind glass |
| Glass cube no interior | Looks flat | Use MTM with `backside: true` and `backsideThickness` matching wall thickness |
| envMapIntensity too low | Flat, uninteresting glass | Glass needs envMapIntensity 1.5–2.5 to look alive |

---

### 14. Glass Cube — Complete Lookdev Recipe

Bringing it all together for a product-shot glass cube:

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { MeshTransmissionMaterial } from 'drei-vanilla';

// 1. RENDERER SETUP
renderer.toneMapping = THREE.NeutralToneMapping;  // Best for glass product
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // r182+: now soft by default

// 2. HDRI ENVIRONMENT
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
new RGBELoader().load('monochrome_studio_03_1k.hdr', (tex) => {
  scene.environment = pmrem.fromEquirectangular(tex).texture;
  scene.environmentIntensity = 2.0;    // Boost for glass
  tex.dispose(); pmrem.dispose();
});

// 3. GLASS MATERIAL
const glassMat = new MeshTransmissionMaterial({
  transmission: 1.0,
  thickness: 0.3,          // Match cube wall thickness
  ior: 1.52,
  roughness: 0.0,
  dispersion: 0.05,        // Subtle rainbow edges
  chromaticAberration: 0.03,
  backside: true,          // Critical for solid cube interior
  backsideThickness: 0.3,
  samples: 6,
  resolution: 512,
  envMapIntensity: 2.0,
  color: 0xffffff,         // Tint: keep white for clear glass
});

// 4. LIGHTING RIG FOR GLASS
// Backlight: makes glass read LIGHTER than background
const backLight = new THREE.RectAreaLight(0xFFFFFF, 20, 2, 2);
backLight.position.set(0, 0, -2.5);
backLight.lookAt(0, 0, 0);
scene.add(backLight);

// Rim lights: define glass edges
const rimL = new THREE.RectAreaLight(0xDDEEFF, 8, 0.3, 3);
rimL.position.set(-2.5, 0, 0);
rimL.lookAt(0, 0, 0);
scene.add(rimL);

const rimR = rimL.clone();
rimR.position.set(2.5, 0, 0);
rimR.lookAt(0, 0, 0);
scene.add(rimR);

// Top fill: brightens the top face
const topFill = new THREE.RectAreaLight(0xFFFFFF, 5, 3, 3);
topFill.position.set(0, 3, 0);
topFill.lookAt(0, 0, 0);
scene.add(topFill);

// 5. CONTACT SHADOW (faint, blue-tinted)
const shadowLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
shadowLight.position.set(3, 8, 3);
shadowLight.castShadow = true;
shadowLight.shadow.mapSize.set(2048, 2048);
shadowLight.shadow.bias = -0.0001;
scene.add(shadowLight);

const groundMat = new THREE.ShadowMaterial({ color: 0x001133, opacity: 0.07 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

// 6. GLASS MESH
glassMesh.castShadow = true;
glassMesh.material = glassMat;

// 7. FBO RENDER LOOP
const fbo = new THREE.WebGLRenderTarget(512, 512);
function animate() {
  glassMesh.visible = false;
  renderer.setRenderTarget(fbo);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  glassMesh.visible = true;
  glassMat.buffer = fbo.texture;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

---

### 15. Three.js Breaking Changes Affecting Glass (r152 → r183)

| Version | Change | Impact |
|---------|--------|--------|
| r152 | `scene.environmentIntensity` added | Can now dim IBL globally |
| r158 | `NeutralToneMapping` added (Khronos PBR Neutral) | Best for product/e-commerce |
| r165 | `dispersion` property added to MPM | Native chromatic aberration for glass |
| r167 | WebGPU backend default | Use WebGPURenderer for forward compatibility |
| r180 | `RGBELoader` → `HDRLoader` | Update import paths |
| r181 | PBR indirect specular improved; rough materials brighter | Materials may look slightly different |
| r182 | `PCFShadowMap` now soft by default; `PCFSoftShadowMap` deprecated | Update shadow type |
| r183 | PostProcessing → RenderPipeline; Clock → Timer; RoomEnvironment PMREM updated | Lighting may look different if using RoomEnvironment |

---

## Glass Lookdev & Lighting (2025)

### MeshPhysicalMaterial — Glass Parameter Reference

#### Core glass settings (clear glass):
```js
const glass = new THREE.MeshPhysicalMaterial({
  transmission:      1.0,      // 0.9–1.0 for glass; drives refraction pass
  roughness:         0.0,      // 0 = mirror-clear; 0.3–0.6 = frosted
  thickness:         0.5,      // world-units depth; drives refraction distortion amount
  ior:               1.5,      // 1.45–1.52 = window glass; 1.9–2.15 = crystal/diamond
  envMapIntensity:   2.0,      // 1–5 typical; 10–25 for dramatic studio Fresnel
  clearcoat:         0.1,      // adds thin specular layer on top (lacquer effect)
  clearcoatRoughness:0.0,
  metalness:         0.0,
  color:             0xffffff, // tint the transmission; set grey/blue for colored glass
  attenuationColor:  0xffffff, // color absorbed as light passes through thick glass
  attenuationDistance: Infinity, // shorter = more tinting with depth
  dispersion:        0.1,      // r167+ only; 0=no chromatic aberration, 0.1–0.3 = realistic crystal
});
```

#### Parameter quick-reference:
| Property | Range | Notes |
|---|---|---|
| `transmission` | 0.9–1.0 | Must be >0 to enable transmission render pass |
| `roughness` | 0–0.05 | Values >0 create frosted/matte glass |
| `thickness` | 0.1–5.0 | Match object's real-world depth in scene units |
| `ior` | 1.33–2.42 | Water=1.33, glass=1.5, crystal=1.9–2.0, diamond=2.42 |
| `envMapIntensity` | 1–25 | Drives Fresnel rim brightness; dark scenes need higher values |
| `dispersion` | 0–1 | r167+ only; 0.05–0.2 = realistic, >0.5 = stylized rainbow |
| `clearcoat` | 0–1 | Use 0.1–0.3 for bottles/goblets |

#### Dispersion (r167+):
- `dispersion` property added to `MeshPhysicalMaterial` in Three.js r167
- Simulates chromatic aberration (color splitting like a prism)
- **Only works on transmissive objects** (`transmission > 0`)
- Realistic glass: `dispersion: 0.05–0.15`; crystal/prism: `0.3–0.8`
- Performance cost: increases shader complexity — keep `<= 0.3` unless artistic intent

### FBO Refraction vs Transmission — Decision Guide

**Use `transmission` (MeshPhysicalMaterial built-in):**
- ✅ Simple setup — just set `transmission: 1` and add env map
- ✅ Works with roughness-based frosted glass out of the box
- ✅ Driven by PMREM pipeline — automatic Fresnel at all roughness levels
- ❌ Can't refract objects at the same depth or in front of the glass
- ❌ Performance: triggers a full offscreen render pass per frame
- ❌ Flickering with multiple overlapping transmissive objects (fix: set `renderOrder`)
- **Best for**: single hero glass object, product shots, bottles, orbs

**Use FBO/manual refraction (CubeCamera + WebGLCubeRenderTarget or custom shader):**
- ✅ Can refract objects in front of, behind, or at the same depth
- ✅ Works for enclosed geometry (multiple glass objects refracting each other)
- ✅ More shader control — custom distortion, fake caustics
- ❌ Must manually update CubeCamera each frame (performance hit)
- ❌ Complex setup; requires custom GLSL or `onBeforeCompile`
- **Best for**: glass containing other glass, kaleidoscope effects, real-time aquariums

**Use `MeshTransmissionMaterial` from `@react-three/drei`:**
- Wraps MeshPhysicalMaterial with extra shader layers for higher quality refraction
- `backside: true` — renders backface separately for double-refraction (premium look)
- `samples: 10–16` — refraction sample count; lower = faster, grainier
- `resolution: 256–1024` — refraction buffer resolution
- Best quality for R3F projects; heavier than native transmission

### Making Glass Readable in Dark Scenes

**The core problem:** In a pure dark scene, glass has nothing to refract — all refraction returns black, and the object disappears into the background.

**Solutions:**
1. **Brighten the environment** — set `scene.environment` even if not using as background:
   ```js
   // PMREM environment drives Fresnel even on black bg
   scene.environment = pmremTexture; // bright HDR = strong glass reflections
   scene.background = new THREE.Color(0x0a0a0a); // keep bg dark
   ```
2. **Raise `envMapIntensity`** — crank to 3–10+ on dark scenes so Fresnel reflections are visible
3. **Add a bright background plane/geometry** behind the glass — gives it something to refract
4. **Backlight the glass** — place a RectAreaLight or SpotLight behind the object; creates bright silhouette from Fresnel at grazing angles
5. **Use `attenuationColor`** — gives glass a colored interior even without background content
6. **Emissive subsurface trick** — add a faint `emissive` (0x111122) to make glass glow slightly from within

### PMREM + envMapIntensity
- `PMREMGenerator` converts HDR/cubemap → pre-filtered radiance env map
- Required for roughness-based glass (blurred reflections = frosted glass)
- `scene.environment = pmrem` applies to ALL materials automatically
- Override per-material: `material.envMapIntensity = X`
- For dark product shots: use a studio HDRI with bright windows/panels at `envMapIntensity: 3–8`
- Without PMREM, glass looks flat — it's the single biggest quality factor

### Three.js Version Notes (glass-specific)
| Version | Change | Impact |
|---|---|---|
| r129 | `transmission` + `thickness` + `ior` added to MeshPhysicalMaterial | Core glass features |
| r167 | `dispersion` property added | Chromatic aberration on transmissive glass |
| r152+ | Transmission render target resolution tied to viewport | Better quality, more VRAM |

---

## Color Science & Tone Mapping (2025)

> Reference: Three.js r152+ color management overhaul, r155 useLegacyLights deprecation, r167 AgX + dispersion.

---

### 1. Linear Workflow — The Rules

**The fundamental rule:** All lighting math happens in **linear** space. sRGB is display encoding only.

#### ColorManagement (r152+)
```js
// Default since r152 — leave it ON
THREE.ColorManagement.enabled = true;  // converts hex colors to linear automatically

// Renderer output — always sRGB for browser display
renderer.outputColorSpace = THREE.SRGBColorSpace; // DEFAULT (correct for web)
// Only use LinearSRGBColorSpace if writing HDR data to a float render target
```

#### Texture colorSpace Rules
| Texture Type | `.colorSpace` setting | Why |
|---|---|---|
| Albedo / Diffuse / Base Color | `THREE.SRGBColorSpace` | Authored in sRGB, needs linearization |
| Emissive map | `THREE.SRGBColorSpace` | Same — color data |
| Normal map | `THREE.NoColorSpace` (default) | NOT color — keep linear |
| Roughness / Metalness | `THREE.NoColorSpace` (default) | Grayscale data, not color |
| AO (ambient occlusion) | `THREE.NoColorSpace` (default) | Grayscale data |
| HDRI / EXR environment | `THREE.NoColorSpace` (default) | Already linear float |

```js
// Correct setup for a loaded albedo texture:
const albedo = textureLoader.load('diffuse.jpg');
albedo.colorSpace = THREE.SRGBColorSpace; // ← critical

// Normal map — leave default (NoColorSpace)
const normal = textureLoader.load('normal.jpg');
// normal.colorSpace = ... ← DON'T touch this
```

**Why linear matters:** If lighting happens in sRGB, shadows are too dark, highlights blow out wrong, and your PBR math is physically incorrect. The gamma curve (≈2.2) makes linear 0.5 appear as display 0.73 — huge perceptual difference.

#### Common Linear Workflow Mistakes
- ❌ Setting normal/roughness/AO textures to `SRGBColorSpace` → corrupts PBR values
- ❌ Using `renderer.outputColorSpace = LinearSRGBColorSpace` with direct canvas output → washed out
- ❌ Old `renderer.outputEncoding = THREE.sRGBEncoding` (deprecated r152, removed r163)
- ❌ Forgetting `.colorSpace = SRGBColorSpace` on GLTFLoader textures (GLTFLoader sets this automatically — but manual `TextureLoader` does NOT)
- ✅ GLTFLoader handles colorSpace correctly for embedded textures
- ✅ `new THREE.Color(0xff0000)` is auto-converted to linear when `ColorManagement.enabled = true`

---

### 2. Tone Mapping

Tone mapping compresses HDR linear values (0–∞) into displayable LDR (0–1).

#### Setup
```js
import { ACESFilmicToneMapping, AgXToneMapping, NeutralToneMapping,
         ReinhardToneMapping, CineonToneMapping, NoToneMapping } from 'three';

renderer.toneMapping = AgXToneMapping;      // r167+ — RECOMMENDED
renderer.toneMappingExposure = 1.0;         // practical range: 0.5–2.5
```

#### Tone Mapper Comparison

| Tone Mapper | Version | Character | Best For | Weakness |
|---|---|---|---|---|
| `NoToneMapping` | always | Raw linear | Debug only | Clips at 1.0, overexposed |
| `ReinhardToneMapping` | always | Soft, desaturated | Low-key dark scenes | Loses punch, muddy |
| `CineonToneMapping` | always | Warm, filmic | Retro/organic look | Dated, yellowish cast |
| `ACESFilmicToneMapping` | always | High contrast, saturated | Product shots, dramatic | Oversaturates bright colors, orange/red cast on metals |
| `AgXToneMapping` | **r167+** | Natural, scene-referred | PBR materials, glass, metals | Slightly desaturated (intentional) |
| `NeutralToneMapping` | r167+ | Flat/clean | Color grading starting point | Too neutral for direct use |

#### AgX — Why It's Better (r167+)
- **Scene-referred approach**: preserves hue through compression, unlike ACES which shifts chroma
- **Desaturated highlights**: bright white light stays white, not orange/yellow (ACES problem)
- **Blender 4.0 default**: consistent appearance when transferring assets from Blender
- **Better for glass/transmission**: doesn't introduce false color in refraction bloom
- **Better metals**: gold stays gold, steel stays steel even at high exposure
- **AgX "Punchy"**: higher contrast variant — currently not in Three.js core, available via pmndrs/postprocessing `ToneMappingMode.AGX`

```js
// Minimum correct setup for PBR scene (2025):
renderer.toneMapping = THREE.AgXToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
THREE.ColorManagement.enabled = true;
```

#### Exposure as Creative Tool
- `0.5` → dark, moody, shadow detail preserved
- `1.0` → neutral reference point
- `1.5–2.0` → bright, high-key studio look
- `> 2.5` → typically too bright; control with light intensity instead
- **Don't use exposure to fix brightness issues** — fix light intensity/environment intensity first, use exposure for final "trim"

---

### 3. Color Temperature & White Balance

Kelvin → approximate hex for `PointLight`, `SpotLight`, `DirectionalLight` color:

| Temp (K) | Color | Hex | Usage |
|---|---|---|---|
| 1800 K | Candle / ember | `#FF9B35` | Ultra-warm accent |
| 2700 K | Tungsten incandescent | `#FFD6AA` | Warm indoor ambient |
| 3200 K | Studio tungsten / halogen | `#FFE4C4` | Classic film studio key |
| 4000 K | Warm white LED | `#FFD9B0` | Modern interior |
| 5500 K | Daylight / flash | `#FFF5E0` | Neutral key light |
| 6500 K | Overcast sky | `#F5F5FF` | Cool fill light |
| 7500 K | Deep shade / blue sky | `#D0E0FF` | Cool fill / rim |
| 10000 K | Clear blue sky zenith | `#AACCFF` | Strong cool rim/backlight |

```js
// Warm tungsten key + cool daylight fill (classic studio split):
const keyLight = new THREE.SpotLight(0xFFE4C4, 3.0);   // 3200K
const fillLight = new THREE.DirectionalLight(0xD0E0FF, 1.2); // 7500K
const rimLight = new THREE.SpotLight(0xAABBFF, 2.0);   // ~9000K rim
```

**Color temperature interaction with materials:**
- Warm light + gold = very saturated, rich → good for jewelry lookdev
- Warm light + silver/chrome = yellow cast → usually unwanted; add cool fill to correct
- Cool light + glass/crystal = crisp, clinical → good for product shots
- Mixed warm key + cool fill = dimensional, natural-looking lighting ratio
- **White balance tip:** Use `renderer.toneMappingExposure` + light color to control "scene white point" instead of post-correcting in grading

---

### 4. HDR Rendering Pipeline

**HDR in WebGL** = values > 1.0 stored in render targets using float/half-float precision.

#### Why HDR Matters
- Without HDR: emissive at `2.0` clamps to `1.0` → no bloom, no glow, just white
- With HDR: render target stores `2.0`, bloom threshold detects it, glow generated correctly
- Required for physically correct bloom, lens flare, prismatic light effects

#### Setup
```js
import { HalfFloatType } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

// HDR render target — HalfFloatType for values > 1.0
const renderTarget = new THREE.WebGLRenderTarget(width, height, {
  type: HalfFloatType,          // ← key for HDR pipeline
  format: THREE.RGBAFormat,
  colorSpace: THREE.NoColorSpace // raw linear, OutputPass handles conversion
});

const composer = new EffectComposer(renderer, renderTarget);
composer.addPass(new RenderPass(scene, camera));

// Bloom — responds to pixels > threshold in linear space
const bloom = new UnrealBloomPass(
  new THREE.Vector2(width, height),
  0.8,   // strength
  0.4,   // radius
  0.85   // threshold — only pixels brighter than 0.85 linear bloom
);
composer.addPass(bloom);

// OutputPass handles tone mapping + sRGB conversion at the end
composer.addPass(new OutputPass()); // r152+
```

**OutputPass** replaces the old `GammaCorrectionShader` pattern — use it as the final pass.

#### Critical: Tone Mapping with EffectComposer
When using `EffectComposer`, set tone mapping on the **renderer** (not manually in passes):
```js
renderer.toneMapping = THREE.AgXToneMapping; // applied by OutputPass
renderer.outputColorSpace = THREE.SRGBColorSpace; // applied by OutputPass
// Don't add a separate GammaCorrectionPass — OutputPass handles it
```

#### `useLegacyLights` — Deprecated (r155+)
```js
// DEPRECATED — remove this from your code:
renderer.useLegacyLights = false; // was PI-factor normalization toggle
// As of r155, physically correct lighting is always on
// If your scene suddenly got darker after upgrade: multiply light intensities by Math.PI
```

---

### 5. Color Grading in Three.js

#### Pattern: EffectComposer with LUT + Color Correction

```js
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { LUTPass } from 'three/examples/jsm/postprocessing/LUTPass';
import { LUTCubeLoader } from 'three/examples/jsm/loaders/LUTCubeLoader';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

// Load .cube LUT file
const lutLoader = new LUTCubeLoader();
lutLoader.load('grade.cube', (lut) => {
  const lutPass = new LUTPass();
  lutPass.lut = lut.texture3D;
  lutPass.intensity = 0.8; // blend 0–1, partial application
  composer.insertPass(lutPass, 1); // after RenderPass, before OutputPass
});
```

#### Color Correction Pass (Custom)
```js
const ColorCorrectionShader = {
  uniforms: {
    tDiffuse: { value: null },
    brightness: { value: 0.0 },    // -1 to 1
    contrast: { value: 1.0 },      // 0 to 2
    saturation: { value: 1.0 },    // 0 to 2
    hue: { value: 0.0 },           // -PI to PI
  },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float brightness, contrast, saturation;
    varying vec2 vUv;
    vec3 rgb2hsv(vec3 c) { /* ... */ }
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      // brightness + contrast
      color.rgb = (color.rgb + brightness) * contrast;
      // saturation via luminance
      float lum = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      color.rgb = mix(vec3(lum), color.rgb, saturation);
      gl_FragColor = color;
    }
  `
};
const ccPass = new ShaderPass(ColorCorrectionShader);
composer.addPass(ccPass);
```

#### Pass Order for Dark Studio + Prismatic Light
```
RenderPass           → linear HDR scene render
UnrealBloomPass      → bloom on bright prismatic emissives (threshold ~0.7, strength ~1.2)
LUTPass              → creative color grade (dark teal/cyan wash for studio)
ShaderPass(CC)       → final contrast/saturation tweak
OutputPass           → tone mapping + sRGB conversion (MUST be last)
```

#### LUT Tips
- Author LUTs in DaVinci Resolve or Photoshop — export as `.cube` (33x33x33)
- For dark studio: pull shadows toward cool blue-black, keep midtones neutral, push highlights toward warm white
- `lutPass.intensity` at 0.6–0.8 avoids "LUT-slammed" look
- 3D LUT (`.cube`) > 1D LUT for hue-aware grading

---

### 6. Common Mistakes & Gotchas

| Mistake | Symptom | Fix |
|---|---|---|
| Normal map `.colorSpace = SRGBColorSpace` | Banding, wrong normals, shading artifacts | Set to `NoColorSpace` |
| Missing `.colorSpace` on albedo | Washed out / too bright colors | Set to `SRGBColorSpace` |
| `outputColorSpace = LinearSRGBColorSpace` on canvas | Everything looks washed out | Use `SRGBColorSpace` for display |
| GammaCorrectionPass + OutputPass both active | Double gamma, blown out whites | Remove GammaCorrectionPass |
| Bloom with LDR render target | No glow on emissives > 1.0 | Use `HalfFloatType` render target |
| Old `renderer.useLegacyLights = false` | Unexpected behavior after r155 | Remove the line entirely |
| `toneMappingExposure` compensating for dark scene | Noisy/harsh results | Fix scene lighting intensity instead |
| ACES on metals/glass with colorful lighting | Orange shift, false hues | Switch to AgX |
| GLTFLoader vs TextureLoader colorSpace | Manual loads missing sRGB tag | Always set `.colorSpace` on manual texture loads |
| EffectComposer rendering dark/flat | sRGB conversion happening twice or zero times | Ensure `OutputPass` is last, renderer TM set |

---

*Section added 2025-02-24 — Three.js r167+ reference. Review when upgrading beyond r170.*

## Critical Lesson: FBO Dichroic Glass Needs Near-Neutral Background (2026-02-24)

### The mistake
Assigning a heavily saturated warm color (e.g. `0x6b4a38` amber, `0x9a8060` orange-taupe) to `scene.background` and the floor when using a **FBO screen-space refraction shader** (not MeshPhysicalMaterial transmission).

### What goes wrong
The FBO captures the full scene *without* the glass object, then the glass shader samples that texture with per-channel IOR offsets. If the captured scene is dominated by a saturated color (e.g. warm orange), **every channel refracts that color** — the glass body simply becomes a solid block of that color. The per-channel IOR split is too small (R:1.14 vs B:1.23) to overcome a scene flooded with orange.

Result: the glass looks like **colored plastic**, not glass. All transparency and dispersion lost.

### The rule
> **FBO refraction glass needs a near-neutral (mid-grey ± subtle tint) background.** The glass's own dispersion creates the color story — the scene just needs to be neutral enough to let the chromatic split be visible.

Neutral: `0x7a8090` (cool grey), `0x7a7878` (warm grey), `0x808080` (pure grey) → glass reads beautifully.
Saturated: `0x6b4a38` (amber), `0xc07030` (orange), any high-chroma color → glass disappears.

### The correct Turrell approach
- **Warmth/atmosphere = lighting**, NOT background color
- Warm KEY light + warm backlight creates warm/cool contrast on cube faces
- Cool RIM light separates silhouette from background
- Background stays near-neutral so the glass can breathe
- The floor can be slightly warmer than background (Turrell ground warmth) but stay desaturated (`0x857870`, not `0x9a8060`)

## Critical Lesson: Additive Glow Stacking Under Glass (2026-03-02)

### The problem
Multiple additive-blend emissive planes (prayer discs, glow effects) overlapping directly under a refractive glass object. Each disc contributes full brightness at r≈0. With 3-5 discs stacking, the cube bottom clips to pure white — reads as a light bulb, not glass.

### The fix: center-hole technique
Add a `smoothstep(0.0, R, r)` ramp to every additive disc shader, where R matches the object's footprint radius in the disc's coordinate space:

```glsl
// World-space disc (e.g. prayer window, radius ~9 world units)
// Cube footprint ≈ 0.6 world units → hole radius 1.5 for clean separation
float radial = exp(-r / uOuterRadius * 2.2) * smoothstep(0.0, 1.5, r);

// UV-space disc (0→1 normalized, e.g. prism fan, radius 12 world units)
// Cube footprint ≈ 0.6/12 = 0.05 → hole radius ~0.08-0.20
float radial = smoothstep(0.08, 0.20, r) * exp(-r * r * 3.0);
```

### Why this works
- The hole is invisible to the viewer (it's directly under an opaque-ish object)
- Prayer windows / glow features still read perfectly — the glow just starts further from center
- No changes needed to the glass shader or lighting — it's purely a disc-side fix
- Much cleaner than reducing cubeSun intensity (which kills the rainbow)

### Combined approach (when center hole alone isn't enough)
1. **Center hole** on additive discs (eliminates stacking)
2. **cubeSun reduction** 85→55 (reduces direct bottom-face hit)
3. **Bottom-face attenuation** in glass shader via `Nw.y` (per-face control)
4. **Bottom-face glow** in glass shader (subtle emission to separate from dark podium)

### Key insight: coordinate spaces matter
The center hole radius must be specified in the disc's own coordinate space. A 1.2-unit cube sitting on a 9-unit-radius world-space disc needs r≈1.5. The same cube on a UV-normalized disc needs r≈0.08. Getting this wrong = either no effect (too small) or visible hole in the glow (too large).
