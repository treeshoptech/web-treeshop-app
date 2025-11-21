# TreeShop Documentation

This directory contains all project documentation and reference materials.

---

## Quick Links

### Primary Documentation

📘 **[TREESHOP_COMPLETE_UNIFIED_DOCUMENTATION.md](./TREESHOP_COMPLETE_UNIFIED_DOCUMENTATION.md)**
The complete master document covering everything about TreeShop (34,000+ words)

---

## Quick Reference Docs (Extracted from Master Doc)

📋 **[WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md)**
The 5 main divisions of treeshop.app:
- Main Section (homepage)
- Ops Section (customer-facing services)
- Tech Section (app & research)
- Media Section (blog, YouTube, SEO)
- TreeShop Supply (eCommerce)

📐 **[FORMULAS_QUICK_REFERENCE.md](./FORMULAS_QUICK_REFERENCE.md)**
The 7 TreeShop formulas with examples:
- TreeScore (tree removal)
- StumpScore (stump grinding)
- Mulching Score (forestry mulching) ⭐
- Trimming Score (pruning)
- Clearing Score (land clearing)
- Production Rate (efficiency)
- Service Cost (pricing)

🗺️ **[PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md)**
Development phases and priorities:
- **Phase 1:** Work Order System ✅ (Current)
- **Phase 2:** Proposal System (Next)
- **Phase 3:** Analytics & Learning Loop
- **Phase 4:** Customer-Facing Tools
- **Phase 5-7:** Tech, Media, Supply sections

---

## Critical System Architecture Docs

⚡ **[AFISS_SYSTEM.md](./AFISS_SYSTEM.md)** ⚡
**Assessment Factor Identification Scoring System**
- AFISS factors INCREASE base score (not decrease)
- Base Score = ideal conditions
- Production Score = Base + AFISS (real-world complexity)
- More factors = more work = higher quote
- Customer sees only final quote

🔧 **[LOADOUT_SYSTEM.md](./LOADOUT_SYSTEM.md)** 🔧
**Equipment & Crew Configuration - The Central Hub**
- Loadout = Equipment Cost + Personnel Cost
- Billing Rate = Cost × (1 + Profit Margin %)
- Two rates: Transport (travel) and Production (working)
- Everything in TreeShop loops around the Loadout
- Equipment cost calculation (Army Corps method)
- Employee cost calculation (fully loaded rates)

---

## Current Development Status

### ✅ Completed (Phase 1 - Work Orders MVP)

- Work order list & detail views
- Real-time time tracking with start/stop
- Line item management (Transport, Setup, Main Work, Tear Down)
- Complete button & task status workflow
- Production rate tracking
- Variance calculation
- Recent activity logs
- Job progress visualization

### 🚧 In Progress

- Support task logging (dropdown)
- Notes & photos on time logs

### 📋 Next Up (Phase 2 - Proposals)

- Service catalog with formulas
- AFISS factor library (119 factors)
- Proposal builder UI
- PDF generation
- Proposal → Work Order conversion

---

## Key Concepts

### Mulching Score (Your Specialty)

```
Mulching Score = Acres × DBH_Package

Example:
  3.5 acres × 6" DBH package = 21 points
  With AFISS factors (27%) = 26.67 points
  Production rate = 1.5 points/hour
  Estimated time = 26.67 ÷ 1.5 = 17.8 hours
```

### Production Rate Tracking

The entire system is built around this feedback loop:

1. **Estimate:** Create proposal with Mulching Score
2. **Track:** Crew logs actual time in Work Order
3. **Calculate:** Actual Production Rate = Score ÷ Time
4. **Learn:** Compare estimated vs actual
5. **Improve:** Update production rates for future jobs

### AFISS Factors

Site complexity multipliers that adjust base scores:
- Narrow gate: +12%
- Power lines: +15%
- Wetlands: +15%
- Steep terrain: +20%
- Rocky soil: +10%
- etc. (119 total factors)

---

## Tech Stack

- **Next.js + TypeScript** - Frontend framework
- **MUI (Material-UI)** - Component library
- **Convex** - Real-time database + backend
- **Clerk** - Authentication (coming soon)
- **Stripe** - Payments (for TreeShop Supply)
- **Vercel** - Hosting

---

## How to Use This Documentation

### If you're working on...

**Work Orders:** Reference [FORMULAS_QUICK_REFERENCE.md](./FORMULAS_QUICK_REFERENCE.md) for Mulching Score calculations

**New features:** Check [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) for priority and context

**Website structure:** See [WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) for the 5 main divisions

**Deep dive:** Read [TREESHOP_COMPLETE_UNIFIED_DOCUMENTATION.md](./TREESHOP_COMPLETE_UNIFIED_DOCUMENTATION.md) for everything

---

## File Structure

```
docs/
├── README.md (this file)
├── TREESHOP_COMPLETE_UNIFIED_DOCUMENTATION.md (master doc - 34K words)
├── WEBSITE_STRUCTURE.md (5 divisions of treeshop.app)
├── FORMULAS_QUICK_REFERENCE.md (7 formulas + examples)
└── PROJECT_ROADMAP.md (development phases)
```

---

## Notes

- All documentation is version controlled
- Update docs as features are built
- Reference master doc for authoritative source
- Quick references are for speed during development
