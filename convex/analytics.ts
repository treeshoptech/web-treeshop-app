import { query } from "./_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "./auth";

// ============================================================================
// 1. FINANCIAL OVERVIEW
// ============================================================================

/**
 * Get comprehensive financial overview for the organization
 * Includes total revenue, costs, profit, and profit margin
 */
export const getFinancialOverview = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) {
      return {
        totalRevenue: 0,
        totalCosts: 0,
        totalProfit: 0,
        averageProfitMargin: 0,
        completedJobCount: 0,
      };
    }

    // Get all completed jobs for this organization
    const completedJobs = await ctx.db
      .query("jobs")
      .withIndex("by_company_status", (q) =>
        q.eq("companyId", orgId).eq("status", "completed")
      )
      .collect();

    // Calculate totals
    let totalRevenue = 0;
    let totalCosts = 0;
    let jobCount = 0;

    for (const job of completedJobs) {
      totalRevenue += job.totalInvestment || 0;
      totalCosts += job.actualTotalCost || 0;
      jobCount++;
    }

    const totalProfit = totalRevenue - totalCosts;
    const averageProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      averageProfitMargin,
      completedJobCount: jobCount,
    };
  },
});

/**
 * Get revenue broken down by month
 * Returns revenue data for the last 12 months
 */
export const getRevenueByMonth = query({
  args: {
    months: v.optional(v.number()), // Number of months to look back (default: 12)
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) return [];

    const monthsToLookBack = args.months || 12;

    // Get all completed jobs
    const completedJobs = await ctx.db
      .query("jobs")
      .withIndex("by_company_status", (q) =>
        q.eq("companyId", orgId).eq("status", "completed")
      )
      .collect();

    // Group by month
    const revenueByMonth: Record<string, {
      revenue: number;
      costs: number;
      profit: number;
      jobCount: number;
      month: string;
      year: number;
    }> = {};

    for (const job of completedJobs) {
      if (!job.completedAt) continue;

      const date = new Date(job.completedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = {
          revenue: 0,
          costs: 0,
          profit: 0,
          jobCount: 0,
          month: date.toLocaleString('default', { month: 'long' }),
          year: date.getFullYear(),
        };
      }

      revenueByMonth[monthKey].revenue += job.totalInvestment || 0;
      revenueByMonth[monthKey].costs += job.actualTotalCost || 0;
      revenueByMonth[monthKey].profit += (job.totalInvestment || 0) - (job.actualTotalCost || 0);
      revenueByMonth[monthKey].jobCount++;
    }

    // Convert to array and sort by date (most recent first)
    const result = Object.entries(revenueByMonth)
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => b.key.localeCompare(a.key))
      .slice(0, monthsToLookBack);

    return result;
  },
});

/**
 * Get revenue broken down by quarter
 * Returns revenue data for the last 8 quarters (2 years)
 */
export const getRevenueByQuarter = query({
  args: {
    quarters: v.optional(v.number()), // Number of quarters to look back (default: 8)
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) return [];

    const quartersToLookBack = args.quarters || 8;

    // Get all completed jobs
    const completedJobs = await ctx.db
      .query("jobs")
      .withIndex("by_company_status", (q) =>
        q.eq("companyId", orgId).eq("status", "completed")
      )
      .collect();

    // Group by quarter
    const revenueByQuarter: Record<string, {
      revenue: number;
      costs: number;
      profit: number;
      jobCount: number;
      quarter: number;
      year: number;
    }> = {};

    for (const job of completedJobs) {
      if (!job.completedAt) continue;

      const date = new Date(job.completedAt);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const quarterKey = `${date.getFullYear()}-Q${quarter}`;

      if (!revenueByQuarter[quarterKey]) {
        revenueByQuarter[quarterKey] = {
          revenue: 0,
          costs: 0,
          profit: 0,
          jobCount: 0,
          quarter,
          year: date.getFullYear(),
        };
      }

      revenueByQuarter[quarterKey].revenue += job.totalInvestment || 0;
      revenueByQuarter[quarterKey].costs += job.actualTotalCost || 0;
      revenueByQuarter[quarterKey].profit += (job.totalInvestment || 0) - (job.actualTotalCost || 0);
      revenueByQuarter[quarterKey].jobCount++;
    }

    // Convert to array and sort by date (most recent first)
    const result = Object.entries(revenueByQuarter)
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => b.key.localeCompare(a.key))
      .slice(0, quartersToLookBack);

    return result;
  },
});

