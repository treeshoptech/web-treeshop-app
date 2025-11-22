import { getOrganizationId, requireOrganizationId } from "./auth";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// List all equipment
export const listEquipment = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    if (!orgId) {
      return [];
    }
    const equipment = await ctx.db
      .query("equipment")
      .filter((q) => q.eq(q.field("companyId"), orgId))
      .order("desc")
      .collect();

    return equipment;
  },
});

// Get single equipment
export const getEquipment = query({
  args: { equipmentId: v.id("equipment") },
  handler: async (ctx, args) => {
    const equipment = await ctx.db.get(args.equipmentId);

    if (!equipment) {
      return null;
    }

    // Verify ownership - throws error if equipment doesn't belong to user's org
    await verifyDocumentOwnershipOptional(ctx, equipment, "equipment");

    return equipment;
  },
});

// Create new equipment
export const createEquipment = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    purchasePrice: v.number(),
    usefulLifeYears: v.number(),
    auctionPrice: v.number(),
    annualOperatingHours: v.number(),
    fuelConsumptionPerHour: v.number(),
    annualMaintenanceCost: v.number(),
    annualOtherCosts: v.optional(v.number()),
    overheadMultiplier: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    // Get fuel price from company settings
    const company = await ctx.db
      .query("companies")
      .withIndex("by_company", (q) => q.eq("companyId", orgId ?? undefined))
      .first();

    const fuelPricePerGallon = company?.defaultFuelPricePerGallon || 3.50; // Default fallback

    // Calculate hourly costs using Army Corps method
    const annualDepreciation = (args.purchasePrice - args.auctionPrice) / args.usefulLifeYears;
    const hourlyDepreciation = annualDepreciation / args.annualOperatingHours;

    const hourlyFuel = args.fuelConsumptionPerHour * fuelPricePerGallon;
    const hourlyMaintenance = args.annualMaintenanceCost / args.annualOperatingHours;
    const hourlyOther = (args.annualOtherCosts || 0) / args.annualOperatingHours;

    const hourlyCostBeforeOverhead = hourlyDepreciation + hourlyFuel + hourlyMaintenance + hourlyOther;
    const overheadMultiplier = args.overheadMultiplier || 1.15;
    const hourlyCost = hourlyCostBeforeOverhead * overheadMultiplier;

    const equipmentId = await ctx.db.insert("equipment", {
      companyId: orgId ?? undefined,
      name: args.name,
      type: args.type,
      category: args.category,
      subcategory: args.subcategory,
      purchasePrice: args.purchasePrice,
      usefulLifeYears: args.usefulLifeYears,
      auctionPrice: args.auctionPrice,
      annualOperatingHours: args.annualOperatingHours,
      fuelConsumptionPerHour: args.fuelConsumptionPerHour,
      annualMaintenanceCost: args.annualMaintenanceCost,
      annualOtherCosts: args.annualOtherCosts,
      hourlyDepreciation,
      hourlyFuel,
      hourlyMaintenance,
      hourlyOther,
      hourlyCostBeforeOverhead,
      overheadMultiplier,
      hourlyCost,
      notes: args.notes,
      isActive: true,
      createdAt: Date.now(),
    });

    return equipmentId;
  },
});

// Update equipment
export const updateEquipment = mutation({
  args: {
    equipmentId: v.id("equipment"),
    name: v.string(),
    type: v.string(),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    purchasePrice: v.number(),
    usefulLifeYears: v.number(),
    auctionPrice: v.number(),
    annualOperatingHours: v.number(),
    fuelConsumptionPerHour: v.number(),
    annualMaintenanceCost: v.number(),
    annualOtherCosts: v.optional(v.number()),
    overheadMultiplier: v.optional(v.number()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { equipmentId, ...data } = args;

    // Fetch and verify ownership before updating
    const equipment = await ctx.db.get(equipmentId);

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    await verifyDocumentOwnershipOptional(ctx, equipment, "equipment");

    // Get fuel price from company settings
    const orgId = await getOrganizationId(ctx);
    const company = await ctx.db
      .query("companies")
      .withIndex("by_company", (q) => q.eq("companyId", orgId ?? undefined))
      .first();

    const fuelPricePerGallon = company?.defaultFuelPricePerGallon || 3.50; // Default fallback

    // Recalculate hourly costs
    const annualDepreciation = (data.purchasePrice - data.auctionPrice) / data.usefulLifeYears;
    const hourlyDepreciation = annualDepreciation / data.annualOperatingHours;

    const hourlyFuel = data.fuelConsumptionPerHour * fuelPricePerGallon;
    const hourlyMaintenance = data.annualMaintenanceCost / data.annualOperatingHours;
    const hourlyOther = (data.annualOtherCosts || 0) / data.annualOperatingHours;

    const hourlyCostBeforeOverhead = hourlyDepreciation + hourlyFuel + hourlyMaintenance + hourlyOther;
    const overheadMultiplier = data.overheadMultiplier || 1.15;
    const hourlyCost = hourlyCostBeforeOverhead * overheadMultiplier;

    await ctx.db.patch(equipmentId, {
      ...data,
      hourlyDepreciation,
      hourlyFuel,
      hourlyMaintenance,
      hourlyOther,
      hourlyCostBeforeOverhead,
      overheadMultiplier,
      hourlyCost,
    });

    return { success: true };
  },
});

// Delete equipment
export const deleteEquipment = mutation({
  args: { equipmentId: v.id("equipment") },
  handler: async (ctx, args) => {
    // Fetch and verify ownership before deleting
    const equipment = await ctx.db.get(args.equipmentId);

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    await verifyDocumentOwnershipOptional(ctx, equipment, "equipment");

    await ctx.db.delete(args.equipmentId);
    return { success: true };
  },
});
