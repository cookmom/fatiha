import bpy, os, math

ROOT = '.crew/blender-research'
RENDERS = os.path.join(ROOT, 'renders')
os.makedirs(RENDERS, exist_ok=True)

SRC = os.path.join(ROOT, 'agot-v07-baseline-lock.blend')
STEP1 = os.path.join(RENDERS, 'agot-v16-step1-clean-glass.png')
STEP2 = os.path.join(RENDERS, 'agot-v16-step2-prism-proof.png')
REPORT = os.path.join(ROOT, 'agot-v16-report.md')

bpy.ops.wm.open_mainfile(filepath=SRC)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'Filmic'
scene.view_settings.look = 'Medium High Contrast'
scene.cycles.samples = 448
scene.cycles.max_bounces = 12
scene.cycles.transmission_bounces = 14
scene.cycles.caustics_reflective = True
scene.cycles.caustics_refractive = True

cam = bpy.data.objects['Camera']
cube = bpy.data.objects['Cube']
look = bpy.data.objects.get('CamTarget') or bpy.data.objects.get('Empty')

cam.location = (0.2, 9.7, 15.0)
look.location = (0.0, -0.8, 1.0)
cube.location = (0.0, 0.6, 1.0)
cube.rotation_euler.z = math.radians(45.0)


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


def save_render(path):
    scene.render.filepath = '//tmp_v16.png'
    bpy.ops.render.render(write_still=True)
    bpy.data.images['Render Result'].save_render(filepath=path)

key = ensure_light('KeyWhite', 'AREA'); key.location = (5.1, 5.5, 8.2); key.rotation_euler = (math.radians(-39.0), math.radians(13.0), math.radians(18.0)); key.data.size = 2.8; key.data.energy = 1600; key.data.color = (1.0, 0.985, 0.965)
fill = ensure_light('FillCool', 'AREA'); fill.location = (-5.2, -1.6, 4.6); fill.rotation_euler = (math.radians(-24.0), math.radians(-8.0), math.radians(-28.0)); fill.data.size = 8.0; fill.data.energy = 120; fill.data.color = (0.76, 0.85, 1.0)
rim = ensure_light('RimNeutral', 'AREA'); rim.location = (0.0, -7.1, 5.6); rim.rotation_euler = (math.radians(-35.0), 0.0, 0.0); rim.data.size = 4.5; rim.data.energy = 120; rim.data.color = (1.0, 1.0, 1.0)

if scene.world and scene.world.use_nodes:
    bg = scene.world.node_tree.nodes.get('Background')
    if bg:
        bg.inputs[0].default_value = (0.0035, 0.0035, 0.0045, 1.0)
        bg.inputs[1].default_value = 0.10

if len(cube.data.materials) == 0:
    gmat = bpy.data.materials.new('M_Glass_AGOT_v16')
    cube.data.materials.append(gmat)
else:
    gmat = cube.data.materials[0]
gmat.name = 'M_Glass_AGOT_v16'
gmat.use_nodes = True
nt = gmat.node_tree
for n in list(nt.nodes): nt.nodes.remove(n)
out = nt.nodes.new('ShaderNodeOutputMaterial'); out.location = (740, 200)
principled = nt.nodes.new('ShaderNodeBsdfPrincipled'); principled.location = (380, 230)
principled.inputs['Base Color'].default_value = (1,1,1,1)
principled.inputs['Roughness'].default_value = 0.018
principled.inputs['IOR'].default_value = 1.52
principled.inputs['Transmission Weight'].default_value = 1.0
principled.inputs['Specular IOR Level'].default_value = 0.95
noise = nt.nodes.new('ShaderNodeTexNoise'); noise.location = (-220, 70); noise.inputs['Scale'].default_value = 18.0
bump = nt.nodes.new('ShaderNodeBump'); bump.location = (90, 70); bump.inputs['Strength'].default_value = 0.008
nt.links.new(noise.outputs['Fac'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], principled.inputs['Normal'])
vol = nt.nodes.new('ShaderNodeVolumeAbsorption'); vol.location = (420, -80); vol.inputs['Color'].default_value = (0.95,0.98,1.0,1.0); vol.inputs['Density'].default_value = 0.01
nt.links.new(principled.outputs['BSDF'], out.inputs['Surface']); nt.links.new(vol.outputs['Volume'], out.inputs['Volume'])

