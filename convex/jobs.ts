import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all jobs
export const listJobs = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("jobs")
      .order("desc")
      .collect();

    // Enrich with customer data
    const enrichedJobs = await Promise.all(
      jobs.map(async (job) => {
        let customer = null;
        if (job.customerId) {
          customer = await ctx.db.get(job.customerId);
        }
        return {
          ...job,
          customer,
        };
      })
    );

    return enrichedJobs;
  },
});

// Get single job with all related data
export const getJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    // Get customer (if customerId exists)
    let customer = null;
    if (job.customerId) {
      customer = await ctx.db.get(job.customerId);
    }

    // Get line items
    const lineItems = await ctx.db
      .query("jobLineItems")
      .withIndex("by_job_sort", (q) => q.eq("jobId", args.jobId))
      .collect();

    // Get time logs
    const timeLogs = await ctx.db
      .query("timeLogs")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .order("desc")
      .collect();

    // Enrich time logs with employee names
    const enrichedTimeLogs = await Promise.all(
      timeLogs.map(async (log) => {
        const employee = await ctx.db.get(log.employeeId);
        return {
          ...log,
          employeeName: employee?.name || "Unknown",
        };
      })
    );

    // Get crew if assigned
    let crew = null;
    if (job.assignedCrewId) {
      crew = await ctx.db.get(job.assignedCrewId);
      if (crew) {
        // Get crew member names
        const members = await Promise.all(
          crew.memberIds.map((id) => ctx.db.get(id))
        );
        crew = {
          ...crew,
          members: members.filter((m) => m !== null),
        };
      }
    }

    return {
      ...job,
      customer,
      lineItems,
      timeLogs: enrichedTimeLogs,
      crew,
    };
  },
});

// Get time logs for a specific line item
export const getLineItemTimeLogs = query({
  args: { lineItemId: v.id("jobLineItems") },
  handler: async (ctx, args) => {
    const timeLogs = await ctx.db
      .query("timeLogs")
      .withIndex("by_job_line_item", (q) => q.eq("jobLineItemId", args.lineItemId))
      .collect();

    return timeLogs;
  },
});

// Get all active employees
export const listEmployees = query({
  args: {},
  handler: async (ctx) => {
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return employees;
  },
});

// Mark job as complete
export const markJobComplete = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Mark all line items as complete
    const lineItems = await ctx.db
      .query("jobLineItems")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    for (const item of lineItems) {
      if (item.status !== "completed") {
        await ctx.db.patch(item._id, {
          status: "completed",
        });
      }
    }

    // Mark job as complete
    await ctx.db.patch(args.jobId, {
      status: "completed",
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Create new work order
export const createJob = mutation({
  args: {
    customerId: v.id("customers"),
    startDate: v.string(),
    notes: v.optional(v.string()),
    assignedCrewId: v.optional(v.id("crews")),
  },
  handler: async (ctx, args) => {
    // Generate job number
    const allJobs = await ctx.db.query("jobs").collect();
    const jobNumber = `WO-${(allJobs.length + 1).toString().padStart(4, '0')}`;

    const jobId = await ctx.db.insert("jobs", {
      jobNumber,
      customerId: args.customerId,
      status: "scheduled",
      startDate: args.startDate,
      estimatedTotalHours: 0, // Will update when line items added
      totalInvestment: 0, // Will update when line items added
      assignedCrewId: args.assignedCrewId,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create default overhead line items
    await ctx.db.insert("jobLineItems", {
      jobId,
      serviceType: "transport",
      displayName: "Transport",
      baseScore: 1,
      adjustedScore: 1,
      estimatedHours: 1,
      lineItemTotal: 500,
      status: "not_started",
      sortOrder: 0,
      createdAt: Date.now(),
    });

    await ctx.db.insert("jobLineItems", {
      jobId,
      serviceType: "setup",
      displayName: "Setup",
      baseScore: 1,
      adjustedScore: 1,
      estimatedHours: 0.5,
      lineItemTotal: 250,
      status: "not_started",
      sortOrder: 0.5,
      createdAt: Date.now(),
    });

    await ctx.db.insert("jobLineItems", {
      jobId,
      serviceType: "tear_down",
      displayName: "Tear Down",
      baseScore: 1,
      adjustedScore: 1,
      estimatedHours: 1,
      lineItemTotal: 500,
      status: "not_started",
      sortOrder: 99,
      createdAt: Date.now(),
    });

    return jobId;
  },
});
