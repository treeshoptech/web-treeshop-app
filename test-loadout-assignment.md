# Local Testing Guide: Loadout Assignment

This guide walks through testing the loadout assignment system locally using the Convex dashboard.

---

## Prerequisites

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open Convex Dashboard:
   ```
   https://dashboard.convex.dev/
   ```

3. Navigate to your project and open the "Functions" tab

---

## Test 1: Create Job with Loadout

### Step 1: Find an existing loadout
```javascript
// In Convex Dashboard Functions tab, run:
api.loadouts.listLoadouts()

// Copy a loadout ID from the results, e.g.:
// "_id": "kg2h5j7k8l9m0n1p2q3r4s5t"
```

### Step 2: Find a customer
```javascript
// Run:
api.customers.listCustomers()

// Copy a customer ID, e.g.:
// "_id": "kh3i6k8m9n0o1p2q3r4s5t6u"
```

### Step 3: Create job with loadout
```javascript
// Run:
api.jobs.createJob({
  customerId: "kh3i6k8m9n0o1p2q3r4s5t6u", // Replace with your customer ID
  assignedLoadoutId: "kg2h5j7k8l9m0n1p2q3r4s5t", // Replace with your loadout ID
  status: "draft"
})

// Expected result: Returns a job ID like "kj4l7m9n0p1q2r3s4t5u6v7w"
```

### Step 4: Verify line item pricing
```javascript
// Get the job details
api.jobs.getJob({
  jobId: "kj4l7m9n0p1q2r3s4t5u6v7w" // Use the ID from Step 3
})

// Check the results:
// 1. job.assignedLoadoutId should match your loadout ID
// 2. job.loadout should include employees and equipment arrays
// 3. job.lineItems should show:
//    - "Transport to Site": 1 hr × loadout.totalHourlyCost
//    - "Site Setup": 0.5 hr × loadout.totalHourlyCost
//    - "Site Cleanup": 0.5 hr × loadout.totalHourlyCost
//    - "Transport Back": 1 hr × loadout.totalHourlyCost
```

### Expected Output Example:
```json
{
  "_id": "kj4l7m9n0p1q2r3s4t5u6v7w",
  "jobNumber": "WO-0042",
  "assignedLoadoutId": "kg2h5j7k8l9m0n1p2q3r4s5t",
  "totalInvestment": 1350,
  "loadout": {
    "_id": "kg2h5j7k8l9m0n1p2q3r4s5t",
    "name": "Mulching Crew A",
    "totalHourlyCost": 450,
    "employees": [
      { "name": "John Doe", "effectiveRate": 75 },
      { "name": "Jane Smith", "effectiveRate": 65 }
    ],
    "equipment": [
      { "name": "Forestry Mulcher #2", "hourlyCost": 250 },
      { "name": "Skid Steer", "hourlyCost": 60 }
    ]
  },
  "lineItems": [
    {
      "displayName": "Transport to Site",
      "estimatedHours": 1,
      "lineItemTotal": 450  // 1 × 450
    },
    {
      "displayName": "Site Setup & Preparation",
      "estimatedHours": 0.5,
      "lineItemTotal": 225  // 0.5 × 450
    },
    {
      "displayName": "Site Cleanup & Tear Down",
      "estimatedHours": 0.5,
      "lineItemTotal": 225  // 0.5 × 450
    },
    {
      "displayName": "Transport Back to Shop",
      "estimatedHours": 1,
      "lineItemTotal": 450  // 1 × 450
    }
  ]
}
```

---

## Test 2: Assign Loadout to Existing Job

### Step 1: Create a job WITHOUT loadout
```javascript
api.jobs.createJob({
  customerId: "kh3i6k8m9n0o1p2q3r4s5t6u",
  status: "draft"
  // No assignedLoadoutId
})

// Result: Job ID like "km5n8p0q1r2s3t4u5v6w7x8y"
```

