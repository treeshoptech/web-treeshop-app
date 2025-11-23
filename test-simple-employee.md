# Simple Employee System - Traditional Fully-Burdened Cost Model

## Summary

The employee system has been simplified to use a traditional fully-burdened cost model instead of the complex TreeShop qualification system.

## What Changed

### Schema (`/Users/silvermbpro/web-treeshop-app/convex/schema.ts`)

Added new simple fields to the employees table:

```typescript
// SIMPLE TRADITIONAL MODEL (Fully-Burdened Cost)
// Basic Info
positionTitle: v.optional(v.string()), // Simple text like "Crew Leader" or "Operator"
payType: v.optional(v.union(v.literal("hourly"), v.literal("salary"))), // hourly or salary

// Base Pay
baseHourlyRate: v.optional(v.number()), // For hourly employees
annualSalary: v.optional(v.number()), // For salaried employees

// Burden Rates & Benefits
workersCompRate: v.optional(v.number()), // Percentage (e.g., 8.5 for 8.5%)
payrollTaxRate: v.optional(v.number()), // Percentage (default 12%)
healthInsuranceMonthly: v.optional(v.number()), // $ per month
ptoHoursPerYear: v.optional(v.number()), // PTO hours
holidayHoursPerYear: v.optional(v.number()), // Holiday hours

// Allowances
phoneAllowance: v.optional(v.number()), // $ per month
vehicleAllowance: v.optional(v.number()), // $ per month
otherAllowances: v.optional(v.number()), // $ per month

// Work Schedule
overtimeEligible: v.optional(v.boolean()), // Can earn OT?
expectedAnnualBillableHours: v.optional(v.number()), // Expected billable hours per year

// Calculated Fully-Burdened Rate
fullyBurdenedHourlyRate: v.optional(v.number()), // Final calculated rate
```

**Legacy fields** (TreeShop qualification system) are now marked as DEPRECATED but still work for backward compatibility.

### New Mutation: `createSimpleEmployee`

Location: `/Users/silvermbpro/web-treeshop-app/convex/employees.ts`

This mutation provides a simple way to create employees using the traditional model:

```typescript
// Example: Create an hourly employee
await createSimpleEmployee({
  firstName: "John",
  lastName: "Doe",
  positionTitle: "Crew Leader",
  employmentType: "full_time",
  hireDate: "2024-01-15",

  // Pay
  payType: "hourly",
  baseHourlyRate: 25.00,

  // Burden & Benefits
  workersCompRate: 8.5,        // 8.5%
  payrollTaxRate: 12,           // 12% (default)
  healthInsuranceMonthly: 600,  // $600/month
  ptoHoursPerYear: 80,          // 2 weeks PTO
  holidayHoursPerYear: 56,      // 7 holidays

  // Allowances
  phoneAllowance: 50,           // $50/month
  vehicleAllowance: 400,        // $400/month

  // Schedule
  overtimeEligible: true,
  expectedAnnualBillableHours: 2080,

  // Emergency Contact
  emergencyContactName: "Jane Doe",
  emergencyContactPhone: "(555) 123-4567",
  emergencyContactRelationship: "Spouse"
});
```

### Calculation Logic

The fully-burdened hourly rate is calculated as:

```
1. Base Hourly Rate (or Annual Salary ÷ Annual Hours)
2. × (1 + Workers Comp %)
3. × (1 + Payroll Tax %)
4. + (Health Insurance × 12) ÷ Annual Hours
5. + (Allowances × 12) ÷ Annual Hours
= Fully-Burdened Hourly Rate
```

**Example:**
- Base Rate: $25/hr
- Workers Comp: 8.5% → multiply by 1.085
- Payroll Tax: 12% → multiply by 1.12
- Base with burden: $25 × 1.085 × 1.12 = $30.38/hr
- Health Insurance: ($600 × 12) / 2080 = $3.46/hr
- Allowances: (($50 + $400) × 12) / 2080 = $2.60/hr
- **Final Rate: $36.44/hr**

### Updated Mutations

Both `createEmployee` and `updateEmployee` mutations now support the simple model:

1. If `payType` is provided, the system calculates `fullyBurdenedHourlyRate`
2. The calculated rate is stored in both `fullyBurdenedHourlyRate` and `effectiveRate`
3. Legacy fields still work for backward compatibility

## Testing

You can test the new system using the Convex dashboard:

1. Go to https://dashboard.convex.dev
2. Navigate to your deployment
3. Open the `employees` Functions tab
4. Call `createSimpleEmployee` with the example data above

## Benefits

1. **Simple** - No complex qualification codes or tier systems
2. **Traditional** - Uses standard fully-burdened cost accounting
3. **Flexible** - Supports both hourly and salaried employees
4. **Accurate** - Calculates true cost including all burdens
5. **Backward Compatible** - Existing employees still work

## Migration Path

- Old employees with `effectiveRate` continue to work
- New employees can use the simple `createSimpleEmployee` mutation
- Both systems coexist - no breaking changes
- Frontend can be updated gradually to use the new simple fields

## Files Modified

1. `/Users/silvermbpro/web-treeshop-app/convex/schema.ts` - Added simple model fields
2. `/Users/silvermbpro/web-treeshop-app/convex/employees.ts` - Added calculation logic and new mutation
3. `/Users/silvermbpro/web-treeshop-app/convex/timeLogs.ts` - Fixed to handle optional effectiveRate

## Next Steps

To complete the simplification:

1. Update the frontend form (`/Users/silvermbpro/web-treeshop-app/components/EmployeeFormModal.tsx`) to use simple fields
2. Remove the 6 complex tabs and replace with 2-3 simple tabs
3. Test with real employee data
4. Gradually migrate existing employees to the new model (optional)
