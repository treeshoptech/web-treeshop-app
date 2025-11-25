import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "./auth";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// Get all jobs for user's organization
export const listJobs = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    // Get all jobs - filter by org if orgId exists
    const jobs = orgId
      ? await ctx.db
          .query("jobs")
          .filter((q) => q.eq(q.field("companyId"), orgId))
          .order("desc")
          .collect()
      : await ctx.db.query("jobs").order("desc").collect();

    // Batch fetch all related records upfront
    const customerIds = jobs
      .map((j) => j.customerId)
      .filter((id): id is NonNullable<typeof id> => id !== undefined);
    const crewIds = jobs
      .map((j) => j.assignedCrewId)
      .filter((id): id is NonNullable<typeof id> => id !== undefined);

    // Fetch all customers and crews in parallel
    const [customers, crews] = await Promise.all([
      Promise.all(customerIds.map((id) => ctx.db.get(id))),
      Promise.all(crewIds.map((id) => ctx.db.get(id))),
    ]);

    // Create lookup maps for O(1) access
    const customerMap = new Map(
      customers.map((c, i) => [customerIds[i], c])
    );
    const crewMap = new Map(crews.map((c, i) => [crewIds[i], c]));

    // Single-pass enrichment
    const enrichedJobs = jobs.map((job) => ({
      ...job,
      customer: job.customerId ? customerMap.get(job.customerId) ?? null : null,
      crew: job.assignedCrewId ? crewMap.get(job.assignedCrewId) ?? null : null,
    }));

    return enrichedJobs;
  },
});

// Get single job with all related data
export const getJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);

    if (!job) return null;

    // Verify ownership - throws error if job doesn't belong to user's org
    await verifyDocumentOwnershipOptional(ctx, job, "job");

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

    // Batch fetch all employees for time logs upfront
    const employeeIds = timeLogs.map((log) => log.employeeId);
    const employees = await Promise.all(
      employeeIds.map((id) => ctx.db.get(id))
    );

    // Create employee lookup map
    const employeeMap = new Map(
      employees.map((e, i) => [employeeIds[i], e])
    );

    // Single-pass enrichment of time logs
    const enrichedTimeLogs = timeLogs.map((log) => {
      const employee = employeeMap.get(log.employeeId);
      return {
        ...log,
        employeeName: employee?.name || "Unknown",
      };
    });

    // Get crew if assigned
    let crew = null;
    if (job.assignedCrewId) {
      crew = await ctx.db.get(job.assignedCrewId);
      if (crew) {
        // Batch fetch all crew members
        const crewMembers = await Promise.all(
          crew.memberIds.map((id) => ctx.db.get(id))
        );
        crew = {
          ...crew,
          members: crewMembers.filter((m) => m !== null),
        };
      }
    }

    // Get loadout if assigned (includes employees + equipment)
    let loadout = null;
    if (job.assignedLoadoutId) {
      loadout = await ctx.db.get(job.assignedLoadoutId);
      if (loadout) {
        // Batch fetch employees and equipment
        const [employees, equipment] = await Promise.all([
          Promise.all(loadout.employeeIds.map((id) => ctx.db.get(id))),
          Promise.all(loadout.equipmentIds.map((id) => ctx.db.get(id))),
        ]);
        loadout = {
          ...loadout,
          employees: employees.filter((e) => e !== null),
          equipment: equipment.filter((e) => e !== null),
        };
      }
    }

    return {
      ...job,
      customer,
      lineItems,
      timeLogs: enrichedTimeLogs,
      crew,
      loadout, // NEW: Include full loadout with employees + equipment
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

    // Verify ownership before marking complete
    await verifyDocumentOwnershipOptional(ctx, job, "job");

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

    // Schedule project report generation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.scheduler.runAfter(0, "projectReports:generateProjectReport" as any, {
      jobId: args.jobId,
    });

    return { success: true };
  },
});

