# Project Lifecycle Pipeline UX Design
## TreeShop Field Service Management System

---

## EXECUTIVE SUMMARY

This UX design transforms the current work order system into a full project lifecycle pipeline that tracks jobs from initial inquiry through final payment. The design prioritizes:

1. **Visual Pipeline Clarity** - Operators see their entire sales funnel at a glance
2. **Minimal Friction Transitions** - Moving projects between stages is fast and intuitive
3. **Stage-Appropriate Actions** - Each stage shows only relevant information and actions
4. **Conversion Tracking** - Built-in analytics show pipeline health and bottlenecks

**Recommended Approach:** Unified pipeline view with stage-based filtering and Kanban option

---

## 1. PROJECT LIFECYCLE STAGES

### Stage Definitions & Business Logic

```
LE (Lead) → PR (Proposal) → WO (Work Order) → IN (Invoice) → CO (Complete)
```

| Stage | Code | Description | Key Actions | Exit Criteria |
|-------|------|-------------|-------------|---------------|
| **Lead** | LE | Initial customer inquiry, site visit scheduled | Schedule visit, Add notes, Create proposal | Proposal sent |
| **Proposal** | PR | Quote prepared and sent to customer | View/Edit quote, Send, Follow up | Customer accepted |
| **Work Order** | WO | Job scheduled and in progress | Schedule crew, Track time, Update status | Job completed |
| **Invoice** | IN | Work complete, payment pending | Send invoice, Record payment | Payment received |
| **Complete** | CO | Project closed, fully paid | View report, Archive | None (terminal) |

---

## 2. RECOMMENDED UX ARCHITECTURE

### 2.1 Primary View: Unified Pipeline Dashboard

**Route:** `/app/pipeline/page.tsx`

**Layout Strategy:**
- Single unified view showing all projects across all stages
- Stage-based swim lanes (horizontal Kanban) OR stage-filtered list view
- Quick stage selector at top for filtering
- Project cards show stage-appropriate information

**Why This Approach:**
1. **Sales Visibility** - See entire funnel from lead to cash
2. **Context Preservation** - Projects maintain continuity across stages
3. **Bottleneck Detection** - Instantly see where projects are stuck
4. **Reduced Navigation** - No need to jump between separate pages

### 2.2 View Modes

Users can toggle between three view modes:

#### Mode A: Kanban Board (Default)
```
┌─────────────────────────────────────────────────────────────────┐
│  Pipeline Overview                        [List] [Kanban] [Cal]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  LE (12)      PR (8)       WO (15)      IN (6)       CO (142)    │
│ ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐       │
│ │ LE-  │    │ PR-  │    │ WO-  │    │ IN-  │    │ CO-  │       │
│ │ 0023 │    │ 0018 │    │ 1247 │    │ 0089 │    │ 0156 │       │
│ │      │    │      │    │      │    │      │    │      │       │
│ │Smith │    │Jones │    │Brown │    │Davis │    │Wilson│       │
│ │$12K  │    │$8.5K │    │$25K  │    │$15K  │    │$9K   │       │
│ │5d ago│    │2d ago│    │Today │    │3d ago│    │7d ago│       │
│ └──────┘    └──────┘    └──────┘    └──────┘    └──────┘       │
│                                                                   │
│ ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐                   │
│ │ LE-  │    │ PR-  │    │ WO-  │    │ IN-  │                   │
│ │ 0024 │    │ 0019 │    │ 1248 │    │ 0090 │                   │
│ └──────┘    └──────┘    └──────┘    └──────┘                   │
│                                                                   │
│ [+ New Lead]                                                      │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction:**
- Drag & drop cards between stages
- Click card to view/edit details
- Stage column headers show count and total value
- Scroll vertically within each column

#### Mode B: List View
```
┌─────────────────────────────────────────────────────────────────┐
│  Pipeline Overview                        [List] [Kanban] [Cal]  │
├─────────────────────────────────────────────────────────────────┤
│  Filter: [All Stages ▾] [All Customers ▾] [This Month ▾]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ID       Customer      Value    Stage    Age    Next Action     │
│  ────────────────────────────────────────────────────────────────│
│  WO-1247  Brown, J.    $25,000   🟢 WO    2d    Complete mulch  │
│  PR-0019  Jones, M.    $8,500    🟡 PR    2d    Follow up       │
│  IN-0089  Davis, R.    $15,000   🟠 IN    3d    Send reminder   │
│  LE-0023  Smith, T.    $12,000   ⚪ LE    5d    Schedule visit  │
│  WO-1248  Miller, S.   $18,500   🟢 WO    1d    In progress     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction:**
- Sortable columns (click headers)
- Quick filters at top
- Row click opens detail drawer
- Bulk actions checkbox selection

