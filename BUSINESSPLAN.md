# Ramadan Clock — Business Plan

## Product
- **What**: Beautiful, gesture-driven fasting clock PWA with spatial adhan, Qibla compass, prayer times, celestial animations
- **For whom**: Muslims worldwide, especially during Ramadan
- **Problem it solves**: Existing prayer apps are ugly, cluttered, ad-ridden. No one has a premium fasting clock experience.
- **Unique value**: Watch-quality design, HRTF spatial adhan toward Qibla, night/day transitions, tawaf animation — art meets worship
- **Status**: building (Ramadan starts Feb 17)

## Business Model
- **Revenue type**: Donations via masjid partnerships
- **Pricing**: Pay-what-you-want donation to access (or free basic / donate for premium features)
- **Revenue split**: 75% to referring masjid / 25% development fund
  - Tawfeeq's 25% = sustain + improve the app for the ummah (NOT profit)
  - Pitch: "75 cents of every dollar goes directly to your masjid. The rest keeps this free tool running for the ummah."
  - Option: start 80/20 for launch to incentivize early adoption
  - Payment processors (Stripe/PayPal) take additional 3-5% from gross
  - Comparable: LaunchGood takes 5-15% and didn't build the product
- **Cost structure**: Domain (~$15/yr), hosting (GitHub Pages = free), development time (Tawfeeq + chef)

## Market
- **Target audience**: Practicing Muslims, mosque congregants, Muslim families
- **Market size**: ~1.8B Muslims globally, ~3.5M in US. Even 0.1% = meaningful.
- **Competitors / alternatives**: Muslim Pro (ads, bloated), Athan (Islamicfinder), generic prayer apps
- **Our edge**: Design quality (ILM/VP pedigree), spatial audio (nobody has this), masjid partnership model, no ads ever

