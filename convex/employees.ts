import { getOrganizationId, requireOrganizationId } from "./auth";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// List all employees
export const listEmployees = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    // Get employees - filter by orgId if available
    const employees = orgId
      ? await ctx.db
          .query("employees")
          .filter((q) => q.eq(q.field("companyId"), orgId))
          .filter((q) => q.eq(q.field("isActive"), true))
          .order("desc")
          .collect()
      : await ctx.db
          .query("employees")
          .filter((q) => q.eq(q.field("isActive"), true))
          .order("desc")
          .collect();

    return employees;
  },
});

// Get single employee
export const getEmployee = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) throw new Error("Employee not found");

    // Verify ownership - throws error if employee doesn't belong to user's org
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    return employee;
  },
});

// Create new employee
export const createEmployee = mutation({
  args: {
    name: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    employmentType: v.optional(v.union(
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("seasonal"),
      v.literal("contractor")
    )),
    hireDate: v.optional(v.string()),
    // ICE
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyContactRelationship: v.optional(v.string()),

    // SIMPLE TRADITIONAL MODEL
    positionTitle: v.optional(v.string()),
    payType: v.optional(v.union(v.literal("hourly"), v.literal("salary"))),
    baseHourlyRate: v.optional(v.number()),
    annualSalary: v.optional(v.number()),
    workersCompRate: v.optional(v.number()),
    payrollTaxRate: v.optional(v.number()),
    healthInsuranceMonthly: v.optional(v.number()),
    ptoHoursPerYear: v.optional(v.number()),
    holidayHoursPerYear: v.optional(v.number()),
    phoneAllowance: v.optional(v.number()),
    vehicleAllowance: v.optional(v.number()),
    otherAllowances: v.optional(v.number()),
    overtimeEligible: v.optional(v.boolean()),
    expectedAnnualBillableHours: v.optional(v.number()),
    fullyBurdenedHourlyRate: v.optional(v.number()),

    // LEGACY: Multi-track fields
    managementLevelId: v.optional(v.id("managementLevels")),
    reportsToEmployeeId: v.optional(v.id("employees")),
    totalQualificationPremium: v.optional(v.number()),
    // LEGACY: TreeShop Qualification Code System
    positionCode: v.optional(v.string()),
    tierLevel: v.optional(v.number()),
    hasLeadership: v.optional(v.boolean()),
    hasSupervisor: v.optional(v.boolean()),
    equipmentLevel: v.optional(v.number()),
    hasCDL: v.optional(v.boolean()),
    hasCrane: v.optional(v.boolean()),
    hasOSHA: v.optional(v.boolean()),
    qualificationRate: v.optional(v.number()),
    qualificationCode: v.optional(v.string()),
    burdenMultiplier: v.optional(v.number()),
    effectiveRate: v.optional(v.number()),
    // LEGACY: Old fields
    position: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    annualBenefits: v.optional(v.number()),
    annualPayrollTaxes: v.optional(v.number()),
    annualInsurance: v.optional(v.number()),
    totalAnnualCost: v.optional(v.number()),
    annualWorkingHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    // Calculate fully-burdened rate if simple model is used
    let calculatedFullyBurdenedRate = args.fullyBurdenedHourlyRate;

    if (args.payType && !calculatedFullyBurdenedRate) {
      // Calculate based on simple traditional model
      const baseRate = args.payType === "hourly"
        ? (args.baseHourlyRate || 0)
        : ((args.annualSalary || 0) / (args.expectedAnnualBillableHours || 2080));

      const workersCompMultiplier = 1 + ((args.workersCompRate || 0) / 100);
      const payrollTaxMultiplier = 1 + ((args.payrollTaxRate || 12) / 100);

      // Base rate with burden percentages
      const baseWithBurden = baseRate * workersCompMultiplier * payrollTaxMultiplier;

      // Annual benefits converted to hourly
      const annualHours = args.expectedAnnualBillableHours || 2080;
      const healthInsuranceHourly = ((args.healthInsuranceMonthly || 0) * 12) / annualHours;
      const allowancesHourly = (
        ((args.phoneAllowance || 0) + (args.vehicleAllowance || 0) + (args.otherAllowances || 0)) * 12
      ) / annualHours;

      calculatedFullyBurdenedRate = baseWithBurden + healthInsuranceHourly + allowancesHourly;
    }

    // Fallback to legacy calculation if no simple model data
    const effectiveRate = calculatedFullyBurdenedRate || args.effectiveRate || args.qualificationRate || 40;

    const employeeId = await ctx.db.insert("employees", {
      companyId: orgId ?? undefined,
      name: args.name,
      firstName: args.firstName,
      lastName: args.lastName,
      employmentType: args.employmentType,
      hireDate: args.hireDate,
      emergencyContactName: args.emergencyContactName,
      emergencyContactPhone: args.emergencyContactPhone,
      emergencyContactRelationship: args.emergencyContactRelationship,

      // Simple traditional model
      positionTitle: args.positionTitle,
      payType: args.payType,
      baseHourlyRate: args.baseHourlyRate,
      annualSalary: args.annualSalary,
      workersCompRate: args.workersCompRate,
      payrollTaxRate: args.payrollTaxRate,
      healthInsuranceMonthly: args.healthInsuranceMonthly,
      ptoHoursPerYear: args.ptoHoursPerYear,
      holidayHoursPerYear: args.holidayHoursPerYear,
      phoneAllowance: args.phoneAllowance,
      vehicleAllowance: args.vehicleAllowance,
      otherAllowances: args.otherAllowances,
      overtimeEligible: args.overtimeEligible,
      expectedAnnualBillableHours: args.expectedAnnualBillableHours,
      fullyBurdenedHourlyRate: calculatedFullyBurdenedRate,

      // Legacy multi-track
      managementLevelId: args.managementLevelId,
      reportsToEmployeeId: args.reportsToEmployeeId,
      totalQualificationPremium: args.totalQualificationPremium,
      // Legacy TreeShop
      positionCode: args.positionCode,
      tierLevel: args.tierLevel,
      hasLeadership: args.hasLeadership,
      hasSupervisor: args.hasSupervisor,
      equipmentLevel: args.equipmentLevel,
      hasCDL: args.hasCDL,
      hasCrane: args.hasCrane,
      hasOSHA: args.hasOSHA,
      qualificationRate: args.qualificationRate,
      qualificationCode: args.qualificationCode,
      burdenMultiplier: args.burdenMultiplier,
      effectiveRate,
      // Legacy fields
      position: args.position,
      hourlyRate: args.hourlyRate,
      annualBenefits: args.annualBenefits,
      annualPayrollTaxes: args.annualPayrollTaxes,
      annualInsurance: args.annualInsurance,
      totalAnnualCost: args.totalAnnualCost,
      annualWorkingHours: args.annualWorkingHours,
      hourlyCost: args.totalAnnualCost ? args.totalAnnualCost / (args.annualWorkingHours || 2000) : calculatedFullyBurdenedRate,

      isActive: true,
      createdAt: Date.now(),
    });

    return employeeId;
  },
});

