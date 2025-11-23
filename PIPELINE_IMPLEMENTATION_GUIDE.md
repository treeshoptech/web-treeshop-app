# Pipeline Implementation Guide
## Technical Specifications for Development

---

## OVERVIEW

This guide provides step-by-step implementation details for building the project lifecycle pipeline management system. It includes database migrations, API endpoints, React components, and state management patterns.

---

## PHASE 1: DATABASE SCHEMA UPDATES

### Step 1.1: Create Leads Table

```typescript
// convex/schema.ts

leads: defineTable({
  companyId: v.optional(v.string()),
  leadNumber: v.string(), // "LE-0001"
  customerId: v.id("customers"),

  status: v.union(
    v.literal("new"),
    v.literal("contacted"),
    v.literal("site_visit_scheduled"),
    v.literal("converted"),
    v.literal("lost")
  ),

  // Lead Details
  source: v.optional(v.string()), // "Google", "Referral", etc.
  estimatedValue: v.optional(v.number()),
  estimatedAcres: v.optional(v.number()),
  serviceTypeRequested: v.optional(v.string()),
  urgency: v.optional(v.union(
    v.literal("immediate"),
    v.literal("this_week"),
    v.literal("this_month"),
    v.literal("flexible")
  )),

  // Follow-up Tracking
  contactedAt: v.optional(v.number()),
  siteVisitDate: v.optional(v.string()),
  followUpDate: v.optional(v.string()),
  lastContactDate: v.optional(v.number()),

  // Conversion Tracking
  convertedToProposalId: v.optional(v.id("proposals")),
  convertedAt: v.optional(v.number()),
  lostReason: v.optional(v.string()),
  lostAt: v.optional(v.number()),

  // Notes
  notes: v.optional(v.string()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_status", ["status"])
.index("by_company", ["companyId"])
.index("by_company_status", ["companyId", "status"])
.index("by_customer", ["customerId"])
.index("by_created", ["createdAt"]);
```

### Step 1.2: Create Invoices Table

```typescript
// convex/schema.ts

invoices: defineTable({
  companyId: v.optional(v.string()),
  invoiceNumber: v.string(), // "IN-0001"

  // References
  jobId: v.id("jobs"),
  proposalId: v.optional(v.id("proposals")),
  customerId: v.id("customers"),

  status: v.union(
    v.literal("draft"),
    v.literal("sent"),
    v.literal("partial_payment"),
    v.literal("paid"),
    v.literal("overdue"),
    v.literal("void")
  ),

  // Dates
  invoiceDate: v.string(), // ISO date
  dueDate: v.string(),
  sentAt: v.optional(v.number()),
  paidAt: v.optional(v.number()),

  // Amounts
  subtotal: v.number(),
  taxRate: v.optional(v.number()), // 8.25 for 8.25%
  taxAmount: v.optional(v.number()),
  total: v.number(),
  amountPaid: v.number(),
  amountDue: v.number(),

  // Terms
  paymentTerms: v.string(), // "Net 30", "Due on Receipt"
  paymentTermsDays: v.number(), // 30, 0, 15, etc.

  // Line Items (from job)
  lineItemsSnapshot: v.optional(v.string()), // JSON snapshot of job line items

  // Payment Info
  lastPaymentDate: v.optional(v.number()),
  lastReminderSentAt: v.optional(v.number()),

  notes: v.optional(v.string()),
  customerNotes: v.optional(v.string()), // Shows on invoice

  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_status", ["status"])
.index("by_job", ["jobId"])
.index("by_customer", ["customerId"])
.index("by_company", ["companyId"])
.index("by_company_status", ["companyId", "status"])
.index("by_due_date", ["dueDate"])
.index("by_invoice_number", ["invoiceNumber"]);
```

### Step 1.3: Create Payments Table

```typescript
// convex/schema.ts

payments: defineTable({
  companyId: v.optional(v.string()),
  invoiceId: v.id("invoices"),

  amount: v.number(),
  paymentDate: v.string(), // ISO date

  paymentMethod: v.union(
    v.literal("check"),
    v.literal("cash"),
    v.literal("credit_card"),
    v.literal("debit_card"),
    v.literal("ach"),
    v.literal("wire"),
    v.literal("other")
  ),

  referenceNumber: v.optional(v.string()), // Check #, transaction ID

  // Metadata
  receivedBy: v.optional(v.string()), // Employee who recorded payment
  notes: v.optional(v.string()),

  createdAt: v.number(),
})
.index("by_invoice", ["invoiceId"])
.index("by_company", ["companyId"])
.index("by_payment_date", ["paymentDate"]);
```