#### Mode C: Calendar View
```
┌─────────────────────────────────────────────────────────────────┐
│  Pipeline Overview                        [List] [Kanban] [Cal]  │
├─────────────────────────────────────────────────────────────────┤
│                    November 2025                                  │
│                                                                   │
│  Mon    Tue    Wed    Thu    Fri    Sat    Sun                   │
│  ───────────────────────────────────────────────────────────────│
│         1      2      3      4      5      6                     │
│                                                                   │
│  7      8      9      10     11     12     13                    │
│         WO-123 WO-124 WO-125                                     │
│         Brown  Jones  Miller                                     │
│                IN-089                                            │
│                Davis                                             │
│                                                                   │
│  14     15     16     17     18     19     20                    │
│         WO-126               PR-019                              │
│         Taylor               (Follow up)                         │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction:**
- Only shows WO (scheduled), IN (payment due), PR (follow-up dates)
- Click date to create new project
- Drag to reschedule
- Color-coded by stage

---

## 3. PROJECT CARD DESIGN

### 3.1 Card Information Architecture

Each stage shows different information based on what's relevant:

#### Lead Stage (LE)
```
┌────────────────────────┐
│ LE-0023        [⋮]     │
│                         │
│ Tom Smith              │
│ 123 Oak Street         │
│                         │
│ Est: $12,000           │
│                         │
│ 📞 Follow up           │
│ ⏰ 5 days ago          │
└────────────────────────┘
```

**Info Shown:**
- Lead number (LE-XXXX)
- Customer name & address
- Estimated value (rough)
- Days since inquiry
- Next action (call, visit, quote)

**Available Actions:**
- Create Proposal → (moves to PR stage)
- Mark as Lost
- Edit Lead Details
- Add Notes

#### Proposal Stage (PR)
```
┌────────────────────────┐
│ PR-0018        [⋮]     │
│                         │
│ Maria Jones            │
│ Forestry Mulching      │
│ 3.5 acres              │
│                         │
│ Quote: $8,500          │
│ Margin: 30%            │
│                         │
│ 📧 Sent 2d ago         │
│ ⏰ Expires in 12d      │
└────────────────────────┘
```

**Info Shown:**
- Proposal number (PR-XXXX)
- Customer name
- Service summary
- Quote amount & margin
- Sent date
- Expiration countdown

**Available Actions:**
- Mark Accepted → (moves to WO stage)
- Resend Proposal
- Adjust Pricing
- Mark Rejected/Lost
- Schedule Follow-up

#### Work Order Stage (WO)
```
┌────────────────────────┐
│ WO-1247        [⋮]     │
│                         │
│ Jennifer Brown         │
│ Mulching - 5.2 acres   │
│                         │
│ 🟢 In Progress         │
│ Crew A (3 members)     │
│                         │
│ Start: Nov 18          │
│ Est: 2 days            │
│ Actual: 1.5d so far    │
│                         │
│ Revenue: $25,000       │
│ Cost: $18,200 (73%)    │
└────────────────────────┘
```

**Info Shown:**
- Work order number (WO-XXXX)
- Customer & job description
- Current status (Scheduled/In Progress/Completed)
- Assigned crew
- Schedule dates
- Time tracking (estimated vs actual)
- Financial summary (revenue vs cost)

**Available Actions:**
- Start Job (if scheduled)
- Log Time
- Update Status
- Mark Complete → (moves to IN stage)
- View Job Details

#### Invoice Stage (IN)
```
┌────────────────────────┐
│ IN-0089        [⋮]     │
│                         │
│ Robert Davis           │
│ Tree Removal - 12 trees│
│                         │
│ Completed: Nov 15      │
│ Invoice: $15,000       │
│                         │
│ 📧 Sent 3d ago         │
│ ⚠️ Net 30 (27d left)   │
│                         │
│ 💰 $0 paid             │
└────────────────────────┘
```

**Info Shown:**
- Invoice number (IN-XXXX)
- Customer & job description
- Completion date
- Invoice amount
- Sent date
- Payment terms & days remaining
- Payment received

**Available Actions:**
- Record Payment → (moves to CO stage)
- Send Payment Reminder
- Adjust Invoice
- View Job Details
- Mark as Bad Debt

#### Complete Stage (CO)
```
┌────────────────────────┐
│ CO-0156        [⋮]     │
│                         │
│ Sarah Wilson           │
│ Stump Grinding         │
│                         │
│ ✅ Completed: Nov 11   │
│ Paid: Nov 16           │
│                         │
│ Revenue: $9,000        │
│ Cost: $6,300           │
│ Profit: $2,700 (30%)   │
│                         │
│ ⭐⭐⭐⭐⭐              │
└────────────────────────┘
```

**Info Shown:**
- Project number (CO-XXXX)
- Customer & job description
- Completion & payment dates
- Final financials (revenue, cost, profit, margin)
- Customer rating (if collected)

**Available Actions:**
- View Project Report
- Request Review
- Archive
- Duplicate for New Project

### 3.2 Card Status Indicators

**Color Coding by Stage:**
- LE (Lead): Gray/White - `#FFFFFF` border
- PR (Proposal): Yellow - `#FF9500` border
- WO (Work Order): Green - `#34C759` border
- IN (Invoice): Orange - `#FF9500` border
- CO (Complete): Blue - `#007AFF` border

**Urgency Indicators:**
- 🔴 Red dot: Overdue action required
- 🟡 Yellow dot: Action needed soon (within 3 days)
- 🟢 Green dot: On track
- ⚪ White dot: No urgency

---

## 4. STAGE TRANSITION FLOWS

### 4.1 Transition Mechanisms

**Method 1: Drag & Drop (Kanban only)**
- Drag card from one column to another
- Confirmation modal appears with required fields
- Submit to complete transition

**Method 2: Action Button (All views)**
- Click primary action button on card
- Modal opens with transition form
- Fill required data and submit

**Method 3: Detail View Actions**
- Open project detail view
- Click "Move to [Next Stage]" button
- Complete transition form

### 4.2 Required Data by Transition

#### LE → PR (Lead to Proposal)
```
┌─────────────────────────────────────┐
│  Create Proposal for Tom Smith      │
├─────────────────────────────────────┤
│                                     │
│  Customer: Tom Smith ✓              │
│  Address: 123 Oak Street ✓          │
│                                     │
│  Service Items:                     │
│  [+ Add Service]                    │
│  ┌─────────────────────────────┐   │
│  │ Forestry Mulching           │   │
│  │ Acres: [3.5]                │   │
│  │ Estimated: 2 days           │   │
│  │ Cost: $6,000                │   │
│  │ Price: $8,500               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Subtotal Cost: $6,000              │
│  Margin: [30]%                      │
│  Customer Price: $8,500             │
│                                     │
│  Valid Until: [Dec 1, 2025]         │
│                                     │
│  [Cancel]         [Create Proposal] │
└─────────────────────────────────────┘
```

**Required Fields:**
- Service line items (at least one)
- Pricing (cost + margin)
- Proposal expiration date

**Optional Fields:**
- Notes/special terms
- Payment terms
- Attachments

