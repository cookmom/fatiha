# Lissajous Tawaf — Calligraphy Through Orbital Paths

## Concept
Pilgrims' orbital paths around the Kaaba (tawaf) writing Arabic calligraphy via Lissajous curves. The circumambulation becomes the pen stroke — sacred geometry meeting sacred text.

## Reference
- Source: https://x.com/mathhub_vn/status/2036075301525209518
- Context: Mathematical visualization showing how Lissajous figures can encode letterforms

## Mathematics

### Parametric Equations
```
x(t) = A × sin(a × t + δ)
y(t) = B × sin(b × t)
```

Where:
- **a, b** = frequency ratio → determines the letter shape
- **δ** = phase shift → controls orientation/variant
- **A, B** = amplitude → controls aspect ratio
- **t** = time parameter (0 to 2π or multiples)

### Frequency Ratios → Letter Shapes
Different integer ratios (a:b) produce distinct closed curves:
- 1:1 → ellipse/circle (with δ variation)
- 1:2 → figure-8 / parabolic shape
- 2:3 → more complex looping
- 3:4, 3:5, etc. → increasingly intricate symmetric curves

Arabic letter construction maps specific letterforms to specific (a:b, δ) combinations. The challenge is finding ratios that approximate the proportional system of Thuluth or Naskh letterforms.

### Tawaf Connection
- Pilgrims walk 7 counter-clockwise circuits (tawaf) around the Kaaba
- Each circuit is an orbital path — a closed curve
- Multiple pilgrims at different radii create concentric paths
- When viewed from above, the collective motion traces patterns
- Concept: assign each pilgrim-radius a frequency ratio → the collective paths spell calligraphy

### Implementation Sketch
```javascript
function lissajousLetter(a, b, delta, steps) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * TWO_PI * lcm(a, b);
    pts.push([
      sin(a * t + delta),
      sin(b * t)
    ]);
  }
  return pts;
}
```

## Artistic Potential
- Generative calligraphy where the writing instrument is orbital motion
- Each letter emerges from a different harmonic relationship
- Words become choreography — sequences of frequency changes
- The Basmala as a Lissajous composition: 19 letters, 19 frequency pairs
- Connection to Islamic cosmology: celestial orbits as divine writing
