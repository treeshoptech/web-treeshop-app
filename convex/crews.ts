import { query } from "./_generated/server";
import { requireOrganizationId } from "./auth";

// List all active crews
export const listCrews = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await requireOrganizationId(ctx);

    const crews = await ctx.db
      .query("crews")
      .filter((q) => q.eq(q.field("companyId"), orgId))
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Batch fetch all employee IDs upfront
    const allEmployeeIds = Array.from(
      new Set(crews.flatMap((crew) => crew.memberIds))
    );

    // Fetch all employees in a single batch
    const employees = await Promise.all(
      allEmployeeIds.map((id) => ctx.db.get(id))
    );

    // Create employee lookup map for O(1) access
    const employeeMap = new Map(
      employees.map((e, i) => [allEmployeeIds[i], e])
    );

    // Single-pass enrichment
    const enrichedCrews = crews.map((crew) => ({
      ...crew,
      members: crew.memberIds
        .map((id) => employeeMap.get(id))
        .filter((m) => m !== null && m !== undefined),
    }));

    return enrichedCrews;
  },
});
