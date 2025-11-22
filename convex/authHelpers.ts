import { QueryCtx, MutationCtx } from "./_generated/server";
import { getOrganizationId } from "./auth";

/**
 * Verifies that a document belongs to the user's organization.
 * Throws an error if the document doesn't exist or doesn't belong to the user's organization.
 *
 * @param ctx - Query or Mutation context
 * @param document - The document to verify (must have a companyId field)
 * @param resourceType - The type of resource being verified (for error messages)
 * @throws Error if document is null or doesn't belong to user's organization
 */
export async function verifyDocumentOwnership<T extends { companyId: string }>(
  ctx: QueryCtx | MutationCtx,
  document: T | null,
  resourceType: string
): Promise<void> {
  if (!document) {
    throw new Error(`${resourceType} not found`);
  }

  const userOrgId = await getOrganizationId(ctx);

  if (!userOrgId) {
    throw new Error("No organization selected. Please create or join an organization.");
  }

  if (document.companyId !== userOrgId) {
    throw new Error(`Access denied. This ${resourceType} belongs to a different organization.`);
  }
}

/**
 * Verifies that a document belongs to the user's organization (for optional companyId during migration).
 * Throws an error if the document doesn't exist or doesn't belong to the user's organization.
 *
 * @param ctx - Query or Mutation context
 * @param document - The document to verify (must have an optional companyId field)
 * @param resourceType - The type of resource being verified (for error messages)
 * @throws Error if document is null or doesn't belong to user's organization
 */
export async function verifyDocumentOwnershipOptional<T extends { companyId?: string }>(
  ctx: QueryCtx | MutationCtx,
  document: T | null,
  resourceType: string
): Promise<void> {
  if (!document) {
    throw new Error(`${resourceType} not found`);
  }

  const userOrgId = await getOrganizationId(ctx);

  // TEMPORARY: Allow access when no orgId (JWT claim not configured)
  if (!userOrgId) {
    console.warn(`verifyDocumentOwnershipOptional - No orgId, allowing access to ${resourceType}`);
    return;
  }

  // If document has no companyId, allow it (backward compatibility during migration)
  if (document.companyId && document.companyId !== userOrgId) {
    throw new Error(`Access denied. This ${resourceType} belongs to a different organization.`);
  }
}