// Update employee
export const updateEmployee = mutation({
  args: {
    employeeId: v.id("employees"),
    name: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    employmentType: v.optional(v.union(
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("seasonal"),
      v.literal("contractor")
    )),
    hireDate: v.optional(v.string()),
    // ICE
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyContactRelationship: v.optional(v.string()),

    // SIMPLE TRADITIONAL MODEL
    positionTitle: v.optional(v.string()),
    payType: v.optional(v.union(v.literal("hourly"), v.literal("salary"))),
    baseHourlyRate: v.optional(v.number()),
    annualSalary: v.optional(v.number()),
    workersCompRate: v.optional(v.number()),
    payrollTaxRate: v.optional(v.number()),
    healthInsuranceMonthly: v.optional(v.number()),
    ptoHoursPerYear: v.optional(v.number()),
    holidayHoursPerYear: v.optional(v.number()),
    phoneAllowance: v.optional(v.number()),
    vehicleAllowance: v.optional(v.number()),
    otherAllowances: v.optional(v.number()),
    overtimeEligible: v.optional(v.boolean()),
    expectedAnnualBillableHours: v.optional(v.number()),
    fullyBurdenedHourlyRate: v.optional(v.number()),

    // LEGACY: TreeShop Qualification Code System
    positionCode: v.optional(v.string()),
    tierLevel: v.optional(v.number()),
    hasLeadership: v.optional(v.boolean()),
    hasSupervisor: v.optional(v.boolean()),
    equipmentLevel: v.optional(v.number()),
    hasCDL: v.optional(v.boolean()),
    hasCrane: v.optional(v.boolean()),
    hasOSHA: v.optional(v.boolean()),
    qualificationRate: v.optional(v.number()),
    qualificationCode: v.optional(v.string()),
    burdenMultiplier: v.optional(v.number()),
    effectiveRate: v.optional(v.number()),
    // LEGACY: Old fields
    position: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    annualBenefits: v.optional(v.number()),
    annualPayrollTaxes: v.optional(v.number()),
    annualInsurance: v.optional(v.number()),
    totalAnnualCost: v.optional(v.number()),
    annualWorkingHours: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { employeeId, ...data } = args;

    // Fetch and verify ownership before updating
    const employee = await ctx.db.get(employeeId);
    if (!employee) throw new Error("Employee not found");
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    // Calculate fully-burdened rate if simple model is used
    let calculatedFullyBurdenedRate = data.fullyBurdenedHourlyRate;

    if (data.payType && !calculatedFullyBurdenedRate) {
      // Calculate based on simple traditional model
      const baseRate = data.payType === "hourly"
        ? (data.baseHourlyRate || 0)
        : ((data.annualSalary || 0) / (data.expectedAnnualBillableHours || 2080));

      const workersCompMultiplier = 1 + ((data.workersCompRate || 0) / 100);
      const payrollTaxMultiplier = 1 + ((data.payrollTaxRate || 12) / 100);

      // Base rate with burden percentages
      const baseWithBurden = baseRate * workersCompMultiplier * payrollTaxMultiplier;

      // Annual benefits converted to hourly
      const annualHours = data.expectedAnnualBillableHours || 2080;
      const healthInsuranceHourly = ((data.healthInsuranceMonthly || 0) * 12) / annualHours;
      const allowancesHourly = (
        ((data.phoneAllowance || 0) + (data.vehicleAllowance || 0) + (data.otherAllowances || 0)) * 12
      ) / annualHours;

      calculatedFullyBurdenedRate = baseWithBurden + healthInsuranceHourly + allowancesHourly;
    }

    // Update effectiveRate to use fully-burdened rate if available
    const effectiveRate = calculatedFullyBurdenedRate || data.effectiveRate;

    await ctx.db.patch(employeeId, {
      ...data,
      fullyBurdenedHourlyRate: calculatedFullyBurdenedRate,
      effectiveRate,
      hourlyCost: data.totalAnnualCost ? data.totalAnnualCost / (data.annualWorkingHours || 2000) : calculatedFullyBurdenedRate,
    });

    return { success: true };
  },
});