#### PR → WO (Proposal to Work Order)
```
┌─────────────────────────────────────┐
│  Accept Proposal PR-0018            │
├─────────────────────────────────────┤
│                                     │
│  ✅ Customer Accepted               │
│                                     │
│  Schedule Job:                      │
│  Start Date: [Nov 18, 2025]        │
│  Est Duration: 2 days              │
│                                     │
│  Assign Crew:                       │
│  [Crew A - Mulching Team ▾]        │
│                                     │
│  Members:                           │
│  • John (Operator)                  │
│  • Mike (Groundman)                 │
│  • Sarah (Groundman)                │
│                                     │
│  Equipment:                         │
│  • Forestry Mulcher #2              │
│  • Pickup Truck #1                  │
│                                     │
│  [Cancel]         [Create Work Ord] │
└─────────────────────────────────────┘
```

**Required Fields:**
- Start date
- Assigned crew

**Optional Fields:**
- Estimated duration
- Equipment assignment
- Job notes

**System Actions:**
- Generate WO-XXXX number
- Copy all proposal line items to job line items
- Link proposal to work order (convertedToJobId)
- Set proposal status to "accepted"

#### WO → IN (Work Order to Invoice)
```
┌─────────────────────────────────────┐
│  Complete Job WO-1247               │
├─────────────────────────────────────┤
│                                     │
│  ✅ Job Finished                    │
│  Completion Date: [Nov 20, 2025]   │
│                                     │
│  Final Details:                     │
│  Estimated Hours: 16h              │
│  Actual Hours: 14.5h ✓             │
│                                     │
│  Estimated Cost: $18,400            │
│  Actual Cost: $18,200 ✓            │
│                                     │
│  Customer Price: $25,000           │
│  Actual Margin: 27.2%              │
│                                     │
│  Invoice Options:                   │
│  ☐ Adjust price based on actuals   │
│  ☑ Use original quote price        │
│                                     │
│  Payment Terms: [Net 30 ▾]         │
│  Due Date: Dec 20, 2025            │
│                                     │
│  ☑ Send invoice immediately        │
│                                     │
│  [Cancel]         [Complete & Inv] │
└─────────────────────────────────────┘
```

**Required Fields:**
- Completion date
- Payment terms
- Invoice amount (default: original quote)

**Optional Fields:**
- Price adjustments (for change orders)
- Notes to customer
- Send invoice flag

**System Actions:**
- Mark all line items as completed
- Calculate final job cost from time logs
- Generate invoice number (IN-XXXX)
- Generate project report
- Send invoice email (if flagged)

#### IN → CO (Invoice to Complete)
```
┌─────────────────────────────────────┐
│  Record Payment for IN-0089         │
├─────────────────────────────────────┤
│                                     │
│  Invoice Amount: $15,000            │
│                                     │
│  Payment Received:                  │
│  Amount: [$15,000]                 │
│  Date: [Nov 23, 2025]              │
│  Method: [Check ▾]                 │
│  Reference: [Check #4523]          │
│                                     │
│  ☐ Partial Payment                 │
│                                     │
│  Final Project Summary:             │
│  Revenue: $15,000                   │
│  Cost: $11,200                      │
│  Profit: $3,800                     │
│  Margin: 25.3%                      │
│                                     │
│  Customer Feedback (optional):      │
│  Rating: ⭐⭐⭐⭐⭐                 │
│  Comments: [____________]           │
│                                     │
│  [Cancel]         [Record Payment]  │
└─────────────────────────────────────┘
```

**Required Fields:**
- Payment amount
- Payment date
- Payment method