### Step 1.4: Update Existing Tables

```typescript
// convex/schema.ts - Update proposals table

proposals: defineTable({
  // ... existing fields ...

  // ADD:
  leadId: v.optional(v.id("leads")), // Reference to original lead

  // UPDATE status:
  status: v.union(
    v.literal("draft"),
    v.literal("sent"),
    v.literal("accepted"),
    v.literal("rejected"),
    v.literal("expired"),
    v.literal("revised") // Customer requested changes
  ),

  // ... rest of fields ...
})

// convex/schema.ts - Update jobs table

jobs: defineTable({
  // ... existing fields ...

  // ADD:
  proposalId: v.optional(v.id("proposals")),
  leadId: v.optional(v.id("leads")), // For tracking full lifecycle
  invoiceId: v.optional(v.id("invoices")),

  // UPDATE status to clarify invoice stage:
  status: v.union(
    v.literal("draft"),
    v.literal("sent"),
    v.literal("accepted"),
    v.literal("scheduled"),
    v.literal("in_progress"),
    v.literal("completed"), // Work done, ready to invoice
    v.literal("invoiced"),  // Invoice created
    v.literal("cancelled")
  ),

  // ... rest of fields ...
})
```

---

## PHASE 2: CONVEX QUERIES & MUTATIONS

### Step 2.1: Lead Management

```typescript
// convex/leads.ts

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "./auth";

// List all leads
export const listLeads = query({
  args: {
    status: v.optional(v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("site_visit_scheduled"),
      v.literal("converted"),
      v.literal("lost")
    )),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    let query = ctx.db.query("leads");

    if (orgId) {
      query = query.withIndex("by_company_status", q =>
        args.status
          ? q.eq("companyId", orgId).eq("status", args.status)
          : q.eq("companyId", orgId)
      );
    }

    const leads = await query.order("desc").collect();

    // Enrich with customer data
    const enrichedLeads = await Promise.all(
      leads.map(async (lead) => {
        const customer = await ctx.db.get(lead.customerId);
        return { ...lead, customer };
      })
    );

    return enrichedLeads;
  },
});

// Create new lead
export const createLead = mutation({
  args: {
    customerId: v.id("customers"),
    source: v.optional(v.string()),
    estimatedValue: v.optional(v.number()),
    estimatedAcres: v.optional(v.number()),
    serviceTypeRequested: v.optional(v.string()),
    urgency: v.optional(v.union(
      v.literal("immediate"),
      v.literal("this_week"),
      v.literal("this_month"),
      v.literal("flexible")
    )),
    siteVisitDate: v.optional(v.string()),
    followUpDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    // Generate lead number
    const allLeads = await ctx.db.query("leads").collect();
    const leadNumber = `LE-${(allLeads.length + 1).toString().padStart(4, '0')}`;

    const leadId = await ctx.db.insert("leads", {
      companyId: orgId ?? undefined,
      leadNumber,
      customerId: args.customerId,
      status: "new",
      source: args.source,
      estimatedValue: args.estimatedValue,
      estimatedAcres: args.estimatedAcres,
      serviceTypeRequested: args.serviceTypeRequested,
      urgency: args.urgency,
      siteVisitDate: args.siteVisitDate,
      followUpDate: args.followUpDate,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return leadId;
  },
});

// Update lead status
export const updateLeadStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("site_visit_scheduled"),
      v.literal("converted"),
      v.literal("lost")
    ),
    lostReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "contacted") {
      updates.contactedAt = Date.now();
      updates.lastContactDate = Date.now();
    }

    if (args.status === "lost") {
      updates.lostReason = args.lostReason;
      updates.lostAt = Date.now();
    }

    await ctx.db.patch(args.leadId, updates);
  },
});

// Convert lead to proposal
export const convertLeadToProposal = mutation({
  args: {
    leadId: v.id("leads"),
    proposalData: v.object({
      subtotal: v.number(),
      marginPercentage: v.number(),
      totalPrice: v.number(),
      validUntil: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
    lineItems: v.array(v.object({
      serviceType: v.string(),
      displayName: v.string(),
      description: v.optional(v.string()),
      quantity: v.number(),
      unit: v.string(),
      laborCost: v.number(),
      equipmentCost: v.number(),
      totalCost: v.number(),
      lineItemPrice: v.number(),
      sortOrder: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);
    const lead = await ctx.db.get(args.leadId);

    if (!lead) throw new Error("Lead not found");

    // Generate proposal number
    const allProposals = await ctx.db.query("proposals").collect();
    const proposalNumber = `PR-${(allProposals.length + 1).toString().padStart(4, '0')}`;

    // Create proposal
    const proposalId = await ctx.db.insert("proposals", {
      companyId: orgId ?? undefined,
      proposalNumber,
      customerId: lead.customerId,
      leadId: args.leadId,
      status: "draft",
      subtotal: args.proposalData.subtotal,
      marginPercentage: args.proposalData.marginPercentage,
      totalPrice: args.proposalData.totalPrice,
      validUntil: args.proposalData.validUntil,
      notes: args.proposalData.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create proposal line items
    for (const item of args.lineItems) {
      await ctx.db.insert("proposalLineItems", {
        proposalId,
        ...item,
        createdAt: Date.now(),
      });
    }

    // Update lead status
    await ctx.db.patch(args.leadId, {
      status: "converted",
      convertedToProposalId: proposalId,
      convertedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return proposalId;
  },
});
```

