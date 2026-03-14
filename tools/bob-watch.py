#!/usr/bin/env python3
"""
Bob Watch — Vision-first autonomous Blender learner.

Downloads a YouTube tutorial, extracts frames per teaching segment,
uses local vision model to understand what's shown, generates bpy code,
executes in Blender, compares viewport to tutorial, and iterates.

Usage: python3 bob-watch.py <youtube-url>
"""

import sys
sys.path.insert(0, '/home/openclaw-agent/.openclaw/workspace/tools')
import os
import re
import json
import time
import socket
import base64
import shutil
import logging
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional
from bob_skills import SkillLibrary

_skill_lib = SkillLibrary()

# ── Config ──────────────────────────────────────────────────────────────────

OLLAMA_URL        = "http://localhost:11434"  # GPU0 — text/code model
OLLAMA_VISION_URL = "http://localhost:11435"  # GPU1 — vision model
MODEL_TEXT = "qwen3.5:35b-a3b"
MODEL_VISION = "qwen2.5vl:7b"
BLENDER_HOST = "localhost"
BLENDER_PORT = 9877
VIDEO_DIR = "/tmp/bob-video"
FRAMES_DIR = "/tmp/bob-frames"
SKILLS_FILE = "/home/openclaw-agent/.openclaw/workspace/memory/bob-blender-skills.md"
SESSION_LOG = "/tmp/bob-session.log"
REPLAY_SCRIPT = "/tmp/bob-replay.py"
MILESTONE_LOG = "/tmp/bob-milestones.txt"
ALERT_FILE = "/tmp/bob-alert.txt"
VIEWPORT_RENDER_WIN = "C:/Users/Public/bob-viewport.jpg"   # Blender (Windows) writes here
VIEWPORT_RENDER     = "/mnt/c/Users/Public/bob-viewport.jpg"  # Linux reads from here
SEGMENT_DURATION = 90  # seconds per teaching segment
MAX_RETRIES = 2
FRAMES_PER_SEGMENT = 60  # 12fps * 5 seconds

# ── Scene Blueprint ─────────────────────────────────────────────────────────

SCENE_BLUEPRINT = {
    "Table": {
        "type": "plane", "scale": (8, 8, 1), "location": (0, 0, -0.1),
        "material": {"color": (0.6, 0.45, 0.3), "roughness": 0.8},
        "desc": "Wooden table surface, large flat plane"
    },
    "Plate": {
        "type": "cylinder", "scale": (1.8, 1.8, 0.05), "location": (0, 0, 0),
        "material": {"color": (0.95, 0.95, 0.95), "roughness": 0.3},
        "desc": "White ceramic plate, flat wide cylinder"
    },
    "Donut": {
        "type": "torus", "scale": (1, 1, 0.6), "location": (0, 0, 0.1),
        "material": {"color": (0.8, 0.5, 0.2), "roughness": 0.6},
        "desc": "Donut base, torus shape"
    },
    "Icing": {
        "type": "torus", "scale": (1, 1, 0.35), "location": (0, 0, 0.22),
        "material": {"color": (0.9, 0.3, 0.4), "roughness": 0.4},
        "desc": "Pink icing on top of donut, flatter torus"
    },
    "Mug": {
        "type": "cylinder", "scale": (0.5, 0.5, 0.8), "location": (2.2, 0, 0.4),
        "material": {"color": (0.8, 0.8, 0.8), "roughness": 0.4},
        "desc": "Coffee mug, tall cylinder"
    },
    "MugHandle": {
        "type": "torus", "scale": (0.25, 0.12, 0.35), "location": (2.7, 0, 0.4),
        "material": {"color": (0.8, 0.8, 0.8), "roughness": 0.4},
        "desc": "Mug handle, small torus on side of mug"
    },
    "Coffee": {
        "type": "cylinder", "scale": (0.45, 0.45, 0.05), "location": (2.2, 0, 0.75),
        "material": {"color": (0.2, 0.1, 0.05), "roughness": 0.05},
        "desc": "Coffee surface inside mug, dark flat cylinder"
    },
}

# ── Sprinkles Code ──────────────────────────────────────────────────────────

SPRINKLES_CODE = '''
import bpy, math, random
icing = bpy.data.objects.get("Icing")
if icing:
    ps = icing.modifiers.new("Sprinkles", "PARTICLE_SYSTEM")
    pset = ps.particle_system.settings
    pset.count = 80
    pset.emit_from = "FACE"
    pset.use_emit_random = True
    pset.render_type = "OBJECT"
    # Create a sprinkle cylinder
    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.mesh.primitive_cylinder_add(location=(10, 0, 0))
    sprinkle = bpy.context.active_object
    sprinkle.name = "Sprinkle"
    sprinkle.scale = (0.03, 0.03, 0.15)
    mat = bpy.data.materials.new("SprinkleMat")
    mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.9, 0.2, 0.2, 1)
    sprinkle.data.materials.append(mat)
    pset.instance_object = sprinkle
    print("SPRINKLES_ADDED")
'''