// ============================================================================
// 2. PROJECT METRICS
// ============================================================================

/**
 * Get project counts by status
 */
export const getProjectsByStatus = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) return [];

    // Get all jobs for this organization
    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    // Count by status
    const statusCounts: Record<string, number> = {
      draft: 0,
      sent: 0,
      accepted: 0,
      scheduled: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };

    let totalValue = 0;
    let totalCount = 0;

    for (const job of allJobs) {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
      totalValue += job.totalInvestment || 0;
      totalCount++;
    }

    const averageProjectValue = totalCount > 0 ? totalValue / totalCount : 0;

    return {
      byStatus: statusCounts,
      totalProjects: totalCount,
      averageProjectValue,
    };
  },
});

/**
 * Get project completion metrics
 */
export const getProjectCompletionMetrics = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) {
      return {
        totalProjects: 0,
        completedProjects: 0,
        completionRate: 0,
        completedThisMonth: 0,
        completedLastMonth: 0,
        monthOverMonthChange: 0,
      };
    }

    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    const completedJobs = allJobs.filter(j => j.status === "completed");
    const nonCancelledJobs = allJobs.filter(j => j.status !== "cancelled");

    const completionRate = nonCancelledJobs.length > 0
      ? (completedJobs.length / nonCancelledJobs.length) * 100
      : 0;

    // Calculate this month vs last month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const completedThisMonth = completedJobs.filter(j =>
      j.completedAt && j.completedAt >= thisMonthStart.getTime()
    ).length;

    const completedLastMonth = completedJobs.filter(j =>
      j.completedAt &&
      j.completedAt >= lastMonthStart.getTime() &&
      j.completedAt <= lastMonthEnd.getTime()
    ).length;

    return {
      totalProjects: allJobs.length,
      completedProjects: completedJobs.length,
      completionRate,
      completedThisMonth,
      completedLastMonth,
      monthOverMonthChange: completedLastMonth > 0
        ? ((completedThisMonth - completedLastMonth) / completedLastMonth) * 100
        : completedThisMonth > 0 ? 100 : 0,
    };
  },
});

/**
 * Get average project value
 */
export const getAverageProjectValue = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) {
      return {
        averageCompletedProjectValue: 0,
        averageActiveProjectValue: 0,
        averageAllProjectsValue: 0,
        totalProjectCount: 0,
        completedProjectCount: 0,
        activeProjectCount: 0,
      };
    }

    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    const completedJobs = allJobs.filter(j => j.status === "completed");
    const activeJobs = allJobs.filter(j =>
      j.status === "in_progress" ||
      j.status === "scheduled" ||
      j.status === "accepted"
    );

    const avgCompleted = completedJobs.length > 0
      ? completedJobs.reduce((sum, j) => sum + (j.totalInvestment || 0), 0) / completedJobs.length
      : 0;

    const avgActive = activeJobs.length > 0
      ? activeJobs.reduce((sum, j) => sum + (j.totalInvestment || 0), 0) / activeJobs.length
      : 0;

    const avgAll = allJobs.length > 0
      ? allJobs.reduce((sum, j) => sum + (j.totalInvestment || 0), 0) / allJobs.length
      : 0;

    return {
      averageCompletedProjectValue: avgCompleted,
      averageActiveProjectValue: avgActive,
      averageAllProjectsValue: avgAll,
      totalProjectCount: allJobs.length,
      completedProjectCount: completedJobs.length,
      activeProjectCount: activeJobs.length,
    };
  },
});

// ============================================================================
// 3. EMPLOYEE PERFORMANCE
// ============================================================================

/**
 * Get top performing employees based on hours worked and productivity
 */
