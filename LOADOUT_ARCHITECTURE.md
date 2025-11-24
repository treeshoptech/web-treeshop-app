# Loadout Assignment Architecture Diagram

## System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LOADOUT CREATION                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │      CREATE LOADOUT       │
                    ├───────────────────────────┤
                    │  • Select Employees       │
                    │  • Select Equipment       │
                    │  • Calculate Total Cost   │
                    └───────────┬───────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │   Loadout Record Created  │
                    ├───────────────────────────┤
                    │  employeeIds: [...]       │
                    │  equipmentIds: [...]      │
                    │  totalHourlyCost: $450    │
                    └───────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                        JOB CREATION WITH LOADOUT                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │      CREATE JOB           │
                    ├───────────────────────────┤
                    │  customerId               │
                    │  assignedLoadoutId ◄──────┼──── SELECT LOADOUT
                    └───────────┬───────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │  Fetch Loadout Details    │
                    ├───────────────────────────┤
                    │  totalHourlyCost: $450    │
                    └───────────┬───────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────────┐
        │      CREATE DEFAULT LINE ITEMS                │
        │   (with loadout-based pricing)                │
        └───────────────────────────────────────────────┘
                    │           │           │           │
                    ▼           ▼           ▼           ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │  Transport  │ │    Setup    │ │   Cleanup   │ │  Transport  │
        │   to Site   │ │             │ │             │ │     Back    │
        ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤
        │  1hr × $450 │ │ 0.5hr × $450│ │ 0.5hr × $450│ │  1hr × $450 │
        │  = $450     │ │  = $225     │ │  = $225     │ │  = $450     │
        └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                   ASSIGN LOADOUT TO EXISTING JOB                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │   EXISTING JOB (No LO)    │
                    ├───────────────────────────┤
                    │  Transport: $500 (default)│
                    │  Setup: $250 (default)    │
                    └───────────┬───────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │    assignLoadout()        │
                    ├───────────────────────────┤
                    │  loadoutId: "loadout_1"   │
                    │  updatePricing: true ◄────┼──── USER CHOICE
                    └───────────┬───────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │  Recalculate Support Tasks│
                    ├───────────────────────────┤
                    │  Transport: $450 (updated)│
                    │  Setup: $225 (updated)    │
                    └───────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                     UPDATE LINE ITEM HOURS                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────┐
        │  Is this a SUPPORT task?                      │
        │  (transport, setup, cleanup)                  │
        └─────────────┬────────────┬────────────────────┘
                      │            │
                  YES │            │ NO (Production Task)
                      ▼            ▼
        ┌───────────────────┐  ┌────────────────────┐
        │ Does job have     │  │  Keep manual       │
        │ assignedLoadoutId?│  │  pricing           │
        └─────────┬─────────┘  │  (score-based)     │
                  │            └────────────────────┘
              YES │
                  ▼
        ┌───────────────────────────┐
        │  Auto-Recalculate Price   │
        ├───────────────────────────┤
        │  newTotal =               │
        │    loadout.totalHourlyCost│
        │    × newHours             │
        └───────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA MODEL RELATIONSHIPS                            │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │      JOB        │
    ├─────────────────┤
    │ assignedLoadoutId ────────┐
    │ totalInvestment │          │
    └────────┬────────┘          │
             │                   │
             │ has many          │ references
             ▼                   ▼
    ┌─────────────────┐   ┌──────────────────┐
    │   LINE ITEMS    │   │     LOADOUT      │
    ├─────────────────┤   ├──────────────────┤
    │ estimatedHours  │   │ totalHourlyCost  │◄─── CALCULATED
    │ lineItemTotal   │   │ employeeIds[]    │     from below
    │ serviceType     │   │ equipmentIds[]   │
    └─────────────────┘   └────────┬─────────┘
                                   │
                          ┌────────┴─────────┐
                          │                  │
                          ▼                  ▼
                 ┌─────────────────┐  ┌──────────────────┐
                 │   EMPLOYEES     │  │    EQUIPMENT     │
                 ├─────────────────┤  ├──────────────────┤
                 │ effectiveRate   │  │ hourlyCost       │
                 │ (e.g., $75/hr)  │  │ (e.g., $250/hr)  │
                 └─────────────────┘  └──────────────────┘

    totalHourlyCost = Σ(employee.effectiveRate) + Σ(equipment.hourlyCost)
                    = ($75 + $65) + ($250 + $60)
                    = $450/hr


┌─────────────────────────────────────────────────────────────────────────┐
│                         PRICING DECISION TREE                            │
└─────────────────────────────────────────────────────────────────────────┘

                        CREATE LINE ITEM
                                │
                                ▼
                ┌───────────────────────────┐
                │  Is it a SUPPORT task?    │
                │  (transport/setup/cleanup)│
                └─────────┬─────────┬───────┘
                          │         │
                      YES │         │ NO
                          ▼         ▼
        ┌───────────────────────┐  ┌────────────────────┐
        │ Job has loadout?      │  │ Use score-based    │
        └─────────┬─────────────┘  │ pricing or custom  │
                  │                └────────────────────┘
          YES │         │ NO
              ▼         ▼
    ┌──────────────┐  ┌──────────────┐
    │ Use loadout  │  │ Use default  │
    │ hourly cost: │  │ hardcoded:   │
    │              │  │              │
    │ hours ×      │  │ Transport:   │
    │ loadout.     │  │   $500       │
    │ totalHourly  │  │ Setup: $250  │
    │ Cost         │  │ Cleanup: $250│
    └──────────────┘  └──────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      TYPICAL COST BREAKDOWN                              │