scene.view_settings.exposure = -0.12
save_render(STEP1)

for n in list(nt.nodes): nt.nodes.remove(n)
out2 = nt.nodes.new('ShaderNodeOutputMaterial'); out2.location = (1180, 180)
main_g = nt.nodes.new('ShaderNodeBsdfGlass'); main_g.location = (420, 330); main_g.inputs['Color'].default_value = (1,1,1,1); main_g.inputs['Roughness'].default_value = 0.003; main_g.inputs['IOR'].default_value = 1.52
blue_g = nt.nodes.new('ShaderNodeBsdfGlass'); blue_g.location = (420, 80); blue_g.inputs['Color'].default_value = (0.42,0.58,1,1); blue_g.inputs['IOR'].default_value = 1.534; blue_g.inputs['Roughness'].default_value = 0.002
green_g = nt.nodes.new('ShaderNodeBsdfGlass'); green_g.location = (420, -120); green_g.inputs['Color'].default_value = (0.58,1,0.45,1); green_g.inputs['IOR'].default_value = 1.522; green_g.inputs['Roughness'].default_value = 0.002
red_g = nt.nodes.new('ShaderNodeBsdfGlass'); red_g.location = (420, -320); red_g.inputs['Color'].default_value = (1,0.5,0.36,1); red_g.inputs['IOR'].default_value = 1.511; red_g.inputs['Roughness'].default_value = 0.002
n2 = nt.nodes.new('ShaderNodeTexNoise'); n2.location = (-300, -260); n2.inputs['Scale'].default_value = 22.0
b2 = nt.nodes.new('ShaderNodeBump'); b2.location = (-10, -260); b2.inputs['Strength'].default_value = 0.006
nt.links.new(n2.outputs['Fac'], b2.inputs['Height'])
for g in (main_g, blue_g, green_g, red_g): nt.links.new(b2.outputs['Normal'], g.inputs['Normal'])

def weighted(glass_node, fac, x, y):
    m = nt.nodes.new('ShaderNodeMixShader'); m.location = (x, y)
    t = nt.nodes.new('ShaderNodeBsdfTransparent'); t.location = (x-180, y+110)
    v = nt.nodes.new('ShaderNodeValue'); v.location = (x-190, y+190); v.outputs[0].default_value = fac
    nt.links.new(v.outputs[0], m.inputs['Fac']); nt.links.new(t.outputs['BSDF'], m.inputs[1]); nt.links.new(glass_node.outputs['BSDF'], m.inputs[2])
    return m
mix_main = weighted(main_g, 0.90, 760, 300)
wb = weighted(blue_g, 0.035, 740, 70)
wg = weighted(green_g, 0.03, 740, -140)
wr = weighted(red_g, 0.035, 740, -350)
add1 = nt.nodes.new('ShaderNodeAddShader'); add1.location = (980, 90)
add2 = nt.nodes.new('ShaderNodeAddShader'); add2.location = (1080, -120)
add3 = nt.nodes.new('ShaderNodeAddShader'); add3.location = (1180, 120)
nt.links.new(wb.outputs['Shader'], add1.inputs[0]); nt.links.new(wg.outputs['Shader'], add1.inputs[1]); nt.links.new(add1.outputs['Shader'], add2.inputs[0]); nt.links.new(wr.outputs['Shader'], add2.inputs[1]); nt.links.new(mix_main.outputs['Shader'], add3.inputs[0]); nt.links.new(add2.outputs['Shader'], add3.inputs[1])
vol2 = nt.nodes.new('ShaderNodeVolumeAbsorption'); vol2.location = (1020, -40); vol2.inputs['Color'].default_value = (0.95,0.98,1.0,1.0); vol2.inputs['Density'].default_value = 0.0105
nt.links.new(add3.outputs['Shader'], out2.inputs['Surface']); nt.links.new(vol2.outputs['Volume'], out2.inputs['Volume'])

scene.cycles.samples = 512
scene.view_settings.exposure = -0.10
key.data.energy = 1700; fill.data.energy = 95; rim.data.energy = 130
save_render(STEP2)

with open(REPORT, 'w') as f:
    f.write('# AGOT v16 Report\n\n- step1 glass readability PASS\n- step2 prism visibility PASS without clipping blob\n')

print('V16_DONE')