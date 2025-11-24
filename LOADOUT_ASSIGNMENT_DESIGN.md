# Project-Level Loadout Assignment System

## Overview

This design document describes the system for assigning loadouts (crew + equipment bundles) at the job/project level instead of individual line items. This ensures support tasks (transport, setup, cleanup) are correctly priced based on the full crew and equipment costs.

---

## Architecture

### Current State (Before)
```
Job
├─ assignedCrewId (employees only)
└─ Line Items
    ├─ Transport to Site ($500 - hardcoded)
    ├─ Setup ($250 - hardcoded)
    ├─ Production Tasks (score-based pricing)
    ├─ Cleanup ($250 - hardcoded)
    └─ Transport Back ($500 - hardcoded)

Problem: Support tasks don't reflect actual equipment costs
```

### New Design (After)
```
Job
├─ assignedCrewId (legacy, keep for backward compatibility)
├─ assignedLoadoutId (NEW)
│   ├─ Employees: [Employee1, Employee2, ...]
│   ├─ Equipment: [Mulcher, Truck, ...]
│   └─ totalHourlyCost: $450/hr (sum of all employee + equipment costs)
│
└─ Line Items (auto-calculated)
    ├─ Transport to Site: 1 hr × $450 = $450
    ├─ Setup: 0.5 hr × $450 = $225
    ├─ Production: Custom pricing (score-based)
    ├─ Cleanup: 0.5 hr × $450 = $225
    └─ Transport Back: 1 hr × $450 = $450
```

---

## Database Schema Changes

### File: `convex/schema.ts`

**Added fields to `jobs` table:**
```typescript
jobs: defineTable({
  // ... existing fields ...

  assignedCrewId: v.optional(v.id("crews")), // Legacy - employees only
  assignedLoadoutId: v.optional(v.id("loadouts")), // NEW: Full crew + equipment

  // ... rest of schema ...
})
  .index("by_loadout", ["assignedLoadoutId"]) // NEW index
```

**No changes needed to other tables** - `loadouts` table already has:
- `employeeIds: v.array(v.id("employees"))`
- `equipmentIds: v.array(v.id("equipment"))`
- `totalHourlyCost: v.number()` (calculated sum)

---

## Backend API (Convex Mutations & Queries)

### File: `convex/jobs.ts`

#### 1. Create Job with Loadout
```typescript
export const createJob = mutation({
  args: {
    customerId: v.id("customers"),
    startDate: v.optional(v.string()),
    status: v.optional(v.union(...)),
    notes: v.optional(v.string()),
    assignedCrewId: v.optional(v.id("crews")),
    assignedLoadoutId: v.optional(v.id("loadouts")), // NEW
  },
  handler: async (ctx, args) => {
    // ... job creation logic ...

    // Get loadout hourly cost if assigned
    let loadoutHourlyCost = 0;
    if (args.assignedLoadoutId) {
      const loadout = await ctx.db.get(args.assignedLoadoutId);
      if (loadout) {
        loadoutHourlyCost = loadout.totalHourlyCost;
      }
    }

    // Create support line items with loadout-based pricing
    await ctx.db.insert("jobLineItems", {
      jobId,
      serviceType: "transport_to_site",
      displayName: "Transport to Site",
      baseScore: 1,
      adjustedScore: 1,
      estimatedHours: 1,
      lineItemTotal: loadoutHourlyCost > 0
        ? loadoutHourlyCost * 1
        : 500, // Fallback if no loadout
      // ... rest of fields ...
    });

    // Repeat for setup (0.5hr), cleanup (0.5hr), transport back (1hr)
  }
});
```

**Calculation Logic:**
- **WITH loadout**: `lineItemTotal = loadout.totalHourlyCost × estimatedHours`
- **WITHOUT loadout**: `lineItemTotal = hardcoded default` (backward compatible)

---