export const getTopPerformingEmployees = query({
  args: {
    limit: v.optional(v.number()), // Number of top employees to return (default: 10)
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) return [];

    const limit = args.limit || 10;

    // Get all employees for this organization
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get all time logs for completed jobs
    const completedJobs = await ctx.db
      .query("jobs")
      .withIndex("by_company_status", (q) =>
        q.eq("companyId", orgId).eq("status", "completed")
      )
      .collect();

    const completedJobIds = new Set(completedJobs.map(j => j._id));

    // Aggregate time logs by employee
    const employeeStats: Record<string, {
      name: string;
      position: string;
      totalHours: number;
      productiveHours: number;
      supportHours: number;
      totalCost: number;
      jobsWorked: Set<string>;
      effectiveRate: number;
    }> = {};

    // Get all time logs
    const allTimeLogs = await ctx.db.query("timeLogs").collect();

    for (const log of allTimeLogs) {
      // Only include time logs from completed jobs
      if (!completedJobIds.has(log.jobId)) continue;
      if (!log.durationHours) continue;

      const employeeIdStr = log.employeeId;

      if (!employeeStats[employeeIdStr]) {
        const employee = employees.find(e => e._id === log.employeeId);
        if (!employee) continue;

        employeeStats[employeeIdStr] = {
          name: employee.name,
          position: employee.position || employee.positionCode || "N/A",
          totalHours: 0,
          productiveHours: 0,
          supportHours: 0,
          totalCost: 0,
          jobsWorked: new Set(),
          effectiveRate: employee.effectiveRate || 0,
        };
      }

      employeeStats[employeeIdStr].totalHours += log.durationHours;
      employeeStats[employeeIdStr].totalCost += log.totalCost || 0;
      employeeStats[employeeIdStr].jobsWorked.add(log.jobId);

      if (log.taskType === "productive") {
        employeeStats[employeeIdStr].productiveHours += log.durationHours;
      } else {
        employeeStats[employeeIdStr].supportHours += log.durationHours;
      }
    }

    // Convert to array and calculate productivity metrics
    const employeeArray = Object.entries(employeeStats).map(([id, stats]) => ({
      employeeId: id,
      name: stats.name,
      position: stats.position,
      totalHours: stats.totalHours,
      productiveHours: stats.productiveHours,
      supportHours: stats.supportHours,
      totalCost: stats.totalCost,
      jobsWorked: stats.jobsWorked.size,
      effectiveRate: stats.effectiveRate,
      productivityRatio: stats.totalHours > 0
        ? (stats.productiveHours / stats.totalHours) * 100
        : 0,
      averageCostPerHour: stats.totalHours > 0
        ? stats.totalCost / stats.totalHours
        : 0,
    }));

    // Sort by total hours (descending)
    const sortedByHours = [...employeeArray].sort((a, b) => b.totalHours - a.totalHours);

    // Sort by productivity ratio (descending)
    const sortedByProductivity = [...employeeArray].sort((a, b) => b.productivityRatio - a.productivityRatio);

    return {
      topByHours: sortedByHours.slice(0, limit),
      topByProductivity: sortedByProductivity.slice(0, limit),
      allEmployees: employeeArray,
    };
  },
});

/**
 * Get average hourly cost by employee
 */
export const getEmployeeHourlyCosts = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) return [];

    const employees = await ctx.db
      .query("employees")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    const employeeCosts = employees.map(emp => ({
      employeeId: emp._id,
      name: emp.name,
      position: emp.position || emp.positionCode || "N/A",
      effectiveRate: emp.effectiveRate || 0,
      baseHourlyRate: emp.baseHourlyRate || emp.hourlyRate || 0,
      qualificationRate: emp.qualificationRate || 0,
      burdenMultiplier: emp.burdenMultiplier || 0,
      isActive: emp.isActive,
    }));

    // Sort by effective rate (descending)
    employeeCosts.sort((a, b) => b.effectiveRate - a.effectiveRate);

    const averageEffectiveRate = employeeCosts.length > 0
      ? employeeCosts.reduce((sum, emp) => sum + emp.effectiveRate, 0) / employeeCosts.length
      : 0;

    return {
      employees: employeeCosts,
      averageEffectiveRate,
      totalEmployees: employeeCosts.length,
      activeEmployees: employeeCosts.filter(e => e.isActive).length,
    };
  },
});

/**
 * Get billable vs non-billable time ratio per employee
 */