## Go-To-Market Strategy
- **Phase 1 — Seed (Ramadan 2026)**: 
  - LA masajid first (Tawfeeq's local network)
  - QR code posters for Friday khutbah announcements
  - WhatsApp/Telegram group sharing
  - Personal outreach to imams and board members
- **Phase 2 — Grow (mid-Ramadan)**:
  - MSAs (university Muslim Student Associations)
  - Muslim tech/lifestyle influencers
  - Islamic social media accounts
  - Word of mouth from Phase 1 users
- **Phase 3 — Scale (post-Ramadan)**:
  - Expand beyond Ramadan features (year-round prayer clock)
  - National masjid partnerships
  - International (UK, Canada, Middle East, Southeast Asia)
  - App Store listing (PWA wrapper) for discoverability
- **Key channels**: Masajid, WhatsApp groups, Muslim Twitter/IG, MSAs
- **Partnerships**: Individual masajid (unique codes), Islamic organizations
- **Launch date**: Ramadan ~Feb 17, 2026 (3 DAYS)

## Marketing
- **Brand / positioning**: Premium worship tool, not another prayer app. "Art meets ibadah."
- **Domain / URL**: TBD — candidates: ramadanclock.app, waqt.app, qamar.app, giftoftime.app
- **Social presence**: @LOOKMOM (X) — separate from personal brand initially?
- **Content strategy**: 
  - Short video demos (spatial adhan, tawaf animation, night mode)
  - "How it works" for masajid (30-second pitch)
  - QR code poster template (print-ready)
- **Key messages**:
  - "75% of every donation goes to your masjid"
  - "The most beautiful way to keep your fast"
  - "Hear the adhan from the direction of Qibla"

## Follow-Up Strategy
- **User retention**: Daily use during Ramadan (fasting clock = daily utility)
- **Feedback loops**: In-app feedback link, masjid liaison feedback
- **Update cadence**: Weekly during Ramadan, monthly after
- **Community building**: Masjid WhatsApp groups, user testimonials
- **Re-engagement**: Annual Ramadan cycle — "Ramadan Clock is back" campaign each year

## Resources
- **Team**: Tawfeeq (product/design/domain expertise) + chef (engineering)
- **Tools / stack**: HTML/CSS/JS (single file), GitHub Pages, Aladhan API, Web Audio API, Supabase (analytics — pending)
- **Budget**: Minimal — domain + payment processing fees
- **External help needed**: 
  - Custom adhan recording (Tawfeeq has someone in mind)
  - Payment processing setup (Stripe)
  - Masjid outreach (Tawfeeq's network)

## Tracking & Metrics
- **KPIs**: Installs (PWA), active daily users, donations, masjid partners
- **Analytics**: Supabase (pending setup)
- **Milestones**:
  - [ ] MVP live before Ramadan (Feb 17)
  - [ ] First masjid partnership
  - [ ] First donation
  - [ ] 100 active users
  - [ ] 10 masjid partners
  - [ ] 1,000 active users
  - [ ] Payment processing live
  - [ ] Custom domain live

## Decision Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-14 | 75/25 masjid/dev split | Fair for solo dev, generous to masajid, easy to pitch |
| 2026-02-14 | Masjid partnership model | Built-in trust, viral distribution, sadaqah jariyah framing |
| 2026-02-14 | PWA not App Store | No 30% cut, instant access, no review delays |
| 2026-02-14 | Dev fund not profit | Tawfeeq's % sustains the tool for the ummah |

## Evangelist Program

### Concept
- Masajid, community leaders, influencers sign up as "evangelists"
- Each gets unique referral code + QR code + tracking dashboard
- They promote the app, donations flow through their code
- Automated onboarding — Tawfeeq doesn't manually manage anyone

### Evangelist Types
- **Masajid / Islamic Centers**: Poster in lobby, Friday announcement, newsletter
- **Community Leaders**: Imams, scholars, youth directors, MSA presidents
- **Online Influencers**: Muslim lifestyle, tech, Ramadan content creators
- **Grassroots**: Any user who wants to fundraise for their masjid

### Application Flow (Website)
1. Evangelist visits site → "Partner With Us" / "Fundraise for Your Masjid" page
2. Application form collects:
   - Name, email, phone
   - Organization name (masjid, MSA, personal)
   - Organization type (mosque / Islamic center / MSA / influencer / individual)
   - Tax ID / EIN (if registered nonprofit — for donation receipts)
   - Website / social media links
   - Payout method (bank account / PayPal / Venmo)
   - Estimated reach (congregation size / follower count)
   - How they plan to promote
3. Auto-screening:
   - Verify nonprofit status via EIN lookup API (IRS database)
   - Social media follower count verification
   - Basic fraud checks (duplicate submissions, suspicious patterns)
   - Auto-approve verified 501(c)(3) masajid
   - Flag others for manual review
4. On approval:
   - Auto-generate unique referral code + QR code
   - Welcome email with promotional materials (poster PDFs, social graphics, copy)
   - Access to evangelist dashboard (donations, users, payout history)
   - Payouts on schedule (monthly? after minimum threshold?)

### Evangelist Dashboard
- Real-time donation tracking
- User count / installs via their code
- Payout history + upcoming payouts
- Downloadable QR codes + promotional materials
- Referral link generator

### Legal / Liability Structure
- **CRITICAL: Research needed** — consult attorney for:
  - Fiscal sponsorship vs pass-through model
  - Do we need 501(c)(3) status ourselves?
  - State fundraising registration requirements (vary by state)
  - Terms of Service that limit liability
  - Privacy policy for handling donor + evangelist data
  - PCI compliance for payment handling (Stripe handles most of this)
  - Tax implications of pass-through donations
- **Terms of Service must include**:
  - Tawfeeq/app is a technology platform, not a charity
  - Donations are directed to the evangelist's organization
  - Platform takes a development fee (25%), clearly disclosed
  - No guarantee of tax deductibility (depends on receiving org's status)
  - Indemnification clause — evangelists responsible for their own org's compliance
  - Right to terminate partnerships
  - Dispute resolution process
- **Possible structures**:
  - **Platform model** (like GoFundMe): We're the tech, not the charity. Donations go to orgs. We take a platform fee. Least liability.
  - **Fiscal sponsorship**: Partner with an existing 501(c)(3) as umbrella. More credibility, more complexity.
  - **Own nonprofit**: Maximum control but heavy overhead. Not for v1.
- **Recommendation for v1**: Platform model with Stripe Connect
  - Stripe Connect lets evangelists onboard their own Stripe accounts
  - Donations split automatically (75/25) at payment time
  - Tawfeeq never touches the masjid's money — Stripe handles it
  - Each org handles their own tax receipts
  - Platform ToS limits our liability

### Business Entity Roadmap
- **Current state**: No business registered. Tawfeeq operates as individual.
- **Phase 1 — Launch (now)**: Sole proprietorship (default, no registration needed). Personal Stripe account. Start collecting donations. This is legal and fine for starting out.
- **Phase 2 — Formalize (when revenue flows)**: Register California LLC (~$70 online, same day). Protects personal assets from business liability. Get EIN from IRS (free, instant online). Upgrade to Stripe business account.
- **Phase 3 — Scale (if significant revenue)**: Consider S-Corp election for tax benefits. Business bank account. Bookkeeping/accounting. Consult CPA for tax optimization.
- **Key point**: Masajid handle their OWN charity compliance. We're the tech platform taking a development fee — same model as Stripe, GoFundMe, Eventbrite. None of them are charities.
- **Nothing blocks launch** — formalize as revenue justifies the overhead.

### Influencer Outreach
- Identify Muslim influencers with 10K+ followers on IG/TikTok/YouTube/X
- Offer: "Fundraise for any masjid using the most beautiful Ramadan app"
- Provide ready-made content: demo videos, screenshots, captions
- Track influencer-specific codes for performance

### Screening Automation
- EIN verification: IRS Exempt Organizations API (free)
- Social verification: follower count check via public APIs
- Fraud: rate limit applications, email domain verification, duplicate detection
- Auto-approve: verified 501(c)(3) with valid EIN
- Manual review queue: everything else (chef can help triage)

## Open Questions
- Domain name — which to register?
- Payment processor — Stripe Connect most likely (handles split + liability)
- Free vs gated — what's free, what requires donation?
- QR code poster design — who designs it? (us)
- Should @LOOKMOM promote or keep separate identity?
- Year-round value prop beyond Ramadan?
- **Legal**: Need attorney consultation on platform model, state fundraising regs, ToS
- **Tax**: Do donors get tax receipts? (Depends on receiving org, not us)
- **International**: How does this work for masajid outside US? (Stripe Connect supports 40+ countries)
- **Minimum payout threshold**: $50? $100? To avoid micro-transaction overhead
