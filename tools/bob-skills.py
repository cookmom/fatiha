#!/usr/bin/env python3
"""
Bob Skill Library — verified bpy code snippets, searchable by description.
"""
import sqlite3, json, re, os, logging
from pathlib import Path

import numpy as np
import requests as _requests

_embed_log = logging.getLogger("bob-skills-embed")
_embed_log.addHandler(logging.FileHandler("/tmp/brett-embed.log"))
_embed_log.setLevel(logging.INFO)


def _get_embedding(text: str) -> list[float] | None:
    """Get embedding from Ollama nomic-embed-text."""
    try:
        resp = _requests.post("http://localhost:11434/api/embed", json={
            "model": "nomic-embed-text",
            "input": text
        }, timeout=30)
        resp.raise_for_status()
        return resp.json()["embeddings"][0]
    except Exception as e:
        _embed_log.warning(f"Embedding failed for '{text[:60]}': {e}")
        return None


def _cosine(a, b):
    a, b = np.array(a), np.array(b)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    if norm == 0:
        return 0.0
    return float(np.dot(a, b) / norm)

DB_PATH = "/home/openclaw-agent/.openclaw/workspace/memory/bob-skills.db"


class SkillLibrary:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as db:
            db.execute("""
                CREATE TABLE IF NOT EXISTS skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    tags TEXT NOT NULL,
                    code TEXT NOT NULL,
                    verified INTEGER DEFAULT 1,
                    use_count INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT (datetime('now'))
                )
            """)
            db.execute("CREATE INDEX IF NOT EXISTS idx_tags ON skills(tags)")
            # Add embedding column if not exists
            cols = [r[1] for r in db.execute("PRAGMA table_info(skills)").fetchall()]
            if "embedding" not in cols:
                db.execute("ALTER TABLE skills ADD COLUMN embedding BLOB")
            db.commit()

    def add_skill(self, name: str, description: str, tags: list[str], code: str, verified: bool = True) -> int:
        """Add or update a skill. Returns skill id."""
        embed_text = f"{name} {description} {' '.join(tags)}"
        emb = _get_embedding(embed_text)
        emb_blob = json.dumps(emb).encode() if emb else None
        with sqlite3.connect(self.db_path) as db:
            existing = db.execute("SELECT id FROM skills WHERE name=?", (name,)).fetchone()
            if existing:
                db.execute("UPDATE skills SET description=?, tags=?, code=?, verified=?, embedding=? WHERE name=?",
                          (description, json.dumps(tags), code, int(verified), emb_blob, name))
                return existing[0]
            else:
                cur = db.execute("INSERT INTO skills (name, description, tags, code, verified, embedding) VALUES (?,?,?,?,?,?)",
                                (name, description, json.dumps(tags), code, int(verified), emb_blob))
                db.commit()
                return cur.lastrowid

    def semantic_search(self, query: str, limit: int = 5) -> list[dict]:
        """Semantic search using embeddings. Returns top matches with similarity scores."""
        q_emb = _get_embedding(query)
        if q_emb is None:
            return []
        with sqlite3.connect(self.db_path) as db:
            rows = db.execute("SELECT id, name, description, tags, code, embedding FROM skills WHERE verified=1 AND embedding IS NOT NULL").fetchall()
        scored = []
        for id_, name, desc, tags_json, code, emb_blob in rows:
            try:
                skill_emb = json.loads(emb_blob)
            except (TypeError, json.JSONDecodeError):
                continue
            sim = _cosine(q_emb, skill_emb)
            scored.append((sim, {"id": id_, "name": name, "description": desc,
                                  "tags": json.loads(tags_json), "code": code, "similarity": sim}))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [s[1] for s in scored[:limit]]

    def _keyword_search(self, query: str, limit: int = 3) -> list[dict]:
        """Keyword search across name, description, tags. Returns top matches."""
        keywords = re.findall(r'\w+', query.lower())
        with sqlite3.connect(self.db_path) as db:
            rows = db.execute("SELECT id, name, description, tags, code, use_count FROM skills WHERE verified=1").fetchall()
        scored = []
        for row in rows:
            id_, name, desc, tags_json, code, use_count = row
            text = f"{name} {desc} {tags_json}".lower()
            score = sum(1 for kw in keywords if kw in text) + (use_count * 0.1)
            if score > 0:
                scored.append((score, {"id": id_, "name": name, "description": desc,
                                       "tags": json.loads(tags_json), "code": code}))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [s[1] for s in scored[:limit]]

    def search(self, query: str, limit: int = 3) -> list[dict]:
        """Search skills: semantic first, keyword fallback."""
        sem_results = self.semantic_search(query, limit=limit)
        # Filter to similarity > 0.5
        good = [r for r in sem_results if r.get("similarity", 0) > 0.5]
        if good:
            _embed_log.info(f"search('{query}'): semantic hit, top={good[0]['name']} sim={good[0]['similarity']:.3f}")
            # Strip similarity key for backward compat
            for r in good:
                r.pop("similarity", None)
            return good[:limit]
        _embed_log.info(f"search('{query}'): falling back to keyword")
        return self._keyword_search(query, limit)

    def record_use(self, skill_id: int):
        """Increment use count for a skill."""
        with sqlite3.connect(self.db_path) as db:
            db.execute("UPDATE skills SET use_count = use_count + 1 WHERE id=?", (skill_id,))
            db.commit()

    def embed_all(self):
        """Backfill embeddings for any skills missing them."""
        with sqlite3.connect(self.db_path) as db:
            rows = db.execute("SELECT id, name, description, tags FROM skills WHERE embedding IS NULL").fetchall()
        _embed_log.info(f"embed_all: {len(rows)} skills need embeddings")
        for id_, name, desc, tags_json in rows:
            tags = json.loads(tags_json) if tags_json else []
            text = f"{name} {desc} {' '.join(tags)}"
            emb = _get_embedding(text)
            if emb:
                with sqlite3.connect(self.db_path) as db:
                    db.execute("UPDATE skills SET embedding=? WHERE id=?", (json.dumps(emb).encode(), id_))
                    db.commit()
                _embed_log.info(f"  embedded: {name}")
            else:
                _embed_log.warning(f"  FAILED: {name}")

    def count(self) -> int:
        with sqlite3.connect(self.db_path) as db:
            return db.execute("SELECT COUNT(*) FROM skills").fetchone()[0]

    def search_transcripts(self, query: str, limit: int = 3) -> list[dict]:
        """Semantic search over Andrew Price transcript chunks."""
        import json as _json
        import math

        vec = self._embed(query)
        with sqlite3.connect(self.db_path) as db:
            # Check table exists
            tbl = db.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='transcript_chunks'"
            ).fetchone()
            if not tbl:
                return []
            rows = db.execute(
                "SELECT video, domain, summary, bob_skills, bridge_insight, embedding FROM transcript_chunks"
            ).fetchall()

        if not rows:
            return []

        scored = []
        for row in rows:
            video, domain, summary, bob_skills_raw, bridge, emb_blob = row
            if not emb_blob or not vec:
                continue
            try:
                row_vec = _json.loads(emb_blob)
                dot = sum(a * b for a, b in zip(vec, row_vec))
                mag_a = math.sqrt(sum(a * a for a in vec))
                mag_b = math.sqrt(sum(b * b for b in row_vec))
                sim = dot / (mag_a * mag_b + 1e-9)
                scored.append((sim, {
                    "video": video,
                    "domain": domain,
                    "summary": summary,
                    "bob_skills": _json.loads(bob_skills_raw or "[]"),
                    "bridge_insight": bridge,
                    "similarity": round(sim, 3)
                }))
            except Exception:
                continue

        scored.sort(key=lambda x: x[0], reverse=True)
        return [r for _, r in scored[:limit] if _ > 0.4]

    def list_all(self) -> list[dict]:
        with sqlite3.connect(self.db_path) as db:
            rows = db.execute("SELECT name, description, tags, use_count FROM skills ORDER BY use_count DESC").fetchall()
        return [{"name": r[0], "description": r[1], "tags": json.loads(r[2]), "use_count": r[3]} for r in rows]


