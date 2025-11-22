import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed Employee Career System
 *
 * This file contains default career tracks, management levels, and certifications
 * for the TreeShop employee qualification system.
 *
 * Career Track Types:
 * - Technical: Field positions (Climber, Ground Crew, Equipment Operator, etc.)
 * - Professional: Office/consulting positions (Estimator, Project Manager, ISA Certified Arborist, etc.)
 * - Safety: Safety-focused roles (Safety Officer, OSHA Trainer, First Responder)
 * - Management: Leadership levels (Crew Leader through C-Suite)
 */

// Define career track structure
interface CareerTrackData {
  trackType: "technical" | "professional" | "safety" | "management";
  code: string;
  name: string;
  description: string;
  hourlyPremium?: number;
  requiresCertification: boolean;
  sortOrder: number;
}

// ============================================================================
// TECHNICAL CAREER TRACKS
// ============================================================================
const TECHNICAL_TRACKS: CareerTrackData[] = [
  {
    trackType: "technical",
    code: "CLIMBER",
    name: "Climber",
    description: "Tree climbing specialist for pruning, removal, and aerial work",
    requiresCertification: false,
    sortOrder: 1,
  },
  {
    trackType: "technical",
    code: "GROUND_CREW",
    name: "Ground Crew",
    description: "Ground support for tree work, including cleanup and equipment handling",
    requiresCertification: false,
    sortOrder: 2,
  },
  {
    trackType: "technical",
    code: "EQUIPMENT_OP",
    name: "Equipment Operator",
    description: "Operator of heavy equipment including skid steers, excavators, and loaders",
    requiresCertification: false,
    sortOrder: 3,
  },
  {
    trackType: "technical",
    code: "TREE_REMOVAL",
    name: "Tree Removal Specialist",
    description: "Specialist in safe and efficient tree removal operations",
    requiresCertification: false,
    sortOrder: 4,
  },
  {
    trackType: "technical",
    code: "ARBORIST",
    name: "Arborist",
    description: "Certified arborist with expertise in tree health, care, and management",
    requiresCertification: true,
    sortOrder: 5,
  },
  {
    trackType: "technical",
    code: "SAFETY_SPOTTER",
    name: "Safety Spotter",
    description: "Dedicated safety observer for high-risk operations",
    requiresCertification: false,
    sortOrder: 6,
  },
  {
    trackType: "technical",
    code: "MECHANIC",
    name: "Mechanic",
    description: "Equipment maintenance and repair specialist",
    requiresCertification: false,
    sortOrder: 7,
  },
];

// ============================================================================
// PROFESSIONAL CAREER TRACKS
// ============================================================================
const PROFESSIONAL_TRACKS: CareerTrackData[] = [
  {
    trackType: "professional",
    code: "ESTIMATOR",
    name: "Estimator",
    description: "Prepares cost estimates and proposals for tree service projects",
    requiresCertification: false,
    sortOrder: 1,
  },
  {
    trackType: "professional",
    code: "PROJECT_MGR",
    name: "Project Manager",
    description: "Manages project execution, scheduling, and customer communication",
    requiresCertification: false,
    sortOrder: 2,
  },
  {
    trackType: "professional",
    code: "ISA_CERT_ARB",
    name: "ISA Certified Arborist",
    description: "ISA certified professional arborist with advanced tree care knowledge",
    requiresCertification: true,
    sortOrder: 3,
  },
  {
    trackType: "professional",
    code: "CONSULTING_ARB",
    name: "Consulting Arborist",
    description: "Expert-level arborist providing consulting services and reports",
    requiresCertification: true,
    sortOrder: 4,
  },
];

// ============================================================================
// SAFETY CAREER TRACKS
// ============================================================================
const SAFETY_TRACKS: CareerTrackData[] = [
  {
    trackType: "safety",
    code: "SAFETY_OFFICER",
    name: "Safety Officer",
    description: "Oversees job site safety compliance and training",
    requiresCertification: true,
    sortOrder: 1,
  },
  {
    trackType: "safety",
    code: "OSHA_TRAINER",
    name: "OSHA Trainer",
    description: "Certified to provide OSHA safety training to employees",
    requiresCertification: true,
    sortOrder: 2,
  },
  {
    trackType: "safety",
    code: "FIRST_RESPONDER",
    name: "First Responder",
    description: "Emergency medical first responder for job site incidents",
    requiresCertification: true,
    sortOrder: 3,
  },
];

