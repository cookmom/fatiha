# Prix Ars Electronica 2026 — Submission
**Category:** Digital Humanity
**Deadline:** March 9, 2026 — 2 PM CET (5 AM PST)
**URL:** https://agiftoftime.app
**Project:** A Gift of Time

---

## Project Title
A Gift of Time

## Subtitle
A prayer clock built in the tradition of the muwaqqit — the mosque astronomers who determined sacred time through the study of light.

---

## Short Description

The muwaqqit was a mosque astronomer, appointed from the 13th century onward, tasked with the precise determination of prayer times through celestial observation — solar altitude, shadow length, twilight gradations. *A Gift of Time* works in that tradition: a WebGL dichroic glass cube that refracts light into the seven prayer windows of the Islamic day. Free. Browser-based. No installation required.

---

## Project Description

The muwaqqit occupied a specific post in medieval Islamic institutions — mosque astronomer, responsible for the exact determination of prayer times through the study of light and celestial phenomena. Ibn al-Shatir held the position at the Umayyad Mosque in Damascus in the 14th century. Shams al-Din al-Khalili alongside him. It was rigorous science in rigorous service.

*A Gift of Time* begins where that tradition was interrupted.

At its center is a dichroic glass cube — physically accurate per-channel IOR refraction, chromatic dispersion, thin-film iridescence. An abstraction of the Ka'bah, the ancient cubic structure toward which prayer is oriented. Light passes through it. Seven prayer windows spread across the floor in their respective colors — violet for Tahajjud, amber for Dhuha, crimson for Maghrib. The compass mode orients the user toward Mecca in real time; when aligned, the cube refracts a prismatic beam.

Āyat an-Nūr, Surah 24:35: *"the lamp is within glass."* The verse predates the optics. Both point in the same direction.

The app runs in any browser. No account. No data collection. No installation. A URL passed between people — working in Cape Town, Kuala Lumpur, Detroit, wherever the prayer times fall today.

---

## Artist Statement

The muwaqqit tradition asks how light marks sacred time. Ibn al-Haytham answered with optics. Al-Bīrūnī answered by measuring the height of the atmosphere through the color gradations of Fajr dawn. Both were working in the same direction.

*A Gift of Time* is a modest continuation. The dichroic glass cube at its center does what they studied — bends light into its constituent channels. The prayer windows that spread across the floor are the seven divisions of the Islamic day, made visible in color rather than in ink.

The work comes from twenty years in virtual production — LED volumes, real-time rendering, the precision that cinema demands. That training pointed back toward something older.

My daughter Kauthar named the threshold: when the glass looked like jello, it was not yet right. It became right.

---

## Technical Description

**Platform:** Web Progressive Web App — installable via Safari/Chrome, no app store required

**Core:** Three.js WebGL, custom GLSL shaders, Web Audio API, Geolocation API, DeviceOrientation API

**Dichroic Glass Cube**
A two-pass framebuffer object (FBO) shader captures the scene behind the glass, then refracts it with per-channel IOR separation (R=1.14, G=1.18, B=1.23) producing physically accurate chromatic dispersion. Thin-film iridescence and Fresnel edge glow on per-face geometry. Per-face optical differentiation applies distinct IOR shifts, aberration scale, and UV offsets across each face.

**Prayer Window Shader**
Seven windows rendered as CircleGeometry discs with a polar fragment shader — `atan(vPos.x, -vPos.y)` for angular sector mapping, flat-top angular profile, smooth rolloff at boundaries. Three discs active at any time (current, next, following), rolling forward as prayer times pass.

**Qibla Compass**
Device gyroscope (`webkitCompassHeading` / `DeviceOrientationEvent`) drives a real-time compass needle. Circular moving average smooths jitter. iOS calibrated via `webkitCompassAccuracy`; Android via event-count threshold. Haversine great-circle distance to the Ka'bah calculated and displayed.

**Privacy**
Zero data collection. Prayer times computed client-side from GPS via adhan.js. Location stored only in device localStorage. No server-side processing.

**Performance:** 60fps on any modern smartphone.

---

## Credits

**Creator:** Tawfeeq Martin
Senior Virtual Production Engineer, Industrial Light & Magic (StageCraft)
Former Technical Innovations Manager, The Mill
tawfeeqmartin.com

**Co-Builder:** Kauthar Martin

---

## Project URL
https://agiftoftime.app

---

## Documentation Assets
- [ ] 5 screenshots — prayer states, device
- [ ] 60–90s demo video — compass + prayer swipe + night
- [ ] Hero image — portrait, cube + header
