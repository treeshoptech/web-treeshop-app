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
  try {
    const identity = await getUserIdentity(ctx);

    // Try multiple naming patterns for organization ID claim
    // Clerk v1: org_id, Clerk v2: o.id, Convex normalized: orgId
    const orgId = (identity as any).orgId ||
                  (identity as any).org_id ||
                  (identity as any).o?.id ||
                  null;

    console.log("getOrganizationId - orgId found:", orgId);
    console.log("getOrganizationId - all identity keys:", Object.keys(identity));

    if (!orgId || typeof orgId !== 'string') {
      console.warn("getOrganizationId - No valid org ID found in identity");
      return null;
    }

    return orgId as string;
  } catch (error) {
    console.error("getOrganizationId - Error:", error);
    return null;
  }
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
  return identity?.orgRole || "basic_member";
}
