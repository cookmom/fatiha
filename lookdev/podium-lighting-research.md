# Podium Lighting Research — Chris

## Problem
Dark podium sides invisible against dark background (0x0d0d12). Camera at steep angle sees front + right side + top.

## Existing Lights (Broken)
All 3 spots at z=10-12 — way too far forward, same angle as camera. Light hits front face (which camera already sees) but side faces get zero light. No edge definition.

## Museum Pedestal Lighting Principles
1. **Grazing light** — position lights to skim across surfaces at shallow angles, revealing form
2. **Edge separation** — rim/kicker lights from sides to separate object from background
3. **Uplighting** — from below, aimed upward along the column to reveal vertical surfaces
4. **Key/fill asymmetry** — one side brighter than other for dimensionality

## Strategy
- **Right kicker**: SpotLight from right side (positive x, low z) aimed at podium center — grazes right face
- **Left fill**: Dimmer spot from left side (negative x, low z) — grazes left face, cooler color
- **Front subtle wash**: One gentle spot from front-below, just enough to define front face edges
- **RectAreaLight consideration**: Could use for soft panel lighting, but spots give more control over spill

## Key Parameters
- Podium bounds: x ±1.32, z ±1.32, top y=0, visible down to ~y=-8 before fog eats it
- Camera at (0.2, 9.7, 15) — sees: front face (z=+1.32), right face (x=+1.32), top face (y=0)
- Fog density 0.048 — lights below y=-5 or so will be heavily attenuated
- Keep intensity LOW — definition not illumination

## Material Considerations  
- Current: metalness 0.85, roughness 0.18 — very mirror-like, reflects environment (which is dark)
- Could lower metalness slightly (0.6-0.7) to allow more diffuse response to light
- Or add envMapIntensity boost if there's an env map
