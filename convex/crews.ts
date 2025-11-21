import { query } from "./_generated/server";

// List all active crews
export const listCrews = query({
  args: {},
  handler: async (ctx) => {
    const crews = await ctx.db
      .query("crews")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Enrich with member names
    const enrichedCrews = await Promise.all(
      crews.map(async (crew) => {
        const members = await Promise.all(
          crew.memberIds.map((id) => ctx.db.get(id))
        );
        return {
          ...crew,
          members: members.filter((m) => m !== null),
        };
      })
    );

    return enrichedCrews;
  },
});
