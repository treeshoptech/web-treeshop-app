import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

/**
 * Get all skills for an employee
 * Returns skills with populated track information
 */
export const getEmployeeSkills = query({
  args: {
    employeeId: v.id("employees")
  },
  handler: async (ctx, args) => {
    // Verify employee ownership
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) throw new Error("Employee not found");
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    // Get all skills for this employee
    const skills = await ctx.db
      .query("employeeSkills")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    // Populate track information for each skill
    const skillsWithTracks = await Promise.all(
      skills.map(async (skill) => {
        const track = await ctx.db.get(skill.trackId);
        return {
          ...skill,
          track,
        };
      })
    );

    return skillsWithTracks;
  },
});

/**
 * Add a new skill to an employee
 */
export const addEmployeeSkill = mutation({
  args: {
    employeeId: v.id("employees"),
    trackId: v.id("careerTracks"),
    proficiencyLevel: v.union(
      v.literal("learning"),
      v.literal("qualified"),
      v.literal("expert")
    ),
    isPrimary: v.optional(v.boolean()),
    yearsExperience: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify employee ownership
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) throw new Error("Employee not found");
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    // Verify track exists and belongs to same organization
    const track = await ctx.db.get(args.trackId);
    if (!track) throw new Error("Career track not found");
    await verifyDocumentOwnershipOptional(ctx, track, "career track");

    // Check if skill already exists for this employee
    const existingSkill = await ctx.db
      .query("employeeSkills")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) => q.eq(q.field("trackId"), args.trackId))
      .first();

    if (existingSkill) {
      throw new Error("Employee already has this skill. Use updateEmployeeSkill to modify it.");
    }

    // If this is being set as primary, unset any existing primary skills
    if (args.isPrimary) {
      const existingPrimarySkills = await ctx.db
        .query("employeeSkills")
        .withIndex("by_employee_primary", (q) =>
          q.eq("employeeId", args.employeeId).eq("isPrimary", true)
        )
        .collect();

      for (const skill of existingPrimarySkills) {
        await ctx.db.patch(skill._id, { isPrimary: false });
      }
    }

    const now = Date.now();
    const skillId = await ctx.db.insert("employeeSkills", {
      employeeId: args.employeeId,
      trackId: args.trackId,
      proficiencyLevel: args.proficiencyLevel,
      isPrimary: args.isPrimary ?? false,
      yearsExperience: args.yearsExperience,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return skillId;
  },
});

/**
 * Update an existing employee skill's proficiency or other details
 */
export const updateEmployeeSkill = mutation({
  args: {
    skillId: v.id("employeeSkills"),
    proficiencyLevel: v.optional(
      v.union(
        v.literal("learning"),
        v.literal("qualified"),
        v.literal("expert")
      )
    ),
    isPrimary: v.optional(v.boolean()),
    yearsExperience: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { skillId, ...updates } = args;

    // Get the skill and verify ownership through employee
    const skill = await ctx.db.get(skillId);
    if (!skill) throw new Error("Skill not found");

    const employee = await ctx.db.get(skill.employeeId);
    if (!employee) throw new Error("Employee not found");
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    // If setting as primary, unset any existing primary skills for this employee
    if (updates.isPrimary === true) {
      const existingPrimarySkills = await ctx.db
        .query("employeeSkills")
        .withIndex("by_employee_primary", (q) =>
          q.eq("employeeId", skill.employeeId).eq("isPrimary", true)
        )
        .collect();

      for (const primarySkill of existingPrimarySkills) {
        if (primarySkill._id !== skillId) {
          await ctx.db.patch(primarySkill._id, { isPrimary: false });
        }
      }
    }

    // Update the skill
    await ctx.db.patch(skillId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Remove a skill from an employee
 */
export const removeEmployeeSkill = mutation({
  args: {
    skillId: v.id("employeeSkills"),
  },
  handler: async (ctx, args) => {
    // Get the skill and verify ownership through employee
    const skill = await ctx.db.get(args.skillId);
    if (!skill) throw new Error("Skill not found");

    const employee = await ctx.db.get(skill.employeeId);
    if (!employee) throw new Error("Employee not found");
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    // Delete the skill
    await ctx.db.delete(args.skillId);

    return { success: true };
  },
});

/**
 * Set a specific skill as the primary skill for an employee
 * This will unset all other primary skills for the employee
 */
export const setPrimarySkill = mutation({
  args: {
    skillId: v.id("employeeSkills"),
  },
  handler: async (ctx, args) => {
    // Get the skill and verify ownership through employee
    const skill = await ctx.db.get(args.skillId);
    if (!skill) throw new Error("Skill not found");

    const employee = await ctx.db.get(skill.employeeId);
    if (!employee) throw new Error("Employee not found");
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    // Unset all existing primary skills for this employee
    const existingPrimarySkills = await ctx.db
      .query("employeeSkills")
      .withIndex("by_employee_primary", (q) =>
        q.eq("employeeId", skill.employeeId).eq("isPrimary", true)
      )
      .collect();

    for (const primarySkill of existingPrimarySkills) {
      if (primarySkill._id !== args.skillId) {
        await ctx.db.patch(primarySkill._id, { isPrimary: false });
      }
    }

    // Set this skill as primary
    await ctx.db.patch(args.skillId, {
      isPrimary: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
