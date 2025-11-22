import { getOrganizationId, requireOrganizationId } from "./auth";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// List all employees
export const listEmployees = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    if (!orgId) {
      return [];
    }
    const employees = await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("companyId"), orgId))
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

    // Verify ownership - throws error if employee doesn't belong to user's org
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    return employee;
  },
});

// Create new employee
export const createEmployee = mutation({
  args: {
    name: v.string(),
    // TreeShop Qualification Code System
    positionCode: v.optional(v.string()),
    tierLevel: v.optional(v.number()),
    baseHourlyRate: v.optional(v.number()),
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
    // Legacy fields
    position: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    annualSalary: v.optional(v.number()),
    annualBenefits: v.optional(v.number()),
    annualPayrollTaxes: v.optional(v.number()),
    annualInsurance: v.optional(v.number()),
    totalAnnualCost: v.optional(v.number()),
    annualWorkingHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganizationId(ctx);
    const effectiveRate = args.effectiveRate || args.qualificationRate || 40;


    const employeeId = await ctx.db.insert("employees", {
      companyId: orgId,
      name: args.name,
      positionCode: args.positionCode,
      tierLevel: args.tierLevel,
      baseHourlyRate: args.baseHourlyRate,
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
      // Legacy
      position: args.position,
      hourlyRate: args.hourlyRate,
      annualSalary: args.annualSalary,
      annualBenefits: args.annualBenefits,
      annualPayrollTaxes: args.annualPayrollTaxes,
      annualInsurance: args.annualInsurance,
      totalAnnualCost: args.totalAnnualCost,
      annualWorkingHours: args.annualWorkingHours,
      hourlyCost: args.totalAnnualCost ? args.totalAnnualCost / (args.annualWorkingHours || 2000) : undefined,
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
    // TreeShop Qualification Code System
    positionCode: v.optional(v.string()),
    tierLevel: v.optional(v.number()),
    baseHourlyRate: v.optional(v.number()),
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
    // Legacy
    position: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    annualSalary: v.optional(v.number()),
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
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    await ctx.db.patch(employeeId, {
      ...data,
      hourlyCost: data.totalAnnualCost ? data.totalAnnualCost / (data.annualWorkingHours || 2000) : undefined,
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
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    await ctx.db.delete(args.employeeId);
    return { success: true };
  },
});
