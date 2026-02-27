# HRTF Spatial Audio Architecture — Standard Implementation

**Status:** Canonical reference. All spatial audio in our projects MUST follow this pattern.
**Proven in:** A Gift of Time — adhan (24 iterations, v22→v45) + surah playback (v163)
**Last updated:** 2026-02-18

---

## Core Principle

All audio that should be spatialized toward Qibla (or any directional target) uses a **dual-path architecture** with seamless foreground/background handoff. This is non-negotiable — a naive `MediaElementSource + StereoPanner` approach breaks the moment the user locks their phone or switches tabs.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  FOREGROUND (tab visible)                           │
│                                                     │
│  fetch(src) → decodeAudioData → AudioBufferSource   │
│       → GainNode → StereoPanner → destination       │
│                                                     │
│  Compass updates panner.pan.value every 200ms       │
│  Position tracked via: offset + (ctxTime - start)   │
└──────────────────────┬──────────────────────────────┘
                       │ visibilitychange: hidden
                       ▼
┌─────────────────────────────────────────────────────┐
│  BACKGROUND (tab hidden / phone locked)             │
│                                                     │
│  1. Get current position from HRTF                  │
│  2. Kill AudioBufferSourceNode (.stop())            │
│  3. Resume pre-unlocked plain Audio at position     │
│  4. MediaSession keeps it alive on lock screen      │
│                                                     │
│  Plain Audio ONLY exists during background.         │
│  Never simultaneously with HRTF.                    │
└──────────────────────┬──────────────────────────────┘
                       │ visibilitychange: visible
                       ▼
┌─────────────────────────────────────────────────────┐
│  FOREGROUND RESTORE                                 │
│                                                     │
│  1. Get position from plain Audio (.currentTime)    │
│  2. Start new AudioBufferSourceNode at position     │
│  3. THEN pause plain Audio (only after HRTF works)  │
│  4. Resume panner interval                          │
└─────────────────────────────────────────────────────┘
```

## Why AudioBufferSourceNode, Not MediaElementSource

- `MediaElementSource` can't restart from arbitrary positions
- `MediaElementSource` has CORS issues with cross-origin audio
- `AudioBufferSourceNode` gives us precise position tracking
- `AudioBufferSourceNode` can be killed and recreated cleanly

## Why Plain Audio Backup

- iOS kills `AudioContext` in background (no exceptions)
- Plain `Audio` element survives via MediaSession API
- MediaSession gives lock screen controls (play/pause/stop)
- Without this, audio dies the moment the user locks their phone

## iOS Audio Unlock Sequence

iOS requires a user gesture to play audio. The unlock dance:

```javascript
// On first touch/click — pre-create and unlock an Audio element
const audio = new Audio(src);
audio.play().then(() => {
  audio._swapping = true;    // prevent pause handler from triggering
  audio.pause();
  audio.currentTime = 0;
  audio._unlocked = true;    // mark as gesture-unlocked
  setTimeout(() => { audio._swapping = false; }, 50);
  // NOW safe to start HRTF sequence
  startHrtfSequence(src, 0);
});
```

The `_swapping` flag is critical — without it, the pause event fires and your state machine thinks playback stopped.

## Position Tracking

Three sources, checked in priority order:

```javascript
function getPosition() {
  // 1. Plain Audio playing (background mode)
  if (plainAudio && !plainAudio.paused) return plainAudio.currentTime;
  // 2. HRTF playing (foreground mode) — wall clock is most reliable
  if (hrtfStartWall > 0 && isPlaying)
    return hrtfStartOffset + (Date.now() - hrtfStartWall) / 1000;
  // 3. Fallback
  return hrtfStartOffset;
}
```

Wall clock (`Date.now()`) is more reliable than `AudioContext.currentTime` for position tracking across suspend/resume cycles.

## Panner Update Loop

```javascript
// Run every 200ms (not 50ms — battery matters on mobile)
function updatePanner() {
  if (!pannerNode || !hasCompass || !ctx || ctx.state !== 'running') return;
  const heading = deviceHeading || 0;
  const relativeAngle = qiblaAngle - heading;
  const targetPan = Math.max(-1, Math.min(1, Math.sin(relativeAngle)));
  currentPan += (targetPan - currentPan) * 0.15;  // smooth lerp
  pannerNode.pan.value = currentPan;
}
```

- Lerp factor 0.15 gives smooth panning without lag
- `Math.sin(relativeAngle)` maps angular offset to stereo field naturally
- Clamp to [-1, 1] prevents out-of-range values

## Compass + Qibla

```javascript
// Qibla bearing from user position
const lat = userLat * Math.PI / 180;
const lng = userLng * Math.PI / 180;
const mLat = 21.4225 * Math.PI / 180;  // Mecca latitude
const mLng = 39.8262 * Math.PI / 180;  // Mecca longitude
const qiblaAngle = Math.atan2(
  Math.sin(mLng - lng),
  Math.cos(lat) * Math.tan(mLat) - Math.sin(lat) * Math.cos(mLng - lng)
);

// Device heading from compass
function compassHandler(e) {
  const h = e.webkitCompassHeading || e.alpha;  // iOS vs Android
  if (h == null) return;
  hasCompass = true;
  deviceHeading = h * Math.PI / 180;
}
```

## MediaSession Integration

```javascript
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'Title',
    artist: 'Mishari Rashid al-Afasy',
    album: 'A Gift of Time'
  });
  navigator.mediaSession.setActionHandler('play', () => { /* resume */ });
  navigator.mediaSession.setActionHandler('pause', () => { /* pause */ });
  navigator.mediaSession.setActionHandler('stop', () => { /* full stop */ });
}
```

## Critical Lessons Learned (the hard way)

1. **`_swapping` flag is essential** — Without it, programmatic `.pause()` triggers your pause event handler and corrupts state
2. **HRTF PannerNode ignores live updates on iOS Safari** — Use `StereoPanner` instead, update `.pan.value` directly
3. **`linearRampToValueAtTime` freezes after AudioContext reconnect** — Use direct `.value` assignment with JS lerp
4. **iOS async pause events create race conditions** — The `_swapping` guard + `setTimeout` 50ms prevents this
5. **MediaSession auto-triggers play handler when AudioContext outputs** — Guard against unexpected play events
6. **Always kill HRTF BEFORE starting plain Audio** — Reverse order causes glitches
7. **Always start HRTF BEFORE killing plain Audio on restore** — If HRTF fails, plain Audio keeps playing
8. **`bufSrc.onended` fires in background too** — Check `document.hidden` before updating UI state
9. **200ms panner interval, not 50ms** — 50ms burns battery on mobile for imperceptible improvement
10. **Pre-unlock Audio on first touch, not on play** — iOS gesture window is narrow

## When to Use Full HRTF vs Simple Playback

| Content | Architecture | Reason |
|---------|-------------|--------|
| Adhan (5+ minutes) | Full HRTF + handoff | Sacred, must persist through lock screen |
| Full Surah recitation | Full HRTF + handoff | Long playback, users will lock phone |
| Short ayah clips (10-30s) | Simple `new Audio()` | Too short for background to matter |
| UI sounds / notifications | Simple `new Audio()` | Ephemeral, no spatial needed |

## Template

When implementing a new spatial audio feature, copy the Surah HRTF implementation from `index.html` (`playSurahSpatial` + visibility handler) as the starting template. It's the cleanest version of this architecture.

---

*This architecture was battle-tested across 24 iterations on iOS Safari, Android Chrome, and desktop browsers. Do not simplify it — every guard and flag exists because of a real bug we hit.*
