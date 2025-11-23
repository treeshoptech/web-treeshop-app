import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed Certifications
 *
 * This file contains default certifications for the TreeShop employee system.
 * Certifications are separate from career tracks and stored in the certifications table.
 *
 * Categories:
 * - Safety: OSHA, First Aid, Aerial Lift, etc.
 * - Professional: ISA Arborist, Consulting Arborist, etc.
 * - Equipment: Crane, CDL, Skid Steer, etc.
 * - License: Pesticide Applicator, Arborist License, etc.
 */

interface CertificationData {
  name: string;
  code: string;
  category: "safety" | "professional" | "equipment" | "license";
  requiresRenewal: boolean;
  renewalPeriodMonths?: number;
  hourlyPremium?: number;
}

// ============================================================================
// SAFETY CERTIFICATIONS
// ============================================================================
const SAFETY_CERTIFICATIONS: CertificationData[] = [
  {
    name: "OSHA 10-Hour Safety",
    code: "OSHA_10",
    category: "safety",
    requiresRenewal: false,
    hourlyPremium: 1.0,
  },
  {
    name: "OSHA 30-Hour Safety",
    code: "OSHA_30",
    category: "safety",
    requiresRenewal: false,
    hourlyPremium: 2.0,
  },
  {
    name: "First Aid & CPR",
    code: "FIRST_AID_CPR",
    category: "safety",
    requiresRenewal: true,
    renewalPeriodMonths: 24,
    hourlyPremium: 0.5,
  },
  {
    name: "Aerial Lift Operator",
    code: "AERIAL_LIFT",
    category: "safety",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 1.5,
  },
  {
    name: "Confined Space Entry",
    code: "CONFINED_SPACE",
    category: "safety",
    requiresRenewal: true,
    renewalPeriodMonths: 12,
    hourlyPremium: 1.0,
  },
  {
    name: "Fall Protection Competent Person",
    code: "FALL_PROTECTION",
    category: "safety",
    requiresRenewal: true,
    renewalPeriodMonths: 24,
    hourlyPremium: 1.5,
  },
  {
    name: "Hazmat Awareness",
    code: "HAZMAT",
    category: "safety",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 1.0,
  },
];

// ============================================================================
// PROFESSIONAL CERTIFICATIONS
// ============================================================================
const PROFESSIONAL_CERTIFICATIONS: CertificationData[] = [
  {
    name: "ISA Certified Arborist",
    code: "ISA_CERTIFIED_ARBORIST",
    category: "professional",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 4.0,
  },
  {
    name: "ISA Tree Worker Climber Specialist",
    code: "ISA_TREE_WORKER",
    category: "professional",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 3.0,
  },
  {
    name: "ISA Board Certified Master Arborist",
    code: "ISA_MASTER_ARBORIST",
    category: "professional",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 6.0,
  },
  {
    name: "ASCA Registered Consulting Arborist",
    code: "ASCA_CONSULTING_ARBORIST",
    category: "professional",
    requiresRenewal: true,
    renewalPeriodMonths: 12,
    hourlyPremium: 5.0,
  },
  {
    name: "ISA Utility Specialist",
    code: "ISA_UTILITY_SPECIALIST",
    category: "professional",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 3.0,
  },
  {
    name: "Tree Risk Assessment Qualification (TRAQ)",
    code: "TRAQ",
    category: "professional",
    requiresRenewal: true,
    renewalPeriodMonths: 60,
    hourlyPremium: 4.0,
  },
];

