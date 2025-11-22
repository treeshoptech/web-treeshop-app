import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed Equipment Categories and Types
 *
 * This file contains default equipment categories and types for the TreeShop system.
 * Categories are top-level groupings (HEAVY, MIDSIZE, TRUCKS, etc.)
 * Types are specific equipment types within each category.
 */

// Define category structure
interface CategoryData {
  code: string;
  name: string;
  sortOrder: number;
  types: {
    name: string;
    code: string;
    defaultUsefulLife?: number;
    defaultOperatingHours?: number;
    requiresFuelTracking: boolean;
  }[];
}

// Default equipment categories and their types
const DEFAULT_CATEGORIES: CategoryData[] = [
  {
    code: "HEAVY",
    name: "Heavy Equipment",
    sortOrder: 1,
    types: [
      { name: "Excavator", code: "EXCAVATOR", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Bulldozer", code: "BULLDOZER", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Track Loader", code: "TRACK_LOADER", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Forestry Mulcher", code: "FORESTRY_MULCHER", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Wheel Loader", code: "WHEEL_LOADER", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Motor Grader", code: "MOTOR_GRADER", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Backhoe", code: "BACKHOE", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Scraper", code: "SCRAPER", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Compactor", code: "COMPACTOR", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Trencher (Riding)", code: "TRENCHER_RIDING", defaultUsefulLife: 10, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Forklift (Heavy)", code: "FORKLIFT_HEAVY", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Telehandler", code: "TELEHANDLER", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: true },
    ],
  },
  {
    code: "MIDSIZE",
    name: "Mid-Size Equipment",
    sortOrder: 2,
    types: [
      { name: "Skid Steer", code: "SKID_STEER", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Mini Excavator", code: "MINI_EXCAVATOR", defaultUsefulLife: 10, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Compact Track Loader", code: "COMPACT_TRACK_LOADER", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Stump Grinder", code: "STUMP_GRINDER", defaultUsefulLife: 8, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Wood Chipper", code: "WOOD_CHIPPER", defaultUsefulLife: 10, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Tub Grinder", code: "TUB_GRINDER", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Log Loader", code: "LOG_LOADER", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Compact Wheel Loader", code: "COMPACT_WHEEL_LOADER", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Articulated Loader", code: "ARTICULATED_LOADER", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Trencher (Walk-Behind)", code: "TRENCHER_WALK", defaultUsefulLife: 8, defaultOperatingHours: 1000, requiresFuelTracking: true },
      { name: "Forklift (Standard)", code: "FORKLIFT_STANDARD", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Tractor (Utility)", code: "TRACTOR_UTILITY", defaultUsefulLife: 12, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Brush Cutter (Riding)", code: "BRUSH_CUTTER_RIDING", defaultUsefulLife: 8, defaultOperatingHours: 1000, requiresFuelTracking: true },
    ],
  },
  {
    code: "TRUCKS",
    name: "Trucks & Vehicles",
    sortOrder: 3,
    types: [
      { name: "Dump Truck (Single Axle)", code: "DUMP_TRUCK_SINGLE", defaultUsefulLife: 10, defaultOperatingHours: 2500, requiresFuelTracking: true },
      { name: "Dump Truck (Tandem)", code: "DUMP_TRUCK_TANDEM", defaultUsefulLife: 10, defaultOperatingHours: 2500, requiresFuelTracking: true },
      { name: "Dump Truck (Tri-Axle)", code: "DUMP_TRUCK_TRI", defaultUsefulLife: 10, defaultOperatingHours: 2500, requiresFuelTracking: true },
      { name: "Flatbed Truck", code: "FLATBED_TRUCK", defaultUsefulLife: 12, defaultOperatingHours: 2500, requiresFuelTracking: true },
      { name: "Service Truck", code: "SERVICE_TRUCK", defaultUsefulLife: 12, defaultOperatingHours: 2500, requiresFuelTracking: true },
      { name: "Pickup Truck (1/2 Ton)", code: "PICKUP_HALF_TON", defaultUsefulLife: 10, defaultOperatingHours: 2500, requiresFuelTracking: true },
      { name: "Pickup Truck (3/4 Ton)", code: "PICKUP_THREE_QUARTER", defaultUsefulLife: 10, defaultOperatingHours: 2500, requiresFuelTracking: true },
      { name: "Pickup Truck (1 Ton)", code: "PICKUP_ONE_TON", defaultUsefulLife: 10, defaultOperatingHours: 2500, requiresFuelTracking: true },
      { name: "Equipment Trailer", code: "EQUIPMENT_TRAILER", defaultUsefulLife: 15, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Gooseneck Trailer", code: "GOOSENECK_TRAILER", defaultUsefulLife: 15, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Utility Trailer", code: "UTILITY_TRAILER", defaultUsefulLife: 15, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Chip Trailer", code: "CHIP_TRAILER", defaultUsefulLife: 12, defaultOperatingHours: 1500, requiresFuelTracking: false },
      { name: "Water Truck", code: "WATER_TRUCK", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Fuel Truck", code: "FUEL_TRUCK", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Crew Cab Truck", code: "CREW_CAB_TRUCK", defaultUsefulLife: 10, defaultOperatingHours: 2500, requiresFuelTracking: true },
    ],
  },
  {
    code: "ATTACH",
    name: "Attachments & Implements",
    sortOrder: 4,
    types: [
      { name: "Grapple Bucket", code: "GRAPPLE_BUCKET", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Root Grapple", code: "ROOT_GRAPPLE", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Brush Grapple", code: "BRUSH_GRAPPLE", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Mulching Head", code: "MULCHING_HEAD", defaultUsefulLife: 8, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Bucket (Standard)", code: "BUCKET_STANDARD", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Auger", code: "AUGER", defaultUsefulLife: 10, defaultOperatingHours: 1500, requiresFuelTracking: false },
      { name: "Pallet Forks", code: "PALLET_FORKS", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Breaker (Hydraulic)", code: "BREAKER_HYDRAULIC", defaultUsefulLife: 8, defaultOperatingHours: 1500, requiresFuelTracking: false },
      { name: "Brush Mower Attachment", code: "BRUSH_MOWER_ATTACH", defaultUsefulLife: 8, defaultOperatingHours: 1500, requiresFuelTracking: false },
      { name: "Land Plane", code: "LAND_PLANE", defaultUsefulLife: 12, defaultOperatingHours: 1500, requiresFuelTracking: false },
      { name: "Box Blade", code: "BOX_BLADE", defaultUsefulLife: 12, defaultOperatingHours: 1500, requiresFuelTracking: false },
      { name: "Spreader (Material)", code: "SPREADER_MATERIAL", defaultUsefulLife: 10, defaultOperatingHours: 1500, requiresFuelTracking: false },
      { name: "Snow Plow", code: "SNOW_PLOW", defaultUsefulLife: 10, defaultOperatingHours: 1000, requiresFuelTracking: false },
      { name: "Tree Shear", code: "TREE_SHEAR", defaultUsefulLife: 10, defaultOperatingHours: 1500, requiresFuelTracking: false },
      { name: "Tilt Rotator", code: "TILT_ROTATOR", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: false },
    ],
  },
  {
    code: "CLIMB",
    name: "Climbing & Aerial Equipment",
    sortOrder: 5,
    types: [
      { name: "Bucket Truck", code: "BUCKET_TRUCK", defaultUsefulLife: 12, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Spider Lift", code: "SPIDER_LIFT", defaultUsefulLife: 10, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Boom Lift", code: "BOOM_LIFT", defaultUsefulLife: 12, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Scissor Lift", code: "SCISSOR_LIFT", defaultUsefulLife: 12, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Crane (Mobile)", code: "CRANE_MOBILE", defaultUsefulLife: 15, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Crane (Knuckle Boom)", code: "CRANE_KNUCKLE_BOOM", defaultUsefulLife: 15, defaultOperatingHours: 2000, requiresFuelTracking: true },
      { name: "Man Lift", code: "MAN_LIFT", defaultUsefulLife: 12, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Vertical Mast Lift", code: "VERTICAL_MAST_LIFT", defaultUsefulLife: 12, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Ladder (Extension)", code: "LADDER_EXTENSION", defaultUsefulLife: 15, defaultOperatingHours: 1000, requiresFuelTracking: false },
      { name: "Ladder (Step)", code: "LADDER_STEP", defaultUsefulLife: 15, defaultOperatingHours: 1000, requiresFuelTracking: false },
    ],
  },
  {
    code: "TOOLS",
    name: "Hand Tools & Power Equipment",
    sortOrder: 6,
    types: [
      { name: "Chainsaw", code: "CHAINSAW", defaultUsefulLife: 5, defaultOperatingHours: 1000, requiresFuelTracking: true },
      { name: "Pole Saw", code: "POLE_SAW", defaultUsefulLife: 5, defaultOperatingHours: 800, requiresFuelTracking: true },
      { name: "Brush Cutter (Handheld)", code: "BRUSH_CUTTER_HANDHELD", defaultUsefulLife: 5, defaultOperatingHours: 1000, requiresFuelTracking: true },
      { name: "Hedge Trimmer", code: "HEDGE_TRIMMER", defaultUsefulLife: 5, defaultOperatingHours: 800, requiresFuelTracking: true },
      { name: "Leaf Blower (Backpack)", code: "LEAF_BLOWER_BACKPACK", defaultUsefulLife: 5, defaultOperatingHours: 1000, requiresFuelTracking: true },
      { name: "Leaf Blower (Handheld)", code: "LEAF_BLOWER_HANDHELD", defaultUsefulLife: 5, defaultOperatingHours: 800, requiresFuelTracking: true },
      { name: "Pressure Washer", code: "PRESSURE_WASHER", defaultUsefulLife: 5, defaultOperatingHours: 1000, requiresFuelTracking: true },
      { name: "Generator (Portable)", code: "GENERATOR_PORTABLE", defaultUsefulLife: 8, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Welder", code: "WELDER", defaultUsefulLife: 10, defaultOperatingHours: 1500, requiresFuelTracking: false },
      { name: "Air Compressor", code: "AIR_COMPRESSOR", defaultUsefulLife: 10, defaultOperatingHours: 1500, requiresFuelTracking: true },
      { name: "Stump Grinder (Walk-Behind)", code: "STUMP_GRINDER_WALK", defaultUsefulLife: 8, defaultOperatingHours: 1000, requiresFuelTracking: true },
      { name: "Sod Cutter", code: "SOD_CUTTER", defaultUsefulLife: 8, defaultOperatingHours: 1000, requiresFuelTracking: true },
      { name: "Concrete Saw", code: "CONCRETE_SAW", defaultUsefulLife: 8, defaultOperatingHours: 1000, requiresFuelTracking: true },
      { name: "Plate Compactor", code: "PLATE_COMPACTOR", defaultUsefulLife: 8, defaultOperatingHours: 1000, requiresFuelTracking: true },
      { name: "Power Rake", code: "POWER_RAKE", defaultUsefulLife: 8, defaultOperatingHours: 1000, requiresFuelTracking: true },
    ],
  },
  {
    code: "SAFETY",
    name: "Safety Equipment",
    sortOrder: 7,
    types: [
      { name: "Traffic Cones", code: "TRAFFIC_CONES", defaultUsefulLife: 5, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Barricades", code: "BARRICADES", defaultUsefulLife: 8, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Safety Signs", code: "SAFETY_SIGNS", defaultUsefulLife: 5, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Fire Extinguisher", code: "FIRE_EXTINGUISHER", defaultUsefulLife: 10, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "First Aid Kit", code: "FIRST_AID_KIT", defaultUsefulLife: 3, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Spill Kit", code: "SPILL_KIT", defaultUsefulLife: 5, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Fall Protection System", code: "FALL_PROTECTION", defaultUsefulLife: 10, defaultOperatingHours: 1500, requiresFuelTracking: false },
      { name: "Safety Harness", code: "SAFETY_HARNESS", defaultUsefulLife: 5, defaultOperatingHours: 1500, requiresFuelTracking: false },
      { name: "Hard Hats", code: "HARD_HATS", defaultUsefulLife: 3, defaultOperatingHours: 2000, requiresFuelTracking: false },
      { name: "Safety Vests", code: "SAFETY_VESTS", defaultUsefulLife: 3, defaultOperatingHours: 2000, requiresFuelTracking: false },
    ],
  },
];

/**
 * Seed Equipment Categories and Types
 *
 * This mutation creates default equipment categories and types if they don't already exist.
 * It's designed to be idempotent - running it multiple times won't create duplicates.
 *
 * The mutation will:
 * 1. Check if categories already exist for the company
 * 2. If not, create all default categories and their associated types
 * 3. Return a summary of what was created
 */
export const seedEquipmentCategories = mutation({
  args: {
    companyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;

    // Check if categories already exist for this company
    const existingCategories = await ctx.db
      .query("equipmentCategories")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    if (existingCategories.length > 0) {
      return {
        success: false,
        message: "Equipment categories already exist for this company",
        categoriesCreated: 0,
        typesCreated: 0,
      };
    }

    let categoriesCreated = 0;
    let typesCreated = 0;

    // Create all categories and types
    for (const categoryData of DEFAULT_CATEGORIES) {
      // Create the category
      const categoryId = await ctx.db.insert("equipmentCategories", {
        companyId,
        code: categoryData.code,
        name: categoryData.name,
        sortOrder: categoryData.sortOrder,
        isActive: true,
        createdAt: Date.now(),
      });

      categoriesCreated++;

      // Create all types for this category
      let typeSortOrder = 1;
      for (const typeData of categoryData.types) {
        await ctx.db.insert("equipmentTypes", {
          companyId,
          categoryId,
          name: typeData.name,
          code: typeData.code,
          defaultUsefulLife: typeData.defaultUsefulLife,
          defaultOperatingHours: typeData.defaultOperatingHours,
          requiresFuelTracking: typeData.requiresFuelTracking,
          sortOrder: typeSortOrder++,
          isActive: true,
          createdAt: Date.now(),
        });

        typesCreated++;
      }
    }

    return {
      success: true,
      message: `Successfully seeded ${categoriesCreated} categories and ${typesCreated} types`,
      categoriesCreated,
      typesCreated,
    };
  },
});

/**
 * Seed a single category with its types
 *
 * Useful for adding individual categories without seeding everything
 */
export const seedSingleCategory = mutation({
  args: {
    companyId: v.optional(v.string()),
    categoryCode: v.string(),
  },
  handler: async (ctx, args) => {
    const companyId = args.companyId;
    const categoryData = DEFAULT_CATEGORIES.find((c) => c.code === args.categoryCode);

    if (!categoryData) {
      throw new Error(`Category with code ${args.categoryCode} not found`);
    }

    // Check if category already exists
    const existing = await ctx.db
      .query("equipmentCategories")
      .filter((q) =>
        q.and(
          q.eq(q.field("companyId"), companyId),
          q.eq(q.field("code"), args.categoryCode)
        )
      )
      .first();

    if (existing) {
      return {
        success: false,
        message: `Category ${args.categoryCode} already exists`,
        categoryId: existing._id,
      };
    }

    // Create the category
    const categoryId = await ctx.db.insert("equipmentCategories", {
      companyId,
      code: categoryData.code,
      name: categoryData.name,
      sortOrder: categoryData.sortOrder,
      isActive: true,
      createdAt: Date.now(),
    });

    // Create all types for this category
    let typeSortOrder = 1;
    let typesCreated = 0;
    for (const typeData of categoryData.types) {
      await ctx.db.insert("equipmentTypes", {
        companyId,
        categoryId,
        name: typeData.name,
        code: typeData.code,
        defaultUsefulLife: typeData.defaultUsefulLife,
        defaultOperatingHours: typeData.defaultOperatingHours,
        requiresFuelTracking: typeData.requiresFuelTracking,
        sortOrder: typeSortOrder++,
        isActive: true,
        createdAt: Date.now(),
      });
      typesCreated++;
    }

    return {
      success: true,
      message: `Successfully created category ${categoryData.name} with ${typesCreated} types`,
      categoryId,
      typesCreated,
    };
  },
});

/**
 * Get all available category codes and names
 *
 * Query to see what categories are available to seed
 */
export const getAvailableCategories = mutation({
  args: {},
  handler: async () => {
    return DEFAULT_CATEGORIES.map((c) => ({
      code: c.code,
      name: c.name,
      typeCount: c.types.length,
    }));
  },
});

/**
 * Reset all categories for a company
 *
 * WARNING: This will delete all existing categories and types, then reseed them.
 * Use with caution!
 */
export const resetEquipmentCategories = mutation({
  args: {
    companyId: v.optional(v.string()),
    confirmReset: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.confirmReset) {
      throw new Error("Must confirm reset by passing confirmReset: true");
    }

    const companyId = args.companyId;

    // Delete all existing categories and types
    const existingCategories = await ctx.db
      .query("equipmentCategories")
      .filter((q) => q.eq(q.field("companyId"), companyId))
      .collect();

    for (const category of existingCategories) {
      // Delete all types for this category
      const types = await ctx.db
        .query("equipmentTypes")
        .withIndex("by_category", (q) => q.eq("categoryId", category._id))
        .collect();

      for (const type of types) {
        await ctx.db.delete(type._id);
      }

      // Delete the category
      await ctx.db.delete(category._id);
    }

    // Now seed fresh categories and types
    let categoriesCreated = 0;
    let typesCreated = 0;

    for (const categoryData of DEFAULT_CATEGORIES) {
      const categoryId = await ctx.db.insert("equipmentCategories", {
        companyId,
        code: categoryData.code,
        name: categoryData.name,
        sortOrder: categoryData.sortOrder,
        isActive: true,
        createdAt: Date.now(),
      });

      categoriesCreated++;

      let typeSortOrder = 1;
      for (const typeData of categoryData.types) {
        await ctx.db.insert("equipmentTypes", {
          companyId,
          categoryId,
          name: typeData.name,
          code: typeData.code,
          defaultUsefulLife: typeData.defaultUsefulLife,
          defaultOperatingHours: typeData.defaultOperatingHours,
          requiresFuelTracking: typeData.requiresFuelTracking,
          sortOrder: typeSortOrder++,
          isActive: true,
          createdAt: Date.now(),
        });

        typesCreated++;
      }
    }

    return {
      success: true,
      message: `Successfully reset and seeded ${categoriesCreated} categories and ${typesCreated} types`,
      categoriesCreated,
      typesCreated,
    };
  },
});
