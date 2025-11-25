/**
 * Public Seed Data Mutations
 *
 * These mutations can be run from the Convex dashboard or CLI
 * to seed initial data for a company.
 *
 * Usage from CLI:
 * npx convex run seedData:seedAllForCompany '{"companyId": "org_xxxxx"}'
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Management Levels Data
const MANAGEMENT_LEVELS = [
  {
    level: 1,
    title: "Crew Leader",
    code: "CREW_LEAD",
    hourlyPremium: 3.0,
    salaryRange: "$45,000 - $55,000",
    reportsToLevel: 2,
  },
  {
    level: 2,
    title: "Crew Supervisor",
    code: "CREW_SUPER",
    hourlyPremium: 7.0,
    salaryRange: "$55,000 - $70,000",
    reportsToLevel: 3,
  },
  {
    level: 3,
    title: "Operations Manager",
    code: "OPS_MGR",
    hourlyPremium: 15.0,
    salaryRange: "$70,000 - $90,000",
    reportsToLevel: 4,
  },
  {
    level: 4,
    title: "Department Director",
    code: "DEPT_DIR",
    hourlyPremium: 25.0,
    salaryRange: "$90,000 - $120,000",
    reportsToLevel: 5,
  },
  {
    level: 5,
    title: "VP Operations",
    code: "VP_OPS",
    hourlyPremium: 40.0,
    salaryRange: "$120,000 - $160,000",
  },
];

// Certifications Data
const CERTIFICATIONS = [
  // Safety
  { name: "OSHA 10-Hour Safety", code: "OSHA_10", category: "safety", requiresRenewal: false, hourlyPremium: 1.0 },
  { name: "OSHA 30-Hour Safety", code: "OSHA_30", category: "safety", requiresRenewal: false, hourlyPremium: 2.0 },
  { name: "First Aid & CPR", code: "FIRST_AID_CPR", category: "safety", requiresRenewal: true, renewalPeriodMonths: 24, hourlyPremium: 0.5 },
  { name: "Aerial Lift Operator", code: "AERIAL_LIFT", category: "safety", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 1.5 },
  { name: "Confined Space Entry", code: "CONFINED_SPACE", category: "safety", requiresRenewal: true, renewalPeriodMonths: 12, hourlyPremium: 1.0 },
  { name: "Fall Protection Competent Person", code: "FALL_PROTECTION", category: "safety", requiresRenewal: true, renewalPeriodMonths: 24, hourlyPremium: 1.5 },
  { name: "Hazmat Awareness", code: "HAZMAT", category: "safety", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 1.0 },

  // Professional
  { name: "ISA Certified Arborist", code: "ISA_CERTIFIED_ARBORIST", category: "professional", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 4.0 },
  { name: "ISA Tree Worker Climber Specialist", code: "ISA_TREE_WORKER", category: "professional", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 3.0 },
  { name: "ISA Board Certified Master Arborist", code: "ISA_MASTER_ARBORIST", category: "professional", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 6.0 },
  { name: "ASCA Registered Consulting Arborist", code: "ASCA_CONSULTING_ARBORIST", category: "professional", requiresRenewal: true, renewalPeriodMonths: 12, hourlyPremium: 5.0 },
  { name: "ISA Utility Specialist", code: "ISA_UTILITY_SPECIALIST", category: "professional", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 3.0 },
  { name: "Tree Risk Assessment Qualification (TRAQ)", code: "TRAQ", category: "professional", requiresRenewal: true, renewalPeriodMonths: 60, hourlyPremium: 4.0 },

  // Equipment
  { name: "CDL Class A", code: "CDL_A", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 60, hourlyPremium: 3.0 },
  { name: "CDL Class B", code: "CDL_B", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 60, hourlyPremium: 2.5 },
  { name: "Crane Operator Certification", code: "CRANE_OPERATOR", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 60, hourlyPremium: 4.0 },
  { name: "Skid Steer Operator", code: "SKID_STEER", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 1.5 },
  { name: "Excavator Operator", code: "EXCAVATOR", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 2.0 },
  { name: "Forestry Mulcher Operator", code: "FORESTRY_MULCHER", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 3.0 },
  { name: "Chipper Operator", code: "CHIPPER", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 1.5 },
  { name: "Stump Grinder Operator", code: "STUMP_GRINDER", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 2.0 },
  { name: "Forklift Operator", code: "FORKLIFT", category: "equipment", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 1.0 },

  // License
  { name: "Pesticide Applicator License", code: "PESTICIDE_APPLICATOR", category: "license", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 2.0 },
  { name: "State Arborist License", code: "STATE_ARBORIST_LICENSE", category: "license", requiresRenewal: true, renewalPeriodMonths: 24, hourlyPremium: 3.0 },
  { name: "Commercial Pesticide Applicator", code: "COMMERCIAL_PESTICIDE", category: "license", requiresRenewal: true, renewalPeriodMonths: 36, hourlyPremium: 2.5 },
  { name: "Tree Care License", code: "TREE_CARE_LICENSE", category: "license", requiresRenewal: true, renewalPeriodMonths: 12, hourlyPremium: 2.0 },
] as const;

/**
 * Seed Management Levels
 */
export const seedManagementLevelsForCompany = mutation({
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

    // Seed management levels
    for (const level of MANAGEMENT_LEVELS) {
      await ctx.db.insert("managementLevels", {
        companyId,
        ...level,
        isActive: true,
        createdAt: Date.now(),
      });
    }

    return {
      success: true,
      message: `Seeded ${MANAGEMENT_LEVELS.length} management levels`,
      count: MANAGEMENT_LEVELS.length,
    };
  },
});

/**
 * Seed Certifications
 */
export const seedCertificationsForCompany = mutation({
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

    // Seed certifications
    for (const cert of CERTIFICATIONS) {
      await ctx.db.insert("certifications", {
        companyId,
        ...cert,
        isActive: true,
        createdAt: Date.now(),
      });
    }

    return {
      success: true,
      message: `Seeded ${CERTIFICATIONS.length} certifications`,
      count: CERTIFICATIONS.length,
    };
  },
});

/**
 * Seed All Employee Data (Management Levels + Certifications)
 */
export const seedAllForCompany = mutation({
  args: {
    companyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = {
      managementLevels: { success: false, count: 0 },
      certifications: { success: false, count: 0 },
    };

    // Seed management levels
    const existingLevels = await ctx.db
      .query("managementLevels")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    if (existingLevels.length === 0) {
      for (const level of MANAGEMENT_LEVELS) {
        await ctx.db.insert("managementLevels", {
          companyId,
          ...level,
          isActive: true,
          createdAt: Date.now(),
        });
      }
      results.managementLevels = { success: true, count: MANAGEMENT_LEVELS.length };
    } else {
      results.managementLevels = { success: false, message: "Already exists", count: existingLevels.length };
    }

    // Seed certifications
    const existingCerts = await ctx.db
      .query("certifications")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    if (existingCerts.length === 0) {
      for (const cert of CERTIFICATIONS) {
        await ctx.db.insert("certifications", {
          companyId,
          ...cert,
          isActive: true,
          createdAt: Date.now(),
        });
      }
      results.certifications = { success: true, count: CERTIFICATIONS.length };
    } else {
      results.certifications = { success: false, message: "Already exists", count: existingCerts.length };
    }

    return {
      success: true,
      message: "Seeding complete",
      results,
    };
  },
});