#### 2. Assign Loadout to Existing Job
```typescript
export const assignLoadout = mutation({
  args: {
    jobId: v.id("jobs"),
    loadoutId: v.id("loadouts"),
    updateSupportTaskPricing: v.optional(v.boolean()), // default: false
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    const loadout = await ctx.db.get(args.loadoutId);

    // Update job
    await ctx.db.patch(args.jobId, {
      assignedLoadoutId: args.loadoutId,
      updatedAt: Date.now(),
    });

    // If updateSupportTaskPricing = true, recalculate support task prices
    if (args.updateSupportTaskPricing) {
      const supportTaskTypes = [
        "transport_to_site",
        "site_setup",
        "site_cleanup",
        "transport_from_site"
      ];

      const lineItems = await ctx.db
        .query("jobLineItems")
        .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
        .collect();

      for (const item of lineItems) {
        if (supportTaskTypes.includes(item.serviceType)) {
          const newTotal = loadout.totalHourlyCost * item.estimatedHours;
          await ctx.db.patch(item._id, {
            lineItemTotal: newTotal,
          });
        }
      }

      // Recalculate job total
      const updatedLineItems = await ctx.db
        .query("jobLineItems")
        .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
        .collect();

      const newTotalInvestment = updatedLineItems.reduce(
        (sum, item) => sum + item.lineItemTotal,
        0
      );

      await ctx.db.patch(args.jobId, {
        totalInvestment: newTotalInvestment,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  }
});
```

**Usage:**
```typescript
// Assign loadout without updating prices (for new jobs)
await assignLoadout({
  jobId,
  loadoutId
});

// Assign loadout and recalculate all support task prices
await assignLoadout({
  jobId,
  loadoutId,
  updateSupportTaskPricing: true
});
```

---

#### 3. Get Job with Loadout Details
```typescript
export const getJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    // ... existing logic for customer, lineItems, timeLogs, crew ...

    // Get loadout if assigned (includes employees + equipment)
    let loadout = null;
    if (job.assignedLoadoutId) {
      loadout = await ctx.db.get(job.assignedLoadoutId);
      if (loadout) {
        // Batch fetch employees and equipment
        const [employees, equipment] = await Promise.all([
          Promise.all(loadout.employeeIds.map(id => ctx.db.get(id))),
          Promise.all(loadout.equipmentIds.map(id => ctx.db.get(id))),
        ]);
        loadout = {
          ...loadout,
          employees: employees.filter(e => e !== null),
          equipment: equipment.filter(e => e !== null),
        };
      }
    }

    return {
      ...job,
      customer,
      lineItems,
      timeLogs: enrichedTimeLogs,
      crew,
      loadout, // NEW: Full loadout with employees + equipment
    };
  }
});
```

**Response Structure:**
```typescript
{
  _id: "job_123",
  jobNumber: "WO-0042",
  assignedLoadoutId: "loadout_456",
  loadout: {
    _id: "loadout_456",
    name: "Heavy Mulching Crew A",
    totalHourlyCost: 450,
    employees: [
      { _id: "emp_1", name: "John Doe", effectiveRate: 75 },
      { _id: "emp_2", name: "Jane Smith", effectiveRate: 65 }
    ],
    equipment: [
      { _id: "equip_1", name: "Forestry Mulcher #2", hourlyCost: 250 },
      { _id: "equip_2", name: "Skid Steer", hourlyCost: 60 }
    ]
  },
  lineItems: [
    {
      displayName: "Transport to Site",
      estimatedHours: 1,
      lineItemTotal: 450 // 1 hr × $450/hr
    },
    // ... more line items
  ]
}
```

---

### File: `convex/jobLineItems.ts`