└─────────────────────────────────────────────────────────────────────────┘

    Loadout: "Heavy Mulching Crew A"

    EMPLOYEES (Labor Costs)
    ├─ John Doe (Crew Leader)           $75/hr
    └─ Jane Smith (Operator)            $65/hr
                                    ──────────
    Subtotal Labor:                    $140/hr

    EQUIPMENT (Machine Costs)
    ├─ Forestry Mulcher #2            $250/hr
    ├─ Skid Steer                      $60/hr
    └─ Chipper                         $45/hr
                                    ──────────
    Subtotal Equipment:                $355/hr

    ═══════════════════════════════════════════
    TOTAL HOURLY COST:                 $495/hr
    ═══════════════════════════════════════════

    Applied to Support Tasks:

    Transport to Site:    1.0 hr × $495 = $495
    Setup:                0.5 hr × $495 = $248
    Cleanup:              0.5 hr × $495 = $248
    Transport Back:       1.0 hr × $495 = $495
                                      ─────────
    Total Support Cost:                  $1,486


┌─────────────────────────────────────────────────────────────────────────┐
│                         MUTATION FLOW DIAGRAM                            │
└─────────────────────────────────────────────────────────────────────────┘

    User Action: "Create new job with loadout"
         │
         ▼
    ┌──────────────────────────────────┐
    │  Frontend: Job Creation Form     │
    │  ✓ Select Customer               │
    │  ✓ Select Loadout: "Crew A"      │
    └──────────────┬───────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────┐
    │  API: createJob()                │
    │  args: {                         │
    │    customerId,                   │
    │    assignedLoadoutId             │
    │  }                               │
    └──────────────┬───────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────┐
    │  1. Insert Job Record            │
    │     assignedLoadoutId = loadout_1│
    └──────────────┬───────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────┐
    │  2. Fetch Loadout                │
    │     loadout = db.get(loadout_1)  │
    │     cost = loadout.totalHourlyCost│
    └──────────────┬───────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────┐
    │  3. Create Line Items            │
    │     for each support task:       │
    │       total = hours × cost       │
    └──────────────┬───────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────┐
    │  4. Return jobId                 │
    │     Frontend redirects to        │
    │     /work-orders/{jobId}         │
    └──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                     BACKWARD COMPATIBILITY                               │
└─────────────────────────────────────────────────────────────────────────┘

    OLD JOBS (created before loadout feature)
    ┌──────────────────────────────────┐
    │  Job                             │
    │  ├─ assignedCrewId: "crew_1"     │  ◄── Still works
    │  ├─ assignedLoadoutId: null      │  ◄── Not set
    │  └─ lineItems:                   │
    │      └─ Transport: $500          │  ◄── Manual/default pricing
    └──────────────────────────────────┘

    STATUS: ✓ Works without changes


    NEW JOBS (created with loadout)
    ┌──────────────────────────────────┐
    │  Job                             │
    │  ├─ assignedCrewId: null         │  ◄── Optional (legacy)
    │  ├─ assignedLoadoutId: "lo_1"    │  ◄── NEW!
    │  └─ lineItems:                   │
    │      └─ Transport: $450          │  ◄── Loadout-based pricing
    └──────────────────────────────────┘

    STATUS: ✓ Uses new pricing logic


┌─────────────────────────────────────────────────────────────────────────┐
│                      FUTURE ENHANCEMENTS                                 │
└─────────────────────────────────────────────────────────────────────────┘

    1. LOADOUT TEMPLATES
       ┌─────────────────────────────┐
       │  Save frequently used       │
       │  loadout configurations     │
       │  as templates               │
       └─────────────────────────────┘

    2. PRODUCTION RATE ESTIMATES
       ┌─────────────────────────────┐
       │  Use loadout's historical   │
       │  production rates to        │
       │  auto-estimate hours        │
       └─────────────────────────────┘

    3. LOADOUT SCHEDULING
       ┌─────────────────────────────┐
       │  Calendar view showing      │
       │  which loadouts are         │
       │  assigned to which jobs     │
       └─────────────────────────────┘

    4. LOADOUT AVAILABILITY
       ┌─────────────────────────────┐
       │  Prevent double-booking     │
       │  same loadout on            │
       │  overlapping dates          │
       └─────────────────────────────┘

    5. COST VARIANCE TRACKING
       ┌─────────────────────────────┐
       │  Compare estimated cost     │
       │  (loadout) vs actual cost   │
       │  (time logs)                │
       └─────────────────────────────┘
