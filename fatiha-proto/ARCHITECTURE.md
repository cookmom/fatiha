<!-- بسم الله الرحمن الرحيم -->
# fatiha.app — Creative AI Pipeline Architecture

## Vision
114 surahs × unique generative art pieces, each themed to the surah's meaning.
Human-in-the-loop reinforcement learning for artistic taste.
Voice-reactive real-time rendering during Quran recitation.

## Pipeline Components

### 1. Gallery Webapp (GitHub Pages + Supabase)
- Every iteration published as an image
- Rating system (1-5 stars)
- Reference image drop zone ("more like this")
- URL input for inspiration links
- Notes field per iteration
- Surah/verse tagging
- Live at: cookmom.github.io/fatiha-gallery/

### 2. Generator (Qwen 3.5 local / Opus)
- Writes p5.brush HTML painting code
- Reads accumulated taste model before generating
- Proposes surah themes (visual metaphor, palette, geometry)
- Zero API cost on Qwen local

### 3. Renderer (GPU Chrome, RTX A6000)
- Headless Chrome with ANGLE → D3D12 → NVIDIA
- render.sh: file → screenshot in 25 seconds
- Captures at 1080x1920 (9:16 portrait)

### 4. Critic (Vision model)
- Evaluates each render against:
  - Paper coverage ratio (target: 30-40% bare)
  - Color saturation/variance
  - Stroke weight variance (pressure variation)
  - Composition balance
  - Overall aesthetic score
- Reads YOUR previous ratings to calibrate

### 5. Feedback DB (Supabase)
Tables:
- `iterations` — id, surah, verse, html_url, image_url, auto_score, human_score, created_at
- `feedback` — iteration_id, rating (1-5), notes, reference_image_url, reference_url
- `taste_rules` — rule text, weight, source (human/learned), created_at
- `surah_themes` — surah_number, name, metaphor, palette, geometry, status (proposed/approved)

### 6. Taste Model (evolving JSON)
```json
{
  "rules": [
    {"rule": "no brown", "weight": 1.0, "source": "human"},
    {"rule": "paper must breathe (30-40% bare)", "weight": 0.9, "source": "learned"},
    {"rule": "pressure variation on all strokes", "weight": 0.8, "source": "human"},
    {"rule": "watercolor fills should have varied opacity", "weight": 0.7, "source": "human"}
  ],
  "palette_preferences": {
    "love": ["lapis blue", "terre verte", "shell gold", "vermillion", "rose"],
    "hate": ["brown", "olive", "muddy tones"]
  },
  "reference_images": [],
  "high_rated": [],
  "low_rated": []
}
```

### 7. Surah Theme Engine
For each of 114 surahs:
- Visual metaphor (door, garden, ocean, mountain, battle, mercy, light)
- Color palette (derived from emotional arc)
- Geometric structure (which Islamic symmetry system)
- Approved by human before generation starts

## Loop Cycle
1. Generator reads taste model + surah theme
2. Writes p5.brush HTML
3. Renderer screenshots
4. Critic scores automatically
5. Published to gallery
6. Human rates when available (async)
7. Ratings feed back to taste model
8. Next iteration uses updated taste
9. Repeat

## Tech Stack
- p5.brush v2.0.2-beta (WEBGL, all brush types)
- Mixbox (pigment-accurate color mixing)
- Supabase (feedback DB)
- GitHub Pages (gallery)
- Qwen 3.5 35B (local generator, zero cost)
- GPU Chrome (renderer)
- Islamic art skills (calligraphy, painting, geometry)
