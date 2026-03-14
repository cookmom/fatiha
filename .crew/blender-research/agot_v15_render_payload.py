import bpy, os

SRC = '.crew/blender-research/agot-v15-sota.blend'
bpy.ops.wm.open_mainfile(filepath=SRC)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100

WIN_DIR = 'C:/Users/Public'
A = os.path.join(WIN_DIR, 'agot-v15-final-A.png')
B = os.path.join(WIN_DIR, 'agot-v15-final-B.png')
P = os.path.join(WIN_DIR, 'agot-v15-dispersion-proof.png')
BASE = os.path.join(WIN_DIR, 'agot-v15-baseline.png')

# material refs
cube = bpy.data.objects.get('Cube')
mat = cube.data.materials[0] if cube and cube.data.materials else None
nt = mat.node_tree if mat else None

# try to identify glass nodes
glass_nodes = [n for n in nt.nodes if n.bl_idname == 'ShaderNodeBsdfGlass'] if nt else []

# Baseline-style (single band approximation by flattening IOR/color)
if glass_nodes:
    for g in glass_nodes:
        g.inputs['IOR'].default_value = 1.515
        g.inputs['Color'].default_value = (1,1,1,1)
scene.view_settings.exposure = 0.0
scene.cycles.samples = 256
scene.render.filepath = BASE
bpy.ops.render.render(write_still=True)

# Final A (restore physical-ish banded ior/colors)
bands_nm = [430.0, 470.0, 510.0, 550.0, 590.0, 630.0, 670.0]
A0=1.5046
B0=0.00420
colors = [
    (0.39, 0.28, 1.0, 1.0), (0.18, 0.52, 1.0, 1.0), (0.19, 0.92, 0.73, 1.0),
    (0.62, 1.0, 0.24, 1.0), (1.0, 0.82, 0.19, 1.0), (1.0, 0.49, 0.12, 1.0), (1.0, 0.19, 0.12, 1.0)
]
if glass_nodes:
    for i,g in enumerate(glass_nodes[:7]):
        lam = bands_nm[i]/1000.0
        g.inputs['IOR'].default_value = A0 + B0/(lam*lam)
        g.inputs['Color'].default_value = colors[i]
scene.view_settings.exposure = 0.0
scene.cycles.samples = 384
scene.render.filepath = A
bpy.ops.render.render(write_still=True)

# Final B
scene.view_settings.exposure = 0.08
scene.cycles.samples = 448
scene.render.filepath = B
bpy.ops.render.render(write_still=True)

# Proof (wider spread)
if glass_nodes:
    for i,g in enumerate(glass_nodes[:7]):
        lam = bands_nm[i]/1000.0
        g.inputs['IOR'].default_value = (A0+0.0006) + (B0*1.12)/(lam*lam)
scene.view_settings.exposure = -0.05
scene.cycles.samples = 512
scene.render.filepath = P
bpy.ops.render.render(write_still=True)

print('V15_RENDER_DONE')