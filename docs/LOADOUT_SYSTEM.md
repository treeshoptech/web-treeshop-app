# LOADOUT: Equipment & Crew Configuration System
## The Central Hub of TreeShop Work Orders

**Version 1.0** | **December 2025** | **TreeShop Proprietary**

---

## Core Concept

**Loadout** is the complete definition of how you'll staff and equip a job.

A Loadout includes:
- All equipment assigned to the job
- All employees assigned to the job
- Transport configuration (truck, trailer, fuel)
- Total cost per hour
- Billing rate (cost + company profit margin %)
- Two rates: Transport Rate (travel) and Production Rate (working)

**Everything else in TreeShop loops around the Loadout.**

---

## The Loadout Formula

```
COST-SIDE (Internal):
  Equipment Hourly Cost: $X/hour
  + Employee Hourly Cost: $Y/hour
  = Total Loadout Cost: $(X+Y)/hour

BILLING-SIDE (Customer):
  Loadout Cost: $(X+Y)/hour
  × (1 + Company Profit Margin %)
  = Loadout Billing Rate: $(X+Y) × Profit Margin/hour

EXAMPLE:
  Equipment: $150/hour
  Employees: $100/hour
  Total Cost: $250/hour

  Company Margin: 50%
  Billing Rate: $250 × (1 + 0.50) = $375/hour
```

---

## Two Rates Per Loadout

```
TRANSPORT RATE (While traveling to/from job):
  Subset of equipment (truck + trailer, no heavy equipment)
  All crew (they're working during travel)
  Example: $203/hour cost × 1.50 = $304.50/hour billing

PRODUCTION RATE (While working at full capacity):
  Full loadout cost (all equipment + crew)
  Example: $261.50/hour cost × 1.50 = $392.25/hour billing
```

---

## The Complete Loop

```
Lead/Proposal Creation:
  1. Select Loadout template
  2. Calculate Base Score (TreeScore, Mulching Score, etc.)
  3. Add AFISS factors → Production Score
  4. Time = Production Score ÷ Production Rate (points/hour)
  5. Cost = Time × Loadout Billing Rate
  6. Quote to customer

Work Order:
  1. Loadout assigned
  2. Equipment and crew confirmed
  3. Transport leg: Time × Transport Billing Rate
  4. Work leg: Time × Production Billing Rate
  5. Invoice generated
  6. Actual costs tracked vs. estimated
```

---

## Equipment Component

### Equipment Cost Calculation (Army Corps of Engineers Method)

```
Equipment: Fecon BEAST Forestry Mulcher

FINANCIAL DATA:
  Purchase Price: $165,000
  Useful Life: 5 years
  Salvage Value: 20% = $33,000
  Annual Operating Hours: 1,500

DEPRECIATION:
  Annual Depreciation = (165,000 - 33,000) ÷ 5 = $26,400/year
  Hourly Depreciation = $26,400 ÷ 1,500 = $17.60/hour

FUEL:
  Consumption: 4.5 gallons/hour
  Fuel Price: $3.50/gallon
  Hourly Fuel: 4.5 × $3.50 = $15.75/hour

MAINTENANCE:
  Annual Service: $6,750
  Hourly Maintenance: $6,750 ÷ 1,500 = $4.50/hour

OTHER (filters, belts, etc.):
  Annual: $1,500
  Hourly: $1.00/hour

TOTAL HOURLY COST:
  $17.60 + $15.75 + $4.50 + $1.00 = $38.85/hour

With 15% overhead:
  $38.85 × 1.15 = $44.70/hour cost
```

---

## Employee Component

### Employee Cost Calculation

```
Employee: John Smith (Equipment Operator)

ANNUAL COST:
  Salary: $55,000
  Benefits (health, 401k, dental): $14,000
  Payroll taxes (FICA, UI, WC): $8,500
  Company insurance allocation: $3,500
  ────────────────────────────
  Total Annual Cost: $81,000

HOURLY COST:
  Annual Hours (40 hrs/week × 50 weeks): 2,000 hours
  Hourly Cost = $81,000 ÷ 2,000 = $40.50/hour
```

---

## Complete Loadout Example

### Standard Forestry Mulching Loadout

```json
{
  "loadout_id": "LO-MULCHING-STD",
  "loadout_name": "Standard Forestry Mulching Crew",

  "equipment": [
    {
      "name": "Fecon BEAST Mulcher",
      "hourly_cost": 44.70,
      "included_in_transport": false
    },
    {
      "name": "Support Pickup",
      "hourly_cost": 38.50,
      "included_in_transport": true
    },
    {
      "name": "Equipment Trailer",
      "hourly_cost": 22.00,
      "included_in_transport": true
    },
    {
      "name": "Safety Equipment",
      "hourly_cost": 8.00,
      "included_in_transport": false
    }
  ],

  "personnel": [
    {
      "name": "John Smith",
      "position": "Equipment Operator",
      "hourly_cost": 40.50
    },
    {
      "name": "Mike Johnson",
      "position": "Ground Crew",
      "hourly_cost": 35.00
    },
    {
      "name": "Dave Brown",
      "position": "Spotter",
      "hourly_cost": 32.00
    }
  ],

  "costs": {
    "equipment_total": 113.20,
    "personnel_total": 107.50,
    "total_hourly_cost": 220.70
  },

  "billing": {
    "profit_margin_percentage": 50,
    "production_billing_rate": 331.05,
    "transport_billing_rate": 304.50
  }
}
```