// ============================================================================
// MANAGEMENT LEVELS
// ============================================================================
const MANAGEMENT_LEVELS: CareerTrackData[] = [
  {
    trackType: "management",
    code: "CREW_LEADER",
    name: "Crew Leader",
    description: "Leads small crew (2-4 people), responsible for daily job execution",
    hourlyPremium: 3.0,
    requiresCertification: false,
    sortOrder: 1,
  },
  {
    trackType: "management",
    code: "CREW_SUPERVISOR",
    name: "Crew Supervisor",
    description: "Supervises multiple crews, coordinates scheduling and resources",
    hourlyPremium: 7.0,
    requiresCertification: false,
    sortOrder: 2,
  },
  {
    trackType: "management",
    code: "OPS_MANAGER",
    name: "Operations Manager",
    description: "Manages entire field operations, oversees all crews and projects",
    hourlyPremium: 15.0,
    requiresCertification: false,
    sortOrder: 3,
  },
  {
    trackType: "management",
    code: "DEPT_DIRECTOR",
    name: "Department Director",
    description: "Directs department operations, strategic planning, and budgeting",
    hourlyPremium: 25.0,
    requiresCertification: false,
    sortOrder: 4,
  },
  {
    trackType: "management",
    code: "VP_OPS",
    name: "VP Operations",
    description: "Vice President overseeing all operational divisions",
    hourlyPremium: 40.0,
    requiresCertification: false,
    sortOrder: 5,
  },
  {
    trackType: "management",
    code: "C_SUITE",
    name: "C-Suite (CEO/CFO/COO)",
    description: "Executive leadership - CEO, CFO, or COO",
    hourlyPremium: 60.0,
    requiresCertification: false,
    sortOrder: 6,
  },
];

// ============================================================================
// CERTIFICATIONS (represented as career tracks requiring certification)
// ============================================================================
const CERTIFICATIONS: CareerTrackData[] = [
  // Safety Certifications
  {
    trackType: "safety",
    code: "CERT_OSHA_10",
    name: "OSHA 10",
    description: "OSHA 10-hour safety certification for construction industry",
    requiresCertification: true,
    sortOrder: 10,
  },
  {
    trackType: "safety",
    code: "CERT_OSHA_30",
    name: "OSHA 30",
    description: "OSHA 30-hour safety certification for supervisors and foremen",
    requiresCertification: true,
    sortOrder: 11,
  },
  {
    trackType: "safety",
    code: "CERT_FIRST_AID",
    name: "First Aid/CPR",
    description: "First Aid and CPR certification",
    requiresCertification: true,
    sortOrder: 12,
  },
  {
    trackType: "safety",
    code: "CERT_AERIAL_LIFT",
    name: "Aerial Lift",
    description: "Aerial lift operation certification",
    requiresCertification: true,
    sortOrder: 13,
  },

  // Professional Certifications
  {
    trackType: "professional",
    code: "CERT_ISA_ARB",
    name: "ISA Certified Arborist",
    description: "International Society of Arboriculture Certified Arborist",
    requiresCertification: true,
    sortOrder: 20,
  },
  {
    trackType: "professional",
    code: "CERT_ISA_TREE_WORKER",
    name: "ISA Tree Worker",
    description: "ISA Tree Worker Climber Specialist certification",
    requiresCertification: true,
    sortOrder: 21,
  },
  {
    trackType: "professional",
    code: "CERT_CONSULTING_ARB",
    name: "Consulting Arborist",
    description: "ASCA Registered Consulting Arborist credential",
    requiresCertification: true,
    sortOrder: 22,
  },

  // Equipment Certifications
  {
    trackType: "technical",
    code: "CERT_CRANE_OP",
    name: "Crane Operator",
    description: "Certified crane operator license",
    requiresCertification: true,
    sortOrder: 30,
  },
  {
    trackType: "technical",
    code: "CERT_CDL_A",
    name: "CDL Class A",
    description: "Commercial Driver's License Class A",
    requiresCertification: true,
    sortOrder: 31,
  },
  {
    trackType: "technical",
    code: "CERT_CDL_B",
    name: "CDL Class B",
    description: "Commercial Driver's License Class B",
    requiresCertification: true,
    sortOrder: 32,
  },
  {
    trackType: "technical",
    code: "CERT_SKID_STEER",
    name: "Skid Steer",
    description: "Skid steer operator certification",
    requiresCertification: true,
    sortOrder: 33,
  },
  {
    trackType: "technical",
    code: "CERT_EXCAVATOR",
    name: "Excavator",
    description: "Excavator operator certification",
    requiresCertification: true,
    sortOrder: 34,
  },

  // License Certifications
  {
    trackType: "professional",
    code: "CERT_PEST_APPLIC",
    name: "Pesticide Applicator",
    description: "Licensed pesticide applicator certification",
    requiresCertification: true,
    sortOrder: 40,
  },
  {
    trackType: "professional",
    code: "CERT_ARB_LICENSE",
    name: "Arborist License",
    description: "State-issued arborist license",
    requiresCertification: true,
    sortOrder: 41,
  },
];