### Step 2: Check default pricing
```javascript
api.jobs.getJob({
  jobId: "km5n8p0q1r2s3t4u5v6w7x8y"
})

// Check lineItems:
// - "Transport to Site": lineItemTotal should be 500 (default)
// - "Site Setup": lineItemTotal should be 250 (default)
```

### Step 3: Assign loadout and update pricing
```javascript
api.jobs.assignLoadout({
  jobId: "km5n8p0q1r2s3t4u5v6w7x8y",
  loadoutId: "kg2h5j7k8l9m0n1p2q3r4s5t",
  updateSupportTaskPricing: true
})

// Expected: { "success": true }
```

### Step 4: Verify updated pricing
```javascript
api.jobs.getJob({
  jobId: "km5n8p0q1r2s3t4u5v6w7x8y"
})

// Check:
// 1. job.assignedLoadoutId now set
// 2. job.loadout now populated
// 3. Support task prices updated:
//    - "Transport to Site": 450 (was 500)
//    - "Site Setup": 225 (was 250)
// 4. job.totalInvestment recalculated
```

---

## Test 3: Update Support Task Hours

### Step 1: Get a job with loadout
```javascript
// Use job from Test 1
api.jobs.getJob({
  jobId: "kj4l7m9n0p1q2r3s4t5u6v7w"
})

// Copy the ID of "Transport to Site" line item
// e.g., "kn6p9q1r2s3t4u5v6w7x8y9z"
```

### Step 2: Update hours
```javascript
api.jobLineItems.updateLineItemHours({
  lineItemId: "kn6p9q1r2s3t4u5v6w7x8y9z",
  estimatedHours: 1.5  // Changed from 1.0 to 1.5
})

// Expected: { "success": true }
```

### Step 3: Verify auto-recalculation
```javascript
api.jobs.getJob({
  jobId: "kj4l7m9n0p1q2r3s4t5u6v7w"
})

// Check:
// - "Transport to Site" estimatedHours: 1.5 (updated)
// - "Transport to Site" lineItemTotal: 675 (1.5 × 450, auto-recalculated)
// - job.totalInvestment increased by 225 (0.5hr × 450)
```

---

## Test 4: Production Task (No Auto-Recalculation)

### Step 1: Add a production line item
```javascript
api.jobLineItems.addLineItem({
  jobId: "kj4l7m9n0p1q2r3s4t5u6v7w",
  displayName: "Forestry Mulching - 3.5 acres",
  serviceType: "forestry_mulching",
  baseScore: 175,
  adjustedScore: 175,
  estimatedHours: 8,
  lineItemTotal: 2800
})

// Expected: Returns line item ID
```

### Step 2: Update production task hours
```javascript
api.jobLineItems.updateLineItemHours({
  lineItemId: "ko7q0r2s3t4u5v6w7x8y9z0a", // Use ID from Step 1
  estimatedHours: 10  // Changed from 8 to 10
})
```

### Step 3: Verify price did NOT change
```javascript
api.jobs.getJob({
  jobId: "kj4l7m9n0p1q2r3s4t5u6v7w"
})

// Check:
// - "Forestry Mulching" estimatedHours: 10 (updated)
// - "Forestry Mulching" lineItemTotal: 2800 (SAME - not auto-recalculated)
// - This is correct! Production tasks use score-based pricing
```

---

## Test 5: Create Job WITHOUT Loadout (Backward Compatibility)

### Step 1: Create old-style job
```javascript
api.jobs.createJob({
  customerId: "kh3i6k8m9n0o1p2q3r4s5t6u",
  status: "draft"
  // No assignedLoadoutId - like old jobs
})
```

### Step 2: Verify default pricing
```javascript
api.jobs.getJob({
  jobId: "kp8r1s3t4u5v6w7x8y9z0a1b" // Use ID from Step 1
})

// Check:
// 1. job.assignedLoadoutId is null
// 2. job.loadout is null
// 3. Line items use default hardcoded pricing:
//    - "Transport to Site": 500
//    - "Site Setup": 250
//    - "Site Cleanup": 250
//    - "Transport Back": 500
```

