import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Jobs (Work Orders)
  jobs: defineTable({
    companyId: v.optional(v.string()), // Clerk organization ID (optional for backward compatibility)
    jobNumber: v.string(), // Auto-generated like "WO-1234"
    customerId: v.optional(v.id("customers")), // Links to customer record (optional for backward compat)

    // Lifecycle stage - changes display prefix (LE/PR/WO/IN/CO)
    lifecycleStage: v.optional(v.union(
      v.literal("LE"),  // Lead
      v.literal("PR"),  // Proposal
      v.literal("WO"),  // Work Order (default)
      v.literal("IN"),  // Invoice
      v.literal("CO")   // Complete
    )),

    status: v.union(
      v.literal("draft"),        // Being created/quoted
      v.literal("sent"),          // Sent to customer, awaiting response
      v.literal("accepted"),      // Customer approved
      v.literal("scheduled"),     // Job scheduled with crew
      v.literal("in_progress"),   // Crew working
      v.literal("completed"),     // Job finished
      v.literal("cancelled")      // Cancelled/rejected
    ),

    // Schedule (optional for draft/sent status)
    startDate: v.optional(v.string()), // ISO date string
    endDate: v.optional(v.string()),

    // Legacy Customer Info (denormalized - for backward compatibility)
    customerName: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    customerPhone: v.optional(v.string()),

    // Crew Assignment
    assignedCrewId: v.optional(v.id("crews")),

    // Totals
    estimatedTotalHours: v.number(),
    totalInvestment: v.number(), // Customer pays this (fixed price)

    // Actuals (calculated from time logs)
    actualProductiveHours: v.optional(v.number()),
    actualSupportHours: v.optional(v.number()),
    actualTotalCost: v.optional(v.number()),

    // Metadata
    notes: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_start_date", ["startDate"])
    .index("by_customer", ["customerId"])
    .index("by_company", ["companyId"])
    .index("by_company_status", ["companyId", "status"])
    .index("by_company_date", ["companyId", "startDate"]),

  // Job Line Items (Service Items in Work Order)
  jobLineItems: defineTable({
    jobId: v.id("jobs"),

    // Service Details
    serviceType: v.string(), // "forestry_mulching", "tree_removal", "transport", "setup", etc.
    displayName: v.string(), // "Forestry Mulching - 3.5 acres"

    // Scoring Data
    baseScore: v.number(), // Score before AFISS
    adjustedScore: v.number(), // Score after AFISS
    estimatedHours: v.number(),
    lineItemTotal: v.number(), // Price for this line item

    // Task Status
    status: v.optional(
      v.union(
        v.literal("not_started"),
        v.literal("in_progress"),
        v.literal("completed")
      )
    ), // Default: not_started

    // Scope details (for display)
    scopeDetails: v.optional(v.string()), // JSON string of scope inputs

    // Actuals (calculated from time logs)
    actualProductiveHours: v.optional(v.number()),
    actualProductionRate: v.optional(v.number()), // Score ÷ Actual Hours
    variance: v.optional(v.number()), // Actual - Estimated

    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_job", ["jobId"])
    .index("by_job_sort", ["jobId", "sortOrder"]),

  // Time Logs (Crew Time Tracking)
  timeLogs: defineTable({
    jobId: v.id("jobs"),
    jobLineItemId: v.optional(v.id("jobLineItems")), // Only for productive tasks
    employeeId: v.id("employees"),

    taskType: v.union(v.literal("productive"), v.literal("support")),
    taskName: v.string(), // "Forestry Mulching", "Setup", "Transport", etc.

    // Time tracking
    startTime: v.number(), // Unix timestamp
    endTime: v.optional(v.number()),
    durationHours: v.optional(v.number()), // Calculated when ended

    // Cost (captured at log time)
    employeeRate: v.number(), // Effective rate (with burden)
    equipmentCost: v.optional(v.number()), // Total equipment hourly cost
    totalCost: v.optional(v.number()), // (employeeRate + equipmentCost) × durationHours

    // Metadata
    notes: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_job", ["jobId"])
    .index("by_job_line_item", ["jobLineItemId"])
    .index("by_employee", ["employeeId"]),

  // Employees (Crew Members)
  employees: defineTable({
    companyId: v.optional(v.string()), // Optional for backward compatibility
    name: v.string(),

    // TreeShop Qualification Code System
    positionCode: v.optional(v.string()), // "TRS", "GC", "EO", etc.
    tierLevel: v.optional(v.number()), // 1-5 (experience level)
    baseHourlyRate: v.optional(v.number()), // Base rate before qualifications

    // Leadership & Certifications (add to base rate)
    hasLeadership: v.optional(v.boolean()), // +L ($3/hr)
    hasSupervisor: v.optional(v.boolean()), // +S ($7/hr)
    equipmentLevel: v.optional(v.number()), // 1-4 (+$0, +$1.50, +$4, +$7)
    hasCDL: v.optional(v.boolean()), // +$3/hr
    hasCrane: v.optional(v.boolean()), // +$4/hr
    hasOSHA: v.optional(v.boolean()), // +$2/hr

    // Calculated Qualification Rate
    qualificationRate: v.optional(v.number()), // Hourly rate after all qualifications
    qualificationCode: v.optional(v.string()), // "TRS4+S+E3+D3+CRA"

    // Burden & Final Cost
    burdenMultiplier: v.optional(v.number()), // 1.6-2.2x (tier-based)
    effectiveRate: v.number(), // Final cost per hour (qualificationRate × burdenMultiplier)

    // Legacy fields (backward compatibility)
    position: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    annualSalary: v.optional(v.number()),
    annualBenefits: v.optional(v.number()),
    annualPayrollTaxes: v.optional(v.number()),
    annualInsurance: v.optional(v.number()),
    totalAnnualCost: v.optional(v.number()),
    annualWorkingHours: v.optional(v.number()),
    hourlyCost: v.optional(v.number()),

    // Multi-track System Fields
    managementLevelId: v.optional(v.id("managementLevels")), // Links to management level
    reportsToEmployeeId: v.optional(v.id("employees")), // Self-referential for reporting hierarchy
    employmentType: v.optional(
      v.union(
        v.literal("full_time"),
        v.literal("part_time"),
        v.literal("seasonal"),
        v.literal("contractor")
      )
    ),
    hireDate: v.optional(v.string()), // ISO date string
    totalQualificationPremium: v.optional(v.number()), // Total qualification premium ($)

    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_company", ["companyId"])
    .index("by_company_active", ["companyId", "isActive"]),

  careerTracks: defineTable({
    companyId: v.optional(v.string()),
    trackType: v.union(v.literal("technical"), v.literal("management"), v.literal("professional"), v.literal("safety")),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    hourlyPremium: v.optional(v.number()),
    requiresCertification: v.boolean(),
    sortOrder: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_company_type", ["companyId", "trackType"])
    .index("by_company_active", ["companyId", "isActive"]),

  employeeSkills: defineTable({
    employeeId: v.id("employees"),
    trackId: v.id("careerTracks"),
    proficiencyLevel: v.union(v.literal("learning"), v.literal("qualified"), v.literal("expert")),
    isPrimary: v.boolean(),
    yearsExperience: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_track", ["trackId"])
    .index("by_employee_primary", ["employeeId", "isPrimary"]),

  // Management Levels
  managementLevels: defineTable({
    companyId: v.optional(v.string()),
    level: v.number(),
    title: v.string(),
    code: v.string(),
    hourlyPremium: v.number(),
    salaryRange: v.optional(v.string()),
    reportsToLevel: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_company_level", ["companyId", "level"]),

  // Certifications
  certifications: defineTable({
    companyId: v.optional(v.string()),
    name: v.string(),
    code: v.string(),
    category: v.union(v.literal("safety"), v.literal("professional"), v.literal("equipment"), v.literal("license")),
    requiresRenewal: v.boolean(),
    renewalPeriodMonths: v.optional(v.number()),
    hourlyPremium: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_company_category", ["companyId", "category"]),

  // Employee Certifications
  employeeCertifications: defineTable({
    employeeId: v.id("employees"),
    certificationId: v.id("certifications"),
    dateEarned: v.string(),
    expiresAt: v.optional(v.string()),
    certificationNumber: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_certification", ["certificationId"])
    .index("by_employee_active", ["employeeId", "isActive"]),

  // Crews (Team Assignments)
  crews: defineTable({
    companyId: v.optional(v.string()), // Optional for backward compatibility
    name: v.string(), // "Mulching Crew A"
    memberIds: v.array(v.id("employees")),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_company", ["companyId"]),

  // Equipment (For cost tracking)
  equipment: defineTable({
    companyId: v.optional(v.string()), // Optional for backward compatibility
    name: v.string(), // "Forestry Mulcher #2"
    year: v.optional(v.string()), // "2020"
    make: v.optional(v.string()), // "John Deere"
    model: v.optional(v.string()), // "803M"
    type: v.string(), // "mulcher", "chipper", "stump_grinder"
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),

    // Financial Data (TreeShop Method) - Optional for backward compatibility
    purchasePrice: v.optional(v.number()),
    usefulLifeYears: v.optional(v.number()),
    auctionPrice: v.optional(v.number()),
    annualOperatingHours: v.optional(v.number()),

    // Fuel
    fuelConsumptionPerHour: v.optional(v.number()), // gallons/hour
    fuelPricePerGallon: v.optional(v.number()), // DEPRECATED - use company defaultFuelPricePerGallon
    salvageValue: v.optional(v.number()), // DEPRECATED - use auctionPrice

    // Maintenance
    annualMaintenanceCost: v.optional(v.number()),
    annualOtherCosts: v.optional(v.number()), // filters, belts, etc.

    // Calculated Costs
    hourlyDepreciation: v.optional(v.number()),
    hourlyFuel: v.optional(v.number()),
    hourlyMaintenance: v.optional(v.number()),
    hourlyOther: v.optional(v.number()),
    hourlyCostBeforeOverhead: v.optional(v.number()),
    overheadMultiplier: v.optional(v.number()), // Default 1.15 (15% overhead)
    hourlyCost: v.number(), // Final cost per hour (always required)

    notes: v.optional(v.string()), // Detailed notes about this equipment

    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_company", ["companyId"]),

  // Equipment Categories
  equipmentCategories: defineTable({
    companyId: v.optional(v.string()),
    name: v.string(),
    code: v.string(),
    sortOrder: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_company_active", ["companyId", "isActive"]),

  // Equipment Types
  equipmentTypes: defineTable({
    companyId: v.optional(v.string()),
    categoryId: v.id("equipmentCategories"),
    name: v.string(),
    code: v.string(),
    defaultUsefulLife: v.optional(v.number()),
    defaultOperatingHours: v.optional(v.number()),
    requiresFuelTracking: v.boolean(),
    sortOrder: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_company", ["companyId"])
    .index("by_company_active", ["companyId", "isActive"]),

  // Company Settings
  companies: defineTable({
    companyId: v.optional(v.string()), // Clerk organization ID (optional for backward compatibility)
    name: v.string(),

    // Contact Info
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),

    // Financial Settings
    defaultProfitMargin: v.number(), // Default profit margin %
    defaultFuelPricePerGallon: v.optional(v.number()),
    defaultEquipmentOverhead: v.optional(v.number()),

    // SOPs and Documentation
    sops: v.optional(v.string()), // JSON string of SOPs or markdown

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_company", ["companyId"]),

  // Company Production Rate Defaults (for pricing)
  companyProductionRates: defineTable({
    companyId: v.optional(v.string()), // Optional for backward compatibility
    serviceType: v.string(), // "forestry_mulching", "stump_grinding", etc.

    unit: v.string(), // "acres", "stumps", "trees"
    averageRatePerDay: v.number(), // Company average for pricing

    conditions: v.optional(v.string()), // "light", "medium", "heavy"

    notes: v.optional(v.string()),
    lastUpdated: v.number(),
    createdAt: v.number(),
  })
    .index("by_service_type", ["serviceType"])
    .index("by_company", ["companyId"]),

  customers: defineTable({
    companyId: v.optional(v.string()), // Optional for backward compatibility

    // Personal Info
    firstName: v.string(),
    lastName: v.string(),
    businessName: v.optional(v.string()), // If commercial customer

    // Contact Info
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    alternatePhone: v.optional(v.string()),

    // Address
    streetAddress: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),

    // Additional Info
    propertyType: v.optional(v.string()), // "Residential", "Commercial", "Municipal"
    howDidTheyFindUs: v.optional(v.string()),
    notes: v.optional(v.string()),

    // Legacy fields (for backward compatibility)
    name: v.optional(v.string()), // Old single name field
    address: v.optional(v.string()), // Old single address field

    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_last_name", ["lastName"])
    .index("by_email", ["email"])
    .index("by_company", ["companyId"])
    .index("by_company_active", ["companyId", "isActive"]),

  // Production Rates (Employee productivity tracking)
  productionRates: defineTable({
    employeeId: v.id("employees"),
    serviceType: v.string(), // "forestry_mulching", "stump_grinding", "tree_removal", etc.

    // Production metrics
    unit: v.string(), // "acres", "stumps", "trees", "linear_feet", etc.
    ratePerDay: v.number(), // How many units per 8-hour day

    // Conditions/difficulty
    conditions: v.optional(v.string()), // "light", "medium", "heavy", "very_heavy"

    // Tracking
    isEstimated: v.boolean(), // true = estimate, false = calculated from actual performance
    lastUpdated: v.number(),
    createdAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_service_type", ["serviceType"]),

  // Proposals (Pre-sale estimates)
  proposals: defineTable({
    companyId: v.optional(v.string()), // Optional for backward compatibility
    proposalNumber: v.string(), // Auto-generated like "PROP-1234"
    customerId: v.id("customers"),

    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("expired")
    ),

    // Pricing
    subtotal: v.number(), // Sum of line items (cost)
    marginPercentage: v.number(), // e.g., 30 for 30% profit margin
    totalPrice: v.number(), // What customer pays

    // Validity
    validUntil: v.optional(v.string()), // ISO date string

    // Conversion
    convertedToJobId: v.optional(v.id("jobs")), // Set when accepted and converted

    // Metadata
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    sentAt: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_customer", ["customerId"])
    .index("by_created", ["createdAt"])
    .index("by_company", ["companyId"]),

  // Proposal Line Items
  proposalLineItems: defineTable({
    proposalId: v.id("proposals"),

    // Service Details
    serviceType: v.string(), // "forestry_mulching", "tree_removal", etc.
    displayName: v.string(), // "Forestry Mulching - 3.5 acres"
    description: v.optional(v.string()),

    // Quantity & Production
    quantity: v.number(), // e.g., 3.5 (acres)
    unit: v.string(), // "acres", "stumps", "trees"

    // Estimated crew/equipment
    estimatedEmployeeId: v.optional(v.id("employees")),
    estimatedEquipmentId: v.optional(v.id("equipment")),
    estimatedDays: v.number(), // Based on production rate
    estimatedHours: v.number(), // estimatedDays × 8

    // Cost breakdown
    laborCost: v.number(),
    equipmentCost: v.number(),
    totalCost: v.number(), // laborCost + equipmentCost

    // Pricing
    lineItemPrice: v.number(), // What customer pays (with profit margin)

    sortOrder: v.number(),
    createdAt: v.number(),
  })
    .index("by_proposal", ["proposalId"])
    .index("by_proposal_sort", ["proposalId", "sortOrder"]),

  // Loadouts (Pre-configured resource groups)
  loadouts: defineTable({
    companyId: v.optional(v.string()), // Optional for backward compatibility
    name: v.string(), // "Mulching Crew A", "Heavy Clearing Setup", etc.
    description: v.optional(v.string()),

    // Resources
    employeeIds: v.array(v.id("employees")), // All employees in this loadout
    equipmentIds: v.array(v.id("equipment")), // All equipment in this loadout

    // Calculated totals (for quick reference)
    totalHourlyCost: v.number(), // Sum of all employee + equipment costs

    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_company", ["companyId"]),

  // Loadout Production Rates (actual performance tracking)
  loadoutProductionRates: defineTable({
    loadoutId: v.id("loadouts"),
    serviceType: v.string(), // "forestry_mulching", etc.

    unit: v.string(), // "acres", "stumps", etc.
    actualRatePerDay: v.number(), // Actual measured performance

    conditions: v.optional(v.string()), // "light", "medium", "heavy"

    // Tracking
    jobCount: v.optional(v.number()), // How many jobs this is based on
    lastJobId: v.optional(v.id("jobs")), // Most recent job measured

    lastUpdated: v.number(),
    createdAt: v.number(),
  })
    .index("by_loadout", ["loadoutId"])
    .index("by_service_type", ["serviceType"]),

  // Project Reports (Generated when job is completed)
  projectReports: defineTable({
    companyId: v.optional(v.string()), // Organization ID (optional for backward compatibility)
    jobId: v.id("jobs"),
    jobNumber: v.string(),

    // Customer Info (snapshot at completion)
    customerName: v.string(),
    customerAddress: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),

    // Job Details
    status: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    completedAt: v.number(),

    // Financial Summary
    estimatedTotalHours: v.number(),
    actualProductiveHours: v.number(),
    actualSupportHours: v.number(),
    totalHours: v.number(), // productive + support

    totalInvestment: v.number(), // What customer paid
    actualTotalCost: v.number(), // What it cost us
    profit: v.number(), // Investment - Cost
    profitMargin: v.number(), // Percentage

    // Line Items Data (JSON string)
    lineItemsData: v.string(), // Array of line items with details

    // Time Logs Data (JSON string)
    timeLogsData: v.string(), // Array of time logs grouped by employee

    // Crew Members (JSON string)
    crewMembersData: v.optional(v.string()), // Array of crew member names and roles

    // Equipment Used (JSON string)
    equipmentData: v.optional(v.string()), // Equipment usage summary

    // Notes
    jobNotes: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_job", ["jobId"])
    .index("by_company", ["companyId"])
    .index("by_company_completed", ["companyId", "completedAt"]),
});
