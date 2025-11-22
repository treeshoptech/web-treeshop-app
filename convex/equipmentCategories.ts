import { getOrganizationId } from "./auth";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// List all active categories for organization
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    console.log("listCategories - orgId:", orgId);

    // If no orgId, return all categories (JWT not configured)
    let categories;
    if (orgId) {
      console.log("listCategories - filtering by orgId:", orgId);
      categories = await ctx.db
        .query("equipmentCategories")
        .filter((q) => q.eq(q.field("companyId"), orgId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    } else {
      console.log("listCategories - NO orgId, querying all");
      categories = await ctx.db
        .query("equipmentCategories")
        .collect();
      console.log("listCategories - raw query returned:", categories.length);
      categories = categories.filter(c => c.isActive === true);
      console.log("listCategories - after isActive filter:", categories.length);
    }

    console.log("listCategories - found categories:", categories.length);

    // Sort by sortOrder if available
    const sorted = categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    console.log("listCategories - returning:", sorted.length, "categories");
    return sorted;
  },
});

// Create new category
export const createCategory = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    const categoryId = await ctx.db.insert("equipmentCategories", {
      companyId: orgId ?? undefined,
      name: args.name,
      code: args.code,
      sortOrder: args.sortOrder ?? 0,
      isActive: true,
      createdAt: Date.now(),
    });

    return categoryId;
  },
});

// Update category
export const updateCategory = mutation({
  args: {
    categoryId: v.id("equipmentCategories"),
    name: v.string(),
    code: v.string(),
    sortOrder: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...data } = args;

    // Fetch and verify ownership before updating
    const category = await ctx.db.get(categoryId);
    if (!category) throw new Error("Category not found");
    await verifyDocumentOwnershipOptional(ctx, category, "category");

    await ctx.db.patch(categoryId, data);

    return { success: true };
  },
});

// Soft delete category (set isActive to false)
export const deleteCategory = mutation({
  args: { categoryId: v.id("equipmentCategories") },
  handler: async (ctx, args) => {
    // Fetch and verify ownership before deleting
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    await verifyDocumentOwnershipOptional(ctx, category, "category");

    // Check if any types are still using this category
    const typesUsingCategory = await ctx.db
      .query("equipmentTypes")
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (typesUsingCategory.length > 0) {
      throw new Error(
        `Cannot delete category. ${typesUsingCategory.length} active equipment type(s) are still using this category.`
      );
    }

    // Soft delete by setting isActive to false
    await ctx.db.patch(args.categoryId, { isActive: false });

    return { success: true };
  },
});