def format_skills_for_prompt(skills: list[dict]) -> str:
    """Format skill results for injecting into LLM prompts."""
    if not skills:
        return "No relevant skills found in library."
    lines = ["RELEVANT SKILLS FROM LIBRARY:"]
    for s in skills:
        lines.append(f"--- {s['name']} ---")
        lines.append(f"Description: {s['description']}")
        lines.append("Code:")
        lines.append(s['code'])
        lines.append("---")
    return "\n".join(lines)


def seed_library(lib: SkillLibrary):
    """Populate the library with verified Blender 5.0 skills."""
    seeds = [
        ("add_torus", "Add a torus mesh (donut shape)", ["mesh", "primitive", "torus", "donut"],
         'import bpy\nbpy.ops.object.select_all(action=\'DESELECT\')\nbpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))\nobj = bpy.context.active_object\nobj.name = "Donut"'),

        ("add_cylinder", "Add a cylinder mesh", ["mesh", "primitive", "cylinder"],
         "import bpy\nbpy.ops.object.select_all(action='DESELECT')\nbpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 0))\nobj = bpy.context.active_object"),

        ("add_subdivision", "Add subdivision surface modifier to smooth mesh", ["modifier", "subdivision", "smooth", "subsurf"],
         "import bpy\nobj = bpy.context.active_object\nif obj and obj.type == 'MESH':\n    mod = obj.modifiers.new('Subdiv', 'SUBSURF')\n    mod.levels = 2\n    mod.render_levels = 3"),

        ("add_solidify", "Add solidify modifier to give mesh thickness", ["modifier", "solidify", "thickness"],
         "import bpy\nobj = bpy.context.active_object\nif obj and obj.type == 'MESH':\n    mod = obj.modifiers.new('Solidify', 'SOLIDIFY')\n    mod.thickness = 0.04\n    mod.offset = -1"),

        ("set_material_color", "Create and assign a Principled BSDF material with a color", ["material", "color", "principled", "shader"],
         'import bpy\nobj = bpy.context.active_object\nif obj and obj.type == \'MESH\':\n    mat = bpy.data.materials.new(name="Material")\n    mat.use_nodes = True\n    bsdf = mat.node_tree.nodes["Principled BSDF"]\n    bsdf.inputs["Base Color"].default_value = (0.8, 0.4, 0.2, 1.0)\n    bsdf.inputs["Roughness"].default_value = 0.5\n    obj.data.materials.clear()\n    obj.data.materials.append(mat)'),

        ("enter_edit_mode", "Enter edit mode on active object", ["edit mode", "mesh editing"],
         "import bpy\nobj = bpy.context.active_object\nif obj:\n    bpy.context.view_layer.objects.active = obj\n    bpy.ops.object.mode_set(mode='EDIT')"),

        ("exit_edit_mode", "Exit edit mode back to object mode", ["edit mode", "object mode"],
         "import bpy\nbpy.ops.object.mode_set(mode='OBJECT')"),

        ("select_all_vertices", "Select all vertices in edit mode", ["edit mode", "select", "vertices"],
         "import bpy\nbpy.ops.mesh.select_all(action='SELECT')"),

        ("shade_smooth", "Apply smooth shading to mesh", ["shading", "smooth", "normals"],
         "import bpy\nobj = bpy.context.active_object\nif obj and obj.type == 'MESH':\n    bpy.ops.object.shade_smooth()"),

        ("add_loop_cut", "Add a loop cut to mesh in edit mode", ["edit mode", "loop cut", "edge"],
         "import bpy\nbpy.ops.object.mode_set(mode='EDIT')\nbpy.ops.mesh.loopcut(number_cuts=1, smoothness=0)\nbpy.ops.object.mode_set(mode='OBJECT')"),

        ("add_particle_sprinkles", "Add particle system with sprinkle instances", ["particles", "sprinkles", "instancing", "donut"],
         'import bpy\nobj = bpy.data.objects.get("Icing") or bpy.context.active_object\nif obj:\n    ps_mod = obj.modifiers.new("Sprinkles", "PARTICLE_SYSTEM")\n    pset = ps_mod.particle_system.settings\n    pset.count = 80\n    pset.emit_from = "FACE"\n    pset.use_emit_random = True\n    pset.render_type = "OBJECT"\n    bpy.ops.object.select_all(action=\'DESELECT\')\n    bpy.ops.mesh.primitive_cylinder_add(location=(50, 0, 0))\n    sprinkle = bpy.context.active_object\n    sprinkle.name = "Sprinkle"\n    sprinkle.scale = (0.03, 0.03, 0.15)\n    pset.instance_object = sprinkle'),

        ("unwrap_uv", "Smart UV unwrap the active object", ["uv", "unwrap", "texture"],
         "import bpy\nobj = bpy.context.active_object\nif obj and obj.type == 'MESH':\n    bpy.ops.object.mode_set(mode='EDIT')\n    bpy.ops.mesh.select_all(action='SELECT')\n    bpy.ops.uv.smart_project()\n    bpy.ops.object.mode_set(mode='OBJECT')"),
    ]

    for name, desc, tags, code in seeds:
        lib.add_skill(name, desc, tags, code)


if __name__ == "__main__":
    lib = SkillLibrary()
    seed_library(lib)
    print(f"Skill library ready: {lib.count()} skills")
    # Test search
    results = lib.search("add donut torus shape")
    for r in results:
        print(f"  - {r['name']}: {r['description']}")