### Step 2.2: Invoice Management

```typescript
// convex/invoices.ts

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "./auth";

// List invoices
export const listInvoices = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("partial_payment"),
      v.literal("paid"),
      v.literal("overdue")
    )),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);

    let query = ctx.db.query("invoices");

    if (orgId) {
      query = query.withIndex("by_company_status", q =>
        args.status
          ? q.eq("companyId", orgId).eq("status", args.status)
          : q.eq("companyId", orgId)
      );
    }

    const invoices = await query.order("desc").collect();

    // Enrich with customer and job data
    const enrichedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        const [customer, job] = await Promise.all([
          ctx.db.get(invoice.customerId),
          ctx.db.get(invoice.jobId),
        ]);
        return { ...invoice, customer, job };
      })
    );

    return enrichedInvoices;
  },
});

// Create invoice from completed job
export const createInvoiceFromJob = mutation({
  args: {
    jobId: v.id("jobs"),
    invoiceDate: v.string(),
    paymentTerms: v.string(),
    paymentTermsDays: v.number(),
    taxRate: v.optional(v.number()),
    customerNotes: v.optional(v.string()),
    sendImmediately: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);
    const job = await ctx.db.get(args.jobId);

    if (!job) throw new Error("Job not found");
    if (job.status !== "completed") {
      throw new Error("Job must be completed before invoicing");
    }

    // Generate invoice number
    const allInvoices = await ctx.db.query("invoices").collect();
    const invoiceNumber = `IN-${(allInvoices.length + 1).toString().padStart(4, '0')}`;

    // Calculate due date
    const invoiceDate = new Date(args.invoiceDate);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + args.paymentTermsDays);

    // Calculate totals
    const subtotal = job.totalInvestment;
    const taxAmount = args.taxRate ? subtotal * (args.taxRate / 100) : 0;
    const total = subtotal + taxAmount;

    // Get line items snapshot
    const lineItems = await ctx.db
      .query("jobLineItems")
      .withIndex("by_job", q => q.eq("jobId", args.jobId))
      .collect();

    const lineItemsSnapshot = JSON.stringify(lineItems);

    // Create invoice
    const invoiceId = await ctx.db.insert("invoices", {
      companyId: orgId ?? undefined,
      invoiceNumber,
      jobId: args.jobId,
      proposalId: job.proposalId,
      customerId: job.customerId!,
      status: args.sendImmediately ? "sent" : "draft",
      invoiceDate: args.invoiceDate,
      dueDate: dueDate.toISOString().split('T')[0],
      subtotal,
      taxRate: args.taxRate,
      taxAmount,
      total,
      amountPaid: 0,
      amountDue: total,
      paymentTerms: args.paymentTerms,
      paymentTermsDays: args.paymentTermsDays,
      lineItemsSnapshot,
      customerNotes: args.customerNotes,
      sentAt: args.sendImmediately ? Date.now() : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update job
    await ctx.db.patch(args.jobId, {
      status: "invoiced",
      invoiceId,
      updatedAt: Date.now(),
    });

    // TODO: Send invoice email if sendImmediately

    return invoiceId;
  },
});

// Record payment
export const recordPayment = mutation({
  args: {
    invoiceId: v.id("invoices"),
    amount: v.number(),
    paymentDate: v.string(),
    paymentMethod: v.union(
      v.literal("check"),
      v.literal("cash"),
      v.literal("credit_card"),
      v.literal("debit_card"),
      v.literal("ach"),
      v.literal("wire"),
      v.literal("other")
    ),
    referenceNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrganizationId(ctx);
    const invoice = await ctx.db.get(args.invoiceId);

    if (!invoice) throw new Error("Invoice not found");

    // Create payment record
    await ctx.db.insert("payments", {
      companyId: orgId ?? undefined,
      invoiceId: args.invoiceId,
      amount: args.amount,
      paymentDate: args.paymentDate,
      paymentMethod: args.paymentMethod,
      referenceNumber: args.referenceNumber,
      notes: args.notes,
      createdAt: Date.now(),
    });

    // Update invoice
    const newAmountPaid = invoice.amountPaid + args.amount;
    const newAmountDue = invoice.total - newAmountPaid;

    const newStatus =
      newAmountDue === 0 ? "paid" :
      newAmountPaid > 0 ? "partial_payment" :
      invoice.status;

    await ctx.db.patch(args.invoiceId, {
      amountPaid: newAmountPaid,
      amountDue: newAmountDue,
      status: newStatus,
      lastPaymentDate: Date.now(),
      paidAt: newAmountDue === 0 ? Date.now() : invoice.paidAt,
      updatedAt: Date.now(),
    });

    // If fully paid, update job status
    if (newAmountDue === 0) {
      await ctx.db.patch(invoice.jobId, {
        status: "paid" as any, // Need to add "paid" to job status union
        updatedAt: Date.now(),
      });
    }

    return { success: true, newStatus };
  },
});

// Check for overdue invoices (scheduled function)
export const checkOverdueInvoices = mutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split('T')[0];

    const invoices = await ctx.db
      .query("invoices")
      .filter(q =>
        q.and(
          q.or(
            q.eq(q.field("status"), "sent"),
            q.eq(q.field("status"), "partial_payment")
          ),
          q.lt(q.field("dueDate"), today)
        )
      )
      .collect();

    for (const invoice of invoices) {
      await ctx.db.patch(invoice._id, {
        status: "overdue",
        updatedAt: Date.now(),
      });
    }

    return { updated: invoices.length };
  },
});
```

