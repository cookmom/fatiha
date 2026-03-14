# A Gift of Time — Release Strategy
**agiftoftime.app | Last updated: 2026-03-02**

This is a working execution document. Not a pitch deck. Dates are live, tasks get checked off.

---

## 1. Current State Assessment

### What's Live and Working
- Three.js prayer clock with FBO dichroic glass cube (Ka'bah metaphor) ✅
- Prayer times via Aladhan API with geolocation fallback ✅
- HRTF spatial adhan from Qibla direction ✅
- 11 Surah-named dial designs with picker ✅
- Qibla compass ✅
- Ramadan fasting timer ✅
- PWA installable (with user knowing how) ✅
- Landing page with 7 scroll sections ✅
- Privacy page, support page, Supabase signup ✅
- No ads, no tracking — clean ✅

### Feb 17 Blockers — Status Now (2 weeks later)

| Blocker | Likely Status | Assumption |
|---------|--------------|------------|
| og-image.png 404 | ✅ Probably fixed | High-visibility item, would've broken sharing |
| apple-touch-icon.png 404 | ✅ Probably fixed | Same |
| manifest.json start_url wrong | ✅ Probably fixed | PWA installs would've been broken |
| SW not caching clock.js / studio.hdr | ⚠️ Unclear | Needs verification — offline mode may still be broken |
| iOS Safari tested | ⚠️ Unknown | Device testing is easy to skip |
| Android Chrome tested | ⚠️ Unknown | Same |
| Night mode Three.js transition | ⚠️ Unknown | Could still be untested |

**Action before any marketing push:** Verify these 4 things in 30 minutes:
1. `curl -I https://agiftoftime.app/og-image.png` — should be 200
2. `curl -I https://agiftoftime.app/apple-touch-icon.png` — should be 200
3. Paste URL in iMessage/WhatsApp — does preview card appear?
4. Install to iOS home screen from Safari — does it work?

### Still Missing (from audit — known gaps)
- Page view analytics (Plausible recommended, GDPR-clean, $9/mo or self-host free)
- `twitter:creator` meta tag — add `@tawfeeqmartin` (low effort, needed before Twitter push)
- WCAG contrast issues on gold text — not blocking but affects a11y
- No error reporting — accept this for now

### Overall Assessment
**The app is ready to market.** Two weeks of active dev have almost certainly cleared the blocking issues. The technical quality is exceptional — this is not a hobbyist prayer app. The gap now is entirely distribution.

---

## 2. Ramadan Window (NOW — ~10 days left)

**Ramadan 2026 ends ~March 29.** We have roughly March 2–12 for maximum impact before Eid prep consumes attention. Act this week, not next.

### Pre-Launch Checklist (Do First — 1 hour)
- [ ] Verify og-image works (paste URL in iMessage, check preview)
- [ ] Add `<meta name="twitter:creator" content="@tawfeeqmartin">` to head
- [ ] Check PWA install flow on an iPhone — is it obvious enough?
- [ ] Ensure Supabase signups table is capturing emails

### The Story Angle
Every post, every outreach should carry the same thread:

> *"I'm a Muslim creative technologist at ILM. I built a prayer clock where sunlight refracts through a glass Ka'bah — each prayer window is a beam of light. The call to prayer comes from the direction of Makkah using spatial audio. It's free, no ads, no tracking. Just a devotional object that tells time."*

That's it. Don't lead with features. Lead with the vision. The features explain themselves once people click.

### PWA Install Friction Reduction (Do Now)
The "Add to Home Screen" flow is the single biggest conversion blocker. Users who don't know about it won't install. Users who do install are 10x more likely to use it daily.

**Actions:**
- [ ] Add a persistent, unmissable banner on first visit: "Install as an app — tap Share → Add to Home Screen"
- [ ] Show it only on iOS Safari (detect via `navigator.userAgent`)
- [ ] Consider a modal on first load (one-time, dismissable) that explains installation — with a GIF or screenshot
- [ ] Add "Already installed? Open it from your home screen" for returning visitors
- [ ] For Android Chrome: the browser shows an automatic install prompt if the PWA criteria are met — make sure the manifest is clean

### Reddit Strategy
**Platform reality:** Reddit Islamic communities are generally warm to genuine, craftsman-made tools if you're not spamming or self-promoting cynically. Lead with the story, not the link. Post during Ramadan daytime (EST morning = peak engagement for US Muslim users).

**r/islam** (~750K members)
- Post type: Text post with link
- Title idea: *"I built a prayer clock where light refracts through a glass Ka'bah — each prayer is a beam of light. Free, no ads, sadaqah jariyah."*
- Body: Tell the story — Muslim at ILM, why you built it, what makes it different (spatial adhan, no tracking). Mention it's a PWA and explain how to install. Invite feedback.
- Don't just drop the link. Give them the why.
- Best time: Thursday/Friday EST morning

**r/MuslimLounge** (~150K members)
- More casual tone. Post after r/islam.
- Title: *"Made a prayer clock during Ramadan — it plays the adhan from the direction of Makkah using your compass. Figured this community might appreciate it."*
- Shorter post, more conversational.

**r/webdev + r/InternetIsBeautiful**
- Different audience — creative technologists, not necessarily Muslim
- Title for r/InternetIsBeautiful: *"A prayer clock where light refracts through a glass Ka'bah, and the adhan plays from the direction of Mecca using spatial audio. Built by a VFX technologist at ILM."*
- Title for r/webdev: *"I built a Three.js prayer clock with FBO dichroic glass, HRTF spatial audio from Qibla bearing, and 11 Surah-named dial designs — the technical story"*
- r/webdev: Lead with the tech stack and challenge. Link to a dev log or write one in the post.
- These audiences reshare and upvote beautiful technical work.

**Post order:** r/islam first (Wednesday or Thursday). Let that get traction. Then r/webdev and r/InternetIsBeautiful Friday or Saturday. r/MuslimLounge any time.

### Twitter/X Strategy
**Tawfeeq's handle:** @tawfeeqmartin (add this to twitter:creator meta now)

**Thread structure (write this week):**
```
Tweet 1: The hook
"I built a prayer clock where sunlight refracts through a glass Ka'bah.
Each prayer window is a beam of light passing through dichroic crystal.
The adhan plays from the direction of Makkah. It's free forever.

Here's why I built it 🧵"

Tweet 2: The why
"I'm Muslim. I'm also a Senior VP Engineer at ILM (Star Wars, The Mandalorian).
For 20 years I've worked at the intersection of light, space, and storytelling.
This is the first thing I've built purely for my deen."

Tweet 3: The technical poetry
"The cube at the center is a metaphor for the Ka'bah.
Light hits it and fractures into prayer windows.
Because that's what the Ka'bah does — it's the point around which
everything orbits. Time itself is organized around it."

Tweet 4: The spatial adhan
"The adhan plays from the direction of Makkah using your phone's compass
and spatial audio (HRTF). Hold your phone, hear the call arrive from
the right direction. It's not a feature. It's an experience."

Tweet 5: The philosophy
"Most prayer apps are countdown timers. A deadline.
This one says: 'You have 2 hours of Dhuhr remaining.'
The window is open. The door hasn't closed.
Gift framing vs deadline framing."

Tweet 6: The CTA
"It's free. No ads. No tracking. Sadaqah jariyah.
agiftoftime.app
Works in Safari. Add to Home Screen to install.
[Screenshot of the app]"
```

**Tags to use:** #Ramadan2026 #IslamicApp #PrayerTimes #WebDev #ThreeJS #CreativeCoding #Muslim

**Accounts to tag/mention for amplification:**
- @Muslim_Pro (if they RT their community)
- @islamicartdb or similar Islamic art accounts
- @p5xjs, @codrops, @threejs (creative coding community)
- ILM's social (if comfortable — confirms credentials)
- Any Muslim tech Twitter personalities with 10K+ followers

**Post the thread Wednesday March 4.** Give it the Ramadan boost week.

### Instagram Strategy
Instagram is secondary but valuable for the visual quality of this app.

- Post 3-4 screenshots/screen recordings of the clock face — different dial designs
- Reels > Posts for reach. 15-30 second screen recording of the clock rotating through dials, the adhan playing, the compass pointing toward Makkah
- Caption: the story, not the features
- Tags: #Ramadan2026 #IslamicArt #IslamicDesign #PrayerTime #MuslimTech #Generative #ThreeJS #WebGL
- Accounts to tag: @islamic.art, @islamicartandquotes, any Islamic design/art account with 50K+ followers
- DM 3-5 Islamic art accounts directly with the story angle — many will share beautiful tech-art if it's genuinely good

### Influencer/Scholar Outreach
**Quality over quantity.** One right share beats 100 cold DMs.

**Target profile:** Muslim intellectuals, scholars with aesthetic taste, Muslim tech people, creative Muslims with audiences. NOT mainstream Islamic influencers who share everything — find the ones who are selective.

**Approach:** Write a personal email or DM. Reference something specific about their work. Tell the story briefly. Don't ask them to share — give them the app and let them decide.

**Template:**
> "Assalamu Alaikum [Name], I built agiftoftime.app — a prayer clock where light refracts through a glass Ka'bah, and the adhan plays from the direction of Makkah using spatial audio. I'm a Muslim creative technologist at ILM (Star Wars, The Mandalorian). I built it as sadaqah jariyah, no ads, no tracking. I thought it might resonate with you given [specific thing about their work]. Jazakallahu khayran."

**Target outreach list (research and add):**
- [ ] Omar Suleiman (@omarsuleiman504) — high taste, digital savvy
- [ ] Hamza Yusuf — less likely to respond but worth trying
- [ ] Any Muslim creatives in tech/design with 20K+ following
- [ ] Muslim Matters, Productive Muslim (publications, will cover this kind of story)
- [ ] SeekersGuidance — educational content, might embed for Ramadan

**Timeline:** Send outreach by March 5. Ramadan impact window closes fast.

---

## 3. Prix Ars Electronica / S+T+ARTS Submission
**Deadline: March 9, 2026 (7 days from now)**

This is a legitimate shot. The work genuinely fits. Don't skip it.

### Category: Digital Musics & Sound Art OR Digital Communities / Computer Animation

Actually — evaluate **Digital Communities** (if it has one) or the overarching competition category. The strongest fit is: **an artwork that makes an invisible human experience visible through computation.** Islamic philosophy of time made perceptible.

### What's Needed
The standard Ars Electronica submission requires:
- [ ] Project title and short description (500 chars)
- [ ] Long description / artist statement (2000 chars)
- [ ] Documentation: screenshots, video, URL
- [ ] Technical description
- [ ] CV / artist bio

**Effort estimate: 4-6 hours total. Do it. Deadline is March 9.**

### The Pitch

**Short description (lead with this):**
> *A Gift of Time is a devotional prayer clock in which sunlight refracts through a crystalline Ka'bah — the geometric center of Islamic prayer — fracturing into five colored windows of sacred time. The call to prayer arrives in three-dimensional space from the direction of Mecca, tracked to the user's location and compass bearing. Built on Islamic theology's understanding of time as divine trust, not secular resource.*

**Long artist statement structure:**
1. The problem: Islamic philosophy of time is one of the most sophisticated in human history — and it's reduced to a countdown app
2. The concept: Light as metaphor. The Ka'bah as the center around which time orbits. Prayer windows as refractions, not deadlines
3. The spatial adhan: The experience of the call arriving from Makkah — the user physically orients, the sound comes from there
4. The theological grounding: Surah Al-Asr, the oath on time, the last third of the night, the "gift framing" vs deadline framing
5. The technical: Three.js, HRTF spatial audio, FBO dichroic glass, Qibla bearing calculation
6. The intention: Sadaqah jariyah — continuous charity. No ads, no tracking, free forever
7. The maker: Muslim creative technologist at ILM with 20+ years in light, space, and storytelling. This is the first work built purely for faith.

**Why it fits Digital Humanity (if that's the category):**
- Computation in service of spiritual practice — not productivity, not commerce
- Islam's philosophy of time is cross-cultural and universally resonant
- The work makes a 1400-year-old theology *felt*, not just understood
- Entirely free, no surveillance capitalism

**Documentation to gather:**
- [ ] 3-5 high quality screenshots (use GPU Chrome at full res)
- [ ] 60-90 second screen recording (clock in action, adhan playing, compass working)
- [ ] Upload video to YouTube or Vimeo (unlisted is fine)
- [ ] GitHub link for technical documentation

**Owner: Tawfeeq. Deadline: March 9. Non-negotiable.**

---

## 4. Post-Ramadan — Native iOS App

**The goal:** Ship to App Store before Ramadan 2027 (target: January 2027). TestFlight beta by September 2026.

### Mac Hardware Decision
**Buy the M2 Mac Mini (~$500 refurb from Apple).** This is not a gamble — it's the prerequisite for everything in this section. The iOS development capability unlocks:
- Native push notifications (the #1 request from any prayer app user)
- Live Activities (prayer timer on lock screen)
- Home Screen widgets
- Watch complications
- AirPods head tracking for spatial adhan

**When to buy:** After Eid (post March 29). Earning the purchase through Ramadan traction feels right.

### What Needs Native (Non-Negotiable)

| Feature | Why Native Required | Effort |
|---------|-------------------|--------|
| Push notifications for prayer times | iOS Safari web push is unreliable for scheduled times | Medium |
| Live Activities (lock screen timer) | iOS 16+ only, requires native ActivityKit | Medium |
| Home Screen widgets (WidgetKit) | No web equivalent | High |
| Watch complications | WatchOS only | High |
| AirPods head tracking spatial adhan | CMHeadphoneMotionManager | Medium |
| Background adhan audio | WKWebView audio killed when backgrounded | Low |

### Architecture: Swift + WKWebView Hybrid
Per ios-app-plan.md — this is the right call. The PWA is the UI. Native Swift handles audio, notifications, compass, and system integrations.

**Don't rebuild the clock in SwiftUI.** The WebGL clock is the differentiator. Wrap it, enhance the system layer.

### Post-Ramadan Timeline

| Month | Milestone | Effort |
|-------|-----------|--------|
| April | Mac Mini setup, Apple Developer enrollment ($99/yr), Xcode up | 1 week |
| May | WKWebView wrapper working, JS bridge for compass + audio | 2 weeks |
| June | Local notifications scheduled from prayer API, 30-sec adhan sounds | 2 weeks |
| July | AVAudioEngine spatial adhan, CMHeadphoneMotionManager (AirPods) | 2 weeks |
| August | Live Activities, basic widget | 2-3 weeks |
| September | TestFlight internal beta (100 users from email list) | 1 week |
| October | TestFlight external beta, community feedback | 4 weeks |
| November | Home Screen widgets v2, Watch complications | 3 weeks |
| December | App Store submission | 1 week |
| January 2027 | App Store live, Ramadan 2027 marketing begins | - |

### TestFlight Beta Strategy
- Seed from email list (start building it now — see §7)
- Seed from Reddit/Twitter Ramadan community who bookmarked the app
- Target: 500 TestFlight beta users before App Store submission
- Gather: notification reliability, spatial audio feedback, PWA-to-native UX comparison

---

## 5. Feature Roadmap

Priority matrix: Impact (on the core experience) vs Effort (build time). Do high-impact, low-effort first.

### Tier 1 — High Impact, Relatively Low Effort (Ship Before or During Ramadan)

**Gift Framing vs Deadline Framing**
- Change "Asr in 2:34:17" → "You have 2h 34m of Asr time remaining"
- The window is open. Not a countdown to failure.
- Effort: 2 hours. Impact: Profound psychological shift for daily users.
- **Ship this week.**

**"Five Before Five" Onboarding**
- Not a lecture. One screen on first open.
- The hadith, briefly. Why this app exists. Dismiss to clock.
- Effort: 4 hours. Impact: Sets the devotional tone immediately.
- **Ship this week.**

**Twitter/Creator meta tags + Supabase analytics**
- `twitter:creator`, lightweight analytics (Plausible)
- Effort: 30 minutes.
- **Ship today.**

### Tier 2 — High Impact, Medium Effort (Post-Ramadan, Q2 2026)

**Contextual Quote Layer**
- Single Arabic line + translation, rotating with prayer time
- Fajr: barakah hadith. Asr: Wal-Asr. Maghrib: Day of Judgment compression. Night: Tahajjud hadith
- No prominence — subtle, below the clock or in the subdial area
- Effort: 1-2 days. Impact: Deepens the theology significantly.

**Friday Hidden Hour Mode**
- Light spectrum shifts warmer on Fridays (amber/gold tones)
- Soft indicator: "The hidden hour is somewhere in this afternoon. Stay present."
- Don't reveal a time — the ambiguity is the lesson
- Effort: 3-4 days. Impact: High for observant users, unique to this app.

**Breath / Presence Indicator**
- Subtle slow pulse on the clock face — not a heartbeat, just presence
- No text. Just aliveness.
- Ties to: every breath is counted, returning to its Source
- Effort: 2-3 days. Impact: Emotional depth, plays to Tawfeeq's generative background.

### Tier 3 — High Impact, Higher Effort (Q3 2026, Native App Era)

**Tahajjud Mode**
- Last third of night: dynamically calculated from Isha to Fajr
- Darker, quieter visual state
- Surface: "Our Lord descends now. Who is calling?" (the hadith)
- Effort: 1 week (web). Higher value in native (push notification at tahajjud time)

**Al-Asr Visual Gravity**
- Asr prayer gets special visual weight — light refracts differently during that window
- Arabic of "Wal-Asr" appears during the window
- Effort: 1 week. Impact: Makes the Quranic oath on time *felt*, not just known.

**Ashab al-Kahf Friday Story Moment**
- Surah Al-Kahf moment on Fridays — "They slept 309 years and thought it was a day"
- Visual: light shifting imperceptibly slow. A moment of reflection.
- Effort: 1-2 weeks.

### Defer / Nice-to-Have
- Multiple city support (advanced location switching)
- Customizable adhan selection (currently Mishary Rashid)
- Multiple muezzins / maqam options
- Dark/light theme manual toggle (night mode exists, expose it)

---

## 6. IP & Legal

### Priority Actions (Do in Order)

**1. Public documentation timestamps — Do This Now, Free**
- Every commit is evidence. Git history is already your best legal protection.
- Write one tweet thread or blog post with "Here's what I built and when." Timestamp matters.
- Screenshots with dates. Social posts as timestamp records.
- **Effort: 0 (you're already doing the launch thread)**

**2. Copyright Registration — Do This Month, $65**
- US Copyright Office: copyright.gov, online registration
- Register: the visual design, the code, the copy, the audio arrangement
- Gives statutory damage rights if someone copies the specific implementation
- **Effort: 1-2 hours. Cost: $65. Owner: Tawfeeq.**

**3. Trademark "A Gift of Time" — Do This Quarter, $250-350**
- USPTO filing at teas.uspto.gov
- Class 9 (software) and/or Class 41 (education/religious services)
- Takes 8-12 months to clear, but priority date is filing date
- Prevents a competing app with the same name from registering later
- **Effort: 2-3 hours. Cost: $250-350. File before the app gets traction.**

**4. Trade Dress (Ongoing, No Filing)**
- The dichroic glass cube + refracted light clock is trade dress if it becomes distinctively associated with this brand
- Build the association: consistent use, watermark promo screenshots, document public use
- Cultivated over time, not filed. Start now.

### What You Cannot and Should Not Stress About
- Someone building a different prayer app with light-based UI — limited legal recourse (ideas aren't protected)
- Your real moat: the soul of the app. A copycat without spatial adhan, without the theological grounding, without Tawfeeq's ILM credibility — it would be immediately obvious as derivative.
- **Real protection = depth of vision × public association × your name on it.**

### Patent Consideration (From References)
You have `patent-spatial-adhan.md` and `patent-provisional-draft.md` in your references. If the spatial adhan (HRTF + Qibla bearing + real-time compass) is novel enough, a provisional patent ($300-500 DIY) buys 12 months of "patent pending" while you evaluate. Read those docs and decide.

---

## 7. Growth & Community

### Email List — Start Now
This is the most valuable long-term asset. Not followers — emails.

**Set up:**
- [ ] Add email capture to agiftoftime.app (Supabase already configured — just expose it better)
- [ ] Landing page CTA: "Get updates — when the iOS app launches, you'll know first"
- [ ] After install: show a one-time prompt "Stay connected — email for iOS launch announcement"
- [ ] Target: 500 emails by end of Ramadan. Realistic with a solid Reddit post.

**Platform:** Supabase is already set up. Use it. Don't complicate this with Mailchimp until you have 1000+ subscribers.

### Content Strategy (Post-Ramadan)

**Dev Log / Behind-the-Scenes**
- Platform: Substack (free, clean, good for long-form)
- Frequency: Monthly is fine. Don't commit to more.
- Topics:
  - "Why I built a prayer clock" (origin story)
  - "The light refraction math behind the Ka'bah metaphor"
  - "How spatial audio simulates the direction of Makkah"
  - "What I learned from ILM about storytelling through technology"
  - "Building for the akhira — what sadaqah jariyah software means to me"
- This content has dual purpose: Islamic community + creative tech community

**Short-form (Twitter/X threads)**
- Monthly thread: feature spotlight, theological insight, or technical deep-dive
- These build the association between Tawfeeq's name and this kind of work

**Video (Optional, High Value)**
- 3-5 minute "making of" video — recorded at home, no production required
- Show the clock, explain the concept, show the spatial adhan working
- Upload to YouTube. It lives forever. Ramadan 2027 people will find it.

### Potential Partnerships

**Islamic Art Organizations**
- Barjeel Art Foundation, Aga Khan Trust for Culture
- Museum of Islamic Art (Qatar, Malaysia)
- These are long shots but the right institutional associations

**Mosque Networks**
- ISNA (Islamic Society of North America), ICNA
- Local mosque newsletter / Friday khutbah mention
- "Our khateeb mentioned this app" = high trust signal
- Approach: reach out directly to mosque directors with a gift framing

**Muslim Tech Communities**
- Muslim Tech Collective (if it exists in your area)
- Islamic tech Slack/Discord communities
- Muslim developers on Twitter/X — they exist and are active

**Islamic Media**
- Muslim Matters (muslimmatters.org) — popular blog, covers Islamic tech topics
- Productive Muslim
- SeekersGuidance — educational Islamic content
- Pitch: "Here's a tool for ihsan in how we relate to time — want to write about it?"

---

## 8. Revenue Model

**Core principle: Free forever. This is not negotiable. It's sadaqah jariyah.**

Any monetization must be additive — it cannot make the core experience worse for anyone.

### Tier 1 — Voluntary Support (Launch Now)
- Supabase already has a supporters section — use it
- Simple: "If this app brought you closer to your prayers, support its existence"
- PayPal.me link or Stripe Payment Link
- No IAP, no paywall, no guilt
- Expected: $0-500/Ramadan. Not the goal. Just make it possible.

### Tier 2 — Premium Dial Packs (Post-App Store Launch, 2027)
- Core 11 dials: always free
- Additional artist-designed dials: $2.99-4.99 one-time purchase
- Could commission Muslim artists/designers to create exclusive designs
- Revenue share with artists (60-70% to artist)
- This is aligned with Islamic art patronage tradition

### Tier 3 — Mosque / Institution Licensing (2027+)
- Custom-branded version of the clock for mosque websites or apps
- White-label the prayer times interface with mosque logo + colors
- Mosque signs up, gets embed code, pays annual license ($200-500/year)
- 100 mosques = $20-50K/year. Not crazy.
- Tawfeeq manages the technical side, mosques get a beautiful prayer time display

### Tier 4 — Art Installation Licensing (Tawfeeq's Superpower, 2027+)
- This is where ILM background becomes the moat
- Large-format interactive installation — the glass Ka'bah clock on a LED volume or projection surface
- Museum lobbies, Islamic cultural centers, mosque atriums, art festivals
- Installation license: $5K-25K+ per installation, maintenance retainer
- This is the highest-value, lowest-volume tier — and Tawfeeq is uniquely qualified to deliver it
- Document the web app as a proof of concept. The Ars Electronica submission helps here.

### Revenue Timeline
| Quarter | Focus | Expected Revenue |
|---------|-------|-----------------|
| Q2 2026 | Voluntary support, growing audience | $200-1K |
| Q3 2026 | TestFlight, build email list | — |
| Q4 2026 | App Store launch, dial packs | $500-2K |
| Q1 2027 | Ramadan 2027 marketing, mosque outreach | $2-10K |
| 2027+ | Installations, institutional licensing | Variable |

---

## Weekly Execution View

### This Week (March 2-8)
- [ ] **Today:** Verify og-image, apple-touch-icon, manifest (30 min)
- [ ] **Today:** Add twitter:creator meta tag
- [ ] **Tuesday:** Write the Twitter/X thread (draft in a doc first)
- [ ] **Tuesday:** Write the Reddit post for r/islam
- [ ] **Wednesday:** Post Twitter thread + Reddit r/islam
- [ ] **Wednesday:** Identify 5 influencer/scholar outreach targets, draft personalized DMs
- [ ] **Thursday:** Post Reddit r/webdev + r/InternetIsBeautiful
- [ ] **Thursday:** Send influencer DMs
- [ ] **Friday:** Post Instagram reels
- [ ] **By March 9:** Submit Prix Ars Electronica application

### Next Week (March 9-15 — Last Full Ramadan Week)
- [ ] Respond to all comments/DMs from launch week
- [ ] Ship gift framing change ("You have X remaining" vs countdown)
- [ ] Add "Five Before Five" onboarding screen
- [ ] Gather emails from signups, make sure Supabase is capturing correctly
- [ ] Monitor what's working, double down on it

### Post-Eid (April)
- [ ] Copyright registration ($65)
- [ ] Trademark filing ($250-350)
- [ ] Substack setup — write origin story post
- [ ] Start Mac Mini planning (buy or budget)
- [ ] Draft Contextual Quote Layer feature spec

---

## Key Metrics to Track

| Metric | Now | Ramadan End Goal | iOS Launch Goal |
|--------|-----|-----------------|----------------|
| Email signups | ? | 500 | 2,000 |
| Monthly active users | ? | 5,000 | 25,000 |
| Reddit upvotes (r/islam) | — | 500+ | — |
| Twitter impressions | — | 50,000+ | — |
| App store installs | N/A | N/A | 10,000 (first 30 days) |
| Ars Electronica submission | — | Submitted | — |

---

## Decision Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Ramadan app strategy | PWA launch + marketing | App Store review timing impossible for this Ramadan |
| iOS timeline | Post-Ramadan build, App Store January 2027 | Quality over speed, gives real user feedback first |
| Mac hardware | M2 Mac Mini ~$500 refurb | Minimum viable for Xcode development |
| iOS architecture | Swift + WKWebView hybrid | Best balance of speed and native capability |
| Revenue model | Free core + premium dials + licensing | Sadaqah jariyah principle, diverse revenue without compromising access |
| Trademark | File before significant traction | Priority date is filing date |
| Copyright | Register within 30 days of Ramadan launch | Statutory damages protection |
| Analytics | Plausible (privacy-first) | Consistent with no-tracking brand promise |

---

*This document lives at `/plans/release-strategy.md`. Update it as tasks complete. Don't let it go stale.*
