# TreeShop Project Roadmap

## Vision

**TreeShop becomes the standard for tree service estimation and operations.**

---

## Current Phase: Work Order System (MVP)

### What We're Building Now ✅

**Work Order Management** - Internal operations tool for tracking field work

**Features Complete:**
- ✅ Work order list view
- ✅ Work order detail view with accordions
- ✅ Line items (Transport, Setup, Main Work, Tear Down)
- ✅ Start/Stop timer functionality
- ✅ Real-time time tracking with elapsed time display
- ✅ Complete button to mark tasks done
- ✅ Task status workflow (not_started → in_progress → completed)
- ✅ Production rate tracking (Score ÷ Actual Hours)
- ✅ Variance calculation (Actual vs Estimated)
- ✅ Recent activity log
- ✅ Job summary with progress bars
- ✅ Crew assignment display

**Next Steps:**
- [ ] Support task logging (dropdown for Transport, Maintenance, etc.)
- [ ] Add notes/photos to time logs
- [ ] Employee login system (Clerk integration)
- [ ] Push notifications when job status changes
- [ ] Offline mode for field work (PWA)

---

## Phase 2: Proposal System (Next Up)

### Goal: Automated Pricing from Historical Data

**Features to Build:**
1. **Service Catalog** - Define services with formulas
   - TreeScore for removals
   - StumpScore for grinding
   - Mulching Score for forestry mulching
   - Trimming Score for pruning
   - Clearing Score for land clearing

2. **AFISS Factor Library** - 119 site complexity factors
   - Narrow gate access (+12%)
   - Power lines (+15%)
   - Wetlands (+15%)
   - Steep terrain (+20%)
   - etc.

3. **Proposal Builder UI**
   - Customer info input
   - Add line items with dynamic forms
   - Select AFISS factors (checkboxes)
   - Real-time score/hours/price calculation
   - Show formula breakdown
   - Generate PDF proposal

4. **Convert Proposal → Work Order**
   - Won proposals become work orders
   - Line items copy over with estimates
   - Assign crew & equipment
   - Schedule job

---

## Phase 3: Analytics & Learning Loop

### Goal: Use Real Data to Improve Future Estimates

**Features:**
1. **Productivity Reports** - Post-job analysis
   - Estimated vs actual comparison
   - Profit variance (fixed price - actual cost)
   - Production rate performance by line item
   - Flag items >10% off target
   - Recommend production rate updates

2. **Historical Data Dashboard**
   - Average production rates over time
   - Crew performance trends
   - Service profitability analysis
   - Pricing accuracy metrics

3. **Auto-Pricing Intelligence**
   - Use historical rates instead of guesses
   - Adjust for AFISS factors automatically
   - Confidence scoring on estimates
   - "Smart suggestions" for pricing

---

## Phase 4: Customer-Facing Tools

### Goal: Instant Quotes for Customers (Ops Section)

**Features:**
1. **Quote Calculator** (Public Tool)
   - Customer enters measurements
   - Instant quote based on TreeShop formulas
   - No account required
   - Lead capture form
   - "Book Now" button

2. **Project Gallery** - Before/After photos
3. **Service Explanations** - How it works
4. **Testimonials & Reviews**

---

## Phase 5: Tech Section (Documentation Hub)

### Goal: Showcase Innovation & Build Authority

**Features:**
1. **Formula Documentation** - How TreeShop scoring works
2. **API Documentation** - For partners/integrations
3. **Research Papers** - Published studies
4. **Developer Portal** - Open source tools
5. **Technical Blog** - Industry insights

---

## Phase 6: Media Section (Content Hub)

### Goal: SEO, Education, Brand Building

**Features:**
1. **Blog System** - Articles, how-tos, industry news
2. **YouTube Integration** - Embedded videos
3. **Social Media Aggregation** - Feed from all platforms
4. **Case Studies** - Deep dives into projects
5. **Podcast Episodes** (if applicable)

---

## Phase 7: TreeShop Supply (eCommerce)

### Goal: Product Revenue Stream

**Features:**
1. **Product Catalog**
   - Forestry mulching equipment
   - Tools & accessories
   - Safety gear
   - Branded merchandise

2. **Digital Products**
   - Coaching programs
   - Training courses
   - Calculator templates
   - Software licenses

3. **Shopping Cart** - Stripe integration
4. **Order Management**
5. **Customer Reviews**

---

## Technical Stack

**Frontend:**
- Next.js (React framework)
- TypeScript
- MUI (Material-UI components)
- Tailwind CSS

**Backend:**
- Convex (real-time database + backend functions)
- No API routes needed (Convex handles it)

**Auth:**
- Clerk (user authentication & management)

**Payments:**
- Stripe (for TreeShop Supply)

**Hosting:**
- Vercel (Next.js hosting)
- Convex Cloud (database)

**File Storage:**
- Convex File Storage (job photos, documents)
- Vercel Blob (if needed for large media)

---

## Revenue Streams (Future)

1. **Core Service Revenue** (80%) - Tree services
2. **Subscription Revenue** (10%) - Monitoring services
3. **Software Licensing** (5%) - White-label to competitors
4. **TreeShop Supply** (5% → 15%) - eCommerce
5. **Consulting & Training** - Premium services

---

## Success Metrics

**Operational:**
- Quote time: 5 minutes (vs competitor 2-3 days)
- Pricing accuracy: ±10% (vs ±30% industry average)
- Crew efficiency: Track production rates over time
- Customer satisfaction: Transparency = trust

**Financial:**
- Profit margin improvement (data-driven pricing)
- Revenue growth (scalable system)
- Customer acquisition cost (instant quotes = more leads)

**Strategic:**
- Industry recognition (TreeShop becomes standard)
- Competitive moat (proprietary formulas + data)
- Market position (innovation leader)

---

## Current Priority: Complete Work Order MVP

**Focus:** Get field crews using the system daily to collect production data

**Why:** Historical production rates are the foundation for auto-pricing

**Timeline:** Work Order MVP → Proposal System → Data Loop → Customer Tools

---

## Notes

- Start simple, iterate fast
- Real data > Perfect features
- Build what crews need, not what we think they need
- Customer-facing tools come AFTER internal tools work
- Every feature should feed the data loop
