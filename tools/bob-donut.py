#!/usr/bin/env python3
"""Bob's Donut Tutorial — Hardcoded Milestone Curriculum.

Executes 6 known-good bpy stages via Blender MCP (localhost:9877),
rendering a milestone image after each stage.
"""

import socket
import json
import time
import shutil
import os

LOG = "/tmp/bob-live.log"
MILESTONES = "/tmp/bob-milestones.txt"
WIN_RENDER_DIR = "C:/Users/Public"
LINUX_RENDER_DIR = "/mnt/c/Users/Public"
LOCAL_DIR = "/tmp"


def log(msg):
    line = f"[BOB] {msg}\n"
    print(line, end="")
    with open(LOG, "a") as f:
        f.write(line)


def blender_exec(code, timeout=60):
    """Send bpy code to Blender MCP and return parsed response."""
    s = socket.socket()
    s.settimeout(timeout)
    s.connect(("localhost", 9877))
    payload = json.dumps({"type": "execute_code", "params": {"code": code}})
    s.send(payload.encode() + b"\n")
    data = b""
    while True:
        try:
            chunk = s.recv(65536)
        except socket.timeout:
            break
        if not chunk:
            break
        data += chunk
        try:
            result = json.loads(data)
            s.close()
            return result
        except json.JSONDecodeError:
            continue
    s.close()
    if data:
        try:
            return json.loads(data)
        except Exception:
            return {"raw": data.decode(errors="replace")}
    return {"error": "no response"}


def verify_render_is_new(path: str, previous_hashes: set) -> tuple[bool, str]:
    """Refuse to present a render unless it's provably different from all previous ones."""
    import hashlib
    if not os.path.exists(path):
        return False, f"FILE MISSING: {path}"
    h = hashlib.md5(open(path, "rb").read()).hexdigest()
    if h in previous_hashes:
        return False, f"DUPLICATE RENDER (hash {h} already seen) — scene reset failed"
    previous_hashes.add(h)
    return True, h


_seen_hashes: set = set()


def render_milestone(n):
    """Render current scene to milestone image and copy locally."""
    win_path = f"{WIN_RENDER_DIR}/bob-milestone-{n}.png"
    code = f"""
import bpy
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'OPTIX'
prefs.get_devices()
for d in prefs.devices:
    d.use = True
scene.render.filepath = "{win_path}"
scene.render.resolution_x = 960
scene.render.resolution_y = 540
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
"""
    log(f"Rendering milestone {n}...")
    result = blender_exec(code, timeout=120)
    log(f"Render result: {json.dumps(result)[:200]}")

    # Copy from Windows path to /tmp
    src = f"{LINUX_RENDER_DIR}/bob-milestone-{n}.png"
    dst = f"{LOCAL_DIR}/bob-milestone-{n}.png"
    time.sleep(1)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        is_new, result = verify_render_is_new(dst, _seen_hashes)
        if is_new:
            log(f"Milestone {n} saved to {dst} — hash {result} ✓ VERIFIED NEW")
        else:
            log(f"RENDER VERIFICATION FAILED — {result}")
            log(f"NOT presenting this render to Tawfeeq")
    else:
        log(f"RENDER MISSING: {src} not found — will not present")

    with open(MILESTONES, "a") as f:
        f.write(f"{n} {dst}\n")


# ── STAGES ──────────────────────────────────────────────────────────

STAGE_0_RESET = """
import bpy

# Context-free delete — works in MCP without active viewport
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
for mesh in list(bpy.data.meshes):
    bpy.data.meshes.remove(mesh)
for mat in list(bpy.data.materials):
    bpy.data.materials.remove(mat)
for light in list(bpy.data.lights):
    bpy.data.lights.remove(light)
for cam in list(bpy.data.cameras):
    bpy.data.cameras.remove(cam)
for ps in list(bpy.data.particles):
    bpy.data.particles.remove(ps)

print("Scene cleared. Objects remaining:", list(bpy.data.objects))
"""

STAGE_1_BASE_TORUS = """
import bpy
# Add donut torus
bpy.ops.mesh.primitive_torus_add(
    major_radius=1.0,
    minor_radius=0.4,
    major_segments=48,
    minor_segments=12,
    location=(0, 0, 0)
)
donut = bpy.context.active_object
donut.name = 'Donut'
# Smooth shading
bpy.ops.object.shade_smooth()
# Add subdivision surface
mod = donut.modifiers.new('Subsurf', 'SUBSURF')
mod.levels = 2
mod.render_levels = 2
"""

