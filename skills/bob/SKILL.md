# Bob — Blender Builder Skills

## Role
3D modeling, rigging, environment, Three.js geometry, optimization. Blender MCP execution.

## Blender MCP Protocol
- Host: `localhost:9877` (TCP socket)
- Command: `{"type": "execute_code", "params": {"code": "..."}}`
- Success check: `r.get("status") in ("ok", "success")`
- Returns: `{"status": "success", "result": {"executed": true, "result": "..."}}`
- `read_factory_settings` is FORBIDDEN — freezes TCP socket, use mesh-only delete instead

## Blender 5.0 API Rules (Critical)
- `bpy.ops.mesh.primitive_torus_add(location=(0,0,0))` — NO radius/segments params
- `bpy.ops.mesh.primitive_uv_sphere_add(location=(0,0,0))` — NO size param
- `bpy.ops.mesh.primitive_cylinder_add(location=(0,0,0))` — NO radius/depth params
- `bpy.ops.mesh.primitive_cube_add(location=(0,0,0))` — NO size param
- Modifiers: `mod = obj.modifiers.new("Name", "TYPE")` then set attributes directly
- Access modifier by variable reference, not name key
- `loopcut()` not `loopcut_split()`
- `edge_crease()` not `edge_creep()`
- EEVEE engine string: `"BLENDER_EEVEE"` (not BLENDER_EEVEE_NEXT)
- WORKBENCH engine: `"BLENDER_WORKBENCH"`

## Object Rules
- ALWAYS place new objects at `location=(0,0,0)` unless placement is critical
- ALWAYS name objects immediately after creation: `obj.name = "Donut"`
- NEVER set scale to (0,0,0) or near-zero
- NEVER use `hide_viewport=True` or `hide_render=True`
- NEVER use `read_factory_settings`

## Scene Cleanup
```python
import bpy
for obj in list(bpy.data.objects):
    if obj.type in ('MESH', 'LIGHT', 'CAMERA'):
        bpy.data.objects.remove(obj, do_unlink=True)
```

## Render Setup (Cycles GPU1 — GPU0 reserved for Qwen, EEVEE fails headless)
```python
import bpy
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.cycles.samples = 128  # 128 preview, 256 final

# Use GPU1 only (GPU0 reserved for Qwen/Ollama)
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'CUDA'
prefs.refresh_devices()
for i, device in enumerate(prefs.devices):
    device.use = (i == 1)  # GPU1 only (index 1 = second RTX A6000)

scene.render.resolution_x = 960
scene.render.resolution_y = 720
scene.render.filepath = 'C:/Users/Public/bob-render.png'
scene.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
```

## Skill Library
- DB: `/home/openclaw-agent/.openclaw/workspace/memory/bob-skills.db`
- Import: `sys.path.insert(0, '/home/openclaw-agent/.openclaw/workspace/tools')` then `from bob_skills import SkillLibrary`
- Always search library before generating new code: `lib.search(query)`
- Log successful executions back to library

## Ollama
- Text/code: `http://localhost:11434` (GPU0) — models: `qwen2.5-coder:32b`, `qwen3.5:35b-a3b`
- Vision: `http://localhost:11434` (GPU0) — model: `qwen2.5vl:7b` (GPU1 port 11435 unreliable)
- Vision timeout: 180s minimum (model cold load takes 30-60s)

## Render Paths
- Windows: `C:/Users/Public/bob-render.png`
- WSL read: `/mnt/c/Users/Public/bob-render.png`
- Always PIL-verify render before sending to Tawfeeq — never send black renders

## Workflow
- Transcript-first: text model reads transcript → generates bpy → execute → vision verify
- Vision fires every 5th successful step only (not every step)
- 3-attempt retry: syntax fix → exec fix → skip with [SKIP] log
- Get scene state before each codegen: `[o.name for o in bpy.data.objects]`

## Web Scraping
- Use `markitdown` for any reference/doc ingestion (see Brett's SKILL.md)