export const getEmployeeBillableRatio = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) return [];

    const employees = await ctx.db
      .query("employees")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    // Get all time logs
    const allTimeLogs = await ctx.db.query("timeLogs").collect();

    // Filter time logs to only include those for jobs in this organization
    const orgJobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();
    const orgJobIds = new Set(orgJobs.map(j => j._id));

    const relevantTimeLogs = allTimeLogs.filter(log => orgJobIds.has(log.jobId));

    // Aggregate by employee
    const employeeRatios: Record<string, {
      name: string;
      position: string;
      productiveHours: number;
      supportHours: number;
      totalHours: number;
      billableRatio: number;
    }> = {};

    for (const log of relevantTimeLogs) {
      if (!log.durationHours) continue;

      const empIdStr = log.employeeId;

      if (!employeeRatios[empIdStr]) {
        const employee = employees.find(e => e._id === log.employeeId);
        if (!employee) continue;

        employeeRatios[empIdStr] = {
          name: employee.name,
          position: employee.position || employee.positionCode || "N/A",
          productiveHours: 0,
          supportHours: 0,
          totalHours: 0,
          billableRatio: 0,
        };
      }

      employeeRatios[empIdStr].totalHours += log.durationHours;

      if (log.taskType === "productive") {
        employeeRatios[empIdStr].productiveHours += log.durationHours;
      } else {
        employeeRatios[empIdStr].supportHours += log.durationHours;
      }
    }

    // Calculate ratios
    const result = Object.entries(employeeRatios).map(([id, data]) => ({
      employeeId: id,
      ...data,
      billableRatio: data.totalHours > 0
        ? (data.productiveHours / data.totalHours) * 100
        : 0,
    }));

    // Sort by billable ratio (descending)
    result.sort((a, b) => b.billableRatio - a.billableRatio);

    return result;
  },
});

// ============================================================================
// 4. EQUIPMENT UTILIZATION
// ============================================================================

/**
 * Get most used equipment with utilization metrics
 */
export const getEquipmentUtilization = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) return [];

    const equipment = await ctx.db
      .query("equipment")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    // Note: The current schema doesn't directly track which equipment is used in each time log
    // This is an approximation based on equipment cost presence
    // A future enhancement would be to add equipmentIds array to timeLogs

    const equipmentStats = equipment.map(equip => {
      // Calculate hours based on available hours per year
      const annualHours = equip.annualOperatingHours || 2000; // Default 2000 hours/year
      const hoursPerMonth = annualHours / 12;

      return {
        equipmentId: equip._id,
        name: equip.name,
        type: equip.type,
        hourlyCost: equip.hourlyCost,
        isActive: equip.isActive,
        // These would need to be calculated from actual usage tracking
        // For now, returning the base cost structure
        hourlyDepreciation: equip.hourlyDepreciation || 0,
        hourlyFuel: equip.hourlyFuel || 0,
        hourlyMaintenance: equip.hourlyMaintenance || 0,
        annualOperatingHours: annualHours,
        estimatedMonthlyHours: hoursPerMonth,
      };
    });

    // Sort by hourly cost (descending)
    equipmentStats.sort((a, b) => b.hourlyCost - a.hourlyCost);

    const averageHourlyCost = equipmentStats.length > 0
      ? equipmentStats.reduce((sum, eq) => sum + eq.hourlyCost, 0) / equipmentStats.length
      : 0;

    return {
      equipment: equipmentStats,
      totalEquipment: equipmentStats.length,
      activeEquipment: equipmentStats.filter(e => e.isActive).length,
      averageHourlyCost,
    };
  },
});

/**
 * Get average hourly cost by equipment type
 */
export const getEquipmentCostsByType = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) return [];

    const equipment = await ctx.db
      .query("equipment")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    // Group by type
    const typeStats: Record<string, {
      count: number;
      totalCost: number;
      averageCost: number;
      activeCount: number;
    }> = {};

    for (const equip of equipment) {
      if (!typeStats[equip.type]) {
        typeStats[equip.type] = {
          count: 0,
          totalCost: 0,
          averageCost: 0,
          activeCount: 0,
        };
      }

      typeStats[equip.type].count++;
      typeStats[equip.type].totalCost += equip.hourlyCost;
      if (equip.isActive) {
        typeStats[equip.type].activeCount++;
      }
    }

    // Calculate averages
    const result = Object.entries(typeStats).map(([type, stats]) => ({
      type,
      count: stats.count,
      activeCount: stats.activeCount,
      totalHourlyCost: stats.totalCost,
      averageHourlyCost: stats.count > 0 ? stats.totalCost / stats.count : 0,
    }));

    // Sort by total cost (descending)
    result.sort((a, b) => b.totalHourlyCost - a.totalHourlyCost);

    return result;
  },
});

// ============================================================================
// 5. CUSTOMER ANALYTICS
// ============================================================================

