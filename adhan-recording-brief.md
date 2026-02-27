# Adhan Recording Brief — Ramadan Clock

## What We're Building
A prayer-aware clock app that plays the adhan at each prayer time. The adhan will be spatialized using HRTF audio so it sounds like it's coming from the direction of Qibla on the listener's device. This has never been done before.

## What We Need
5 recordings of the full adhan, each in a different maqam to match the mood of each prayer:

| Prayer | Maqam | Mood | Notes |
|--------|-------|------|-------|
| **Fajr** | Bayati | Gentle, waking, contemplative | Most traditional for Fajr. Soft entry. |
| **Dhuhr** | Rast | Balanced, clear, centered | The "default" maqam — strong and steady |
| **Asr** | Nahawand | Warm, reflective, afternoon calm | Similar feel to Western minor — introspective |
| **Maghrib** | Hijaz | Emotional, urgent, beautiful | Breaking the fast — this one should hit the heart |
| **Isha** | Saba | Deep, contemplative, night stillness | The most melancholic maqam — end of day |

## Recording Specs

### Format
- **WAV** (not MP3 — we need uncompressed for spatial processing)
- **48kHz sample rate** minimum (96kHz preferred)
- **24-bit** depth
- **Mono** — single channel (critical: we spatialize in code, stereo would fight the HRTF)

### Environment
- **Quiet room** — no background noise, no AC hum, no traffic
- **Minimal reverb** — we add our own mosque-style reverb in the app
- **No room echo** — a carpeted room or closet with blankets is better than a tile bathroom
- If recording in a mosque, that's beautiful but we lose spatial control

### Microphone
- **Condenser mic**, cardioid pattern (e.g., AT2020, Rode NT1, or similar)
- **Pop filter** required — the adhan has strong plosives
- **6-12 inches** from the mouth
- Slightly off-axis (15-20°) to reduce sibilance
- Mount on a stand, not handheld

### Performance
- Full adhan, not abbreviated
- Natural pace — not rushed, not exaggerated
- Each maqam should feel distinct but all from the same voice
- If comfortable, a few seconds of silence at the start and end (easier to edit)
- Multiple takes welcome — we'll pick the best

### What to Avoid
- No background nasheeds or instrumentation
- No effects or processing on the recording
- No clipping (keep levels peaking around -6dB)
- No phone recordings — needs to be proper mic into an interface/recorder

## How We'll Use It
1. The raw mono WAV gets loaded into the app
2. Web Audio API applies HRTF spatial processing
3. The adhan sounds like it's coming from the direction of Mecca
4. As you turn your phone, the adhan source stays fixed toward Qibla
5. Subtle mosque reverb is added in code
6. Different maqam plays automatically based on prayer time

## Credit
The muezzin will be credited in the app and on the website. If they'd prefer to remain anonymous, that's respected too.

## Delivery
- 5 WAV files, clearly named (e.g., `adhan-fajr-bayati.wav`)
- Shared via cloud storage link or AirDrop
- No compression or conversion — raw from the recorder

---

*This recording will be heard by Muslims worldwide during Ramadan. It carries weight. Take your time with it.*