---

## Loadout in Proposal

### Calculating Customer Quote

```
PROJECT: 3.5 acre forestry mulching

STEP 1: Calculate Score
  Base Mulching Score: 3.5 × 6 = 21 points
  AFISS Factors: +27% = +5.67 points
  Production Score: 26.67 points

STEP 2: Select Loadout
  Standard Forestry Mulching Crew
  Production Rate: 1.5 points/hour
  Production Billing Rate: $331.05/hour

STEP 3: Calculate Time
  Time = 26.67 ÷ 1.5 = 17.8 hours

STEP 4: Calculate Cost
  Production: 17.8 × $331.05 = $5,893
  Transport (2 hours): 2 × $304.50 = $609

  CUSTOMER QUOTE: $6,502
```

---

## Loadout in Work Order

### Real-Time Tracking

```
WORK ORDER #WO-1234
Loadout: Standard Forestry Mulching Crew

EQUIPMENT ASSIGNED:
  ✓ Fecon BEAST Mulcher ($44.70/hr)
  ✓ Support Pickup ($38.50/hr)
  ✓ Equipment Trailer ($22.00/hr)
  ✓ Safety Equipment ($8.00/hr)

PERSONNEL ASSIGNED:
  ✓ John Smith - Operator ($40.50/hr)
  ✓ Mike Johnson - Ground ($35.00/hr)
  ✓ Dave Brown - Spotter ($32.00/hr)

ACTUAL COSTS:
  Equipment: $113.20/hr
  Personnel: $107.50/hr
  Total Cost: $220.70/hr

  Billing Rate (50% margin): $331.05/hr

TIME TRACKING:
  Transport Out: 1.0 hr @ $304.50 = $304.50
  Production: 12.5 hr @ $331.05 = $4,138
  Transport Home: 1.0 hr @ $304.50 = $304.50

  TOTAL INVOICE: $4,747
```

---

## Key Principles

### 1. Loadout Centralizes All Costs

Don't bill equipment and labor separately.

Instead:
- Loadout = Everything packaged
- One rate = All-inclusive cost
- Customer sees only: $ Total

### 2. Two Rates Are Critical

```
Transport Rate: Lower (minimal equipment)
  - Just truck + crew in transit
  - No production equipment running

Production Rate: Higher (full loadout)
  - All equipment operating
  - Full crew productivity
  - This is where margins come from
```

### 3. Profit Margin Applied Uniformly

Company sets profit margin once (e.g., 50%)
Applied to all loadouts automatically

```
Loadout Cost × 1.50 = Billing Rate
```

### 4. Loadout Drives Everything

Loadout isn't just for billing. It drives:
- Equipment needs
- Crew assignments
- Timeline (production rate)
- Transport costs
- Invoice line items
- Profitability analysis

---

## Loadout Templates Library

```
1. STANDARD TREE REMOVAL
   Cost: $285/hour
   Billing (50%): $427.50/hour

2. STUMP GRINDING
   Cost: $145/hour
   Billing (50%): $217.50/hour

3. STANDARD FORESTRY MULCHING
   Cost: $220.70/hour
   Billing (50%): $331.05/hour

4. LIGHT CLEARING
   Cost: $125/hour
   Billing (50%): $187.50/hour

5. EMERGENCY CREW
   Cost: $310/hour
   Billing (75% margin): $542.50/hour
```

---

## Summary

**Loadout = Cost (Equip + Personnel) × Profit Margin = Billing Rate**

### The Calculation
```
Equipment Cost: $100/hour
Personnel Cost: $120/hour
Total Cost: $220/hour

Company Margin: 50%
Billing Rate: $220 × 1.50 = $330/hour

Production Work: 5 hours × $330/hour = $1,650
Transport: 2 hours × $330/hour = $660
Total Invoice: $2,310
```

### Why It Matters

✅ Everything ties together - Loadout is the central hub
✅ Simple billing - One rate × time = cost
✅ Perfect transparency - Know your costs and margins
✅ Easy scaling - Create templates, reuse them
✅ Flexible - Customize for specific projects
✅ Profitable - Profit margin applied uniformly

---

**LOADOUT: Equipment & Crew Configuration System** | **TreeShop Proprietary**

Base Cost + Profit Margin = Billing Rate
Cost × Time = Customer Invoice