/**
 * Get top customers by revenue
 */
export const getTopCustomers = query({
  args: {
    limit: v.optional(v.number()), // Number of top customers to return (default: 10)
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) return [];

    const limit = args.limit || 10;

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    // Aggregate by customer
    const customerStats: Record<string, {
      customerId: string;
      customerName: string;
      totalRevenue: number;
      totalProfit: number;
      projectCount: number;
      completedProjects: number;
      averageProjectValue: number;
      lastProjectDate?: number;
    }> = {};

    for (const job of jobs) {
      if (!job.customerId) continue;

      const custIdStr = job.customerId;

      if (!customerStats[custIdStr]) {
        const customer = customers.find(c => c._id === job.customerId);
        if (!customer) continue;

        const customerName = customer.businessName ||
          `${customer.firstName} ${customer.lastName}`.trim() ||
          "Unknown Customer";

        customerStats[custIdStr] = {
          customerId: custIdStr,
          customerName,
          totalRevenue: 0,
          totalProfit: 0,
          projectCount: 0,
          completedProjects: 0,
          averageProjectValue: 0,
        };
      }

      customerStats[custIdStr].projectCount++;
      customerStats[custIdStr].totalRevenue += job.totalInvestment || 0;

      if (job.status === "completed") {
        customerStats[custIdStr].completedProjects++;
        const profit = (job.totalInvestment || 0) - (job.actualTotalCost || 0);
        customerStats[custIdStr].totalProfit += profit;

        // Track last project date
        if (job.completedAt) {
          if (!customerStats[custIdStr].lastProjectDate ||
              job.completedAt > customerStats[custIdStr].lastProjectDate!) {
            customerStats[custIdStr].lastProjectDate = job.completedAt;
          }
        }
      }
    }

    // Calculate averages and convert to array
    const customerArray = Object.values(customerStats).map(stat => ({
      ...stat,
      averageProjectValue: stat.projectCount > 0
        ? stat.totalRevenue / stat.projectCount
        : 0,
      averageProfitPerProject: stat.completedProjects > 0
        ? stat.totalProfit / stat.completedProjects
        : 0,
      completionRate: stat.projectCount > 0
        ? (stat.completedProjects / stat.projectCount) * 100
        : 0,
    }));

    // Sort by total revenue (descending)
    const topByRevenue = [...customerArray].sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Sort by project count (descending)
    const topByProjectCount = [...customerArray].sort((a, b) => b.projectCount - a.projectCount);

    return {
      topByRevenue: topByRevenue.slice(0, limit),
      topByProjectCount: topByProjectCount.slice(0, limit),
      totalCustomers: customerArray.length,
      totalRevenue: customerArray.reduce((sum, c) => sum + c.totalRevenue, 0),
    };
  },
});

/**
 * Get average project value per customer
 */
export const getCustomerProjectValues = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) return [];

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    // Calculate customer lifetime values
    const customerValues: Record<string, {
      customerId: string;
      customerName: string;
      totalValue: number;
      projectCount: number;
      averageValue: number;
    }> = {};

    for (const job of jobs) {
      if (!job.customerId) continue;

      const custIdStr = job.customerId;

      if (!customerValues[custIdStr]) {
        const customer = customers.find(c => c._id === job.customerId);
        if (!customer) continue;

        const customerName = customer.businessName ||
          `${customer.firstName} ${customer.lastName}`.trim() ||
          "Unknown Customer";

        customerValues[custIdStr] = {
          customerId: custIdStr,
          customerName,
          totalValue: 0,
          projectCount: 0,
          averageValue: 0,
        };
      }

      customerValues[custIdStr].totalValue += job.totalInvestment || 0;
      customerValues[custIdStr].projectCount++;
    }

    // Calculate averages
    const result = Object.values(customerValues).map(cv => ({
      ...cv,
      averageValue: cv.projectCount > 0 ? cv.totalValue / cv.projectCount : 0,
    }));

    // Sort by average value (descending)
    result.sort((a, b) => b.averageValue - a.averageValue);

    const overallAverage = result.length > 0
      ? result.reduce((sum, c) => sum + c.averageValue, 0) / result.length
      : 0;

    return {
      customers: result,
      overallAverageProjectValue: overallAverage,
      totalCustomers: result.length,
    };
  },
});

/**
 * Get repeat customer rate
 */
