# Project Creation System Update Plan

## Executive Summary

This plan addresses critical pricing bugs and adds new capabilities to the job/project creation system:

1. **Fix margin vs markup calculation** (CRITICAL - losing money)
2. **Add billing type options** (Fixed Price, Time & Materials, Flat Rate Add-ons)
3. **Add address autocomplete and transport time calculation** (Regrid + OpenRouteService)
4. **Apply profit margin to support tasks** (currently at cost only)
5. **Clean up inconsistent field naming**

---

## Phase 1: Fix Pricing Calculations (CRITICAL)

### 1.1 Fix Margin vs Markup Formula

**Current Bug Location:** `components/AddLineItemModal.tsx` (lines 127-130)

**Current (WRONG):**
```typescript
const billingRate = totalCostPerHour * (1 + margin / 100);
// $200 cost × 1.30 = $260 (23.08% actual margin, NOT 30%)
```

**Correct (TRUE MARGIN):**
```typescript
const billingRate = totalCostPerHour / (1 - margin / 100);
// $200 cost / 0.70 = $285.71 (30% actual margin)
```

**Files to Update:**
- [ ] `components/AddLineItemModal.tsx` - Line item pricing
- [ ] `convex/jobs.ts` - Support task pricing (lines 276, 289, 306, 319)
- [ ] `convex/jobLineItems.ts` - Support task hour updates (line 151)

### 1.2 Apply Margin to Support Tasks

**Current Bug:** Support tasks (transport, setup, cleanup) are priced at COST ONLY.

**Fix:** Apply configurable support task margin (suggest 15-20% default, or same as production margin).

**Location:** `convex/jobs.ts` createJob mutation

**Current:**
```typescript
lineItemTotal: loadoutHourlyCost * 1  // Transport: 1 hour at COST
```

**Fixed:**
```typescript
const supportTaskMargin = company?.supportTaskMargin || 0.15;
lineItemTotal: (loadoutHourlyCost / (1 - supportTaskMargin)) * 1
```

---

## Phase 2: Add Billing Type Options

### 2.1 Schema Changes

**Add to `convex/schema.ts` - jobs table:**

```typescript
// Billing model
billingType: v.optional(v.union(
  v.literal("fixed_price"),       // Current default - lump sum
  v.literal("time_and_materials"), // Bill by actual hours
  v.literal("cost_plus")          // Cost + percentage
)),

// For T&M billing
customerLaborRate: v.optional(v.number()),     // What customer pays per labor hour
customerEquipmentRate: v.optional(v.number()), // What customer pays per equipment hour

// For flat rate items
flatRateItems: v.optional(v.array(v.object({
  name: v.string(),         // "Stump Grinding"
  description: v.optional(v.string()),
  unitPrice: v.number(),    // $75
  unit: v.string(),         // "per stump", "per tree", "each"
  quantity: v.number(),     // 5
  total: v.number(),        // $375
}))),
```

**Add to `convex/schema.ts` - jobLineItems table:**

```typescript
// Pricing type for this line item
pricingType: v.optional(v.union(
  v.literal("calculated"),    // Score-based (current)
  v.literal("flat_rate"),     // Fixed price per unit
  v.literal("hourly"),        // Billed by actual hours
  v.literal("support")        // Support task (transport, setup, etc.)
)),

// For flat rate items
unitPrice: v.optional(v.number()),
unitQuantity: v.optional(v.number()),
unit: v.optional(v.string()),
```

### 2.2 UI Changes

**CreateWorkOrderModal.tsx:**
- Add billing type selector (Fixed Price / Time & Materials / Cost Plus)
- Show customer rates fields for T&M
- Add flat rate items section

**AddLineItemModal.tsx:**
- Add "Flat Rate Item" option
- For flat rate: show unit, quantity, unit price fields
- Calculate total as `quantity × unitPrice`

### 2.3 Quote Generation

