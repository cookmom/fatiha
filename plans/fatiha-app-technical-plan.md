# fatiha.app — Technical Plan
## Voice-Reactive Procedural Islamic Calligraphy

*"You recite. The art reveals itself."*

---

## Concept
Real-time Quran recitation drives procedural Islamic calligraphy that builds stroke by stroke. Each verse/word maps to a calligraphic element in a larger composition. On surah completion, the full piece reveals itself — the reciter doesn't know the final shape until they finish.

Different surah = different compositional form (tulip, mihrab, geometric rosette, etc.)

## Core Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Voice Input | Tarteel AI API | Real-time Quran speech recognition, verse tracking |
| Stroke Engine | p5.brush (acamposuribe/p5.brush) | Brush rendering, ink effects, pressure, bleed |
| Stroke Brain | Custom fine-tuned model | Arabic text → stroke sequences (bezier + pressure + order) |
| Renderer | p5.js + WebGPU (future) | Canvas rendering, progressive reveal |
| Audio | Web Audio API | Optional: ambient/generative audio response to recitation |

## Phase 1 — Proof of Concept (p5.brush + hand-crafted paths)
**Goal:** Al-Fatiha recitation → calligraphic tulip reveals stroke by stroke
**Effort:** 2-4 weeks
**No ML required**

- Fork p5.brush, customize brush presets for calligraphic feel
- Hand-craft stroke paths for Al-Fatiha (7 ayat = 7 stroke groups)
- Map Tarteel verse detection → trigger next stroke group
- Progressive reveal animation (Anderson Mancini light-painting style)
- Ink effects: edge erosion, paint drying (IOivm reference)
- Final reveal: completed calligraphic piece fades in with flourish
- Ship as web demo at fatiha.app

### p5.brush Customization
- Calligraphic pressure curve (thick→thin like qalam)
- Ink bleed/erosion matching traditional paper absorption
- Gold/lapis lazuli color palette (illuminated manuscript aesthetic)
- Stroke speed linked to recitation pace

## Phase 2 — Stroke Dataset (digitize master calligraphy)
**Goal:** Build training data from existing Islamic calligraphy
**Effort:** 4-8 weeks

### Data Sources
- **Museum collections**: Met, British Museum, Topkapi Palace (high-res digitized manuscripts)
- **Existing ML datasets**: KHATT (Arabic handwriting), IFN/ENIT (Tunisian city names), AHDB (Arabic handwriting DB)
- **Calligraphy manuals**: Proportion rules documented in dots (nuqta system)
- **Style-specific**: Thuluth, Naskh, Diwani, Kufic — each is a distinct training target

### Digitization Pipeline
1. High-res scan → vectorize using potrace or custom CNN
2. Extract stroke order from temporal analysis (thick→thin = stroke direction)
3. Convert to bezier curve sequences with pressure metadata
4. Label: { arabic_text, style, stroke_sequences[], pressure[], timing[] }
5. Store in structured format (JSON or protobuf)

### Target Dataset Size
- 5,000-10,000 labeled stroke sequences across 4 styles
- Focus on individual letters first, then ligatures, then full words
- Al-Fatiha fully annotated as validation set

## Phase 3 — Stroke Prediction Model
**Goal:** Input Arabic text → output stroke sequences
**Effort:** 8-12 weeks
**Hardware:** Dual RTX A6000 (96GB VRAM) — all local training

### Architecture Options

**Option A: Sequence-to-Sequence (Transformer)**
- Encoder: Arabic text tokenizer (character-level for calligraphic control)
- Decoder: Autoregressive stroke prediction (x, y, pressure, pen_up/down)
- Similar to Sketch-RNN but with Transformer backbone
- Advantage: proven architecture, good at sequential generation
- Model size: ~200M params (fits easily on A6000)

**Option B: Diffusion on Stroke Space**
- Diffuse in stroke-sequence space, not pixel space
- Advantage: better diversity, can generate variations
- Disadvantage: slower inference, harder to control

**Option C: Fine-tune Existing**
- Start from a pre-trained handwriting model
- Fine-tune on Islamic calligraphy dataset
- Fastest path but least control over style

### Recommended: Option A (Transformer seq2seq)
- Most controllable for a devotional product (every letter matters)
- Deterministic mode for accuracy, sampling mode for artistic variation
- Can condition on style (Thuluth vs Naskh vs Diwani)
- Real-time inference feasible (~50ms per stroke on A6000)

### Training Plan
1. Pre-train on general Arabic handwriting (KHATT + AHDB)
2. Fine-tune on Islamic calligraphy dataset (Phase 2 output)
3. Style-conditioned: add style token to encoder input
4. Evaluate: visual quality (human judges) + text accuracy (OCR verification)
5. Optimize for real-time inference (ONNX export, quantization)

## Phase 4 — Real-Time Voice Integration
**Goal:** Live recitation drives model in real-time
**Effort:** 4-6 weeks

### Tarteel AI Integration
- API: real-time speech-to-verse mapping
- Events: word_detected, verse_completed, surah_completed
- Confidence scoring for accuracy feedback

### Pipeline
```
Microphone → Tarteel API → verse/word ID → Stroke Model → p5.brush → Canvas
```

### Timing
- Word detected → trigger stroke group (200-500ms response)
- Verse completed → pause, ink dries, composition settles
- Surah completed → final reveal animation (2-3 seconds)
- Recitation pace controls stroke speed (rushed = thin/light, deliberate = thick/rich)

### Composition Engine
- Pre-designed composition templates per surah (overall shape)
- Model fills in strokes within the template constraints
- Random seed for variation — same surah, different flourishes each time
- Symmetry rules from Islamic geometric principles

