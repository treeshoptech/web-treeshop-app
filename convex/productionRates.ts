import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireOrganizationId } from "./auth";

// Get production rates for an employee
export const getEmployeeProductionRates = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    const rates = await ctx.db
      .query("productionRates")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    return rates;
  },
});

// Get production rate for specific service type
export const getProductionRate = query({
  args: {
    employeeId: v.id("employees"),
    serviceType: v.string(),
    conditions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("productionRates")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) => q.eq(q.field("serviceType"), args.serviceType));

    const rates = await query.collect();

    // If conditions specified, filter by conditions
    if (args.conditions) {
      const match = rates.find((r) => r.conditions === args.conditions);
      return match || null;
    }

    // Return first match if no conditions
    return rates[0] || null;
  },
});

// Create or update production rate
export const upsertProductionRate = mutation({
  args: {
    employeeId: v.id("employees"),
    serviceType: v.string(),
    unit: v.string(),
    ratePerDay: v.number(),
    conditions: v.optional(v.string()),
    isEstimated: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if rate already exists
    const existing = await ctx.db
      .query("productionRates")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) =>
        q.and(
          q.eq(q.field("serviceType"), args.serviceType),
          args.conditions
            ? q.eq(q.field("conditions"), args.conditions)
            : q.eq(q.field("conditions"), undefined)
        )
      )
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        unit: args.unit,
        ratePerDay: args.ratePerDay,
        isEstimated: args.isEstimated,
        lastUpdated: Date.now(),
      });
      return existing._id;
    } else {
      // Create new
      const id = await ctx.db.insert("productionRates", {
        employeeId: args.employeeId,
        serviceType: args.serviceType,
        unit: args.unit,
        ratePerDay: args.ratePerDay,
        conditions: args.conditions,
        isEstimated: args.isEstimated,
        lastUpdated: Date.now(),
        createdAt: Date.now(),
      });
      return id;
    }
  },
});

// Delete production rate
export const deleteProductionRate = mutation({
  args: { rateId: v.id("productionRates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.rateId);
    return { success: true };
  },
});

// Get all production rates (for admin view)
export const listAllProductionRates = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrganizationId(ctx);

    const rates = await ctx.db
      .query("productionRates")
      .filter((q) => q.eq(q.field("companyId"), orgId))
      .collect();

    // Enrich with employee names
    const enriched = await Promise.all(
      rates.map(async (rate) => {
        const employee = await ctx.db.get(rate.employeeId);
        return {
          ...rate,
          employeeName: employee?.name || "Unknown",
        };
      })
    );

    return enriched;
  },
});