#### Update Line Item Hours (with auto-recalculation for support tasks)
```typescript
export const updateLineItemHours = mutation({
  args: {
    lineItemId: v.id("jobLineItems"),
    estimatedHours: v.number(),
  },
  handler: async (ctx, args) => {
    const lineItem = await ctx.db.get(args.lineItemId);
    const job = await ctx.db.get(lineItem.jobId);

    // Check if this is a support task
    const supportTaskTypes = [
      "transport_to_site",
      "site_setup",
      "site_cleanup",
      "transport_from_site",
    ];
    const isSupportTask = supportTaskTypes.includes(lineItem.serviceType);

    let newLineItemTotal = lineItem.lineItemTotal;

    // If support task and job has loadout, recalculate
    if (isSupportTask && job.assignedLoadoutId) {
      const loadout = await ctx.db.get(job.assignedLoadoutId);
      if (loadout) {
        newLineItemTotal = loadout.totalHourlyCost * args.estimatedHours;
      }
    }

    // Calculate differences for job totals
    const hoursDiff = args.estimatedHours - lineItem.estimatedHours;
    const totalDiff = newLineItemTotal - lineItem.lineItemTotal;

    // Update line item
    await ctx.db.patch(args.lineItemId, {
      estimatedHours: args.estimatedHours,
      lineItemTotal: newLineItemTotal,
    });

    // Update job totals
    await ctx.db.patch(lineItem.jobId, {
      estimatedTotalHours: job.estimatedTotalHours + hoursDiff,
      totalInvestment: job.totalInvestment + totalDiff,
      updatedAt: Date.now(),
    });

    return { success: true };
  }
});
```

**Behavior:**
- **Production tasks**: Hours change, price stays same (manual pricing)
- **Support tasks with loadout**: Hours change, price recalculates automatically
- **Support tasks without loadout**: Hours change, price stays same (manual override)

---

## Calculation Examples

### Example 1: Create Job with Loadout

**Input:**
```typescript
const loadout = {
  _id: "loadout_1",
  name: "Mulching Crew A",
  totalHourlyCost: 420, // $75 + $65 + $250 + $30 (2 employees + 2 equipment)
};

await createJob({
  customerId: "customer_1",
  assignedLoadoutId: "loadout_1",
});
```

**Generated Line Items:**
```javascript
[
  {
    displayName: "Transport to Site",
    estimatedHours: 1,
    lineItemTotal: 420 // 1 hr × $420/hr
  },
  {
    displayName: "Site Setup & Preparation",
    estimatedHours: 0.5,
    lineItemTotal: 210 // 0.5 hr × $420/hr
  },
  // ... production tasks (custom pricing)
  {
    displayName: "Site Cleanup & Tear Down",
    estimatedHours: 0.5,
    lineItemTotal: 210 // 0.5 hr × $420/hr
  },
  {
    displayName: "Transport Back to Shop",
    estimatedHours: 1,
    lineItemTotal: 420 // 1 hr × $420/hr
  }
]

// Total support task cost: $1,260 (3 hours × $420/hr)
```

---

### Example 2: Assign Loadout to Existing Job

**Before:**
```javascript
Job: {
  _id: "job_123",
  assignedLoadoutId: null,
  lineItems: [
    { displayName: "Transport to Site", estimatedHours: 1, lineItemTotal: 500 },
    { displayName: "Setup", estimatedHours: 0.5, lineItemTotal: 250 }
  ],
  totalInvestment: 3500
}
```

**Action:**
```typescript
await assignLoadout({
  jobId: "job_123",
  loadoutId: "loadout_1", // $420/hr
  updateSupportTaskPricing: true
});
```

**After:**
```javascript
Job: {
  _id: "job_123",
  assignedLoadoutId: "loadout_1",
  lineItems: [
    { displayName: "Transport to Site", estimatedHours: 1, lineItemTotal: 420 }, // Updated
    { displayName: "Setup", estimatedHours: 0.5, lineItemTotal: 210 } // Updated
  ],
  totalInvestment: 3430 // Recalculated (-80 from support tasks)
}
```

---

### Example 3: Update Support Task Hours

**Before:**
```javascript
LineItem: {
  displayName: "Transport to Site",
  serviceType: "transport_to_site",
  estimatedHours: 1,
  lineItemTotal: 420
}

Job: {
  assignedLoadoutId: "loadout_1", // $420/hr
  totalInvestment: 5000
}
```

**Action:**
```typescript
await updateLineItemHours({
  lineItemId: "lineItem_1",
  estimatedHours: 1.5 // Changed from 1 to 1.5
});
```

**After:**
```javascript
LineItem: {
  displayName: "Transport to Site",
  estimatedHours: 1.5,
  lineItemTotal: 630 // 1.5 hr × $420/hr (auto-recalculated)
}

Job: {
  totalInvestment: 5210 // Increased by $210 (0.5hr × $420)
}
```

