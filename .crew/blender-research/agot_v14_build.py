import bpy, os, math, json, bmesh

ROOT = '.crew/blender-research'
RENDERS = os.path.join(ROOT, 'renders')
os.makedirs(RENDERS, exist_ok=True)

SRC = os.path.join(ROOT, 'agot-v07-baseline-lock.blend')
OUT = os.path.join(ROOT, 'agot-v14.blend')
A_IMG = os.path.join(RENDERS, 'agot-v14-A.png')
B_IMG = os.path.join(RENDERS, 'agot-v14-B.png')
PROOF_IMG = os.path.join(RENDERS, 'agot-v14-dispersion-proof.png')
LOCK_JSON = os.path.join(ROOT, 'agot-v14-lock-values.json')

bpy.ops.wm.open_mainfile(filepath=SRC)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.eevee.taa_render_samples = 64
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'Filmic'
scene.view_settings.look = 'Medium High Contrast'
scene.view_settings.exposure = 0.0

cam = bpy.data.objects.get('Camera')
cube = bpy.data.objects.get('Cube')
look = bpy.data.objects.get('CamTarget') or bpy.data.objects.get('Empty')
if not (cam and cube and look):
    raise RuntimeError('Lock-critical objects missing')

# Remove any fake RGB prism lights from older passes
for name in list(bpy.data.objects.keys()):
    if name.startswith('Prism_') or name == 'PrismCastRig':
        obj = bpy.data.objects.get(name)
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)


def ensure_light(name, ltype='AREA'):
    obj = bpy.data.objects.get(name)
    if obj and obj.type == 'LIGHT':
        if obj.data.type != ltype:
            obj.data.type = ltype
        return obj
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)
    data = bpy.data.lights.new(name=f'{name}_Data', type=ltype)
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    return obj


def ensure_plane(name):
    obj = bpy.data.objects.get(name)
    if obj and obj.type == 'MESH':
        return obj
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)
    mesh = bpy.data.meshes.new(f'{name}_Mesh')
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=1.0)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    return obj

# Keep composition lock geometry but improve receiver for cast readability
recv = ensure_plane('SpectralReceiver')
recv.location = (0.0, -2.2, 1.0)
recv.rotation_euler = (math.radians(90.0), 0.0, 0.0)
recv.scale = (2.4, 1.05, 1.0)

strip = ensure_plane('SpectralFloorStrip')
strip.location = (0.0, -0.55, 0.01)
strip.rotation_euler = (0.0, 0.0, 0.0)
strip.scale = (1.65, 0.44, 1.0)

recv_mat = bpy.data.materials.get('M_Receiver') or bpy.data.materials.new('M_Receiver')
recv_mat.use_nodes = True
nt = recv_mat.node_tree
for n in list(nt.nodes):
    nt.nodes.remove(n)
out = nt.nodes.new('ShaderNodeOutputMaterial')
bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
bsdf.inputs['Base Color'].default_value = (0.015, 0.015, 0.018, 1.0)
bsdf.inputs['Roughness'].default_value = 0.22
bsdf.inputs['Specular IOR Level'].default_value = 0.0
nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
for obj in (recv, strip):
    if len(obj.data.materials) == 0:
        obj.data.materials.append(recv_mat)
    else:
        obj.data.materials[0] = recv_mat

# Lighting: dominant key + weak fill + subtle rim
key = ensure_light('KeyWhite', 'SPOT')
key.location = (4.0, 6.8, 9.7)
key.rotation_euler = (math.radians(-40.0), math.radians(8.0), math.radians(12.0))
key.data.spot_size = math.radians(19.5)
key.data.spot_blend = 0.03
key.data.energy = 2200
key.data.color = (1.0, 0.985, 0.96)
key.data.shadow_soft_size = 0.015

fill = ensure_light('FillCool', 'AREA')
fill.location = (-5.6, -1.8, 4.6)
fill.rotation_euler = (math.radians(-22.0), math.radians(-10.0), math.radians(-30.0))
fill.data.size = 8.0
fill.data.energy = 120
fill.data.color = (0.75, 0.84, 1.0)

rim = ensure_light('RimNeutral', 'AREA')
rim.location = (0.0, -7.6, 5.8)
rim.rotation_euler = (math.radians(-33.0), 0.0, 0.0)
rim.data.size = 4.0
rim.data.energy = 180
rim.data.color = (1.0, 1.0, 1.0)

# Build elegant pseudo-spectral material (no RGB split-light rig)
if len(cube.data.materials) == 0:
    gmat = bpy.data.materials.new('M_Glass_AGOT_v14')
    cube.data.materials.append(gmat)
else:
    gmat = cube.data.materials[0]

gmat.name = 'M_Glass_AGOT_v14'
gmat.use_nodes = True
nt = gmat.node_tree
for n in list(nt.nodes):
    nt.nodes.remove(n)

out = nt.nodes.new('ShaderNodeOutputMaterial'); out.location = (900, 120)

geom = nt.nodes.new('ShaderNodeNewGeometry'); geom.location = (-900, 220)
normal = nt.nodes.new('ShaderNodeNormalMap'); normal.location = (-720, -40)
noise = nt.nodes.new('ShaderNodeTexNoise'); noise.location = (-930, -140)
noise.inputs['Scale'].default_value = 26.0
noise.inputs['Detail'].default_value = 7.5
noise.inputs['Roughness'].default_value = 0.52

ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.location = (-720, -220)
ramp.color_ramp.interpolation = 'B_SPLINE'
ramp.color_ramp.elements[0].position = 0.18
ramp.color_ramp.elements[0].color = (0.12, 0.22, 1.0, 1.0)
ramp.color_ramp.elements[1].position = 0.82
ramp.color_ramp.elements[1].color = (1.0, 0.22, 0.08, 1.0)

