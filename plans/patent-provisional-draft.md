# UNITED STATES PROVISIONAL PATENT APPLICATION

---

**DISCLAIMER:** This is a provisional patent application filed pursuant to 35 U.S.C. §111(b). The claims presented herein are preliminary and will be refined, expanded, and formalized in the corresponding non-provisional application filed within the twelve-month period provided by 35 U.S.C. §119(e). This provisional application is intended to establish a priority date and disclose the full scope of the invention.

---

## TITLE OF THE INVENTION

**System and Method for Spatially Rendering Audio Content Toward a Geographic Bearing Using Head-Tracked Spatial Audio**

---

## CROSS-REFERENCE TO RELATED APPLICATIONS

None.

---

## INVENTOR

Tawfeeq Martin

---

## FIELD OF THE INVENTION

[0001] The present invention relates generally to spatial audio rendering systems, and more particularly to systems and methods for positioning a virtual audio source at a geographic bearing relative to a listener using a combination of device-based geolocation, magnetometer-derived compass heading, and headphone-based inertial measurement unit (IMU) head-orientation tracking. The invention has specific application in the fields of mobile computing, geographic orientation systems, religious technology, and immersive audio experiences.

---

## BACKGROUND OF THE INVENTION

[0002] In the Islamic faith, adherents are required to face the direction of the Kaaba, located in the Al-Masjid al-Haram mosque in Makkah, Saudi Arabia (approximately 21.4225°N, 39.8262°E), during the performance of the five daily obligatory prayers (salah). This direction, known as the Qibla, varies depending on the geographic location of the worshipper and is determined by computing the great-circle bearing from the worshipper's position to the Kaaba.

[0003] For approximately 1,400 years, the Islamic call to prayer (adhan) has been broadcast from minarets and loudspeakers in an omnidirectional manner. The adhan serves as an audible signal that a prayer time has commenced, but it conveys no directional information regarding the Qibla.

[0004] Existing solutions for Qibla determination are predominantly visual in nature. Physical compasses, smartphone compass applications, and augmented-reality overlays all require the user to visually observe a display or physical instrument. These solutions demand active visual attention, occupy the user's hands, and interrupt the contemplative preparation for prayer.

[0005] The proliferation of head-tracked spatial audio hardware—including, without limitation, Apple AirPods Pro, AirPods (3rd generation and later), AirPods Max, and comparable devices from other manufacturers—has created consumer-grade headphones equipped with inertial measurement units (IMUs) capable of reporting real-time head orientation data (yaw, pitch, and roll) to a paired mobile computing device.

[0006] Concurrently, modern smartphones are equipped with magnetometers capable of providing absolute compass heading, and with Global Positioning System (GPS) receivers capable of determining the user's geographic coordinates with sufficient precision for bearing calculations.

[0007] Despite the widespread availability of these component technologies, and despite the daily practice of approximately two billion Muslims worldwide orienting themselves toward a single geographic point, no known prior art system or method combines spatial audio rendering with Qibla bearing calculation and head-orientation tracking to produce an audio experience perceived as emanating from the geographic direction of the Kaaba.

[0008] A search of the patent literature, academic publications (ACM Digital Library, IEEE Xplore, Google Scholar), commercially available applications (including Muslim Pro, Athan by IslamicFinder, Namaz, Pillars, Quran Majeed, Al-Moazin, and Salam), and art installations confirms the absence of any system combining spatial audio, Qibla direction, and head tracking. The sole related patent identified, US 8,898,012 B2 ("Qibla orientation device," 2013, King Fahd University of Petroleum and Minerals), describes a physical wearable device producing non-spatialized beeping sounds and has expired due to non-payment of maintenance fees. No blocking prior art exists.

---

## SUMMARY OF THE INVENTION

[0009] The present invention provides a system and method for spatially rendering audio content such that the audio is perceived by a listener as emanating from a specified geographic bearing, and more particularly from the direction of the Kaaba in Makkah, Saudi Arabia (the Qibla direction).

[0010] The system fuses two orientation data streams: (a) an absolute geographic heading obtained from a magnetometer or compass sensor of a mobile computing device, and (b) a relative head orientation obtained from an inertial measurement unit (IMU) disposed within a headphone or earphone worn by the listener. By continuously computing the difference between the Qibla bearing and the combined device-heading and head-orientation data, the system positions a virtual audio source at the Qibla bearing in the listener's perceptual auditory space.

