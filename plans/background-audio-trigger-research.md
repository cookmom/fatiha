# Background Audio Trigger Research: iOS PWA

**Date:** 2026-02-14  
**Context:** Ramadan fasting clock PWA needs to trigger adhan audio at prayer times while app is backgrounded on iOS.  
**Status:** Foreground HRTF spatial adhan ✅ | Background audio continuity via MediaSession ✅ | **Triggering NEW audio from background ❌**

---

## TL;DR — The Honest Answer

**Pure PWA: It is not possible to reliably trigger new audio from a backgrounded web app on iOS.** iOS Safari suspends all JS execution when backgrounded. No web API can schedule future audio playback. The only two viable paths are:

1. **Silent audio keepalive + source swap** (hacky, battery-draining, fragile — but works for some people)
2. **Thin native wrapper with local notifications** (the real solution — ~100 lines of Swift)

Web Push notifications on iOS **can now make sound** (fixed in iOS 17+), but you get the **system notification sound**, not a custom adhan. And the service worker cannot play audio.

---

## 1. Web Push Notifications with Sound

### What works
- iOS 16.4+ supports Web Push for PWAs **added to home screen**
- Uses standard Push API + VAPID keys
- Service worker receives `push` event, calls `self.registration.showNotification()`
- As of **iOS 17+**, PWA notifications DO make the **default notification sound** (this was broken/silent in 16.4)
- PWA appears in Settings → Notifications with sound toggle (iOS 17+)

### What doesn't work
- **The `sound` property in the Notification API is deprecated and ignored on all platforms**
- **No custom notification sounds** — you get the system default or nothing
- **Service workers CANNOT access Audio API, Web Audio API, or play audio** — they have no DOM, no `<audio>`, no `AudioContext`
- The push event handler has ~30 seconds of execution time, but no audio capabilities
- You cannot trigger audio playback from the `notificationclick` event until the user taps the notification and the app opens

### Verdict: ❌ Cannot play custom adhan. Can only ding with system sound.

---

## 2. Service Worker Background Sync / Periodic Sync

### Background Sync API
- **iOS Safari: NOT SUPPORTED** (as of iOS 18/19)
- Only Chrome/Edge on Android support it
- WebKit has shown no signals of implementing it

