import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCompany = query({
  args: {},
  handler: async (ctx) => {
    const company = await ctx.db.query("companies").first();
    return company;
  },
});

export const createOrUpdateCompany = mutation({
  args: {
    name: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    defaultProfitMargin: v.number(),
    sops: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("companies").first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("companies", {
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return id;
    }
  },
});

export const getCompanyProductionRates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("companyProductionRates").collect();
  },
});

export const upsertCompanyProductionRate = mutation({
  args: {
    serviceType: v.string(),
    unit: v.string(),
    averageRatePerDay: v.number(),
    conditions: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("companyProductionRates")
      .withIndex("by_service_type", (q) => q.eq("serviceType", args.serviceType))
      .filter((q) =>
        args.conditions
          ? q.eq(q.field("conditions"), args.conditions)
          : q.eq(q.field("conditions"), undefined)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        unit: args.unit,
        averageRatePerDay: args.averageRatePerDay,
        notes: args.notes,
        lastUpdated: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("companyProductionRates", {
        serviceType: args.serviceType,
        unit: args.unit,
        averageRatePerDay: args.averageRatePerDay,
        conditions: args.conditions,
        notes: args.notes,
        lastUpdated: Date.now(),
        createdAt: Date.now(),
      });
    }
  },
});

export const deleteCompanyProductionRate = mutation({
  args: { rateId: v.id("companyProductionRates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.rateId);
    return { success: true };
  },
});
