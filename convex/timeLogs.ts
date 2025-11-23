import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Start a timer for a task
export const startTimer = mutation({
  args: {
    jobId: v.id("jobs"),
    jobLineItemId: v.optional(v.id("jobLineItems")), // Only for productive tasks
    employeeId: v.id("employees"),
    taskType: v.union(v.literal("productive"), v.literal("support")),
    taskName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if employee already has an active timer
    const existingActiveTimer = await ctx.db
      .query("timeLogs")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) => q.eq(q.field("endTime"), undefined))
      .first();

    if (existingActiveTimer) {
      throw new Error("Employee already has an active timer. Stop it first.");
    }

    // Get employee info for rate
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Create time log
    const timeLogId = await ctx.db.insert("timeLogs", {
      jobId: args.jobId,
      jobLineItemId: args.jobLineItemId,
      employeeId: args.employeeId,
      taskType: args.taskType,
      taskName: args.taskName,
      startTime: Date.now(),
      employeeRate: employee.effectiveRate || employee.fullyBurdenedHourlyRate || 40,
      equipmentCost: 110, // TODO: Calculate from actual equipment assigned
      createdAt: Date.now(),
    });

    return timeLogId;
  },
});

// Stop a timer
export const stopTimer = mutation({
  args: {
    timeLogId: v.id("timeLogs"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timeLog = await ctx.db.get(args.timeLogId);
    if (!timeLog) {
      throw new Error("Time log not found");
    }

    if (timeLog.endTime) {
      throw new Error("Timer already stopped");
    }

    const endTime = Date.now();
    const durationMs = endTime - timeLog.startTime;
    const durationHours = durationMs / (1000 * 60 * 60);

    // Calculate total cost
    const hourlyCost = (timeLog.employeeRate ?? 0) + (timeLog.equipmentCost || 0);
    const totalCost = hourlyCost * durationHours;

    // Update time log
    await ctx.db.patch(args.timeLogId, {
      endTime,
      durationHours,
      totalCost,
      notes: args.notes,
    });

    // Update job actuals
    await updateJobActuals(ctx, timeLog.jobId);

    // Update line item actuals if productive task
    if (timeLog.jobLineItemId) {
      await updateLineItemActuals(ctx, timeLog.jobLineItemId);
    }

    return { durationHours, totalCost };
  },
});

// Get active timer for an employee
export const getActiveTimer = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    const activeTimer = await ctx.db
      .query("timeLogs")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) => q.eq(q.field("endTime"), undefined))
      .first();

    return activeTimer;
  },
});

// Add manual time entry (for forgotten/backdated time)
export const addManualTimeEntry = mutation({
  args: {
    jobId: v.id("jobs"),
    jobLineItemId: v.optional(v.id("jobLineItems")),
    employeeId: v.id("employees"),
    taskType: v.union(v.literal("productive"), v.literal("support")),
    taskName: v.string(),
    durationHours: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get employee info for rate
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    const now = Date.now();
    const startTime = now - args.durationHours * 60 * 60 * 1000; // Backdate start time
    const employeeRate = employee.effectiveRate || employee.fullyBurdenedHourlyRate || 40;
    const hourlyCost = employeeRate + 110; // TODO: Calculate actual equipment cost
    const totalCost = hourlyCost * args.durationHours;

    // Create completed time log
    const timeLogId = await ctx.db.insert("timeLogs", {
      jobId: args.jobId,
      jobLineItemId: args.jobLineItemId,
      employeeId: args.employeeId,
      taskType: args.taskType,
      taskName: args.taskName,
      startTime,
      endTime: now,
      durationHours: args.durationHours,
      employeeRate,
      equipmentCost: 110,
      totalCost,
      notes: args.notes,
      createdAt: now,
    });

    // Update job actuals
    await updateJobActuals(ctx, args.jobId);

    // Update line item actuals if productive task
    if (args.jobLineItemId) {
      await updateLineItemActuals(ctx, args.jobLineItemId);
    }

    return timeLogId;
  },
});

// Helper function to update job actuals
async function updateJobActuals(ctx: any, jobId: any) {
  const timeLogs = await ctx.db
    .query("timeLogs")
    .withIndex("by_job", (q: any) => q.eq("jobId", jobId))
    .filter((q: any) => q.neq(q.field("endTime"), undefined))
    .collect();

  let actualProductiveHours = 0;
  let actualSupportHours = 0;
  let actualTotalCost = 0;

  for (const log of timeLogs) {
    if (log.taskType === "productive") {
      actualProductiveHours += log.durationHours || 0;
    } else {
      actualSupportHours += log.durationHours || 0;
    }
    actualTotalCost += log.totalCost || 0;
  }

  await ctx.db.patch(jobId, {
    actualProductiveHours,
    actualSupportHours,
    actualTotalCost,
    updatedAt: Date.now(),
  });
}

// Helper function to update line item actuals
async function updateLineItemActuals(ctx: any, lineItemId: any) {
  const timeLogs = await ctx.db
    .query("timeLogs")
    .withIndex("by_job_line_item", (q: any) => q.eq("jobLineItemId", lineItemId))
    .filter((q: any) => q.neq(q.field("endTime"), undefined))
    .collect();

  let actualProductiveHours = 0;

  for (const log of timeLogs) {
    actualProductiveHours += log.durationHours || 0;
  }

  const lineItem = await ctx.db.get(lineItemId);
  if (lineItem) {
    const actualProductionRate = lineItem.adjustedScore / actualProductiveHours;
    const variance = actualProductiveHours - lineItem.estimatedHours;

    await ctx.db.patch(lineItemId, {
      actualProductiveHours,
      actualProductionRate,
      variance,
    });
  }
}
