#!/usr/bin/env python3
"""
chef-transcripts.py — Andrew Price transcript interpreter.

Chef reads each VTT transcript, strips filler, classifies technique segments,
infers skill connections, and stores structured chunks with embeddings in
bob-skills.db (table: transcript_chunks).

Usage: python3 chef-transcripts.py
"""

import os
import re
import json
import sqlite3
import requests
import time
from pathlib import Path

TRANSCRIPT_DIR = Path("/tmp/andrew-transcripts")
DB_PATH = Path("/home/openclaw-agent/.openclaw/workspace/memory/bob-skills.db")
OLLAMA_URL = "http://localhost:11434"
LOG_PATH = Path("/tmp/chef-transcripts.log")
REPORT_PATH = Path("/tmp/chef-transcripts-report.md")

# Domains Bob understands
DOMAINS = [
    "geometry", "modelling", "sculpting", "materials", "shading",
    "texturing", "lighting", "rendering", "particles", "geometry_nodes",
    "animation", "compositing", "workflow", "optimisation"
]

# Filler patterns to strip
FILLER_RE = re.compile(
    r"\b(um|uh|like|you know|sort of|kind of|basically|literally|actually|obviously|"
    r"right\?|alright|okay so|so yeah|anyway|let me know in the comments|"
    r"subscribe|patreon|poliigon|blenderguru\.com|check out|affiliate)\b",
    re.IGNORECASE
)

TIMESTAMP_RE = re.compile(r"^\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}")
TAG_RE = re.compile(r"<[^>]+>")


def log(msg):
    line = f"[CHEF] {msg}\n"
    print(line, end="")
    with open(LOG_PATH, "a") as f:
        f.write(line)


def parse_vtt(path: Path) -> str:
    """Extract clean text from VTT, dedup consecutive duplicate lines."""
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    seen = set()
    text_lines = []
    for line in lines:
        if TIMESTAMP_RE.match(line) or line.strip() in ("WEBVTT", ""):
            continue
        clean = TAG_RE.sub("", line).strip()
        if not clean or clean in seen:
            continue
        seen.add(clean)
        text_lines.append(clean)
    return " ".join(text_lines)


def chunk_text(text: str, chunk_size: int = 600, overlap: int = 80) -> list[str]:
    """Split text into overlapping word-count chunks."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        if len(chunk) > 80:  # skip tiny trailing chunks
            chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def qwen(prompt: str, system: str = "") -> str:
    """Call Qwen 3.5 via Ollama chat API."""
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    resp = requests.post(
        f"{OLLAMA_URL}/api/chat",
        json={"model": "qwen3.5:35b-a3b", "messages": messages, "stream": False,
              "options": {"temperature": 0.3, "num_predict": 512}},
        timeout=120
    )
    return resp.json()["message"]["content"].strip()


def classify_chunk(video_name: str, chunk: str) -> dict | None:
    """
    Chef interprets a transcript chunk:
    - Is it a technique explanation? (not banter/sponsor/intro)
    - What domain(s)?
    - What is Andrew actually teaching here? (plain English summary)
    - What Bob skills does this connect to?
    - What's the inferred "bridge" — the conceptual insight?
    Returns None if chunk has no technique value.
    """
    system = (
        "You are a Blender 3D expert and educator. You read transcript excerpts from "
        "Andrew Price (Blender Guru) and classify whether they contain actionable technique "
        "knowledge. Be strict — skip banter, intros, sponsor mentions, and vague praise."
    )
    prompt = f"""VIDEO: {video_name}

TRANSCRIPT CHUNK:
{chunk[:1200]}

