import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listLoadouts = query({
  args: {},
  handler: async (ctx) => {
    const loadouts = await ctx.db
      .query("loadouts")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Enrich with employee and equipment details
    const enriched = await Promise.all(
      loadouts.map(async (loadout) => {
        const employees = await Promise.all(
          loadout.employeeIds.map((id) => ctx.db.get(id))
        );
        const equipment = await Promise.all(
          loadout.equipmentIds.map((id) => ctx.db.get(id))
        );

        // Get production rates
        const productionRates = await ctx.db
          .query("loadoutProductionRates")
          .withIndex("by_loadout", (q) => q.eq("loadoutId", loadout._id))
          .collect();

        return {
          ...loadout,
          employees: employees.filter((e) => e !== null),
          equipment: equipment.filter((e) => e !== null),
          productionRates,
        };
      })
    );

    return enriched;
  },
});

export const getLoadout = query({
  args: { loadoutId: v.id("loadouts") },
  handler: async (ctx, args) => {
    const loadout = await ctx.db.get(args.loadoutId);
    if (!loadout) return null;

    const employees = await Promise.all(
      loadout.employeeIds.map((id) => ctx.db.get(id))
    );
    const equipment = await Promise.all(
      loadout.equipmentIds.map((id) => ctx.db.get(id))
    );

    // Get production rates
    const productionRates = await ctx.db
      .query("loadoutProductionRates")
      .withIndex("by_loadout", (q) => q.eq("loadoutId", args.loadoutId))
      .collect();

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
    await ctx.db.delete(args.loadoutId);
    return { success: true };
  },
});
