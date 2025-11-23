import { getOrganizationId } from "./auth";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// List all tracks for organization, optionally filter by type
export const listTracks = query({
  args: {
    trackType: v.optional(
      v.union(
        v.literal("technical"),
        v.literal("management"),
        v.literal("professional"),
        v.literal("safety")
      )
    ),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    console.log('careerTracks.listTracks - orgId:', orgId);

    // Build query - filter by orgId if available, otherwise show all
    let query = orgId
      ? ctx.db
          .query("careerTracks")
          .filter((q) => q.eq(q.field("companyId"), orgId))
      : ctx.db.query("careerTracks");

    // Optionally filter by track type
    if (args.trackType) {
      query = query.filter((q) => q.eq(q.field("trackType"), args.trackType));
    }

    const tracks = await query.order("desc").collect();

    console.log('careerTracks.listTracks - Found tracks:', tracks.length);

    // Sort by sortOrder
    return tracks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },
});

// Get single track
export const getTrack = query({
  args: { trackId: v.id("careerTracks") },
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);
    if (!track) throw new Error("Career track not found");

    // Verify ownership - throws error if track doesn't belong to user's org
    await verifyDocumentOwnershipOptional(ctx, track, "career track");

    return track;
  },
});

// Create new career track
export const createTrack = mutation({
  args: {
    trackType: v.union(
      v.literal("technical"),
      v.literal("management"),
      v.literal("professional"),
      v.literal("safety")
    ),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    hourlyPremium: v.optional(v.number()),
    requiresCertification: v.boolean(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    const trackId = await ctx.db.insert("careerTracks", {
      companyId: orgId ?? undefined,
      trackType: args.trackType,
      code: args.code,
      name: args.name,
      description: args.description,
      hourlyPremium: args.hourlyPremium,
      requiresCertification: args.requiresCertification,
      sortOrder: args.sortOrder ?? 0,
      isActive: true,
      createdAt: Date.now(),
    });

    return trackId;
  },
});

// Update track
export const updateTrack = mutation({
  args: {
    trackId: v.id("careerTracks"),
    trackType: v.union(
      v.literal("technical"),
      v.literal("management"),
      v.literal("professional"),
      v.literal("safety")
    ),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    hourlyPremium: v.optional(v.number()),
    requiresCertification: v.boolean(),
    sortOrder: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { trackId, ...data } = args;

    // Fetch and verify ownership before updating
    const track = await ctx.db.get(trackId);
    if (!track) throw new Error("Career track not found");
    await verifyDocumentOwnershipOptional(ctx, track, "career track");

    await ctx.db.patch(trackId, data);

    return { success: true };
  },
});

// Soft delete track (set isActive to false)
export const deleteTrack = mutation({
  args: { trackId: v.id("careerTracks") },
  handler: async (ctx, args) => {
    // Fetch and verify ownership before deleting
    const track = await ctx.db.get(args.trackId);
    if (!track) throw new Error("Career track not found");
    await verifyDocumentOwnershipOptional(ctx, track, "career track");

    // Check if any employees are using this track
    const skillsUsingTrack = await ctx.db
      .query("employeeSkills")
      .filter((q) => q.eq(q.field("trackId"), args.trackId))
      .collect();

    if (skillsUsingTrack.length > 0) {
      throw new Error(
        `Cannot delete career track. ${skillsUsingTrack.length} employee skill(s) are still using this track.`
      );
    }

    // Soft delete by setting isActive to false
    await ctx.db.patch(args.trackId, { isActive: false });

    return { success: true };
  },
});