Answer in JSON only (no markdown):
{{
  "is_technique": true/false,
  "summary": "1-2 sentence plain English summary of what is being taught",
  "domain": "one of: {', '.join(DOMAINS)}",
  "skill_tags": ["tag1", "tag2", ...],
  "bob_skills": ["closest Bob skill names from: add_mesh, apply_modifier, set_material, add_light, add_camera, bevel, subdivide, sculpt_mode, particle_system, geometry_nodes, uv_unwrap, texture_paint, render_settings, shade_smooth, extrude, loop_cut, proportional_edit, solidify, shrinkwrap, join_objects"],
  "bridge_insight": "The conceptual connection Andrew is making — why this matters, what mental model it builds"
}}"""

    try:
        raw = qwen(prompt, system)
        # Extract JSON
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if not match:
            return None
        data = json.loads(match.group())
        if not data.get("is_technique"):
            return None
        if not data.get("summary") or len(data["summary"]) < 20:
            return None
        return data
    except Exception as e:
        log(f"classify error: {e}")
        return None


def embed(text: str) -> list[float] | None:
    """Get nomic-embed-text embedding."""
    try:
        resp = requests.post(
            f"{OLLAMA_URL}/api/embed",
            json={"model": "nomic-embed-text", "input": text},
            timeout=30
        )
        return resp.json()["embeddings"][0]
    except Exception as e:
        log(f"embed error: {e}")
        return None


def init_db(conn: sqlite3.Connection):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS transcript_chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video TEXT NOT NULL,
            domain TEXT,
            summary TEXT,
            skill_tags TEXT,
            bob_skills TEXT,
            bridge_insight TEXT,
            raw_chunk TEXT,
            embedding BLOB
        )
    """)
    conn.commit()


def already_processed(conn: sqlite3.Connection, video: str) -> bool:
    row = conn.execute(
        "SELECT COUNT(*) FROM transcript_chunks WHERE video=?", (video,)
    ).fetchone()
    return row[0] > 0


def main():
    LOG_PATH.write_text("")  # clear log

    conn = sqlite3.connect(DB_PATH)
    init_db(conn)

    vtt_files = sorted(TRANSCRIPT_DIR.glob("*.vtt"))
    log(f"Found {len(vtt_files)} transcripts")

    total_chunks = 0
    total_kept = 0
    results = {}

    for vtt in vtt_files:
        video_name = vtt.stem.replace(".en", "")

        if already_processed(conn, video_name):
            log(f"SKIP {video_name} — already in DB")
            continue

        log(f"\n── Processing: {video_name} ──")
        raw_text = parse_vtt(vtt)
        log(f"  Raw text: {len(raw_text)} chars")

        chunks = chunk_text(raw_text, chunk_size=500, overlap=60)
        log(f"  Chunks: {len(chunks)}")
        total_chunks += len(chunks)

        kept = 0
        for i, chunk in enumerate(chunks):
            log(f"  Chunk {i+1}/{len(chunks)}...")
            classified = classify_chunk(video_name, chunk)
            if not classified:
                continue

            # Embed: summary + bridge_insight (the semantic-rich part)
            embed_text = f"{classified['summary']} {classified.get('bridge_insight', '')}"
            vec = embed(embed_text)
            vec_blob = json.dumps(vec).encode() if vec else None

            conn.execute("""
                INSERT INTO transcript_chunks
                  (video, domain, summary, skill_tags, bob_skills, bridge_insight, raw_chunk, embedding)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                video_name,
                classified.get("domain", ""),
                classified.get("summary", ""),
                json.dumps(classified.get("skill_tags", [])),
                json.dumps(classified.get("bob_skills", [])),
                classified.get("bridge_insight", ""),
                chunk[:800],
                vec_blob
            ))
            conn.commit()
            kept += 1
            total_kept += 1
            log(f"    ✓ [{classified['domain']}] {classified['summary'][:80]}")

        results[video_name] = {"chunks": len(chunks), "kept": kept}
        log(f"  → Kept {kept}/{len(chunks)} chunks")

    conn.close()

    # Write report
    report = f"""# Andrew Price Transcript Report
Generated: {time.strftime('%Y-%m-%d %H:%M PST')}

## Summary
- Transcripts processed: {len(vtt_files)}
- Total chunks evaluated: {total_chunks}
- Technique chunks stored: {total_kept}

## Per-Video Breakdown
"""
    for name, stats in results.items():
        report += f"- **{name}**: {stats['kept']}/{stats['chunks']} chunks kept\n"

    report += """
## Usage
Bob's planner queries `transcript_chunks` via semantic search:
```python
lib.search_transcripts("add icing drips to donut")
# Returns: summary + bridge_insight + bob_skills suggestions
```
"""
    REPORT_PATH.write_text(report)
    log(f"\nDone. {total_kept} chunks stored. Report: {REPORT_PATH}")


if __name__ == "__main__":
    main()
