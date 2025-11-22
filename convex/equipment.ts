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
    purchasePrice: v.number(),
    usefulLifeYears: v.number(),
    salvageValue: v.number(),
    annualOperatingHours: v.number(),
    fuelConsumptionPerHour: v.number(),
    fuelPricePerGallon: v.number(),
    annualMaintenanceCost: v.number(),
    annualOtherCosts: v.optional(v.number()),
    overheadMultiplier: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganizationId(ctx);

    // Calculate hourly costs using Army Corps method
    const annualDepreciation = (args.purchasePrice - args.salvageValue) / args.usefulLifeYears;
    const hourlyDepreciation = annualDepreciation / args.annualOperatingHours;

    const hourlyFuel = args.fuelConsumptionPerHour * args.fuelPricePerGallon;
    const hourlyMaintenance = args.annualMaintenanceCost / args.annualOperatingHours;
    const hourlyOther = (args.annualOtherCosts || 0) / args.annualOperatingHours;

    const hourlyCostBeforeOverhead = hourlyDepreciation + hourlyFuel + hourlyMaintenance + hourlyOther;
    const overheadMultiplier = args.overheadMultiplier || 1.15;
    const hourlyCost = hourlyCostBeforeOverhead * overheadMultiplier;

    const equipmentId = await ctx.db.insert("equipment", {
      companyId: orgId,
      name: args.name,
      type: args.type,
      purchasePrice: args.purchasePrice,
      usefulLifeYears: args.usefulLifeYears,
      salvageValue: args.salvageValue,
      annualOperatingHours: args.annualOperatingHours,
      fuelConsumptionPerHour: args.fuelConsumptionPerHour,
      fuelPricePerGallon: args.fuelPricePerGallon,
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
    purchasePrice: v.number(),
    usefulLifeYears: v.number(),
    salvageValue: v.number(),
    annualOperatingHours: v.number(),
    fuelConsumptionPerHour: v.number(),
    fuelPricePerGallon: v.number(),
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

    // Recalculate hourly costs
    const annualDepreciation = (data.purchasePrice - data.salvageValue) / data.usefulLifeYears;
    const hourlyDepreciation = annualDepreciation / data.annualOperatingHours;

    const hourlyFuel = data.fuelConsumptionPerHour * data.fuelPricePerGallon;
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
