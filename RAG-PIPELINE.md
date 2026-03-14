# 🧠 Bob's RAG Knowledge Pipeline

> **This is the core learning architecture for Bob (and any future AI agent that needs to learn a complex creative tool).**
> Built March 1, 2026. Generalizes beyond Blender to any domain with tutorials + docs.

---

## The Problem It Solves

Bob has executable skills (bpy code) but no *reasoning* about when or why to use them.
Give Bob "make icing drips" and he'd match it to a random unrelated skill.

The fix: **three knowledge layers** that together cover the full gap between a human description and executable code.

---

## The Three Layers

```
Human description: "add icing drips to the donut"
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  LAYER 1: Andrew's Transcripts  (WHY + WORKFLOW)    │
│  "duplicate the mesh, delete bottom verts,          │
│   extrude down, taper to a point"                   │
│  → gives Bob the MENTAL MODEL                       │
│  Table: transcript_chunks  (chef-curated)           │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  LAYER 2: Blender Docs  (TECHNICAL CONTEXT)         │
│  "Solidify modifier offset direction,               │
│   vertex group masking, extrude operator params"    │
│  → gives Bob the PARAMETER KNOWLEDGE                │
│  Table: doc_chunks  (Brett-scraped)                 │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  LAYER 3: Skill Library  (EXECUTABLE CODE)          │
│  actual bpy Python ready to run in Blender          │
│  → gives Bob the EXECUTION                          │
│  Table: skills  (Bob-verified, Brett-curated)       │
└─────────────────────────────────────────────────────┘
        │
        ▼
   Qwen generates step with all 3 layers as context
        │
        ▼
   Blender MCP executes → scene verification → render
```

---

## Files

| File | Role |
|------|------|
| `tools/chef-transcripts.py` | Chef reads VTT transcripts → classifies technique segments → embeds → stores in `transcript_chunks` |
| `tools/bob-skills.py` | SkillLibrary class — `search()`, `semantic_search()`, `search_transcripts()` |
| `memory/bob-skills.db` | SQLite DB with all 3 tables: `skills`, `doc_chunks`, `transcript_chunks` |
| `tools/bob-ref.py` | Bob's reference-driven agent — queries all 3 layers when planning steps |

---

## DB Schema

```sql
-- Layer 3: executable skills
skills (id, name, description, tags JSON, code, use_count, embedding BLOB)

-- Layer 2: Blender docs
doc_chunks (id, url, section, chunk, skill_tags, embedding BLOB)

-- Layer 1: Andrew Price transcripts (chef-curated)
transcript_chunks (
  id, video, domain, summary,
  skill_tags JSON,
  bob_skills JSON,       -- which Layer 3 skills this connects to
  bridge_insight TEXT,   -- the conceptual connection Andrew is making
  raw_chunk TEXT,
  embedding BLOB         -- nomic-embed-text via Ollama
)
```

---

## How to Query (in bob-ref.py or any agent)

```python
from tools.bob_skills import SkillLibrary
lib = SkillLibrary()

# Layer 1 — workflow intuition
transcripts = lib.search_transcripts("add icing drips", limit=2)
# → [{"summary": "...", "bridge_insight": "...", "bob_skills": [...]}]

# Layer 2 — technical context (via doc_chunks, same cosine similarity)
# (Brett's search_docs() method — add to bob-skills.py when ready)

# Layer 3 — executable code
skills = lib.semantic_search("extrude vertices downward", limit=3)
# → [{"name": "extrude", "code": "import bpy..."}]
```

---

## How to Expand This (for any new domain)

This architecture is **fully generalizable**. To teach Bob a new tool:

1. **Find the tutorial creator** (Andrew Price = Blender Guru equivalent)
2. **Pull their transcripts** via yt-dlp: `yt-dlp --write-auto-sub --sub-lang en --sub-format vtt --skip-download`
3. **Run chef-transcripts.py** (or adapt it) — chef classifies, identifies technique segments, infers connections
4. **Find the official docs** — point Brett's doc scraper at them
5. **Build the skill library** — either from running tutorials (Bob approach) or Brett curating from training data
6. **Wire into the agent's planner** — inject all 3 layers as context before code generation

### Domains this could cover next:
- **TouchDesigner** (Andrew's equivalent: bileam tschepe / elekktronaut)
- **Unreal Engine** (VP workflows, nDisplay, LED volume)
- **Ableton Live** (generative MIDI, Euclidean rhythms)
- **Geometry Nodes** (already partially in Blender layer)
- **GLSL/ShaderToy** (shader techniques)

---

## Current Status (as of 2026-03-01)

| Layer | Status | Count |
|-------|--------|-------|
| Skills (Layer 3) | ✅ Done | 239 skills |
| Docs (Layer 2) | 🟡 Brett scraping | ~200 chunks target |
| Transcripts (Layer 1) | 🟡 Chef processing | 11 videos, Qwen classifying |

Embedding model: `nomic-embed-text` via Ollama GPU0 (port 11434)
Similarity threshold: 0.4 (transcripts), 0.5 (skills)

---

## Why Chef Curates Transcripts (Not Brett)

Transcript interpretation requires **judgment**:
- Distinguishing technique explanation from banter/sponsors/intros
- Inferring the *conceptual connection* Andrew is building ("bridge_insight")
- Mapping to Bob's skill vocabulary
- Classifying domain correctly

Brett does mechanical ingestion (scrape → chunk → embed). Chef does the analytical layer.

---

> **This is the pattern.** Whenever Bob (or any agent) needs to learn something new:
> tutorials → chef interprets → docs → Brett ingests → skills → Bob executes.
> The RAG is the connective tissue.
