# iOS App Development Plan: Ramadan Fasting Clock

**PWA**: https://cookmom.github.io/ramadan-clock/  
**Developer**: Tawfeeq (solo) + Chef (AI assistant)  
**Date**: February 14, 2026  
**Ramadan 2026 starts**: February 17, 2026 (3 days away!)  
**Target**: App Store release for Ramadan 2027 (realistic), TestFlight beta for late Ramadan 2026 (stretch goal)

---

## 1. WKWebView Wrapper vs Full Native

### WKWebView Wrapper (Hybrid)
| Aspect | Detail |
|--------|--------|
| **Pros** | Reuse existing PWA code, fast initial development, single codebase for web+app |
| **Cons** | Apple Guideline 4.2 rejection risk ("minimum functionality"), limited background capabilities, WKWebView audio restrictions |
| **App Store risk** | **MODERATE-HIGH**. Pure webview wrappers get rejected constantly under Guideline 4.2. The key is adding **meaningful native features** — notifications, background audio, compass, spatial audio. With those, approval likelihood improves significantly. |

### Full Native (SwiftUI)
| Aspect | Detail |
|--------|--------|
| **Pros** | Best performance, full API access, no webview limitations, best App Store approval chances |
| **Cons** | Complete rewrite, longer timeline, two codebases to maintain |
| **App Store risk** | **LOW**. Native apps rarely hit Guideline 4.2. |

### Recommendation: **Option A — Hybrid (WKWebView + Native Modules)**

The PWA already works well. Wrap it in WKWebView but implement these natively:
- Local notifications for prayer times
- Background audio (adhan playback)
- Spatial audio via AVAudioEngine
- Compass via CoreLocation
- Settings/onboarding as native screens

This gives Apple enough "native value" to pass 4.2 while leveraging existing PWA work.

---

## 2. Background Audio (Adhan Playback)

This is the **hardest iOS challenge** for this app.

### How It Works on iOS

1. **Enable Background Mode**: In Xcode → Capabilities → Background Modes → check "Audio, AirPlay, and Picture in Picture"

2. **AVAudioSession Configuration**:
   ```swift
   let session = AVAudioSession.sharedInstance()
   try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
   try session.setActive(true)
   ```
   - `.playback` category allows audio when screen is locked
   - Without `mixWithOthers`, it will pause other audio (appropriate for adhan)

3. **The Problem**: iOS kills background apps. You can't just schedule "play audio at 5:47 PM" while backgrounded.

### Solutions (ranked by reliability):

#### A. Local Notification + Audio Attachment (RECOMMENDED for MVP)
- Schedule a `UNNotificationRequest` with a sound attachment
- **Limit**: Notification sounds max **30 seconds** on iOS
- For full adhan (~3-5 min), notification triggers → user taps → app opens → plays full adhan
- Short adhan clip plays even when locked/backgrounded ✅

#### B. Silent Push + Background Audio Session
- Send a silent push notification at prayer time
- App wakes briefly, starts AVAudioPlayer with active audio session
- **Unreliable** — iOS may delay silent pushes, especially in Low Power Mode
- Requires server infrastructure

#### C. BGTaskScheduler + Audio
- Schedule a `BGAppRefreshTask` or `BGProcessingTask` 
- **Not suitable** — iOS decides when to run these, not guaranteed at exact times
- Cannot guarantee audio playback at prayer time

#### D. Local Notification with Full Audio (Best Practical Approach)
- Use `UNNotificationSound(named:)` with a 30-second adhan clip
- For the full adhan experience: notification includes "Tap to hear full Adhan" action
- Tapping opens app → plays complete adhan with spatial audio
- **This is what major prayer apps (Muslim Pro, Athan) do**

### Recommendation
**Use approach D for MVP**. Ship a 30-second adhan as notification sound. Full spatial adhan plays when app is foregrounded. This is reliable, App Store compliant, and what users expect.

---

## 3. Local Notifications for Prayer Times

### UNUserNotificationCenter Approach

