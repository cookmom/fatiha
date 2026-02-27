# iOS Background Adhan: Deep Dive Research

**The #1 reason to go native. A web app cannot do this.**  
**Updated**: February 14, 2026

---

## TL;DR — The Hard Truth

**iOS does not allow apps to start audio playback at an arbitrary future time while backgrounded.** There is no reliable "alarm clock" API. Every prayer app faces this same wall. Here's what actually works, ranked by reliability:

| Approach | Full Adhan? | Reliability | App Store Safe? | Complexity |
|----------|-------------|-------------|-----------------|------------|
| 30s notification sound | ❌ 30s max | ★★★★★ | ✅ Yes | Low |
| Notification → user taps → full audio | ✅ Yes | ★★★★☆ (needs tap) | ✅ Yes | Low |
| Silent push → background audio | ✅ Yes | ★★★☆☆ (delayed) | ⚠️ Gray area | High |
| Critical Alert (30s) | ❌ 30s max | ★★★★★ | ✅ If approved | Low |
| CallKit fake call | ✅ Yes | ★★★★☆ | ❌ **Will get rejected** | Medium |
| Background audio keepalive | ✅ Yes | ★★★★☆ | ❌ **Will get rejected** | Medium |

**What major prayer apps actually do: 30-second notification sound. That's it.** Muslim Pro, Athan, Namaz — they all hit the same iOS limit and tell their users the same thing.

---

## 1. UNUserNotificationCenter — Custom Audio

### How It Works
```swift
let content = UNMutableNotificationContent()
content.title = "Fajr"
content.body = "It's time for Fajr prayer"
content.sound = UNNotificationSound(named: UNNotificationSoundName("adhan-makkah.caf"))

let trigger = UNCalendarNotificationTrigger(
    dateMatching: DateComponents(year: 2026, month: 2, day: 18, hour: 5, minute: 47),
    repeats: false
)
let request = UNNotificationRequest(identifier: "fajr-2026-02-18", content: content, trigger: trigger)
UNUserNotificationCenter.current().add(request)
```

### Hard Limits
| Constraint | Value |
|-----------|-------|
| **Max audio duration** | **30 seconds** — this is enforced by iOS, not a bug |
| **Audio format** | `.caf`, `.aiff`, `.wav` (no `.mp3` in notification sounds) |
| **File size** | Should be reasonable (few MB ok) |
| **Max scheduled notifications** | **64 per app** |
| **Behavior if audio > 30s** | iOS plays **default system sound** instead — worse than silence |

### Can We Play a Full 2.5-Min Adhan via Notification?

**No. Absolutely not.** If the audio file exceeds 30 seconds, iOS ignores it entirely and plays the default ding. This is documented behavior and hasn't changed since iOS 10.

### Best Strategy for Notifications
1. **Trim adhan to 30 seconds** — capture the most recognizable portion (the opening "Allahu Akbar" takbirs)
2. **Convert to .caf format**: `afconvert adhan.mp3 adhan.caf -d aac -f caff`
3. **Bundle multiple adhans** — Makkah, Madinah, Al-Aqsa, each trimmed to 30s
4. **Notification action button**: "🔊 Hear Full Adhan" → opens app → plays complete adhan with spatial audio
5. **Schedule 12 days ahead** (5 prayers × 12 = 60, under the 64 limit)

### The "Hear Full Adhan" Action
```swift
let fullAdhanAction = UNNotificationAction(
    identifier: "FULL_ADHAN",
    title: "🔊 Hear Full Adhan",
    options: [.foreground] // Opens the app
)
let category = UNNotificationCategory(
    identifier: "PRAYER_TIME",
    actions: [fullAdhanAction],
    intentIdentifiers: []
)
UNUserNotificationCenter.current().setNotificationCategories([category])
```

When tapped, `userNotificationCenter(_:didReceive:withCompletionHandler:)` fires → start full adhan with AVAudioEngine spatial audio.

---

## 2. BGTaskScheduler — Can We Schedule at Exact Times?

### BGAppRefreshTask
- **Purpose**: Small, periodic data refresh
- **Timing control**: You set `earliestBeginDate`, but **iOS decides the actual execution time**
- **Accuracy**: Can be minutes to **hours** late. Sometimes doesn't run for days.
- **Duration**: ~30 seconds of execution time
- **Verdict**: ❌ **Completely unsuitable for prayer time precision**

### BGProcessingTask
- **Purpose**: Long-running tasks (ML, backups)
- **Timing**: Runs during optimal conditions (charging, Wi-Fi, idle)
- **Accuracy**: Even worse than BGAppRefreshTask for timing
- **Duration**: Several minutes
- **Verdict**: ❌ **Cannot use for time-critical audio**