// Combine all tracks
const ALL_CAREER_TRACKS = [
  ...TECHNICAL_TRACKS,
  ...PROFESSIONAL_TRACKS,
  ...SAFETY_TRACKS,
  ...MANAGEMENT_LEVELS,
  ...CERTIFICATIONS,
];

/**
 * Seed Employee Career Tracks
 *
 * This mutation creates default career tracks, management levels, and certifications
 * if they don't already exist for the company.
 *
 * It's designed to be idempotent - running it multiple times won't create duplicates.
 *
 * The mutation will:
 * 1. Check if career tracks already exist for the company
 * 2. If not, create all default career tracks including:
 *    - Technical positions
 *    - Professional positions
 *    - Safety positions
 *    - Management levels
 *    - Certifications
 * 3. Return a summary of what was created
 */
export const seedEmployeeCareers = mutation({
  args: {
    companyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;

    // Check if career tracks already exist for this company
    const existingTracks = await ctx.db
      .query("careerTracks")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    if (existingTracks.length > 0) {
      return {
        success: false,
        message: "Career tracks already exist for this company",
        tracksCreated: 0,
        breakdown: {
          technical: 0,
          professional: 0,
          safety: 0,
          management: 0,
          certifications: 0,
        },
      };
    }

    let tracksCreated = 0;
    const breakdown = {
      technical: 0,
      professional: 0,
      safety: 0,
      management: 0,
      certifications: 0,
    };

    // Create all career tracks
    for (const trackData of ALL_CAREER_TRACKS) {
      await ctx.db.insert("careerTracks", {
        companyId,
        trackType: trackData.trackType,
        code: trackData.code,
        name: trackData.name,
        description: trackData.description,
        hourlyPremium: trackData.hourlyPremium,
        requiresCertification: trackData.requiresCertification,
        sortOrder: trackData.sortOrder,
        isActive: true,
        createdAt: Date.now(),
      });

      tracksCreated++;

      // Track breakdown by type
      if (trackData.trackType === "technical") {
        if (trackData.code.startsWith("CERT_")) {
          breakdown.certifications++;
        } else {
          breakdown.technical++;
        }
      } else if (trackData.trackType === "professional") {
        if (trackData.code.startsWith("CERT_")) {
          breakdown.certifications++;
        } else {
          breakdown.professional++;
        }
      } else if (trackData.trackType === "safety") {
        if (trackData.code.startsWith("CERT_")) {
          breakdown.certifications++;
        } else {
          breakdown.safety++;
        }
      } else if (trackData.trackType === "management") {
        breakdown.management++;
      }
    }

    return {
      success: true,
      message: `Successfully seeded ${tracksCreated} career tracks`,
      tracksCreated,
      breakdown,
    };
  },
});

/**
 * Seed a specific track type
 *
 * Useful for adding only certain types of tracks without seeding everything
 */