[0011] As the listener rotates his or her head, the virtual audio source maintains its fixed geographic bearing, creating the perceptual experience that the audio originates from the physical direction of the Kaaba, regardless of the listener's head orientation. The system employs Head-Related Transfer Function (HRTF) rendering to produce binaural audio cues that enable the listener to perceive the directionality of the audio source in three-dimensional space.

[0012] The invention further provides methods for maintaining audio source position continuity when the application transitions between foreground and background execution states, including wall-clock-based position tracking and dual-mode playback architectures.

---

## BRIEF DESCRIPTION OF THE DRAWINGS

[0013] Although formal drawings are not included in this provisional application, the following figures would be included in the non-provisional application:

[0014] **FIG. 1** is a system block diagram illustrating the major components of the spatial audio rendering system, including the mobile computing device, headphone with IMU, GPS receiver, magnetometer, audio engine, and spatial audio controller.

[0015] **FIG. 2** is a geometric diagram illustrating the great-circle bearing calculation from a user's geographic position to the Kaaba at coordinates 21.4225°N, 39.8262°E.

[0016] **FIG. 3** is a signal flow diagram illustrating the fusion of device compass heading and headphone IMU yaw data to compute the relative Qibla bearing for audio source positioning.

[0017] **FIG. 4** is a plan-view diagram illustrating the virtual audio source position relative to the listener's head orientation, showing how the source maintains a fixed geographic bearing as the listener rotates.

[0018] **FIG. 5** is a block diagram of the audio rendering pipeline, including the audio player node, environment node with HRTF processing, and output to binaural headphone channels.

[0019] **FIG. 6** is a state diagram illustrating the foreground/background application state transitions and the corresponding audio rendering mode transitions (HRTF spatial rendering in foreground, stereo-panned or mono rendering in background, with wall-clock position tracking for seamless handoff).

[0020] **FIG. 7** is a diagram illustrating the web-based (Progressive Web Application) embodiment, including the Web Audio API signal chain with StereoPanner node and DeviceOrientation API compass integration.

[0021] **FIG. 8** is a diagram illustrating a multi-user installation embodiment with a speaker array or individual headphone-based rendering, visitor position tracking, and per-listener Qibla-oriented audio rendering.

[0022] **FIG. 9** is a diagram illustrating the Hajj/Umrah wayfinding embodiment, showing spatial audio cues oriented toward the Kaaba during Tawaf circumambulation and at ritual locations.

[0023] **FIG. 10** is a user interface diagram showing a visual Qibla indicator (bloom/glow effect) that intensifies as the user's head orientation aligns with the Qibla bearing.

---

## DETAILED DESCRIPTION OF PREFERRED EMBODIMENTS

### General Architecture

[0024] Referring generally to the system architecture, the invention comprises a geographic bearing computation module, a sensor fusion module, and a spatial audio rendering module. The geographic bearing computation module receives the user's current geographic coordinates (latitude and longitude) from a positioning system such as GPS and computes the great-circle bearing from the user's location to a target geographic point. In the preferred embodiment, the target point is the Kaaba in Makkah, Saudi Arabia, at coordinates 21.4225°N latitude, 39.8262°E longitude.

[0025] The great-circle bearing is computed using the forward azimuth formula:

    θ = atan2(sin(Δλ) · cos(φ₂), cos(φ₁) · sin(φ₂) − sin(φ₁) · cos(φ₂) · cos(Δλ))

where φ₁ is the latitude of the user, φ₂ is the latitude of the Kaaba, and Δλ is the difference in longitude between the Kaaba and the user. The result θ is the Qibla bearing in degrees from true north.

[0026] The sensor fusion module receives two orientation data streams. The first data stream is an absolute compass heading from a magnetometer integrated in the mobile computing device. On the iOS platform, this is obtained via CLLocationManager heading updates, which report true heading (corrected for magnetic declination). On the Android platform, equivalent data is obtained via the SensorManager magnetometer and accelerometer sensor fusion. The second data stream is a relative head orientation from an IMU integrated in headphones worn by the listener. On the iOS platform, this is obtained via CMHeadphoneMotionManager, which provides full CMDeviceMotion data including attitude (yaw, pitch, roll), rotation rate, user acceleration, and gravity vector at update rates of up to 100 Hz.