### Periodic Background Sync
- **iOS Safari: NOT SUPPORTED**
- Only Chromium browsers support it, and even there it's very restricted
- Cannot schedule a sync for a specific time (it's opportunistic)

### Verdict: ❌ Not available on iOS.

---

## 3. Web Notifications API on iOS (16.4+)

### Capabilities
- Title, body, icon, badge, tag, data, actions (max 2 buttons)
- `requireInteraction` — NOT supported on iOS
- `silent` property — NOT supported (ironic)
- `image` — NOT supported
- **`sound` — DEPRECATED, NOT SUPPORTED** (was never really implemented anywhere)

### What actually happens
- iOS 17+ : notification arrives with default system sound (if Sound is enabled in Settings for the PWA)
- iOS 16.4: notifications were silent (bug/limitation)
- **Sound is the SYSTEM notification sound, not customizable from the web**
- Native apps can specify `.caf`/`.aiff` sound files up to 30 seconds — web apps cannot

### Verdict: ❌ System ding only. No custom audio. No adhan.

---

## 4. setTimeout/setInterval Before Backgrounding

### Behavior
- When iOS Safari goes to background, **all JS execution is suspended within seconds**
- Timers (setTimeout, setInterval) are **frozen, not cancelled**
- When app returns to foreground, they fire immediately (with accumulated delay)
- A setTimeout set for 71 minutes in the future will NOT fire while backgrounded
- **There is no "drift" — they simply don't run at all**

### Verdict: ❌ Completely useless for scheduled background tasks.

---

## 5. Web Workers / Shared Workers

### Behavior on iOS
- **Web Workers**: Suspended along with the page when backgrounded. Same fate as main thread.
- **Shared Workers**: iOS Safari has limited/buggy SharedWorker support. Also suspended.
- **Service Workers**: Only wake for push events and fetch events. Cannot self-wake on a schedule.
- None of these have access to Audio APIs even when running.

### Verdict: ❌ Suspended with the page.

---

## 6. Media Session API Tricks (Source Swapping)

### The Theory
If audio is already playing (via MediaSession), iOS keeps the web process alive to service the audio pipeline. Could we swap the audio source at the right time?

### The Reality
- **If audio is playing, JS IS alive** — timers run, code executes
- The MediaSession keepalive is REAL — this is how podcast/music PWAs work
- **Key insight: If you're already playing audio and JS is alive, you CAN swap sources**
- A `setTimeout` set before backgrounding WILL fire if audio keeps the process alive

### The Problem
- You need audio ALREADY PLAYING before the user backgrounds the app
- If the user backgrounds the app in silence (between prayers), there's no audio to keep JS alive
- You'd need to play *something* continuously... which leads to #7

### Verdict: ⚠️ Works IF audio is already playing. Leads directly to the silent audio approach.

---

## 7. Silent Audio Keepalive ⭐ (The Main Hack)

### How It Works
1. When user opens app, start playing a silent/near-silent audio loop
2. Use `<audio>` element (not Web Audio API) with MediaSession metadata
3. iOS keeps the web process alive to service the audio
4. JS timers continue running in background
5. At prayer time, swap `audio.src` to the adhan file

### Implementation

```javascript
// Start silent keepalive
const audio = new Audio('/silence-loop.mp3'); // 1-second silent MP3, looped
audio.loop = true;
audio.volume = 0.01; // near-silent, not zero (zero might be optimized away)
await audio.play();

// Set up MediaSession so iOS treats this as "real" audio
navigator.mediaSession.metadata = new MediaMetadata({
  title: 'Prayer Times Active',
  artist: 'Ramadan Clock',
});

// Schedule prayer
const msUntilPrayer = prayerTime - Date.now();
setTimeout(() => {
  audio.loop = false;
  audio.src = '/adhan-full.mp3';
  audio.volume = 1.0;
  audio.play();
}, msUntilPrayer);
```

### The MediaStreamDestination Trick
A Reddit post (June 2025) found that routing Web Audio API through `mediaStreamDestination` tricks Safari into treating it as a live stream, enabling background execution:

```javascript
const ctx = new AudioContext();
const bufferSize = 2 * ctx.sampleRate;
const emptyBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
const source = ctx.createBufferSource();
source.buffer = emptyBuffer;
source.loop = true;
const node = ctx.createMediaStreamDestination();
source.connect(node);
const audio = document.createElement('audio');
audio.srcObject = node.stream;
audio.play();
```

### Known Issues
- **Battery drain**: Keeping audio pipeline active continuously drains battery (~2-5% per hour estimated)
- **User must initiate**: Audio play requires a user gesture first (tap to "enable background alerts")
- **Reliability**: iOS may still kill the process after extended periods (hours) to reclaim memory
- **Lock screen controls**: Silent audio shows in Control Center/lock screen (weird UX)
- **Audio interruptions**: Phone calls, other apps playing audio may kill the keepalive
- **PWA standalone**: Background audio in PWA standalone mode was broken until iOS 15.4 (WebKit bug 198277). Now works.
- **Not zero volume**: Setting volume to exactly 0 may cause iOS to optimize away the audio session. Use 0.01.

### Confirmed Working By
- Multiple SO answers confirm silent MP3 loop keeps PWA alive in background
- SO answer on PWA standalone audio: "I resolved this issue by playing a silent MP3 in the background to prevent the PWA from being killed"
- The `mediaStreamDestination` trick confirmed working June 2025

### Verdict: ⚠️ WORKS but fragile, battery-hungry, and hacky. Best pure-web option available.

---

## 8. Wake Lock API

- **iOS Safari: NOT SUPPORTED** (as of iOS 18)
- Screen Wake Lock API is supported on Chrome/Edge
- Even where supported, it only prevents screen dimming, doesn't prevent JS suspension
- Would not help with background audio anyway

### Verdict: ❌ Not available on iOS.

---

## 9. APN (Apple Push Notification) via Web

### Setup
- Web Push on iOS uses the standard Web Push protocol (RFC 8030) with VAPID
- Does NOT use the native APNs `.p8` key directly (though Apple's push infrastructure backs it)
- Requires: HTTPS, Service Worker, Web App Manifest, added to home screen
- Server sends push at prayer time → service worker wakes → shows notification

### What the notification can do
- Show title, body, icon
- Play **system default notification sound** (iOS 17+)
- Badge the app icon
- Open the app when tapped (via `notificationclick`)

### What it CANNOT do
- Play custom audio
- Play audio longer than the system notification sound (~2 seconds)
- Execute arbitrary JS beyond showing the notification
- Keep running after the push event handler completes

### Could we play audio in the push event handler?
**NO.** Service workers have no audio API access. They cannot create `Audio` objects or `AudioContext`. The push event gives you ~30 seconds but only for fetch/notification operations.

### Verdict: ⚠️ Can send timed notifications with system sound. Cannot play custom adhan audio.

---

## 10. What Do Existing Prayer Apps Do?

### Native Apps (what they do)
- **Muslim Pro, Athan Pro, Al-Moazzin**: Use iOS `UNNotificationRequest` with scheduled local notifications
- Custom sound files up to **30 seconds** in `.caf`/`.aiff`/`.wav` format bundled with the app
- For full adhan (2-5 minutes): Use **Notification Content Extension** or **background audio session** triggered by notification action
- Some use **silent push + local notification** combo

### Prayer PWAs
- **No PWA has solved full background adhan on iOS.** Every prayer app that plays adhan in background is native.
- Web-based prayer tools (like islamicfinder.org, aladhan.com) only work in foreground
- Some PWAs use the push notification approach for alerts (system sound only)
- The common advice in every forum/SO thread: "You need a native app for this"

### Verdict: ❌ No PWA has solved this. All background adhan apps are native.

---

## 11. Scheduling API / Task Scheduling API

### Scheduler.postTask()
- Prioritized task scheduling API — for **foreground** task prioritization only
- Not designed for background/future scheduling
- Not relevant to this problem

### Web Scheduling API (proposed)
- No browser implements a "schedule task for future time" web API
- TC39 has no active proposal for this

### Alarm API (abandoned)
- Was proposed years ago, never implemented
- Would have been perfect for this use case

### Verdict: ❌ No such API exists.

---

## 12. Creative Hacks

### WebRTC Keepalive
- Creating a dummy RTCPeerConnection might keep some networking alive
- **Does NOT keep JS execution alive on iOS** when backgrounded
- Tested and debunked by multiple developers

### WebSocket Keepalive  
- WebSocket connections are suspended/dropped when iOS backgrounds the app
- Server cannot "wake" the client via WebSocket
- Only Push API can wake a service worker

### Background Fetch API
- **Not supported on iOS Safari**
- Even on Chrome, it's for large downloads, not audio playback
- Cannot trigger audio

### `<video>` with Audio Track
- Same behavior as `<audio>` — keeps process alive if actively playing
- No advantage over the silent audio approach
- More resource-intensive

### Notification API `vibrate` Property
- Not supported on iOS
- Even where supported, vibration ≠ audio

### Page Visibility API + Aggressive Pre-scheduling
- Detect `visibilitychange` to 'hidden'
- Set up all timers before page suspends
- **Only works if silent audio keepalive is also running** (otherwise timers freeze)

### `beforeunload` / `freeze` / `resume` Events
- `freeze` and `resume` (Page Lifecycle API) not fully supported on iOS Safari
- Even with these events, you can't prevent suspension

### Verdict: ❌ No creative hack solves the fundamental problem without silent audio keepalive.

---

## 13. The Recommended Path

### Option A: Silent Audio Keepalive (Pure Web — Hacky)

**Pros:**
- No native code
- Works today on iOS 15.4+
- Full custom adhan audio

**Cons:**
- Battery drain (2-5% per hour)
- Can be killed by iOS memory pressure
- Weird UX (audio controls visible on lock screen)
- Not reliable for extended periods (8+ hours)
- User must explicitly "activate" before backgrounding

**Best for:** Short sessions where user backgrounds briefly. Not reliable for "set and forget all day."

### Option B: Web Push + System Sound (Pure Web — Limited)

**Pros:**
- No battery drain
- Reliable delivery
- Works even if app is killed

**Cons:**
- System notification sound only (~2 sec ding)
- Not a real adhan
- Requires server infrastructure for push
- Requires iOS 17+ for sound
- Must be added to home screen

**Best for:** Alerting user it's prayer time. They open the app to hear the adhan.

### Option C: Thin Native Wrapper ⭐ (Recommended)

**The minimum viable native wrapper:**

```swift
// ~100 lines of Swift
import UIKit
import WebKit
import UserNotifications

class ViewController: UIViewController {
    var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Set up WKWebView loading your PWA
        let config = WKWebViewConfiguration()
        config.userContentController.add(self, name: "schedulePrayer")
        webView = WKWebView(frame: view.bounds, configuration: config)
        view.addSubview(webView)
        webView.load(URLRequest(url: URL(string: "https://your-pwa.com")!))
        
        // Request notification permission
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
    }
}

extension ViewController: WKScriptMessageHandler {
    func userContentController(_ controller: WKUserContentController, 
                               didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let timeInterval = body["timeInterval"] as? Double,
              let prayerName = body["prayerName"] as? String else { return }
        
        // Schedule local notification with custom sound
        let content = UNMutableNotificationContent()
        content.title = "Prayer Time"
        content.body = "\(prayerName) prayer time"
        content.sound = UNNotificationSound(named: UNNotificationSoundName("adhan.caf"))
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)
        let request = UNNotificationRequest(identifier: prayerName, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }
}
```

**From your web code:**
```javascript
// Bridge to native
window.webkit?.messageHandlers?.schedulePrayer?.postMessage({
    prayerName: 'Asr',
    timeInterval: (asrTime - Date.now()) / 1000
});
```

**Key details:**
- Custom notification sounds: up to **30 seconds**, `.caf`/`.aiff`/`.wav` format
- For full adhan (2-5 min): Use **Notification Service Extension** to trigger background audio session, or use **UNNotificationContentExtension** for rich notification with audio player
- 99% of your code stays as web — only notification scheduling is native
- Can be wrapped with **Capacitor** for easier build process (they have a LocalNotifications plugin that does exactly this)

### Option D: Capacitor Wrapper (Easiest Native Path)

```bash
npm install @capacitor/core @capacitor/ios @capacitor/local-notifications
npx cap init
npx cap add ios
```

```javascript
import { LocalNotifications } from '@capacitor/local-notifications';

await LocalNotifications.schedule({
    notifications: [{
        title: "Asr Prayer",
        body: "It's time for Asr prayer",
        id: 3,
        schedule: { at: new Date(asrTime) },
        sound: "adhan.caf", // placed in ios/App/App/sounds/
    }]
});
```

**Pros:**
- Keep 100% of web code
- ~10 lines of JS for the notification bridge  
- Capacitor handles all the native plumbing
- Custom sounds up to 30 seconds
- Reliable, battery-friendly, works when app is killed
- Can still distribute as PWA for Android (with web push fallback)

**Cons:**
- Need Apple Developer account ($99/year)
- App Store review process
- Need to maintain Xcode project
- App Store rejection risk if it's "just a web wrapper" (mitigated by the notification feature being genuinely native)

---

## Final Recommendation

**For Ramadan 2026 (shipping fast):**
1. **Implement Option B (Web Push)** as the baseline — system sound notification at prayer time
2. **Implement Option A (Silent Audio Keepalive)** as an opt-in "enhanced mode" with clear battery warning
3. Combine: Push notification arrives → user taps → app opens → adhan plays

**For long-term:**
4. **Build Capacitor wrapper (Option D)** — keeps all web code, adds native local notifications with custom 30-second adhan sound
5. Ship to App Store alongside the PWA
6. PWA users get push notifications + tap-to-hear; App Store users get automatic adhan

---

## Key Sources
- WebKit Bug 198277: Background audio in standalone PWA (fixed iOS 15.4)
- WebKit Bug 261858: Autoplay in audio element in standalone PWA
- Apple Discussions thread 254759442: PWA notification sound (fixed iOS 17)
- Apple Developer Forums thread 728022: iOS 16.4 PWA notifications silent
- Reddit r/webdev (June 2025): mediaStreamDestination trick for Safari background audio
- Stack Overflow: Multiple threads confirming silent MP3 keepalive technique
- Capacitor Local Notifications docs: Native scheduling with custom sounds