### Step 2.3: Unified Pipeline Query

```typescript
// convex/pipeline.ts

import { query } from "./_generated/server";
import { getOrganizationId } from "./auth";

export const getPipeline = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    // Fetch all pipeline stages in parallel
    const [leads, proposals, jobs, invoices] = await Promise.all([
      // Leads (active only)
      ctx.db.query("leads")
        .withIndex("by_company_status", q =>
          orgId
            ? q.eq("companyId", orgId).neq("status", "lost")
            : q.neq("status", "lost")
        )
        .collect(),

      // Proposals (not converted yet)
      ctx.db.query("proposals")
        .withIndex("by_company", q => orgId ? q.eq("companyId", orgId) : q)
        .filter(q => q.eq(q.field("convertedToJobId"), undefined))
        .collect(),

      // Work Orders (not invoiced yet)
      ctx.db.query("jobs")
        .withIndex("by_company", q => orgId ? q.eq("companyId", orgId) : q)
        .filter(q => q.eq(q.field("invoiceId"), undefined))
        .collect(),

      // Invoices (not paid yet)
      ctx.db.query("invoices")
        .withIndex("by_company_status", q =>
          orgId
            ? q.eq("companyId", orgId).neq("status", "paid")
            : q.neq("status", "paid")
        )
        .collect(),
    ]);

    // Fetch customers for all projects
    const customerIds = new Set([
      ...leads.map(l => l.customerId),
      ...proposals.map(p => p.customerId),
      ...jobs.map(j => j.customerId).filter(Boolean),
      ...invoices.map(i => i.customerId),
    ]);

    const customers = await Promise.all(
      Array.from(customerIds).map(id => ctx.db.get(id!))
    );

    const customerMap = new Map(
      customers.filter(Boolean).map(c => [c!._id, c])
    );

    // Enrich and format for pipeline view
    return {
      leads: leads.map(lead => ({
        ...lead,
        stage: "LE" as const,
        displayNumber: lead.leadNumber,
        value: lead.estimatedValue || 0,
        customer: customerMap.get(lead.customerId),
      })),

      proposals: proposals.map(proposal => ({
        ...proposal,
        stage: "PR" as const,
        displayNumber: proposal.proposalNumber,
        value: proposal.totalPrice,
        customer: customerMap.get(proposal.customerId),
      })),

      workOrders: jobs.map(job => ({
        ...job,
        stage: "WO" as const,
        displayNumber: job.jobNumber,
        value: job.totalInvestment,
        customer: job.customerId ? customerMap.get(job.customerId) : null,
      })),

      invoices: invoices.map(invoice => ({
        ...invoice,
        stage: "IN" as const,
        displayNumber: invoice.invoiceNumber,
        value: invoice.total,
        customer: customerMap.get(invoice.customerId),
      })),
    };
  },
});

// Get pipeline metrics
export const getPipelineMetrics = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    const [leads, proposals, jobs, invoices, completedInvoices] = await Promise.all([
      ctx.db.query("leads")
        .withIndex("by_company_status", q =>
          orgId ? q.eq("companyId", orgId) : q
        )
        .collect(),

      ctx.db.query("proposals")
        .withIndex("by_company", q => orgId ? q.eq("companyId", orgId) : q)
        .collect(),

      ctx.db.query("jobs")
        .withIndex("by_company", q => orgId ? q.eq("companyId", orgId) : q)
        .collect(),

      ctx.db.query("invoices")
        .withIndex("by_company_status", q =>
          orgId
            ? q.eq("companyId", orgId).neq("status", "paid")
            : q.neq("status", "paid")
        )
        .collect(),

      ctx.db.query("invoices")
        .withIndex("by_company_status", q =>
          orgId
            ? q.eq("companyId", orgId).eq("status", "paid")
            : q.eq("status", "paid")
        )
        .collect(),
    ]);

    // Calculate metrics
    const activeLeads = leads.filter(l => l.status !== "lost" && l.status !== "converted");
    const convertedLeads = leads.filter(l => l.status === "converted");
    const activeProposals = proposals.filter(p => p.status === "sent" || p.status === "draft");
    const acceptedProposals = proposals.filter(p => p.status === "accepted");
    const activeJobs = jobs.filter(j => !j.invoiceId);
    const overdueInvoices = invoices.filter(i => i.status === "overdue");

    // Calculate conversion rates
    const leadToProposalRate = leads.length > 0
      ? (convertedLeads.length / leads.length) * 100
      : 0;

    const proposalToWORate = proposals.length > 0
      ? (acceptedProposals.length / proposals.length) * 100
      : 0;

    // Calculate DSO (Days Sales Outstanding)
    const totalDSO = invoices.reduce((sum, inv) => {
      const invoiceDate = new Date(inv.invoiceDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysDiff;
    }, 0);
    const avgDSO = invoices.length > 0 ? Math.round(totalDSO / invoices.length) : 0;

    return {
      leads: {
        count: activeLeads.length,
        totalValue: activeLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
        avgAge: calculateAvgAge(activeLeads),
      },
      proposals: {
        count: activeProposals.length,
        totalValue: activeProposals.reduce((sum, p) => sum + p.totalPrice, 0),
        winRate: proposalToWORate,
      },
      workOrders: {
        count: activeJobs.length,
        totalValue: activeJobs.reduce((sum, j) => sum + j.totalInvestment, 0),
        onTimePercentage: calculateOnTimePercentage(activeJobs),
      },
      invoices: {
        count: invoices.length,
        totalOutstanding: invoices.reduce((sum, i) => sum + i.amountDue, 0),
        avgDSO,
        overdueCount: overdueInvoices.length,
        overdueAmount: overdueInvoices.reduce((sum, i) => sum + i.amountDue, 0),
      },
      completed: {
        count: completedInvoices.length,
        totalRevenue: completedInvoices.reduce((sum, i) => sum + i.total, 0),
      },
      conversionRates: {
        leadToProposal: leadToProposalRate,
        proposalToWO: proposalToWORate,
      },
    };
  },
});

function calculateAvgAge(items: any[]): number {
  if (items.length === 0) return 0;
  const now = Date.now();
  const totalAge = items.reduce((sum, item) => {
    const ageMs = now - item.createdAt;
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    return sum + ageDays;
  }, 0);
  return Math.round(totalAge / items.length * 10) / 10; // Round to 1 decimal
}

function calculateOnTimePercentage(jobs: any[]): number {
  if (jobs.length === 0) return 100;
  const completedJobs = jobs.filter(j => j.status === "completed");
  if (completedJobs.length === 0) return 100;

  const onTimeJobs = completedJobs.filter(j => {
    if (!j.endDate || !j.completedAt) return true;
    const endDate = new Date(j.endDate).getTime();
    return j.completedAt <= endDate;
  });

  return Math.round((onTimeJobs.length / completedJobs.length) * 100);
}
```