// Delete employee
export const deleteEmployee = mutation({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    // Fetch and verify ownership before deleting
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) throw new Error("Employee not found");
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    await ctx.db.delete(args.employeeId);
    return { success: true };
  },
});

// SIMPLE EMPLOYEE CREATION (Traditional Fully-Burdened Model)
// This is a simplified mutation for quick employee creation without complex qualifications
export const createSimpleEmployee = mutation({
  args: {
    // Basic Info
    firstName: v.string(),
    lastName: v.string(),
    positionTitle: v.string(), // e.g., "Crew Leader", "Equipment Operator"
    employmentType: v.optional(v.union(
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("seasonal"),
      v.literal("contractor")
    )),
    hireDate: v.optional(v.string()),

    // Pay Type
    payType: v.union(v.literal("hourly"), v.literal("salary")),
    baseHourlyRate: v.optional(v.number()), // Required if payType = hourly
    annualSalary: v.optional(v.number()), // Required if payType = salary

    // Burden & Benefits
    workersCompRate: v.optional(v.number()), // % (e.g., 8.5)
    payrollTaxRate: v.optional(v.number()), // % (default 12)
    healthInsuranceMonthly: v.optional(v.number()), // $ per month
    ptoHoursPerYear: v.optional(v.number()),
    holidayHoursPerYear: v.optional(v.number()),

    // Allowances
    phoneAllowance: v.optional(v.number()), // $ per month
    vehicleAllowance: v.optional(v.number()), // $ per month
    otherAllowances: v.optional(v.number()), // $ per month

    // Work Schedule
    overtimeEligible: v.optional(v.boolean()),
    expectedAnnualBillableHours: v.optional(v.number()),

    // Emergency Contact
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyContactRelationship: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    // Calculate base hourly rate
    const baseRate = args.payType === "hourly"
      ? (args.baseHourlyRate || 0)
      : ((args.annualSalary || 0) / (args.expectedAnnualBillableHours || 2080));

    // Calculate burden multipliers
    const workersCompMultiplier = 1 + ((args.workersCompRate || 0) / 100);
    const payrollTaxMultiplier = 1 + ((args.payrollTaxRate || 12) / 100);

    // Base rate with burden percentages
    const baseWithBurden = baseRate * workersCompMultiplier * payrollTaxMultiplier;

    // Annual benefits converted to hourly
    const annualHours = args.expectedAnnualBillableHours || 2080;
    const healthInsuranceHourly = ((args.healthInsuranceMonthly || 0) * 12) / annualHours;
    const allowancesHourly = (
      ((args.phoneAllowance || 0) + (args.vehicleAllowance || 0) + (args.otherAllowances || 0)) * 12
    ) / annualHours;

    // Calculate final fully-burdened hourly rate
    const fullyBurdenedHourlyRate = baseWithBurden + healthInsuranceHourly + allowancesHourly;

    const employeeId = await ctx.db.insert("employees", {
      companyId: orgId ?? undefined,
      name: `${args.firstName} ${args.lastName}`,
      firstName: args.firstName,
      lastName: args.lastName,
      employmentType: args.employmentType || "full_time",
      hireDate: args.hireDate || new Date().toISOString().split('T')[0],

      // Emergency Contact
      emergencyContactName: args.emergencyContactName,
      emergencyContactPhone: args.emergencyContactPhone,
      emergencyContactRelationship: args.emergencyContactRelationship,

      // Simple traditional model
      positionTitle: args.positionTitle,
      payType: args.payType,
      baseHourlyRate: args.baseHourlyRate,
      annualSalary: args.annualSalary,
      workersCompRate: args.workersCompRate,
      payrollTaxRate: args.payrollTaxRate || 12,
      healthInsuranceMonthly: args.healthInsuranceMonthly,
      ptoHoursPerYear: args.ptoHoursPerYear,
      holidayHoursPerYear: args.holidayHoursPerYear,
      phoneAllowance: args.phoneAllowance,
      vehicleAllowance: args.vehicleAllowance,
      otherAllowances: args.otherAllowances,
      overtimeEligible: args.overtimeEligible,
      expectedAnnualBillableHours: args.expectedAnnualBillableHours || 2080,
      fullyBurdenedHourlyRate,

      // Set effectiveRate to the calculated fully-burdened rate
      effectiveRate: fullyBurdenedHourlyRate,
      hourlyCost: fullyBurdenedHourlyRate,

      isActive: true,
      createdAt: Date.now(),
    });

    return employeeId;
  },
});