### Result: Backward compatibility confirmed!

---

## Verification Checklist

After running all tests, verify:

- [ ] **Test 1**: New jobs with loadout use loadout pricing
- [ ] **Test 2**: Can assign loadout to existing jobs and update prices
- [ ] **Test 3**: Support task hours update triggers auto-recalculation
- [ ] **Test 4**: Production task hours update does NOT auto-recalculate
- [ ] **Test 5**: Jobs without loadout still work (default pricing)

---

## Common Issues & Troubleshooting

### Issue 1: "Loadout not found"
**Cause**: Invalid loadout ID
**Solution**: Run `api.loadouts.listLoadouts()` to get valid IDs

### Issue 2: Line items show $0 pricing
**Cause**: Loadout `totalHourlyCost` is 0
**Solution**: Check that loadout has employees/equipment with costs

### Issue 3: Prices not updating after assignLoadout
**Cause**: `updateSupportTaskPricing` not set to `true`
**Solution**:
```javascript
api.jobs.assignLoadout({
  jobId: "...",
  loadoutId: "...",
  updateSupportTaskPricing: true  // Add this!
})
```

### Issue 4: Production tasks auto-recalculating (shouldn't)
**Cause**: Bug in `updateLineItemHours` logic
**Solution**: Check that `supportTaskTypes` array doesn't include production service types

---

## Next Steps After Testing

Once all tests pass:

1. **Frontend Integration**
   - Add loadout dropdown to job creation form
   - Display loadout details on work order page
   - Show "hours × rate = total" breakdown in line items

2. **UI Enhancements**
   - Show loadout name/cost in job list
   - Add "Change Loadout" button to existing jobs
   - Display loadout employees + equipment in expandable section

3. **Production**
   - Test with real data
   - Monitor for any edge cases
   - Collect user feedback

---

## Example: Complete Workflow

```javascript
// 1. Create loadout (one-time setup)
const loadoutId = await api.loadouts.createLoadout({
  name: "Heavy Clearing Team",
  employeeIds: ["emp_1", "emp_2", "emp_3"],
  equipmentIds: ["equip_1", "equip_2"],
  mulchingRate: 0.8  // Production rate: 0.8 acres/day
});

// 2. Create job with loadout
const jobId = await api.jobs.createJob({
  customerId: "customer_1",
  assignedLoadoutId: loadoutId,
  status: "draft"
});

// 3. Add production tasks
await api.jobLineItems.addLineItem({
  jobId,
  displayName: "Forestry Mulching - 5 acres",
  serviceType: "forestry_mulching",
  baseScore: 250,
  adjustedScore: 250,
  estimatedHours: 12,
  lineItemTotal: 4200
});

// 4. Adjust support task hours if needed
const job = await api.jobs.getJob({ jobId });
const transportItem = job.lineItems.find(
  item => item.serviceType === "transport_to_site"
);

await api.jobLineItems.updateLineItemHours({
  lineItemId: transportItem._id,
  estimatedHours: 1.5  // Longer drive
});
// Price automatically updates: 1.5hr × loadout cost

// 5. View final job details
const finalJob = await api.jobs.getJob({ jobId });
console.log(finalJob);
```

---

**Testing Status**: Ready for local testing
**Files Modified**:
- `/Users/silvermbpro/web-treeshop-app/convex/schema.ts`
- `/Users/silvermbpro/web-treeshop-app/convex/jobs.ts`
- `/Users/silvermbpro/web-treeshop-app/convex/jobLineItems.ts`

**Documentation**:
- `/Users/silvermbpro/web-treeshop-app/LOADOUT_ASSIGNMENT_DESIGN.md`
- `/Users/silvermbpro/web-treeshop-app/LOADOUT_ARCHITECTURE.md`
- `/Users/silvermbpro/web-treeshop-app/test-loadout-assignment.md`
