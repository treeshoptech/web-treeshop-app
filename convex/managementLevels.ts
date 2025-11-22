import { getOrganizationId } from "./auth";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// List all active management levels for organization
export const listManagementLevels = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    if (!orgId) {
      return [];
    }

    const levels = await ctx.db
      .query("managementLevels")
      .filter((q) => q.eq(q.field("companyId"), orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();

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
