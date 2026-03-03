# Chris — Lookdev Artist Skills

## Role
Materials, textures, shaders, lighting, color science for Three.js and Blender scenes.

## Three.js Materials
- Always use `MeshPhysicalMaterial` for glass/metal/plastic — never `MeshStandardMaterial` for hero objects
- FBO dichroic shader: per-channel IOR (R=1.14, G=1.18, B=1.23), AgX tone mapping
- ShaderMaterial opacity: `.material.uniforms.op.value` NOT `.material.opacity`
- Polar disc shader (CircleGeometry + angular GLSL) > card geometry for light/fan/beam effects
- ShaderMaterial is INVISIBLE to Three.js transmission FBO pre-pass — objects through glass must use built-in materials

## Lighting (Three.js)
- Gobo must be DOMINANT light — sacred space = ruthless darkness
- Prayer beams (magenta hour, blue minute, white second) must not be overpowered by arch lighting
- Cube top face must NOT blow out white
- Hour hand always magenta — no adaptive contrast shifting
- AgX tone mapping > ACES for glass shaders (no orange hue shift)

## Blender Materials
- Principled BSDF for all PBR materials
- Food: SSS weight 0.15-0.3, warm radius
- Glass: IOR 1.45, roughness 0.05, transmission 1.0
- Metal: roughness 0.1-0.3, metallic 1.0
- Plastic: roughness 0.4-0.6, metallic 0
- Always set `mat.use_nodes = True` before accessing node tree

## Lighting (Blender)
- 3-point studio: Key (Area, 300-500W), Fill (Area, 100-200W), Rim (Spot/Area, 50-100W)
- World background strength 0.3-0.5 for studio look (not 1.5 — blows out)
- Key light energy 120-300 for food renders (not 400+ — overexposes)
- EEVEE: enable shadows, AO, bloom for quality

## Color Science
- Hex to Blender linear: divide sRGB by 255, apply gamma 2.2 correction
- Quick convert: `tuple(pow(c/255, 2.2) for c in (R, G, B))`
- Always work in linear color space in Blender node trees

## Workflow Rules
- Always write findings to `NEXT-BRIEF.md` (< 50 lines) as handoff
- Write lighting code; orchestrator implements and does screenshot/QC loop
- Never touch `index.html` — orchestrator only
- Spawn with `--tools "Read,Edit,Bash"` to avoid rate limit stalls
- Do NOT push from Chris sessions — orchestrator handles push

## Web Scraping
- Use `markitdown` for any reference/doc ingestion (see Brett's SKILL.md)