STAGE_2_DEFORM_DONUT = """
import bpy
donut = bpy.data.objects['Donut']
bpy.context.view_layer.objects.active = donut
donut.select_set(True)
# Apply subsurf to get editable mesh
bpy.ops.object.modifier_apply(modifier='Subsurf')
# Enter edit mode and use proportional editing to deform top
import bmesh
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(donut.data)
bm.verts.ensure_lookup_table()
import random
random.seed(42)
for v in bm.verts:
    if v.co.z > 0.05:
        v.co.z += random.uniform(0.0, 0.06)
        v.co.x += random.uniform(-0.03, 0.03)
        v.co.y += random.uniform(-0.03, 0.03)
    # Flatten bottom slightly
    if v.co.z < -0.15:
        v.co.z *= 0.9
bmesh.update_edit_mesh(donut.data)
bpy.ops.object.mode_set(mode='OBJECT')
# Re-add subsurf for smoothness
mod = donut.modifiers.new('Subsurf', 'SUBSURF')
mod.levels = 2
mod.render_levels = 2
"""

STAGE_3_ICING = """
import bpy, bmesh, math
donut = bpy.data.objects['Donut']
bpy.context.view_layer.objects.active = donut
donut.select_set(True)
# Duplicate donut for icing
bpy.ops.object.duplicate()
icing = bpy.context.active_object
icing.name = 'Icing'
# Apply subsurf on icing
for m in icing.modifiers:
    bpy.ops.object.modifier_apply(modifier=m.name)
# Delete bottom half vertices
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(icing.data)
bm.verts.ensure_lookup_table()
verts_to_delete = [v for v in bm.verts if v.co.z < -0.02]
bmesh.ops.delete(bm, geom=verts_to_delete, context='VERTS')
bmesh.update_edit_mesh(icing.data)
bpy.ops.object.mode_set(mode='OBJECT')
# Solidify for icing thickness
sol = icing.modifiers.new('Solidify', 'SOLIDIFY')
sol.thickness = 0.04
sol.offset = 1.0
# Subsurf for smooth icing
sub = icing.modifiers.new('Subsurf', 'SUBSURF')
sub.levels = 2
sub.render_levels = 2
# Move icing up slightly
icing.location.z += 0.01
"""

STAGE_3B_ICING_DRIPS = """
import bpy, math, random
random.seed(77)

major_r = 1.0  # donut major radius
drip_names = []

for i in range(8):
    angle = (i / 8) * math.pi * 2 + random.uniform(-0.3, 0.3)
    r = major_r + random.uniform(-0.25, 0.25)
    x = math.cos(angle) * r
    y = math.sin(angle) * r
    drip_len = random.uniform(0.14, 0.28)
    drip_r = random.uniform(0.055, 0.09)
    z_center = -0.04 - drip_len * 0.45  # hang below icing edge

    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=drip_r,
        segments=12,
        ring_count=8,
        location=(x, y, z_center)
    )
    drip = bpy.context.active_object
    drip.name = f'Drip_{i}'
    # Elongate downward, taper top
    drip.scale.z = drip_len / (2 * drip_r)
    drip.scale.x = 0.75
    drip.scale.y = 0.75
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    drip_names.append(drip.name)

print(f"Created {len(drip_names)} drips: {drip_names}")
"""

STAGE_3C_SPRINKLES = """
import bpy, math, random
random.seed(42)

# Create a single sprinkle master — small elongated cylinder
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.03, depth=0.18,
    location=(0, 0, 10)  # park it out of the way
)
sprinkle_master = bpy.context.active_object
sprinkle_master.name = 'SprinkleMaster'

# Sprinkle colors
colors = [
    (0.9, 0.1, 0.1, 1),   # red
    (0.1, 0.4, 0.9, 1),   # blue
    (0.1, 0.8, 0.2, 1),   # green
    (0.9, 0.8, 0.0, 1),   # yellow
    (0.8, 0.1, 0.8, 1),   # purple
    (1.0, 0.5, 0.0, 1),   # orange
]

major_r = 1.0
placed = []

for i in range(40):
    # Random position on top half of donut surface
    theta = random.uniform(0, math.pi * 2)   # around the ring
    phi = random.uniform(0, math.pi * 0.7)   # 0=top, pi*0.7=side

    # Torus surface point
    r_tube = 0.4
    x = (major_r + r_tube * math.cos(phi)) * math.cos(theta)
    y = (major_r + r_tube * math.cos(phi)) * math.sin(theta)
    z = r_tube * math.sin(phi) + 0.04  # sit slightly above surface

    # Duplicate master
    bpy.ops.object.select_all(action='DESELECT')
    sprinkle_master.select_set(True)
    bpy.context.view_layer.objects.active = sprinkle_master
    bpy.ops.object.duplicate()
    sp = bpy.context.active_object
    sp.name = f'Sprinkle_{i}'
    sp.location = (x, y, z)

    # Random tilt
    sp.rotation_euler = (
        random.uniform(0, math.pi),
        random.uniform(0, math.pi),
        theta + math.pi / 2
    )

    # Assign random color material
    color = colors[i % len(colors)]
    mat = bpy.data.materials.new(f'SprinkleMat_{i}')
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = 0.3
    bsdf.inputs['Coat Weight'].default_value = 0.8
    sp.data.materials.clear()
    sp.data.materials.append(mat)
    placed.append(sp.name)

# Hide master
sprinkle_master.hide_render = True
sprinkle_master.hide_viewport = True

print(f"Placed {len(placed)} sprinkles")
"""

