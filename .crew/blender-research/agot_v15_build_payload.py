import bpy, os, math, json, bmesh

ROOT = '.crew/blender-research'
RENDERS = os.path.join(ROOT, 'renders')
os.makedirs(RENDERS, exist_ok=True)

SRC = os.path.join(ROOT, 'agot-v07-baseline-lock.blend')
OUT = os.path.join(ROOT, 'agot-v15-sota.blend')
A_IMG = os.path.join(RENDERS, 'agot-v15-final-A.png')
B_IMG = os.path.join(RENDERS, 'agot-v15-final-B.png')
PROOF_IMG = os.path.join(RENDERS, 'agot-v15-dispersion-proof.png')
BASE_IMG = os.path.join(RENDERS, 'agot-v15-baseline.png')
LOCK_JSON = os.path.join(ROOT, 'agot-v15-lock-values.json')

bpy.ops.wm.open_mainfile(filepath=SRC)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'Filmic'
scene.view_settings.look = 'Medium High Contrast'
scene.view_settings.exposure = 0.0
scene.cycles.samples = 384
scene.cycles.max_bounces = 12
scene.cycles.diffuse_bounces = 4
scene.cycles.glossy_bounces = 8
scene.cycles.transmission_bounces = 16
scene.cycles.transparent_max_bounces = 8
scene.cycles.blur_glossy = 0.8
scene.cycles.caustics_reflective = True
scene.cycles.caustics_refractive = True

cam = bpy.data.objects.get('Camera')
cube = bpy.data.objects.get('Cube')
look = bpy.data.objects.get('CamTarget') or bpy.data.objects.get('Empty')
if not (cam and cube and look):
    raise RuntimeError('Lock-critical objects missing')

# Baseline render first (single glass from baseline scene)
scene.render.filepath = BASE_IMG
bpy.ops.render.render(write_still=True)

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

# receiver geometry for readable caustic only
recv = ensure_plane('SpectralReceiver')
recv.location = (0.0, -2.2, 1.0)
recv.rotation_euler = (math.radians(90.0), 0.0, 0.0)
recv.scale = (2.4, 1.05, 1.0)

strip = ensure_plane('SpectralFloorStrip')
strip.location = (0.0, -0.55, 0.01)
strip.rotation_euler = (0.0, 0.0, 0.0)
strip.scale = (1.65, 0.44, 1.0)

recv_mat = bpy.data.materials.get('M_Receiver_v15') or bpy.data.materials.new('M_Receiver_v15')
recv_mat.use_nodes = True
nt_r = recv_mat.node_tree
for n in list(nt_r.nodes):
    nt_r.nodes.remove(n)
out_r = nt_r.nodes.new('ShaderNodeOutputMaterial')
bsdf_r = nt_r.nodes.new('ShaderNodeBsdfPrincipled')
bsdf_r.inputs['Base Color'].default_value = (0.013, 0.013, 0.016, 1.0)
bsdf_r.inputs['Roughness'].default_value = 0.2
bsdf_r.inputs['Specular IOR Level'].default_value = 0.0
nt_r.links.new(bsdf_r.outputs['BSDF'], out_r.inputs['Surface'])
for obj in (recv, strip):
    if len(obj.data.materials) == 0:
        obj.data.materials.append(recv_mat)
    else:
        obj.data.materials[0] = recv_mat

# clean old prism rigs
for nm in list(bpy.data.objects.keys()):
    if nm.startswith('Prism_') or nm == 'PrismCastRig':
        obj = bpy.data.objects.get(nm)
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)

# hard key + weak fill + subtle rim
key = ensure_light('KeyWhite', 'SPOT')
key.location = (4.0, 6.8, 9.7)
key.rotation_euler = (math.radians(-40.0), math.radians(8.0), math.radians(12.0))
key.data.spot_size = math.radians(16.5)
key.data.spot_blend = 0.025
key.data.energy = 2600
key.data.color = (1.0, 0.985, 0.965)
key.data.shadow_soft_size = 0.01

fill = ensure_light('FillCool', 'AREA')
fill.location = (-5.6, -1.8, 4.6)
fill.rotation_euler = (math.radians(-22.0), math.radians(-10.0), math.radians(-30.0))
fill.data.size = 8.0
fill.data.energy = 95
fill.data.color = (0.74, 0.84, 1.0)

rim = ensure_light('RimNeutral', 'AREA')
rim.location = (0.0, -7.6, 5.8)
rim.rotation_euler = (math.radians(-33.0), 0.0, 0.0)
rim.data.size = 4.0
rim.data.energy = 165
rim.data.color = (1.0, 1.0, 1.0)

# 7-band physically-informed dispersion approximation
if len(cube.data.materials) == 0:
    gmat = bpy.data.materials.new('M_Glass_AGOT_v15')
    cube.data.materials.append(gmat)
else:
    gmat = cube.data.materials[0]
gmat.name = 'M_Glass_AGOT_v15'
gmat.use_nodes = True
nt = gmat.node_tree
for n in list(nt.nodes):
    nt.nodes.remove(n)

out = nt.nodes.new('ShaderNodeOutputMaterial'); out.location = (1300, 160)

# BK7-ish Cauchy params with wavelength in micrometers
A = 1.5046
B = 0.00420
bands_nm = [430.0, 470.0, 510.0, 550.0, 590.0, 630.0, 670.0]
weights = [0.11, 0.14, 0.16, 0.18, 0.16, 0.14, 0.11]
colors = [
    (0.39, 0.28, 1.0, 1.0),
    (0.18, 0.52, 1.0, 1.0),
    (0.19, 0.92, 0.73, 1.0),
    (0.62, 1.0, 0.24, 1.0),
    (1.0, 0.82, 0.19, 1.0),
    (1.0, 0.49, 0.12, 1.0),
    (1.0, 0.19, 0.12, 1.0),
]

