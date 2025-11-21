# AFISS: Assessment Factor Identification Scoring System
## Line Item Score Adjustment - CORRECTED ARCHITECTURE

**Version 2.0 - Simplified Correct Implementation** | **December 2025** | **TreeShop Proprietary**

---

## Core Concept (CORRECT)

**AFISS factors INCREASE the line item score.**

More factors = More work = Higher score = Higher quote

```
Base Score (ideal conditions)
+ AFISS Factors (real-world complexity adds work)
= Production Score (what gets quoted)

Production Score ÷ Production Rate = Time
Time × Billing Rate = Customer Quote
```

**Customer sees only the final quote. Not the components.**

---

## The Formula

```
Production Score = Base Score + (Base Score × AFISS Factor 1%)
                              + (Base Score × AFISS Factor 2%)
                              + (Base Score × AFISS Factor 3%)
                              + ...

Time = Production Score ÷ Production Rate
Cost = Time × Billing Rate (This is what customer sees)
```

---

## Real Example

```
Base TreeScore: 150,000 points
(Clean tree, ideal conditions, no complications)

AFISS Factors Identified:
  ✓ Power lines nearby: +15% (adds 22,500 points)
  ✓ Building at risk: +20% (adds 30,000 points)
  ✓ Dense crown: +10% (adds 15,000 points)
  ✓ Debris haul required: +15% (adds 22,500 points)

Production Score: 150,000 + 22,500 + 30,000 + 15,000 + 22,500 = 240,000 points

Time: 240,000 ÷ 50,000 TS/hour = 4.8 hours
Cost: 4.8 × $150/hour = $720

CUSTOMER QUOTE: $720 (full picture, all complexity included)
```

---

## AFISS Factor Categories

### Environmental Factors (Add to Base Score)
- Clear weather: 0% (baseline)
- Overcast: +5%
- Light rain: +10%
- Heavy rain: +25%
- Level ground: 0%
- Slight slope: +5%
- Steep slope (>30°): +15%
- Rocky/obstructed: +10%

### Hazard & Safety Factors (Add to Base Score)
- No power lines: 0%
- Power lines >50 ft away: +5%
- Power lines 20-50 ft away: +15%
- Power lines <20 ft away: +30%
- Building 30+ ft away: +10%
- Building 20-30 ft away: +20%
- Building <20 ft away: +30%

### Operational Complexity Factors (Add to Base Score)
- Mulch on-site (free): 0%
- Chip on-site: +5%
- Haul away: +15%
- Large wood (24-36"): +10%
- Very large (36-48"): +20%
- Narrow gate (>4 ft): +5%

### Administrative Factors (Add or Subtract)
- Standard work: 0%
- Emergency/after-hours: +30%
- Weekend work: +50%
- Warranty/rework: -20%
- Volume discount (3+ jobs): -5 to -15%

---

## Why AFISS Increases Score (Not Decreases)

### Logical Model

```
Base Score = Tree characteristics in ideal conditions
             (What it WOULD be if everything was perfect)

Real World = Complications and complexity
             (What it ACTUALLY is)

Production Score = Base + Reality
                 = What we actually quote
```

### Why It Makes Sense

1. **More factors = more work**
   - Overcast weather makes work slower (+5%)
   - Power lines require safety protocols (+15%)
   - Building risk requires protection (+20%)
   - These ADD to the workload

2. **Customer only sees total**
   - "Your quote is $2,925"
   - They don't care about the components
   - They only care about the final number

3. **Prevents underestimating**
   - Base score is for ideal conditions (rare)
   - Real jobs have factors (always)
   - AFISS ensures we quote realistically

---

## Implementation in Work Order System

### Line Item Structure

Each line item has:
- `baseScore` - Calculated from formula (ideal conditions)
- `afissFactors` - Array of selected factors
- `afissAdjustment` - Total points added by AFISS
- `adjustedScore` - Base + AFISS = Production Score
- `estimatedHours` - Score ÷ Production Rate
- `lineItemTotal` - Hours × Billing Rate

### Data Structure

```typescript
interface LineItem {
  baseScore: number;              // From formula
  afissFactors: AFISSFactor[];    // Selected factors
  afissAdjustment: number;        // Total AFISS points added
  adjustedScore: number;          // Base + AFISS = Production Score
  estimatedHours: number;         // Score ÷ Production Rate
  lineItemTotal: number;          // Hours × Billing Rate
}

interface AFISSFactor {
  id: string;                     // "POWER_LINES_20_50"
  name: string;                   // "Power lines 20-50 ft away"
  category: string;               // "Hazard"
  percentage: number;             // 15 (for +15%)
  pointsAdded: number;            // Calculated: baseScore × 0.15
  selected: boolean;
}
```

---

## Key Principles

**The customer quote is the ONLY number that matters.**

Everything else (base score, AFISS factors, production score, time estimate) is internal working.

Customer sees: **$X**

That's it. Simple. Clean. Professional.

---

## Summary

### The Formula (Internal)
```
Production Score = Base Score + AFISS Factors
Time = Production Score ÷ Production Rate
Customer Quote = Time × Billing Rate
```

### What Customer Sees (External)
```
$X
```

### Benefits
✅ AFISS built directly into line item scoring
✅ Factors always applied (can't be forgotten)
✅ Simple architecture (just addition)
✅ Perfect audit trail (all factors in line item)
✅ Customer transparency (full price includes all factors)
✅ Easy to scale (multiple line items with own factors)

---

**AFISS v2.0: Correct Implementation** | **TreeShop Proprietary**

Base + AFISS = Production Score = Customer Quote