rgb_curves = nt.nodes.new('ShaderNodeRGBCurve'); rgb_curves.location = (-470, -220)
# blue stronger than red/green
rgb_curves.mapping.curves[3].points.new(0.33, 0.37)
rgb_curves.mapping.curves[3].points.new(0.66, 0.74)
rgb_curves.mapping.update()

hsv = nt.nodes.new('ShaderNodeHueSaturation'); hsv.location = (-250, -220)
hsv.inputs['Saturation'].default_value = 0.45
hsv.inputs['Value'].default_value = 1.05

fresnel = nt.nodes.new('ShaderNodeFresnel'); fresnel.location = (-530, 160)
fresnel.inputs['IOR'].default_value = 1.52

ior_map = nt.nodes.new('ShaderNodeMapRange'); ior_map.location = (-260, 30)
ior_map.inputs[1].default_value = 0.0
ior_map.inputs[2].default_value = 1.0
ior_map.inputs[3].default_value = 1.505
ior_map.inputs[4].default_value = 1.548

refr = nt.nodes.new('ShaderNodeBsdfRefraction'); refr.location = (80, 20)
refr.inputs['Roughness'].default_value = 0.005

gloss = nt.nodes.new('ShaderNodeBsdfGlossy'); gloss.location = (70, 230)
gloss.inputs['Roughness'].default_value = 0.012

mix = nt.nodes.new('ShaderNodeMixShader'); mix.location = (340, 160)

volabs = nt.nodes.new('ShaderNodeVolumeAbsorption'); volabs.location = (350, -90)
volabs.inputs['Density'].default_value = 0.015
volabs.inputs['Color'].default_value = (0.9, 0.96, 1.0, 1.0)

nt.links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
nt.links.new(ramp.outputs['Color'], rgb_curves.inputs['Color'])
nt.links.new(rgb_curves.outputs['Color'], hsv.inputs['Color'])
nt.links.new(noise.outputs['Color'], normal.inputs['Color'])
nt.links.new(normal.outputs['Normal'], refr.inputs['Normal'])
nt.links.new(normal.outputs['Normal'], gloss.inputs['Normal'])
nt.links.new(noise.outputs['Fac'], ior_map.inputs['Value'])
nt.links.new(ior_map.outputs['Result'], refr.inputs['IOR'])
nt.links.new(hsv.outputs['Color'], refr.inputs['Color'])
nt.links.new(fresnel.outputs['Fac'], mix.inputs['Fac'])
nt.links.new(refr.outputs['BSDF'], mix.inputs[1])
nt.links.new(gloss.outputs['BSDF'], mix.inputs[2])
nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])
nt.links.new(volabs.outputs['Volume'], out.inputs['Volume'])

# Slight world darkening for cleaner cast
if scene.world and scene.world.use_nodes:
    bg = scene.world.node_tree.nodes.get('Background')
    if bg:
        bg.inputs[0].default_value = (0.005, 0.005, 0.006, 1.0)
        bg.inputs[1].default_value = 0.12

# Render set A (balanced)
scene.view_settings.exposure = 0.0
key.data.energy = 2200
fill.data.energy = 120
rim.data.energy = 180
hsv.inputs['Saturation'].default_value = 0.42
ior_map.inputs[3].default_value = 1.508
ior_map.inputs[4].default_value = 1.545
scene.render.filepath = A_IMG
bpy.ops.render.render(write_still=True)

# Render set B (gentle highlight push)
scene.view_settings.exposure = 0.12
key.data.energy = 2350
fill.data.energy = 95
rim.data.energy = 200
hsv.inputs['Saturation'].default_value = 0.40
scene.render.filepath = B_IMG
bpy.ops.render.render(write_still=True)

# Dispersion proof (stronger but still plausible)
scene.view_settings.exposure = -0.04
key.data.energy = 2100
fill.data.energy = 70
rim.data.energy = 170
hsv.inputs['Saturation'].default_value = 0.62
ior_map.inputs[3].default_value = 1.497
ior_map.inputs[4].default_value = 1.565
noise.inputs['Scale'].default_value = 34.0
scene.render.filepath = PROOF_IMG
bpy.ops.render.render(write_still=True)

vals = {
    'camera_position': list(cam.location),
    'camera_look_target': list(look.location),
    'cube_center': list(cube.location),
    'cube_yaw_degrees': math.degrees(cube.rotation_euler.z),
}

def close(a, b, t):
    return abs(a - b) <= t

checks = {
    'camera_position_lock': all(close(vals['camera_position'][i], [0.2, 9.7, 15.0][i], 0.001) for i in range(3)),
    'camera_look_target_lock': all(close(vals['camera_look_target'][i], [0.0, -0.8, 1.0][i], 0.001) for i in range(3)),
    'cube_y_lock': close(vals['cube_center'][1], 0.6, 0.001),
    'cube_yaw_lock': close(vals['cube_yaw_degrees'], 45.0, 0.1),
}
vals['checks'] = checks
vals['pass'] = all(checks.values())
with open(LOCK_JSON, 'w') as f:
    json.dump(vals, f, indent=2)
if not vals['pass']:
    raise RuntimeError('Composition lock failed: ' + json.dumps(checks))

bpy.ops.wm.save_as_mainfile(filepath=OUT)
print('V14_DONE')
