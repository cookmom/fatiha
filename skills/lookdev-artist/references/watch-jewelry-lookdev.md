# Watch & Jewelry Lookdev — Expanded Reference

## Watch Component Breakdown

A typical watch has 8–12 distinct materials that need individual lookdev:

### 1. Case (body)
- **Top surface**: Usually polished (mirror) or satin/brushed
- **Sides/lugs**: Often brushed (contrast with polished top)
- **Caseback**: Polished, brushed, or display (sapphire)
- **Crown**: Polished with knurled grip texture

### 2. Bezel
- **Polished metal**: Same as case, high reflectivity
- **Ceramic bezel**: roughness=0.15, metalness=0, very hard/scratch-resistant look
- **Engraved markings**: Slight depth in normal map, sometimes painted (lume or white)
- **GMT bezel**: Two-tone color split

### 3. Dial
Common dial types with full material setup:

**Matte/Lacquer Dial**:
```js
{
  color: dialColor,
  metalness: 0.0,
  roughness: 0.8,        // Matte
  // OR roughness: 0.05  // High-gloss lacquer
}
```

**Sunburst Dial** (most popular for dress watches):
```js
{
  color: dialColor,       // Often deep blue #1A3366 or silver #C0C0C0
  metalness: 0.7,         // Metallic base for reflectivity
  roughness: 0.25,        // Semi-glossy
  anisotropy: 0.5,        // Radial brushing
  // CRITICAL: anisotropyMap must be radial from dial center
  // This creates the characteristic light sweep
}
```

**Guilloche/Engine-Turned Dial**:
```js
{
  color: dialColor,
  metalness: 0.5,
  roughness: 0.15,
  normalMap: guillocheNormalMap,  // Repeating geometric pattern
  normalScale: new THREE.Vector2(0.8, 0.8),
}
```

**Grand Feu Enamel**:
```js
{
  color: enamelColor,     // Deep, pure color
  metalness: 0.0,
  roughness: 0.02,        // Glass-like surface
  clearcoat: 0.5,         // Additional gloss layer
  // Enamel has depth — consider subtle transmission or thick clearcoat
}
```

**Meteorite Dial**:
```js
{
  color: #A0A0A0,
  metalness: 1.0,
  roughness: 0.25,
  normalMap: widmanstattenPattern,  // Crystalline etched pattern
}
```

### 4. Hands
- **Polished steel**: metalness=1, roughness=0.03, color=#D0D0D0
- **Blued steel**: metalness=1, roughness=0.08, color=#1A2A5A (thermally oxidized)
- **Gold**: Same as case gold values
- **Dauphine hands**: Faceted, need sharp edge reflections (good geometry)
- **Lume fill**: SuperLuminova in the cutout area

### 5. Indices (Hour Markers)
- **Applied metal**: Raised 3D geometry, same material as case
- **Printed**: Flat on dial surface, slight roughness difference
- **Lume dots/bars**: SuperLuminova material (see SKILL.md)
- **Roman numerals**: Usually printed or applied

### 6. Crystal
See SKILL.md for sapphire crystal recipe. Additional notes:
- **Flat crystal**: Simple plane with refraction
- **Domed crystal**: Curved geometry, refracts more at edges
- **Box crystal**: Thick flat crystal, visible edge
- **Cyclops lens**: Separate magnifying element over date, ior same but thicker geometry
- **Anti-reflective coating**: In reality reduces reflections. Approximate by:
  - Reducing envMapIntensity to 0.3–0.5
  - Or adding slight blue tint to reflections via post-processing

### 7. Date Window
- **Date disc**: White/black background, printed numbers
- **Date frame**: Often polished metal border
- **Cyclops**: Magnifying dome lens

### 8. Bracelet / Strap
Metal bracelet notes:
- **Center links** often polished, **outer links** brushed
- **Clasp**: Mix of finishes
- Use separate materials per link type for realism
- Gaps between links create characteristic shadow pattern

## Jewelry Materials

### Ring Settings
- **Prong setting**: Thin metal prongs, same as ring band material
- **Bezel setting**: Metal rim around stone
- **Pavé**: Many small stones, each needs own refraction

### Chain Types
- **Cable chain**: Round links, alternating orientation
- **Box chain**: Square links
- **Rope chain**: Twisted, anisotropic highlights
- **Snake chain**: Smooth, flexible tube appearance

### Gemstone Mounting Tips
- Gemstones need a **dark backing** or **pavilion geometry** to show fire
- Light enters the crown, bounces inside, exits creating colored flashes
- For diamonds: dispersion creates rainbow fire — use `dispersion: 0.044`
- Colored stones: `attenuationColor` controls the body color

## Lighting for Watch Photography (Three.js)

### Classic Watch Studio Setup

```
          [Rim Light - cool, narrow]
                    |
  [Fill - large,    ●    [Key - medium,
   soft, warm]    Watch    controlled]
                    |
          [Bottom bounce - subtle]
```

**Key light**: RectAreaLight, positioned 45° above and to the side. Size medium for defined reflections on polished surfaces.

**Fill light**: Large soft source opposite key. Lower intensity (0.3–0.5× key).

**Rim/edge light**: Behind and above. Creates bright edge on case silhouette. Essential for reading the form.

**HDRI alternative**: Studio HDRI with 2–3 bright strips on dark background. Rotate to control reflection placement.

### Tips for Three.js Watch Rendering
1. **Use PMREMGenerator** for environment maps — proper mip levels for varied roughness
2. **Anti-aliasing**: Enable MSAA or use FXAA/SMAA post-processing — watch edges are critical
3. **Shadow quality**: High-res shadow maps (2048+) for sharp case shadows
4. **Exposure**: Start at 1.0, adjust for the specific HDRI
5. **Background**: Neutral gray (#808080 or darker) to let the watch speak
6. **Camera**: Slight telephoto (FOV 20–35°) to minimize distortion, like real product photography

## Common Mistakes

1. **Too-perfect surfaces** — Add subtle imperfections (micro-scratches on roughness map) for realism
2. **Uniform roughness** — Real watches have roughness variation even on "polished" surfaces
3. **Missing reflections** — Metal without interesting reflections looks like plastic. Use good HDRI.
4. **Ignoring edge transitions** — Where polished meets brushed, there's a chamfer/bevel. Model it.
5. **Flat lume** — SuperLuminova has physical depth and slightly different texture from the dial
6. **Ignoring crystal** — A watch without its crystal looks naked. The sapphire crystal's reflections and refractions add enormous realism.
7. **Single material for bracelet** — Real bracelets have polished and brushed links. Alternate them.
