import { query } from "./_generated/server";

export const checkAuth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    // Log everything we can see for debugging
    console.log("=== AUTH DEBUG ===");
    console.log("Has identity:", !!identity);
    if (identity) {
      console.log("Issuer:", identity.issuer);
      console.log("Subject:", identity.subject);
      console.log("All property keys:", Object.keys(identity));
      console.log("Full identity:", JSON.stringify(identity, null, 2));
    }

    return {
      hasIdentity: !!identity,
      identity: identity ? {
        subject: identity.subject,
        issuer: identity.issuer,
        tokenIdentifier: identity.tokenIdentifier,
        // Try multiple claim naming patterns
        // Note: Nested claims use dot notation string keys: identity["o.id"]
        orgId: (identity as any).org_id || (identity as any)["o.id"] || (identity as any).orgId || null,
        orgRole: (identity as any).org_role || (identity as any)["o.rol"] || (identity as any).orgRole || null,
        orgSlug: (identity as any).org_slug || (identity as any)["o.slg"] || (identity as any).orgSlug || null,
        // Debug: check what's in the 'o' claim
        oClaimRaw: (identity as any)["o.id"] || "not found via o.id",
        allClaims: identity,
      } : null,
    };
  },
});