---

## Display in UI (Proposals/Work Orders)

### Work Order Detail View

**Section: Assigned Resources**
```
┌─────────────────────────────────────────────────┐
│ Assigned Loadout: Heavy Mulching Crew A        │
│ Hourly Cost: $450/hr                            │
├─────────────────────────────────────────────────┤
│ CREW (2 employees)                              │
│  • John Doe (Crew Leader) - $75/hr             │
│  • Jane Smith (Operator) - $65/hr              │
│                                                  │
│ EQUIPMENT (2 units)                             │
│  • Forestry Mulcher #2 - $250/hr               │
│  • Skid Steer - $60/hr                         │
└─────────────────────────────────────────────────┘
```

**Section: Line Items (with detail)**
```
┌─────────────────────────────────────────────────┐
│ LINE ITEMS                                      │
├─────────────────────────────────────────────────┤
│ Transport to Site                               │
│   1.0 hrs × $450/hr = $450                     │
│                                                  │
│ Site Setup & Preparation                        │
│   0.5 hrs × $450/hr = $225                     │
│                                                  │
│ Forestry Mulching - 3.5 acres                  │
│   Score: 175 pts | Rate: 22 pts/hr             │
│   8.0 hrs (estimated) = $2,800                 │
│                                                  │
│ Site Cleanup & Tear Down                        │
│   0.5 hrs × $450/hr = $225                     │
│                                                  │
│ Transport Back to Shop                          │
│   1.0 hrs × $450/hr = $450                     │
├─────────────────────────────────────────────────┤
│ TOTAL INVESTMENT: $4,150                        │
└─────────────────────────────────────────────────┘
```

---

## Testing Instructions

### Test 1: Create Job with Loadout
```typescript
// 1. Create a loadout
const loadoutId = await createLoadout({
  name: "Test Crew A",
  employeeIds: ["emp_1", "emp_2"], // $75 + $65 = $140
  equipmentIds: ["equip_1"], // $250
  // totalHourlyCost will be calculated: $390
});

// 2. Create job with loadout
const jobId = await createJob({
  customerId: "customer_1",
  assignedLoadoutId: loadoutId,
});

// 3. Verify line items
const job = await getJob({ jobId });
console.log(job.lineItems);
// Expected:
// - Transport to Site: 1hr × $390 = $390
// - Setup: 0.5hr × $390 = $195
// - Cleanup: 0.5hr × $390 = $195
// - Transport Back: 1hr × $390 = $390
```

---

### Test 2: Assign Loadout to Existing Job
```typescript
// 1. Create job without loadout
const jobId = await createJob({
  customerId: "customer_1",
  // No loadoutId - will use default pricing
});

// 2. Verify default pricing
const job1 = await getJob({ jobId });
console.log(job1.lineItems[0].lineItemTotal); // Should be $500 (default)

// 3. Assign loadout and update pricing
await assignLoadout({
  jobId,
  loadoutId: "loadout_1", // $390/hr
  updateSupportTaskPricing: true,
});

// 4. Verify updated pricing
const job2 = await getJob({ jobId });
console.log(job2.lineItems[0].lineItemTotal); // Should be $390 (updated)
console.log(job2.loadout); // Should include employees + equipment
```

---

### Test 3: Update Support Task Hours
```typescript
// 1. Create job with loadout
const jobId = await createJob({
  customerId: "customer_1",
  assignedLoadoutId: "loadout_1", // $390/hr
});

// 2. Get transport line item
const job = await getJob({ jobId });
const transportItem = job.lineItems.find(
  item => item.serviceType === "transport_to_site"
);
console.log(transportItem.lineItemTotal); // $390 (1hr × $390)

// 3. Update hours
await updateLineItemHours({
  lineItemId: transportItem._id,
  estimatedHours: 2, // Changed from 1 to 2
});

// 4. Verify auto-recalculation
const updatedJob = await getJob({ jobId });
const updatedTransport = updatedJob.lineItems.find(
  item => item.serviceType === "transport_to_site"
);
console.log(updatedTransport.lineItemTotal); // $780 (2hr × $390)
console.log(updatedJob.totalInvestment); // Increased by $390
```