## Phase 5 — Polish & Ship
- Mobile-first PWA (like agiftoftime.app)
- Gallery mode: save completed pieces, share as images
- Leaderboard/community: beautiful recitations shared
- Print-ready export (SVG vector output)
- Accessibility: visual-only mode for those who can't recite

## Revenue Model
- Free for Al-Fatiha + 3 short surahs
- Premium: all 114 surahs, custom styles, print export
- Commissioned pieces: request specific verse + style + format
- Physical prints: museum-quality giclée of generated calligraphy

## References

### Tech
- p5.brush: https://github.com/acamposuribe/p5.brush (open-source brush engine)
- Anderson Mancini: Three.js WebGPU light painting (progressive reveal) — https://x.com/Andersonmancini/status/2016833954700001600
- Jose Molfino: MPM paint mixing in Houdini (physical paint quality) — https://x.com/Jose_Molfino/status/1990398255511810378
- IOivm: p5.js ink effects (edge erosion, squeeze) — https://x.com/IOivm/status/1997528777082220816
- Sketch-RNN: Google Brain, stroke-based drawing generation
- **@sandraleow gesture-controlled flower garden** (March 2, 2026): Hand gestures controlling procedural flower generation in real-time. Built with Perplexity Computer. Video: https://x.com/sandraleow/status/2028468163541901526 — 124 likes. Relevant: gesture→visual art pipeline, same pattern as voice→calligraphy for fatiha.app.
- Tarteel AI: Quran speech recognition API
  - **Funding**: $4.5M seed, led by Y Combinator (W22), Bessemer Venture Partners, angels (Ahmed Al-Baher, Omar Al-Khalaf)
  - YC-backed = developer-first API, designed for integration
  - API likely stable + accessible for prototyping, check pricing tiers for production rate limits
  - Also have: tarteel-ai/whisper-base-ar-quran on HuggingFace (self-hostable)
  - **Risk mitigation**: Can self-host Whisper variant on A6000s if API pricing becomes prohibitive

### Calligraphy
- Bismillah tulip calligraphy — the calligraphy IS the art, not decoration
- Nuqta system — letter proportions measured in rhombic dots from the qalam
- Four target styles: Thuluth (monumental), Naskh (readable), Diwani (ornamental), Kufic (geometric)

### Datasets
- KHATT: Arabic handwriting text database
- IFN/ENIT: Tunisian city name handwriting
- AHDB: Arabic handwriting database
- Museum digitized manuscripts: Met, British Museum, Topkapi

---

## Deployment Architecture — Fully On-Device

**Principle:** No cloud dependency, no API calls. Everything runs on-device (browser + iPhone).

### On-Device Inference Pipeline
```
Mic → Whisper Tiny (ONNX/CoreML, ~100ms) → verse ID → Stroke Model (ONNX/CoreML, ~20ms) → p5.brush render
```
Total latency: ~120ms. Real-time voice-reactive art.

### ASR Layer (Voice → Verse ID)
- **Base model**: tarteel-ai/whisper-base-ar-quran (HuggingFace, 74M params)
- **Fine-tune** on A6000s for tajweed-aware recognition (quality of recitation, not just words)
- **Export**: ONNX → browser (WebAssembly/Transformers.js), CoreML → iOS
- Whisper Tiny (39M) if need smaller footprint, Base (74M) for better accuracy
- Training time: 1-2 days on dual A6000

### Stroke Generation Layer (Verse → Calligraphy)
- **Architecture**: ~50-100M param transformer (seq2seq)
- **Input**: Arabic text tokens (character-level) + style conditioning
- **Output**: bezier curve sequences + pressure + stroke order
- **Training data**: Calliar dataset (2,500 sequences) + custom digitized calligraphy
- **Export**: ONNX (browser), CoreML (iOS)
- At 50M params int8 quantized: ~20ms inference on iPhone, instant in browser
- Training time: 1-2 weeks on dual A6000
- **This is the novel IP** — nobody has this running on-device

### Model Sizes (quantized int8)
| Model | Params | Size | Platform |
|-------|--------|------|----------|
| Whisper Tiny AR | 39M | ~40MB | Browser + iOS |
| Whisper Base AR | 74M | ~75MB | iOS (too large for some browsers) |
| Stroke Model | 50M | ~50MB | Browser + iOS |
| **Total** | | **~90-125MB** | One-time download, runs forever offline |

### Training Infrastructure
- Dual RTX A6000 (96GB VRAM) — all local, zero cloud cost
- PyTorch → ONNX export → onnxruntime-web (browser) / CoreML (iOS)
- Can train overnight, iterate daily
- Quantization: int8 for deployment, fp16 for training

### Key Advantage
- **Zero recurring cost** — no API calls, no cloud inference
- **Works offline** — prayer times + calligraphy generation work without internet
- **Privacy** — voice never leaves the device
- **Speed** — 120ms total latency, genuine real-time response
- **IP** — the stroke model is proprietary, trained on your hardware, on your curated dataset

### Build vs Buy Decision (March 2, 2026)
- **ASR: Fine-tune, don't build** — Tarteel's Whisper weights exist, just improve them
- **Stroke model: Build from scratch** — this doesn't exist yet, it's the core innovation
- **Brush engine: Fork p5.brush** — customize, don't reinvent
- **Ship art, not infrastructure** — ASR is a solved problem, calligraphic generation is not

---

*"The pen has dried upon what it has written." — Hadith*
*But our pen is just getting started.*