# mild micro roughness/noise so it stays elegant
tex = nt.nodes.new('ShaderNodeTexNoise'); tex.location = (-940, -120)
tex.inputs['Scale'].default_value = 12.0
tex.inputs['Detail'].default_value = 3.0
tex.inputs['Roughness'].default_value = 0.45
norm = nt.nodes.new('ShaderNodeBump'); norm.location = (-700, -120)
norm.inputs['Strength'].default_value = 0.02
nt.links.new(tex.outputs['Fac'], norm.inputs['Height'])

# build weighted-add chain
add_chain = None
x0 = -450
for i, (lam_nm, w, col) in enumerate(zip(bands_nm, weights, colors)):
    lam_um = lam_nm / 1000.0
    ior = A + B / (lam_um * lam_um)

    g = nt.nodes.new('ShaderNodeBsdfGlass')
    g.location = (x0, 300 - i*170)
    g.inputs['Color'].default_value = col
    g.inputs['Roughness'].default_value = 0.0035
    g.inputs['IOR'].default_value = float(ior)
    nt.links.new(norm.outputs['Normal'], g.inputs['Normal'])

    wt = nt.nodes.new('ShaderNodeValue')
    wt.location = (x0 - 210, 300 - i*170)
    wt.outputs[0].default_value = w

    mix = nt.nodes.new('ShaderNodeMixShader')
    mix.location = (x0 + 240, 300 - i*170)
    # mix with Transparent so shader is effectively scaled by weight
    t = nt.nodes.new('ShaderNodeBsdfTransparent')
    t.location = (x0, 215 - i*170)
    nt.links.new(wt.outputs[0], mix.inputs['Fac'])
    nt.links.new(t.outputs['BSDF'], mix.inputs[1])
    nt.links.new(g.outputs['BSDF'], mix.inputs[2])

    if add_chain is None:
        add_chain = mix
    else:
        ad = nt.nodes.new('ShaderNodeAddShader')
        ad.location = (x0 + 520, 230 - i*130)
        nt.links.new(add_chain.outputs['Shader'], ad.inputs[0])
        nt.links.new(mix.outputs['Shader'], ad.inputs[1])
        add_chain = ad

# subtle volume absorption for realism
vol = nt.nodes.new('ShaderNodeVolumeAbsorption'); vol.location = (1020, -50)
vol.inputs['Color'].default_value = (0.93, 0.965, 1.0, 1.0)
vol.inputs['Density'].default_value = 0.012

nt.links.new(add_chain.outputs['Shader'], out.inputs['Surface'])
nt.links.new(vol.outputs['Volume'], out.inputs['Volume'])

# world darkening for cast readability
if scene.world and scene.world.use_nodes:
    bg = scene.world.node_tree.nodes.get('Background')
    if bg:
        bg.inputs[0].default_value = (0.004, 0.004, 0.005, 1.0)
        bg.inputs[1].default_value = 0.11

# A: balanced
scene.cycles.samples = 384
scene.view_settings.exposure = 0.0
key.data.energy = 2600
fill.data.energy = 95
rim.data.energy = 165
scene.render.filepath = A_IMG
bpy.ops.render.render(write_still=True)

# B: higher contrast / sparkle
scene.cycles.samples = 448
scene.view_settings.exposure = 0.08
key.data.energy = 2850
fill.data.energy = 75
rim.data.energy = 175
scene.render.filepath = B_IMG
bpy.ops.render.render(write_still=True)

# proof: slightly widened dispersion spread (physical-ish push)
proof_iors = []
for lam_nm in bands_nm:
    lam_um = lam_nm / 1000.0
    proof_iors.append((A + 0.0006) + (B * 1.12) / (lam_um * lam_um))

idx = 0
for n in nt.nodes:
    if n.bl_idname == 'ShaderNodeBsdfGlass':
        n.inputs['IOR'].default_value = float(proof_iors[idx])
        idx += 1
        if idx >= len(proof_iors):
            break

scene.cycles.samples = 512
scene.view_settings.exposure = -0.05
key.data.energy = 2450
fill.data.energy = 60
rim.data.energy = 155
scene.render.filepath = PROOF_IMG
bpy.ops.render.render(write_still=True)

vals = {
    'camera_position': list(cam.location),
    'camera_look_target': list(look.location),
    'cube_center': list(cube.location),
    'cube_yaw_degrees': math.degrees(cube.rotation_euler.z),
    'bands_nm': bands_nm,
    'ior_values_final': [A + B / ((nm/1000.0) ** 2) for nm in bands_nm],
}

def close(a, b, t):
    return abs(a - b) <= t

checks = {
    'camera_position_lock': all(close(vals['camera_position'][i], [0.2, 9.7, 15.0][i], 0.001) for i in range(3)),
    'camera_look_target_lock': all(close(vals['camera_look_target'][i], [0.0, -0.8, 1.0][i], 0.001) for i in range(3)),
    'cube_position_lock': all(close(vals['cube_center'][i], [0.0, 0.6, 1.0][i], 0.001) for i in range(3)),
    'cube_yaw_lock': close(vals['cube_yaw_degrees'], 45.0, 0.1),
}
vals['checks'] = checks
vals['pass'] = all(checks.values())
with open(LOCK_JSON, 'w') as f:
    json.dump(vals, f, indent=2)
if not vals['pass']:
    raise RuntimeError('Composition lock failed: ' + json.dumps(checks))

bpy.ops.wm.save_as_mainfile(filepath=OUT)
print('V15_DONE')