import { getOrganizationId } from "./auth";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// List types for a specific category
export const listTypes = query({
  args: { categoryId: v.id("equipmentCategories") },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    if (!orgId) {
      return [];
    }

    // Verify category ownership
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    await verifyDocumentOwnershipOptional(ctx, category, "category");

    const types = await ctx.db
      .query("equipmentTypes")
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    // Sort by sortOrder if available
    return types.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },
});

// List all types for organization (across all categories)
export const listAllTypes = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    if (!orgId) {
      return [];
    }

    const types = await ctx.db
      .query("equipmentTypes")
      .filter((q) => q.eq(q.field("companyId"), orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    // Sort by sortOrder if available
    return types.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },
});

// Create new type
export const createType = mutation({
  args: {
    categoryId: v.id("equipmentCategories"),
    name: v.string(),
    code: v.string(),
    defaultUsefulLife: v.optional(v.number()),
    defaultOperatingHours: v.optional(v.number()),
    requiresFuelTracking: v.boolean(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    // Verify category exists and belongs to user's org
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    await verifyDocumentOwnershipOptional(ctx, category, "category");

    const typeId = await ctx.db.insert("equipmentTypes", {
      companyId: orgId ?? undefined,
      categoryId: args.categoryId,
      name: args.name,
      code: args.code,
      defaultUsefulLife: args.defaultUsefulLife,
      defaultOperatingHours: args.defaultOperatingHours,
      requiresFuelTracking: args.requiresFuelTracking,
      sortOrder: args.sortOrder ?? 0,
      isActive: true,
      createdAt: Date.now(),
    });

    return typeId;
  },
});

// Update type
export const updateType = mutation({
  args: {
    typeId: v.id("equipmentTypes"),
    categoryId: v.id("equipmentCategories"),
    name: v.string(),
    code: v.string(),
    defaultUsefulLife: v.optional(v.number()),
    defaultOperatingHours: v.optional(v.number()),
    requiresFuelTracking: v.boolean(),
    sortOrder: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { typeId, ...data } = args;

    // Fetch and verify ownership before updating
    const type = await ctx.db.get(typeId);
    if (!type) throw new Error("Type not found");
    await verifyDocumentOwnershipOptional(ctx, type, "type");

    // Verify new category exists and belongs to user's org
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    await verifyDocumentOwnershipOptional(ctx, category, "category");

    await ctx.db.patch(typeId, data);

    return { success: true };
  },
});

// Soft delete type (set isActive to false)
export const deleteType = mutation({
  args: { typeId: v.id("equipmentTypes") },
  handler: async (ctx, args) => {
    // Fetch and verify ownership before deleting
    const type = await ctx.db.get(args.typeId);
    if (!type) throw new Error("Type not found");
    await verifyDocumentOwnershipOptional(ctx, type, "type");

    // Check if any equipment is still using this type
    // Note: The equipment table uses a string "type" field, not a reference to equipmentTypes
    // So we would need to check by matching the code/name, but for now we'll just soft delete
    // This is a design consideration - equipment.type is a string, not a reference

    // Soft delete by setting isActive to false
    await ctx.db.patch(args.typeId, { isActive: false });

    return { success: true };
  },
});