export const seedTracksByType = mutation({
  args: {
    companyId: v.optional(v.string()),
    trackType: v.union(
      v.literal("technical"),
      v.literal("professional"),
      v.literal("safety"),
      v.literal("management")
    ),
    includeCertifications: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;
    const includeCertifications = args.includeCertifications ?? false;

    // Get tracks for the specified type
    let tracksToCreate: CareerTrackData[] = [];

    switch (args.trackType) {
      case "technical":
        tracksToCreate = [...TECHNICAL_TRACKS];
        if (includeCertifications) {
          tracksToCreate.push(
            ...CERTIFICATIONS.filter((c) => c.trackType === "technical")
          );
        }
        break;
      case "professional":
        tracksToCreate = [...PROFESSIONAL_TRACKS];
        if (includeCertifications) {
          tracksToCreate.push(
            ...CERTIFICATIONS.filter((c) => c.trackType === "professional")
          );
        }
        break;
      case "safety":
        tracksToCreate = [...SAFETY_TRACKS];
        if (includeCertifications) {
          tracksToCreate.push(
            ...CERTIFICATIONS.filter((c) => c.trackType === "safety")
          );
        }
        break;
      case "management":
        tracksToCreate = [...MANAGEMENT_LEVELS];
        break;
    }

    // Check if tracks already exist
    const existingTracks = await ctx.db
      .query("careerTracks")
      .filter((q) =>
        q.and(
          q.eq(q.field("companyId"), companyId),
          q.eq(q.field("trackType"), args.trackType)
        )
      )
      .collect();

    if (existingTracks.length > 0) {
      return {
        success: false,
        message: `${args.trackType} tracks already exist for this company`,
        tracksCreated: 0,
      };
    }

    let tracksCreated = 0;

    // Create all tracks for this type
    for (const trackData of tracksToCreate) {
      await ctx.db.insert("careerTracks", {
        companyId,
        trackType: trackData.trackType,
        code: trackData.code,
        name: trackData.name,
        description: trackData.description,
        hourlyPremium: trackData.hourlyPremium,
        requiresCertification: trackData.requiresCertification,
        sortOrder: trackData.sortOrder,
        isActive: true,
        createdAt: Date.now(),
      });

      tracksCreated++;
    }

    return {
      success: true,
      message: `Successfully created ${tracksCreated} ${args.trackType} tracks`,
      tracksCreated,
    };
  },
});

/**
 * Seed only management levels
 *
 * Quick mutation to add just the 6 management levels
 */
export const seedManagementLevels = mutation({
  args: {
    companyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;

    // Check if management levels already exist
    const existingManagement = await ctx.db
      .query("careerTracks")
      .filter((q) =>
        q.and(
          q.eq(q.field("companyId"), companyId),
          q.eq(q.field("trackType"), "management")
        )
      )
      .collect();

    if (existingManagement.length > 0) {
      return {
        success: false,
        message: "Management levels already exist for this company",
        levelsCreated: 0,
      };
    }

    let levelsCreated = 0;

    // Create all management levels
    for (const level of MANAGEMENT_LEVELS) {
      await ctx.db.insert("careerTracks", {
        companyId,
        trackType: level.trackType,
        code: level.code,
        name: level.name,
        description: level.description,
        hourlyPremium: level.hourlyPremium,
        requiresCertification: level.requiresCertification,
        sortOrder: level.sortOrder,
        isActive: true,
        createdAt: Date.now(),
      });

      levelsCreated++;
    }

    return {
      success: true,
      message: `Successfully created ${levelsCreated} management levels`,
      levelsCreated,
      levels: MANAGEMENT_LEVELS.map((l) => ({
        name: l.name,
        hourlyPremium: l.hourlyPremium,
      })),
    };
  },
});

/**
 * Seed only certifications
 *
 * Quick mutation to add just the certification tracks
 */