// ============================================================================
// EQUIPMENT CERTIFICATIONS
// ============================================================================
const EQUIPMENT_CERTIFICATIONS: CertificationData[] = [
  {
    name: "CDL Class A",
    code: "CDL_A",
    category: "equipment",
    requiresRenewal: true,
    renewalPeriodMonths: 60,
    hourlyPremium: 3.0,
  },
  {
    name: "CDL Class B",
    code: "CDL_B",
    category: "equipment",
    requiresRenewal: true,
    renewalPeriodMonths: 60,
    hourlyPremium: 2.5,
  },
  {
    name: "Crane Operator Certification",
    code: "CRANE_OPERATOR",
    category: "equipment",
    requiresRenewal: true,
    renewalPeriodMonths: 60,
    hourlyPremium: 4.0,
  },
  {
    name: "Skid Steer Operator",
    code: "SKID_STEER",
    category: "equipment",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 1.5,
  },
  {
    name: "Excavator Operator",
    code: "EXCAVATOR",
    category: "equipment",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 2.0,
  },
  {
    name: "Forestry Mulcher Operator",
    code: "FORESTRY_MULCHER",
    category: "equipment",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 3.0,
  },
  {
    name: "Chipper Operator",
    code: "CHIPPER",
    category: "equipment",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 1.5,
  },
  {
    name: "Stump Grinder Operator",
    code: "STUMP_GRINDER",
    category: "equipment",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 2.0,
  },
  {
    name: "Forklift Operator",
    code: "FORKLIFT",
    category: "equipment",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 1.0,
  },
];

// ============================================================================
// LICENSE CERTIFICATIONS
// ============================================================================
const LICENSE_CERTIFICATIONS: CertificationData[] = [
  {
    name: "Pesticide Applicator License",
    code: "PESTICIDE_APPLICATOR",
    category: "license",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 2.0,
  },
  {
    name: "State Arborist License",
    code: "STATE_ARBORIST_LICENSE",
    category: "license",
    requiresRenewal: true,
    renewalPeriodMonths: 24,
    hourlyPremium: 3.0,
  },
  {
    name: "Commercial Pesticide Applicator",
    code: "COMMERCIAL_PESTICIDE",
    category: "license",
    requiresRenewal: true,
    renewalPeriodMonths: 36,
    hourlyPremium: 2.5,
  },
  {
    name: "Tree Care License",
    code: "TREE_CARE_LICENSE",
    category: "license",
    requiresRenewal: true,
    renewalPeriodMonths: 12,
    hourlyPremium: 2.0,
  },
];

// Combine all certifications
const ALL_CERTIFICATIONS = [
  ...SAFETY_CERTIFICATIONS,
  ...PROFESSIONAL_CERTIFICATIONS,
  ...EQUIPMENT_CERTIFICATIONS,
  ...LICENSE_CERTIFICATIONS,
];

/**
 * Seed Certifications
 *
 * This mutation creates default certifications if they don't already exist for the company.
 * It's designed to be idempotent - running it multiple times won't create duplicates.
 *
 * The mutation will:
 * 1. Check if certifications already exist for the company
 * 2. If not, create all default certifications including:
 *    - Safety certifications (OSHA, First Aid, etc.)
 *    - Professional certifications (ISA Arborist, TRAQ, etc.)
 *    - Equipment certifications (CDL, Crane, etc.)
 *    - License certifications (Pesticide Applicator, etc.)
 * 3. Return a summary of what was created
 */
export const seedCertifications = mutation({
  args: {
    companyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;

    // Check if certifications already exist for this company
    const existingCertifications = await ctx.db
      .query("certifications")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    if (existingCertifications.length > 0) {
      return {
        success: false,
        message: "Certifications already exist for this company",
        certificationsCreated: 0,
        breakdown: {
          safety: 0,
          professional: 0,
          equipment: 0,
          license: 0,
        },
      };
    }

    let certificationsCreated = 0;
    const breakdown = {
      safety: 0,
      professional: 0,
      equipment: 0,
      license: 0,
    };

    // Create all certifications
    for (const certData of ALL_CERTIFICATIONS) {
      await ctx.db.insert("certifications", {
        companyId,
        name: certData.name,
        code: certData.code,
        category: certData.category,
        requiresRenewal: certData.requiresRenewal,
        renewalPeriodMonths: certData.renewalPeriodMonths,
        hourlyPremium: certData.hourlyPremium,
        isActive: true,
        createdAt: Date.now(),
      });

      certificationsCreated++;
      breakdown[certData.category]++;
    }

    return {
      success: true,
      message: `Successfully seeded ${certificationsCreated} certifications`,
      certificationsCreated,
      breakdown,
    };
  },
});

/**
 * Seed certifications by category
 *
 * Useful for adding only certain types of certifications without seeding everything
 */