---

## PHASE 3: REACT COMPONENTS

### Step 3.1: Pipeline Page Layout

```typescript
// app/pipeline/page.tsx

'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Box,
  Container,
  ToggleButtonGroup,
  ToggleButton,
  Button,
} from '@mui/material';
import PipelineHeader from '@/components/pipeline/PipelineHeader';
import KanbanBoard from '@/components/pipeline/KanbanBoard';
import ListView from '@/components/pipeline/ListView';
import CalendarView from '@/components/pipeline/CalendarView';
import PipelineMetrics from '@/components/pipeline/PipelineMetrics';
import { ViewModule, ViewList, CalendarMonth } from '@mui/icons-material';

type ViewMode = 'kanban' | 'list' | 'calendar';
type Stage = 'all' | 'LE' | 'PR' | 'WO' | 'IN' | 'CO';

export default function PipelinePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [stageFilter, setStageFilter] = useState<Stage>('all');

  const pipeline = useQuery(api.pipeline.getPipeline);
  const metrics = useQuery(api.pipeline.getPipelineMetrics);

  if (!pipeline || !metrics) {
    return <div>Loading pipeline...</div>;
  }

  // Combine all projects for unified view
  const allProjects = [
    ...pipeline.leads,
    ...pipeline.proposals,
    ...pipeline.workOrders,
    ...pipeline.invoices,
  ];

  // Filter by stage
  const filteredProjects = stageFilter === 'all'
    ? allProjects
    : allProjects.filter(p => p.stage === stageFilter);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Metrics Dashboard */}
        <PipelineMetrics metrics={metrics} />

        {/* View Controls */}
        <PipelineHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          stageFilter={stageFilter}
          onStageFilterChange={setStageFilter}
        />

        {/* Pipeline View */}
        {viewMode === 'kanban' && (
          <KanbanBoard
            leads={pipeline.leads}
            proposals={pipeline.proposals}
            workOrders={pipeline.workOrders}
            invoices={pipeline.invoices}
          />
        )}

        {viewMode === 'list' && (
          <ListView projects={filteredProjects} />
        )}

        {viewMode === 'calendar' && (
          <CalendarView projects={filteredProjects} />
        )}
      </Container>
    </Box>
  );
}
```