**CustomerQuotePDF.tsx:**
- Fixed Price: Current behavior (show line items with totals)
- T&M: "Labor: Estimated X hours @ $Y/hr" with disclaimer
- Flat Rate Items: Show as "5 stumps @ $75 each = $375"

---

## Phase 3: Address & Transport Time

### 3.1 Address Autocomplete (Regrid Typeahead API)

**Create new component:** `components/AddressAutocomplete.tsx`

```typescript
interface AddressAutocompleteProps {
  value: string;
  onChange: (address: AddressResult) => void;
  placeholder?: string;
}

// Uses Regrid Typeahead API
// Returns: address, city, state, zip, lat, lng, parcel_id
```

**Integration points:**
- Customer creation/edit (customer address)
- Job creation (job site address)
- Company settings (shop/yard address)

### 3.2 Transport Time Calculation (OpenRouteService)

**Why OpenRouteService over OSRM:**
- Free tier sufficient for our needs
- Hosted API (no self-hosting required)
- Better documentation

**Create utility:** `lib/routing.ts`

```typescript
export async function calculateDriveTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{
  durationMinutes: number;
  distanceMiles: number;
}> {
  // Call OpenRouteService Directions API
  // Return one-way drive time and distance
}

export function calculateTransportHours(
  driveTimeMinutes: number,
  options?: {
    includeReturn?: boolean;  // Default true (round trip)
    loadingTimeMinutes?: number;  // Default 15
    unloadingTimeMinutes?: number;  // Default 15
  }
): number {
  // (driveTime × 2) + loading + unloading
  // Convert to hours
}
```

### 3.3 Schema Changes for Addresses

**Add to jobs table:**

```typescript
// Job site address
siteAddress: v.optional(v.object({
  street: v.string(),
  city: v.string(),
  state: v.string(),
  zip: v.string(),
  lat: v.number(),
  lng: v.number(),
  parcelId: v.optional(v.string()),  // From Regrid
})),

// Calculated transport info
transportInfo: v.optional(v.object({
  distanceMiles: v.number(),
  driveTimeMinutes: v.number(),
  calculatedTransportHours: v.number(),  // Round trip + load/unload
})),
```

**Add to companies table:**

```typescript
// Shop/yard location (origin for transport calculations)
shopAddress: v.optional(v.object({
  street: v.string(),
  city: v.string(),
  state: v.string(),
  zip: v.string(),
  lat: v.number(),
  lng: v.number(),
})),
```

### 3.4 Auto-Update Transport Line Items

When job site address is set/changed:
1. Calculate drive time from shop address
2. Auto-update "Transport to Site" line item hours
3. Auto-update "Transport from Site" line item hours
4. Recalculate job totals

---

## Phase 4: Data Model Cleanup

### 4.1 Fix Production Rate Field Naming

**Current:** `actualRatePerDay` (but stores points per HOUR)
**Fix:** Add migration to rename OR add new field with correct name

```typescript
// In loadoutProductionRates
pointsPerHour: v.number(),  // New field, correct name
actualRatePerDay: v.optional(v.number()),  // Deprecated, keep for migration
```

### 4.2 Standardize Employee Rate Fields

**Current mess:**
- `effectiveRate`
- `fullyBurdenedHourlyRate`
- `qualificationRate`

**Solution:** Use `fullyBurdenedHourlyRate` as source of truth, deprecate others.

```typescript
// In employee queries, always use:
const hourlyRate = employee.fullyBurdenedHourlyRate || 40;
```

### 4.3 Add Support Task Margin to Company Settings

**Add to companies table:**

```typescript
supportTaskMargin: v.optional(v.number()),  // Default 0.15 (15%)
```

**Add to Settings page:**
- "Support Task Margin (%)" input
- Help text: "Profit margin applied to transport, setup, and cleanup tasks"

---

## Phase 5: UI/UX Updates

### 5.1 CreateWorkOrderModal Enhancements

