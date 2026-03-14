# Bob Architecture Research Report
> Autonomous Blender Agent — Learning from YouTube Tutorials
> 2026-03-01

---

## 1. Transcript Chunking Strategy

**Recommendation: Action-based chunking with semantic fallback.**

| Strategy | Pros | Cons | Verdict |
|----------|------|------|---------|
| Time-based (e.g., 30s windows) | Simple | Cuts mid-action, loses context | ❌ |
| Sentence-based | Clean boundaries | Tutorial narration is messy, sentences ≠ actions | ❌ |
| Action-based (verb detection) | Maps to bpy calls naturally | Requires NLP parsing | ✅ Primary |
| Semantic similarity clustering | Groups related content | Overkill, slow | ⚠️ Fallback |

### Concrete Implementation

```python
# Action-based chunking pipeline
ACTION_VERBS = {
    "select", "add", "delete", "move", "rotate", "scale", "extrude",
    "subdivide", "apply", "set", "change", "create", "duplicate",
    "join", "separate", "unwrap", "bake", "render", "import", "export",
    "grab", "press", "click", "drag", "type", "enter", "tab"
}

def chunk_transcript(segments: list[dict]) -> list[dict]:
    """Chunk VTT segments by detected actions."""
    chunks = []
    current_chunk = {"text": "", "start": 0, "end": 0, "actions": []}
    
    for seg in segments:
        words = seg["text"].lower().split()
        has_action = any(w in ACTION_VERBS for w in words)
        
        # Start new chunk when: new action detected AND current chunk has content
        if has_action and current_chunk["text"] and current_chunk["actions"]:
            chunks.append(current_chunk)
            current_chunk = {"text": "", "start": seg["start"], "end": 0, "actions": []}
        
        current_chunk["text"] += " " + seg["text"]
        current_chunk["end"] = seg["end"]
        if has_action:
            current_chunk["actions"].extend([w for w in words if w in ACTION_VERBS])
    
    if current_chunk["text"]:
        chunks.append(current_chunk)
    
    # Merge tiny chunks (<3s) into previous
    merged = [chunks[0]] if chunks else []
    for c in chunks[1:]:
        if c["end"] - c["start"] < 3.0:
            merged[-1]["text"] += c["text"]
            merged[-1]["end"] = c["end"]
            merged[-1]["actions"].extend(c["actions"])
        else:
            merged.append(c)
    
    return merged
```

**Key insight:** Tutorials narrate in action-result pairs ("now select the cube, and we're going to extrude it upward"). Chunk boundaries should fall between these pairs, not inside them.

**Enhancement:** After initial verb-based chunking, use the LLM to validate/merge:
```
Given these transcript chunks, merge any that describe a single continuous Blender operation.
Return chunk boundaries as index pairs.
```

---

## 2. Working Memory Architecture

**Recommendation: Scene State Graph + Code History Stack.**

Bob needs three memory layers:

### Layer 1: Scene State Graph (what exists now)
```python
@dataclass
class SceneState:
    objects: dict[str, ObjectState]  # name → state
    active_object: str | None
    mode: str  # OBJECT, EDIT, SCULPT
    selected: list[str]
    
@dataclass  
class ObjectState:
    name: str
    type: str  # MESH, LIGHT, CAMERA, CURVE, etc.
    location: tuple[float, float, float]
    rotation: tuple[float, float, float]
    scale: tuple[float, float, float]
    modifiers: list[str]
    materials: list[str]
    vertex_count: int | None
    parent: str | None
    children: list[str]

def capture_scene_state() -> SceneState:
    """Execute via Blender MCP to snapshot current scene."""
    code = """
import bpy, json
state = {"objects": {}, "active_object": None, "mode": bpy.context.mode, "selected": []}
for obj in bpy.data.objects:
    state["objects"][obj.name] = {
        "type": obj.type,
        "location": list(obj.location),
        "rotation": list(obj.rotation_euler),
        "scale": list(obj.scale),
        "modifiers": [m.type for m in obj.modifiers],
        "materials": [m.name for m in obj.data.materials] if hasattr(obj.data, 'materials') else [],
        "parent": obj.parent.name if obj.parent else None
    }
if bpy.context.active_object:
    state["active_object"] = bpy.context.active_object.name
state["selected"] = [o.name for o in bpy.context.selected_objects]
RESULT = json.dumps(state)
"""
    return execute_via_mcp(code)
```