[0027] A critical aspect of the sensor fusion is that the headphone IMU (in current implementations such as Apple AirPods) includes an accelerometer and gyroscope but does not include a magnetometer. Accordingly, the headphone IMU provides only relative head rotation from an initial reference orientation, not absolute compass heading. The sensor fusion module anchors the relative headphone orientation data to the absolute compass heading of the device, thereby enabling the computation of the listener's absolute head orientation in geographic coordinates.

[0028] The Qibla angle relative to the listener's current head orientation is computed as:

    qiblaRelativeToHead = qiblaBearing − deviceCompassHeading − headphoneYaw

where qiblaBearing is the great-circle bearing to the Kaaba, deviceCompassHeading is the absolute compass heading of the mobile device, and headphoneYaw is the yaw component of the headphone IMU attitude.

[0029] The spatial audio rendering module receives the computed relative Qibla angle and positions a virtual audio source at that angle in the listener's perceptual auditory space. The virtual source is placed at a fixed virtual distance (e.g., 10 meters) from the listener at the computed angle, at the same elevation as the listener (i.e., in the horizontal plane). The three-dimensional position of the virtual source is computed as:

    x = distance · sin(qiblaRelativeToHead)
    y = 0
    z = −distance · cos(qiblaRelativeToHead)

[0030] The audio rendering module applies Head-Related Transfer Function (HRTF) processing to the audio signal to produce binaural output that conveys the perceived direction of the audio source to the listener through interaural time differences (ITD), interaural level differences (ILD), and spectral shaping. On the iOS platform, this is accomplished using an AVAudioEnvironmentNode configured within an AVAudioEngine graph, with the listenerAngularOrientation property updated from the head-tracking data and the audio source position set using AVAudio3DPoint coordinates.

### First Preferred Embodiment: Native Mobile Application with Spatial Audio Headphones

[0031] In the first preferred embodiment, the system is implemented as a native application executing on a mobile computing device (such as an iPhone or Android smartphone) paired via Bluetooth with spatial audio headphones (such as Apple AirPods Pro, AirPods 3rd generation or later, AirPods Max, or Beats Fit Pro).

[0032] The application performs the following operations in sequence: (a) obtains the user's geographic coordinates via GPS; (b) computes the Qibla bearing using the great-circle formula described above; (c) begins receiving compass heading updates from the device magnetometer; (d) begins receiving head-orientation updates from the headphone IMU at a rate of approximately 60-100 Hz; (e) configures an audio engine with a player node connected through an environment node with HRTF spatialization enabled to the main mixer and output; (f) loads an audio file containing the adhan or other audio content; (g) begins playback, positioning the audio source at the computed Qibla angle relative to the listener's head orientation; and (h) continuously updates the audio source position in response to changes in device heading and head orientation, such that the audio source maintains its fixed geographic bearing toward the Kaaba.

[0033] On the iOS platform, the audio engine graph is structured as follows:

    AVAudioEngine
      └── AVAudioPlayerNode (adhan audio source)
           └── AVAudioEnvironmentNode (HRTF spatialization)
                └── mainMixerNode → output

[0034] The AVAudioEnvironmentNode provides built-in HRTF rendering. The listenerAngularOrientation property is updated from the CMHeadphoneMotionManager data to reflect the listener's current head orientation. The AVAudioPlayerNode position property is set to the computed three-dimensional coordinates corresponding to the Qibla bearing.

[0035] Because the headphone IMU yaw value is relative (commencing at zero when tracking begins), the system captures the device compass heading at the moment head tracking is initiated and uses this captured heading as the reference for anchoring subsequent relative yaw measurements to absolute geographic coordinates. Periodic re-anchoring is performed to compensate for gyroscope drift.

[0036] The audio session is configured with the playback category and the appropriate background audio entitlement, enabling the adhan to play for its full duration (typically three to four minutes) without interruption, thereby bypassing the 30-second limitation imposed on notification-triggered audio.

### Second Preferred Embodiment: Web Browser (Progressive Web Application) Implementation

[0037] In the second preferred embodiment, the system is implemented as a Progressive Web Application (PWA) executing in a web browser on a mobile computing device. This embodiment provides broad cross-platform compatibility without requiring native application installation.

[0038] The PWA embodiment utilizes the Web Audio API to create an AudioContext containing a source node connected through a StereoPanner node to the audio context destination. The StereoPanner node accepts a pan value ranging from −1 (full left) to +1 (full right), which is computed from the Qibla bearing relative to the device orientation.