export const getRepeatCustomerRate = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) {
      return {
        totalCustomers: 0,
        repeatCustomers: 0,
        oneTimeCustomers: 0,
        repeatCustomerRate: 0,
        averageProjectsPerCustomer: 0,
        totalProjects: 0,
      };
    }

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    // Count projects per customer
    const projectCountByCustomer: Record<string, number> = {};

    for (const job of jobs) {
      if (!job.customerId) continue;
      const custIdStr = job.customerId;
      projectCountByCustomer[custIdStr] = (projectCountByCustomer[custIdStr] || 0) + 1;
    }

    const totalCustomers = Object.keys(projectCountByCustomer).length;
    const repeatCustomers = Object.values(projectCountByCustomer).filter(count => count > 1).length;
    const oneTimeCustomers = Object.values(projectCountByCustomer).filter(count => count === 1).length;

    const repeatCustomerRate = totalCustomers > 0
      ? (repeatCustomers / totalCustomers) * 100
      : 0;

    // Calculate average projects per customer
    const totalProjects = Object.values(projectCountByCustomer).reduce((sum, count) => sum + count, 0);
    const avgProjectsPerCustomer = totalCustomers > 0
      ? totalProjects / totalCustomers
      : 0;

    return {
      totalCustomers,
      repeatCustomers,
      oneTimeCustomers,
      repeatCustomerRate,
      averageProjectsPerCustomer: avgProjectsPerCustomer,
      totalProjects,
    };
  },
});

// ============================================================================
// 6. COMPREHENSIVE DASHBOARD OVERVIEW
// ============================================================================

/**
 * Get all key metrics in a single query for dashboard display
 */
export const getDashboardOverview = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) {
      return {
        financial: {
          totalRevenue: 0,
          totalCosts: 0,
          totalProfit: 0,
          averageProfitMargin: 0,
        },
        projects: {
          total: 0,
          completed: 0,
          active: 0,
          completionRate: 0,
        },
        employees: {
          total: 0,
          active: 0,
        },
        customers: {
          total: 0,
          active: 0,
        },
        equipment: {
          total: 0,
          active: 0,
        },
      };
    }

    // Get all data in parallel
    const [
      jobs,
      employees,
      customers,
      equipment,
    ] = await Promise.all([
      ctx.db.query("jobs").withIndex("by_company", (q) => q.eq("companyId", orgId)).collect(),
      ctx.db.query("employees").withIndex("by_company", (q) => q.eq("companyId", orgId)).collect(),
      ctx.db.query("customers").withIndex("by_company", (q) => q.eq("companyId", orgId)).collect(),
      ctx.db.query("equipment").withIndex("by_company", (q) => q.eq("companyId", orgId)).collect(),
    ]);

    const completedJobs = jobs.filter(j => j.status === "completed");
    const activeJobs = jobs.filter(j =>
      j.status === "in_progress" ||
      j.status === "scheduled" ||
      j.status === "accepted"
    );

    // Financial metrics
    const totalRevenue = completedJobs.reduce((sum, j) => sum + (j.totalInvestment || 0), 0);
    const totalCosts = completedJobs.reduce((sum, j) => sum + (j.actualTotalCost || 0), 0);
    const totalProfit = totalRevenue - totalCosts;
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Project metrics
    const totalProjects = jobs.length;
    const completedProjects = completedJobs.length;
    const activeProjects = activeJobs.length;

    // Employee metrics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.isActive).length;

    // Customer metrics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive !== false).length;

    // Equipment metrics
    const totalEquipment = equipment.length;
    const activeEquipment = equipment.filter(e => e.isActive).length;

    return {
      financial: {
        totalRevenue,
        totalCosts,
        totalProfit,
        averageProfitMargin: avgProfitMargin,
      },
      projects: {
        total: totalProjects,
        completed: completedProjects,
        active: activeProjects,
        completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
      },
      employees: {
        total: totalEmployees,
        active: activeEmployees,
      },
      customers: {
        total: totalCustomers,
        active: activeCustomers,
      },
      equipment: {
        total: totalEquipment,
        active: activeEquipment,
      },
    };
  },
});

// ============================================================================
// 7. LEGACY ANALYTICS (for backward compatibility)
// ============================================================================

/**
 * Get comprehensive analytics data for the dashboard (legacy version)
 * Maintained for backward compatibility with existing code
 */