```swift
import UserNotifications

func schedulePrayerNotification(prayer: String, date: Date, sound: String) {
    let content = UNMutableNotificationContent()
    content.title = prayer
    content.body = "It's time for \(prayer)"
    content.sound = UNNotificationSound(named: UNNotificationSoundName(sound + ".caf"))
    
    let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: date)
    let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
    
    let request = UNNotificationRequest(identifier: "\(prayer)-\(components.day!)", content: content, trigger: trigger)
    UNUserNotificationCenter.current().add(request)
}
```

### Key Constraints

| Constraint | Detail |
|-----------|--------|
| **64 notification limit** | iOS allows max **64 scheduled notifications per app** |
| **Prayer times** | 5 prayers/day × 12 days = 60 notifications (under limit!) |
| **Strategy** | Schedule 12 days ahead. When app opens, clear old ones and reschedule next 12 days |
| **Sound duration** | Max 30 seconds for notification sounds |
| **Sound format** | Must be `.caf`, `.aiff`, or `.wav` — bundle in app |

### Scheduling Strategy
1. On first launch: calculate prayer times for next 12 days, schedule all 60 notifications
2. Every time app opens: remove expired notifications, top up to 12 days ahead
3. Use background fetch (see §4) as backup to refresh notifications weekly

---

## 4. Background Fetch

### Can We Use It to Update Prayer Times?

**Yes, but with caveats.**

```swift
// In AppDelegate
func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    // Recalculate prayer times
    // Reschedule notifications
    completionHandler(.newData)
}
```

### Reality Check
- iOS controls **when** background fetch runs — could be hours or days apart
- Frequency depends on user usage patterns (more frequent for apps opened often)
- **Not reliable as sole mechanism** for daily updates

### Better Approach: BGTaskScheduler (iOS 13+)
```swift
BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.ramadanclock.refresh", using: nil) { task in
    self.handleAppRefresh(task: task as! BGAppRefreshTask)
}
```
- More modern API, but still iOS-controlled timing
- Good as **supplementary** mechanism

