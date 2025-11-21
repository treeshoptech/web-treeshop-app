# TreeShop System Overview
## How Everything Connects

---

## The Big Picture

```
FORMULAS → AFISS → LOADOUT → PROPOSAL → WORK ORDER → INVOICE → ANALYTICS → LEARNING LOOP
```

---

## 1. FORMULAS (Base Scoring)

**7 Core Formulas calculate Base Score in ideal conditions:**

```
Mulching Score = Acres × DBH_Package
TreeScore = H × (D ÷ 12) × 2 × R²
StumpScore = DBH² × (Height + Grind_Depth)
Trimming Score = TreeScore × Trim_Percentage
Clearing Score = Acres × (D ÷ 12) × H
Production Rate = Score ÷ Time
Service Cost = (Score ÷ Rate) × Billing_Rate
```

**Example:**
```
3.5 acres × 6" DBH = 21 points (Base Mulching Score)
```

---

## 2. AFISS (Real-World Adjustment)

**AFISS factors INCREASE base score for real-world complexity:**

```
Production Score = Base Score + AFISS Adjustments

Example:
  Base: 21 points
  + Rocky soil (+10%): +2.1 points
  + Steep terrain (+15%): +3.15 points
  + Wetlands (+15%): +3.15 points
  = Production Score: 29.4 points
```

**AFISS Categories:**
- Environmental (weather, terrain, access)
- Hazard & Safety (power lines, buildings, wildlife)
- Operational (debris, equipment, multiple items)
- Administrative (emergency, discounts, permits)

**Key Principle:** More complexity = More work = Higher score = Higher quote

---

## 3. LOADOUT (Cost Structure)

**Loadout = Equipment + Personnel packaged together**

```
COST CALCULATION:
  Equipment: $113.20/hour
  Personnel: $107.50/hour
  Total Cost: $220.70/hour

BILLING CALCULATION:
  Cost × (1 + Profit Margin %)
  $220.70 × 1.50 = $331.05/hour

TWO RATES:
  Transport Rate: $304.50/hour (truck + crew, minimal equipment)
  Production Rate: $331.05/hour (full equipment + crew working)
```

**Loadout drives:**
- Equipment assignments
- Crew assignments
- Production rate (points per hour)
- Billing rate ($ per hour)
- Transport costs
- Invoice breakdown

---

## 4. PROPOSAL (Customer Quote)

**Combines everything into customer quote:**

```
STEP 1: Measure & Score
  Base Mulching Score: 21 points

STEP 2: Add AFISS
  Production Score: 29.4 points

STEP 3: Select Loadout
  Standard Forestry Mulching Crew
  Production Rate: 1.5 points/hour
  Billing Rate: $331.05/hour

STEP 4: Calculate Time
  Time = 29.4 ÷ 1.5 = 19.6 hours

STEP 5: Calculate Cost
  Production: 19.6 × $331.05 = $6,489
  Transport (2 hrs): 2 × $304.50 = $609

  CUSTOMER QUOTE: $7,098
```

**Customer sees only: $7,098** (not the internal breakdown)

---

## 5. WORK ORDER (Execution)

**Accepted proposal becomes work order with real-time tracking:**

```
WORK ORDER #WO-1234

LOADOUT ASSIGNED:
  Standard Forestry Mulching Crew
  Equipment confirmed
  Personnel confirmed

LINE ITEMS:
  1. Transport (overhead) - Status: in_progress
  2. Setup (overhead) - Status: in_progress
  3. Forestry Mulching - 3.5 acres - Status: in_progress
     - Base Score: 21
     - Production Score: 29.4
     - Estimated: 19.6 hours
     - Actual: 12.5 hours (tracking)
  4. Tear Down (overhead) - Status: not_started

CREW TRACKING:
  John Smith starts timer → "Forestry Mulching"
  Timer runs: ⏱ 2h 15m 30s
  John Smith stops timer → Log saved

  Actual time accumulates: 12.5 hours logged
  Production Rate: 29.4 ÷ 12.5 = 2.35 points/hour
```

**Key Features:**
- Start/Stop buttons per task
- Complete button to mark done
- Real-time elapsed timer
- Recent activity feed
- Progress bars per line item

---

## 6. INVOICE (Billing)

**Work order generates invoice with actual costs:**

```
INVOICE #INV-2025-001

Line Items:
  Transport Out: 1.0 hr @ $304.50 = $304.50
  Production: 12.5 hr @ $331.05 = $4,138
  Transport Home: 1.0 hr @ $304.50 = $304.50
  ────────────────────────────────────
  TOTAL: $4,747

MARGIN ANALYSIS:
  Estimated: $7,098 (19.6 hours)
  Actual: $4,747 (14.5 hours total)
  Variance: -$2,351 (33% under, better performance!)

  Actual Production Rate: 2.35 pts/hr (faster than 1.5 estimate)
```

---

## 7. ANALYTICS (Learning)

**Compare estimated vs actual for continuous improvement:**

