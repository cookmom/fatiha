# Brett Research Queue

## 1. Compass Reliability (in progress)
- iOS Safari deviceorientation flakiness — sometimes doesn't pick up phone/iPad motion

## 2. Adhan Deduplication (next)
Research + implement fixes for two adhan issues:
- **No repeat after hearing**: Once the user has heard the adhan for a prayer time, it should NOT sound again (e.g. if they reopen the app or refresh). Needs some persistence — localStorage flag per prayer time per day?
- **Multiple tabs/pages**: If multiple tabs are open, only ONE should play the adhan. Otherwise it's chaos — adhan x3 from 3 tabs. Research BroadcastChannel API, SharedWorker, or localStorage-based leader election to coordinate across tabs.
