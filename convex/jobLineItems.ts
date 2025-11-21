import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mark a line item as complete
export const markComplete = mutation({
  args: {
    lineItemId: v.id("jobLineItems"),
  },
  handler: async (ctx, args) => {
    const lineItem = await ctx.db.get(args.lineItemId);
    if (!lineItem) {
      throw new Error("Line item not found");
    }

    await ctx.db.patch(args.lineItemId, {
      status: "completed",
    });

    // Check if all line items are complete, if so mark job complete
    const allLineItems = await ctx.db
      .query("jobLineItems")
      .withIndex("by_job", (q) => q.eq("jobId", lineItem.jobId))
      .collect();

    const allComplete = allLineItems.every(
      (item) => item._id === args.lineItemId || item.status === "completed"
    );

    if (allComplete) {
      await ctx.db.patch(lineItem.jobId, {
        status: "completed",
        completedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Reopen a completed line item
export const reopenTask = mutation({
  args: {
    lineItemId: v.id("jobLineItems"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.lineItemId, {
      status: "in_progress",
    });

    // Also reopen job if it was marked complete
    const lineItem = await ctx.db.get(args.lineItemId);
    if (lineItem) {
      const job = await ctx.db.get(lineItem.jobId);
      if (job?.status === "completed") {
        await ctx.db.patch(lineItem.jobId, {
          status: "in_progress",
          completedAt: undefined,
        });
      }
    }

    return { success: true };
  },
});

// Add line item to work order
export const addLineItem = mutation({
  args: {
    jobId: v.id("jobs"),
    displayName: v.string(),
    serviceType: v.string(),
    baseScore: v.number(),
    adjustedScore: v.number(),
    estimatedHours: v.number(),
    lineItemTotal: v.number(),
    scopeDetails: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current line items to set sort order
    const lineItems = await ctx.db
      .query("jobLineItems")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    // Find max sort order (excluding tear_down which is always 99)
    const maxSort = Math.max(
      ...lineItems
        .filter((item) => item.serviceType !== "tear_down")
        .map((item) => item.sortOrder),
      1
    );

    const newSortOrder = maxSort + 1;

    const lineItemId = await ctx.db.insert("jobLineItems", {
      jobId: args.jobId,
      serviceType: args.serviceType,
      displayName: args.displayName,
      baseScore: args.baseScore,
      adjustedScore: args.adjustedScore,
      estimatedHours: args.estimatedHours,
      lineItemTotal: args.lineItemTotal,
      scopeDetails: args.scopeDetails,
      status: "not_started",
      sortOrder: newSortOrder,
      createdAt: Date.now(),
    });

    // Update job totals
    const job = await ctx.db.get(args.jobId);
    if (job) {
      await ctx.db.patch(args.jobId, {
        estimatedTotalHours: job.estimatedTotalHours + args.estimatedHours,
        totalInvestment: job.totalInvestment + args.lineItemTotal,
        updatedAt: Date.now(),
      });
    }

    return lineItemId;
  },
});

// Delete line item
export const deleteLineItem = mutation({
  args: { lineItemId: v.id("jobLineItems") },
  handler: async (ctx, args) => {
    const lineItem = await ctx.db.get(args.lineItemId);
    if (!lineItem) throw new Error("Line item not found");

    // Update job totals
    const job = await ctx.db.get(lineItem.jobId);
    if (job) {
      await ctx.db.patch(lineItem.jobId, {
        estimatedTotalHours: Math.max(0, job.estimatedTotalHours - lineItem.estimatedHours),
        totalInvestment: Math.max(0, job.totalInvestment - lineItem.lineItemTotal),
        updatedAt: Date.now(),
      });
    }

    // Delete the line item
    await ctx.db.delete(args.lineItemId);

    return { success: true };
  },
});
