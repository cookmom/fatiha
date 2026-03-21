<!-- بسم الله الرحمن الرحيم -->
# fatiha.studio — Creative IDE Specification

## Vision
A collaborative art workstation where human and AI agents paint together.
The human stays in the canvas — versions, alternatives, and agent output 
come to them, not the other way around.

## Core Principle
**Element-level version control.** Not "50 full renders to scroll through."
Each stroke, wash, geometric line, and visual event is independently 
versionable, selectable, and replaceable — without leaving the canvas.

---

## 1. CANVAS (always visible, full screen)

### p5.brush Tool Palette
Photoshop-style sidebar exposing the full p5.brush library:
- **Brushes**: marker, charcoal, 2H, HB, 2B, crayon, pen, spray, rotring
- **Stroke weight**: slider (0.5 — 12)
- **Color picker**: free + Islamic palette presets (lapis, vermillion, terre verte, shell gold, lamp black, rose, raw umber)
- **Opacity**: slider (0 — 255)
- **Fill controls**: fillBleed amount + direction, fillTexture intensity + grain
- **Eraser mode**: removes strokes from the JSON (non-destructive)
- **Paper selector**: cream, white, dark, tinted

### Drawing
- Touch/pen input draws on canvas with selected brush
- Every stroke recorded as JSON: `{brush, color, weight, opacity, points: [[x,y,pressure]...], timestamp}`
- Undo/redo stack (per stroke)
- Layers: pencil layer, watercolor layer, detail layer, data viz layer

---

## 2. ELEMENT SELECTION + VERSIONING

### Selecting Elements
- Tap any visible stroke/wash → highlights it
- Shows: which agent made it, when, what version
- Mini version panel slides in from right

### Version Panel (inline, no page navigation)
- Shows N alternative versions of that specific element
- Swipe horizontally to browse
- Tap to swap in
- Star to favorite
- Each version shows: agent name, timestamp, brief note
- Can also "generate more" — asks an agent for 3 new alternatives

### Element Transform Controls
When an element is selected, a transform gizmo appears:
- **Move**: drag to reposition
- **Scale**: pinch or handle-drag to resize (uniform + non-uniform)
- **Rotate**: two-finger twist or rotation handle
- **Distort**: corner handles for perspective/skew warp
- **Spline warp**: overlay bezier control points — drag to bend/curve the stroke
- **Flow vectors**: apply a vector field that pushes the stroke (like liquify in Photoshop)
- **Re-color**: change the stroke's color (keeps brush texture)
- **Re-brush**: swap the brush type (marker → charcoal) while preserving the path
- **Opacity**: per-element opacity slider
- **Weight**: adjust stroke weight after the fact

All transforms are non-destructive — stored as transform metadata on the stroke JSON:
```json
{
  "brush": "marker",
  "color": "#1a3a8a",
  "points": [...],
  "transform": {
    "translate": [dx, dy],
    "scale": [sx, sy],
    "rotate": angle,
    "warp": [[cp1x,cp1y], [cp2x,cp2y], ...],
    "flowField": "curved|radial|none"
  }
}
```

### Cross-Version Copy/Paste
- Select a stroke from Version A
- Paste into current canvas
- Stroke JSON transfers cleanly (position, brush, color preserved)
- Can adjust position after paste

---

## 3. TIMELINE (bottom panel, expandable)

### Audio Waveform
- Horizontal waveform of the recitation audio (Mishary or user mic)
- Playhead scrubs through
- Zoom in/out

### Event Tracks
Stacked lanes below the waveform:
- **Verse track**: verse boundaries marked
- **Word track**: word-level timing
- **Tajweed track**: idgham, ghunna, madd, ikhfa, qalqalah, iqlab events
- **Visual event track**: when each stroke/wash appears in the animation

### Keyframe Editing
- Each visual element has a keyframe on the timeline (when it appears)
- Drag to re-time
- Visual elements can have duration (wash bleeds from t=2.0 to t=3.5)
- Preview: play to see animation with current timing

### Tajweed → Visual Mapping
- Each tajweed rule has a visual treatment selector
- Tap a tajweed event → see agent-proposed visual treatments
- Pick one, it links to that event
- Can map same rule to different visuals per occurrence

---

## 4. AGENT INTEGRATION

### Agent Output
- Agents produce strokes as JSON (same format as human strokes)
- Each stroke tagged with: agent_id, version, surah, verse, notes
- Agent strokes appear in the canvas as "proposed" (dashed outline)
- Human approves (tap) or rejects (swipe away)

### Rehearsal Mode
- Load an agent's complete painting
- Scrub through the timeline to see their visual sequence
- Tap any element to see alternatives
- "Adopt" individual elements into your painting

### Batch Review
- Agent produces N variations of an element
- All shown inline in the version panel
- Filter: favorites only, highest rated, most recent
- Never need to leave the canvas to review output

---

## 5. DATA VISUALIZATION LAYER

### Surah Visual DNA
- Semi-transparent overlay toggleable on/off
- Rhythm waveform as subtle background shape
- Letter frequency spectrum as color band
- Symmetry score reflected in composition guides
- Verse structure as geometric scaffolding

### Real-time Audio Viz
- FFT spectrogram of live mic input
- Rendered as semi-transparent overlay
- Each person's voice creates unique visual fingerprint
- Toggleable: off / subtle / prominent

---

## 6. EXPORT

### Formats
- **JSON**: full painting data (all strokes, timing, metadata)
- **PNG/SVG**: static render at any resolution
- **MP4**: animated render (timeline playback)
- **HTML**: self-contained p5.brush sketch (playable in browser)

### Sharing
- Publish to fatiha-gallery (GitHub Pages)
- Direct share to X/Instagram (with proper 9:16 crop)
- Link to interactive web version

---

## Tech Stack
- p5.js 2.x + p5.brush v2.0.2-beta (WEBGL)
- Mixbox (pigment-accurate color mixing)
- Web Audio API (FFT analysis, mic input)
- Canvas overlay for UI elements
- JSON stroke format (portable, versionable)
- Supabase (stroke storage, versioning, feedback)
- GitHub Pages (gallery publishing)

## Phase Plan
1. **NOW**: Tool palette + drawing + stroke JSON recording
2. **NEXT**: Timeline with audio waveform + tajweed markers
3. **THEN**: Element versioning + agent integration
4. **LATER**: Real-time collaboration + FFT viz overlay
