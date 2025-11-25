import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "./auth";

export const getCompany = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    if (!orgId) {
      return null;
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .first();

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
    supportTaskMargin: v.optional(v.number()), // Decimal, e.g., 0.15 for 15%
    defaultFuelPricePerGallon: v.optional(v.number()),
    defaultEquipmentOverhead: v.optional(v.number()),
    sops: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    // Find existing company for this organization
    const existing = orgId
      ? await ctx.db
          .query("companies")
          .withIndex("by_company", (q) => q.eq("companyId", orgId))
          .first()
      : null;

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("companies", {
        companyId: orgId ?? undefined,
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
    const orgId = await getOrganizationId(ctx);

    if (!orgId) {
      return [];
    }

    return await ctx.db
      .query("companyProductionRates")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();
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
    const orgId = await getOrganizationId(ctx);

    const existing = await ctx.db
      .query("companyProductionRates")
      .withIndex("by_service_type", (q) => q.eq("serviceType", args.serviceType))
      .filter((q) =>
        q.and(
          q.eq(q.field("companyId"), orgId ?? undefined),
          args.conditions
            ? q.eq(q.field("conditions"), args.conditions)
            : q.eq(q.field("conditions"), undefined)
        )
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
        companyId: orgId ?? undefined,
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
    const orgId = await getOrganizationId(ctx);

    // Verify the rate belongs to this organization before deleting
    const rate = await ctx.db.get(args.rateId);
    if (!rate) {
      throw new Error("Production rate not found");
    }

    if (orgId && rate.companyId !== orgId) {
      throw new Error("Unauthorized: This production rate belongs to a different organization");
    }

    await ctx.db.delete(args.rateId);
    return { success: true };
  },
});
