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
        orgId: (identity as any).orgId || (identity as any).org_id || (identity as any).o?.id || null,
        orgRole: (identity as any).orgRole || (identity as any).org_role || (identity as any).o?.rol || null,
        orgSlug: (identity as any).orgSlug || (identity as any).org_slug || (identity as any).o?.slg || null,
        allClaims: identity,
      } : null,
    };
  },
});
