# Employee Data Seeding Instructions

The employee form needs seed data for:
1. Career Tracks (Primary Skill dropdown)
2. Management Levels
3. Certifications

## Already Seeded

- **Career Tracks**: Already seeded via `npx convex run seedEmployeeCareers:seedEmployeeCareers` (34 tracks created)

## Still Need Seeding

### Management Levels

Run the following in the Convex dashboard or create them via the UI:

```typescript
// 5 management levels
await ctx.db.insert("managementLevels", {
  companyId: undefined, // or your org ID
  level: 1,
  title: "Crew Leader",
  code: "CREW_LEAD",
  hourlyPremium: 3.0,
  salaryRange: "$45,000 - $55,000",
  reportsToLevel: 2,
  isActive: true,
  createdAt: Date.now(),
});

await ctx.db.insert("managementLevels", {
  companyId: undefined,
  level: 2,
  title: "Crew Supervisor",
  code: "CREW_SUPER",
  hourlyPremium: 7.0,
  salaryRange: "$55,000 - $70,000",
  reportsToLevel: 3,
  isActive: true,
  createdAt: Date.now(),
});

await ctx.db.insert("managementLevels", {
  companyId: undefined,
  level: 3,
  title: "Operations Manager",
  code: "OPS_MGR",
  hourlyPremium: 15.0,
  salaryRange: "$70,000 - $90,000",
  reportsToLevel: 4,
  isActive: true,
  createdAt: Date.now(),
});

await ctx.db.insert("managementLevels", {
  companyId: undefined,
  level: 4,
  title: "Department Director",
  code: "DEPT_DIR",
  hourlyPremium: 25.0,
  salaryRange: "$90,000 - $120,000",
  reportsToLevel: 5,
  isActive: true,
  createdAt: Date.now(),
});

await ctx.db.insert("managementLevels", {
  companyId: undefined,
  level: 5,
  title: "VP Operations",
  code: "VP_OPS",
  hourlyPremium: 40.0,
  salaryRange: "$120,000 - $160,000",
  isActive: true,
  createdAt: Date.now(),
});
```

### Certifications

The most critical certifications to add:

```typescript
const certifications = [
  // Safety
  { name: "OSHA 10-Hour Safety", code: "OSHA_10", category: "safety", requiresRenewal: false, hourlyPremium: 1.0 },
  { name: "OSHA 30-Hour Safety", code: "OSHA_30", category: "safety", requiresRenewal: false, hourlyPremium: 2.0 },
  { name: "First Aid & CPR", code: "FIRST_AID_CPR", category: "safety", requiresRenewal: true, renewalPeriodMonths: 24, hourlyPremium: 0.5 },

  // Professional
  { name: "ISA Certified Arborist", code: "ISA_CERTIFIED_ARBORIST", category: "professional", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 4.0 },
  { name: "ISA Tree Worker", code: "ISA_TREE_WORKER", category: "professional", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 3.0 },

  // Equipment
  { name: "CDL Class A", code: "CDL_A", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 60, hourlyPremium: 3.0 },
  { name: "CDL Class B", code: "CDL_B", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 60, hourlyPremium: 2.5 },
  { name: "Crane Operator", code: "CRANE_OPERATOR", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 60, hourlyPremium: 4.0 },
];

for (const cert of certifications) {
  await ctx.db.insert("certifications", {
    companyId: undefined,
    ...cert,
    isActive: true,
    createdAt: Date.now(),
  });
}
```

## Seed Files Created

The following seed files have been created in `/convex/`:

1. **seedManagementLevels.ts** - Seeds 5 management levels
2. **seedCertifications.ts** - Seeds 16+ certifications
3. **seedEmployeeCareers.ts** - Seeds career tracks (already run)

## Using the Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select your project
3. Go to "Functions" tab
4. Find `managementLevels:seedDefaultLevels` and click "Run"
5. Find `certifications:seedDefaultCertifications` and click "Run"

OR

Use the console in the dashboard and run the insert statements above directly.

## Result

After seeding, the employee form should have:
- Management Level dropdown: 5 options (Crew Leader through VP Operations)
- Certifications: 16 options (OSHA, CDL, ISA, etc.)
- Career Track (Primary Skill): 34 options (already seeded)
