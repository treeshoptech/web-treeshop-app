# Loadout Assignment Implementation Summary

## What Was Built

A complete system for assigning **loadouts** (crew + equipment bundles) at the **job/project level** instead of individual line items. This ensures support tasks (transport, setup, cleanup) are correctly priced based on the full crew and equipment hourly costs.

---

## Key Features

### 1. Project-Level Assignment
- Assign entire loadout (employees + equipment) to a job
- Loadout's `totalHourlyCost` flows to all support tasks automatically
- Single source of truth for resource allocation

### 2. Intelligent Pricing
- **Support Tasks** (transport, setup, cleanup): Auto-calculate based on `hours × loadout.totalHourlyCost`
- **Production Tasks** (mulching, tree removal): Manual/score-based pricing (not affected)
- **Backward Compatible**: Jobs without loadout use default hardcoded prices

### 3. Dynamic Recalculation
- Change support task hours → price updates automatically
- Assign different loadout → option to recalculate all support task prices
- Job total investment updates automatically

---

## Files Modified

### 1. Database Schema
**File**: `/Users/silvermbpro/web-treeshop-app/convex/schema.ts`

**Changes**:
```typescript
jobs: defineTable({
  // ... existing fields ...
  assignedCrewId: v.optional(v.id("crews")), // Legacy
  assignedLoadoutId: v.optional(v.id("loadouts")), // NEW
  // ... rest of fields ...
})
  .index("by_loadout", ["assignedLoadoutId"]) // NEW index
```

### 2. Job Mutations
**File**: `/Users/silvermbpro/web-treeshop-app/convex/jobs.ts`

**New/Updated Functions**:
1. `createJob()` - Now accepts `assignedLoadoutId`, calculates support task pricing
2. `assignLoadout()` - NEW mutation to assign/change loadout on existing jobs
3. `getJob()` - Now returns full `loadout` object with employees + equipment

### 3. Line Item Mutations
**File**: `/Users/silvermbpro/web-treeshop-app/convex/jobLineItems.ts`

**New Functions**:
1. `updateLineItemHours()` - NEW mutation with auto-recalculation for support tasks

---

## API Reference

### Mutations

#### 1. Create Job with Loadout
```typescript
api.jobs.createJob({
  customerId: Id<"customers">,
  assignedLoadoutId?: Id<"loadouts">,  // Optional
  status?: "draft" | "sent" | ...,
  notes?: string
})
```

**Returns**: Job ID

**Behavior**:
- If `assignedLoadoutId` provided: Support tasks use loadout pricing
- If NOT provided: Support tasks use default pricing ($500, $250, etc.)

---

#### 2. Assign/Update Loadout
```typescript
api.jobs.assignLoadout({
  jobId: Id<"jobs">,
  loadoutId: Id<"loadouts">,
  updateSupportTaskPricing?: boolean  // Default: false
})
```

**Returns**: `{ success: true }`

**Behavior**:
- Updates `job.assignedLoadoutId`
- If `updateSupportTaskPricing = true`:
  - Recalculates all support task prices based on new loadout
  - Updates `job.totalInvestment`

**Use Cases**:
- New job: Set `updateSupportTaskPricing: false` (prices already correct)
- Existing job: Set `updateSupportTaskPricing: true` (recalculate old prices)

---

#### 3. Update Line Item Hours
```typescript
api.jobLineItems.updateLineItemHours({
  lineItemId: Id<"jobLineItems">,
  estimatedHours: number
})
```

**Returns**: `{ success: true }`

**Behavior**:
- Updates line item `estimatedHours`
- **IF** support task + job has loadout:
  - Auto-recalculates `lineItemTotal = hours × loadout.totalHourlyCost`
- **ELSE**:
  - Keeps existing `lineItemTotal` (manual pricing)
- Updates `job.estimatedTotalHours` and `job.totalInvestment`

---

### Queries

#### Get Job (Enhanced)
```typescript
api.jobs.getJob({
  jobId: Id<"jobs">
})
```

**Returns**:
```typescript
{
  _id: Id<"jobs">,
  jobNumber: string,
  assignedLoadoutId?: Id<"loadouts">,
  loadout?: {  // NEW
    _id: Id<"loadouts">,
    name: string,
    totalHourlyCost: number,
    employees: Employee[],  // Full employee objects
    equipment: Equipment[]  // Full equipment objects
  },
  lineItems: LineItem[],
  customer: Customer,
  // ... rest of job fields
}
```

---

## Calculation Logic

### Support Task Pricing

**Decision Tree**:
```
Is this a support task?
├─ YES: Is job.assignedLoadoutId set?
│   ├─ YES: lineItemTotal = hours × loadout.totalHourlyCost
│   └─ NO:  lineItemTotal = default ($500 for transport, $250 for setup)
└─ NO: (Production task) lineItemTotal = custom/score-based
```

