import { getOrganizationId } from "./auth";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// List all certifications for the organization
export const listCertifications = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    console.log('certifications.listCertifications - orgId:', orgId);

    if (!orgId) {
      console.log('certifications.listCertifications - No orgId, returning empty array');
      return [];
    }

    const certifications = await ctx.db
      .query("certifications")
      .filter((q) => q.eq(q.field("companyId"), orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    console.log('certifications.listCertifications - Found certifications:', certifications.length);

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

// Seed default certifications (public mutation - can be run from CLI)
export const seedDefaultCertifications = mutation({
  args: {
    companyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;

    // Check if already seeded
    const existing = await ctx.db
      .query("certifications")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    if (existing.length > 0) {
      return { success: false, message: "Certifications already exist", count: existing.length };
    }

    const certs = [
      // Safety
      { name: "OSHA 10-Hour Safety", code: "OSHA_10", category: "safety" as const, requiresRenewal: false, hourlyPremium: 1.0 },
      { name: "OSHA 30-Hour Safety", code: "OSHA_30", category: "safety" as const, requiresRenewal: false, hourlyPremium: 2.0 },
      { name: "First Aid & CPR", code: "FIRST_AID_CPR", category: "safety" as const, requiresRenewal: true, renewalPeriodMonths: 24, hourlyPremium: 0.5 },
      { name: "Aerial Lift Operator", code: "AERIAL_LIFT", category: "safety" as const, requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 1.5 },
      // Professional
      { name: "ISA Certified Arborist", code: "ISA_CERTIFIED_ARBORIST", category: "professional" as const, requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 4.0 },
      { name: "ISA Tree Worker", code: "ISA_TREE_WORKER", category: "professional" as const, requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 3.0 },
      { name: "ISA Master Arborist", code: "ISA_MASTER_ARBORIST", category: "professional" as const, requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 6.0 },
      { name: "TRAQ Certification", code: "TRAQ", category: "professional" as const, requiresRenewal: true, renewalPeriodMonths: 60, hourlyPremium: 4.0 },
      // Equipment
      { name: "CDL Class A", code: "CDL_A", category: "equipment" as const, requiresRenewal: true, renewalPeriodMonths: 60, hourlyPremium: 3.0 },
      { name: "CDL Class B", code: "CDL_B", category: "equipment" as const, requiresRenewal: true, renewalPeriodMonths: 60, hourlyPremium: 2.5 },
      { name: "Crane Operator", code: "CRANE_OPERATOR", category: "equipment" as const, requiresRenewal: true, renewalPeriodMonths: 60, hourlyPremium: 4.0 },
      { name: "Skid Steer Operator", code: "SKID_STEER", category: "equipment" as const, requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 1.5 },
      { name: "Excavator Operator", code: "EXCAVATOR", category: "equipment" as const, requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 2.0 },
      { name: "Forestry Mulcher Operator", code: "FORESTRY_MULCHER", category: "equipment" as const, requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 3.0 },
      // License
      { name: "Pesticide Applicator", code: "PESTICIDE_APPLICATOR", category: "license" as const, requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 2.0 },
      { name: "State Arborist License", code: "STATE_ARBORIST_LICENSE", category: "license" as const, requiresRenewal: true, renewalPeriodMonths: 24, hourlyPremium: 3.0 },
    ];

    for (const certData of certs) {
      await ctx.db.insert("certifications", {
        companyId,
        ...certData,
        isActive: true,
        createdAt: Date.now(),
      });
    }

    return { success: true, message: `Seeded ${certs.length} certifications`, count: certs.length };
  },
});