### Step 3.2: Kanban Board Component

```typescript
// components/pipeline/KanbanBoard.tsx

'use client';

import { Box, Typography, Paper } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ProjectCard from './ProjectCard';

interface KanbanBoardProps {
  leads: any[];
  proposals: any[];
  workOrders: any[];
  invoices: any[];
}

export default function KanbanBoard({
  leads,
  proposals,
  workOrders,
  invoices,
}: KanbanBoardProps) {

  const handleDragEnd = (result: any) => {
    // TODO: Handle stage transition
    console.log('Drag ended:', result);
  };

  const columns = [
    { id: 'LE', title: 'Leads', items: leads, color: '#8E8E93' },
    { id: 'PR', title: 'Proposals', items: proposals, color: '#FF9500' },
    { id: 'WO', title: 'Work Orders', items: workOrders, color: '#34C759' },
    { id: 'IN', title: 'Invoices', items: invoices, color: '#FF9500' },
  ];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 2 }}>
        {columns.map((column) => (
          <Box
            key={column.id}
            sx={{
              minWidth: 300,
              maxWidth: 320,
              flex: '1 1 300px',
            }}
          >
            {/* Column Header */}
            <Paper
              sx={{
                p: 2,
                mb: 2,
                bgcolor: '#1A1A1A',
                borderTop: `3px solid ${column.color}`,
              }}
            >
              <Typography variant="h6" sx={{ color: '#FFF' }}>
                {column.title} ({column.items.length})
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                ${column.items.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
              </Typography>
            </Paper>

            {/* Column Content */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    minHeight: 500,
                    bgcolor: snapshot.isDraggingOver ? '#0A0A0A' : 'transparent',
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  {column.items.map((item, index) => (
                    <Draggable
                      key={item._id}
                      draggableId={item._id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <ProjectCard
                            project={item}
                            stage={column.id}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        ))}
      </Box>
    </DragDropContext>
  );
}
```