### Can BGTaskScheduler Start Audio Playback?
Technically, within the 30-second window of a BGAppRefreshTask, you could start an AVAudioPlayer. But:
1. The task timing is unreliable (could fire 2 hours late)
2. Apple explicitly says background tasks are for data, not user-facing actions
3. App Review would likely catch and reject this pattern

### Practical Use of BGTaskScheduler
Use it **only** for notification maintenance:
```swift
func handleAppRefresh(task: BGAppRefreshTask) {
    // Recalculate prayer times if they're getting stale
    // Reschedule the next 12 days of notifications
    scheduleNotificationsForNext12Days()
    
    // Schedule next refresh
    scheduleAppRefresh()
    
    task.setTaskCompleted(success: true)
}
```
This ensures notifications stay fresh even if the user doesn't open the app for 2+ weeks.

---

## 3. AVAudioSession Background Mode

### The "Audio" Background Capability
When you enable "Audio, AirPlay, and Picture in Picture" in Background Modes:

```swift
let session = AVAudioSession.sharedInstance()
try session.setCategory(.playback, mode: .default)
try session.setActive(true)
```

This allows **already-playing audio to continue** when the app is backgrounded. Key word: **already playing**.

### Can We START Audio from Background?
This is the critical question:

| Scenario | Works? |
|----------|--------|
| Audio playing → user locks screen | ✅ Continues |
| Audio playing → user switches apps | ✅ Continues |
| App in background → try to start new audio | ⚠️ Unreliable |
| App suspended → try to start audio | ❌ No |
| App terminated → try to start audio | ❌ No |

### The "Silent Audio" Keepalive Trick
Some developers play a silent audio loop to keep the app "alive":
```swift
// DON'T DO THIS
let silentPlayer = AVAudioPlayer(contentsOf: silentAudioURL)
silentPlayer.numberOfLoops = -1
silentPlayer.volume = 0
silentPlayer.play()
// App stays "alive" in background, then play real adhan at prayer time
```

**This used to work but Apple now rejects apps for this.** App Review specifically checks for silent/inaudible audio being used to prevent suspension. Guideline 2.5.4.

### From a Notification Content Extension?
A Notification Content Extension can present custom UI but **cannot start AVAudioPlayer** in a meaningful way. The extension has very limited capabilities.

### From a Notification Action (User Tap)?
**Yes — this is the legitimate path:**
1. Notification fires at prayer time (30s adhan sound)
2. User taps the notification or the "Full Adhan" action
3. App opens in foreground
4. Full AVAudioEngine spatial adhan plays
5. User can lock phone → audio continues (background audio mode)

This is the only fully reliable, App Store-safe way to play a full adhan.

---

## 4. Silent Push + Audio Combo

### Theory
1. Server sends silent push notification at prayer time
2. iOS wakes app briefly (~30 seconds of execution)
3. App starts AVAudioPlayer with background audio session
4. Audio continues after the execution window closes

### Reality Check

| Issue | Detail |
|-------|--------|
| **Timing** | Silent pushes can be **delayed by minutes or hours**. iOS batches them. In Low Power Mode, they're heavily throttled |
| **Reliability** | Apple docs: "The system treats silent notifications as low-priority" |
| **Rate limiting** | iOS may not deliver if sent too frequently |
| **Server required** | Need a server running 24/7 to send pushes at prayer times |
| **Budget** | APNs itself is free, but server hosting costs money |
| **App Review risk** | Medium — Apple may question why you need silent pushes if local notifications work |

### Does the Audio Actually Continue?
If you manage to start AVAudioPlayer during the silent push execution window, and you have the audio background mode enabled, the audio **should** continue playing. But the unreliable delivery timing makes this a non-starter for prayer times.

### Verdict
❌ **Not recommended as primary mechanism.** Too unreliable for time-critical use. Could work as a supplementary system for "best effort" full adhan, but local notification sound should be the primary alert.

---

## 5. CallKit Abuse

### How It Works (In Theory)
Some prayer apps have reportedly used CallKit to trigger an incoming call UI at prayer time:

```swift
let provider = CXProvider(configuration: CXProviderConfiguration())
let update = CXCallUpdate()
update.remoteHandle = CXHandle(type: .generic, value: "Fajr Prayer")
update.hasVideo = false
provider.reportNewIncomingCall(with: UUID(), update: update) { error in }
```

This would:
- Show the full-screen incoming call UI
- Play a ringtone (adhan) at full volume
- Bypass Do Not Disturb
- Ring until dismissed