### Layer 2: Code History Stack (what was done)
```python
class CodeHistory:
    def __init__(self):
        self.steps: list[dict] = []  # {code, description, scene_before, scene_after, success}
    
    def push(self, code: str, description: str, scene_before: SceneState, 
             scene_after: SceneState, success: bool):
        self.steps.append({
            "code": code,
            "description": description, 
            "scene_before": scene_before,
            "scene_after": scene_after,
            "success": success,
            "timestamp": time.time()
        })
    
    def get_context_window(self, n=5) -> str:
        """Last N steps as context for the LLM."""
        recent = self.steps[-n:]
        return "\n".join(
            f"Step {i+1}: {s['description']}\n```python\n{s['code']}\n```\nResult: {'✅' if s['success'] else '❌'}"
            for i, s in enumerate(recent)
        )
    
    def rollback(self, steps=1):
        """Undo by re-executing from clean state."""
        # Store rollback point scene state, replay all steps except last N
        pass
```

### Layer 3: LLM Context Prompt
Feed the LLM a compressed state summary each turn:
```
SCENE STATE:
- Objects: Cube (mesh, 8 verts, at origin), Camera, Light
- Active: Cube (OBJECT mode)
- Last 3 actions: [added cube, scaled to 2x, applied subdivision modifier]

CURRENT TASK: "Now extrude the top face upward by 2 units"
```

**Key insight from Voyager:** Keep working memory compact. Don't dump full scene JSON — summarize to what's relevant for the current task.

---

## 3. Self-Correction Loop

**Recommendation: 3-stage loop with max 3 retries, inspired by Self-Refine + Voyager's iterative prompting.**

### The Loop

```
┌─────────────────────────────────────┐
│  1. GENERATE: LLM → bpy code        │
│  2. EXECUTE: Run via Blender MCP     │
│  3. VERIFY: Vision model checks      │
│     ├─ PASS → commit to history      │
│     └─ FAIL → generate feedback      │
│         ├─ retry < 3 → back to 1     │
│         └─ retry ≥ 3 → skip + log    │
└─────────────────────────────────────┘
```

### Implementation

```python
async def execute_step(chunk: dict, scene_state: SceneState, 
                       code_history: CodeHistory, max_retries=3) -> bool:
    
    for attempt in range(max_retries):
        # 1. GENERATE
        prompt = f"""You are a Blender Python (bpy) expert.
Current scene: {scene_state.summary()}
Recent actions: {code_history.get_context_window(3)}
Tutorial instruction: "{chunk['text']}"
{f'Previous attempt failed: {feedback}' if attempt > 0 else ''}

Write bpy Python code to execute this instruction.
Rules:
- Use bpy.ops or direct data manipulation
- Don't import anything except bpy and mathutils
- Handle cases where objects may not exist
- Add error handling with try/except
Output ONLY the Python code block."""

        code = await llm_generate(prompt)
        
        # 2. EXECUTE
        scene_before = await capture_scene_state()
        exec_result = await blender_mcp_execute(code)
        scene_after = await capture_scene_state()
        
        if exec_result.error:
            feedback = f"Execution error: {exec_result.error}"
            continue
        
        # 3. VERIFY (vision)
        screenshot = await blender_mcp_screenshot()
        verification = await vision_verify(
            screenshot=screenshot,
            expected_action=chunk['text'],
            scene_before=scene_before,
            scene_after=scene_after
        )
        
        if verification.passed:
            code_history.push(code, chunk['text'], scene_before, scene_after, True)
            return True
        else:
            feedback = verification.feedback
    
    # Failed after max retries — log and skip
    code_history.push(code, chunk['text'], scene_before, scene_after, False)
    log_failure(chunk, feedback)
    return False
```

### Vision Verification Prompt
```python
async def vision_verify(screenshot, expected_action, scene_before, scene_after):
    prompt = f"""You are verifying whether a Blender action was executed correctly.

Expected action: "{expected_action}"
Scene changes: {diff_scene_states(scene_before, scene_after)}

Look at the screenshot. Did the expected action happen?
Reply with:
- PASS: if the action was clearly executed
- FAIL: <specific description of what's wrong and what should be different>"""
    
    result = await vision_model.analyze(screenshot, prompt)
    return VerificationResult(
        passed="PASS" in result,
        feedback=result if "FAIL" in result else None
    )
```