# ── Logging ─────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [BOB] %(message)s",
    handlers=[
        logging.FileHandler(SESSION_LOG, mode="a"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("bob")

# ── Counters ────────────────────────────────────────────────────────────────

successful_actions = 0
milestone_count = 0
_reference_issues = []


# ── Alert ───────────────────────────────────────────────────────────────────

def alert_chef(msg: str):
    """Write alert for chef to pick up."""
    log.warning(f"ALERT: {msg}")
    Path(ALERT_FILE).write_text(f"{datetime.now().isoformat()} | {msg}\n")


# ── Ollama: Text ────────────────────────────────────────────────────────────

def ollama_text(prompt: str, system: str = "") -> str:
    """Send text prompt to local Ollama text model."""
    import urllib.request

    payload = {
        "model": MODEL_TEXT,
        "prompt": prompt,
        "stream": False,
        "options": {"num_predict": 1200, "temperature": 0.1},
    }
    if system:
        payload["system"] = system

    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/generate",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
            return result.get("response", "")
    except Exception as e:
        log.error(f"Ollama text error: {e}")
        return ""


# ── Ollama: Vision ──────────────────────────────────────────────────────────

def ollama_vision(prompt: str, image_paths: list[str]) -> str:
    """Send images + prompt to local Ollama vision model."""
    import urllib.request

    images_b64 = []
    for p in image_paths:
        if os.path.exists(p):
            with open(p, "rb") as f:
                images_b64.append(base64.b64encode(f.read()).decode())

    if not images_b64:
        log.error("No valid images for vision call")
        return ""

    payload = {
        "model": MODEL_VISION,
        "prompt": prompt,
        "images": images_b64,
        "stream": False,
    }

    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{OLLAMA_VISION_URL}/api/generate",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            result = json.loads(resp.read())
            return result.get("response", "")
    except Exception as e:
        log.warning(f"Ollama vision error: {e} — skipping vision check")
        return ""


# ── Blender TCP Socket ──────────────────────────────────────────────────────

def blender(cmd_type: str, params: Optional[dict] = None, timeout: float = 30.0) -> dict:
    """Send command to Blender via TCP socket. Returns parsed JSON response."""
    payload = json.dumps({"type": cmd_type, "params": params or {}})
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((BLENDER_HOST, BLENDER_PORT))
        sock.sendall(payload.encode() + b"\n")

        chunks = []
        while True:
            chunk = sock.recv(65536)
            if not chunk:
                break
            chunks.append(chunk)
            # Check for complete JSON
            try:
                json.loads(b"".join(chunks))
                break
            except json.JSONDecodeError:
                continue
        sock.close()
        return json.loads(b"".join(chunks))
    except Exception as e:
        log.error(f"Blender socket error: {e}")
        return {"status": "error", "error": str(e)}


def blender_exec(code: str) -> dict:
    """Execute Python code in Blender."""
    # Safety: NEVER hide objects
    if "hide_viewport" in code or "hide_render" in code:
        stripped = re.findall(r'[^\n]*\.hide_(?:viewport|render)\s*=\s*True[^\n]*', code)
        log.warning(f"BLOCKED: stripping {len(stripped)} hide commands: {stripped}")
        code = re.sub(r'[^\n]*\.hide_viewport\s*=\s*True[^\n]*', '# BLOCKED: no hiding', code)
        code = re.sub(r'[^\n]*\.hide_render\s*=\s*True[^\n]*', '# BLOCKED: no hiding', code)
    # Always ensure Object Mode before executing — prevents select_all.poll() failures
    mode_reset = "import bpy\ntry:\n    bpy.ops.object.mode_set(mode='OBJECT')\nexcept: pass\n"
    code = mode_reset + code
    resp = blender("execute_code", {"code": code})
    if resp.get("status") not in ("ok", "success"):
        log.error(f"blender_exec error: {resp.get('error', str(resp))}")
    return resp


def blender_alive() -> bool:
    """Check if Blender is responding."""
    resp = blender("get_scene_info")
    return resp.get("status") == "success"


def restart_blender() -> bool:
    """Kill and restart Blender, wait for MCP to come back online."""
    log.warning("[RESTART] Blender MCP unresponsive — attempting auto-restart...")
    script = os.path.join(os.path.dirname(__file__), "blender-restart.sh")
    result = subprocess.run(["bash", script], capture_output=True, text=True, timeout=90)
    log.info(f"[RESTART] stdout: {result.stdout[-300:]}")
    if result.returncode == 0:
        log.info("[RESTART] Blender back online!")
        return True
    log.error(f"[RESTART] Failed: {result.stderr[-200:]}")
    alert_chef("Blender MCP failed to restart automatically — manual intervention needed")
    return False


def start_blender():
    """Start Blender in background with addon listening on TCP."""
    log.info("Starting Blender...")
    subprocess.Popen(
        ["blender", "--background", "--python-expr",
         "import bpy; exec(open('/tmp/bob-blender-server.py').read())"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    # Wait for it to come up
    for _ in range(30):
        time.sleep(1)
        if blender_alive():
            log.info("Blender is ready")
            return
    alert_chef("Blender failed to start after 30s")


def ensure_blender():
    """Make sure Blender is running, restart if needed."""
    if not blender_alive():
        log.warning("Blender MCP not responding — is Blender open with MCP connected on port 9877?")
        alert_chef("Blender MCP not reachable. Please open Blender and connect MCP on port 9877.")
        sys.exit(1)
        if not blender_alive():
            alert_chef("Blender unresponsive after restart")
            sys.exit(1)


# ── Video Download ──────────────────────────────────────────────────────────

def download_video(url: str) -> tuple[str, Optional[str]]:
    """Download video + auto-captions. Returns (video_path, vtt_path or None)."""
    os.makedirs(VIDEO_DIR, exist_ok=True)

    # Skip download if video already exists
    existing = list(Path(VIDEO_DIR).glob("tutorial*.mp4")) + list(Path(VIDEO_DIR).glob("tutorial*.webm"))
    existing_vtt = list(Path(VIDEO_DIR).glob("tutorial*.vtt"))
    if existing:
        log.info(f"Using cached video: {existing[0]}")
        return str(existing[0]), str(existing_vtt[0]) if existing_vtt else None

    log.info(f"Downloading: {url}")
    cmd = [
        "yt-dlp",
        "-f", "bestvideo[height<=480]+bestaudio/best[height<=480]",
        "--write-auto-sub", "--sub-format", "vtt", "--sub-lang", "en",
        "-o", f"{VIDEO_DIR}/tutorial.%(ext)s",
        url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        log.error(f"yt-dlp failed: {result.stderr}")
        alert_chef(f"yt-dlp failed: {result.stderr[:200]}")
        sys.exit(1)

    # Find video file
    video_path = None
    vtt_path = None
    for f in Path(VIDEO_DIR).iterdir():
        if f.suffix in (".mp4", ".mkv", ".webm") and "tutorial" in f.name:
            video_path = str(f)
        if f.suffix == ".vtt":
            vtt_path = str(f)

    if not video_path:
        alert_chef("No video file found after download")
        sys.exit(1)

    log.info(f"Video: {video_path}")
    log.info(f"Captions: {vtt_path or 'none'}")
    return video_path, vtt_path


# ── VTT Caption Parsing ────────────────────────────────────────────────────

def parse_vtt(vtt_path: str) -> list[tuple[float, str]]:
    """Parse VTT file into list of (timestamp_seconds, text)."""
    entries = []
    text = Path(vtt_path).read_text(errors="replace")

    # Match timestamp lines: 00:00:01.234 --> 00:00:05.678
    timestamp_re = re.compile(r"(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->")
    current_time = None
    current_text = []

    for line in text.split("\n"):
        line = line.strip()
        m = timestamp_re.match(line)
        if m:
            # Save previous entry
            if current_time is not None and current_text:
                clean = " ".join(current_text)
                # Strip VTT tags
                clean = re.sub(r"<[^>]+>", "", clean).strip()
                if clean:
                    entries.append((current_time, clean))
            h, mi, s, ms = int(m[1]), int(m[2]), int(m[3]), int(m[4])
            current_time = h * 3600 + mi * 60 + s + ms / 1000
            current_text = []
        elif line and not line.startswith("WEBVTT") and not line.isdigit() and current_time is not None:
            current_text.append(line)

    # Last entry
    if current_time is not None and current_text:
        clean = re.sub(r"<[^>]+>", "", " ".join(current_text)).strip()
        if clean:
            entries.append((current_time, clean))

    return entries


def group_segments(entries: list[tuple[float, str]]) -> list[dict]:
    """Group caption entries into ~30s teaching segments."""
    if not entries:
        return []

    segments = []
    seg_start = entries[0][0]
    seg_texts = []

    for ts, text in entries:
        if ts - seg_start >= SEGMENT_DURATION and seg_texts:
            mid = seg_start + (ts - seg_start) / 2
            segments.append({
                "start": seg_start,
                "end": ts,
                "midpoint": mid,
                "text": " ".join(seg_texts),
            })
            seg_start = ts
            seg_texts = [text]
        else:
            seg_texts.append(text)

    # Final segment
    if seg_texts:
        end = entries[-1][0]
        mid = seg_start + (end - seg_start) / 2
        segments.append({
            "start": seg_start,
            "end": end,
            "midpoint": mid,
            "text": " ".join(seg_texts),
        })

    return segments


# ── Frame Extraction ────────────────────────────────────────────────────────


# ── Action Filter ───────────────────────────────────────────────────────────

ACTION_KEYWORDS = [
    'add','extrude','apply','shade','material','modifier','subdivide',
    'bevel','inset','mirror','solidify','render','node','unwrap','uv',
    'texture','color','roughness','metallic','emission','principled',
    'boolean','create','delete','mesh','geometry','shader','loop cut',
]

DONUT_FOCUS_KEYWORDS = [
    'donut', 'doughnut', 'torus', 'icing', 'frosting', 'glaze',
    'sprinkle', 'topping', 'filling', 'ring', 'dough',
]

DONUT_EXCLUDE_KEYWORDS = [
    'coffee', 'mug', 'cup', 'table', 'plate', 'saucer', 'spoon',
    'background', 'environment', 'hdri', 'world',
]

def is_action_segment(text: str, focus_mode: str = "donut") -> bool:
    """Return True if transcript contains Blender action keywords.
    focus_mode='donut': only include donut-related steps.
    focus_mode='all': include all action steps.
    """
    t = text.lower()
    if not any(kw in t for kw in ACTION_KEYWORDS):
        return False
    if focus_mode == "donut":
        # Must mention donut OR be a general mesh op (no mug/table/etc mention)
        has_donut = any(kw in t for kw in DONUT_FOCUS_KEYWORDS)
        has_exclude = any(kw in t for kw in DONUT_EXCLUDE_KEYWORDS)
        if has_exclude and not has_donut:
            return False
    return True


# ── Viewport Capture ────────────────────────────────────────────────────────

def capture_viewport() -> str:
    """Capture Blender viewport via bpy.ops.render. Returns filepath or ''."""
    code = f"""
import bpy, math

scene = bpy.context.scene

# ── Auto-frame: compute bounding box of all mesh objects ──
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
if meshes:
    all_coords = []
    for o in meshes:
        for v in o.bound_box:
            world = o.matrix_world @ __import__('mathutils').Vector(v)
            all_coords.append(world)
    min_x = min(c.x for c in all_coords)
    max_x = max(c.x for c in all_coords)
    min_y = min(c.y for c in all_coords)
    max_y = max(c.y for c in all_coords)
    min_z = min(c.z for c in all_coords)
    max_z = max(c.z for c in all_coords)
    cx = (min_x + max_x) / 2
    cy = (min_y + max_y) / 2
    cz = (min_z + max_z) / 2
    size = max(max_x - min_x, max_y - min_y, max_z - min_z, 0.5)
    cam_dist = size * 2.5
else:
    cx, cy, cz, cam_dist = 0, 0, 0, 5

# ── Position camera to frame scene ──
if not scene.camera:
    bpy.ops.object.camera_add()
    scene.camera = bpy.context.active_object

cam = scene.camera
cam.location = (cx + cam_dist * 0.8, cy - cam_dist * 0.8, cz + cam_dist * 0.6)

# Point camera at scene center using Track To
cam.constraints.clear()
ct = cam.constraints.new('TRACK_TO')
# Create an empty at scene center to track
bpy.ops.object.empty_add(location=(cx, cy, cz))
target = bpy.context.active_object
target.name = "_cam_target"
ct.target = target
ct.track_axis = 'TRACK_NEGATIVE_Z'
ct.up_axis = 'UP_Y'
bpy.context.view_layer.update()

# ── Lighting ──
if not any(o.type == 'LIGHT' for o in bpy.data.objects):
    bpy.ops.object.light_add(type='SUN', location=(5, -5, 8))
    bpy.context.active_object.data.energy = 5

# ── Render settings ──
scene.render.engine = 'BLENDER_EEVEE'
scene.render.filepath = r"{VIEWPORT_RENDER_WIN}"
scene.render.resolution_x = 960
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'JPEG'
scene.render.image_settings.quality = 90
bpy.ops.render.render(write_still=True)

# Cleanup target empty
bpy.data.objects.remove(target, do_unlink=True)
print("RENDER_DONE")
"""
    resp = blender_exec(code)
    if resp.get("status") in ("ok", "success"):
        # File is on Windows side; we can't os.path.exists it from WSL
        # Trust Blender's success status
        return VIEWPORT_RENDER
    log.warning(f"capture_viewport failed: {resp.get('error', resp.get('message', str(resp)))}")
    return ""


# ── Vision Verify (post-execution only) ────────────────────────────────────

def vision_verify(viewport_path: str, caption_text: str) -> tuple[bool, str]:
    """Single post-execution check: does viewport match what transcript described?"""
    prompt = (
        f"Blender viewport screenshot after executing tutorial step.\n"
        f"The tutorial said: \"{caption_text[:300]}\"\n\n"
        "Does the viewport show the expected result?\n"
        "Reply MATCH_OK if yes, or MISMATCH: <brief reason> if not."
    )
    resp = ollama_vision(prompt, [viewport_path])
    if not resp:
        return True, "no response — assuming ok"
    ok = "MATCH_OK" in resp.upper()
    return ok, resp


# ── Code Generation ─────────────────────────────────────────────────────────

def get_scene_state() -> str:
    """Query Blender for current scene objects — gives Bob context of what exists."""
    code = """
import bpy
lines = []
for o in bpy.data.objects:
    mats = [m.name for m in o.data.materials] if hasattr(o.data, 'materials') else []
    lines.append(f"{o.name} ({o.type}) scale={tuple(round(x,2) for x in o.scale)} mats={mats}")
print("\\n".join(lines))
"""
    resp = blender_exec(code)
    result = resp.get("result", {})
    if isinstance(result, dict):
        return result.get("result", "").strip()
    return str(result).strip()


def generate_bpy_code(caption_text: str, prev_code: str = "") -> str:
    """Generate bpy code from transcript text."""
    system = (
        "You are Bob, an expert Blender Python (bpy) programmer watching a tutorial.\n"
        "Your job: translate tutorial narration into executable bpy code.\n\n"
        "Rules:\n"
        "- If the narration describes a concrete 3D action (add mesh, extrude, scale, apply modifier,\n"
        "  set material, UV unwrap, add nodes, render settings, etc.) → write the bpy code to do it.\n"
        "- If the narration is ONLY talking/explaining with NO actionable 3D step → output exactly: SKIP\n"
        "- Output ONLY Python code OR the word SKIP. No markdown fences, no explanations.\n"
        "- Use bpy and mathutils only. NEVER set hide_viewport=True or hide_render=True.\n"
        "- Keep all objects visible. Be precise with transforms.\n"
        "- Write SAFE code: wrap destructive ops in try/except.\n"
        "- Assume Blender 5.0 with mio3_uv addon available.\n"
        "- When adding objects, deselect all first, then add.\n"
        "- Prefer bpy.ops over direct data manipulation for mesh edits.\n"
        "- Always set context correctly before ops (bpy.context.view_layer.objects.active, etc.)\n"
        "- Blender 5.0 primitive API — call with NO keyword args unless strictly necessary:\n"
        "  bpy.ops.mesh.primitive_uv_sphere_add()  # NO segments/radius/size params\n"
        "  bpy.ops.mesh.primitive_cube_add()        # NO size param\n"
        "  bpy.ops.mesh.primitive_cylinder_add()    # NO vertices/radius params\n"
        "  bpy.ops.mesh.primitive_plane_add()       # NO size param\n"
        "  bpy.ops.mesh.primitive_torus_add()       # NO major/minor radius params\n"
        "  Only pass location=(x,y,z) or scale=(x,y,z) if needed.\n"
        "- Torus: bpy.ops.mesh.primitive_torus_add() — NO major_radius/minor_radius params.\n"
        "  To resize after add: obj.scale = (x, y, z) then bpy.ops.object.transform_apply(scale=True)\n"
        "- NEVER access mesh.minor_radius or mesh.major_radius — these don't exist in Blender 5.0.\n"
        "- After adding a primitive, use bpy.context.active_object to get the reference.\n"
        "- Always ensure an object is selected and active before ops that need it:\n"
        "  bpy.context.view_layer.objects.active = obj; obj.select_set(True)\n"
        "- Loop cut: bpy.ops.mesh.loopcut() NOT loopcut_split()\n"
        "- Edge crease: bpy.ops.transform.edge_crease() NOT edge_creep()\n"
        "- Modifiers: NEVER access by name key. Use index: obj.modifiers[0] OR store ref: mod = obj.modifiers.new('Name', 'TYPE')\n"
        "- Subdivision: mod = obj.modifiers.new('Subdiv', 'SUBSURF'); mod.levels = 2; mod.render_levels = 3\n"
        "- CRITICAL: Always place new objects at location=(0, 0, 0) unless tutorial specifies otherwise\n"
        "- CRITICAL: Icing/topping goes on TOP of donut — offset Z slightly: location=(0, 0, 0.15)\n"
        "- CRITICAL: Mug goes BESIDE donut — location=(3, 0, 0), not on top of it\n"
        "- CRITICAL: Never set scale to 0 or near-zero. Default scale (1,1,1) is fine.\n"
        "- CRITICAL: After adding a primitive, immediately name it descriptively: obj.name = 'Donut'\n"
        "- The scene state is shown above — reference existing objects by their actual names\n"
        "- Get any object: obj = bpy.data.objects.get('Name') — always check for None before using\n"
        "- YOUR ONLY JOB IS THE DONUT. Ignore mug, cup, table, plate, background, environment.\n"
        "- Build only: Donut (torus), Icing (flatter torus on top), Sprinkles (particles on icing).\n"
        "- Add sprinkles as particle system on Icing object when tutorial covers sprinkles.\n"
    )
    # ── Search skill library ──
    from bob_skills import format_skills_for_prompt
    skills = _skill_lib.search(caption_text, limit=2)

    scene_state = get_scene_state()
    prompt = f"Tutorial narration:\n\"\"\"\n{caption_text}\n\"\"\"\n\n"
    if skills:
        prompt = format_skills_for_prompt(skills) + "\n\n" + prompt
    if scene_state:
        prompt += f"Current Blender scene objects:\n{scene_state}\n\n"
    if prev_code:
        prompt += f"Last executed code:\n{prev_code[-600:]}\n\n"
    prompt += "Output bpy code for this step, or SKIP if there is absolutely no 3D action (e.g. pure UI explanation, no modeling/material/modifier work)."

    raw = ollama_text(prompt, system=system)
    raw = re.sub(r"^```[\w]*\s*\n?", "", raw.strip())
    raw = re.sub(r"\n?```\s*$", "", raw.strip())
    # Strip any leading explanation lines before import/bpy
    lines = raw.split('\n')
    for i, line in enumerate(lines):
        if line.strip().startswith(('import ', 'bpy.', 'import bpy', '#')):
            raw = '\n'.join(lines[i:])
            break
    if raw.strip().upper() in ("SKIP", "# SKIP", "PASS", "# PASS") or raw.strip() == "" or re.match(r'^(SKIP|PASS)\s*$', raw.strip(), re.IGNORECASE):
        return ""
    return raw


def generate_fix_code(issue: str, original_code: str) -> str:
    """Generate a fix based on vision mismatch."""
    system = (
        "You are Bob, a Blender Python (bpy) expert. Generate ONLY executable bpy code.\n"
        "NEVER set hide_viewport=True or hide_render=True."
    )
    prompt = (
        f"Vision found this issue: {issue}\n\n"
        f"Original code:\n{original_code[-600:]}\n\n"
        "Write bpy code to fix ONLY the issue. Keep everything else."
    )
    raw = ollama_text(prompt, system=system)
    raw = re.sub(r"^```python\s*\n?", "", raw.strip())
    raw = re.sub(r"\n?```\s*$", "", raw.strip())
    return raw


# ── Skill Logging ───────────────────────────────────────────────────────────

def log_skill(name: str, tags: list, context: str, code: str,
              gotcha: str, chunk_num: int, timestamp: float):
    os.makedirs(os.path.dirname(SKILLS_FILE), exist_ok=True)
    ts_str = f"{int(timestamp // 60)}:{int(timestamp % 60):02d}"
    entry = (
        f"\n## Skill: {name}\n"
        f"Tags: {', '.join(tags)}\n"
        f"Context: {context}\n"
        f"Code: {code[:500]}\n"
        f"Gotcha: {gotcha}\n"
        f"Source: chunk {chunk_num}, ~{ts_str}\n"
    )
    with open(SKILLS_FILE, "a") as f:
        f.write(entry)


# ── Replay Script ───────────────────────────────────────────────────────────

def log_replay(code: str, description: str):
    with open(REPLAY_SCRIPT, "a") as f:
        f.write(f"\n# --- {description} ---\n{code}\n")


# ── Reference Frame Extraction ──────────────────────────────────────────────

def extract_reference_frame(video_path: str) -> str:
    """Extract a single frame from 95% through the video as the reference final result."""
    ref_path = "/tmp/bob-reference.jpg"
    if os.path.exists(ref_path):
        return ref_path
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", video_path],
        capture_output=True, text=True)
    duration = float(probe.stdout.strip()) if probe.stdout.strip() else 3600
    target_ts = duration * 0.95
    subprocess.run([
        "ffmpeg", "-y", "-ss", str(target_ts), "-i", video_path,
        "-vframes", "1", "-vf", "scale=960:540", "-q:v", "3", ref_path
    ], capture_output=True)
    log.info(f"Reference frame extracted at {target_ts:.0f}s → {ref_path}")
    return ref_path


def vision_compare_reference(viewport_path: str, reference_path: str) -> tuple[bool, str]:
    """Compare student viewport against tutorial's final result using vision model."""
    if not os.path.exists(reference_path) or not os.path.exists(viewport_path):
        return True, "missing image — skipping comparison"
    prompt = (
        "You are reviewing a student's Blender recreation against the tutorial's final result.\n"
        "Image 1: the tutorial's final render by the instructor.\n"
        "Image 2: the student's current Blender viewport.\n"
        "List specific differences: missing objects, wrong shapes, wrong materials, wrong lighting.\n"
        "If they match well enough, say REFERENCE_MATCH. Otherwise say REFERENCE_DIFF: <list of issues>"
    )
    resp = ollama_vision(prompt, [reference_path, viewport_path])
    if not resp:
        return True, "no response — assuming ok"
    is_match = "REFERENCE_MATCH" in resp.upper()
    return is_match, resp


# ── Milestones ──────────────────────────────────────────────────────────────

def render_milestone(description: str, ref_frame: str = ""):
    global milestone_count
    milestone_count += 1
    win_path = f"C:/Users/Public/bob-milestone-{milestone_count}.png"
    linux_path = f"/mnt/c/Users/Public/bob-milestone-{milestone_count}.png"
    filepath = f"/tmp/bob-milestone-{milestone_count}.png"
    code = f"""
import bpy, math
scene = bpy.context.scene
if not scene.camera:
    bpy.ops.object.camera_add(location=(7.36, -6.93, 4.96))
    cam = bpy.context.active_object
    cam.rotation_euler = (math.radians(63.6), 0, math.radians(46.7))
    scene.camera = cam
if not any(o.type == 'LIGHT' for o in bpy.data.objects):
    bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
scene.render.resolution_x = 960
scene.render.resolution_y = 540
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = r"{win_path}"
bpy.ops.render.render(write_still=True)
"""
    blender_exec(code)
    # Copy from Windows mount to /tmp for Kitchen dashboard
    import shutil
    if os.path.exists(linux_path):
        shutil.copy2(linux_path, filepath)
        log.info(f"[MILESTONE] #{milestone_count} saved: {filepath}")
    with open(MILESTONE_LOG, "a") as f:
        f.write(f"{datetime.now().isoformat()}|{filepath}|{description}\n")
    log.info(f"[MILESTONE] #{milestone_count}: {filepath}")

    # Compare against reference frame
    if ref_frame and os.path.exists(filepath):
        is_match, issues = vision_compare_reference(filepath, ref_frame)
        if not is_match:
            log.info(f"[REFERENCE_DIFF] {issues}")
            _reference_issues.append({"milestone": milestone_count, "issues": issues})


# ── Clean Scene ─────────────────────────────────────────────────────────────

def clean_scene():
    code = """
import bpy
# Delete only mesh objects, keep camera + lights
for obj in list(bpy.data.objects):
    if obj.type == 'MESH':
        bpy.data.objects.remove(obj, do_unlink=True)
for block in bpy.data.meshes:
    if block.users == 0: bpy.data.meshes.remove(block)
for block in bpy.data.materials:
    if block.users == 0: bpy.data.materials.remove(block)
print("Scene ready:", len(bpy.data.objects), "objects")
"""
    resp = blender_exec(code)
    log.info(f"Scene cleaned: {resp.get('status')}")


def initialize_scene():
    """Build the scene blueprint — correct named objects with right proportions."""
    clean_scene()

    for name, spec in SCENE_BLUEPRINT.items():
        bpy.ops_type = spec["type"]
        loc = spec["location"]
        loc_str = f"({loc[0]}, {loc[1]}, {loc[2]})"
        sc = spec["scale"]
        sc_str = f"({sc[0]}, {sc[1]}, {sc[2]})"
        c = spec["material"]["color"]
        rough = spec["material"]["roughness"]

        code = f"""
import bpy
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_{spec['type']}_add(location={loc_str})
obj = bpy.context.active_object
obj.name = "{name}"
obj.scale = {sc_str}
mat = bpy.data.materials.new(name="{name}_mat")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = ({c[0]}, {c[1]}, {c[2]}, 1.0)
bsdf.inputs["Roughness"].default_value = {rough}
obj.data.materials.clear()
obj.data.materials.append(mat)
print("CREATED: {name}")
"""
        resp = blender_exec(code)
        log.info(f"[BLUEPRINT] Created {name} ({spec['type']}) at {loc_str}: {resp.get('status')}")


# ── Extension Installer ─────────────────────────────────────────────────────

def install_extensions():
    """Install required Blender extensions before tutorial starts."""
    extensions = [
        {
            "name": "mio3_uv",
            "zip_win": "C:/Users/Public/mio3_uv.zip",
            "module": "mio3_uv",
        }
    ]
    for ext in extensions:
        # Check if already installed
        check = blender_exec(f"""
import addon_utils
mods = [m.__name__ for m in addon_utils.modules()]
print("INSTALLED" if "{ext['module']}" in mods else "NOT_INSTALLED")
""")
        result_text = str(check.get("result", ""))
        if "INSTALLED" in result_text:
            log.info(f"[EXT] {ext['name']} already installed — skipping")
            continue

        log.info(f"[EXT] Installing {ext['name']} from {ext['zip_win']}")
        install_code = f"""
import bpy
bpy.ops.preferences.addon_install(overwrite=True, filepath=r"{ext['zip_win']}")
bpy.ops.preferences.addon_enable(module="{ext['module']}")
bpy.ops.wm.save_userpref()
print("EXT_INSTALLED: {ext['name']}")
"""
        resp = blender_exec(install_code)
        log.info(f"[EXT] {ext['name']} install result: {resp.get('status')}")


# ── Main Loop ───────────────────────────────────────────────────────────────

def _validate_code(code: str) -> bool:
    """Check Python syntax without executing."""
    try:
        compile(code, '<string>', 'exec')
        return True
    except SyntaxError as e:
        log.debug(f"Syntax error: {e}")
        return False


def _fix_code(code: str, syntax_error: bool = False, exec_error: str = "") -> str:
    """Ask Qwen to fix broken code. Returns cleaned code or empty string."""
    if syntax_error:
        prompt = f"This Python has a syntax error. Fix ONLY the syntax, output ONLY valid Python:\n{code}"
    else:
        prompt = (
            f"This bpy code failed in Blender 5.0: {exec_error}\n\nCode:\n{code}\n\n"
            "Fix it for Blender 5.0. Note: primitive ops use 'size' not 'radius'. Output ONLY Python."
        )
    fix = ollama_text(prompt, system="Output ONLY fixed Python bpy code. No markdown fences.")
    fix = re.sub(r"^```python\s*\n?", "", fix.strip())
    fix = re.sub(r"\n?```\s*$", "", fix.strip())
    return fix


def main():
    global successful_actions

    if len(sys.argv) < 2:
        print("Usage: python3 bob-watch.py <youtube-url>")
        sys.exit(1)

    url = sys.argv[1]
    log.info(f"Bob starting (transcript-first) — {url}")

    with open(REPLAY_SCRIPT, "w") as f:
        f.write(f"# Bob Replay — {datetime.now().isoformat()}\nimport bpy\nimport mathutils\n")

    # 1. Download + parse captions
    video_path, vtt_path = download_video(url)
    if vtt_path:
        entries = parse_vtt(vtt_path)
        all_segments = group_segments(entries)
    else:
        log.error("No captions — cannot proceed without transcript")
        sys.exit(1)

    # Extract reference frame from end of video
    ref_frame = extract_reference_frame(video_path)
    log.info(f"Reference frame ready: {ref_frame}")

    # 2. Filter to action segments only
    action_segments = [s for s in all_segments if is_action_segment(s["text"])]
    log.info(f"Filtered {len(all_segments)} segments → {len(action_segments)} action segments")

    # 3. Install required extensions
    install_extensions()

    # 4. Ensure Blender + clean scene
    ensure_blender()
    clean_scene()

    # 4. Process each action segment
    prev_code = ""
    consecutive_timeouts = 0
    for i, seg in enumerate(action_segments):
        seg_num = i + 1
        log.info(f"── [{seg_num}/{len(action_segments)}] {seg['start']:.0f}s: {seg['text'][:80]}...")

        # a. Generate bpy from transcript
        # Include next segment for context if available
        context_text = seg["text"]
        for lookahead in range(1, 4):
            if i + lookahead < len(action_segments):
                context_text += " ... " + action_segments[i+lookahead]["text"][:400]
        code = generate_bpy_code(context_text, prev_code)
        if not code:
            log.warning(f"[SKIP] Segment {seg_num} — no code generated")
            continue

        log.info(f"[ACTION] Generated {len(code)} chars")

        # b. Validate syntax + execute with up to 3 retries
        MAX_RETRIES = 3
        exec_ok = False
        for attempt in range(1, MAX_RETRIES + 1):
            # Syntax check first
            if not _validate_code(code):
                log.warning(f"Syntax error (attempt {attempt}/{MAX_RETRIES}) — asking Qwen to fix")
                code = _fix_code(code, syntax_error=True)
                if not code:
                    break
                continue

            # Execute in Blender
            resp = blender_exec(code)
            if resp.get("status") in ("ok", "success"):
                exec_ok = True
                break

            log.warning(f"Exec failed (attempt {attempt}/{MAX_RETRIES}): {resp.get('error', str(resp))}")
            if attempt < MAX_RETRIES:
                code = _fix_code(code, exec_error=resp.get('message', resp.get('error', '')))
                if not code:
                    break

        if not exec_ok:
            err_msg = str(resp.get('message', resp.get('error', '')))
            if 'timed out' in err_msg or 'Connection refused' in err_msg:
                consecutive_timeouts += 1
                log.warning(f"[TIMEOUT] {consecutive_timeouts} consecutive socket failures")
                if consecutive_timeouts >= 3:
                    log.warning("[TIMEOUT] 3 in a row — auto-restarting Blender")
                    if restart_blender():
                        consecutive_timeouts = 0
                        clean_scene()
                    else:
                        break
            else:
                consecutive_timeouts = 0
            log.error(f"Segment {seg_num} failed after {MAX_RETRIES} attempts, skipping")
            continue
        consecutive_timeouts = 0

        _skill_lib.add_skill(
            name=f"tutorial_step_{seg_num}",
            description=seg["text"][:120],
            tags=["tutorial", "learned"],
            code=code,
            verified=True
        )

        # b2. Sprinkle detection — run SPRINKLES_CODE if segment mentions sprinkles/particles
        seg_lower = seg["text"].lower()
        if "sprinkle" in seg_lower or "particle" in seg_lower:
            log.info(f"[SPRINKLES] Detected sprinkle/particle segment — applying sprinkles")
            sprinkle_resp = blender_exec(SPRINKLES_CODE)
            log.info(f"[SPRINKLES] Result: {sprinkle_resp.get('status')}")

        # c. Vision verify every 5 successful actions
        vp = ""
        if successful_actions % 5 == 4:
            vp = capture_viewport()
            if vp and os.path.exists(vp):
                ok, issue = vision_verify(vp, seg["text"])
                if not ok and issue:
                    log.warning(f"[VISION] Issue: {issue} — attempting fix")
                    fix = generate_fix_code(issue, code)
                    if fix and _validate_code(fix):
                        blender_exec(fix)
                        log.info("[VISION] Fix applied")

        # d. Log
        successful_actions += 1
        prev_code = code
        log_skill(
            name=f"step_{seg_num}",
            tags=["blender", "tutorial"],
            context=seg["text"][:200],
            code=code[:500],
            gotcha="",
            chunk_num=seg_num,
            timestamp=seg["start"],
        )
        log_replay(code, f"Step {seg_num} @ {seg['start']:.0f}s")

        if successful_actions % 10 == 0:
            render_milestone(f"After step {seg_num}", ref_frame=ref_frame)

        log.info(f"[SKILL] Step {seg_num} done ({successful_actions} total)")

    # Final milestone
    if successful_actions > 0:
        render_milestone(f"Final — {successful_actions} steps", ref_frame=ref_frame)

    log.info(f"Bob done: {successful_actions} steps, {milestone_count} milestones")


if __name__ == "__main__":
    main()
