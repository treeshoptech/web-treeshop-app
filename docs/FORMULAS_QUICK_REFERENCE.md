# TreeShop Formulas - Quick Reference

## The 7 Core Formulas

---

### 1. TreeScore (Tree Removal & Assessment)

```
TreeScore = H × (D ÷ 12) × 2 × R²

Where:
  H = Height in feet
  D = DBH (Diameter at Breast Height) in inches
  R = Crown Radius in feet
```

**Production Rates:**
- Entry crew: 35,000-45,000 TS/hour
- Standard crew: 45,000-55,000 TS/hour
- Advanced crew: 55,000-70,000+ TS/hour

---

### 2. StumpScore (Stump Grinding)

```
StumpScore = DBH² × (Height + Grind_Depth)

Where:
  DBH = Diameter at stump level in inches
  Height = Height of remaining stump in inches
  Grind_Depth = Depth below grade in inches
```

**Standard Grind Depths:**
- Standard: 6 inches
- Deep: 12 inches
- Extra Deep: 18 inches

**Production Rates:**
- Small grinder: 3,000-5,000 SS/hour
- Medium grinder: 5,000-8,000 SS/hour
- Large grinder: 8,000-12,000 SS/hour

---

### 3. Mulching Score (Forestry Mulching) **[YOUR SPECIALTY]**

```
Mulching_Score = Acres × DBH_Package

Where:
  Acres = Project acreage
  DBH_Package = Maximum DBH for area
```

**DBH Packages:**
- Package 2: Max 2" DBH (brush/small saplings)
- Package 4: Max 4" DBH (small trees/dense brush)
- Package 6: Max 6" DBH (mixed understory) **[MOST COMMON]**
- Package 8: Max 8" DBH (standard mixed forest)
- Package 10: Max 10" DBH (mature mixed forest)
- Package 12: Max 12" DBH (larger trees)
- Package 15: Max 15" DBH (large tree forest)

**Production Rates (Equipment-Dependent):**
- 50-70 HP mulcher: 20-40 points/hour
- 70-100 HP mulcher: 40-60 points/hour
- 100+ HP mulcher: 60-100+ points/hour

**Example:**
```
Project: 3.5 acres, max 6" DBH
Mulching Score = 3.5 × 6 = 21 points
Production Rate = 1.5 points/hour (w/ AFISS factors)
Estimated Time = 21 ÷ 1.5 = 14 hours
```

---

### 4. Trimming Score (Tree Trimming/Pruning)

```
Trimming_Score = TreeScore × Trim_Percentage

Trim Factors:
  Light trim (10-20%): 0.10 - 0.20
  Standard trim (20-30%): 0.20 - 0.30
  Heavy trim (30-50%): 0.30 - 0.50
```

---

### 5. Clearing Score (Land Clearing)

```
Clearing_Score = Acres × (D ÷ 12) × H

Where:
  Acres = Project acreage
  D = Average DBH across area
  H = Average tree height

Note: ONLY COVERS CLEARING. DISPOSAL IS ADDITIONAL.
```

**Production Rates:**
- Light clearing: 0.3-0.5 acres/hour
- Medium clearing: 0.2-0.3 acres/hour
- Heavy clearing: 0.1-0.2 acres/hour

---

### 6. Production Rate (Efficiency Tracking)

```
Production_Rate = Score ÷ Time

Example:
  Mulching Score = 26.67
  Actual Time = 12.5 hours
  Production Rate = 26.67 ÷ 12.5 = 2.13 points/hour
```

**This is THE KEY METRIC for:**
- Crew efficiency
- Future job estimation
- Pricing accuracy
- Performance tracking

---

### 7. Service Cost (Automated Pricing)

```
Service_Cost = (Score ÷ Production_Rate) × Billing_Rate

Example:
  Score = 26.67
  Production Rate = 1.5 points/hour
  Billing Rate = $500/hour

  Estimated Hours = 26.67 ÷ 1.5 = 17.8 hours
  Service Cost = 17.8 × $500 = $8,900
```

---

## AFISS (Access Factor & Impeded Site Scoring System)

AFISS factors are **multipliers** that adjust the base score for site complexity.

```
Adjusted_Score = Base_Score × (1.0 + sum_of_AFISS_factors)

Common AFISS Factors:
  Narrow gate access: +12%
  Power lines present: +15%
  Wetlands/protected area: +15%
  Steep terrain (>20°): +20%
  Rocky soil: +10%
  Dense brush (>70% coverage): +15%
```

**Example:**
```
Base Mulching Score = 21 points
AFISS Factors:
  + Narrow gate (+12%) = 0.12
  + Wetlands (+15%) = 0.15
Total AFISS = 1.0 + 0.12 + 0.15 = 1.27 (27% increase)

Adjusted Score = 21 × 1.27 = 26.67 points
```

---

## Implementation in Work Order System

### Line Item Structure

Each line item has:
- `baseScore` - Calculated from formula
- `adjustedScore` - After AFISS factors
- `estimatedHours` - Score ÷ Production Rate
- `lineItemTotal` - Hours × Billing Rate

### Time Tracking

As crew logs time:
- `actualProductiveHours` accumulates
- `actualProductionRate` = Score ÷ Actual Hours
- `variance` = Actual - Estimated

### Continuous Improvement

After job completion:
- Compare estimated vs actual production rates
- Update company average production rates
- Use historical data for future estimates

---

## Next Implementation Steps

1. **Add formula calculation UI** (Proposal Builder)
2. **Implement AFISS factor library** (119 factors total)
3. **Production rate tracking** (Real-time in Work Orders)
4. **Historical data analysis** (Post-job reports)
5. **Auto-pricing engine** (Use historical rates)
