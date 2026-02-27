# Patent Brief: Spatial Adhan — Directional Prayer Audio System

## The One-Liner
**"What if you could *hear* which way Makkah is?"**

## Invention Summary
A system and method for spatially rendering the Islamic call to prayer (adhan) toward the geographic direction of Makkah (Qibla) using head-tracked audio, enabling the listener to perceive the adhan as emanating from the direction of the Kaaba.

## Core Innovation
Combination of:
1. **Qibla bearing calculation** — device GPS/compass determines geographic bearing from user's location to the Kaaba (21.4225°N, 39.8262°E)
2. **Head orientation tracking** — AirPods IMU (CMHeadphoneMotionManager) or device gyroscope provides real-time head/device orientation
3. **Spatial audio rendering** — audio source positioned at the Qibla bearing relative to the listener's head orientation, creating the perception that the adhan originates from Makkah's direction
4. **Dynamic repositioning** — as the listener turns their head, the audio source maintains its fixed geographic bearing, continuously "coming from" Makkah

## What Makes It Novel (Confirmed via Deep Research)
- **Zero prior art** — no prayer app, academic paper, art installation, or patent combines spatial audio + Qibla direction + head tracking
- **Patent landscape clear** — only one expired Qibla audio patent (US 2013, physical device). No patents on spatial audio + geographic bearing + headphone tracking
- **Every major prayer app checked** — Muslim Pro, Athan, Namaz, Pillars — none offer directional audio

## Technical Implementation

### Web (Current — PWA)
- AudioContext + StereoPanner (proven working, v55)
- iPhone compass (deviceorientation) for Qibla bearing
- JS-side pan lerp for smooth spatial tracking
- Plain Audio fallback for background playback

### Native iOS (Target)
- AVAudioEngine with AVAudioEnvironmentNode
- CMHeadphoneMotionManager for AirPods head tracking (yaw/pitch/roll)
- CLLocationManager for device compass (absolute bearing)
- Fusion: iPhone compass (absolute Qibla bearing) + AirPods gyro (relative head offset)
- UNLocalNotification with custom 30-second adhan sound for background trigger
- Full 4-minute spatial adhan when app is foregrounded

### Native Android (Future)
- Similar approach with Spatial Audio API + head tracking on supported devices

## Extended Applications

### Prayer & Worship
- **Spatial Quran recitation** — recitation perceived as coming from Makkah
- **Prayer direction audio cue** — subtle tone guides user to face Qibla without looking at phone
- **Guided prayer with spatial positioning** — imam voice from Qibla direction

### Hajj & Umrah (17M annual visitors, $12B industry)
- **Tawaf audio guide** — directional audio guides pilgrims around the Kaaba
- **Wayfinding** — spatial audio cues for navigating Mina, Arafat, Muzdalifah
- **Crowd-sourced spatial mapping** — shared audio landmarks

### Art & Installation
- **Museum installation** — multi-channel adhan tracking visitors via positioning system
- **"The Muezzin's Delay"** — adhan cascading across cities as spatial sound canon
- **Exhibition piece** — Sharjah Biennale, Ars Electronica, ISEA, Sónar+D submissions

## Market
- **180M+ Muslim Pro downloads** (largest prayer app)
- **$20B Islamic app market**
- **~35-50M Muslim AirPods users globally**
- **Gulf states: 42% iOS share** with very high AirPods penetration
- **Even 0.1% conversion = $2-3M ARR** at premium tier pricing

## Competitive Moat
1. **Patent** — provisional filing ($300) locks priority date before any public demo
2. **Technical execution** — 33 iterations of iOS audio debugging gives us deep platform knowledge
3. **Credibility** — Tawfeeq's VP/ILM background is unmatched in the Islamic app space
4. **Art world positioning** — simultaneously product AND art practice

## Filing Strategy
1. **Provisional patent application** — $300, establishes priority date, 12 months to file full
2. **File BEFORE any public demo or publication** — priority date must precede disclosure
3. **Claims to draft:**
   - Method for rendering audio toward a geographic bearing using head-tracked spatial audio
   - System combining compass-based geographic bearing with head-orientation tracking for directional audio rendering
   - Application to Islamic prayer call (adhan) with Qibla-directed spatial positioning
   - Method for transitioning between spatial audio modes based on device visibility state (foreground HRTF ↔ background plain audio with position continuity)
4. **Consider PCT filing** — international protection for Gulf states, Southeast Asia, Europe

## Timeline
- **Now:** Draft provisional patent claims
- **Before Ramadan (Feb 17):** File provisional ($300)
- **Ramadan:** Ship PWA with web-based spatial adhan (prior art establishes our work)
- **Post-Ramadan:** Native iOS app with full AirPods head tracking
- **Within 12 months:** File full patent application

## Key Risks
- Apple could build this into their Prayer Times feature (low probability — niche religious feature)
- Muslim Pro could replicate after seeing it (patent protects us)
- AirPods head tracking API changes (we also have device-only fallback)

## References
- Deep research: `plans/spatial-adhan-deep-dive.md`
- iOS native capabilities: `plans/ios-background-audio-deep-dive.md`
- Background audio research: `plans/background-audio-trigger-research.md`

---

*Filed by chef on behalf of Tawfeeq Martin — February 14, 2026*
*Status: DRAFT — awaiting review before provisional filing*