**Support Task Types**:
- `transport_to_site`
- `site_setup`
- `site_cleanup`
- `transport_from_site`

**Example**:
```
Loadout: $450/hr (2 employees + 2 equipment)

Transport to Site:   1.0 hr × $450 = $450
Setup:               0.5 hr × $450 = $225
Cleanup:             0.5 hr × $450 = $225
Transport Back:      1.0 hr × $450 = $450
─────────────────────────────────────────
Total Support Cost:  3.0 hr × $450 = $1,350
```

---

## Testing

### Quick Test (Convex Dashboard)

1. **Find a loadout**:
   ```javascript
   api.loadouts.listLoadouts()
   ```

2. **Create job with loadout**:
   ```javascript
   api.jobs.createJob({
     customerId: "customer_id_here",
     assignedLoadoutId: "loadout_id_here"
   })
   ```

3. **Verify pricing**:
   ```javascript
   api.jobs.getJob({ jobId: "job_id_from_step_2" })
   ```

4. **Expected**: Support tasks show `hours × loadout.totalHourlyCost`

**Full Testing Guide**: See `/Users/silvermbpro/web-treeshop-app/test-loadout-assignment.md`

---

## Example Workflows

### Workflow 1: New Job from Scratch

```typescript
// 1. Create loadout (one-time)
const loadoutId = await api.loadouts.createLoadout({
  name: "Mulching Crew A",
  employeeIds: ["emp_1", "emp_2"],
  equipmentIds: ["equip_1", "equip_2"],
  // totalHourlyCost calculated automatically
});

// 2. Create job with loadout
const jobId = await api.jobs.createJob({
  customerId: "customer_1",
  assignedLoadoutId: loadoutId,
});

// 3. Support tasks automatically priced correctly!
const job = await api.jobs.getJob({ jobId });
console.log(job.lineItems[0]); // Transport: 1hr × $450 = $450
```

---

### Workflow 2: Update Existing Job

```typescript
// 1. Old job (no loadout)
const job = await api.jobs.getJob({ jobId: "old_job_id" });
console.log(job.lineItems[0].lineItemTotal); // $500 (hardcoded)

// 2. Assign loadout and recalculate
await api.jobs.assignLoadout({
  jobId: "old_job_id",
  loadoutId: "loadout_1",
  updateSupportTaskPricing: true,
});

// 3. Prices updated!
const updatedJob = await api.jobs.getJob({ jobId: "old_job_id" });
console.log(updatedJob.lineItems[0].lineItemTotal); // $450 (loadout-based)
```

---

### Workflow 3: Adjust Hours

```typescript
// 1. Get job with loadout
const job = await api.jobs.getJob({ jobId });
const transport = job.lineItems.find(i => i.serviceType === "transport_to_site");

// 2. Update hours
await api.jobLineItems.updateLineItemHours({
  lineItemId: transport._id,
  estimatedHours: 1.5, // Changed from 1.0
});

// 3. Price auto-updated!
const updated = await api.jobs.getJob({ jobId });
const newTransport = updated.lineItems.find(i => i.serviceType === "transport_to_site");
console.log(newTransport.lineItemTotal); // $675 (1.5hr × $450)
```

---

## Benefits

### Business Benefits
- **Accurate Pricing**: Support tasks reflect true equipment costs
- **Consistency**: Same loadout always uses same hourly rate
- **Transparency**: Customers see exactly what crew + equipment they're getting
- **Efficiency**: No manual calculations for transport/setup/cleanup

### Technical Benefits
- **Single Source of Truth**: Loadout at job level (not scattered across line items)
- **Automatic Updates**: Change loadout → prices update automatically
- **Backward Compatible**: Old jobs continue working
- **Performance**: Batch queries for employees/equipment (O(1) lookups)

---

## UI Integration (Next Steps)

### 1. Job Creation Form
```
┌─────────────────────────────────┐
│ Create New Work Order           │
├─────────────────────────────────┤
│ Customer: [Dropdown]            │
│ Start Date: [Date Picker]       │
│ Assigned Loadout: [Dropdown]    │  ← NEW
│   ├─ Mulching Crew A ($450/hr)  │
│   ├─ Light Clearing ($280/hr)   │
│   └─ Heavy Equipment ($620/hr)  │
└─────────────────────────────────┘
```