**New workflow:**
1. Select/create customer
2. Enter job site address (with autocomplete)
3. Auto-calculate transport time from shop
4. Select billing type
5. Assign loadout
6. Create job with pre-calculated transport hours

### 5.2 AddLineItemModal Enhancements

**Add tabs or sections:**
1. **Production Task** (current - score-based)
2. **Flat Rate Item** (new - quantity × unit price)
3. **Custom Item** (new - manual price entry)

### 5.3 Work Order Detail Page

**Show:**
- Transport distance/time info
- Billing type badge
- For T&M: running actual hours total
- For flat rate items: quantity tracking

---

## Implementation Order

### Week 1: Critical Fixes (No Breaking Changes)
1. [ ] Fix margin vs markup formula in AddLineItemModal
2. [ ] Fix margin vs markup in support task creation
3. [ ] Add support task margin to company settings
4. [ ] Apply support task margin in job creation

### Week 2: Address System
1. [ ] Set up Regrid API integration
2. [ ] Create AddressAutocomplete component
3. [ ] Set up OpenRouteService integration
4. [ ] Create routing utilities
5. [ ] Add shop address to company settings
6. [ ] Add site address to job creation

### Week 3: Transport Auto-Calculation
1. [ ] Add transport calculation on job creation
2. [ ] Auto-update transport line items
3. [ ] Add transport info display to work order page

### Week 4: Billing Types
1. [ ] Add billingType to schema
2. [ ] Update CreateWorkOrderModal with billing type selection
3. [ ] Add flat rate items support
4. [ ] Update quote generation for different billing types

### Week 5: Cleanup & Polish
1. [ ] Fix production rate field naming
2. [ ] Standardize employee rate fields
3. [ ] Add validation and error handling
4. [ ] Update all affected tests

---

## API Keys Required

1. **Regrid API Key** - For address autocomplete and parcel data
   - Sign up at: https://regrid.com
   - Add to `.env.local`: `REGRID_API_KEY=xxx`

2. **OpenRouteService API Key** - For routing/drive time
   - Sign up at: https://openrouteservice.org
   - Free tier: 2,000 requests/day
   - Add to `.env.local`: `OPENROUTE_API_KEY=xxx`

---

## Risk Mitigation

1. **Backward Compatibility:**
   - All new fields are optional
   - Existing jobs continue to work
   - Default billingType to "fixed_price"

2. **Data Migration:**
   - No destructive changes
   - New fields added alongside old ones
   - Gradual deprecation of old fields

3. **Testing:**
   - Test margin calculations thoroughly
   - Test with existing jobs
   - Test new job creation
   - Test quote generation for all billing types

---

## Success Metrics

1. **Pricing accuracy:** New jobs priced with TRUE margin (not markup)
2. **Transport accuracy:** Transport hours match real drive times
3. **User adoption:** Users successfully create T&M and flat rate jobs
4. **No regressions:** All existing jobs continue to function

---

## Files to Modify

### Convex (Backend)
- `convex/schema.ts` - Add new fields
- `convex/jobs.ts` - Fix pricing, add transport calc
- `convex/jobLineItems.ts` - Fix support task pricing
- `convex/companies.ts` - Add shop address, support margin

### Components (Frontend)
- `components/AddLineItemModal.tsx` - Fix margin formula, add flat rate
- `components/CreateWorkOrderModal.tsx` - Add address, billing type
- `components/AddressAutocomplete.tsx` - NEW
- `components/CustomerQuotePDF.tsx` - Support billing types

### Utilities (New)
- `lib/routing.ts` - OpenRouteService integration
- `lib/regrid.ts` - Regrid API integration
- `lib/pricing.ts` - Centralized pricing formulas

### Pages
- `app/shopos/settings/page.tsx` - Add shop address, support margin
- `app/shopos/work-orders/[id]/page.tsx` - Show transport info, billing type