### Apple's Position: **Absolutely Not**

> **Guideline 2.5.4**: Apps should not use CallKit unless they are VoIP apps with actual calling functionality.

- Apple specifically cracked down on this pattern in 2019-2020
- Apps using CallKit for non-VoIP purposes are **rejected on sight**
- Existing apps that slipped through are being caught in re-reviews
- CallKit was restricted in China entirely due to regulatory concerns

### Verdict
❌ **Do not use. Guaranteed rejection.** Also ethically questionable — it confuses users and abuses a system API.

---

## 6. Critical Alerts

### What They Are
Critical Alerts bypass Do Not Disturb and the mute switch. They play sound even when the phone is silenced.

```swift
content.sound = UNNotificationSound.defaultCriticalSound(withAudioVolume: 1.0)
// Or with custom sound:
content.sound = UNNotificationSound.criticalSoundNamed(
    UNNotificationSoundName("adhan.caf"),
    withAudioVolume: 0.8
)
```

### Requirements
1. **Special entitlement required**: `com.apple.developer.usernotifications.critical-alerts`
2. **Must request from Apple**: https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/
3. **Apple reviews your use case** before granting
4. **User must also grant permission** (separate from regular notification permission)

### Can a Religious/Prayer App Qualify?

Apple's documentation says Critical Alerts are for:
- Medical & health alerts
- Home security
- Public safety
- **Other time-sensitive situations where user safety is at stake**

Prayer apps don't fit the stated categories. However:

- Some prayer apps **have reportedly received the entitlement** — unconfirmed
- The request form has a free-text field where you can make your case
- You could argue: "millions of Muslims rely on prayer time alerts that cannot be silenced, similar to medical reminders"
- **Likelihood of approval: LOW** (maybe 20-30%), but worth applying

### Even If Approved
- Still limited to **30 seconds of audio** (same notification sound limit)
- The advantage is bypassing DND and mute, not longer audio
- User sees a separate permission prompt: "Allow Critical Alerts?"

### Recommendation
**Apply for the entitlement** — it costs nothing and the worst they say is no. But don't design around it. Design around standard notifications and treat Critical Alerts as a bonus if granted.

Application URL: https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/

---

## 7. What Do Existing Prayer Apps Actually Do?

### Muslim Pro (100M+ downloads)
- **Notification with 30s adhan clip** — confirmed in their support docs
- Support page explicitly says: *"The operating system limits notification audio to 30 seconds"*
- Users must tap notification to hear full adhan
- Uses local notifications, not push
- Schedules notifications ahead based on calculated prayer times
- Has Live Activities for countdown

### Athan by IslamicFinder (50M+ downloads)
- Same 30s notification approach
- Added **Live Activities** (Dynamic Island + lock screen) for prayer countdown
- Notification action to open app for full adhan
- **Apple Watch app** with complications
- Their App Store reviews confirm users complain about 30s limit

### Namaz (Prayer Times & Qibla)
- Explicitly tells users in App Store response: *"The operating system of iPhones limits notifications to 30 seconds. That's the reason why we cannot proceed with the full adhan."*
- Same pattern: 30s clip + tap for full

### Al-Moazin
- Similar approach
- Some versions reportedly tried the silent audio keepalive trick years ago
- Current versions use standard 30s notification

### Pillars
- Beautiful design, privacy-focused
- **Live Activities** with fasting countdown (Suhoor/Iftar)
- Home screen widgets + lock screen widgets
- 30s adhan notification, same as everyone

### Key Takeaway
**Every major prayer app on iOS uses the same approach because iOS gives them no other option.** The 30-second limit is universal. No prayer app has found a legitimate workaround.

---

## 8. Notification Service Extension

### What It Is
`UNNotificationServiceExtension` lets you modify a **remote (push) notification** before it's displayed. Runs as a separate process.

```swift
class NotificationService: UNNotificationServiceExtension {
    override func didReceive(_ request: UNNotificationRequest, 
                           withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        let content = request.content.mutableCopy() as! UNMutableNotificationContent
        // Modify content, download attachments, etc.
        contentHandler(content)
    }
}
```

### Can It Extend Audio Beyond 30s?

**No.** Here's why:

1. **Only works with remote notifications** — not local notifications. We use local.
2. **Execution time limit**: ~30 seconds before `serviceExtensionTimeWillExpire()` is called
3. **Same 30s sound limit applies** — the extension modifies content, but the sound is still played by the notification system, which enforces the 30s cap
4. **Cannot start AVAudioPlayer** — extensions have even more restricted capabilities than the main app
5. **Cannot start background audio session** — no access to audio background mode

