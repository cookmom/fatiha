# Bob Reference Analysis Template
# Use this prompt when analyzing any reference image for 3D modeling.
# Send to vision model with the reference image attached.

## PROMPT

Analyze this reference image for 3D modeling in Blender. Structure your response exactly as follows:

### 1. OBJECTS
List every distinct object in the scene with:
- Name (what to call it in Blender)
- Shape primitive to start from (torus, sphere, cylinder, cube, plane, etc.)
- Spatial relationship to other objects (on top of, surrounding, scattered across, etc.)

### 2. DIMENSIONS & PROPORTIONS
For each object:
- Approximate scale ratios (e.g. major:minor radius, height:width)
- Any flattening, squashing, or asymmetry from a perfect primitive

### 3. MATERIALS (Principled BSDF values)
For each object:
- Base Color (hex)
- Roughness (0-1)
- Metallic (0-1)
- Specular IOR Level (0-1)
- Coat Weight (0-1) if glossy/candy
- Subsurface Weight (0-1) if translucent/organic
- Subsurface Radius (R,G,B) if SSS enabled

### 4. LIGHTING
- Number of lights and type (area, spot, sun, point)
- Key light: position (clock direction), elevation angle, approximate intensity
- Fill light: position, intensity relative to key
- Background/world color or HDRI description
- Shadow softness (hard/soft/very soft)

### 5. CAMERA
- Elevation angle above subject (degrees)
- Horizontal angle (straight on / 3/4 / side)
- Approximate focal length feel (wide=24mm, normal=50mm, tele=85-135mm)
- Distance feel (close/medium/far)

### 6. BLENDER EXECUTION NOTES
- Any special modeling techniques needed (shrinkwrap, particle scatter, boolean, etc.)
- Render engine recommendation (Cycles for SSS/glass, EEVEE for speed)
- Any known Blender 5.0 gotchas for this type of object

Keep answers precise and technical. No prose — bullet points only.
