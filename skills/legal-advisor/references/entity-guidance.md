# Entity Structure Detailed Guidance

## LLC (Limited Liability Company)

### When to Choose
- Small team (1-5 people), service-based or product business
- Want liability protection without corporate formality
- No plans for VC funding (LLCs are awkward for equity rounds)
- Want pass-through taxation

### Formation Basics
- File Articles of Organization with state
- Create Operating Agreement (critical even for single-member)
- Get EIN from IRS
- Typical cost: $50-500 filing fee depending on state

### State Considerations
- **Delaware**: Popular for flexibility, but need registered agent + foreign qualification in home state
- **Wyoming**: No state income tax, strong privacy, low fees
- **Home state**: Usually simplest — avoids foreign qualification fees and dual reporting
- **California**: $800 minimum franchise tax regardless of revenue

### Operating Agreement Must-Haves
- Member roles, voting rights, profit distribution
- Capital contributions and future funding
- Transfer restrictions and buy-sell provisions
- Dissolution procedures
- Management structure (member-managed vs manager-managed)

---

## C-Corporation

### When to Choose
- Planning to raise VC/angel investment
- Want to issue stock options to employees (QSBS benefits)
- Planning for acquisition or IPO exit
- Multiple classes of stock needed

### Formation Basics
- File Certificate of Incorporation (usually Delaware)
- Adopt bylaws, appoint directors and officers
- Issue stock, file 83(b) elections if applicable
- Typical cost: $89 (Delaware) + registered agent ($50-300/yr)

### Key Considerations
- **Double taxation**: Corporate tax + dividend tax (mitigated if reinvesting or using salary)
- **QSBS**: Qualified Small Business Stock — potential $10M capital gains exclusion
- **409A valuations**: Required for stock option pricing, ~$5-15K annually
- **Board governance**: Required board meetings, minutes, formal resolutions

---

## Nonprofit (501(c)(3))

### When to Choose
- Primary purpose is charitable, educational, religious, or scientific
- Plan to receive tax-deductible donations or apply for grants
- Mission-driven, not profit-maximizing
- Willing to accept board governance and public accountability

### Formation Process
1. Incorporate as nonprofit in state (Articles of Incorporation with specific IRS language)
2. Apply for EIN
3. File Form 1023 (full) or 1023-EZ (simplified, if eligible) with IRS
4. Register for state charitable solicitation (most states)
5. Timeline: 3-12 months for IRS determination

### Ongoing Requirements
- Annual Form 990 filing (990-N for <$50K, 990-EZ for <$200K, full 990 above)
- State annual reports and charitable solicitation renewals
- Board meetings and governance documentation
- No private inurement (founders can't extract unreasonable profit)
- Public inspection of 990s and application

### Cost Estimates
- IRS filing: $275 (1023-EZ) or $600 (full 1023)
- State incorporation: $25-100
- Legal help for application: $2,000-5,000 (recommended for full 1023)

---

## Fiscal Sponsorship

### When to Choose
- Want to accept tax-deductible donations NOW, before forming nonprofit
- Testing a charitable concept before committing to full nonprofit
- Project is temporary or grant-specific
- Want to avoid administrative burden of running a nonprofit

### How It Works
- Established 501(c)(3) "sponsors" your project
- Donations go to sponsor, earmarked for your project
- Sponsor handles compliance, reporting, and fiduciary oversight
- You operate the project under their umbrella

### Two Models
- **Model A (Comprehensive)**: Sponsor owns the project, you're a program. Most common.
- **Model C (Pre-approved grant)**: Sponsor grants funds to you. More independence, more scrutiny.

### Typical Terms
- Administrative fee: 5-15% of funds received
- Sponsor retains legal control and fiduciary responsibility
- Project reports to sponsor on fund usage
- Either party can terminate with notice

### Notable Fiscal Sponsors
- Open Collective Foundation
- Hack Club (for youth/tech projects)
- Social Good Fund
- Community Initiatives

---

## Platform / Marketplace Model

### When to Choose
- Connecting buyers and sellers, or service providers and clients
- Revenue from transaction fees, subscriptions, or listing fees
- Not providing the service directly

### Legal Considerations
- **Section 230**: Protections for user-generated content (but limitations apply)
- **Marketplace facilitator laws**: May be responsible for sales tax collection
- **Money transmission**: If holding funds, may need state licenses (use Stripe Connect to avoid)
- **1099 reporting**: Must issue 1099-K for sellers exceeding thresholds
- **Terms of Service**: Critical — defines relationship as platform, not provider
- **Content moderation**: Policies and enforcement procedures needed