[0039] Compass heading is obtained via the DeviceOrientation API, which provides alpha (compass heading), beta (front-to-back tilt), and gamma (left-to-right tilt) values. The Qibla bearing relative to the device is computed as described in the general architecture, substituting deviceorientation alpha for the native magnetometer heading.

[0040] The pan value is computed by mapping the relative Qibla angle to the range [−1, +1]:

    pan = sin(qiblaRelativeToDevice · π / 180)

This produces a sinusoidal panning curve that naturally maps angles to stereo position, with 0° (directly ahead) mapping to center, 90° (right) mapping to +1, and −90° (left) mapping to −1.

[0041] To provide smooth spatial tracking, the system employs JavaScript-side linear interpolation (lerp) of the pan value, updating at the requestAnimationFrame rate (typically 60 Hz) with a smoothing factor to prevent audible artifacts from abrupt pan changes.

[0042] A dual-mode playback architecture addresses the limitation that web browsers suspend AudioContext processing when the application is in the background. In the foreground state, audio is rendered through the AudioContext with StereoPanner-based spatial positioning. When the application transitions to the background, playback is handed off to a plain HTML Audio element, which is permitted to continue playing in the background on most mobile platforms. The system records a wall-clock timestamp and the corresponding audio playback position at the moment of the foreground-to-background transition. When the application returns to the foreground, it computes the elapsed wall-clock time since the transition, seeks the AudioContext-based playback to the corresponding position, crossfades from the plain Audio element to the spatialized AudioContext output, and resumes spatial rendering. This wall-clock position tracking method ensures seamless audio continuity across application state transitions.

### Third Preferred Embodiment: Multi-User Installation

[0043] In the third preferred embodiment, the system is deployed as a multi-user spatial audio installation in a physical space such as a museum, gallery, exhibition hall, or place of worship. The installation may employ either (a) a speaker array providing ambisonics or wave field synthesis rendering, or (b) individual headphones provided to each visitor with per-listener spatial rendering.

[0044] In the speaker array variant, an array of eight or more loudspeakers is disposed around the perimeter of the space. An ambisonics or wave field synthesis rendering engine positions the adhan audio source at the geographic Qibla bearing relative to the physical space. All listeners in the space perceive the adhan as emanating from the same physical direction—the direction of Makkah from the installation's location.

[0045] In the individual headphone variant, each visitor is provided with head-tracked spatial audio headphones. A visitor tracking system—which may employ Ultra-Wideband (UWB) ranging, Bluetooth Low Energy (BLE) beacons, computer vision with camera-based tracking, or a combination thereof—determines each visitor's position and orientation within the space. The system computes the Qibla bearing from the installation's geographic coordinates and renders the audio source at the corresponding bearing for each listener individually, accounting for each listener's head orientation via the headphone IMU.

### Fourth Preferred Embodiment: Hajj and Umrah Wayfinding

[0046] In the fourth preferred embodiment, the spatial audio system is adapted for use during the Hajj and Umrah pilgrimages to Makkah, Saudi Arabia. During the Tawaf ritual, pilgrims circumambulate the Kaaba seven times. The system provides spatial audio cues that are continuously oriented toward the Kaaba from the pilgrim's current position as they walk the circumambulation path, providing an audible anchor that conveys the direction of the Kaaba at all times during the ritual.

