# PBR Material Database — Extended Reference

## Metals (Metalness = 1.0)

Metals have no diffuse component. Color comes entirely from specular reflectance (F0).

| Material | F0 (R, G, B) linear | Roughness | Hex (sRGB approx) |
|----------|---------------------|-----------|-------------------|
| Gold | (1.000, 0.710, 0.290) | 0.2–0.4 | #FFD700 |
| Silver | (0.950, 0.930, 0.880) | 0.15–0.35 | #C0C0C0 |
| Copper | (0.950, 0.640, 0.540) | 0.25–0.5 | #B87333 |
| Iron | (0.560, 0.570, 0.580) | 0.4–0.7 | #6A6A6A |
| Aluminum | (0.913, 0.922, 0.924) | 0.1–0.4 | #D4D4D4 |
| Platinum | (0.673, 0.637, 0.585) | 0.15–0.3 | #A9A295 |
| Titanium | (0.542, 0.497, 0.449) | 0.2–0.5 | #8A7F72 |
| Chromium | (0.549, 0.556, 0.554) | 0.05–0.2 | #8C8E8D |
| Nickel | (0.660, 0.609, 0.526) | 0.2–0.4 | #A89B86 |
| Zinc | (0.664, 0.824, 0.850) | 0.3–0.6 | #A9D2D9 |
| Brass | (0.910, 0.780, 0.420) | 0.2–0.5 | #E8C76B |
| Bronze | (0.760, 0.570, 0.290) | 0.3–0.6 | #C2914A |

### Patina / Aged Metals
Oxidized or patinated metals lose metalness in affected areas:
- **Patina copper**: metalness 0.3–0.7, roughness 0.5–0.8, tint toward green `#5F9E8F`
- **Rusted iron**: metalness 0.0–0.3, roughness 0.7–1.0, color `#8B4513`
- **Tarnished silver**: metalness 0.7–0.9, roughness 0.3–0.6, darker/yellowed

## Dielectrics (Metalness = 0.0)

F0 derived from IOR: `F0 = ((ior - 1) / (ior + 1))²`

### Glass & Transparent

| Material | IOR | F0 | Roughness | Transmission | Notes |
|----------|-----|-----|-----------|-------------|-------|
| Window glass | 1.52 | 0.04 | 0.0–0.05 | 1.0 | |
| Borosilicate | 1.47 | 0.036 | 0.0 | 1.0 | Lab glass |
| Crystal (lead) | 1.60 | 0.053 | 0.0 | 1.0 | Higher dispersion |
| Sapphire | 1.77 | 0.077 | 0.0 | 1.0 | Watch crystals |
| Diamond | 2.42 | 0.172 | 0.0 | 1.0 | Very high dispersion |
| Water | 1.33 | 0.02 | 0.0 | 1.0 | |
| Ice | 1.31 | 0.018 | 0.1–0.4 | 0.8–1.0 | Subsurface scatter |
| Acrylic | 1.49 | 0.04 | 0.0–0.2 | 0.9–1.0 | |

### Plastics & Polymers

| Material | IOR | Roughness | Base Color | Notes |
|----------|-----|-----------|------------|-------|
| Hard plastic (glossy) | 1.46 | 0.1–0.3 | varies | Toys, electronics |
| Matte plastic | 1.46 | 0.5–0.8 | varies | |
| Rubber | 1.52 | 0.8–1.0 | dark | Nearly Lambertian |
| Silicone | 1.43 | 0.6–0.9 | varies | Translucent option |
| PVC | 1.54 | 0.3–0.7 | varies | |
| Nylon | 1.53 | 0.4–0.7 | off-white | |

### Stone & Mineral

| Material | Roughness | Base Color | Notes |
|----------|-----------|------------|-------|
| Polished marble | 0.05–0.2 | white/veined | Subsurface scattering helps |
| Rough granite | 0.5–0.8 | speckled gray | |
| Sandstone | 0.8–1.0 | tan/beige | |
| Slate | 0.4–0.7 | dark gray | |
| Concrete | 0.8–1.0 | gray | |
| Brick | 0.7–1.0 | red/brown | |
| Obsidian | 0.0–0.1 | near black | Glass-like, IOR ~1.5 |

### Wood

| Material | Roughness | Base Color | Notes |
|----------|-----------|------------|-------|
| Varnished hardwood | 0.15–0.3 | brown | Clearcoat: 1.0 |
| Raw pine | 0.6–0.9 | light tan | |
| Ebony | 0.2–0.5 | near black | |
| Oak | 0.4–0.7 | medium brown | |
| Cherry | 0.3–0.5 | reddish brown | |
| Bamboo | 0.3–0.6 | light yellow | |

### Fabric & Textile

| Material | Roughness | Sheen | Notes |
|----------|-----------|-------|-------|
| Cotton | 0.8–1.0 | 0.0 | Pure diffuse |
| Silk | 0.3–0.5 | 0.8–1.0 | Sheen color matters |
| Velvet | 0.9–1.0 | 1.0 | Strong sheen, dark base |
| Leather | 0.4–0.7 | 0.1–0.3 | Clearcoat for patent |
| Satin | 0.2–0.4 | 0.5–0.8 | Anisotropic highlights |
| Denim | 0.7–0.9 | 0.0–0.1 | |
| Wool | 0.8–1.0 | 0.2–0.4 | |

### Ceramic & Porcelain

| Material | Roughness | Notes |
|----------|-----------|-------|
| Glazed ceramic | 0.02–0.15 | Very smooth, IOR 1.5 |
| Matte ceramic | 0.4–0.7 | |
| Porcelain | 0.05–0.2 | Subsurface scattering for thin pieces |
| Terracotta | 0.6–0.9 | Unglazed, warm orange |
| Enamel | 0.02–0.1 | Watch dials, cookware |

### Skin & Organic

| Material | Roughness | Notes |
|----------|-----------|-------|
| Human skin | 0.4–0.6 | SSS essential, IOR 1.4 |
| Wax | 0.3–0.5 | SSS, IOR 1.45, translucent |
| Leaf (green) | 0.5–0.8 | Backscatter / transmission |

## Three.js MeshPhysicalMaterial Quick Configs

```javascript
// Polished gold
{ color: 0xffd700, metalness: 1.0, roughness: 0.25 }

// Clear glass
{ color: 0xffffff, metalness: 0, roughness: 0, transmission: 1, ior: 1.5, thickness: 0.5 }

// Glossy ceramic
{ color: 0xe8d5b7, metalness: 0, roughness: 0.08, clearcoat: 0.5 }

// Velvet
{ color: 0x2a0a3a, metalness: 0, roughness: 0.95, sheen: 1.0, sheenColor: new THREE.Color(0.4, 0.1, 0.5) }

// Varnished wood
{ color: 0x8b5a2b, metalness: 0, roughness: 0.6, clearcoat: 1.0, clearcoatRoughness: 0.1 }

// Soap bubble
{ color: 0xffffff, metalness: 0, roughness: 0, transmission: 0.9, ior: 1.0, iridescence: 1.0, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 400] }

// Car paint
{ color: 0xcc0000, metalness: 0.1, roughness: 0.2, clearcoat: 1.0, clearcoatRoughness: 0.03 }

// Frosted glass
{ color: 0xffffff, metalness: 0, roughness: 0.5, transmission: 1, ior: 1.5, thickness: 1.0 }
```
