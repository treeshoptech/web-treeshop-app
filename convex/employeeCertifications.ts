import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyDocumentOwnershipOptional } from "./authHelpers";

// Get all certifications for a specific employee
export const getEmployeeCertifications = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    // Verify employee exists and belongs to user's org
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) throw new Error("Employee not found");
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    // Get all active certifications for this employee
    const employeeCerts = await ctx.db
      .query("employeeCertifications")
      .filter((q) => q.eq(q.field("employeeId"), args.employeeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    // Enrich with certification details
    const enrichedCerts = await Promise.all(
      employeeCerts.map(async (empCert) => {
        const certification = await ctx.db.get(empCert.certificationId);
        return {
          ...empCert,
          certification,
        };
      })
    );

    return enrichedCerts;
  },
});

// Add certification to an employee
export const addCertification = mutation({
  args: {
    employeeId: v.id("employees"),
    certificationId: v.id("certifications"),
    dateEarned: v.string(),
    expiresAt: v.optional(v.string()),
    certificationNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify employee exists and belongs to user's org
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) throw new Error("Employee not found");
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    // Verify certification exists and belongs to user's org
    const certification = await ctx.db.get(args.certificationId);
    if (!certification) throw new Error("Certification not found");
    await verifyDocumentOwnershipOptional(ctx, certification, "certification");

    // Check if this employee already has this certification (active)
    const existingCert = await ctx.db
      .query("employeeCertifications")
      .filter((q) => q.eq(q.field("employeeId"), args.employeeId))
      .filter((q) => q.eq(q.field("certificationId"), args.certificationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existingCert) {
      throw new Error("Employee already has this certification. Please update or remove it first.");
    }

    const employeeCertificationId = await ctx.db.insert("employeeCertifications", {
      employeeId: args.employeeId,
      certificationId: args.certificationId,
      dateEarned: args.dateEarned,
      expiresAt: args.expiresAt,
      certificationNumber: args.certificationNumber,
      isActive: true,
      createdAt: Date.now(),
    });

    return employeeCertificationId;
  },
});

// Update employee certification
export const updateCertification = mutation({
  args: {
    employeeCertificationId: v.id("employeeCertifications"),
    dateEarned: v.string(),
    expiresAt: v.optional(v.string()),
    certificationNumber: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { employeeCertificationId, ...data } = args;

    // Fetch the employee certification
    const empCert = await ctx.db.get(employeeCertificationId);
    if (!empCert) throw new Error("Employee certification not found");

    // Verify employee belongs to user's org
    const employee = await ctx.db.get(empCert.employeeId);
    if (!employee) throw new Error("Employee not found");
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    await ctx.db.patch(employeeCertificationId, data);

    return { success: true };
  },
});

// Remove certification from an employee (soft delete)
export const removeCertification = mutation({
  args: { employeeCertificationId: v.id("employeeCertifications") },
  handler: async (ctx, args) => {
    // Fetch the employee certification
    const empCert = await ctx.db.get(args.employeeCertificationId);
    if (!empCert) throw new Error("Employee certification not found");

    // Verify employee belongs to user's org
    const employee = await ctx.db.get(empCert.employeeId);
    if (!employee) throw new Error("Employee not found");
    await verifyDocumentOwnershipOptional(ctx, employee, "employee");

    // Soft delete by setting isActive to false
    await ctx.db.patch(args.employeeCertificationId, { isActive: false });

    return { success: true };
  },
});
