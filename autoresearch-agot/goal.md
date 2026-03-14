# AGOT Autoresearch Goal

Optimize the dichroic glass cube shader/material look in `agiftoftime.app` for **maximum aesthetic beauty** while maintaining acceptable mobile performance (**target: 30fps+ on iPhone 12+ class devices**).

## Search Space (parameter families)
- IOR channels (R/G/B)
- Tone mapping exposure
- Fog density/intensity controls
- Lighting intensities (gobo/back/rim/tawaf/prayer accents)
- Beam Gaussian width
- Prayer window opacity steps
- Caustic shimmer frequency
- Cube material/shader properties (roughness, metalness, clearcoat, transmission-adjacent shader scalars)
- Floor reflectivity/material response

## Aesthetic Direction
- Rich prismatic refraction
- Deep but not muddy darks
- Luminous cube edges
- Prayer window color visible without washing out cube readability

## Hard Constraints
- CSS/JS parameter-only changes
- No renderer architecture changes
- Never merge to `main`
- Work branch only: `autoresearch/shader-lookdev`