### 2. Work Order Detail View
```
┌─────────────────────────────────────────┐
│ ASSIGNED RESOURCES                      │
├─────────────────────────────────────────┤
│ Loadout: Mulching Crew A                │
│ Hourly Cost: $450/hr                    │
│                                          │
│ Crew (2):                                │
│  • John Doe (Leader) - $75/hr           │
│  • Jane Smith (Operator) - $65/hr       │
│                                          │
│ Equipment (2):                           │
│  • Forestry Mulcher #2 - $250/hr        │
│  • Skid Steer - $60/hr                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ LINE ITEMS                              │
├─────────────────────────────────────────┤
│ Transport to Site                       │
│   1.0 hrs × $450/hr = $450             │  ← Show breakdown
│                                          │
│ Forestry Mulching - 3.5 acres           │
│   Score: 175 pts | 8 hrs = $2,800      │
└─────────────────────────────────────────┘
```

### 3. Loadout Selector Component
```typescript
// Example React component
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function LoadoutSelector({ value, onChange }) {
  const loadouts = useQuery(api.loadouts.listLoadouts);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">No loadout (use default pricing)</option>
      {loadouts?.map(loadout => (
        <option key={loadout._id} value={loadout._id}>
          {loadout.name} (${loadout.totalHourlyCost}/hr)
        </option>
      ))}
    </select>
  );
}
```

---

## Performance Considerations

### Query Optimization
- **Batch Fetching**: All employees/equipment fetched in parallel (not N+1 queries)
- **Indexing**: New `by_loadout` index for fast job lookups by loadout
- **Caching**: Loadout details cached in query result

### Calculation Performance
- **O(1) Pricing**: Support task pricing is simple multiplication (hours × rate)
- **Minimal Database Writes**: Only updates affected line items, not entire job
- **Transaction Safety**: Uses Convex's built-in ACID guarantees

---

## Migration Path

### Phase 1: Soft Launch (Current)
- New jobs can use loadout assignment (optional)
- Old jobs continue working with default pricing
- No data migration required

### Phase 2: Backfill (Optional)
```typescript
// Script to assign loadouts to existing jobs
const jobs = await api.jobs.listJobs();

for (const job of jobs) {
  if (!job.assignedLoadoutId && job.assignedCrewId) {
    // Find matching loadout for this crew
    const matchingLoadout = await findLoadoutForCrew(job.assignedCrewId);

    if (matchingLoadout) {
      await api.jobs.assignLoadout({
        jobId: job._id,
        loadoutId: matchingLoadout._id,
        updateSupportTaskPricing: true, // Recalculate old prices
      });
    }
  }
}
```

### Phase 3: Full Adoption
- Make `assignedLoadoutId` required for new jobs
- Add UI warnings for jobs without loadout
- Deprecate `assignedCrewId` (keep for historical data)

---

## Troubleshooting

### Issue: Line items show $0
**Cause**: Loadout `totalHourlyCost` is 0
**Solution**: Ensure loadout has employees/equipment with valid rates

### Issue: Prices not updating after assignLoadout
**Cause**: `updateSupportTaskPricing` not set
**Solution**: Add `updateSupportTaskPricing: true`

### Issue: Production tasks auto-recalculating
**Cause**: Task type incorrectly classified as support
**Solution**: Check `serviceType` field matches expected values

---

## Documentation Files

1. **LOADOUT_ASSIGNMENT_DESIGN.md** (18KB)
   - Complete technical design
   - API signatures
   - Calculation examples
   - Q&A section

2. **LOADOUT_ARCHITECTURE.md** (12KB)
   - Visual diagrams (ASCII art)
   - Data model relationships
   - Flow diagrams
   - Future enhancements

3. **test-loadout-assignment.md** (8KB)
   - Step-by-step testing guide
   - Convex Dashboard examples
   - Verification checklist
   - Troubleshooting

4. **LOADOUT_IMPLEMENTATION_SUMMARY.md** (This file)
   - Quick reference
   - API summary
   - Integration guide

---

## Status

- **Schema Changes**: Complete
- **Backend Mutations**: Complete
- **Backend Queries**: Complete
- **Testing**: Ready for local testing
- **Frontend UI**: Not started (next step)
- **Documentation**: Complete

---

## Next Actions

1. **Test Locally**:
   - Follow guide in `test-loadout-assignment.md`
   - Verify all 5 test scenarios pass
   - Test with real company data

2. **Frontend Integration**:
   - Add loadout selector to job creation form
   - Update work order detail page to show loadout
   - Add "Change Loadout" functionality

3. **User Feedback**:
   - Deploy to staging
   - Get user feedback on pricing accuracy
   - Iterate on UI/UX

4. **Production Deploy**:
   - Monitor for edge cases
   - Track pricing accuracy improvements
   - Document lessons learned

---

**Implementation Date**: 2025-11-23
**Author**: Claude Code (Sonnet 4.5)
**Status**: Ready for Testing
