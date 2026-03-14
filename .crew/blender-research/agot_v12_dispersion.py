import bpy, math, os, json, bmesh

root = '.crew/blender-research'
renders = os.path.join(root, 'renders')
os.makedirs(renders, exist_ok=True)

input_blend = os.path.join(root, 'agot-v07-baseline-lock.blend')
out_blend = os.path.join(root, 'agot-v12-dispersion.blend')

proof_img = os.path.join(renders, 'agot-v12-proof-strong-dispersion.png')
final_a = os.path.join(renders, 'agot-v12-final-balanced-A.png')
final_b = os.path.join(renders, 'agot-v12-final-balanced-B.png')

bpy.ops.wm.open_mainfile(filepath=input_blend)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.eevee.taa_render_samples = 128
scene.view_settings.view_transform = 'Filmic'
scene.view_settings.look = 'Medium High Contrast'


def ensure_light(name, ltype='SPOT'):
    obj = bpy.data.objects.get(name)
    if obj and obj.type == 'LIGHT':
        if obj.data.type != ltype:
            obj.data.type = ltype
        return obj
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)
    ldat = bpy.data.lights.new(name=name + '_Data', type=ltype)
    obj = bpy.data.objects.new(name, ldat)
    scene.collection.objects.link(obj)
    return obj


def ensure_plane(name):
    obj = bpy.data.objects.get(name)
    if obj and obj.type == 'MESH':
        return obj
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)
    mesh = bpy.data.meshes.new(name + '_Mesh')
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=1.0)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    return obj


def ensure_empty(name):
    obj = bpy.data.objects.get(name)
    if obj:
        return obj
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = 'PLAIN_AXES'
    scene.collection.objects.link(obj)
    return obj


cam = bpy.data.objects.get('Camera')
cube = bpy.data.objects.get('Cube')
look = bpy.data.objects.get('CamTarget') or bpy.data.objects.get('Empty')
if not (cam and cube and look):
    raise RuntimeError('Lock-critical objects missing')

if scene.world and scene.world.use_nodes:
    bg = scene.world.node_tree.nodes.get('Background')
    if bg:
        bg.inputs[0].default_value = (0.005, 0.005, 0.006, 1)
        bg.inputs[1].default_value = 0.18

receiver = ensure_plane('SpectralReceiver')
receiver.location = (0.0, -2.25, 1.0)
receiver.rotation_euler = (math.radians(90), 0.0, 0.0)
receiver.scale = (2.3, 1.0, 1.0)

recv_mat = bpy.data.materials.get('M_Receiver')
if recv_mat is None:
    recv_mat = bpy.data.materials.new('M_Receiver')
recv_mat.use_nodes = True
bsdf = recv_mat.node_tree.nodes.get('Principled BSDF')
bsdf.inputs['Base Color'].default_value = (0.02, 0.02, 0.022, 1)
bsdf.inputs['Roughness'].default_value = 0.16
bsdf.inputs['Specular IOR Level'].default_value = 0.0
if len(receiver.data.materials) == 0:
    receiver.data.materials.append(recv_mat)
else:
    receiver.data.materials[0] = recv_mat

strip = ensure_plane('SpectralFloorStrip')
strip.location = (0.0, -0.55, 0.01)
strip.rotation_euler = (0.0, 0.0, 0.0)
strip.scale = (1.6, 0.42, 1.0)
if len(strip.data.materials) == 0:
    strip.data.materials.append(recv_mat)
else:
    strip.data.materials[0] = recv_mat

if len(cube.data.materials) == 0:
    gmat = bpy.data.materials.new('M_Glass_AGOT')
    cube.data.materials.append(gmat)
else:
    gmat = cube.data.materials[0]

gmat.use_nodes = True
pbsdf = gmat.node_tree.nodes.get('Principled BSDF')
pbsdf.inputs['Base Color'].default_value = (0.985, 0.995, 1.0, 1)
pbsdf.inputs['Metallic'].default_value = 0.0
pbsdf.inputs['Roughness'].default_value = 0.004
pbsdf.inputs['IOR'].default_value = 1.52
pbsdf.inputs['Transmission Weight'].default_value = 1.0
pbsdf.inputs['Specular IOR Level'].default_value = 0.7