### Step 3.3: Project Card Component

```typescript
// components/pipeline/ProjectCard.tsx

'use client';

import { Box, Typography, Paper, IconButton, Chip } from '@mui/material';
import { MoreVert } from '@mui/icons-material';

interface ProjectCardProps {
  project: any;
  stage: 'LE' | 'PR' | 'WO' | 'IN';
  isDragging?: boolean;
}

const STAGE_COLORS = {
  LE: '#8E8E93',
  PR: '#FF9500',
  WO: '#34C759',
  IN: '#FF9500',
};

export default function ProjectCard({ project, stage, isDragging }: ProjectCardProps) {
  const getCardContent = () => {
    switch (stage) {
      case 'LE':
        return (
          <>
            <Typography variant="body2" sx={{ color: '#FFF', mb: 0.5 }}>
              {project.customer?.firstName} {project.customer?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', mb: 1 }}>
              {project.customer?.streetAddress}
            </Typography>
            <Typography variant="h6" sx={{ color: '#FFF', mb: 1 }}>
              ${project.value?.toLocaleString() || 'TBD'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              {getAgeDisplay(project.createdAt)}
            </Typography>
          </>
        );

      case 'PR':
        return (
          <>
            <Typography variant="body2" sx={{ color: '#FFF', mb: 0.5 }}>
              {project.customer?.firstName} {project.customer?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', mb: 1 }}>
              {project.serviceTypeRequested || 'Multiple services'}
            </Typography>
            <Typography variant="h6" sx={{ color: '#FFF', mb: 1 }}>
              ${project.value.toLocaleString()}
            </Typography>
            <Chip
              label={project.status === 'sent' ? 'Sent' : 'Draft'}
              size="small"
              sx={{ bgcolor: '#2A2A2A', color: '#FFF', mb: 1 }}
            />
            {project.validUntil && (
              <Typography variant="caption" sx={{ color: '#666' }}>
                Expires: {getDaysUntil(project.validUntil)}d
              </Typography>
            )}
          </>
        );

      case 'WO':
        return (
          <>
            <Typography variant="body2" sx={{ color: '#FFF', mb: 0.5 }}>
              {project.customer?.firstName} {project.customer?.lastName}
            </Typography>
            <Chip
              label={project.status}
              size="small"
              sx={{
                bgcolor: project.status === 'in_progress' ? '#34C759' : '#2A2A2A',
                color: '#FFF',
                mb: 1,
              }}
            />
            <Typography variant="h6" sx={{ color: '#FFF', mb: 1 }}>
              ${project.value.toLocaleString()}
            </Typography>
            {project.startDate && (
              <Typography variant="caption" sx={{ color: '#666' }}>
                Started: {new Date(project.startDate).toLocaleDateString()}
              </Typography>
            )}
          </>
        );

      case 'IN':
        return (
          <>
            <Typography variant="body2" sx={{ color: '#FFF', mb: 0.5 }}>
              {project.customer?.firstName} {project.customer?.lastName}
            </Typography>
            <Typography variant="h6" sx={{ color: '#FFF', mb: 1 }}>
              ${project.value.toLocaleString()}
            </Typography>
            <Chip
              label={project.status === 'overdue' ? 'OVERDUE' : 'Sent'}
              size="small"
              sx={{
                bgcolor: project.status === 'overdue' ? '#FF3B30' : '#2A2A2A',
                color: '#FFF',
                mb: 1,
              }}
            />
            <Typography variant="caption" sx={{ color: '#666' }}>
              Due: {getDaysUntil(project.dueDate)}d
            </Typography>
          </>
        );
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        bgcolor: '#1A1A1A',
        border: `2px solid ${STAGE_COLORS[stage]}`,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        '&:hover': {
          bgcolor: '#2A2A2A',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" sx={{ color: STAGE_COLORS[stage], fontWeight: 600 }}>
          {project.displayNumber}
        </Typography>
        <IconButton size="small" sx={{ color: '#666' }}>
          <MoreVert fontSize="small" />
        </IconButton>
      </Box>

      {getCardContent()}
    </Paper>
  );
}

function getAgeDisplay(createdAt: number): string {
  const ageMs = Date.now() - createdAt;
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  return `${ageDays}d ago`;
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
```

