import { Auth } from "convex/server";
import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getUserIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export async function getOrganizationId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await getUserIdentity(ctx);

  // Clerk stores the active organization in the token
  const orgId = identity.orgId;

  if (!orgId || typeof orgId !== 'string') {
    return null;
  }

  return orgId as string;
}

export async function requireOrganizationId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const orgId = await getOrganizationId(ctx);

  if (!orgId) {
    throw new Error("No organization selected. Please create or join an organization in your account settings.");
  }

  return orgId;
}

export async function getUserRole(ctx: QueryCtx | MutationCtx) {
  const identity = await getUserIdentity(ctx);
  return identity.orgRole || "basic_member";
}