export const seedCertificationsByCategory = mutation({
  args: {
    companyId: v.optional(v.string()),
    category: v.union(
      v.literal("safety"),
      v.literal("professional"),
      v.literal("equipment"),
      v.literal("license")
    ),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;

    // Get certifications for the specified category
    let certificationsToCreate: CertificationData[] = [];

    switch (args.category) {
      case "safety":
        certificationsToCreate = SAFETY_CERTIFICATIONS;
        break;
      case "professional":
        certificationsToCreate = PROFESSIONAL_CERTIFICATIONS;
        break;
      case "equipment":
        certificationsToCreate = EQUIPMENT_CERTIFICATIONS;
        break;
      case "license":
        certificationsToCreate = LICENSE_CERTIFICATIONS;
        break;
    }

    // Check if certifications of this category already exist
    const existingCertifications = await ctx.db
      .query("certifications")
      .filter((q) =>
        q.and(
          q.eq(q.field("companyId"), companyId),
          q.eq(q.field("category"), args.category)
        )
      )
      .collect();

    if (existingCertifications.length > 0) {
      return {
        success: false,
        message: `${args.category} certifications already exist for this company`,
        certificationsCreated: 0,
      };
    }

    let certificationsCreated = 0;

    // Create all certifications for this category
    for (const certData of certificationsToCreate) {
      await ctx.db.insert("certifications", {
        companyId,
        name: certData.name,
        code: certData.code,
        category: certData.category,
        requiresRenewal: certData.requiresRenewal,
        renewalPeriodMonths: certData.renewalPeriodMonths,
        hourlyPremium: certData.hourlyPremium,
        isActive: true,
        createdAt: Date.now(),
      });

      certificationsCreated++;
    }

    return {
      success: true,
      message: `Successfully created ${certificationsCreated} ${args.category} certifications`,
      certificationsCreated,
    };
  },
});

/**
 * Get all available certifications
 *
 * Query to see what certifications are available to seed
 */
export const getAvailableCertifications = mutation({
  args: {},
  handler: async () => {
    return {
      safety: SAFETY_CERTIFICATIONS.map((c) => ({
        code: c.code,
        name: c.name,
        hourlyPremium: c.hourlyPremium,
      })),
      professional: PROFESSIONAL_CERTIFICATIONS.map((c) => ({
        code: c.code,
        name: c.name,
        hourlyPremium: c.hourlyPremium,
      })),
      equipment: EQUIPMENT_CERTIFICATIONS.map((c) => ({
        code: c.code,
        name: c.name,
        hourlyPremium: c.hourlyPremium,
      })),
      license: LICENSE_CERTIFICATIONS.map((c) => ({
        code: c.code,
        name: c.name,
        hourlyPremium: c.hourlyPremium,
      })),
    };
  },
});

/**
 * Reset all certifications for a company
 *
 * WARNING: This will delete all existing certifications, then reseed them.
 * This will NOT delete employeeCertifications records, but those will reference deleted certifications.
 * Use with caution!
 */
export const resetCertifications = mutation({
  args: {
    companyId: v.optional(v.string()),
    confirmReset: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.confirmReset) {
      throw new Error("Must confirm reset by passing confirmReset: true");
    }

    const companyId = args.companyId;

    // Delete all existing certifications
    const existingCertifications = await ctx.db
      .query("certifications")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    for (const cert of existingCertifications) {
      await ctx.db.delete(cert._id);
    }

    // Now seed fresh certifications
    let certificationsCreated = 0;
    const breakdown = {
      safety: 0,
      professional: 0,
      equipment: 0,
      license: 0,
    };

    for (const certData of ALL_CERTIFICATIONS) {
      await ctx.db.insert("certifications", {
        companyId,
        name: certData.name,
        code: certData.code,
        category: certData.category,
        requiresRenewal: certData.requiresRenewal,
        renewalPeriodMonths: certData.renewalPeriodMonths,
        hourlyPremium: certData.hourlyPremium,
        isActive: true,
        createdAt: Date.now(),
      });

      certificationsCreated++;
      breakdown[certData.category]++;
    }

    return {
      success: true,
      message: `Successfully reset and seeded ${certificationsCreated} certifications`,
      certificationsCreated,
      breakdown,
      deletedCertifications: existingCertifications.length,
    };
  },
});
