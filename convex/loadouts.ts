import { getOrganizationId, requireOrganizationId } from "./auth";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

export const listLoadouts = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    // Get loadouts - filter by orgId if available
    const loadouts = orgId
      ? await ctx.db
          .query("loadouts")
          .filter((q) => q.eq(q.field("companyId"), orgId))
          .withIndex("by_active", (q) => q.eq("isActive", true))
          .collect()
      : await ctx.db
          .query("loadouts")
          .withIndex("by_active", (q) => q.eq("isActive", true))
          .collect();

    // Batch fetch all unique employee and equipment IDs upfront
    const allEmployeeIds = Array.from(
      new Set(loadouts.flatMap((l) => l.employeeIds))
    );
    const allEquipmentIds = Array.from(
      new Set(loadouts.flatMap((l) => l.equipmentIds))
    );

    // Fetch all employees, equipment, and production rates in parallel
    const [employees, equipment, allProductionRates] = await Promise.all([
      Promise.all(allEmployeeIds.map((id) => ctx.db.get(id))),
      Promise.all(allEquipmentIds.map((id) => ctx.db.get(id))),
      Promise.all(
        loadouts.map((loadout) =>
          ctx.db
            .query("loadoutProductionRates")
            .withIndex("by_loadout", (q) => q.eq("loadoutId", loadout._id))
            .collect()
        )
      ),
    ]);

    // Create lookup maps for O(1) access
    const employeeMap = new Map(
      employees.map((e, i) => [allEmployeeIds[i], e])
    );
    const equipmentMap = new Map(
      equipment.map((e, i) => [allEquipmentIds[i], e])
    );

    // Single-pass enrichment
    const enriched = loadouts.map((loadout, idx) => ({
      ...loadout,
      employees: loadout.employeeIds
        .map((id) => employeeMap.get(id))
        .filter((e) => e !== null && e !== undefined),
      equipment: loadout.equipmentIds
        .map((id) => equipmentMap.get(id))
        .filter((e) => e !== null && e !== undefined),
      productionRates: allProductionRates[idx],
    }));

    return enriched;
  },
});

export const getLoadout = query({
  args: { loadoutId: v.id("loadouts") },
  handler: async (ctx, args) => {
    const loadout = await ctx.db.get(args.loadoutId);

    // Check if loadout exists first
    if (!loadout) return null;

    // Verify ownership - throws error if loadout doesn't belong to user's org
    await verifyDocumentOwnershipOptional(ctx, loadout, "loadout");

    // Batch fetch employees, equipment, and production rates in parallel
    const [employees, equipment, productionRates] = await Promise.all([
      Promise.all(loadout.employeeIds.map((id) => ctx.db.get(id))),
      Promise.all(loadout.equipmentIds.map((id) => ctx.db.get(id))),
      ctx.db
        .query("loadoutProductionRates")
        .withIndex("by_loadout", (q) => q.eq("loadoutId", args.loadoutId))
        .collect(),
    ]);

    return {
      ...loadout,
      employees: employees.filter((e) => e !== null),
      equipment: equipment.filter((e) => e !== null),
      productionRates,
    };
  },
});

export const createLoadout = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    employeeIds: v.array(v.id("employees")),
    equipmentIds: v.array(v.id("equipment")),
    mulchingRate: v.optional(v.number()),
    stumpRate: v.optional(v.number()),
    treeRemovalRate: v.optional(v.number()),
    landClearingRate: v.optional(v.number()),
    treeTrimmingRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    // Calculate total hourly cost
    const employees = await Promise.all(
      args.employeeIds.map((id) => ctx.db.get(id))
    );
    const equipment = await Promise.all(
      args.equipmentIds.map((id) => ctx.db.get(id))
    );

    const employeeCost = employees.reduce(
      (sum, emp) => sum + (emp?.effectiveRate || 0),
      0
    );
    const equipmentCost = equipment.reduce(
      (sum, equip) => sum + (equip?.hourlyCost || 0),
      0
    );
    const totalHourlyCost = employeeCost + equipmentCost;

    const loadoutId = await ctx.db.insert("loadouts", {
      companyId: orgId ?? undefined,
      name: args.name,
      description: args.description,
      employeeIds: args.employeeIds,
      equipmentIds: args.equipmentIds,
      totalHourlyCost,
      isActive: true,
      createdAt: Date.now(),
    });

    // Save production rates
    const rates = [
      { serviceType: "forestry_mulching", rate: args.mulchingRate },
      { serviceType: "stump_grinding", rate: args.stumpRate },
      { serviceType: "tree_removal", rate: args.treeRemovalRate },
      { serviceType: "land_clearing", rate: args.landClearingRate },
      { serviceType: "tree_trimming", rate: args.treeTrimmingRate },
    ];

    for (const { serviceType, rate } of rates) {
      if (rate && rate > 0) {
        await ctx.db.insert("loadoutProductionRates", {
          loadoutId,
          serviceType,
          unit: "points",
          actualRatePerDay: rate,
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        });
      }
    }

    return loadoutId;
  },
});