**Optional Fields:**
- Payment reference (check #, transaction ID)
- Customer rating/feedback
- Final notes

**System Actions:**
- Mark invoice as paid
- Archive project to complete
- Update customer payment history
- Request review (if configured)

### 4.3 Skippable Transitions

**Can stages be skipped?** YES, with warnings

#### LE → WO (Lead directly to Work Order)
**Use Case:** Customer calls wanting immediate service, verbal approval without formal proposal

**Warning Modal:**
```
⚠️  Skipping Proposal Stage

You're creating a work order without a formal proposal.

Risks:
• No written agreement with customer
• Pricing not documented
• Higher dispute risk

Recommended: Create quick proposal first (2 min)

[Create Proposal]  [Continue to WO Anyway]
```

**Required:**
- Estimated pricing (for internal tracking)
- Customer verbal approval confirmation checkbox

#### PR → IN (Proposal directly to Invoice)
**Use Case:** Rush job completed immediately, no time for WO stage

**Warning Modal:**
```
⚠️  Skipping Work Order Stage

You're invoicing without time tracking.

Risks:
• No cost tracking
• No profitability data
• Can't improve future estimates

Recommended: Log time retroactively (5 min)

[Add Time Logs]  [Continue to Invoice]
```

**Required:**
- Job completion confirmation
- Actual hours estimate (rough)

#### Not Allowed to Skip:
- **WO → CO**: Must create invoice first (financial tracking)
- **LE → IN**: Must have either PR or WO first
- **PR → CO**: Must complete work and invoice

### 4.4 Reversible Transitions

**Can you move backward?** YES, with restrictions

| Transition | Reversible? | Conditions | Data Impact |
|------------|-------------|------------|-------------|
| PR → LE | ✅ Yes | Proposal not sent yet | Proposal draft deleted |
| WO → PR | ✅ Yes | No time logged yet | Work order deleted, proposal restored |
| WO → LE | ❌ No | N/A | Create new lead instead |
| IN → WO | ✅ Yes | Invoice not sent, payment not received | Invoice deleted |
| IN → PR | ❌ No | N/A | Adjust invoice instead |
| CO → IN | ⚠️ Admin Only | Requires reason & approval | Payment record marked void |

**Reversal Modal Example:**
```
┌─────────────────────────────────────┐
│  ⚠️  Move WO-1247 Back to Proposal  │
├─────────────────────────────────────┤
│                                     │
│  This will:                         │
│  • Delete work order WO-1247        │
│  • Restore proposal PR-0018         │
│  • Delete 3 time log entries        │
│                                     │
│  Reason (required):                 │
│  [Customer requested changes___]    │
│                                     │
│  ⚠️  This cannot be undone          │
│                                     │
│  [Cancel]              [Confirm]    │
└─────────────────────────────────────┘
```

---

## 5. PROJECT NUMBERING SYSTEM

### 5.1 Recommended Approach: Stage Prefix System

**Format:** `[STAGE]-[SEQUENCE]`

**Examples:**
- `LE-0023` - Lead #23
- `PR-0018` - Proposal #18
- `WO-1247` - Work Order #1247
- `IN-0089` - Invoice #89
- `CO-0156` - Completed Project #156

**Advantages:**
- ✅ Immediately identifies project stage
- ✅ Maintains continuity (can reference original proposal from invoice)
- ✅ Separate sequence numbers prevent confusion
- ✅ Searchable by stage (filter all "PR-*")
- ✅ Professional appearance on customer-facing documents

**Sequence Rules:**
- Each stage has independent numbering
- Numbers auto-increment within stage
- When transitioning, NEW number generated for new stage
- OLD number stored as reference link

**Example Project History:**
```
LE-0023 (Nov 1)  →  PR-0018 (Nov 3)  →  WO-1247 (Nov 10)  →  IN-0089 (Nov 20)  →  CO-0156 (Nov 25)
   ↓                    ↓                    ↓                    ↓                    ↓
Tom Smith Lead    →  Smith Proposal  →  Smith Work Ord  →  Smith Invoice   →  Smith Complete
"Mulching 3.5ac"     $8,500 quote        $8,500 job         $8,500 due         $8,500 paid
```

### 5.2 Alternative: Universal Number with Stage Badge

**Format:** `#[SEQUENCE]` + visual stage badge

**Examples:**
```
#0023  [LE]  - Lead
#0023  [PR]  - Proposal (same project, new stage)
#0023  [WO]  - Work Order
#0023  [IN]  - Invoice
#0023  [CO]  - Complete
```

**Advantages:**
- ✅ Single project number throughout lifecycle
- ✅ Easier customer reference ("Your project #23")
- ✅ Simpler database architecture

**Disadvantages:**
- ❌ Stage not immediately clear from number alone
- ❌ Requires badge/label in every view
- ❌ Less professional on invoices ("Invoice for Project #23" vs "Invoice IN-0089")
- ❌ Confusion when customer has multiple projects

### 5.3 Recommendation: STAGE PREFIX SYSTEM

**Rationale:**
1. Tree service industry uses traditional numbering (WO-1234, INV-5678)
2. Customer clarity - "We sent you Proposal PR-0018" is unambiguous
3. Accounting systems expect invoice numbers separate from work orders
4. Easier to explain to customers ("Your proposal became work order WO-1247")

**Implementation:**
```typescript
// convex/schema.ts - No changes needed, already has:
// - jobNumber: v.string() for WO-XXXX
// - proposalNumber: v.string() for PR-XXXX

// Add invoice table:
invoices: defineTable({
  invoiceNumber: v.string(), // "IN-0089"
  jobId: v.id("jobs"),
  proposalId: v.optional(v.id("proposals")),
  // ... rest of invoice fields
})

// Display in UI:
const displayNumber = project.stage === 'LE'
  ? `LE-${project.leadNumber}`
  : project.stage === 'PR'
  ? `PR-${project.proposalNumber}`
  : project.stage === 'WO'
  ? `WO-${project.jobNumber}`
  : project.stage === 'IN'
  ? `IN-${project.invoiceNumber}`
  : `CO-${project.completedNumber}`;
```

**Display Strategy:**
- Card headers: Show current stage number (large)
- Card footer: Show origin reference (small) - "From PR-0018"
- Detail view: Show full transition history timeline
- Search: Allow searching by any historical number

---

## 6. DATABASE SCHEMA UPDATES

### 6.1 New Tables Required

#### Leads Table
```typescript
leads: defineTable({
  companyId: v.optional(v.string()),
  leadNumber: v.string(), // "LE-0023"
  customerId: v.id("customers"),

  status: v.union(
    v.literal("new"),
    v.literal("contacted"),
    v.literal("site_visit_scheduled"),
    v.literal("converted"), // Became proposal
    v.literal("lost")
  ),

  source: v.optional(v.string()), // "Referral", "Google", "Facebook", etc.
  estimatedValue: v.optional(v.number()),
  notes: v.optional(v.string()),

  contactedAt: v.optional(v.number()),
  siteVisitDate: v.optional(v.string()),
  convertedToProposalId: v.optional(v.id("proposals")),
  lostReason: v.optional(v.string()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_status", ["status"])
.index("by_company", ["companyId"])
.index("by_company_status", ["companyId", "status"]);
```

#### Invoices Table
```typescript
invoices: defineTable({
  companyId: v.optional(v.string()),
  invoiceNumber: v.string(), // "IN-0089"
  jobId: v.id("jobs"),
  proposalId: v.optional(v.id("proposals")), // Reference to original proposal
  customerId: v.id("customers"),

  status: v.union(
    v.literal("draft"),
    v.literal("sent"),
    v.literal("partial_payment"),
    v.literal("paid"),
    v.literal("overdue"),
    v.literal("void")
  ),

  invoiceDate: v.string(), // ISO date
  dueDate: v.string(), // ISO date

  subtotal: v.number(),
  tax: v.optional(v.number()),
  total: v.number(),
  amountPaid: v.number(),
  amountDue: v.number(),

  paymentTerms: v.string(), // "Net 30", "Due on Receipt", etc.

  sentAt: v.optional(v.number()),
  paidAt: v.optional(v.number()),

  notes: v.optional(v.string()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_status", ["status"])
.index("by_job", ["jobId"])
.index("by_customer", ["customerId"])
.index("by_company", ["companyId"])
.index("by_due_date", ["dueDate"]);
```

#### Payments Table (for payment tracking)
```typescript
payments: defineTable({
  companyId: v.optional(v.string()),
  invoiceId: v.id("invoices"),

  amount: v.number(),
  paymentDate: v.string(), // ISO date
  paymentMethod: v.union(
    v.literal("check"),
    v.literal("cash"),
    v.literal("credit_card"),
    v.literal("ach"),
    v.literal("wire")
  ),
  referenceNumber: v.optional(v.string()), // Check #, transaction ID

  notes: v.optional(v.string()),

  createdAt: v.number(),
})
.index("by_invoice", ["invoiceId"])
.index("by_company", ["companyId"]);
```

### 6.2 Schema Modifications

#### Update Proposals Table
```typescript
proposals: defineTable({
  // ... existing fields ...

  // ADD:
  leadId: v.optional(v.id("leads")), // Reference to original lead
  convertedToJobId: v.optional(v.id("jobs")), // Already exists ✓

  // UPDATE status to include:
  status: v.union(
    v.literal("draft"),
    v.literal("sent"),
    v.literal("accepted"),  // ← Becomes work order
    v.literal("rejected"),
    v.literal("expired"),
    v.literal("revised") // NEW: Customer requested changes
  ),
})
```

#### Update Jobs Table
```typescript
jobs: defineTable({
  // ... existing fields ...

  // ADD:
  proposalId: v.optional(v.id("proposals")), // Reference to original proposal
  invoiceId: v.optional(v.id("invoices")), // Link to invoice when created

  // UPDATE status to clarify stages:
  status: v.union(
    v.literal("scheduled"),     // Scheduled, not started
    v.literal("in_progress"),   // Crew working
    v.literal("completed"),     // Work done, ready to invoice
    v.literal("invoiced"),      // Invoice created
    v.literal("paid"),          // Payment received
    v.literal("cancelled")
  ),
})
```

### 6.3 Project Lifecycle Tracking

Add a unified view table for queries:

```typescript
// Virtual/computed - not a real table, but a query result
export const getPipelineProjects = query({
  handler: async (ctx) => {
    const orgId = await getOrganizationId(ctx);

    // Fetch all pipeline stages
    const [leads, proposals, jobs, invoices] = await Promise.all([
      ctx.db.query("leads")
        .filter(q => q.eq(q.field("companyId"), orgId))
        .collect(),
      ctx.db.query("proposals")
        .filter(q => q.eq(q.field("companyId"), orgId))
        .collect(),
      ctx.db.query("jobs")
        .filter(q => q.eq(q.field("companyId"), orgId))
        .collect(),
      ctx.db.query("invoices")
        .filter(q => q.eq(q.field("companyId"), orgId))
        .collect(),
    ]);

    // Unify into single pipeline view
    return {
      leads: leads.map(l => ({
        ...l,
        stage: 'LE',
        displayNumber: l.leadNumber,
        value: l.estimatedValue
      })),
      proposals: proposals.map(p => ({
        ...p,
        stage: 'PR',
        displayNumber: p.proposalNumber,
        value: p.totalPrice
      })),
      workOrders: jobs.filter(j => !j.invoiceId).map(j => ({
        ...j,
        stage: 'WO',
        displayNumber: j.jobNumber,
        value: j.totalInvestment
      })),
      invoices: invoices.filter(i => i.status !== 'paid').map(i => ({
        ...i,
        stage: 'IN',
        displayNumber: i.invoiceNumber,
        value: i.total
      })),
      completed: invoices.filter(i => i.status === 'paid').map(i => ({
        ...i,
        stage: 'CO',
        displayNumber: i.invoiceNumber,
        value: i.total
      }))
    };
  }
});
```

---

## 7. ANALYTICS & REPORTING

### 7.1 Pipeline Health Dashboard

Display at top of pipeline view:

```
┌────────────────────────────────────────────────────────────────────┐
│  Pipeline Health - November 2025                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LEADS (12)          PROPOSALS (8)      WORK ORDERS (15)            │
│  $145K est          $68K quoted        $385K in progress            │
│  ────────────────────────────────────────────────────────────────  │
│  Avg age: 4.2d      Conv rate: 62%     On schedule: 87%            │
│  🟢 Healthy         🟡 Follow up        🟢 Healthy                 │
│                                                                      │
│  INVOICES (6)        COMPLETED (142)    30-DAY REVENUE              │
│  $92K outstanding   $1.2M lifetime     $156K collected             │
│  ────────────────────────────────────────────────────────────────  │
│  Avg DSO: 18d       Avg margin: 28%    Target: $150K ✓            │
│  🟢 Healthy         🟢 Healthy         🟢 On Track                 │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

### 7.2 Key Metrics by Stage

#### Lead Metrics
- **Lead Count**: Total active leads
- **Total Estimated Value**: Sum of all lead estimates
- **Average Lead Age**: Days since inquiry
- **Lead Source Breakdown**: Where leads come from
- **Contact Rate**: % of leads contacted within 24h
- **Site Visit Rate**: % of leads that get site visits

#### Proposal Metrics
- **Proposal Count**: Total active proposals
- **Total Quoted Value**: Sum of all proposals
- **Win Rate**: % of proposals that become work orders
- **Average Time to Close**: Days from sent to accepted/rejected
- **Expiring Soon**: Proposals expiring in next 7 days
- **Average Margin**: Profit margin across proposals

#### Work Order Metrics
- **Active Jobs**: Jobs in progress
- **Total Job Value**: Sum of all active work orders
- **On-Time Performance**: % of jobs finishing on/before schedule
- **Cost Variance**: Actual cost vs estimated (across all jobs)
- **Crew Utilization**: % of available crew hours booked
- **Average Duration**: Days to complete jobs

#### Invoice Metrics
- **Outstanding Invoices**: Count and total value
- **Days Sales Outstanding (DSO)**: Average days to payment
- **Overdue Amount**: Total overdue invoices
- **Collection Rate**: % of invoices paid within terms
- **Aging Report**: 0-30d, 31-60d, 61-90d, 90+ days

#### Complete Metrics (Lifetime)
- **Total Projects**: All completed projects
- **Total Revenue**: Lifetime revenue
- **Average Margin**: Profit margin across completed jobs
- **Customer Satisfaction**: Average rating
- **Repeat Customer Rate**: % of customers with multiple projects

### 7.3 Conversion Funnel Analysis

```
LE → PR Conversion
──────────────────
20 leads → 12 proposals (60% conversion)
Avg time: 3.5 days
Lost reasons: 5 price too high, 3 timing

PR → WO Conversion
──────────────────
12 proposals → 8 accepted (67% win rate)
Avg time: 5.2 days
Lost reasons: 2 went with competitor, 2 delayed

WO → IN Conversion
──────────────────
8 work orders → 8 completed (100%)
Avg duration: 2.1 days actual vs 2.5 est

IN → CO Conversion
──────────────────
8 invoices → 7 paid (88% collected)
Avg DSO: 22 days (target: 30)
Outstanding: $15K (1 invoice)

Overall Pipeline Health: 🟢 STRONG
Lead to Cash Time: 18 days (target: 21)
```

### 7.4 Bottleneck Detection

System automatically flags:

**Stale Leads (🔴 Red Alert)**
- Leads older than 7 days without contact
- Action: "Contact these leads"

**Expiring Proposals (🟡 Yellow Warning)**
- Proposals expiring in < 7 days without response
- Action: "Follow up now"

**Delayed Jobs (🔴 Red Alert)**
- Work orders past scheduled end date
- Action: "Update customer"

**Overdue Invoices (🔴 Red Alert)**
- Invoices past due date
- Action: "Send payment reminder"

**Low Conversion Stages (🟡 Yellow Warning)**
- Any stage with < 50% conversion rate
- Action: "Review sales process"

---

## 8. MOBILE OPTIMIZATION

### 8.1 Mobile Pipeline View

**Primary View: Compact List**
(Kanban too wide for mobile)

```
┌──────────────────────┐
│ Pipeline       [≡]   │
├──────────────────────┤
│ [All] [LE] [PR] [WO] │
│ [IN] [CO]            │
├──────────────────────┤
│                      │
│ 🟢 WO-1247           │
│ Jennifer Brown       │
│ In Progress          │
│ $25,000 • 2d ago     │
│ ──────────────────── │
│                      │
│ 🟡 PR-0019           │
│ Maria Jones          │
│ Sent • Exp 12d       │
│ $8,500 • 2d ago      │
│ ──────────────────── │
│                      │
│ 🟠 IN-0089           │
│ Robert Davis         │
│ Sent • Due 27d       │
│ $15,000 • 3d ago     │
│ ──────────────────── │
│                      │
│ ⚪ LE-0023            │
│ Tom Smith            │
│ Follow up            │
│ $12,000 • 5d ago     │
│                      │
└──────────────────────┘
```

**Interaction:**
- Tap to expand card
- Swipe right: View details
- Swipe left: Quick actions menu
- Pull to refresh

### 8.2 Mobile Quick Actions

**Swipe Left Reveals:**
```
┌─────────────────────────────────┐
│ 🟢 WO-1247                      │
│ Jennifer Brown        [Detail]  │
│ In Progress           [Time]    │
│ $25,000 • 2d ago      [Done]    │
└─────────────────────────────────┘
                      ↑ Quick actions
```

**Stage-Specific Quick Actions:**

- **LE**: [Call] [Schedule] [Quote]
- **PR**: [Send] [Follow Up] [Accept]
- **WO**: [Start] [Time] [Complete]
- **IN**: [Send] [Remind] [Payment]
- **CO**: [Report] [Archive]

### 8.3 Mobile Transitions

Use bottom sheet modal for stage transitions:

```
┌──────────────────────┐
│                      │
│  Project Detail      │
│                      │
└──────────────────────┘
         ⬇
┌──────────────────────┐
│                      │
│  [Create Proposal]   │ ← Pulls up from bottom
│                      │
│  Service Items       │
│  [+ Add Service]     │
│                      │
│  Pricing             │
│  Margin: [30]%       │
│                      │
│  [Cancel] [Create]   │
└──────────────────────┘
```

---

## 9. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
**Goal:** Basic pipeline structure

- [ ] Create leads table & schema
- [ ] Create invoices table & schema
- [ ] Update proposals table (add leadId)
- [ ] Update jobs table (add proposalId, invoiceId)
- [ ] Create unified pipeline query
- [ ] Build basic list view (no Kanban yet)

**Deliverable:** View all projects in list format by stage

### Phase 2: Lead Management (Week 3)
**Goal:** Capture and convert leads

- [ ] Lead creation form
- [ ] Lead detail view
- [ ] LE → PR transition (create proposal from lead)
- [ ] Lead status tracking
- [ ] Lead metrics dashboard

**Deliverable:** Sales team can log and convert leads

### Phase 3: Proposal Enhancement (Week 4)
**Goal:** Better proposal workflow

- [ ] Update proposal creation UI
- [ ] PR → WO transition (accept proposal)
- [ ] Proposal expiration tracking
- [ ] Win/loss tracking
- [ ] Proposal metrics

**Deliverable:** Streamlined proposal to work order flow

### Phase 4: Invoice & Payment (Week 5-6)
**Goal:** Close the loop

- [ ] Invoice creation from completed jobs
- [ ] WO → IN transition
- [ ] Payment recording
- [ ] IN → CO transition
- [ ] Invoice reminder system
- [ ] Payment tracking

**Deliverable:** Complete financial cycle

### Phase 5: Kanban View (Week 7)
**Goal:** Visual pipeline management

- [ ] Kanban board component
- [ ] Drag & drop functionality
- [ ] Stage column headers with metrics
- [ ] Card design for each stage
- [ ] View mode switcher (List/Kanban/Calendar)

**Deliverable:** Visual drag-drop pipeline

### Phase 6: Analytics (Week 8)
**Goal:** Business intelligence

- [ ] Pipeline health dashboard
- [ ] Conversion funnel metrics
- [ ] Bottleneck detection
- [ ] Stage-specific KPIs
- [ ] Export reports

**Deliverable:** Data-driven insights

### Phase 7: Mobile Optimization (Week 9)
**Goal:** Field accessibility

- [ ] Mobile-optimized list view
- [ ] Touch-friendly quick actions
- [ ] Bottom sheet modals
- [ ] Offline support
- [ ] Push notifications

**Deliverable:** Mobile-first pipeline management

### Phase 8: Polish & Training (Week 10)
**Goal:** User adoption

- [ ] Onboarding flow
- [ ] Help documentation
- [ ] Video tutorials
- [ ] User feedback collection
- [ ] Performance optimization

**Deliverable:** Production-ready system

---

## 10. UI COMPONENT SPECIFICATIONS

### 10.1 Pipeline Header Component

```typescript
// components/pipeline/PipelineHeader.tsx
interface PipelineHeaderProps {
  viewMode: 'list' | 'kanban' | 'calendar';
  onViewModeChange: (mode: 'list' | 'kanban' | 'calendar') => void;
  stageFilter: Stage | 'all';
  onStageFilterChange: (stage: Stage | 'all') => void;
}

// Renders:
// - View mode toggle buttons
// - Stage filter chips
// - Search bar
// - New project button
// - Metrics summary cards
```

### 10.2 Project Card Component

```typescript
// components/pipeline/ProjectCard.tsx
interface ProjectCardProps {
  project: PipelineProject;
  stage: Stage;
  viewMode: 'compact' | 'detailed';
  onCardClick: (id: string) => void;
  onQuickAction: (action: QuickAction) => void;
}

// Adapts display based on:
// - Current stage (shows different info)
// - View mode (compact for Kanban, detailed for list)
// - Urgency (shows warning indicators)
```

### 10.3 Stage Transition Modal

```typescript
// components/pipeline/StageTransitionModal.tsx
interface StageTransitionModalProps {
  fromStage: Stage;
  toStage: Stage;
  project: PipelineProject;
  onConfirm: (data: TransitionData) => Promise<void>;
  onCancel: () => void;
}

// Renders appropriate form based on transition type:
// - LE → PR: Proposal builder
// - PR → WO: Job scheduling
// - WO → IN: Invoice creation
// - IN → CO: Payment recording
```

### 10.4 Kanban Board Component

```typescript
// components/pipeline/KanbanBoard.tsx
interface KanbanBoardProps {
  projects: PipelineProject[];
  onProjectDrop: (projectId: string, newStage: Stage) => void;
  onProjectClick: (projectId: string) => void;
}

// Features:
// - Drag & drop between columns
// - Column headers with count & value
// - Virtual scrolling for performance
// - Horizontal scroll on mobile
```

---

## 11. USER WORKFLOWS

### 11.1 Typical Daily Workflow (Office Manager)

**Morning Routine:**
1. Open Pipeline view in Kanban mode
2. Check Pipeline Health dashboard
3. Address red alerts:
   - Follow up on stale leads (LE column)
   - Send reminders for expiring proposals (PR column)
   - Check on delayed jobs (WO column)
   - Send payment reminders for overdue invoices (IN column)

**Throughout Day:**
1. New lead comes in (phone call):
   - Click "+ New Lead" button
   - Fill in customer info, estimated value, source
   - Set reminder to call back tomorrow
   - Lead appears in LE column

2. Customer accepts proposal:
   - Find proposal in PR column
   - Click "Accept" quick action
   - Fill in start date, assign crew
   - Proposal moves to WO column
   - Crew gets notification

3. Crew completes job:
   - Find work order in WO column
   - Click "Complete & Invoice"
   - Review actual vs estimated hours
   - Confirm invoice amount
   - Send invoice to customer
   - Project moves to IN column

4. Payment received:
   - Find invoice in IN column
   - Click "Record Payment"
   - Enter amount, date, method
   - Project moves to CO column
   - Customer gets thank you email

**End of Day:**
1. Review pipeline metrics
2. Plan tomorrow's follow-ups
3. Check conversion rates

### 11.2 Typical Daily Workflow (Field Crew)

**Mobile View:**
1. Open app on phone
2. See assigned work orders (WO filter)
3. Click "Start Job" when arriving at site
4. Log time throughout day:
   - "Start Task: Mulching"
   - "End Task: Mulching"
   - "Start Task: Cleanup"
5. Mark job complete when done
6. Office gets notification to invoice

---

## 12. ERROR STATES & VALIDATIONS

### 12.1 Transition Validations

**LE → PR Validation:**
```
❌ Cannot create proposal:
• Customer missing required address
• No service items added
• Price is $0

Fix these issues to continue.
```

**PR → WO Validation:**
```
❌ Cannot create work order:
• No start date selected
• No crew assigned
• Crew already booked on this date

Fix these issues to continue.
```

**WO → IN Validation:**
```
⚠️  Warning:
• No time logged on this job
• Cannot calculate actual profit

Continue anyway? [Yes] [No, add time]
```

**IN → CO Validation:**
```
❌ Cannot mark complete:
• Payment amount doesn't match invoice
• Payment date is missing

Fix these issues to continue.
```

### 12.2 Data Integrity Checks

**System automatically prevents:**
- Deleting customers with active projects
- Deleting proposals linked to work orders
- Marking jobs complete with active time logs
- Recording payments > invoice amount
- Creating duplicate project numbers

---

## 13. ACCESSIBILITY & USABILITY

### 13.1 Keyboard Navigation

**Pipeline Kanban:**
- `Tab` - Navigate between cards
- `Enter` - Open card details
- `Arrow Keys` - Move between columns
- `Space` - Select card
- `Del` - Delete project (with confirmation)
- `N` - New project
- `F` - Focus search

### 13.2 Screen Reader Support

**Card Announcements:**
```
"Work Order 1247, Jennifer Brown,
Forestry Mulching, In Progress,
Value $25,000, Started 2 days ago"
```

**Stage Announcements:**
```
"Work Orders column, 15 projects,
Total value $385,000"
```

### 13.3 Color Accessibility

All stage colors meet WCAG AA contrast requirements:
- LE (Lead): Gray `#8E8E93` on white (4.6:1)
- PR (Proposal): Yellow `#FF9500` on white (2.4:1) + icon
- WO (Work Order): Green `#34C759` on white (3.0:1) + icon
- IN (Invoice): Orange `#FF9500` on white (2.4:1) + icon
- CO (Complete): Blue `#007AFF` on white (4.5:1)

Use icons + color for color-blind users.

---

## 14. PERFORMANCE OPTIMIZATION

### 14.1 Query Optimization

**Problem:** Loading all pipeline projects could be 100+ records

**Solution:**
```typescript
// Use pagination for completed projects
const getActivePipeline = query({
  handler: async (ctx) => {
    // Load all active stages (small dataset)
    const [leads, proposals, workOrders, invoices] = await Promise.all([...]);

    // Only load recent 20 completed projects
    const completed = await ctx.db.query("invoices")
      .filter(q => q.eq(q.field("status"), "paid"))
      .order("desc")
      .take(20);

    return { leads, proposals, workOrders, invoices, completed };
  }
});
```

### 14.2 Kanban Performance

**Problem:** Dragging cards in large Kanban boards is slow

**Solution:**
- Virtual scrolling within columns (only render visible cards)
- Optimistic updates (update UI before server confirms)
- Debounce drag updates (wait until drop to save)

### 14.3 Mobile Performance

**Problem:** Loading full pipeline on mobile is slow

**Solution:**
- Default to list view on mobile (lighter rendering)
- Lazy load card details (fetch on expand)
- Cache recently viewed projects
- Use intersection observer for infinite scroll

---

## 15. FUTURE ENHANCEMENTS

### Phase 2 Features (Post-Launch)

**Advanced Analytics:**
- Revenue forecasting (predict next month based on pipeline)
- Employee performance by stage (who closes most proposals?)
- Seasonal trends (when do we get most leads?)
- Customer lifetime value
- Win/loss analysis by service type

**Automation:**
- Auto-follow-up emails for stale leads
- Auto-send payment reminders 7 days before due
- Auto-escalate overdue invoices to owner
- Auto-schedule site visits based on availability

**Integrations:**
- QuickBooks sync for invoice/payment
- Google Calendar for scheduling
- Twilio for SMS reminders
- Mailchimp for proposal emails
- Zapier for custom workflows

**Advanced Features:**
- Recurring projects (annual tree maintenance)
- Multi-location support (different crews/regions)
- Customer portal (view their project status)
- Team permissions (restrict who can approve proposals)
- Custom pipeline stages (add ER - Estimate Request)

---

## 16. CONCLUSION & NEXT STEPS

### Summary of Recommendations

1. **Architecture:** Unified pipeline view with Kanban/List/Calendar modes
2. **Numbering:** Stage prefix system (LE-XXXX, PR-XXXX, WO-XXXX, etc.)
3. **Transitions:** Required data per stage, skippable with warnings, reversible with restrictions
4. **Mobile:** List-first view with swipe actions
5. **Analytics:** Built-in pipeline health dashboard with bottleneck detection

### Implementation Priority

**Must Have (MVP):**
- Leads table & basic lead management
- Invoice table & payment tracking
- Unified list view of all projects
- LE → PR → WO → IN → CO transitions
- Basic stage filtering

**Should Have (Launch):**
- Kanban board view
- Pipeline metrics dashboard
- Quick actions on cards
- Mobile optimization
- Search & advanced filters

**Nice to Have (Post-Launch):**
- Calendar view
- Automated reminders
- Advanced analytics
- Customer portal
- Integrations

### Success Metrics

After launch, measure:
- **Adoption Rate:** % of projects entered into pipeline (target: 95%+)
- **Lead Conversion:** LE → PR rate (benchmark: 60%)
- **Win Rate:** PR → WO rate (benchmark: 50%)
- **DSO:** Days Sales Outstanding (target: < 30 days)
- **User Satisfaction:** NPS score (target: 8+)

### File Locations (Next.js App Router)

```
/app/pipeline/
├── page.tsx                    # Main pipeline view
├── layout.tsx                  # Pipeline layout
├── [id]/
│   └── page.tsx               # Project detail view
├── new/
│   └── page.tsx               # New project form
└── components/
    ├── PipelineHeader.tsx     # View controls & filters
    ├── KanbanBoard.tsx        # Kanban view
    ├── ListView.tsx           # List view
    ├── CalendarView.tsx       # Calendar view
    ├── ProjectCard.tsx        # Card component
    ├── StageTransition.tsx    # Transition modals
    └── PipelineMetrics.tsx    # Analytics dashboard

/convex/
├── leads.ts                   # Lead queries/mutations
├── invoices.ts                # Invoice queries/mutations
├── payments.ts                # Payment tracking
├── pipeline.ts                # Unified pipeline queries
└── schema.ts                  # Updated schema

/components/pipeline/
├── LeadCard.tsx
├── ProposalCard.tsx
├── WorkOrderCard.tsx
├── InvoiceCard.tsx
└── CompleteCard.tsx
```

---

**End of UX Design Document**

This design provides a comprehensive, intuitive pipeline management system that will help tree service operators track every project from initial inquiry through final payment, with built-in analytics to optimize their sales and operations processes.