### Practical Strategy
1. **Primary**: Recalculate + reschedule every time app opens (prayer times are calculable locally — no server needed!)
2. **Backup**: BGAppRefreshTask to reschedule if user hasn't opened app in days
3. **No server needed**: Prayer time calculations use latitude/longitude + astronomical formulas. Bundle the calculation library (e.g., [Adhan-Swift](https://github.com/batoulapps/adhan-swift) — MIT licensed, used by major apps)

---

## 5. Spatial Audio (Native Advantages)

### Current PWA Implementation
- Web Audio API `StereoPannerNode` for left/right panning toward Qibla
- Limited to stereo panning (no elevation, no head tracking)

### Native iOS Capabilities

#### AVAudioEngine + AVAudio3DMixing
```swift
let engine = AVAudioEngine()
let player = AVAudioPlayerNode()
let environment = AVAudioEnvironmentNode()

engine.attach(player)
engine.attach(environment)

// Position adhan source in 3D space relative to Qibla direction
environment.listenerPosition = AVAudio3DPoint(x: 0, y: 0, z: 0)
player.position = AVAudio3DPoint(x: qiblaX, y: 0, z: qiblaZ) // Based on compass heading vs Qibla bearing
```

#### CMHeadphoneMotionManager (AirPods Pro/Max)
```swift
let headphoneMotion = CMHeadphoneMotionManager()
headphoneMotion.startDeviceMotionUpdates(to: .main) { motion, error in
    // Update listener orientation based on head movement
    // Adhan "stays" in Qibla direction as user turns head
}
```

### Native vs Web Comparison

| Feature | Web (current) | Native iOS |
|---------|--------------|------------|
| Stereo panning | ✅ StereoPanner | ✅ AVAudio3DMixing |
| HRTF (3D audio) | ⚠️ Limited PannerNode HRTF | ✅ Full AVAudioEnvironmentNode HRTF |
| Head tracking | ❌ Not available | ✅ CMHeadphoneMotionManager (AirPods) |
| Elevation cues | ⚠️ Basic | ✅ Full 3D positioning |
| Background playback | ❌ Killed by Safari | ✅ With audio background mode |

**Native spatial audio is significantly better**, especially with AirPods head tracking. The adhan would feel like it's truly coming from the Qibla direction and stays fixed as the user moves their head.

---

## 6. Compass/Gyro Access

### CoreLocation CLHeading vs Web DeviceOrientation

| Feature | Web API | Native (CoreLocation) |
|---------|---------|----------------------|
| True north heading | ⚠️ Requires user gesture, permission prompt | ✅ Direct access, more reliable |
| Accuracy | ~5-10° typical | ~1-5° with calibration |
| Calibration UI | ❌ No control | ✅ Can prompt user to calibrate |
| Background access | ❌ No | ✅ With location background mode |
| Magnetometer raw data | ❌ Limited | ✅ Full CMMotionManager access |
| Reliability | ⚠️ Varies by browser, can fail silently | ✅ Consistent across iOS versions |

### Recommendation
Keep compass in webview for display purposes. Use native CoreLocation as the **source of truth** and inject heading data into webview via JavaScript bridge:

```swift
func locationManager(_ manager: CLLocationManager, didUpdateHeading heading: CLHeading) {
    let script = "window.nativeHeading = \(heading.trueHeading);"
    webView.evaluateJavaScript(script)
}
```

---

## 7. App Store Compliance

### Guideline 4.2 — Minimum Functionality
- **Risk**: Webview-only apps get rejected
- **Mitigation**: Native notifications, audio, spatial audio, compass = sufficient native functionality
- Prayer apps with similar hybrid approaches exist on the App Store (Muslim Pro started as hybrid)

### Guideline 3.1.1 — Payments & Donations

**Good news (as of 2025)**: Apple updated guidelines per US court ruling:
> *3.1.1(a): On the United States storefront, there is no prohibition on including buttons, external links, or other calls to action [to external payment]*

- **For US App Store**: You CAN link directly to external donation pages (PayPal, Stripe, masjid website) without Apple's 30% cut
- **Outside US**: Still restricted. Consider making donation links a web URL that opens Safari
- **Safest approach**: "Visit our website to support your local masjid" button → opens Safari → no IAP needed

### Guideline 1.1.5 — Religious Content
- No specific restrictions on religious apps
- Adhan audio is fine
- Qibla compass is fine
- Just avoid any content Apple might consider controversial

### Guideline 2.3.1 — App Completeness
- App must be fully functional for review (don't submit during off-season with "wait for Ramadan" messaging)
- Prayer times work year-round, so this is fine

---

## 8. Development Approach Comparison

### Option A: Swift + WKWebView + Native Modules ⭐ RECOMMENDED

| Aspect | Detail |
|--------|--------|
| **Architecture** | WKWebView loads PWA, native Swift modules handle audio/notifications/compass |
| **Communication** | `WKScriptMessageHandler` for web→native, `evaluateJavaScript` for native→web |
| **Timeline** | 4-6 weeks for MVP |
| **Complexity** | Medium — need to learn WKWebView bridging |
| **Maintenance** | Low-medium — PWA updates auto-reflected, native modules rarely change |
| **Best for** | Solo dev with existing PWA, time-constrained |

**MVP Scope (4 weeks)**:
- Week 1: Xcode project setup, WKWebView wrapper, basic JS bridge
- Week 2: Local notifications with adhan sounds, prayer time calculation (Adhan-Swift)
- Week 3: Native compass feeding heading to webview, AVAudioEngine spatial audio
- Week 4: Testing, App Store assets, TestFlight submission

### Option B: Full SwiftUI Rebuild

| Aspect | Detail |
|--------|--------|
| **Timeline** | 12-16 weeks |
| **Complexity** | High — rebuild all UI, animations, clock face in SwiftUI |
| **Maintenance** | Two completely separate codebases |
| **Best for** | Long-term if app becomes primary platform |

Not recommended given timeline. Could be a v2.0 goal for Ramadan 2027.

### Option C: React Native / Capacitor / Ionic

| Aspect | Detail |
|--------|--------|
| **Timeline** | 6-10 weeks |
| **Complexity** | Medium-high — new framework to learn, plugin ecosystem for native features |
| **Capacitor** | Closest to current PWA (web tech), good native bridge. Recommended if choosing this path |
| **React Native** | Would require rewrite in React Native components |
| **Maintenance** | Framework updates, plugin compatibility issues |
| **Best for** | Teams already using these frameworks |

Capacitor is interesting but adds a dependency layer. For a solo dev, Swift + WKWebView is simpler.

### Option D: PWA-to-Native Tools (PWABuilder, Median.co)

| Aspect | Detail |
|--------|--------|
| **PWABuilder** | Microsoft tool. Generates basic wrapper. No native audio/notification customization |
| **Median.co** | Commercial service. Better native integration, but costly (~$500+/yr) and vendor lock-in |
| **Timeline** | 1-2 weeks for basic wrapper |
| **Complexity** | Low |
| **Maintenance** | Dependent on third-party tool updates |
| **Limitation** | **Cannot do custom spatial audio, background adhan, or advanced notifications** |

**Not recommended** — our key features (spatial adhan, notifications, compass) require native code that these tools can't provide.

---

## 9. Certificates & Publishing

### Apple Developer Account
- **Cost**: $99/year
- **Sign up**: https://developer.apple.com/programs/
- **Requires**: Apple ID, identity verification (may take 24-48h)
- **⚠️ Sign up NOW if not already enrolled** — verification can delay things

### Development Certificates
1. Development certificate (for testing on device)
2. Distribution certificate (for App Store / TestFlight)
3. Provisioning profiles (auto-managed by Xcode recommended)

### TestFlight Beta Testing
- Upload build via Xcode → App Store Connect
- **Internal testing**: Up to 100 testers, no review needed, available immediately
- **External testing**: Up to 10,000 testers, requires brief Apple review (usually 24-48h)
- Great for getting community feedback during Ramadan 2026

### App Store Review Timeline
- **Typical review**: 24-48 hours
- **During holidays**: Can be 4-7 days
- **Rejection turnaround**: Fix + resubmit, usually re-reviewed in 24h
- **Tip**: Submit early, expect at least one rejection cycle

### App Store Assets Needed
- App icon (1024×1024)
- Screenshots: 6.7" (iPhone 15 Pro Max), 6.5" (iPhone 11 Pro Max), 5.5" (iPhone 8 Plus) — at minimum
- App description, keywords, privacy policy URL
- Age rating: 4+ (religious/educational content is fine)

---

## 10. Minimum Viable Native Features

### MUST Be Native (can't work in webview)

| Feature | Why |
|---------|-----|
| **Local notifications** | Web notifications unreliable/unsupported on iOS |
| **Background adhan audio** | WKWebView audio killed when backgrounded |
| **Notification sounds** | Must be bundled `.caf` files |
| **Background fetch** | For notification rescheduling |

### SHOULD Be Native (significantly better)

| Feature | Why |
|---------|-----|
| **Spatial audio** | AVAudioEngine + head tracking >>> Web Audio |
| **Compass heading** | CoreLocation more accurate and reliable |
| **App icon / launch screen** | Required for native app |

### CAN Stay in WebView

| Feature | Why |
|---------|-----|
| **Clock face UI** | Already beautiful in the PWA |
| **Prayer time display** | Works fine in web |
| **Settings UI** | Can stay in web, bridge selections to native |
| **City/country selection** | Web UI is fine |
| **Day/night theme** | CSS handles this well |
| **Animations** | Web animations are smooth enough |

---

## 11. Recommended Architecture

```
┌─────────────────────────────────────────┐
│              iOS App Shell              │
│  ┌─────────────────────────────────┐    │
│  │     WKWebView (PWA content)     │    │
│  │  - Clock face UI                │    │
│  │  - Settings                     │    │
│  │  - Prayer times display         │    │
│  └──────────┬──────────────────────┘    │
│             │ JS Bridge                  │
│  ┌──────────▼──────────────────────┐    │
│  │     Native Swift Modules        │    │
│  │  - NotificationManager          │    │
│  │  - AudioManager (AVAudioEngine) │    │
│  │  - CompassManager (CLLocation)  │    │
│  │  - PrayerTimeCalculator         │    │
│  │    (Adhan-Swift library)        │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### JS Bridge Messages (Web → Native)
```javascript
// From PWA JavaScript:
window.webkit.messageHandlers.scheduleNotifications.postMessage({
    prayers: [{ name: "Fajr", time: "05:47", sound: "adhan-fajr" }, ...]
});
window.webkit.messageHandlers.playAdhan.postMessage({
    sound: "adhan-makkah", qiblaBearing: 56.3
});
```

### Native → Web
```swift
webView.evaluateJavaScript("window.updateCompassHeading(\(heading))")
webView.evaluateJavaScript("window.onNativeReady()")
```

---

## 12. Key Dependencies

| Dependency | Purpose | License |
|-----------|---------|---------|
| [Adhan-Swift](https://github.com/batoulapps/adhan-swift) | Prayer time calculation | MIT |
| AVFoundation | Audio playback | System |
| CoreLocation | Compass heading | System |
| UserNotifications | Local notifications | System |
| CoreMotion | Headphone motion (AirPods) | System |

---

## 13. Timeline & Milestones

### Immediate (This Ramadan 2026 — Feb 17 start)
Given 3 days until Ramadan, a native app is **not feasible** for this Ramadan. Focus on:
- ✅ PWA works great as-is
- 📱 Users can "Add to Home Screen" on iOS
- 🔔 Consider adding Web Push (iOS 16.4+ supports it for home screen web apps!)

### Post-Ramadan 2026 (March–August)
| Week | Milestone |
|------|-----------|
| 1 | Apple Developer enrollment, Xcode project setup, WKWebView wrapper running |
| 2 | JS bridge working, native compass feeding heading to webview |
| 3 | Adhan-Swift integration, local notification scheduling |
| 4 | Adhan audio as notification sounds (30-sec clips), basic audio playback |
| 5 | AVAudioEngine spatial audio with Qibla positioning |
| 6 | CMHeadphoneMotionManager for AirPods head tracking |
| 7 | Background fetch for notification rescheduling |
| 8 | UI polish, app icon, screenshots, App Store listing |
| 9 | TestFlight internal beta |
| 10 | TestFlight external beta (community testing) |
| 11-12 | Bug fixes, App Store submission |

### Target: App Store by December 2026 → ready for Ramadan 2027

---

## 14. Quick Wins (Before Full iOS App)

### iOS Web Push Notifications (Available NOW)
Since iOS 16.4, PWAs added to Home Screen can send push notifications!

```javascript
// In your PWA service worker:
Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
        // Schedule via service worker
    }
});
```

This could give us prayer notifications from the PWA **without building a native app**. Worth investigating as a Ramadan 2026 solution.

---

## 15. Cost Summary

| Item | Cost |
|------|------|
| Apple Developer Account | $99/year |
| Mac for development | Required (already have?) |
| Adhan audio files | Free (public domain religious audio) |
| Adhan-Swift library | Free (MIT) |
| App Store hosting | Free (included in dev account) |
| **Total Year 1** | **~$99** |

---

## Decision Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Approach** | Option A: Swift + WKWebView + Native Modules | Best balance of speed and capability |
| **Audio** | 30-sec notification sound + full adhan on app open | Reliable, App Store compliant |
| **Notifications** | UNUserNotificationCenter, 12 days ahead (60 notifs) | Under 64 limit, refresh on app open |
| **Spatial Audio** | AVAudioEngine + CMHeadphoneMotionManager | Major upgrade over web |
| **Compass** | CoreLocation → inject to webview | More accurate, same UI |
| **Donations** | External link to masjid website | Avoids Apple 30% cut (legal per 2025 ruling) |
| **Timeline** | Build post-Ramadan 2026, ship before Ramadan 2027 | Realistic for solo dev |
| **This Ramadan** | PWA + investigate iOS web push | Ship what works now |
