import { getOrganizationId } from "./auth";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// List all active management levels for organization
export const listManagementLevels = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    console.log('managementLevels.listManagementLevels - orgId:', orgId);

    if (!orgId) {
      console.log('managementLevels.listManagementLevels - No orgId, returning empty array');
      return [];
    }

    const levels = await ctx.db
      .query("managementLevels")
      .filter((q) => q.eq(q.field("companyId"), orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();

    console.log('managementLevels.listManagementLevels - Found levels:', levels.length);

    // Sort by level number
    return levels.sort((a, b) => a.level - b.level);
  },
});

// Get a single management level
export const getManagementLevel = query({
  args: {
    levelId: v.id("managementLevels"),
  },
  handler: async (ctx, args) => {
    const level = await ctx.db.get(args.levelId);

    if (!level) {
      return null;
    }

    // Verify ownership
    await verifyDocumentOwnershipOptional(ctx, level, "management level");

    return level;
  },
});

// Create new management level
export const createManagementLevel = mutation({
  args: {
    level: v.number(),
    title: v.string(),
    code: v.string(),
    hourlyPremium: v.number(),
    salaryRange: v.optional(v.string()),
    reportsToLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    const levelId = await ctx.db.insert("managementLevels", {
      companyId: orgId ?? undefined,
      level: args.level,
      title: args.title,
      code: args.code,
      hourlyPremium: args.hourlyPremium,
      salaryRange: args.salaryRange,
      reportsToLevel: args.reportsToLevel,
      isActive: true,
      createdAt: Date.now(),
    });

    return levelId;
  },
});

// Update management level
export const updateManagementLevel = mutation({
  args: {
    levelId: v.id("managementLevels"),
    level: v.number(),
    title: v.string(),
    code: v.string(),
    hourlyPremium: v.number(),
    salaryRange: v.optional(v.string()),
    reportsToLevel: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { levelId, ...data } = args;

    // Fetch and verify ownership before updating
    const level = await ctx.db.get(levelId);
    if (!level) throw new Error("Management level not found");
    await verifyDocumentOwnershipOptional(ctx, level, "management level");

    await ctx.db.patch(levelId, data);

    return { success: true };
  },
});

// Delete management level
export const deleteManagementLevel = mutation({
  args: { levelId: v.id("managementLevels") },
  handler: async (ctx, args) => {
    // Fetch and verify ownership before deleting
    const level = await ctx.db.get(args.levelId);
    if (!level) throw new Error("Management level not found");
    await verifyDocumentOwnershipOptional(ctx, level, "management level");

    // Check if any employees are still using this level
    const employeesUsingLevel = await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("managementLevelId"), args.levelId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (employeesUsingLevel.length > 0) {
      throw new Error(
        `Cannot delete management level. ${employeesUsingLevel.length} active employee(s) are still assigned to this level.`
      );
    }

    // Soft delete by setting isActive to false
    await ctx.db.patch(args.levelId, { isActive: false });

    return { success: true };
  },
});

// Seed default management levels (public mutation - can be run from CLI)
export const seedDefaultLevels = mutation({
  args: {
    companyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;

    // Check if already seeded
    const existing = await ctx.db
      .query("managementLevels")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    if (existing.length > 0) {
      return { success: false, message: "Management levels already exist", count: existing.length };
    }

    const levels = [
      { level: 1, title: "Crew Leader", code: "CREW_LEAD", hourlyPremium: 3.0, salaryRange: "$45,000 - $55,000", reportsToLevel: 2 },
      { level: 2, title: "Crew Supervisor", code: "CREW_SUPER", hourlyPremium: 7.0, salaryRange: "$55,000 - $70,000", reportsToLevel: 3 },
      { level: 3, title: "Operations Manager", code: "OPS_MGR", hourlyPremium: 15.0, salaryRange: "$70,000 - $90,000", reportsToLevel: 4 },
      { level: 4, title: "Department Director", code: "DEPT_DIR", hourlyPremium: 25.0, salaryRange: "$90,000 - $120,000", reportsToLevel: 5 },
      { level: 5, title: "VP Operations", code: "VP_OPS", hourlyPremium: 40.0, salaryRange: "$120,000 - $160,000" },
    ];

    for (const levelData of levels) {
      await ctx.db.insert("managementLevels", {
        companyId,
        ...levelData,
        isActive: true,
        createdAt: Date.now(),
      });
    }

    return { success: true, message: `Seeded ${levels.length} management levels`, count: levels.length };
  },
});
