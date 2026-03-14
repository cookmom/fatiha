import bpy, math, json, os

root = '/home/openclaw-agent/.openclaw/workspace/.crew/blender-research'
input_blend = root + '/agot-v07-baseline-lock.blend'
out_blend = root + '/agot-v08-improved.blend'
renders = root + '/renders'
os.makedirs(renders, exist_ok=True)
img_a = renders + '/agot-v08-improved-A.png'
img_b = renders + '/agot-v08-improved-B.png'

bpy.ops.wm.open_mainfile(filepath=input_blend)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100

# --- Lighting hierarchy polish (key/fill/rim) ---
# Keep original light objects if present, retune for cleaner hierarchy.
lights = {obj.name: obj for obj in bpy.data.objects if obj.type == 'LIGHT'}

# Assume first two existing are key/fill from baseline; retune them.
light_objs = list(lights.values())
if len(light_objs) >= 1:
    key = light_objs[0]
    key.data.type = 'AREA'
    key.location = (4.2, 6.3, 9.5)
    key.rotation_euler = (math.radians(-35), math.radians(20), math.radians(12))
    key.data.energy = 1550
    key.data.size = 5.2
    key.data.color = (1.0, 0.97, 0.93)
if len(light_objs) >= 2:
    fill = light_objs[1]
    fill.data.type = 'AREA'
    fill.location = (-5.6, -2.4, 4.8)
    fill.rotation_euler = (math.radians(-15), math.radians(-10), math.radians(-30))
    fill.data.energy = 260
    fill.data.size = 8.5
    fill.data.color = (0.84, 0.90, 1.0)

# Add subtle rim to define glass silhouette.
rim = bpy.data.objects.get('RimLight')
if rim is None:
    bpy.ops.object.light_add(type='AREA', location=(-3.8, 1.6, 6.0))
    rim = bpy.context.object
    rim.name = 'RimLight'
rim.data.type = 'AREA'
rim.location = (-3.8, 1.6, 6.0)
rim.rotation_euler = (math.radians(-30), math.radians(5), math.radians(70))
rim.data.energy = 520
rim.data.size = 2.2
rim.data.color = (0.74, 0.84, 1.0)

# Gentle top kicker for face readability.
top = bpy.data.objects.get('TopKicker')
if top is None:
    bpy.ops.object.light_add(type='AREA', location=(0.0, 3.1, 8.1))
    top = bpy.context.object
    top.name = 'TopKicker'
top.data.type = 'AREA'
top.location = (0.0, 3.1, 8.1)
top.rotation_euler = (math.radians(-63), 0.0, 0.0)
top.data.energy = 190
top.data.size = 3.2
top.data.color = (1.0, 1.0, 1.0)

# --- Glass realism improvement ---
cube = bpy.data.objects.get('Cube')
if cube is None:
    raise RuntimeError('Cube not found')

if len(cube.data.materials) == 0:
    mat = bpy.data.materials.new('CubeMat')
    mat.use_nodes = True
    cube.data.materials.append(mat)
else:
    mat = cube.data.materials[0]
    mat.use_nodes = True

nodes = mat.node_tree.nodes
links = mat.node_tree.links
bsdf = nodes.get('Principled BSDF')
out = nodes.get('Material Output')

# Reset to physically plausible clear glass-ish setup for Eevee.
bsdf.inputs['Base Color'].default_value = (0.965, 0.985, 1.0, 1.0)
bsdf.inputs['Metallic'].default_value = 0.0
bsdf.inputs['Roughness'].default_value = 0.045
bsdf.inputs['IOR'].default_value = 1.52
bsdf.inputs['Transmission Weight'].default_value = 1.0
bsdf.inputs['Specular IOR Level'].default_value = 0.62

# Add subtle spectral cast using a tiny iridescence-like mix through Layer Weight.
for n in list(nodes):
    if n.name.startswith('AGOT_V08_'):
        nodes.remove(n)

layer = nodes.new('ShaderNodeLayerWeight'); layer.name = 'AGOT_V08_LayerWeight'; layer.location = (-520, 30)
colramp = nodes.new('ShaderNodeValToRGB'); colramp.name = 'AGOT_V08_SpectralRamp'; colramp.location = (-320, 40)
# Soft cyan-to-violet grazing tint, very subtle when mixed with base color.
colramp.color_ramp.elements[0].position = 0.45
colramp.color_ramp.elements[0].color = (0.92, 0.97, 1.0, 1.0)
colramp.color_ramp.elements[1].position = 0.95
colramp.color_ramp.elements[1].color = (0.82, 0.86, 1.0, 1.0)

mix = nodes.new('ShaderNodeMixRGB'); mix.name = 'AGOT_V08_BaseMix'; mix.location = (-90, 130)
mix.blend_type = 'MIX'
mix.inputs['Fac'].default_value = 0.17
mix.inputs['Color1'].default_value = (0.965, 0.985, 1.0, 1.0)

links.new(layer.outputs['Facing'], colramp.inputs['Fac'])
links.new(colramp.outputs['Color'], mix.inputs['Color2'])
links.new(mix.outputs['Color'], bsdf.inputs['Base Color'])

# Ensure world stays dark enough for contrast.
world = scene.world
if world and world.use_nodes:
    bg = world.node_tree.nodes.get('Background')
    if bg:
        bg.inputs[0].default_value = (0.012, 0.012, 0.014, 1.0)
        bg.inputs[1].default_value = 0.42

# Eevee quality settings for cleaner glass.
scene.eevee.use_raytracing = False
scene.eevee.taa_render_samples = 128
scene.eevee.use_bloom = True
scene.eevee.bloom_intensity = 0.03
scene.eevee.bloom_radius = 6.2

# Render A
scene.render.filepath = img_a
bpy.ops.render.render(write_still=True)

# Render B (same locked composition; slight exposure shift only)
scene.view_settings.exposure = 0.18
scene.render.filepath = img_b
bpy.ops.render.render(write_still=True)
scene.view_settings.exposure = 0.0

# Validate lock values
cam = bpy.data.objects.get('Camera')
target = bpy.data.objects.get('CamTarget')

def close(a,b,t):
    return abs(a-b) <= t

vals = {
    'camera_position': list(cam.location),
    'camera_look_target': list(target.location),
    'cube_center': list(cube.location),
    'cube_yaw_degrees': math.degrees(cube.rotation_euler.z),
}
checks = {
    'camera_position_lock': all(close(vals['camera_position'][i], [0.2,9.7,15.0][i], 0.001) for i in range(3)),
    'camera_look_target_lock': all(close(vals['camera_look_target'][i], [0.0,-0.8,1.0][i], 0.001) for i in range(3)),
    'cube_y_lock': close(vals['cube_center'][1], 0.6, 0.001),
    'cube_yaw_lock': close(vals['cube_yaw_degrees'], 45.0, 0.1),
}
vals['checks'] = checks
vals['pass'] = all(checks.values())

with open(root + '/agot-v08-lock-values.json', 'w') as f:
    json.dump(vals, f, indent=2)

if not vals['pass']:
    raise RuntimeError('Lock validation failed: ' + json.dumps(checks))

# Save improved blend
bpy.ops.wm.save_as_mainfile(filepath=out_blend)
print('PASS', vals)
