/**
 * Admin utilities for seeding and managing data
 * These are public mutations that can be called from the app or CLI
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Management Levels Data
const MANAGEMENT_LEVELS = [
  { level: 1, title: "Crew Leader", code: "CREW_LEAD", hourlyPremium: 3.0, salaryRange: "$45,000 - $55,000", reportsToLevel: 2 },
  { level: 2, title: "Crew Supervisor", code: "CREW_SUPER", hourlyPremium: 7.0, salaryRange: "$55,000 - $70,000", reportsToLevel: 3 },
  { level: 3, title: "Operations Manager", code: "OPS_MGR", hourlyPremium: 15.0, salaryRange: "$70,000 - $90,000", reportsToLevel: 4 },
  { level: 4, title: "Department Director", code: "DEPT_DIR", hourlyPremium: 25.0, salaryRange: "$90,000 - $120,000", reportsToLevel: 5 },
  { level: 5, title: "VP Operations", code: "VP_OPS", hourlyPremium: 40.0, salaryRange: "$120,000 - $160,000" },
];

// Certifications Data
const CERTIFICATIONS = [
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

export const seedManagementLevels = mutation({
  args: { companyId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("managementLevels")
      .filter((q) => q.eq(q.field("companyId"), args.companyId))
      .collect();

    if (existing.length > 0) {
      return { success: false, message: "Already seeded", count: existing.length };
    }

    for (const level of MANAGEMENT_LEVELS) {
      await ctx.db.insert("managementLevels", {
        companyId: args.companyId,
        ...level,
        isActive: true,
        createdAt: Date.now(),
      });
    }

    return { success: true, message: `Seeded ${MANAGEMENT_LEVELS.length} levels`, count: MANAGEMENT_LEVELS.length };
  },
});

export const seedCertifications = mutation({
  args: { companyId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("certifications")
      .filter((q) => q.eq(q.field("companyId"), args.companyId))
      .collect();

    if (existing.length > 0) {
      return { success: false, message: "Already seeded", count: existing.length };
    }

    for (const cert of CERTIFICATIONS) {
      await ctx.db.insert("certifications", {
        companyId: args.companyId,
        ...cert,
        isActive: true,
        createdAt: Date.now(),
      });
    }

    return { success: true, message: `Seeded ${CERTIFICATIONS.length} certifications`, count: CERTIFICATIONS.length };
  },
});

export const seedAllEmployeeData = mutation({
  args: { companyId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const results = {
      managementLevels: { success: false, count: 0 },
      certifications: { success: false, count: 0 },
    };

    // Seed management levels
    const mgmt = await ctx.db
      .query("managementLevels")
      .filter((q) => q.eq(q.field("companyId"), args.companyId))
      .collect();

    if (mgmt.length === 0) {
      for (const level of MANAGEMENT_LEVELS) {
        await ctx.db.insert("managementLevels", {
          companyId: args.companyId,
          ...level,
          isActive: true,
          createdAt: Date.now(),
        });
      }
      results.managementLevels = { success: true, count: MANAGEMENT_LEVELS.length };
    }

    // Seed certifications
    const certs = await ctx.db
      .query("certifications")
      .filter((q) => q.eq(q.field("companyId"), args.companyId))
      .collect();

    if (certs.length === 0) {
      for (const cert of CERTIFICATIONS) {
        await ctx.db.insert("certifications", {
          companyId: args.companyId,
          ...cert,
          isActive: true,
          createdAt: Date.now(),
        });
      }
      results.certifications = { success: true, count: CERTIFICATIONS.length };
    }

    return {
      success: true,
      message: "Seeding complete",
      results,
    };
  },
});