**Critical insight from research:** LLMs alone cannot reliably self-correct (MIT survey, 2024). External signals are essential. Bob has two strong external signals:
1. **Execution errors** (Python tracebacks) — free and reliable
2. **Vision verification** — catches semantic errors (code ran but did wrong thing)

The combination is what makes this work. Pure LLM self-reflection without these signals degrades performance.

---

## 4. Lessons from Voyager and JARVIS-1

### Voyager Architecture (What Bob Should Borrow)

| Voyager Component | Bob Equivalent | Priority |
|---|---|---|
| **Skill Library** (code indexed by description embedding) | Skill markdown files → upgrade to vector-indexed code snippets | 🔴 HIGH |
| **Iterative Prompting** (env feedback + execution errors + self-verification) | Already doing this — formalize the 3-stage loop above | 🔴 HIGH |
| **Automatic Curriculum** (GPT-4 proposes next task based on current skills) | Not needed yet — tutorials ARE the curriculum | 🟡 MEDIUM |
| **Code as Action Space** (not low-level motor commands) | Already using bpy — correct approach | ✅ DONE |

**Key Voyager patterns to adopt:**

1. **Skill = function with docstring.** Voyager stores skills as JavaScript functions. Bob should store skills as Python functions:
```python
# skills/add_subdivision_surface.py
def add_subdivision_surface(object_name: str, levels: int = 2, render_levels: int = 3):
    """Add a Subdivision Surface modifier to the specified object.
    
    Args:
        object_name: Name of the target object
        levels: Viewport subdivision level (default 2)
        render_levels: Render subdivision level (default 3)
    """
    import bpy
    obj = bpy.data.objects.get(object_name)
    if not obj:
        raise ValueError(f"Object '{object_name}' not found")
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_add(type='SUBSURF')
    mod = obj.modifiers[-1]
    mod.levels = levels
    mod.render_levels = render_levels
```

2. **Embedding-based retrieval.** Index skill descriptions for similarity search when facing new tasks.

3. **Compositional skills.** Complex tutorials compose simpler skills. Bob should detect when a chunk maps to an existing skill and call it instead of generating fresh code.

### JARVIS-1 Architecture (What Bob Should Borrow)

JARVIS-1 adds **multimodal memory** — it stores both text plans AND visual observations.

| JARVIS-1 Component | Bob Equivalent | Priority |
|---|---|---|
| **Multimodal Memory** (text + image pairs) | Store screenshot + code pairs per skill | 🟡 MEDIUM |
| **Self-Instruct** (agent generates own tasks) | Future: Bob watches tutorials, then generates variations | 🟢 LOW |
| **Plan Decomposition** (high-level → sub-plans) | Map tutorial structure to hierarchical skill chains | 🟡 MEDIUM |

**Key JARVIS-1 insight:** Memory improves over time. Early attempts are rough; the agent gets better as its memory grows. Bob should expect the same — first 10 tutorials will be messy, by tutorial 50 the skill library makes everything faster.

---

## 5. Skill Library with RAG

**Recommendation: Yes, absolutely. This is the highest-impact improvement.**

### Architecture

```
┌──────────────────┐     ┌──────────────────┐
│  Tutorial Chunk   │────▶│  Embedding Model  │
│  "extrude top     │     │  (local, e.g.     │
│   face by 2"      │     │   nomic-embed)    │
└──────────────────┘     └────────┬─────────┘
                                  │ query vector
                    ┌─────────────▼──────────────┐
                    │    ChromaDB / SQLite-VSS    │
                    │    Skill Library Index       │
                    │                              │
                    │  "extrude_face" → 0.92 sim   │
                    │  "move_vertices" → 0.71 sim  │
                    └─────────────┬──────────────┘
                                  │ top-3 skills
                    ┌─────────────▼──────────────┐
                    │  LLM Prompt:                 │
                    │  "Here are similar skills    │
                    │   you've learned before..."  │
                    │  → Adapt/compose/generate    │
                    └──────────────────────────────┘
```

### Implementation

