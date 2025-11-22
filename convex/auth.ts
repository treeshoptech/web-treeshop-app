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

    // Convex exposes custom JWT claims including nested ones using dot notation
    // For Clerk's organization claims:
    // - Custom JWT template: org_id (top-level)
    // - Default session token: o.id (nested, accessed as "o.id" string key)
    // - Legacy: orgId, org_id
    const orgId = (identity as any).org_id ||           // Custom JWT template claim
                  (identity as any)["o.id"] ||          // Clerk default session token (nested)
                  (identity as any).orgId ||            // Legacy format
                  null;

    console.log("getOrganizationId - orgId found:", orgId);
    console.log("getOrganizationId - all identity keys:", Object.keys(identity));
    console.log("getOrganizationId - checking o.id:", (identity as any)["o.id"]);

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
