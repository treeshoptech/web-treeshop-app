import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getOrganizationId, requireOrganizationId } from "./auth";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// Generate comprehensive project report when job is completed
export const generateProjectReport = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const orgId = await requireOrganizationId(ctx);

    // Get job details
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Verify ownership
    await verifyDocumentOwnershipOptional(ctx, job, "job");

    // Get customer info
    let customerName = job.customerName || "Unknown Customer";
    let customerAddress = job.customerAddress;
    let customerPhone = job.customerPhone;
    let customerEmail: string | undefined;

    if (job.customerId) {
      const customer = await ctx.db.get(job.customerId);
      if (customer) {
        customerName = `${customer.firstName} ${customer.lastName}`;
        if (customer.businessName) {
          customerName = `${customer.businessName} (${customerName})`;
        }
        customerAddress = `${customer.streetAddress}, ${customer.city}, ${customer.state} ${customer.zipCode}`;
        customerPhone = customer.phone;
        customerEmail = customer.email;
      }
    }

    // Get all line items
    const lineItems = await ctx.db
      .query("jobLineItems")
      .withIndex("by_job_sort", (q) => q.eq("jobId", args.jobId))
      .collect();

    // Get all time logs
    const timeLogs = await ctx.db
      .query("timeLogs")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    // Enrich time logs with employee info
    const enrichedTimeLogs = await Promise.all(
      timeLogs.map(async (log) => {
        const employee = await ctx.db.get(log.employeeId);
        return {
          ...log,
          employeeName: employee?.name || "Unknown",
          employeePosition: employee?.position || employee?.positionCode || "N/A",
        };
      })
    );

    // Group time logs by employee
    const timeLogsByEmployee = enrichedTimeLogs.reduce((acc: any, log: any) => {
      if (!acc[log.employeeId]) {
        acc[log.employeeId] = {
          employeeName: log.employeeName,
          employeePosition: log.employeePosition,
          logs: [],
          totalHours: 0,
          productiveHours: 0,
          supportHours: 0,
          totalCost: 0,
        };
      }
      acc[log.employeeId].logs.push(log);
      acc[log.employeeId].totalHours += log.durationHours || 0;
      if (log.taskType === "productive") {
        acc[log.employeeId].productiveHours += log.durationHours || 0;
      } else {
        acc[log.employeeId].supportHours += log.durationHours || 0;
      }
      acc[log.employeeId].totalCost += log.totalCost || 0;
      return acc;
    }, {});

    // Get crew info
    let crewMembers: any[] = [];
    if (job.assignedCrewId) {
      const crew = await ctx.db.get(job.assignedCrewId);
      if (crew) {
        crewMembers = await Promise.all(
          crew.memberIds.map(async (id) => {
            const member = await ctx.db.get(id);
            return {
              name: member?.name || "Unknown",
              position: member?.position || member?.positionCode || "N/A",
              effectiveRate: member?.effectiveRate || 0,
            };
          })
        );
      }
    }

    // Calculate financial summary
    const totalHours = (job.actualProductiveHours || 0) + (job.actualSupportHours || 0);
    const actualTotalCost = job.actualTotalCost || 0;
    const totalInvestment = job.totalInvestment || 0;
    const profit = totalInvestment - actualTotalCost;
    const profitMargin = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

    // Prepare line items data
    const lineItemsData = lineItems.map((item) => ({
      displayName: item.displayName,
      serviceType: item.serviceType,
      estimatedHours: item.estimatedHours,
      actualProductiveHours: item.actualProductiveHours || 0,
      lineItemTotal: item.lineItemTotal,
      variance: item.variance || 0,
      status: item.status || "not_started",
    }));

    // Create the report
    const reportId = await ctx.db.insert("projectReports", {
      companyId: orgId,
      jobId: args.jobId,
      jobNumber: job.jobNumber,

      // Customer snapshot
      customerName,
      customerAddress,
      customerPhone,
      customerEmail,

      // Job details
      status: job.status,
      startDate: job.startDate,
      endDate: job.endDate,
      completedAt: job.completedAt || Date.now(),

      // Financial summary
      estimatedTotalHours: job.estimatedTotalHours,
      actualProductiveHours: job.actualProductiveHours || 0,
      actualSupportHours: job.actualSupportHours || 0,
      totalHours,
      totalInvestment,
      actualTotalCost,
      profit,
      profitMargin,

      // Serialized data
      lineItemsData: JSON.stringify(lineItemsData),
      timeLogsData: JSON.stringify(timeLogsByEmployee),
      crewMembersData: crewMembers.length > 0 ? JSON.stringify(crewMembers) : undefined,
      equipmentData: undefined, // TODO: Add equipment tracking

      jobNotes: job.notes,

      createdAt: Date.now(),
    });

    return reportId;
  },
});

// Get all project reports for organization
export const listProjectReports = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    if (!orgId) {
      return [];
    }

    const reports = await ctx.db
      .query("projectReports")
      .withIndex("by_company_completed", (q) => q.eq("companyId", orgId))
      .order("desc")
      .collect();

    return reports;
  },
});

// Get single project report
export const getProjectReport = query({
  args: { reportId: v.id("projectReports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);

    // Verify ownership
    await verifyDocumentOwnershipOptional(ctx, report, "report");

    if (!report) return null;

    // Parse JSON data
    const lineItems = JSON.parse(report.lineItemsData);
    const timeLogs = JSON.parse(report.timeLogsData);
    const crewMembers = report.crewMembersData ? JSON.parse(report.crewMembersData) : [];
    const equipment = report.equipmentData ? JSON.parse(report.equipmentData) : [];

    return {
      ...report,
      lineItems,
      timeLogs,
      crewMembers,
      equipment,
    };
  },
});

// Delete a project report
export const deleteProjectReport = mutation({
  args: { reportId: v.id("projectReports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);

    // Verify ownership
    await verifyDocumentOwnershipOptional(ctx, report, "report");

    if (!report) {
      throw new Error("Report not found");
    }

    await ctx.db.delete(args.reportId);
  },
});
