# Loadout Assignment - Quick Reference Card

## One-Minute Overview

**What**: Assign crew + equipment bundles (loadouts) to entire jobs
**Why**: Support tasks (transport, setup, cleanup) need accurate equipment costs
**How**: Use loadout's `totalHourlyCost` to auto-calculate support task pricing

---

## Core Concept

```
OLD WAY:
Job → assignedCrewId (employees only)
└─ Line Items → hardcoded prices ($500, $250)

NEW WAY:
Job → assignedLoadoutId (employees + equipment)
└─ Line Items → hours × loadout.totalHourlyCost
```

---

## Quick API Reference

### Create Job with Loadout
```typescript
const jobId = await api.jobs.createJob({
  customerId: "customer_id",
  assignedLoadoutId: "loadout_id",  // ← NEW
});
```

### Assign Loadout to Existing Job
```typescript
await api.jobs.assignLoadout({
  jobId: "job_id",
  loadoutId: "loadout_id",
  updateSupportTaskPricing: true,  // Recalculate prices
});
```

### Update Support Task Hours
```typescript
await api.jobLineItems.updateLineItemHours({
  lineItemId: "lineitem_id",
  estimatedHours: 1.5,  // Triggers auto-recalculation
});
```

---

## Pricing Rules

| Task Type | Has Loadout? | Pricing Logic |
|-----------|--------------|---------------|
| Support   | Yes          | `hours × loadout.totalHourlyCost` |
| Support   | No           | Hardcoded default ($500, $250) |
| Production| Either       | Manual/score-based (never auto) |

**Support Tasks**: transport, setup, cleanup
**Production Tasks**: mulching, tree removal, etc.

---

## Example Calculation

```
Loadout "Mulching Crew A"
├─ Employee 1: $75/hr
├─ Employee 2: $65/hr
├─ Equipment 1: $250/hr
└─ Equipment 2: $60/hr
    ─────────────────
    Total: $450/hr

Support Tasks:
├─ Transport to Site:  1.0 hr × $450 = $450
├─ Setup:              0.5 hr × $450 = $225
├─ Cleanup:            0.5 hr × $450 = $225
└─ Transport Back:     1.0 hr × $450 = $450
    ─────────────────────────────────────
    Total Support:     3.0 hr × $450 = $1,350
```

---

## Testing Checklist

```bash
# 1. Get a loadout
api.loadouts.listLoadouts()

# 2. Create job
api.jobs.createJob({
  customerId: "...",
  assignedLoadoutId: "..."
})

# 3. Verify pricing
api.jobs.getJob({ jobId: "..." })
# Check: Support tasks show hours × loadout cost
```

---

## Common Patterns

### Pattern 1: Standard Workflow
```typescript
// Create loadout → Create job → Done!
const loadoutId = await createLoadout({ ... });
const jobId = await createJob({ assignedLoadoutId: loadoutId });
```

### Pattern 2: Change Loadout
```typescript
// Change loadout → Recalculate prices
await assignLoadout({
  jobId,
  loadoutId: differentLoadoutId,
  updateSupportTaskPricing: true
});
```

### Pattern 3: Adjust Hours
```typescript
// Change hours → Auto-recalculate (support tasks only)
await updateLineItemHours({
  lineItemId: transportLineItemId,
  estimatedHours: 2  // Was 1, now 2 → price doubles
});
```

---

## What Auto-Updates?

| Action | Support Tasks | Production Tasks | Job Total |
|--------|---------------|------------------|-----------|
| Assign loadout (update=true) | ✓ | ✗ | ✓ |
| Update support task hours | ✓ | - | ✓ |
| Update production task hours | - | ✗ | ✓ |

✓ = Updates automatically
✗ = Never updates (manual pricing)
- = Not applicable

---

## Files Changed

- **Schema**: `convex/schema.ts` (+2 lines)
- **Jobs**: `convex/jobs.ts` (+100 lines)
- **Line Items**: `convex/jobLineItems.ts` (+50 lines)

---

## Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Loadout not found" | Invalid ID | Check `listLoadouts()` |
| "Job not found" | Invalid ID | Check job exists |
| Support tasks show $0 | Loadout cost = 0 | Add employees/equipment |

---

## When to Use

### Use Loadout When:
- You have standard crew + equipment combinations
- You need accurate transport/setup/cleanup costs
- You want pricing consistency across jobs

### Don't Use Loadout When:
- Job uses non-standard equipment (use manual pricing)
- You're creating a quick quote (default pricing is fine)
- Historical data (keep existing pricing)

---

## Data Structure

```typescript
{
  _id: "job_123",
  assignedLoadoutId: "loadout_456",
  loadout: {  // ← Populated by getJob()
    _id: "loadout_456",
    name: "Mulching Crew A",
    totalHourlyCost: 450,
    employees: [
      { name: "John", effectiveRate: 75 },
      { name: "Jane", effectiveRate: 65 }
    ],
    equipment: [
      { name: "Mulcher", hourlyCost: 250 },
      { name: "Skid Steer", hourlyCost: 60 }
    ]
  },
  lineItems: [
    {
      displayName: "Transport to Site",
      serviceType: "transport_to_site",
      estimatedHours: 1,
      lineItemTotal: 450  // Auto-calculated
    }
  ]
}
```

---

## Performance

- **Query Time**: O(1) - indexed lookup
- **Calculation**: O(1) - simple multiplication
- **Batch Fetching**: Employees/equipment loaded in parallel
- **No N+1 Queries**: Single query for all related data

---

## Backward Compatibility

✓ Old jobs without loadout still work
✓ Default pricing used as fallback
✓ No data migration required
✓ Can add loadout to old jobs anytime

---

## Documentation

1. **LOADOUT_ASSIGNMENT_DESIGN.md** - Full technical design
2. **LOADOUT_ARCHITECTURE.md** - Visual diagrams
3. **test-loadout-assignment.md** - Testing guide
4. **LOADOUT_IMPLEMENTATION_SUMMARY.md** - Detailed reference
5. **LOADOUT_QUICK_REFERENCE.md** - This file

---

## Support

**Questions?** Check the Q&A in LOADOUT_ASSIGNMENT_DESIGN.md
**Issues?** See Troubleshooting in test-loadout-assignment.md
**Examples?** See Example Workflows in LOADOUT_IMPLEMENTATION_SUMMARY.md

---

**Last Updated**: 2025-11-23
**Status**: Ready for Testing ✓
**Schema Version**: Deployed ✓