---

## PHASE 4: STATE MANAGEMENT & MUTATIONS

### Step 4.1: Stage Transition Hooks

```typescript
// hooks/usePipelineTransitions.ts

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function usePipelineTransitions() {
  const convertLeadToProposal = useMutation(api.leads.convertLeadToProposal);
  const acceptProposal = useMutation(api.proposals.acceptProposal);
  const createInvoice = useMutation(api.invoices.createInvoiceFromJob);
  const recordPayment = useMutation(api.invoices.recordPayment);

  return {
    // LE → PR
    async leadToProposal(leadId: string, proposalData: any) {
      return await convertLeadToProposal({ leadId, proposalData });
    },

    // PR → WO
    async proposalToWorkOrder(proposalId: string, jobData: any) {
      return await acceptProposal({ proposalId, jobData });
    },

    // WO → IN
    async workOrderToInvoice(jobId: string, invoiceData: any) {
      return await createInvoice({ jobId, ...invoiceData });
    },

    // IN → CO
    async invoiceToComplete(invoiceId: string, paymentData: any) {
      return await recordPayment({ invoiceId, ...paymentData });
    },
  };
}
```

---

## PHASE 5: MOBILE OPTIMIZATION

### Step 5.1: Responsive Layout Hook

```typescript
// hooks/useResponsive.ts

import { useMediaQuery, useTheme } from '@mui/material';

export function useResponsive() {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return {
    isMobile,
    isTablet,
    isDesktop,
    defaultView: isMobile ? 'list' : 'kanban',
  };
}
```

---

## IMPLEMENTATION CHECKLIST

### Week 1-2: Database Setup
- [ ] Add leads table to schema
- [ ] Add invoices table to schema
- [ ] Add payments table to schema
- [ ] Update proposals table (add leadId)
- [ ] Update jobs table (add proposalId, invoiceId)
- [ ] Test schema changes in development

### Week 3: Lead Management
- [ ] Create convex/leads.ts with queries/mutations
- [ ] Build lead creation form
- [ ] Build lead list view
- [ ] Implement LE → PR transition
- [ ] Test lead workflow

### Week 4: Proposal Enhancement
- [ ] Update proposal creation flow
- [ ] Implement PR → WO transition
- [ ] Add proposal expiration tracking
- [ ] Build proposal metrics

### Week 5-6: Invoice & Payment
- [ ] Create convex/invoices.ts
- [ ] Create convex/payments.ts
- [ ] Implement WO → IN transition
- [ ] Build payment recording UI
- [ ] Implement IN → CO transition
- [ ] Add invoice reminder system

### Week 7: Kanban View
- [ ] Install react-beautiful-dnd or @hello-pangea/dnd
- [ ] Build KanbanBoard component
- [ ] Build ProjectCard variants for each stage
- [ ] Implement drag & drop
- [ ] Add stage transition modals

### Week 8: Analytics
- [ ] Build getPipelineMetrics query
- [ ] Build PipelineMetrics dashboard component
- [ ] Add conversion funnel visualization
- [ ] Implement bottleneck detection
- [ ] Create export functionality

### Week 9: Mobile
- [ ] Create mobile-optimized list view
- [ ] Build bottom sheet modals
- [ ] Add swipe actions
- [ ] Test on real devices
- [ ] Add offline support (optional)

### Week 10: Polish
- [ ] User onboarding flow
- [ ] Help documentation
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] User acceptance testing

---

**End of Implementation Guide**

This guide provides everything needed to build the pipeline management system from database to UI. Follow the phases sequentially for best results.
