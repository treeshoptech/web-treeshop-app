import { query } from "./_generated/server";

export const checkAuth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    return {
      hasIdentity: !!identity,
      identity: identity ? {
        subject: identity.subject,
        issuer: identity.issuer,
        tokenIdentifier: identity.tokenIdentifier,
        orgId: identity.orgId,
        orgRole: identity.orgRole,
        orgSlug: identity.orgSlug,
        allClaims: identity,
      } : null,
    };
  },
});