### Could We Use It Creatively?
One theoretical approach:
1. Server sends push at prayer time with `mutable-content: 1`
2. Extension fires, has 30s of execution
3. Extension tries to start audio... **No. Extensions can't access AVAudioSession.**

### Verdict
❌ **Cannot bypass the 30-second limit.** Notification Service Extension is for modifying notification content (adding images, decrypting text), not for audio tricks.

---

## 9. Live Activities & Dynamic Island 🌟

**This is the most exciting native feature for our app.** While we can't solve the 30s audio limit, Live Activities provide something the web absolutely cannot.

### What They Offer
- **Lock screen**: Persistent countdown widget showing time until next prayer/iftar/suhoor
- **Dynamic Island**: Compact and expanded views on iPhone 14 Pro+
- **StandBy mode**: Visible when phone is on a charger in landscape

### Implementation (ActivityKit)

```swift
struct FastingAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var nextPrayer: String
        var timeRemaining: TimeInterval
        var isFasting: Bool
    }
    var startDate: Date
}

// Start a Live Activity
let attributes = FastingAttributes(startDate: .now)
let state = FastingAttributes.ContentState(
    nextPrayer: "Maghrib (Iftar)",
    timeRemaining: 3600,
    isFasting: true
)
let activity = try Activity.request(
    attributes: attributes,
    content: .init(state: state, staleDate: nil),
    pushType: nil
)
```

### What We Can Show
- ⏱️ **Countdown to Iftar** (during fasting hours) — "Iftar in 2h 34m"
- 🌅 **Countdown to Suhoor end** (pre-dawn) — "Suhoor ends in 45m"
- 🕌 **Next prayer name + time** — "Asr at 3:47 PM"
- 📅 **Ramadan day** — "Day 15 of 30"
- 🧭 **Qibla direction** (in expanded Dynamic Island view)

### Constraints
| Constraint | Value |
|-----------|-------|
| Max duration | 8 hours (extended to 12h in some iOS versions), then system may end it |
| Update frequency | Unlimited via ActivityKit, limited via push |
| Stale date | You set when content becomes stale |
| Max concurrent | System-limited, typically 1-2 per app |

### Strategy for Fasting Day
1. **Suhoor Activity**: Start at ~1h before Fajr, countdown to Imsak
2. **Fasting Activity**: Start at Fajr, countdown to Maghrib (Iftar) — this is the long one (~14-16h)
3. Since max duration is 8-12h, update/restart midday
4. **Prayer Activity**: Between each prayer, show countdown to next prayer

### This Is a KILLER Feature
- Users glance at lock screen → see exactly how long until Iftar
- No other web app can do this
- Competing apps (Pillars, Athan Pro) already have this — we need it too
- Relatively straightforward to implement with SwiftUI

---

## 10. watchOS Complication

### Feasibility: ✅ Very Feasible

Prayer time complications are well-suited to the Apple Watch:

### WidgetKit (watchOS 9+, replaces ClockKit)
```swift
struct PrayerTimeComplication: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "prayerTime", provider: PrayerTimeProvider()) { entry in
            PrayerTimeComplicationView(entry: entry)
        }
        .configurationDisplayName("Next Prayer")
        .description("Shows the next prayer time")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline,
            .accessoryCorner
        ])
    }
}
```

### What It Can Show
| Complication Family | Content |
|-------------------|---------|
| **Circular** | Prayer icon + countdown ring |
| **Rectangular** | "Asr 3:47 PM · in 2h 14m" |
| **Inline** | "Asr 3:47" (single line on watch face) |
| **Corner** | Prayer name + time |

### Features
- **Haptic alerts**: Tap wrist at prayer time (works silently in meetings/masjid!)
- **Qibla compass**: Use watch compass for Qibla direction
- **Fasting status**: "Fasting · Iftar in 4h"
- **Timeline-based**: WidgetKit supports timeline entries — pre-compute all prayer times for the day

### Complexity Assessment
| Aspect | Effort |
|--------|--------|
| Standalone watch app | Medium (2-3 weeks) |
| Complications only | Low-medium (1-2 weeks) |
| Haptic notifications | Low (built into watchOS notifications) |
| Shared data (iPhone ↔ Watch) | Low (WatchConnectivity or shared App Group) |

### Recommendation
**Phase 2 feature.** Build the iPhone app first. Watch app is a natural and valuable extension but not MVP.

---

## 11. Recommended Architecture — Final

Based on all research, here's the definitive approach:

