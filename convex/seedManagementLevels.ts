import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed Management Levels
 *
 * This file contains default management levels for the TreeShop employee system.
 * Management levels are stored in the managementLevels table (separate from careerTracks).
 *
 * Management Hierarchy:
 * Level 1: Crew Leader - Leads small crew (2-4 people)
 * Level 2: Crew Supervisor - Supervises multiple crews
 * Level 3: Operations Manager - Manages entire field operations
 * Level 4: Department Director - Directs department operations
 * Level 5: VP Operations - Vice President level
 */

interface ManagementLevelData {
  level: number;
  title: string;
  code: string;
  hourlyPremium: number;
  salaryRange?: string;
  reportsToLevel?: number;
}

// ============================================================================
// MANAGEMENT LEVELS (5 levels of hierarchy)
// ============================================================================
const MANAGEMENT_LEVELS: ManagementLevelData[] = [
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
    // No reportsToLevel - top of the hierarchy
  },
];

/**
 * Seed Management Levels
 *
 * This mutation creates default management levels if they don't already exist for the company.
 * It's designed to be idempotent - running it multiple times won't create duplicates.
 *
 * The mutation will:
 * 1. Check if management levels already exist for the company
 * 2. If not, create all 5 default management levels
 * 3. Return a summary of what was created
 */
export const seedManagementLevels = mutation({
  args: {
    companyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;

    // Check if management levels already exist for this company
    const existingLevels = await ctx.db
      .query("managementLevels")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    if (existingLevels.length > 0) {
      return {
        success: false,
        message: "Management levels already exist for this company",
        levelsCreated: 0,
        levels: [],
      };
    }

    let levelsCreated = 0;
    const createdLevels: Array<{
      level: number;
      title: string;
      code: string;
      hourlyPremium: number;
    }> = [];

    // Create all management levels
    for (const levelData of MANAGEMENT_LEVELS) {
      await ctx.db.insert("managementLevels", {
        companyId,
        level: levelData.level,
        title: levelData.title,
        code: levelData.code,
        hourlyPremium: levelData.hourlyPremium,
        salaryRange: levelData.salaryRange,
        reportsToLevel: levelData.reportsToLevel,
        isActive: true,
        createdAt: Date.now(),
      });

      levelsCreated++;
      createdLevels.push({
        level: levelData.level,
        title: levelData.title,
        code: levelData.code,
        hourlyPremium: levelData.hourlyPremium,
      });
    }

    return {
      success: true,
      message: `Successfully seeded ${levelsCreated} management levels`,
      levelsCreated,
      levels: createdLevels,
    };
  },
});

/**
 * Get all available management levels
 *
 * Query to see what management levels are available to seed
 */
export const getAvailableManagementLevels = mutation({
  args: {},
  handler: async () => {
    return MANAGEMENT_LEVELS.map((l) => ({
      level: l.level,
      title: l.title,
      code: l.code,
      hourlyPremium: l.hourlyPremium,
      salaryRange: l.salaryRange,
      reportsToLevel: l.reportsToLevel,
    }));
  },
});

/**
 * Reset all management levels for a company
 *
 * WARNING: This will delete all existing management levels, then reseed them.
 * This will affect any employees assigned to these levels.
 * Use with caution!
 */
export const resetManagementLevels = mutation({
  args: {
    companyId: v.optional(v.string()),
    confirmReset: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.confirmReset) {
      throw new Error("Must confirm reset by passing confirmReset: true");
    }

    const companyId = args.companyId;

    // Delete all existing management levels
    const existingLevels = await ctx.db
      .query("managementLevels")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    for (const level of existingLevels) {
      await ctx.db.delete(level._id);
    }

    // Now seed fresh management levels
    let levelsCreated = 0;
    const createdLevels: Array<{
      level: number;
      title: string;
      code: string;
      hourlyPremium: number;
    }> = [];

    for (const levelData of MANAGEMENT_LEVELS) {
      await ctx.db.insert("managementLevels", {
        companyId,
        level: levelData.level,
        title: levelData.title,
        code: levelData.code,
        hourlyPremium: levelData.hourlyPremium,
        salaryRange: levelData.salaryRange,
        reportsToLevel: levelData.reportsToLevel,
        isActive: true,
        createdAt: Date.now(),
      });

      levelsCreated++;
      createdLevels.push({
        level: levelData.level,
        title: levelData.title,
        code: levelData.code,
        hourlyPremium: levelData.hourlyPremium,
      });
    }

    return {
      success: true,
      message: `Successfully reset and seeded ${levelsCreated} management levels`,
      levelsCreated,
      levels: createdLevels,
      deletedLevels: existingLevels.length,
    };
  },
});

/**
 * Seed a single management level
 *
 * Useful for adding individual levels without seeding everything
 */
export const seedSingleManagementLevel = mutation({
  args: {
    companyId: v.optional(v.string()),
    level: v.number(),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;
    const levelData = MANAGEMENT_LEVELS.find((l) => l.level === args.level);

    if (!levelData) {
      throw new Error(`Management level ${args.level} not found in default data`);
    }

    // Check if level already exists
    const existing = await ctx.db
      .query("managementLevels")
      .filter((q) =>
        q.and(
          q.eq(q.field("companyId"), companyId),
          q.eq(q.field("level"), args.level)
        )
      )
      .first();

    if (existing) {
      return {
        success: false,
        message: `Management level ${args.level} already exists`,
        levelId: existing._id,
      };
    }

    // Create the management level
    const levelId = await ctx.db.insert("managementLevels", {
      companyId,
      level: levelData.level,
      title: levelData.title,
      code: levelData.code,
      hourlyPremium: levelData.hourlyPremium,
      salaryRange: levelData.salaryRange,
      reportsToLevel: levelData.reportsToLevel,
      isActive: true,
      createdAt: Date.now(),
    });

    return {
      success: true,
      message: `Successfully created management level: ${levelData.title}`,
      levelId,
      level: {
        level: levelData.level,
        title: levelData.title,
        code: levelData.code,
        hourlyPremium: levelData.hourlyPremium,
      },
    };
  },
});