export const seedCertifications = mutation({
  args: {
    companyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;

    // Check if certifications already exist (look for codes starting with CERT_)
    const existingCertifications = await ctx.db
      .query("careerTracks")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    const hasCertifications = existingCertifications.some((t) =>
      t.code.startsWith("CERT_")
    );

    if (hasCertifications) {
      return {
        success: false,
        message: "Certifications already exist for this company",
        certificationsCreated: 0,
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
    for (const cert of CERTIFICATIONS) {
      await ctx.db.insert("careerTracks", {
        companyId,
        trackType: cert.trackType,
        code: cert.code,
        name: cert.name,
        description: cert.description,
        hourlyPremium: cert.hourlyPremium,
        requiresCertification: cert.requiresCertification,
        sortOrder: cert.sortOrder,
        isActive: true,
        createdAt: Date.now(),
      });

      certificationsCreated++;

      // Track breakdown
      if (cert.code.includes("OSHA") || cert.code.includes("FIRST_AID") || cert.code.includes("AERIAL")) {
        breakdown.safety++;
      } else if (cert.code.includes("ISA") || cert.code.includes("CONSULTING") || cert.code.includes("PEST") || cert.code.includes("ARB_LICENSE")) {
        breakdown.professional++;
      } else if (cert.code.includes("CRANE") || cert.code.includes("CDL") || cert.code.includes("SKID") || cert.code.includes("EXCAVATOR")) {
        breakdown.equipment++;
      } else {
        breakdown.license++;
      }
    }

    return {
      success: true,
      message: `Successfully created ${certificationsCreated} certifications`,
      certificationsCreated,
      breakdown,
    };
  },
});

/**
 * Get all available career track codes and names
 *
 * Query to see what tracks are available to seed
 */
export const getAvailableCareerTracks = mutation({
  args: {},
  handler: async () => {
    return {
      technical: TECHNICAL_TRACKS.map((t) => ({ code: t.code, name: t.name })),
      professional: PROFESSIONAL_TRACKS.map((t) => ({ code: t.code, name: t.name })),
      safety: SAFETY_TRACKS.map((t) => ({ code: t.code, name: t.name })),
      management: MANAGEMENT_LEVELS.map((t) => ({
        code: t.code,
        name: t.name,
        hourlyPremium: t.hourlyPremium,
      })),
      certifications: CERTIFICATIONS.map((t) => ({ code: t.code, name: t.name })),
    };
  },
});

/**
 * Reset all career tracks for a company
 *
 * WARNING: This will delete all existing career tracks, then reseed them.
 * This will NOT delete employeeSkills records, but those will reference deleted tracks.
 * Use with caution!
 */
export const resetEmployeeCareers = mutation({
  args: {
    companyId: v.optional(v.string()),
    confirmReset: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.confirmReset) {
      throw new Error("Must confirm reset by passing confirmReset: true");
    }

    const companyId = args.companyId;

    // Delete all existing career tracks
    const existingTracks = await ctx.db
      .query("careerTracks")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    for (const track of existingTracks) {
      await ctx.db.delete(track._id);
    }

    // Now seed fresh career tracks
    let tracksCreated = 0;
    const breakdown = {
      technical: 0,
      professional: 0,
      safety: 0,
      management: 0,
      certifications: 0,
    };

    for (const trackData of ALL_CAREER_TRACKS) {
      await ctx.db.insert("careerTracks", {
        companyId,
        trackType: trackData.trackType,
        code: trackData.code,
        name: trackData.name,
        description: trackData.description,
        hourlyPremium: trackData.hourlyPremium,
        requiresCertification: trackData.requiresCertification,
        sortOrder: trackData.sortOrder,
        isActive: true,
        createdAt: Date.now(),
      });

      tracksCreated++;

      // Track breakdown by type
      if (trackData.trackType === "technical") {
        if (trackData.code.startsWith("CERT_")) {
          breakdown.certifications++;
        } else {
          breakdown.technical++;
        }
      } else if (trackData.trackType === "professional") {
        if (trackData.code.startsWith("CERT_")) {
          breakdown.certifications++;
        } else {
          breakdown.professional++;
        }
      } else if (trackData.trackType === "safety") {
        if (trackData.code.startsWith("CERT_")) {
          breakdown.certifications++;
        } else {
          breakdown.safety++;
        }
      } else if (trackData.trackType === "management") {
        breakdown.management++;
      }
    }

    return {
      success: true,
      message: `Successfully reset and seeded ${tracksCreated} career tracks`,
      tracksCreated,
      breakdown,
      deletedTracks: existingTracks.length,
    };
  },
});