key = ensure_light('KeyWhite', 'SPOT')
key.location = (4.0, 6.8, 9.7)
key.rotation_euler = (math.radians(-40), math.radians(8), math.radians(12))
key.data.spot_size = math.radians(24)
key.data.spot_blend = 0.08
key.data.energy = 1800
key.data.color = (1.0, 0.98, 0.95)
key.data.shadow_soft_size = 0.03

fill = ensure_light('FillCool', 'AREA')
fill.location = (-5.5, -1.5, 4.6)
fill.rotation_euler = (math.radians(-20), math.radians(-8), math.radians(-32))
fill.data.energy = 80
fill.data.size = 9.0
fill.data.color = (0.74, 0.84, 1.0)

rim = ensure_light('RimBlue', 'AREA')
rim.location = (-3.7, 1.2, 6.3)
rim.rotation_euler = (math.radians(-35), 0.0, math.radians(65))
rim.data.energy = 220
rim.data.size = 2.0
rim.data.color = (0.7, 0.82, 1.0)

rig = ensure_empty('PrismCastRig')
rig.location = (4.05, 6.75, 9.6)
rig.rotation_euler = (math.radians(-41), math.radians(8), math.radians(12))

rgb_specs = [
    ('Prism_R', (1.0, 0.13, 0.08), -1.05),
    ('Prism_G', (0.12, 1.0, 0.12), 0.00),
    ('Prism_B', (0.14, 0.32, 1.0), 1.05),
]

for name, color, zoff in rgb_specs:
    l = ensure_light(name, 'SPOT')
    l.parent = rig
    l.location = (0.0, 0.0, 0.0)
    l.rotation_mode = 'XYZ'
    l.rotation_euler = (0.0, math.radians(0.75), math.radians(zoff))
    l.data.spot_size = math.radians(8.2)
    l.data.spot_blend = 0.02
    l.data.shadow_soft_size = 0.0
    l.data.energy = 145
    l.data.color = color

scene.view_settings.exposure = 0.0

for nm, en in [('Prism_R', 720), ('Prism_G', 820), ('Prism_B', 760)]:
    bpy.data.objects[nm].data.energy = en
key.data.energy = 1200
scene.view_settings.exposure = -0.08
scene.render.filepath = proof_img
bpy.ops.render.render(write_still=True)

for nm, en in [('Prism_R', 260), ('Prism_G', 300), ('Prism_B', 270)]:
    bpy.data.objects[nm].data.energy = en
key.data.energy = 1650
scene.view_settings.exposure = 0.02
scene.render.filepath = final_a
bpy.ops.render.render(write_still=True)

for nm, en in [('Prism_R', 230), ('Prism_G', 265), ('Prism_B', 240)]:
    bpy.data.objects[nm].data.energy = en
scene.view_settings.exposure = 0.12
scene.render.filepath = final_b
bpy.ops.render.render(write_still=True)

vals = {
    'camera_position': list(cam.location),
    'camera_look_target': list(look.location),
    'cube_center': list(cube.location),
    'cube_yaw_degrees': math.degrees(cube.rotation_euler.z),
}

def close(a,b,t):
    return abs(a-b) <= t

checks = {
    'camera_position_lock': all(close(vals['camera_position'][i], [0.2,9.7,15.0][i], 0.001) for i in range(3)),
    'camera_look_target_lock': all(close(vals['camera_look_target'][i], [0.0,-0.8,1.0][i], 0.001) for i in range(3)),
    'cube_y_lock': close(vals['cube_center'][1], 0.6, 0.001),
    'cube_yaw_lock': close(vals['cube_yaw_degrees'], 45.0, 0.1),
}
vals['checks'] = checks
vals['pass'] = all(checks.values())

with open(os.path.join(root, 'agot-v12-lock-values.json'), 'w') as f:
    json.dump(vals, f, indent=2)

if not vals['pass']:
    raise RuntimeError('Composition lock failed: ' + json.dumps(checks))

bpy.ops.wm.save_as_mainfile(filepath=out_blend)
print('V12_DONE', vals)
