import bpy, math, json, os

# Reset scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100

# World dark
world = bpy.data.worlds.new('World')
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs[0].default_value = (0.01, 0.01, 0.01, 1.0)
bg.inputs[1].default_value = 0.4

# Podium/floor composition (dark circular podium)
bpy.ops.mesh.primitive_cylinder_add(vertices=128, radius=6.0, depth=0.2, location=(0,0,-0.1))
floor = bpy.context.object
floor.name = 'FloorDisk'

bpy.ops.mesh.primitive_cylinder_add(vertices=128, radius=2.2, depth=0.5, location=(0,0,0.25))
podium = bpy.context.object
podium.name = 'Podium'

mat_dark = bpy.data.materials.new('DarkMat')
mat_dark.use_nodes = True
bsdf = mat_dark.node_tree.nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = (0.04,0.04,0.04,1)
bsdf.inputs['Roughness'].default_value = 0.65
bsdf.inputs['Specular IOR Level'].default_value = 0.35
floor.data.materials.append(mat_dark)
podium.data.materials.append(mat_dark)

# Cube
bpy.ops.mesh.primitive_cube_add(size=1.2, location=(0.0,0.6,1.0))
cube = bpy.context.object
cube.name = 'Cube'
cube.rotation_euler = (0.0, 0.0, math.radians(45.0))

cube_mat = bpy.data.materials.new('CubeMat')
cube_mat.use_nodes = True
cbsdf = cube_mat.node_tree.nodes['Principled BSDF']
cbsdf.inputs['Base Color'].default_value = (0.65,0.65,0.65,1)
cbsdf.inputs['Roughness'].default_value = 0.35
cube.data.materials.append(cube_mat)

# Camera + exact look target
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0.0,-0.8,1.0))
target = bpy.context.object
target.name = 'CamTarget'

bpy.ops.object.camera_add(location=(0.2,9.7,15.0))
cam = bpy.context.object
cam.name = 'Camera'
cam.data.lens = 50
constraint = cam.constraints.new(type='TRACK_TO')
constraint.target = target
constraint.track_axis = 'TRACK_NEGATIVE_Z'
constraint.up_axis = 'UP_Y'
scene.camera = cam

# Key light + fill
bpy.ops.object.light_add(type='AREA', location=(4.0, 6.0, 9.0))
key = bpy.context.object
key.data.energy = 1200
key.data.size = 6

bpy.ops.object.light_add(type='AREA', location=(-5.0, -2.0, 4.0))
fill = bpy.context.object
fill.data.energy = 180
fill.data.size = 8

# Paths
root = '/home/openclaw-agent/.openclaw/workspace/.crew/blender-research'
os.makedirs(root + '/renders', exist_ok=True)
render_path = root + '/renders/agot-v07-baseline-lock.png'
blend_path = root + '/agot-v07-baseline-lock.blend'
json_path = root + '/agot-v07-lock-values.json'
report_path = root + '/agot-v07-lock-report.md'

# Render + save blend
scene.render.filepath = render_path
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=blend_path)

# Validate numeric targets
vals = {
    'camera_position': list(cam.location),
    'camera_look_target': list(target.location),
    'cube_center': list(cube.location),
    'cube_yaw_degrees': math.degrees(cube.rotation_euler.z),
}

def close(a,b,tol):
    return abs(a-b) <= tol

checks = {
    'camera_position_exact': all(close(vals['camera_position'][i], [0.2,9.7,15.0][i], 0.001) for i in range(3)),
    'camera_look_target_exact': all(close(vals['camera_look_target'][i], [0.0,-0.8,1.0][i], 0.001) for i in range(3)),
    'cube_center_y_exact': close(vals['cube_center'][1], 0.6, 0.001),
    'cube_yaw_exact': close(vals['cube_yaw_degrees'], 45.0, 0.1),
}
vals['checks'] = checks
vals['baseline_lock_pass'] = all(checks.values())

with open(json_path, 'w') as f:
    json.dump(vals, f, indent=2)

report = f"""# AGOT v07 Baseline Lock Report

PASS: **{vals['baseline_lock_pass']}**

## Target Validation
- Camera position target (0.2, 9.7, 15.0): {checks['camera_position_exact']} | actual={vals['camera_position']}
- Camera look target (0, -0.8, 1.0): {checks['camera_look_target_exact']} | actual={vals['camera_look_target']}
- Cube center y target 0.6: {checks['cube_center_y_exact']} | actual y={vals['cube_center'][1]}
- Cube yaw target 45°: {checks['cube_yaw_exact']} | actual={vals['cube_yaw_degrees']}

## Notes
- Scene contains dark circular floor + raised dark circular podium (AGOT baseline composition, no stylization).
- Validation tolerances used: position <= 0.001, yaw <= 0.1°.
"""
with open(report_path, 'w') as f:
    f.write(report)

if not vals['baseline_lock_pass']:
    raise RuntimeError('Baseline lock failed tolerance checks.')

print('DONE PASS', vals['baseline_lock_pass'])
print(render_path)
print(json_path)
print(blend_path)
print(report_path)