### Primary Alert System (Reliable, App Store Safe)
```
Prayer Time Arrives
       │
       ▼
┌──────────────────────────┐
│ Local Notification fires  │
│ • 30-second adhan clip    │
│ • Shows prayer name/time  │
│ • Action: "Full Adhan 🔊" │
└──────────┬───────────────┘
           │
     User taps
           │
           ▼
┌──────────────────────────┐
│ App opens in foreground   │
│ • Full 2.5-min adhan      │
│ • AVAudioEngine spatial   │
│ • Qibla-directed audio    │
│ • AirPods head tracking   │
│ • User locks phone →      │
│   audio continues (bg)    │
└──────────────────────────┘
```

### Supplementary Systems
```
┌─────────────────────────────────┐
│ BGAppRefreshTask (daily-ish)    │
│ • Recalculate prayer times     │
│ • Top up notification schedule  │
│   (maintain 12 days ahead)     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Live Activity (always visible)  │
│ • Lock screen countdown         │
│ • Dynamic Island (Pro phones)   │
│ • "Iftar in 3h 22m"            │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Critical Alert (if approved)    │
│ • Same 30s adhan                │
│ • But bypasses DND + mute       │
│ • Apply for entitlement early   │
└─────────────────────────────────┘
```

### Audio File Preparation
```bash
# Convert full adhan to 30s notification sound
ffmpeg -i adhan-makkah-full.mp3 -t 30 -acodec pcm_s16le adhan-makkah-30s.wav
afconvert adhan-makkah-30s.wav adhan-makkah-30s.caf -d aac -f caff

# Prepare full adhan for in-app playback (can be .mp3 or .m4a)
# No conversion needed, AVAudioEngine handles common formats

# Prepare multiple muezzins:
# adhan-makkah-30s.caf  (Sheikh Ali Mullah)
# adhan-madinah-30s.caf (Sheikh Essam Bukhari)  
# adhan-alaqsa-30s.caf
# adhan-mishary-30s.caf (Mishary Rashid Alafasy)
```

---

## 12. Feature Comparison: Web vs Native

| Feature | PWA (Current) | Native iOS App |
|---------|--------------|----------------|
| Prayer time alerts when backgrounded | ❌ Unreliable | ✅ 30s notification sound |
| Full adhan when backgrounded | ❌ Impossible | ⚠️ Requires user tap |
| Bypass Do Not Disturb | ❌ No | ⚠️ With Critical Alert entitlement |
| Lock screen countdown | ❌ No | ✅ Live Activities |
| Dynamic Island | ❌ No | ✅ ActivityKit |
| Apple Watch | ❌ No | ✅ WidgetKit complications |
| Spatial audio while locked | ❌ No | ✅ AVAudioEngine + background mode |
| Haptic alerts | ❌ No | ✅ Watch haptics |
| Home screen widget | ❌ No | ✅ WidgetKit |

---

## 13. Honest Assessment

### What We CAN Deliver (Guaranteed)
- ✅ 30-second adhan at exact prayer times, even when phone is locked
- ✅ Full 2.5-min spatial adhan when user taps the notification
- ✅ Live Activity countdown on lock screen all day
- ✅ Home screen & lock screen widgets
- ✅ Reliable scheduling for all 5 daily prayers, 12 days ahead
- ✅ Background audio continuation after user starts playback

### What We CANNOT Deliver (iOS Limitation)
- ❌ Full adhan automatically playing while phone is locked (without user interaction)
- ❌ Bypassing the 30-second notification sound limit
- ❌ Guaranteed DND bypass (without Critical Alert entitlement)
- ❌ Alarm-like behavior that's impossible to miss

### The Uncomfortable Truth
No iOS app — not even Muslim Pro with 100M downloads — can play a full adhan while the phone is locked without user interaction. **This is an iOS platform limitation, not a development limitation.** Android apps CAN do this (AlarmManager + foreground service), which is why Android prayer apps have a better adhan experience.

Our competitive advantage isn't "better background audio" (impossible) — it's:
1. **Spatial audio toward Qibla** (unique differentiator)
2. **Beautiful clock UI** (already built)
3. **Live Activities** (persistent visibility)
4. **30s of the most beautiful adhan clips** (curate the best portions)

---

## Action Items

1. **Immediately**: Apply for Critical Alert entitlement (costs nothing, takes weeks to hear back)
2. **Week 1**: Set up Xcode project, implement 30s notification adhan
3. **Week 2**: Live Activities for fasting countdown
4. **Week 3**: Full adhan playback with spatial audio (on notification tap)
5. **Week 4**: Widgets + polish
6. **Later**: watchOS complication (Phase 2)
