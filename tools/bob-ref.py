#!/usr/bin/env python3
"""
bob-ref.py — Reference-driven Blender modeling agent.
Bob reads a reference description, plans using actual skill names from his
library, executes with scene verification after each step, renders result.

Usage: python3 bob-ref.py <image_or_description_path>
"""

import sys, os, json, socket, time, logging, requests, textwrap, shutil
from pathlib import Path

sys.path.insert(0, '/home/openclaw-agent/.openclaw/workspace/tools')
from bob_skills import SkillLibrary

OLLAMA_URL   = "http://localhost:11434"
CODE_MODEL   = "qwen2.5-coder:32b"
BLENDER_HOST = "localhost"
BLENDER_PORT = 9877
VIEWPORT_WIN = "C:/Users/Public/bob-ref-render.png"
VIEWPORT_WSL = "/mnt/c/Users/Public/bob-ref-render.png"
RENDER_OUT   = "/home/openclaw-agent/.openclaw/workspace/references/bob-ref-render.png"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [BOB] %(message)s")
log = logging.getLogger("bob")
lib = SkillLibrary()

# ── Blender ───────────────────────────────────────────────────────────────────
def blender_exec(code: str) -> dict:
    try:
        s = socket.socket()
        s.settimeout(60)
        s.connect((BLENDER_HOST, BLENDER_PORT))
        s.send(json.dumps({"type": "execute_code", "params": {"code": code}}).encode() + b"\n")
        buf = b""
        while True:
            chunk = s.recv(8192)
            if not chunk: break
            buf += chunk
            try: return json.loads(buf)
            except: pass
        return {"status": "error", "message": "no response"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        try: s.close()
        except: pass

def ok(r): return r.get("status") in ("ok", "success")

def scene_state() -> str:
    r = blender_exec("import bpy; print([(o.name, o.type) for o in bpy.data.objects])")
    return r.get("result", {}).get("result", "[]").strip() if ok(r) else "[]"

def clean():
    blender_exec("import bpy\nfor o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)\nprint('clean')")
    log.info("Scene cleared")

# ── LLM ───────────────────────────────────────────────────────────────────────
def llm(prompt, max_tokens=1000):
    r = requests.post(f"{OLLAMA_URL}/api/generate", json={
        "model": CODE_MODEL, "prompt": prompt,
        "stream": False, "options": {"num_predict": max_tokens}
    }, timeout=120)
    return r.json()["response"].strip()

def strip_fences(text):
    if "```" in text:
        for p in text.split("```"):
            p = p.strip().lstrip("python").strip()
            if "import" in p or "bpy" in p:
                return p
    return text

def fix_code(code, error):
    return strip_fences(llm(
        f"Fix this Blender 5.0 bpy Python.\nError: {error}\n\nCode:\n{code}\n\nReturn ONLY fixed Python.", 800
    ))

# ── Execute with verification ─────────────────────────────────────────────────
def run_and_verify(step_name: str, code: str, expect_new_object: bool = False) -> bool:
    before = scene_state()

    # Syntax check
    try: compile(code, "<>", "exec")
    except SyntaxError as e:
        log.warning(f"  syntax error — fixing")
        code = fix_code(code, str(e))

    r = blender_exec(code)

    if not ok(r):
        err = r.get("result", {}).get("error", r.get("message", "?"))
        log.warning(f"  exec error: {err[:80]} — fixing")
        code = fix_code(code, err)
        r = blender_exec(code)
        if not ok(r):
            log.error(f"  ✗ gave up: {step_name}")
            return False

    out = r.get("result", {}).get("result", "")

    # Scene verification: if we expected a new object, check it appeared
    if expect_new_object:
        after = scene_state()
        if after == before:
            log.warning(f"  ⚠ no new object created — may have silently failed")
        else:
            log.info(f"  ✓ scene changed: {out[:60]}")
            return True

    log.info(f"  ✓ {out[:60]}")
    return True

# ── Plan from skill catalog ───────────────────────────────────────────────────
def plan_from_skills(description: str) -> list[dict]:
    """
    Ask Qwen to pick skill names from the catalog that are needed to
    build this object. Returns ordered list of {skill_name, purpose}.
    """
    # Get all skill names from DB
    import sqlite3
    with sqlite3.connect(lib.db_path) as db:
        rows = db.execute("SELECT name, description FROM skills ORDER BY name").fetchall()

    catalog = "\n".join(f"  {r[0]}: {r[1][:60]}" for r in rows)

    prompt = textwrap.dedent(f"""
        You are a Blender artist. Given this reference description and skill catalog,
        pick the skills needed to build the object and order them correctly.

        Reference:
        {description}

        Available skills (name: description):
        {catalog}

        Output a JSON array of objects with "skill" (exact skill name from catalog) and "purpose" (one sentence why).
        Include: geometry creation, materials, lighting, camera placement.
        Always end with add_camera and render_image.
        Only use skill names that EXACTLY match the catalog above.
        Output ONLY the JSON array.
    """).strip()

    result = llm(prompt, 1500)

    # Extract JSON
    start = result.find("[")
    end = result.rfind("]") + 1
    if start == -1 or end == 0:
        log.error(f"No JSON in plan response: {result[:200]}")
        return []

    try:
        return json.loads(result[start:end])
    except Exception as e:
        log.error(f"JSON parse error: {e}")
        return []

# ── Generate code for a gap (no skill match) ─────────────────────────────────
def generate_code(purpose: str, description: str) -> str:
    state = scene_state()
    return strip_fences(llm(textwrap.dedent(f"""
        Write Blender 5.0 bpy Python to: {purpose}
        Reference context: {description[:200]}
        Current scene objects: {state}

        Blender 5.0 rules:
        - primitive_*_add() takes ONLY location= param
        - Always name objects immediately after creation
        - location=(0,0,0) by default
        - No hide_viewport, no hide_render, no zero scale

        Output ONLY Python code.
    """).strip(), 800))

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    if len(sys.argv) < 2:
        print("Usage: python3 bob-ref.py <image_or_description>")
        sys.exit(1)

    path = Path(sys.argv[1])
    desc_file = path.with_suffix(".txt") if path.suffix != ".txt" else path
    if not desc_file.exists():
        log.error(f"Description not found: {desc_file}")
        sys.exit(1)

    description = desc_file.read_text().strip()
    log.info(f"Reference loaded ({len(description)} chars)")
    log.info(f"Skill library: {lib.count()} skills")

    # Plan using skill catalog
    log.info("Planning from skill catalog...")
    plan = plan_from_skills(description)

    if not plan:
        log.error("Planning failed — aborting")
        sys.exit(1)

    log.info(f"Plan ({len(plan)} steps):")
    for i, step in enumerate(plan, 1):
        log.info(f"  {i}. [{step.get('skill','?')}] {step.get('purpose','')[:60]}")

    # Clear scene
    clean()

    # Execute plan
    for step in plan:
        skill_name = step.get("skill", "")
        purpose = step.get("purpose", skill_name)
        log.info(f"── {skill_name}: {purpose[:50]}")

        # Get skill code from library
        import sqlite3
        with sqlite3.connect(lib.db_path) as db:
            row = db.execute("SELECT code FROM skills WHERE name=?", (skill_name,)).fetchone()

        if row:
            log.info(f"  [SKILL] exact match")
            code = row[0]
        else:
            # Semantic search fallback
            results = lib.search(skill_name, limit=1)
            if results and results[0]:
                log.info(f"  [SEARCH] {results[0]['name']}")
                code = results[0]["code"]
            else:
                log.info(f"  [GEN] no match — generating")
                code = generate_code(purpose, description)

        is_geometry = any(k in skill_name for k in ("add_", "create_", "duplicate", "donut", "icing"))
        run_and_verify(skill_name, code, expect_new_object=is_geometry)
        time.sleep(0.3)

    # Final render with correct settings
    log.info("── Final render")
    render_code = textwrap.dedent(f"""
        import bpy, math
        scene = bpy.context.scene
        scene.render.engine = 'CYCLES'
        scene.cycles.device = 'GPU'
        scene.cycles.samples = 128
        # GPU1 only — GPU0 reserved for Qwen
        prefs = bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type = 'CUDA'
        prefs.refresh_devices()
        for i, device in enumerate(prefs.devices):
            device.use = (i == 1)
        scene.render.resolution_x = 960
        scene.render.resolution_y = 720
        scene.render.filepath = '{VIEWPORT_WIN}'
        scene.render.image_settings.file_format = 'PNG'
        # Ensure camera exists
        cam_obj = next((o for o in bpy.data.objects if o.type == 'CAMERA'), None)
        if not cam_obj:
            bpy.ops.object.camera_add(location=(0, -4, 2.5))
            cam_obj = bpy.context.active_object
            cam_obj.rotation_euler = (math.radians(60), 0, 0)
        scene.camera = cam_obj
        # World background
        if scene.world and scene.world.use_nodes:
            bg = scene.world.node_tree.nodes.get("Background")
            if bg:
                bg.inputs["Color"].default_value = (0.9, 0.9, 0.9, 1)
                bg.inputs["Strength"].default_value = 0.4
        bpy.ops.render.render(write_still=True)
        print("rendered")
    """).strip()
    run_and_verify("render", render_code)

    # Save render
    if os.path.exists(VIEWPORT_WSL):
        shutil.copy(VIEWPORT_WSL, RENDER_OUT)
        log.info(f"Saved: {RENDER_OUT}")
    else:
        log.error("No render file found")

    log.info("Done.")

if __name__ == "__main__":
    main()