// Create new work order/project
export const createJob = mutation({
  args: {
    customerId: v.id("customers"),
    startDate: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    notes: v.optional(v.string()),
    assignedCrewId: v.optional(v.id("crews")),
    assignedLoadoutId: v.optional(v.id("loadouts")), // NEW: Loadout assignment
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    // Generate job number
    const allJobs = await ctx.db.query("jobs").collect();
    const jobNumber = `WO-${(allJobs.length + 1).toString().padStart(4, '0')}`;

    const jobId = await ctx.db.insert("jobs", {
      companyId: orgId ?? undefined,
      jobNumber,
      lifecycleStage: "WO", // Default to Work Order stage
      customerId: args.customerId,
      status: args.status || "draft", // Default to draft if not specified
      startDate: args.startDate,
      estimatedTotalHours: 0, // Will update when line items added
      totalInvestment: 0, // Will update when line items added
      assignedCrewId: args.assignedCrewId,
      assignedLoadoutId: args.assignedLoadoutId, // NEW
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Get loadout hourly cost if assigned (for support task pricing)
    let loadoutHourlyCost = 0;
    if (args.assignedLoadoutId) {
      const loadout = await ctx.db.get(args.assignedLoadoutId);
      if (loadout) {
        loadoutHourlyCost = loadout.totalHourlyCost;
      }
    }

    // Get company support task margin (default 15%)
    let supportTaskMargin = 0.15;
    if (orgId) {
      const company = await ctx.db
        .query("companies")
        .withIndex("by_company", (q) => q.eq("companyId", orgId))
        .first();
      if (company?.supportTaskMargin !== undefined) {
        supportTaskMargin = company.supportTaskMargin;
      }
    }

    // Helper: Calculate billable rate with true margin
    // Formula: cost / (1 - margin) = price where margin = (price - cost) / price
    const calculateBillableTotal = (costPerHour: number, hours: number, fallbackTotal: number) => {
      if (costPerHour <= 0) return fallbackTotal;
      const billableRate = supportTaskMargin > 0
        ? costPerHour / (1 - supportTaskMargin)
        : costPerHour;
      return billableRate * hours;
    };

    // Create default project phase line items
    // Phase 1: Mobilization
    await ctx.db.insert("jobLineItems", {
      jobId,
      serviceType: "transport_to_site",
      displayName: "Transport to Site",
      baseScore: 1,
      adjustedScore: 1,
      estimatedHours: 1,
      lineItemTotal: calculateBillableTotal(loadoutHourlyCost, 1, 500),
      status: "not_started",
      sortOrder: 1,
      createdAt: Date.now(),
    });

    await ctx.db.insert("jobLineItems", {
      jobId,
      serviceType: "site_setup",
      displayName: "Site Setup & Preparation",
      baseScore: 1,
      adjustedScore: 1,
      estimatedHours: 0.5,
      lineItemTotal: calculateBillableTotal(loadoutHourlyCost, 0.5, 250),
      status: "not_started",
      sortOrder: 2,
      createdAt: Date.now(),
    });

    // Phase 2: Production (user adds custom tasks here - mulching, tree removal, etc.)
    // sortOrder 3-97 reserved for production tasks

    // Phase 3: Demobilization
    await ctx.db.insert("jobLineItems", {
      jobId,
      serviceType: "site_cleanup",
      displayName: "Site Cleanup & Tear Down",
      baseScore: 1,
      adjustedScore: 1,
      estimatedHours: 0.5,
      lineItemTotal: calculateBillableTotal(loadoutHourlyCost, 0.5, 250),
      status: "not_started",
      sortOrder: 98,
      createdAt: Date.now(),
    });

    await ctx.db.insert("jobLineItems", {
      jobId,
      serviceType: "transport_from_site",
      displayName: "Transport Back to Shop",
      baseScore: 1,
      adjustedScore: 1,
      estimatedHours: 1,
      lineItemTotal: calculateBillableTotal(loadoutHourlyCost, 1, 500),
      status: "not_started",
      sortOrder: 99,
      createdAt: Date.now(),
    });

    return jobId;
  },
});

// Update lifecycle stage
export const updateLifecycleStage = mutation({
  args: {
    jobId: v.id("jobs"),
    lifecycleStage: v.union(
      v.literal("LE"),
      v.literal("PR"),
      v.literal("WO"),
      v.literal("IN"),
      v.literal("CO")
    ),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    await verifyDocumentOwnershipOptional(ctx, job, "job");

    await ctx.db.patch(args.jobId, {
      lifecycleStage: args.lifecycleStage,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Helper to get display ID (LE-0001, PR-0001, WO-0001, etc.)
export const getDisplayId = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    const stage = job.lifecycleStage || "WO";
    const number = job.jobNumber.replace("WO-", ""); // Extract number part
    return `${stage}-${number}`;
  },
});

// Assign or update loadout for a job
export const assignLoadout = mutation({
  args: {
    jobId: v.id("jobs"),
    loadoutId: v.id("loadouts"),
    updateSupportTaskPricing: v.optional(v.boolean()), // If true, recalculate support task prices
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    // Verify ownership
    await verifyDocumentOwnershipOptional(ctx, job, "job");

    // Get the loadout
    const loadout = await ctx.db.get(args.loadoutId);
    if (!loadout) throw new Error("Loadout not found");

    // Verify loadout ownership
    await verifyDocumentOwnershipOptional(ctx, loadout, "loadout");

    // Update job with loadout assignment
    await ctx.db.patch(args.jobId, {
      assignedLoadoutId: args.loadoutId,
      updatedAt: Date.now(),
    });

    // Optionally update support task pricing based on loadout hourly cost
    if (args.updateSupportTaskPricing) {
      const supportTaskTypes = [
        "transport_to_site",
        "site_setup",
        "site_cleanup",
        "transport_from_site",
      ];

      const lineItems = await ctx.db
        .query("jobLineItems")
        .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
        .collect();

      for (const item of lineItems) {
        if (supportTaskTypes.includes(item.serviceType)) {
          const newTotal = loadout.totalHourlyCost * item.estimatedHours;
          await ctx.db.patch(item._id, {
            lineItemTotal: newTotal,
          });
        }
      }

      // Recalculate job total investment
      const updatedLineItems = await ctx.db
        .query("jobLineItems")
        .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
        .collect();

      const newTotalInvestment = updatedLineItems.reduce(
        (sum, item) => sum + item.lineItemTotal,
        0
      );

      await ctx.db.patch(args.jobId, {
        totalInvestment: newTotalInvestment,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Delete job (and all related data)
export const deleteJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    // Verify ownership
    await verifyDocumentOwnershipOptional(ctx, job, "job");

    // Delete all related records
    // 1. Delete all line items
    const lineItems = await ctx.db
      .query("jobLineItems")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();
    for (const lineItem of lineItems) {
      await ctx.db.delete(lineItem._id);
    }

    // 2. Delete all time logs
    const timeLogs = await ctx.db
      .query("timeLogs")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();
    for (const timeLog of timeLogs) {
      await ctx.db.delete(timeLog._id);
    }

    // 3. Delete any project reports
    const reports = await ctx.db
      .query("projectReports")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();
    for (const report of reports) {
      await ctx.db.delete(report._id);
    }

    // 4. Finally delete the job itself
    await ctx.db.delete(args.jobId);

    return { success: true };
  },
});