```python
import chromadb

class SkillLibrary:
    def __init__(self, path="./skill_library"):
        self.client = chromadb.PersistentClient(path=path)
        self.collection = self.client.get_or_create_collection(
            "blender_skills",
            metadata={"hnsw:space": "cosine"}
        )
    
    def add_skill(self, name: str, description: str, code: str, 
                  tags: list[str] = None):
        self.collection.add(
            ids=[name],
            documents=[description],
            metadatas=[{"code": code, "tags": ",".join(tags or []),
                       "uses": 0, "success_rate": 1.0}]
        )
    
    def retrieve(self, query: str, n=3) -> list[dict]:
        results = self.collection.query(query_texts=[query], n_results=n)
        skills = []
        for i, doc in enumerate(results["documents"][0]):
            meta = results["metadatas"][0][i]
            skills.append({
                "name": results["ids"][0][i],
                "description": doc,
                "code": meta["code"],
                "similarity": 1 - results["distances"][0][i],
                "success_rate": meta["success_rate"]
            })
        return skills
    
    def update_success_rate(self, name: str, succeeded: bool):
        existing = self.collection.get(ids=[name])
        if existing["ids"]:
            meta = existing["metadatas"][0]
            uses = meta.get("uses", 0) + 1
            rate = meta.get("success_rate", 1.0)
            new_rate = (rate * (uses - 1) + (1.0 if succeeded else 0.0)) / uses
            self.collection.update(
                ids=[name],
                metadatas=[{**meta, "uses": uses, "success_rate": new_rate}]
            )
```

### LLM Prompt with Retrieved Skills
```python
def build_prompt_with_skills(chunk_text, retrieved_skills, scene_state, history):
    skills_section = ""
    if retrieved_skills:
        skills_section = "RELEVANT SKILLS FROM LIBRARY:\n"
        for s in retrieved_skills:
            skills_section += f"\n## {s['name']} (similarity: {s['similarity']:.0%})\n"
            skills_section += f"{s['description']}\n```python\n{s['code']}\n```\n"
        skills_section += "\nYou may call these functions directly or adapt them.\n"
    
    return f"""You are a Blender Python expert.
{skills_section}
CURRENT SCENE: {scene_state.summary()}
RECENT HISTORY: {history.get_context_window(3)}
TASK: {chunk_text}

Write bpy code. Prefer reusing/adapting existing skills over writing from scratch."""
```

**Why this matters:** Without RAG, Bob regenerates code for "add subdivision surface" every time it appears in a tutorial. With RAG, by the 3rd tutorial, Bob just calls its proven `add_subdivision_surface()` function. This is exactly how Voyager compounds capabilities.

---

## 6. Handling UI-Only Tutorial Steps

**Problem:** Many tutorials say "click on the Properties panel, go to Modifiers tab, click Add Modifier..." — these are UI interactions, not Python-automatable steps.

**Recommendation: Detect and translate, don't simulate UI.**

### Strategy

```python
UI_PATTERNS = [
    r"click\s+on\s+(the\s+)?(\w+)\s*(panel|tab|menu|button|icon)",
    r"go\s+to\s+(the\s+)?(\w+)\s*(panel|tab|menu|properties)",
    r"press\s+(ctrl|alt|shift)\s*\+?\s*(\w)",
    r"right[\s-]click",
    r"drag\s+(the\s+)?(\w+)",
    r"hover\s+over",
]

# UI → bpy translation map
UI_TO_BPY = {
    "add modifier": "bpy.ops.object.modifier_add(type='{MODIFIER}')",
    "add mesh": "bpy.ops.mesh.primitive_{SHAPE}_add()",
    "delete": "bpy.ops.object.delete()",
    "duplicate": "bpy.ops.object.duplicate_move()",
    "tab into edit mode": "bpy.ops.object.mode_set(mode='EDIT')",
    "properties panel": "# Access via bpy.context.object.{property}",
    "material slot": "bpy.data.materials.new(name='{NAME}')",
}

def classify_chunk(chunk_text: str) -> str:
    """Classify: 'code' (direct bpy), 'ui_translate' (UI→bpy), 'skip' (pure UI navigation)."""
    text_lower = chunk_text.lower()
    
    # Pure navigation with no functional outcome → skip
    if any(phrase in text_lower for phrase in ["let me show you", "as you can see", 
            "over here we have", "on the left side"]):
        return "skip"
    
    # UI action with functional equivalent → translate
    for pattern in UI_PATTERNS:
        if re.search(pattern, text_lower):
            return "ui_translate"
    
    return "code"
```

### LLM Translation Prompt for UI Steps
```
The tutorial says: "Right-click on the cube, go to the shading tab, and set it to smooth shading"

This describes a UI interaction. Translate it to the equivalent bpy Python code.
The functional result is what matters, not the UI path.
```
→ `bpy.ops.object.shade_smooth()`