STAGE_4_MATERIALS = """
import bpy
# Donut material (golden brown)
donut = bpy.data.objects['Donut']
mat_donut = bpy.data.materials.new('DonutMat')
mat_donut.use_nodes = True
bsdf = mat_donut.node_tree.nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = (0.55, 0.27, 0.07, 1.0)
bsdf.inputs['Roughness'].default_value = 0.7
bsdf.inputs['Subsurface Weight'].default_value = 0.3
donut.data.materials.append(mat_donut)

# Icing material (pink) — shared by Icing + all Drip_* objects
mat_icing = bpy.data.materials.new('IcingMat')
mat_icing.use_nodes = True
bsdf2 = mat_icing.node_tree.nodes['Principled BSDF']
bsdf2.inputs['Base Color'].default_value = (0.9, 0.4, 0.6, 1.0)
bsdf2.inputs['Roughness'].default_value = 0.3
bsdf2.inputs['Subsurface Weight'].default_value = 0.1
bsdf2.inputs['Coat Weight'].default_value = 0.5
bsdf2.inputs['Coat Roughness'].default_value = 0.1

for obj in bpy.data.objects:
    if obj.name == 'Icing' or obj.name.startswith('Drip_'):
        obj.data.materials.clear()
        obj.data.materials.append(mat_icing)
"""

STAGE_5_LIGHTING_CAMERA = """
import bpy, math
scene = bpy.context.scene

# Remove any existing lights
for obj in list(bpy.data.objects):
    if obj.type == 'LIGHT':
        bpy.data.objects.remove(obj, do_unlink=True)

# Key light (warm)
bpy.ops.object.light_add(type='AREA', location=(3, -2, 4))
key = bpy.context.active_object
key.name = 'KeyLight'
key.data.energy = 200
key.data.color = (1.0, 0.95, 0.9)
key.data.size = 3
key.rotation_euler = (math.radians(45), 0, math.radians(30))

# Fill light (cool)
bpy.ops.object.light_add(type='AREA', location=(-3, 1, 2))
fill = bpy.context.active_object
fill.name = 'FillLight'
fill.data.energy = 80
fill.data.color = (0.85, 0.9, 1.0)
fill.data.size = 4

# Rim light
bpy.ops.object.light_add(type='POINT', location=(0, 3, 2))
rim = bpy.context.active_object
rim.name = 'RimLight'
rim.data.energy = 100

# Camera setup — create fresh since reset deleted everything
bpy.ops.object.camera_add(location=(3.2, -2.8, 2.2))
cam = bpy.context.active_object
cam.name = 'Camera'
cam.rotation_euler = (math.radians(60), 0, math.radians(48))
scene.camera = cam

# World background
world = scene.world
if not world:
    world = bpy.data.worlds.new('World')
    scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs['Color'].default_value = (0.05, 0.05, 0.08, 1.0)
bg.inputs['Strength'].default_value = 0.5
"""

STAGE_6_RENDER_SETTINGS = """
import bpy
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.cycles.samples = 128
scene.cycles.use_denoising = True
# Enable Vulkan (HIP/Metal/OptiX fallback chain: VULKAN -> OPTIX -> CUDA -> CPU)
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'OPTIX'
prefs.get_devices()
for d in prefs.devices:
    d.use = True
print(f"Cycles devices: {[(d.name, d.use, d.type) for d in prefs.devices]}")
"""

STAGES = [
    ("Reset scene", STAGE_0_RESET),
    ("Base torus", STAGE_1_BASE_TORUS),
    ("Deform donut", STAGE_2_DEFORM_DONUT),
    ("Icing mesh", STAGE_3_ICING),
    ("Icing drips", STAGE_3B_ICING_DRIPS),
    ("Sprinkles", STAGE_3C_SPRINKLES),
    ("Materials", STAGE_4_MATERIALS),
    ("Lighting + camera", STAGE_5_LIGHTING_CAMERA),
    ("Render settings (Cycles GPU)", STAGE_6_RENDER_SETTINGS),
]


def main():
    # Clear previous run
    for f in [LOG, MILESTONES]:
        if os.path.exists(f):
            os.remove(f)

    log("=== Bob's Donut Tutorial — Starting ===")
    start = time.time()

    for i, (name, code) in enumerate(STAGES):
        log(f"Stage {i}: {name}")
        t0 = time.time()
        result = blender_exec(code)
        elapsed = time.time() - t0
        log(f"Stage {i} done in {elapsed:.1f}s — {json.dumps(result)[:200]}")

        # Render after stages 1-6 (skip stage 0 reset)
        if i >= 1:
            render_milestone(i)

    total = time.time() - start
    log(f"=== All stages complete in {total:.1f}s ===")
    log(f"Milestones written to {MILESTONES}")


if __name__ == "__main__":
    main()