export const getAnalytics = query({
  args: {
    dateRange: v.optional(
      v.union(
        v.literal("this_month"),
        v.literal("last_30_days"),
        v.literal("last_quarter"),
        v.literal("all_time")
      )
    ),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);
    if (!orgId) return null;

    const dateRange = args.dateRange || "this_month";

    // Calculate date filter
    const now = Date.now();
    let startDate = 0;

    if (dateRange === "this_month") {
      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      startDate = date.getTime();
    } else if (dateRange === "last_30_days") {
      startDate = now - 30 * 24 * 60 * 60 * 1000;
    } else if (dateRange === "last_quarter") {
      startDate = now - 90 * 24 * 60 * 60 * 1000;
    }
    // all_time: startDate = 0

    // Fetch all project reports for the organization
    const allReports = await ctx.db
      .query("projectReports")
      .withIndex("by_company_completed", (q) => q.eq("companyId", orgId))
      .collect();

    // Filter reports by date range
    const reports = allReports.filter(
      (r) => r.completedAt >= startDate
    );

    // Fetch all jobs for project status
    const allJobs = await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .collect();

    // Calculate financial metrics
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let projectsCompleted = 0;

    reports.forEach((report) => {
      totalRevenue += report.totalInvestment || 0;
      totalCost += report.actualTotalCost || 0;
      totalProfit += report.profit || 0;
      projectsCompleted++;
    });

    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Project status breakdown
    const projectsByStatus = {
      draft: allJobs.filter((j) => j.status === "draft").length,
      sent: allJobs.filter((j) => j.status === "sent").length,
      accepted: allJobs.filter((j) => j.status === "accepted").length,
      scheduled: allJobs.filter((j) => j.status === "scheduled").length,
      in_progress: allJobs.filter((j) => j.status === "in_progress").length,
      completed: allJobs.filter((j) => j.status === "completed").length,
      cancelled: allJobs.filter((j) => j.status === "cancelled").length,
    };

    const activeProjects =
      projectsByStatus.scheduled +
      projectsByStatus.in_progress +
      projectsByStatus.accepted;

    // Get all time logs for employee performance
    const timeLogs = await ctx.db
      .query("timeLogs")
      .collect();

    // Filter time logs by date range and calculate employee stats
    const employeeStats: Record<
      string,
      {
        employeeId: string;
        name: string;
        totalHours: number;
        productiveHours: number;
        supportHours: number;
        totalCost: number;
        totalRevenue: number;
      }
    > = {};

    for (const log of timeLogs) {
      if (log.createdAt < startDate) continue;

      const employee = await ctx.db.get(log.employeeId);
      if (!employee || employee.companyId !== orgId) continue;

      if (!employeeStats[log.employeeId]) {
        employeeStats[log.employeeId] = {
          employeeId: log.employeeId,
          name: employee.name,
          totalHours: 0,
          productiveHours: 0,
          supportHours: 0,
          totalCost: 0,
          totalRevenue: 0,
        };
      }

      employeeStats[log.employeeId].totalHours += log.durationHours || 0;
      if (log.taskType === "productive") {
        employeeStats[log.employeeId].productiveHours += log.durationHours || 0;
      } else {
        employeeStats[log.employeeId].supportHours += log.durationHours || 0;
      }
      employeeStats[log.employeeId].totalCost += log.totalCost || 0;

      // Try to get revenue from the job
      if (log.jobId) {
        const job = await ctx.db.get(log.jobId);
        if (job && job.status === "completed") {
          // Approximate revenue contribution based on hours worked
          const jobTotalHours =
            (job.actualProductiveHours || 0) + (job.actualSupportHours || 0);
          if (jobTotalHours > 0) {
            const revenueShare =
              ((log.durationHours || 0) / jobTotalHours) *
              (job.totalInvestment || 0);
            employeeStats[log.employeeId].totalRevenue += revenueShare;
          }
        }
      }
    }

    // Top 5 employees by total hours
    const topEmployees = Object.values(employeeStats)
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5);

    // Get customer revenue stats
    const customerStats: Record<
      string,
      {
        customerId: string;
        name: string;
        totalRevenue: number;
        projectCount: number;
      }
    > = {};

    for (const report of reports) {
      // Get customer from job
      const job = await ctx.db.get(report.jobId);
      if (!job || !job.customerId) continue;

      const customer = await ctx.db.get(job.customerId);
      if (!customer) continue;

      const customerId = job.customerId;
      const customerName = `${customer.firstName} ${customer.lastName}`;

      if (!customerStats[customerId]) {
        customerStats[customerId] = {
          customerId,
          name: customerName,
          totalRevenue: 0,
          projectCount: 0,
        };
      }

      customerStats[customerId].totalRevenue += report.totalInvestment || 0;
      customerStats[customerId].projectCount++;
    }

    // Top 5 customers by revenue
    const topCustomers = Object.values(customerStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Get equipment utilization
    const allEquipment = await ctx.db
      .query("equipment")
      .withIndex("by_company", (q) => q.eq("companyId", orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Calculate equipment usage from time logs
    const equipmentUsage: Record<
      string,
      {
        equipmentId: string;
        name: string;
        type: string;
        totalHours: number;
        totalCost: number;
        hourlyCost: number;
        utilization: number; // percentage
      }
    > = {};

    // Initialize equipment stats
    for (const eq of allEquipment) {
      equipmentUsage[eq._id] = {
        equipmentId: eq._id,
        name: eq.name,
        type: eq.type,
        totalHours: 0,
        totalCost: eq.hourlyCost || 0,
        hourlyCost: eq.hourlyCost || 0,
        utilization: 0,
      };
    }

    // Count hours from time logs (estimate equipment usage)
    // Assuming equipment was used during productive hours
    for (const log of timeLogs) {
      if (log.createdAt < startDate || log.taskType !== "productive") continue;

      const job = await ctx.db.get(log.jobId);
      if (!job) continue;

      // For now, we'll estimate based on equipment cost in the log
      if (log.equipmentCost && log.durationHours) {
        // Try to match equipment by cost per hour
        const matchedEquipment = Object.values(equipmentUsage).find(
          (eq) => Math.abs(eq.hourlyCost - (log.equipmentCost! / log.durationHours!)) < 1
        );

        if (matchedEquipment) {
          matchedEquipment.totalHours += log.durationHours || 0;
        }
      }
    }

    // Calculate utilization (assuming 8 hours per day, 5 days per week)
    const daysInRange =
      dateRange === "this_month"
        ? 30
        : dateRange === "last_30_days"
        ? 30
        : dateRange === "last_quarter"
        ? 90
        : 365;
    const maxHours = daysInRange * 8; // Assuming single shift

    Object.values(equipmentUsage).forEach((eq) => {
      eq.utilization = maxHours > 0 ? (eq.totalHours / maxHours) * 100 : 0;
    });

    // Sort equipment by utilization
    const equipmentList = Object.values(equipmentUsage)
      .sort((a, b) => b.utilization - a.utilization);

    // Revenue trend (simplified - last 6 periods)
    const revenueTrend: Array<{ period: string; revenue: number; cost: number }> = [];

    // Calculate monthly trend for the selected range
    if (dateRange !== "all_time") {
      const periods = dateRange === "last_quarter" ? 3 : 6;
      const periodLength = dateRange === "last_quarter"
        ? 30 * 24 * 60 * 60 * 1000
        : dateRange === "this_month"
        ? 5 * 24 * 60 * 60 * 1000 // Weekly for this month
        : 5 * 24 * 60 * 60 * 1000; // Weekly for last 30 days

      for (let i = periods - 1; i >= 0; i--) {
        const periodEnd = now - i * periodLength;
        const periodStart = periodEnd - periodLength;

        const periodReports = allReports.filter(
          (r) => r.completedAt >= periodStart && r.completedAt < periodEnd
        );

        const periodRevenue = periodReports.reduce(
          (sum, r) => sum + (r.totalInvestment || 0),
          0
        );
        const periodCost = periodReports.reduce(
          (sum, r) => sum + (r.actualTotalCost || 0),
          0
        );

        const periodLabel =
          dateRange === "last_quarter"
            ? new Date(periodStart).toLocaleDateString("en-US", {
                month: "short",
              })
            : `Week ${periods - i}`;

        revenueTrend.push({
          period: periodLabel,
          revenue: periodRevenue,
          cost: periodCost,
        });
      }
    }

    return {
      dateRange,
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
        projectsCompleted,
        activeProjects,
      },
      projectsByStatus,
      topEmployees,
      topCustomers,
      equipmentList,
      revenueTrend,
    };
  },
});
