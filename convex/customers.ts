import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getOrganizationId, requireOrganizationId } from "./auth";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// List all customers for user's organization
export const listCustomers = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    // If no orgId, return all customers (JWT claim not configured)
    if (!orgId) {
      console.warn("No orgId in listCustomers - returning all");
      return await ctx.db.query("customers").order("desc").collect();
    }

    const customers = await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("companyId"), orgId))
      .order("desc")
      .collect();

    return customers;
  },
});

// Get single customer
export const getCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);

    // Verify ownership - throws error if customer doesn't belong to user's org
    await verifyDocumentOwnershipOptional(ctx, customer, "customer");

    return customer;
  },
});

// Create new customer
export const createCustomer = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    businessName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    alternatePhone: v.optional(v.string()),
    streetAddress: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    propertyType: v.optional(v.string()),
    howDidTheyFindUs: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await requireOrganizationId(ctx);

    try {
      const customerId = await ctx.db.insert("customers", {
        companyId: orgId,
        firstName: args.firstName,
        lastName: args.lastName,
        businessName: args.businessName,
        email: args.email,
        phone: args.phone,
        alternatePhone: args.alternatePhone,
        streetAddress: args.streetAddress,
        city: args.city,
        state: args.state,
        zipCode: args.zipCode,
        propertyType: args.propertyType,
        howDidTheyFindUs: args.howDidTheyFindUs,
        notes: args.notes,
        isActive: true,
        createdAt: Date.now(),
      });

      console.log("Customer created successfully:", customerId);
      return customerId;
    } catch (error: any) {
      console.error("Error inserting customer:", error);
      throw new Error(`Database error: ${error.message}`);
    }
  },
});

// Update customer
export const updateCustomer = mutation({
  args: {
    customerId: v.id("customers"),
    firstName: v.string(),
    lastName: v.string(),
    businessName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    alternatePhone: v.optional(v.string()),
    streetAddress: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    propertyType: v.optional(v.string()),
    howDidTheyFindUs: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { customerId, ...data } = args;

    // Fetch and verify ownership before updating
    const customer = await ctx.db.get(customerId);
    await verifyDocumentOwnershipOptional(ctx, customer, "customer");

    await ctx.db.patch(customerId, data);

    return { success: true };
  },
});

// Delete customer
export const deleteCustomer = mutation({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    // Fetch and verify ownership before deleting
    const customer = await ctx.db.get(args.customerId);
    await verifyDocumentOwnershipOptional(ctx, customer, "customer");

    await ctx.db.delete(args.customerId);
    return { success: true };
  },
});

// Get customer with all related jobs
export const getCustomerWithJobs = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);

    if (!customer) return null;

    // Verify ownership
    await verifyDocumentOwnershipOptional(ctx, customer, "customer");

    // Get all jobs for this customer
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();

    return {
      ...customer,
      jobs,
    };
  },
});