**Key insight:** 90% of UI instructions in Blender tutorials have direct `bpy.ops` equivalents. The remaining 10% (viewport navigation, panel resizing, preference changes) can be safely skipped because they don't affect the scene.

### Handling Truly Un-automatable Steps
For the ~5% that genuinely can't be automated (e.g., texture painting with a tablet, sculpting with specific brush strokes):
1. Log as `MANUAL_REQUIRED` in the skill file
2. Skip and continue with the next chunk
3. Optionally flag for human review

---

## Recommended Architecture — Full Pipeline

```
YouTube URL
    │
    ▼
┌─────────────┐
│  yt-dlp      │ → video + VTT captions
└──────┬──────┘
       ▼
┌─────────────────┐
│ Action Chunker   │ → action-based segments
└──────┬──────────┘
       ▼
┌─────────────────┐
│ Chunk Classifier │ → code / ui_translate / skip
└──────┬──────────┘
       ▼
┌──────────────────────────────────────────────┐
│  For each executable chunk:                    │
│                                                │
│  1. Capture scene state                        │
│  2. Query skill library (RAG)                  │
│  3. Build prompt (state + history + skills)     │
│  4. LLM generates bpy code                     │
│  5. Execute via Blender MCP                     │
│  6. Capture new scene state                     │
│  7. Vision verify (screenshot + state diff)     │
│  8. If FAIL: retry (max 3) with feedback        │
│  9. If PASS: commit to history, save skill      │
└──────────────────────────────────────────────┘
       ▼
┌─────────────────┐
│ Skill Extraction │ → save verified code as reusable function
└──────┬──────────┘
       ▼
┌─────────────────┐
│ Skill Library    │ → ChromaDB with embeddings
│ (RAG index)      │   for future retrieval
└─────────────────┘
```

---

## Priority Order for Implementation

| # | Improvement | Impact | Effort | Why |
|---|---|---|---|---|
| **1** | Skill Library + RAG | 🔴 Critical | Medium | Compounds capability — every tutorial makes the next one easier. Without this, Bob re-invents the wheel every run. |
| **2** | Self-correction loop (3-stage) | 🔴 Critical | Low | Formalizes what Bob partly does. Adding structured retry with vision feedback is the biggest reliability win. |
| **3** | Scene state tracking | 🔴 Critical | Low | LLM needs context. Blind code generation without knowing what exists = constant errors. |
| **4** | Action-based chunking | 🟡 High | Low | Better chunks → better code. Current time/sentence chunking likely causes many failures. |
| **5** | UI → bpy translation layer | 🟡 High | Low | Unlocks tutorials that mix UI instructions with concepts. Currently these probably fail silently. |
| **6** | Code history context window | 🟡 Medium | Low | Prevents conflicts (e.g., renaming an object that was just created). |
| **7** | Vision-based verification | 🟡 Medium | Medium | Already have Qwen2.5-VL — formalize the verify prompt and pass/fail logic. |
| **8** | Skill composition (calling existing skills) | 🟢 Future | Medium | Once library has 50+ skills, teach LLM to compose them. |
| **9** | Multimodal memory (screenshot + code pairs) | 🟢 Future | Medium | JARVIS-1 style. Store visual examples of successful operations. |
| **10** | Auto-curriculum (generate own practice tasks) | 🟢 Future | High | After learning from 20+ tutorials, Bob generates variations to practice. |

---

## Key Takeaways

1. **Voyager's skill library is the #1 thing to copy.** Executable code indexed by description embedding, retrieved by similarity. This is what makes agents compound instead of plateau.

2. **Self-correction needs external signals.** Pure LLM self-reflection doesn't work reliably (proven by research). Bob's two signals — execution errors and vision verification — are the right approach. Formalize them.

3. **Scene state is the working memory.** Don't try to track everything in the LLM context. Snapshot the Blender scene, diff before/after, feed the diff to the LLM.

4. **Action-based chunking > time-based.** Tutorial narration maps to Blender operations, not arbitrary time windows. Chunk at action boundaries.

5. **UI instructions are translatable.** 90%+ of "click here, go there" instructions have direct `bpy.ops` equivalents. Build the translation layer.

6. **Start messy, improve with scale.** Like JARVIS-1, Bob will be bad at first. The skill library and success rate tracking create a flywheel — each tutorial adds knowledge that makes the next one more reliable.