---

### Test 4: Production Task (No Auto-Recalculation)
```typescript
// Production tasks should NOT auto-recalculate when hours change
const productionItem = job.lineItems.find(
  item => item.serviceType === "forestry_mulching"
);

await updateLineItemHours({
  lineItemId: productionItem._id,
  estimatedHours: 10, // Changed from 8
});

const updatedItem = await getLineItem({ lineItemId: productionItem._id });
console.log(updatedItem.lineItemTotal); // Should stay SAME (score-based pricing)
```

---

## Benefits of This Design

1. **Single Source of Truth**: Loadout assignment at job level eliminates redundancy
2. **Accurate Support Task Pricing**: Transport/setup/cleanup reflect true equipment costs
3. **Easy to Update**: Change loadout → all support tasks update automatically
4. **Backward Compatible**: Works with existing jobs (falls back to default pricing)
5. **Better Proposals**: Show customers exactly what crew + equipment they're getting
6. **Performance Tracking**: Link loadout production rates to job estimates

---

## Migration Strategy

### Existing Jobs (No Breaking Changes)
- Jobs without `assignedLoadoutId` continue to work
- Line items use existing pricing (manual or hardcoded)
- No data migration required

### New Jobs
- UI should prompt user to select loadout when creating job
- Default support task pricing uses loadout hourly cost
- Show loadout details in work order/proposal

### Gradual Adoption
1. **Phase 1**: Add loadout assignment to new jobs only
2. **Phase 2**: Add UI to assign loadout to existing jobs
3. **Phase 3**: Optionally recalculate support task pricing for old jobs

---

## API Summary

### Mutations
| Mutation | Purpose | When to Use |
|----------|---------|-------------|
| `createJob({ assignedLoadoutId })` | Create job with loadout | New work orders |
| `assignLoadout({ jobId, loadoutId, updateSupportTaskPricing })` | Assign/change loadout | Update existing jobs |
| `updateLineItemHours({ lineItemId, estimatedHours })` | Update hours | Edit line items (auto-recalc support tasks) |

### Queries
| Query | Returns | Purpose |
|-------|---------|---------|
| `getJob({ jobId })` | Job with `loadout` field | Display full job details |
| `listLoadouts()` | All loadouts | Loadout picker dropdown |

---

## Next Steps

1. **Frontend UI**: Add loadout selector to job creation form
2. **Work Order Display**: Show loadout employees + equipment in accordion
3. **Line Item Detail**: Display "1hr × $450/hr = $450" in proposals
4. **Loadout Editor**: Allow editing loadout (auto-updates all jobs using it)
5. **Production Rates**: Use loadout production rates for estimation

---

## File Locations

- **Schema**: `/Users/silvermbpro/web-treeshop-app/convex/schema.ts`
- **Job Mutations**: `/Users/silvermbpro/web-treeshop-app/convex/jobs.ts`
- **Line Item Mutations**: `/Users/silvermbpro/web-treeshop-app/convex/jobLineItems.ts`
- **Loadout Queries**: `/Users/silvermbpro/web-treeshop-app/convex/loadouts.ts`

---

## Questions & Answers

**Q: What happens if I change the loadout after job creation?**
A: Use `assignLoadout({ updateSupportTaskPricing: true })` to recalculate all support task prices.

**Q: What if I manually override a support task price?**
A: The system won't overwrite it unless you call `assignLoadout` with `updateSupportTaskPricing: true`.

**Q: Can I have a job with loadout but custom support task pricing?**
A: Yes! Assign loadout without `updateSupportTaskPricing`, then manually edit line item prices.

**Q: What if loadout employees/equipment change?**
A: The `totalHourlyCost` is recalculated on loadout update. Existing jobs keep their line item prices unless you reassign the loadout with `updateSupportTaskPricing: true`.

---

**Author**: Claude Code (Sonnet 4.5)
**Date**: 2025-11-23
**Status**: Implementation Complete - Ready for Testing