```
JOB #WO-1234 ANALYSIS

PRODUCTION RATE:
  Estimated: 1.5 points/hour
  Actual: 2.35 points/hour
  Variance: +57% faster

FACTORS:
  - Crew gained efficiency
  - AFISS factors were conservative
  - Equipment performed better than expected

RECOMMENDATION:
  Update company production rate from 1.5 to 1.8 pts/hr
  (Average historical performance)

PRICING IMPACT:
  Next similar job:
    Score: 29.4 points
    Time: 29.4 ÷ 1.8 = 16.3 hours (was 19.6)
    Cost: 16.3 × $331.05 = $5,396 (was $6,489)

    More competitive quote, still profitable
```

---

## 8. LEARNING LOOP (Continuous Improvement)

**Data feeds back into system:**

```
WORK ORDER TRACKING
    ↓
ACTUAL PRODUCTION RATES
    ↓
HISTORICAL DATABASE
    ↓
UPDATE COMPANY AVERAGES
    ↓
NEXT PROPOSAL USES REAL DATA
    ↓
MORE ACCURATE QUOTES
    ↓
BETTER MARGINS & WIN RATE
```

---

## How It All Connects

### Proposal Creation Flow

```
1. Sales rep measures job site
   → Height, DBH, Acres, etc.

2. Enter measurements
   → System calculates Base Score (formula)

3. Select AFISS factors
   → Rocky soil, steep terrain, wetlands
   → System adds adjustments
   → Production Score calculated

4. Select Loadout
   → Standard Forestry Mulching Crew
   → System knows production rate & billing rate

5. Calculate time & cost
   → Time = Production Score ÷ Production Rate
   → Cost = Time × Billing Rate
   → Add transport costs

6. Generate quote
   → Customer sees: $7,098
   → Send proposal
```

### Work Order Execution Flow

```
1. Proposal accepted
   → Create work order
   → Copy line items with estimates

2. Assign loadout
   → Equipment confirmed
   → Personnel confirmed
   → Rates locked in

3. Job day arrives
   → Crew logs Transport Out
   → Crew logs Setup
   → Crew starts timer on main work

4. Work progresses
   → Timer runs (real-time)
   → Crew stops timer
   → Actual hours accumulate
   → Production rate calculates

5. Job completes
   → Crew marks tasks complete
   → All line items done
   → Work order complete

6. Invoice generated
   → Actual costs calculated
   → Margin analysis performed
   → Invoice sent to customer
```

### Data Learning Flow

```
1. Job completed
   → All time logs saved
   → Actual production rate: 2.35 pts/hr
   → Estimated was: 1.5 pts/hr

2. Compare estimated vs actual
   → 57% faster than expected
   → Factors identified

3. Update company averages
   → Old average: 1.5 pts/hr
   → New job: 2.35 pts/hr
   → Updated average: 1.8 pts/hr

4. Next proposal
   → Uses 1.8 pts/hr (not 1.5)
   → More accurate estimate
   → Better pricing
```

---

## Database Architecture

### Core Tables

```
jobs
  └─ jobLineItems
       └─ timeLogs (productive tasks linked to line item)
  └─ timeLogs (support tasks linked to job only)

loadouts
  └─ loadout_equipment
  └─ loadout_personnel

afissFactors (library of 119 factors)

employees
crews
equipment
```

### Key Relationships

```
Job has many Line Items
Job has many Time Logs
Line Item has many Time Logs (productive only)
Job has one Loadout
Loadout has many Equipment
Loadout has many Personnel
Line Item has many AFISS Factors
```

---

## Current Implementation Status

### ✅ Phase 1: Work Orders (Complete)

- Work order list & detail views
- Line items with Transport, Setup, Main Work, Tear Down
- Start/Stop timer with real-time tracking
- Complete button & task status
- Production rate calculation
- Variance tracking
- Recent activity feed
- Progress bars

### 🚧 Next: Phase 2: Proposals

- Service catalog (formulas)
- AFISS factor library (119 factors)
- Proposal builder UI
- Loadout selection
- Quote generation
- PDF output
- Proposal → Work Order conversion

---

## Key Principles

### 1. Customer Simplicity

**Customer sees:** $X
**Internal complexity:** Formulas + AFISS + Loadout + Time

### 2. Data-Driven Everything

Base everything on real historical data:
- Production rates from actual jobs
- AFISS factor impact from tracking
- Loadout costs from equipment & labor
- Pricing from market + margin

### 3. Continuous Learning

Every job improves the system:
- Track actual vs estimated
- Update production rates
- Refine AFISS factors
- Improve quotes

### 4. Loadout Centralization

Everything loops around Loadout:
- Equipment + Personnel = Cost
- Cost + Margin = Billing Rate
- Billing Rate × Time = Quote
- Simple, transparent, profitable

---

## Summary

**The Formula:**
```
Base Score (formula)
+ AFISS (real-world)
= Production Score

Production Score ÷ Production Rate = Time
Time × Loadout Billing Rate = Customer Quote

Track actual → Update rates → Improve future quotes
```

**The Vision:**
- 5-minute quotes (vs 2-3 day competitors)
- Data-driven pricing (vs gut feeling)
- Transparent to customers (vs black box)
- Continuously improving (vs static)
- Scalable (vs manual)

**The Result:**
- Faster quotes
- Better margins
- Happier customers
- Growing business
- Industry leadership

---

**TreeShop System Overview** | **Everything Connected**