export const updateLoadout = mutation({
  args: {
    loadoutId: v.id("loadouts"),
    name: v.string(),
    description: v.optional(v.string()),
    employeeIds: v.array(v.id("employees")),
    equipmentIds: v.array(v.id("equipment")),
    mulchingRate: v.optional(v.number()),
    stumpRate: v.optional(v.number()),
    treeRemovalRate: v.optional(v.number()),
    landClearingRate: v.optional(v.number()),
    treeTrimmingRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { loadoutId, mulchingRate, stumpRate, treeRemovalRate, landClearingRate, treeTrimmingRate, ...data } = args;

    // Fetch and verify ownership before updating
    const loadout = await ctx.db.get(loadoutId);

    // Check if loadout exists first
    if (!loadout) {
      throw new Error("Loadout not found");
    }

    await verifyDocumentOwnershipOptional(ctx, loadout, "loadout");

    // Recalculate total hourly cost
    const employees = await Promise.all(
      data.employeeIds.map((id) => ctx.db.get(id))
    );
    const equipment = await Promise.all(
      data.equipmentIds.map((id) => ctx.db.get(id))
    );

    const employeeCost = employees.reduce(
      (sum, emp) => sum + (emp?.effectiveRate || 0),
      0
    );
    const equipmentCost = equipment.reduce(
      (sum, equip) => sum + (equip?.hourlyCost || 0),
      0
    );
    const totalHourlyCost = employeeCost + equipmentCost;

    await ctx.db.patch(loadoutId, {
      ...data,
      totalHourlyCost,
    });

    // Update production rates
    const rates = [
      { serviceType: "forestry_mulching", rate: mulchingRate },
      { serviceType: "stump_grinding", rate: stumpRate },
      { serviceType: "tree_removal", rate: treeRemovalRate },
      { serviceType: "land_clearing", rate: landClearingRate },
      { serviceType: "tree_trimming", rate: treeTrimmingRate },
    ];

    for (const { serviceType, rate } of rates) {
      // Find existing rate
      const existing = await ctx.db
        .query("loadoutProductionRates")
        .withIndex("by_loadout", (q) => q.eq("loadoutId", loadoutId))
        .filter((q) => q.eq(q.field("serviceType"), serviceType))
        .first();

      if (rate && rate > 0) {
        if (existing) {
          await ctx.db.patch(existing._id, {
            actualRatePerDay: rate,
            lastUpdated: Date.now(),
          });
        } else {
          await ctx.db.insert("loadoutProductionRates", {
            loadoutId,
            serviceType,
            unit: "points",
            actualRatePerDay: rate,
            lastUpdated: Date.now(),
            createdAt: Date.now(),
          });
        }
      } else if (existing) {
        // Delete if rate is 0 or empty
        await ctx.db.delete(existing._id);
      }
    }

    return { success: true };
  },
});

export const deleteLoadout = mutation({
  args: { loadoutId: v.id("loadouts") },
  handler: async (ctx, args) => {
    // Fetch and verify ownership before deleting
    const loadout = await ctx.db.get(args.loadoutId);

    // Check if loadout exists first
    if (!loadout) {
      throw new Error("Loadout not found");
    }

    await verifyDocumentOwnershipOptional(ctx, loadout, "loadout");

    await ctx.db.delete(args.loadoutId);
    return { success: true };
  },
});
