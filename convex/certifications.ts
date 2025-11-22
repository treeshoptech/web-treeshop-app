import { getOrganizationId } from "./auth";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// List all certifications for the organization
export const listCertifications = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    if (!orgId) {
      return [];
    }

    const certifications = await ctx.db
      .query("certifications")
      .filter((q) => q.eq(q.field("companyId"), orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    return certifications;
  },
});

// Get single certification
export const getCertification = query({
  args: { certificationId: v.id("certifications") },
  handler: async (ctx, args) => {
    const certification = await ctx.db.get(args.certificationId);
    if (!certification) throw new Error("Certification not found");

    // Verify ownership - throws error if certification doesn't belong to user's org
    await verifyDocumentOwnershipOptional(ctx, certification, "certification");

    return certification;
  },
});

// Create new certification
export const createCertification = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    category: v.union(
      v.literal("safety"),
      v.literal("professional"),
      v.literal("equipment"),
      v.literal("license")
    ),
    requiresRenewal: v.boolean(),
    renewalPeriodMonths: v.optional(v.number()),
    hourlyPremium: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    const certificationId = await ctx.db.insert("certifications", {
      companyId: orgId ?? undefined,
      name: args.name,
      code: args.code,
      category: args.category,
      requiresRenewal: args.requiresRenewal,
      renewalPeriodMonths: args.renewalPeriodMonths,
      hourlyPremium: args.hourlyPremium,
      isActive: true,
      createdAt: Date.now(),
    });

    return certificationId;
  },
});

// Update certification
export const updateCertification = mutation({
  args: {
    certificationId: v.id("certifications"),
    name: v.string(),
    code: v.string(),
    category: v.union(
      v.literal("safety"),
      v.literal("professional"),
      v.literal("equipment"),
      v.literal("license")
    ),
    requiresRenewal: v.boolean(),
    renewalPeriodMonths: v.optional(v.number()),
    hourlyPremium: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { certificationId, ...data } = args;

    // Fetch and verify ownership before updating
    const certification = await ctx.db.get(certificationId);
    if (!certification) throw new Error("Certification not found");
    await verifyDocumentOwnershipOptional(ctx, certification, "certification");

    await ctx.db.patch(certificationId, data);

    return { success: true };
  },
});

// Delete certification (soft delete by setting isActive to false)
export const deleteCertification = mutation({
  args: { certificationId: v.id("certifications") },
  handler: async (ctx, args) => {
    // Fetch and verify ownership before deleting
    const certification = await ctx.db.get(args.certificationId);
    if (!certification) throw new Error("Certification not found");
    await verifyDocumentOwnershipOptional(ctx, certification, "certification");

    // Check if any employees have this certification
    const employeeCertifications = await ctx.db
      .query("employeeCertifications")
      .filter((q) => q.eq(q.field("certificationId"), args.certificationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (employeeCertifications.length > 0) {
      throw new Error(
        `Cannot delete certification: ${employeeCertifications.length} employee(s) currently have this certification. Please remove it from all employees first.`
      );
    }

    // Soft delete by setting isActive to false
    await ctx.db.patch(args.certificationId, { isActive: false });

    return { success: true };
  },
});