[0047] The system further provides spatial audio landmarks at designated ritual locations including Mina, Arafat, and Muzdalifah. At each location, the system renders audio content—including prayers, supplications (du'as), historical narrations, and navigational instructions—with spatial positioning that orients the listener toward relevant geographic points, including the Kaaba and specific ritual sites.

[0048] Crowd-aware spatial rendering adjusts audio content based on the density and movement of surrounding pilgrims, as detected by the device's sensors or by a crowd management system. This may include adjusting audio volume, spatial parameters, or content selection to account for the acoustic environment of large crowds.

### Visual and Haptic Feedback

[0049] In a further aspect of the invention, the system provides a visual indicator on the display of the mobile computing device that conveys the degree of alignment between the listener's current head orientation and the Qibla bearing. In one implementation, a bloom or glow visual effect is rendered on the display, with the intensity of the bloom increasing as the angular difference between the listener's head orientation and the Qibla bearing decreases. When the listener is facing within a threshold angle of the Qibla (e.g., ±5°), the bloom reaches maximum intensity, providing a visual confirmation of correct Qibla alignment.

[0050] In a further aspect, the system generates haptic feedback via the mobile computing device's haptic actuator when the listener's head orientation aligns with the Qibla bearing within a predetermined threshold. The haptic feedback may comprise a single pulse, a pattern of pulses, or a continuous vibration that intensifies as the alignment improves.

### Notification-Triggered Spatial Audio

[0051] In a further aspect, the system integrates with a prayer time notification system. When a prayer time arrives, the system delivers a notification to the user. If the user opens the application in response to the notification, the system immediately initiates spatial audio rendering of the adhan, positioning the audio source at the Qibla bearing. The notification itself may include a brief (up to 30 seconds) audio clip of the adhan rendered in mono or stereo. Upon the user opening the application, the system transitions to full spatial HRTF rendering, computing the current playback position from the wall-clock time elapsed since the notification was delivered, and continuing the adhan from that position with spatial rendering.

---

## CLAIMS

**Claim 1.** A method for rendering audio toward a geographic bearing using head-tracked spatial audio, the method comprising:
  (a) determining a geographic position of a listener using a positioning system of a mobile computing device;
  (b) computing a target bearing from the geographic position of the listener to a target geographic point;
  (c) obtaining an absolute compass heading from a magnetometer of the mobile computing device;
  (d) obtaining a relative head orientation from an inertial measurement unit disposed within a headphone worn by the listener;
  (e) computing a relative target angle based on the target bearing, the absolute compass heading, and the relative head orientation; and
  (f) rendering an audio signal through the headphone such that the audio signal is perceived by the listener as emanating from the relative target angle,
  wherein the relative target angle is continuously updated in response to changes in the absolute compass heading and the relative head orientation, such that the audio signal maintains a fixed perceived geographic bearing toward the target geographic point as the listener moves or turns.

**Claim 2.** The method of claim 1, wherein the target geographic point is the Kaaba in Makkah, Saudi Arabia, at approximately 21.4225°N latitude and 39.8262°E longitude, and the target bearing is the Qibla bearing.

**Claim 3.** The method of claim 1, wherein the target bearing is computed using a great-circle forward azimuth formula.

**Claim 4.** The method of claim 1, wherein the headphone is an Apple AirPods device and the relative head orientation is obtained via CMHeadphoneMotionManager on an iOS platform.

**Claim 5.** The method of claim 1, wherein computing the relative target angle comprises:
  (a) capturing the absolute compass heading at a moment when head-orientation tracking is initiated to establish a reference heading;
  (b) computing the relative target angle as the target bearing minus the absolute compass heading minus a yaw component of the relative head orientation; and
  (c) periodically re-anchoring the reference heading to compensate for gyroscope drift in the inertial measurement unit.

**Claim 6.** The method of claim 1, wherein rendering the audio signal comprises applying a Head-Related Transfer Function (HRTF) to produce binaural audio output conveying interaural time differences, interaural level differences, and spectral cues corresponding to the relative target angle.

**Claim 7.** The method of claim 6, wherein the HRTF rendering is performed using an AVAudioEnvironmentNode within an AVAudioEngine audio processing graph on an iOS platform.

**Claim 8.** The method of claim 1, wherein the audio signal comprises an Islamic call to prayer (adhan).

**Claim 9.** The method of claim 1, wherein the audio signal comprises one or more of: a Quran recitation, a prayer guidance instruction, a supplication (du'a), or an ambient soundscape.

**Claim 10.** A system for spatially rendering audio toward a geographic bearing, the system comprising:
  (a) a mobile computing device comprising a processor, a memory, a positioning system, and a magnetometer;
  (b) a headphone communicatively coupled to the mobile computing device and comprising an inertial measurement unit configured to report head-orientation data including at least a yaw component;
  (c) a bearing computation module, stored in the memory and executable by the processor, configured to compute a target bearing from the geographic position of the mobile computing device to a target geographic point;
  (d) a sensor fusion module, stored in the memory and executable by the processor, configured to receive an absolute compass heading from the magnetometer and a relative head orientation from the inertial measurement unit and to compute a relative target angle; and
  (e) a spatial audio rendering module, stored in the memory and executable by the processor, configured to render an audio signal through the headphone such that the audio signal is perceived as emanating from the relative target angle,
  wherein the sensor fusion module continuously updates the relative target angle in response to changes in the absolute compass heading and the relative head orientation.

**Claim 11.** The system of claim 10, wherein the target geographic point is the Kaaba in Makkah, Saudi Arabia.

**Claim 12.** The system of claim 10, further comprising a visual display on the mobile computing device, and wherein the system further comprises a visual indicator module configured to render a bloom or glow effect on the visual display, the intensity of the bloom or glow effect increasing as the angular difference between the listener's head orientation and the target bearing decreases.

**Claim 13.** The system of claim 10, further comprising a haptic actuator on the mobile computing device, and wherein the system further comprises a haptic feedback module configured to generate haptic output via the haptic actuator when the listener's head orientation is aligned with the target bearing within a predetermined threshold angle.

**Claim 14.** A method for maintaining audio source position continuity across foreground and background application states, the method comprising:
  (a) rendering a spatialized audio signal through a first audio rendering path in a foreground application state, the spatialized audio signal being positioned at a target bearing relative to a listener;
  (b) upon transition of the application from the foreground state to a background state:
    (i) recording a wall-clock timestamp and a corresponding audio playback position;
    (ii) transferring audio playback to a second audio rendering path that is permitted to operate in the background state;
  (c) upon transition of the application from the background state to the foreground state:
    (i) computing an elapsed time from the recorded wall-clock timestamp;
    (ii) determining a current audio playback position based on the elapsed time and the recorded audio playback position;
    (iii) seeking the first audio rendering path to the determined current audio playback position; and
    (iv) resuming spatialized audio rendering through the first audio rendering path at the determined current audio playback position.

**Claim 15.** The method of claim 14, wherein the first audio rendering path comprises an AudioContext with a StereoPanner node in a web browser environment, and the second audio rendering path comprises an HTML Audio element.

**Claim 16.** The method of claim 14, wherein the first audio rendering path comprises an AVAudioEngine with HRTF rendering on a native mobile platform, and the second audio rendering path comprises a non-spatialized audio playback session configured with a background audio entitlement.

**Claim 17.** The method of claim 14, further comprising crossfading between the second audio rendering path and the first audio rendering path during the transition from the background state to the foreground state.

**Claim 18.** A method for spatially rendering a religious call to prayer toward a direction of a worship site, the method comprising:
  (a) determining a geographic position of a listener;
  (b) computing a bearing from the geographic position of the listener to a geographic location of the worship site;
  (c) obtaining an orientation of the listener using one or more orientation sensors;
  (d) computing a relative direction from the orientation of the listener to the bearing of the worship site; and
  (e) rendering an audio signal comprising the call to prayer through an audio output device such that the call to prayer is perceived by the listener as emanating from the relative direction of the worship site,
  wherein the relative direction is continuously updated as the orientation of the listener changes, maintaining the perceived audio direction toward the worship site.

**Claim 19.** The method of claim 18, wherein the worship site is the Kaaba in Makkah, Saudi Arabia, the call to prayer is the Islamic adhan, and the bearing is the Qibla bearing, and wherein the one or more orientation sensors comprise a magnetometer of a mobile computing device and an inertial measurement unit of a headphone worn by the listener.

**Claim 20.** The method of claim 18, wherein the listener is performing a circumambulation (Tawaf) of the worship site, and the system renders spatial audio cues continuously oriented toward the worship site as the listener traverses a circumambulation path, the spatial audio cues comprising one or more of: a call to prayer, a supplication, a navigational instruction, and a historical narration.

---

## ABSTRACT

A system and method for spatially rendering audio content toward a geographic bearing using head-tracked spatial audio. The system computes a target bearing from a listener's geographic position to a target geographic point, such as the Kaaba in Makkah, Saudi Arabia (Qibla direction). A sensor fusion module combines an absolute compass heading from a mobile device magnetometer with a relative head orientation from an inertial measurement unit in headphones worn by the listener to determine a relative target angle. A spatial audio rendering module positions a virtual audio source at the computed angle using Head-Related Transfer Function (HRTF) processing, producing binaural output perceived as emanating from the target bearing. The system continuously updates the audio source position as the listener turns, maintaining a fixed geographic bearing. Applications include spatially rendering the Islamic call to prayer (adhan) toward Makkah, Hajj pilgrimage wayfinding, and multi-user installations with per-listener spatial rendering.

---

*Provisional Patent Application*
*Filed: February 2026*
*Inventor: Tawfeeq Martin*
