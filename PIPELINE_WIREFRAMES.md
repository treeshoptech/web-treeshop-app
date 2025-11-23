# Pipeline Visual Wireframes
## Detailed UI Mockups for Development

---

## WIREFRAME 1: KANBAN BOARD VIEW (DESKTOP)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ShopOS                                                    [User Menu] [Notifications]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  < Dashboard  /  Pipeline                                                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐│
│  │  PIPELINE HEALTH - November 2025                                  📊 Full Report  ││
│  ├───────────────────────────────────────────────────────────────────────────────────┤│
│  │                                                                                    ││
│  │  💰 $690K   |   📈 67% Win Rate   |   ⏱️ 18d Avg Cycle   |   🎯 $156K Monthly   ││
│  │  Total      |   PR → WO Conv     |   Lead to Cash      |   Revenue (104%)      ││
│  │                                                                                    ││
│  └───────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐                  │
│  │  [🔍 Search...]    [All Customers ▾] [This Month ▾] [Export]   │                  │
│  │                                                                  │                  │
│  │  View: [List] [Kanban] [Calendar]                     [+ New Lead] [+ New Project]│
│  └─────────────────────────────────────────────────────────────────┘                  │
│                                                                                         │
│  ┌───────────┬───────────┬───────────┬───────────┬───────────┐                        │
│  │    LE     │    PR     │    WO     │    IN     │    CO     │                        │
│  │  Leads    │ Proposals │   Work    │ Invoices  │ Complete  │                        │
│  │   (12)    │    (8)    │  Orders   │    (6)    │   (142)   │                        │
│  │  $145K    │   $68K    │   (15)    │   $92K    │  $1.2M    │                        │
│  │           │           │  $385K    │           │           │                        │
│  ├───────────┼───────────┼───────────┼───────────┼───────────┤                        │
│  │           │           │           │           │           │                        │
│  │ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │                        │
│  │ │LE-0023│ │ │PR-0018│ │ │WO-1247│ │ │IN-0089│ │ │CO-0156│ │                        │
│  │ │   ⋮   │ │ │   ⋮   │ │ │   ⋮   │ │ │   ⋮   │ │ │   ⋮   │ │                        │
│  │ │       │ │ │       │ │ │       │ │ │       │ │ │       │ │                        │
│  │ │ Tom   │ │ │Maria  │ │ │Jenny  │ │ │Robert │ │ │Sarah  │ │                        │
│  │ │Smith  │ │ │Jones  │ │ │Brown  │ │ │Davis  │ │ │Wilson │ │                        │
│  │ │       │ │ │       │ │ │       │ │ │       │ │ │       │ │                        │
│  │ │Oak St │ │ │Mulch  │ │ │Mulch  │ │ │Tree   │ │ │Stump  │ │                        │
│  │ │       │ │ │3.5ac  │ │ │5.2ac  │ │ │Removal│ │ │Grind  │ │                        │
│  │ │       │ │ │       │ │ │       │ │ │       │ │ │       │ │                        │
│  │ │$12K   │ │ │$8.5K  │ │ │🟢 WIP │ │ │$15K   │ │ │✅ Paid│ │                        │
│  │ │est    │ │ │Quote  │ │ │Crew A │ │ │       │ │ │       │ │                        │
│  │ │       │ │ │       │ │ │       │ │ │📧 Sent│ │ │$2.7K  │ │                        │
│  │ │📞 Call│ │ │📧 Sent│ │ │Nov 18 │ │ │3d ago │ │ │profit │ │                        │
│  │ │5d ago │ │ │2d ago │ │ │1.5d   │ │ │       │ │ │       │ │                        │
│  │ │       │ │ │       │ │ │done   │ │ │⚠️27d  │ │ │⭐⭐⭐ │ │                        │
│  │ │       │ │ │⏰ 12d │ │ │       │ │ │left   │ │ │⭐⭐   │ │                        │
│  │ └───────┘ │ └───────┘ │ └───────┘ │ └───────┘ │ └───────┘ │                        │
│  │           │           │           │           │           │                        │
│  │ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │                        │
│  │ │LE-0024│ │ │PR-0019│ │ │WO-1248│ │ │IN-0090│ │ │CO-0157│ │                        │
│  │ │  ...  │ │ │  ...  │ │ │  ...  │ │ │  ...  │ │ │  ...  │ │                        │
│  │ └───────┘ │ └───────┘ │ └───────┘ │ └───────┘ │ └───────┘ │                        │
│  │           │           │           │           │           │                        │
│  │ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │           │           │                        │
│  │ │LE-0025│ │ │PR-0020│ │ │WO-1249│ │           │           │                        │
│  │ │  ...  │ │ │  ...  │ │ │  ...  │ │           │           │                        │
│  │ └───────┘ │ └───────┘ │ └───────┘ │           │           │                        │
│  │           │           │           │           │           │                        │
│  │           │           │ ┌───────┐ │           │           │                        │
│  │           │           │ │WO-1250│ │           │           │                        │
│  │           │           │ │  ...  │ │           │           │                        │
│  │           │           │ └───────┘ │           │           │                        │
│  │           │           │           │           │           │                        │
│  │ [+ Lead]  │ [+ Prop]  │ [+ WO]    │           │[Load More]│                        │
│  │           │           │           │           │           │                        │
│  └───────────┴───────────┴───────────┴───────────┴───────────┘                        │
│                                                                                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**INTERACTION NOTES:**
- Drag cards horizontally between columns to change stage
- Drag cards vertically to reorder within column
- Click card to open detail drawer (slides in from right)
- Click [⋮] menu for quick actions
- Scroll each column independently (vertical scroll)
- Hover over card shows quick action buttons

---

## WIREFRAME 2: DETAILED CARD SPECIFICATIONS

### LEAD CARD (LE)
```
┌─────────────────────────────────┐
│ LE-0023                    [⋮]  │  ← Card header
│ ─────────────────────────────── │
│                                 │
│ 👤 Tom Smith                    │  ← Customer name (bold)
│ 📍 123 Oak Street               │  ← Address
│    Smithville, TX               │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 💰 $12,000 estimated            │  ← Estimated value
│                                 │
│ 📞 Follow up call               │  ← Next action
│ ⏰ Inquiry: 5 days ago          │  ← Age indicator
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 📝 "Wants 3-4 acres cleared"    │  ← Notes preview
│                                 │
│ ─────────────────────────────── │
│                                 │
│ From: Google Ads                │  ← Lead source
│                                 │
└─────────────────────────────────┘

HOVER STATE:
┌─────────────────────────────────┐
│ LE-0023                    [⋮]  │
│ ─────────────────────────────── │
│                                 │
│ 👤 Tom Smith                    │
│ 📍 123 Oak Street               │
│                                 │
│ ───────────────────────────────│
│ [📞 Call] [📅 Schedule] [📄 Quote]│ ← Quick actions appear
│ ───────────────────────────────│
│                                 │
│ 💰 $12,000 estimated            │
│ ⏰ Inquiry: 5 days ago          │
└─────────────────────────────────┘

MENU [⋮] OPTIONS:
• Create Proposal
• Schedule Site Visit
• Edit Lead
• Add Notes
• Mark as Lost
• Delete
```

### PROPOSAL CARD (PR)
```
┌─────────────────────────────────┐
│ PR-0018                    [⋮]  │
│ ─────────────────────────────── │
│                                 │
│ 👤 Maria Jones                  │
│ 📍 456 Pine Drive               │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 🌲 Forestry Mulching            │  ← Service type
│ 📏 3.5 acres                    │  ← Quantity
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 💵 Quote: $8,500                │  ← Customer price
│ 📊 Margin: 30% ($2,550)         │  ← Profit info
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 📧 Sent: 2 days ago             │  ← Status
│ ⏰ Expires: 12 days             │  ← Countdown
│ 🔔 Follow up: Tomorrow          │  ← Reminder
│                                 │
│ ─────────────────────────────── │
│                                 │
│ From: LE-0022                   │  ← Origin reference
│                                 │
└─────────────────────────────────┘

WARNING STATE (Expiring Soon):
┌─────────────────────────────────┐
│ PR-0018                    [⋮]  │
│ ─────────────────────────────── │
│ ⚠️  EXPIRES IN 3 DAYS            │  ← Yellow warning banner
│ ─────────────────────────────── │
│ 👤 Maria Jones                  │
│ 🌲 Forestry Mulching - 3.5ac    │
│ 💵 Quote: $8,500                │
│ 📧 Sent: 11 days ago            │
│                                 │
│ [📧 Send Reminder] [📞 Call]    │  ← Suggested actions
└─────────────────────────────────┘

MENU [⋮] OPTIONS:
• Mark Accepted → Create WO
• Resend Proposal
• Adjust Pricing
• Schedule Follow-up
• Mark Rejected
• View PDF
• Edit Proposal
• Delete
```

### WORK ORDER CARD (WO)
```
┌─────────────────────────────────┐
│ WO-1247                    [⋮]  │
│ ─────────────────────────────── │
│                                 │
│ 👤 Jennifer Brown               │
│ 📍 789 Maple Lane               │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 🌲 Forestry Mulching            │
│ 📏 5.2 acres                    │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 🟢 IN PROGRESS                  │  ← Status badge (green)
│ 👷 Crew A (3 members)           │  ← Assigned crew
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 📅 Start: Nov 18, 2025          │  ← Schedule
│ ⏱️  Est: 2 days                 │  ← Estimated duration
│ ✅ Actual: 1.5d (75%)           │  ← Progress
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 💰 Revenue: $25,000             │  ← Financial summary
│ 💸 Cost: $18,200 (73%)          │  ← Cost tracking
│ 📈 Profit: $6,800 (27%)         │  ← Margin
│                                 │
│ ─────────────────────────────── │
│                                 │
│ From: PR-0016                   │  ← Origin
│                                 │
└─────────────────────────────────┘

SCHEDULED STATE (Not Started):
┌─────────────────────────────────┐
│ WO-1251                    [⋮]  │
│ ─────────────────────────────── │
│ 👤 Michael Lee                  │
│ 🌲 Tree Removal - 8 trees       │
│                                 │
│ 🔵 SCHEDULED                    │  ← Blue status
│ 👷 Crew B (4 members)           │
│                                 │
│ 📅 Start: Nov 25, 2025          │
│ ⏱️  Est: 1 day                  │
│                                 │
│ 💰 $12,500                      │
│                                 │
│ [🚀 Start Job]                  │  ← Primary action
└─────────────────────────────────┘

COMPLETED STATE (Ready to Invoice):
┌─────────────────────────────────┐
│ WO-1252                    [⋮]  │
│ ─────────────────────────────── │
│ 👤 Lisa Park                    │
│ 🌲 Stump Grinding - 15 stumps   │
│                                 │
│ ✅ COMPLETED                    │  ← Green checkmark
│ 👷 Crew A (2 members)           │
│                                 │
│ 📅 Nov 15-16 (2 days)           │
│ ✅ On time, on budget           │
│                                 │
│ 💰 Revenue: $9,000              │
│ 💸 Cost: $6,300 (70%)           │
│ 📈 Profit: $2,700 (30%)         │
│                                 │
│ [💵 Create Invoice]             │  ← Primary action
└─────────────────────────────────┘

MENU [⋮] OPTIONS:
• Start Job (if scheduled)
• Log Time
• Update Status
• View Job Details
• Mark Complete → Create Invoice
• Adjust Crew
• Edit Work Order
• Cancel Job
```

### INVOICE CARD (IN)
```
┌─────────────────────────────────┐
│ IN-0089                    [⋮]  │
│ ─────────────────────────────── │
│                                 │
│ 👤 Robert Davis                 │
│ 📍 321 Elm Street               │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 🌲 Tree Removal                 │
│ 📏 12 trees                     │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ ✅ Completed: Nov 15            │  ← Job completion
│ 💵 Invoice: $15,000             │  ← Amount
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 📧 Sent: 3 days ago             │  ← Invoice status
│ 📅 Due: Dec 15 (27 days)        │  ← Payment terms
│                                 │
│ ⚪ Net 30                       │  ← Terms
│ 💰 $0 paid / $15,000 due        │  ← Payment status
│                                 │
│ ─────────────────────────────── │
│                                 │
│ From: WO-1245                   │  ← Origin
│                                 │
└─────────────────────────────────┘

OVERDUE STATE:
┌─────────────────────────────────┐
│ IN-0085                    [⋮]  │
│ ─────────────────────────────── │
│ 🔴 OVERDUE BY 5 DAYS            │  ← Red alert banner
│ ─────────────────────────────── │
│ 👤 Robert Davis                 │
│ 💵 $15,000 outstanding          │
│                                 │
│ 📧 Last reminder: 3 days ago    │
│ 📅 Due: Nov 15                  │
│                                 │
│ [📧 Send Reminder] [📞 Call]    │  ← Urgent actions
│ [💳 Record Payment]             │
└─────────────────────────────────┘

PARTIAL PAYMENT STATE:
┌─────────────────────────────────┐
│ IN-0088                    [⋮]  │
│ ─────────────────────────────── │
│ 🟡 PARTIAL PAYMENT              │  ← Yellow status
│ ─────────────────────────────── │
│ 👤 Susan Miller                 │
│ 💵 Invoice: $20,000             │
│                                 │
│ ✅ Paid: $10,000 (50%)          │  ← Payment progress
│ ⚠️  Due: $10,000                │
│                                 │
│ 📅 Due: Dec 1 (8 days)          │
│                                 │
│ [💳 Record Payment]             │
└─────────────────────────────────┘

MENU [⋮] OPTIONS:
• Record Payment → Mark Complete
• Send Payment Reminder
• View Invoice PDF
• Adjust Invoice
• View Job Details
• Mark as Paid
• Mark as Bad Debt
• Delete Invoice
```

### COMPLETE CARD (CO)
```
┌─────────────────────────────────┐
│ CO-0156                    [⋮]  │
│ ─────────────────────────────── │
│                                 │
│ 👤 Sarah Wilson                 │
│ 📍 654 Cedar Court              │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 🌲 Stump Grinding               │
│ 📏 8 stumps                     │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ ✅ Completed: Nov 11            │  ← Completion date
│ 💵 Paid: Nov 16 (5 days)        │  ← Payment date
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 💰 Revenue: $9,000              │  ← Final financials
│ 💸 Cost: $6,300                 │
│ 📈 Profit: $2,700 (30%)         │  ← Profit margin
│                                 │
│ ─────────────────────────────── │
│                                 │
│ ⭐⭐⭐⭐⭐                     │  ← Customer rating
│ "Excellent work!"               │  ← Review preview
│                                 │
│ ─────────────────────────────── │
│                                 │
│ History: LE-0020 → PR-0015      │  ← Full lifecycle
│         → WO-1243 → IN-0087     │
│                                 │
└─────────────────────────────────┘

MENU [⋮] OPTIONS:
• View Project Report
• Download PDF
• Request Review
• Duplicate Project
• Archive
• Delete
```

---

## WIREFRAME 3: LIST VIEW (DESKTOP)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ShopOS                                                    [User Menu] [Notifications]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  < Dashboard  /  Pipeline                                                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐                  │
│  │  [🔍 Search projects, customers...]                             │                  │
│  │                                                                  │                  │
│  │  Filter: [All Stages ▾] [All Customers ▾] [This Month ▾]       │                  │
│  │                                                                  │                  │
│  │  View: [List] [Kanban] [Calendar]              [+ New Project]  │                  │
│  └─────────────────────────────────────────────────────────────────┘                  │
│                                                                                         │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐│
│  │ ID       Customer         Service         Value    Stage   Age   Next Action  [⋮] ││
│  ├────────────────────────────────────────────────────────────────────────────────────┤│
│  │                                                                                     ││
│  │ WO-1247  Brown, Jennifer  Mulching 5.2ac  $25,000  🟢 WIP  2d   Complete job   [⋮]││
│  │ ────────────────────────────────────────────────────────────────────────────────  ││
│  │          Crew A • Started Nov 18 • 1.5d done • Cost: $18,200                       ││
│  │                                                                                     ││
│  │ PR-0019  Jones, Maria     Mulching 3.5ac  $8,500   🟡 PR   2d   Follow up      [⋮]││
│  │ ────────────────────────────────────────────────────────────────────────────────  ││
│  │          Sent 2d ago • Expires in 12d • 30% margin                                 ││
│  │                                                                                     ││
│  │ IN-0089  Davis, Robert    Tree Removal    $15,000  🟠 IN   3d   Send reminder  [⋮]││
│  │ ────────────────────────────────────────────────────────────────────────────────  ││
│  │          Invoice sent 3d ago • Due Dec 15 (27d) • $0 paid                          ││
│  │                                                                                     ││
│  │ LE-0023  Smith, Tom       Est. Clearing   $12,000  ⚪ LE   5d   Schedule call  [⋮]││
│  │ ────────────────────────────────────────────────────────────────────────────────  ││
│  │          From Google Ads • Oak Street property                                     ││
│  │                                                                                     ││
│  │ WO-1248  Miller, Sarah    Tree Removal    $18,500  🟢 WO   1d   In progress    [⋮]││
│  │ ────────────────────────────────────────────────────────────────────────────────  ││
│  │          Crew B • Scheduled Nov 20 • 12 trees • Cost tracking: 68%                 ││
│  │                                                                                     ││
│  │ CO-0156  Wilson, Sarah    Stump Grinding  $9,000   🔵 CO   7d   Archived       [⋮]││
│  │ ────────────────────────────────────────────────────────────────────────────────  ││
│  │          Completed Nov 11 • Paid Nov 16 • Profit: $2,700 (30%) • ⭐⭐⭐⭐⭐       ││
│  │                                                                                     ││
│  │ IN-0085  Taylor, Mike     Mulching        $22,000  🔴 IN  12d   OVERDUE!       [⋮]││
│  │ ────────────────────────────────────────────────────────────────────────────────  ││
│  │          ⚠️  OVERDUE BY 5 DAYS • Last reminder: 3d ago • Due Nov 10                ││
│  │                                                                                     ││
│  └────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│  Showing 7 of 183 projects                                          [1] 2 3 ... 19    │
│                                                                                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**INTERACTION NOTES:**
- Click row to open detail drawer
- Click column header to sort (ID, Customer, Value, Stage, Age)
- Hover row highlights and shows quick actions
- Double-click to edit
- Right-click for context menu

**EXPANDED ROW (onClick):**
```
│ WO-1247  Brown, Jennifer  Mulching 5.2ac  $25,000  🟢 WIP  2d   Complete job   [⋮]│
│ ──────────────────────────────────────────────────────────────────────────────────│
│ ┌────────────────────────────────────────────────────────────────────────────────┐│
│ │  📋 JOB DETAILS                                                                 ││
│ │                                                                                 ││
│ │  Customer: Jennifer Brown • 789 Maple Lane, Smithville, TX                     ││
│ │  Service: Forestry Mulching - 5.2 acres                                        ││
│ │                                                                                 ││
│ │  Status: 🟢 In Progress                                                        ││
│ │  Crew: Crew A (John, Mike, Sarah)                                              ││
│ │  Started: Nov 18, 2025                                                         ││
│ │  Progress: 1.5 days / 2 days estimated (75%)                                   ││
│ │                                                                                 ││
│ │  Financial:                                                                     ││
│ │  • Revenue: $25,000                                                             ││
│ │  • Cost so far: $18,200 (73% of revenue)                                       ││
│ │  • Projected profit: $6,800 (27% margin)                                       ││
│ │                                                                                 ││
│ │  [View Full Details]  [Log Time]  [Update Status]  [Mark Complete]             ││
│ └────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                     │
```

---

## WIREFRAME 4: CALENDAR VIEW (DESKTOP)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ShopOS                                                    [User Menu] [Notifications]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  < Dashboard  /  Pipeline                                                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐                  │
│  │  View: [List] [Kanban] [Calendar]                               │                  │
│  │                                                                  │                  │
│  │  [< Prev]        November 2025        [Next >]   [Today]        │                  │
│  └─────────────────────────────────────────────────────────────────┘                  │
│                                                                                         │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                                     ││
│  │  Sun       Mon       Tue       Wed       Thu       Fri       Sat                   ││
│  │  ─────────────────────────────────────────────────────────────────────────────    ││
│  │                                                                                     ││
│  │            1         2         3         4         5         6                     ││
│  │                                                                                     ││
│  │  ──────  ──────  ──────  ──────  ──────  ──────  ──────                           ││
│  │                                                                                     ││
│  │  7         8         9         10        11        12        13                    ││
│  │           ┌──────┐  ┌──────┐  ┌──────┐                                            ││
│  │           │WO-123│  │WO-124│  │WO-125│                                            ││
│  │           │Brown │  │Jones │  │Miller│                                            ││
│  │           │Mulch │  │Trees │  │Stump │                                            ││
│  │           │$25K  │  │$18K  │  │$9K   │                                            ││
│  │           └──────┘  └──────┘  └──────┘                                            ││
│  │                     ┌──────┐                                                       ││
│  │                     │IN-089│                                                       ││
│  │                     │Due   │                                                       ││
│  │                     │$15K  │                                                       ││
│  │                     └──────┘                                                       ││
│  │  ──────  ──────  ──────  ──────  ──────  ──────  ──────                           ││
│  │                                                                                     ││
│  │  14        15        16        17        18  🔵   19        20                     ││
│  │                              ┌──────┐  ┌──────┐            ┌──────┐               ││
│  │                              │PR-019│  │WO-247│            │WO-248│               ││
│  │                              │Call  │  │Brown │            │Miller│               ││
│  │                              │Jones │  │START │            │Trees │               ││
│  │                              └──────┘  │$25K  │            │$18K  │               ││
│  │                                        └──────┘            └──────┘               ││
│  │                                                                                     ││
│  │  ──────  ──────  ──────  ──────  ──────  ──────  ──────                           ││
│  │                                                                                     ││
│  │  21        22        23        24        25        26        27                    ││
│  │                                          ┌──────┐                                  ││
│  │                                          │WO-251│                                  ││
│  │                                          │Lee   │                                  ││
│  │                                          │Trees │                                  ││
│  │                                          │$12K  │                                  ││
│  │                                          └──────┘                                  ││
│  │                                                                                     ││
│  │  ──────  ──────  ──────  ──────  ──────  ──────  ──────                           ││
│  │                                                                                     ││
│  │  28        29        30                                                            ││
│  │                                                                                     ││
│  │                                                                                     ││
│  └────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│  LEGEND:  🟢 Work Order Scheduled  |  🟠 Invoice Due  |  🟡 Follow-up Reminder        │
│           🔵 Today                                                                      │
│                                                                                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**INTERACTION NOTES:**
- Click date cell to create new project/event
- Drag events to reschedule
- Click event card to view details
- Different colors for different event types (WO, IN, PR follow-ups)
- Today highlighted in blue
- Multi-day events span across dates

---

## WIREFRAME 5: PROJECT DETAIL DRAWER (SIDE PANEL)

Opens when clicking any card/row:

```
┌────────────────────────────────────────────┐
│  WO-1247: Jennifer Brown           [X]    │
├────────────────────────────────────────────┤
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  STATUS                                ││
│  │  🟢 In Progress                        ││
│  │  Started: Nov 18, 2025                 ││
│  │  Progress: 75% complete                ││
│  └────────────────────────────────────────┘│
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  CUSTOMER                              ││
│  │  Jennifer Brown                        ││
│  │  789 Maple Lane                        ││
│  │  Smithville, TX 78957                  ││
│  │  📞 (555) 123-4567                     ││
│  │  📧 jbrown@email.com                   ││
│  │                                        ││
│  │  [View Customer Profile]               ││
│  └────────────────────────────────────────┘│
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  SERVICE DETAILS                       ││
│  │  🌲 Forestry Mulching                  ││
│  │  📏 5.2 acres                          ││
│  │  📝 Heavy brush, medium trees          ││
│  └────────────────────────────────────────┘│
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  CREW & SCHEDULE                       ││
│  │  👷 Crew A                             ││
│  │     • John Smith (Operator)            ││
│  │     • Mike Johnson (Groundman)         ││
│  │     • Sarah Lee (Groundman)            ││
│  │                                        ││
│  │  📅 Nov 18-19, 2025 (2 days)           ││
│  │  ⏱️  Est: 16 hours                     ││
│  │  ✅ Actual: 12 hours so far            ││
│  │                                        ││
│  │  [Edit Crew]  [Log Time]               ││
│  └────────────────────────────────────────┘│
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  FINANCIAL SUMMARY                     ││
│  │                                        ││
│  │  Revenue:        $25,000               ││
│  │                                        ││
│  │  Costs:                                ││
│  │  • Labor:        $12,800               ││
│  │  • Equipment:    $5,400                ││
│  │  • Total Cost:   $18,200 (73%)         ││
│  │                                        ││
│  │  Projected Profit: $6,800 (27%)        ││
│  │  ─────────────────────────────         ││
│  │  Target Margin:    30%                 ││
│  │  Variance:         -3% ⚠️              ││
│  └────────────────────────────────────────┘│
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  TIME LOGS (12 hours)                  ││
│  │                                        ││
│  │  Nov 18:                               ││
│  │  • John: 8h (Mulching)                 ││
│  │  • Mike: 8h (Mulching)                 ││
│  │  • Sarah: 8h (Mulching)                ││
│  │                                        ││
│  │  Nov 19 (today):                       ││
│  │  • John: 4h (Mulching) ⏱️ ACTIVE       ││
│  │  • Mike: 4h (Mulching) ⏱️ ACTIVE       ││
│  │  • Sarah: 4h (Mulching) ⏱️ ACTIVE      ││
│  │                                        ││
│  │  [View All Time Logs]                  ││
│  └────────────────────────────────────────┘│
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  NOTES & ATTACHMENTS                   ││
│  │                                        ││
│  │  📝 Customer wants minimal lawn        ││
│  │     damage. Use lighter mulcher.       ││
│  │                                        ││
│  │  📎 site_map.pdf                       ││
│  │  📎 proposal_PR-0016.pdf               ││
│  │                                        ││
│  │  [Add Note]  [Upload File]             ││
│  └────────────────────────────────────────┘│
│                                            │
│  ┌────────────────────────────────────────┐│
│  │  PROJECT HISTORY                       ││
│  │                                        ││
│  │  LE-0019 → PR-0016 → WO-1247           ││
│  │                                        ││
│  │  Nov 1:  Lead created (Google)         ││
│  │  Nov 3:  Proposal sent ($25K, 30%)     ││
│  │  Nov 10: Proposal accepted             ││
│  │  Nov 15: Work order created            ││
│  │  Nov 18: Job started (Crew A)          ││
│  │  Nov 19: In progress...                ││
│  │                                        ││
│  │  [View Full Timeline]                  ││
│  └────────────────────────────────────────┘│
│                                            │
│  ─────────────────────────────────────────│
│                                            │
│  [Update Status]  [Mark Complete]         │
│  [Edit Work Order]  [Delete]              │
│                                            │
└────────────────────────────────────────────┘
```

**INTERACTION NOTES:**
- Drawer slides in from right (80% screen width on desktop)
- Scrollable content
- Collapsible sections
- Real-time updates (crew time logs)
- Quick actions at bottom

---

## WIREFRAME 6: STAGE TRANSITION MODAL - LE → PR

```
┌─────────────────────────────────────────────────────────────┐
│  Create Proposal from Lead LE-0023                    [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  CUSTOMER INFORMATION                                   ││
│  │                                                         ││
│  │  Name: Tom Smith                              ✓        ││
│  │  Address: 123 Oak Street, Smithville, TX      ✓        ││
│  │  Phone: (555) 123-4567                        ✓        ││
│  │  Email: tsmith@email.com                               ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  SERVICE ITEMS                                          ││
│  │                                                         ││
│  │  [+ Add Service Item]                                   ││
│  │                                                         ││
│  │  1. Forestry Mulching                         [Edit][X]││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │  Service: [Forestry Mulching ▾]                     │││
│  │  │  Acres: [3.5]                                       │││
│  │  │  Conditions: [Medium ▾]                             │││
│  │  │                                                     │││
│  │  │  Estimated Duration: 2 days (auto-calculated)       │││
│  │  │  Labor Cost: $4,200                                 │││
│  │  │  Equipment Cost: $1,800                             │││
│  │  │  Total Cost: $6,000                                 │││
│  │  │                                                     │││
│  │  │  Margin: [30]% → Customer Price: $8,571             │││
│  │  └─────────────────────────────────────────────────────┘││
│  │                                                         ││
│  │  2. Transport to/from Site                    [Edit][X]││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │  Included: Setup, transport, teardown               │││
│  │  │  Cost: $1,000 → Price: $1,429 (30% margin)          │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  PRICING SUMMARY                                        ││
│  │                                                         ││
│  │  Subtotal Cost:        $7,000                           ││
│  │  Profit Margin:        [30]%                            ││
│  │  Profit Amount:        $2,100                           ││
│  │  ───────────────────────────────                        ││
│  │  CUSTOMER PRICE:       $10,000                          ││
│  │                                                         ││
│  │  ☐ Add tax (8.25%): +$825                              ││
│  │                                                         ││
│  │  TOTAL WITH TAX:       $10,825                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  PROPOSAL SETTINGS                                      ││
│  │                                                         ││
│  │  Valid Until: [Dec 1, 2025 ▾]  (30 days)               ││
│  │  Payment Terms: [Net 30 ▾]                              ││
│  │                                                         ││
│  │  Notes to Customer (optional):                          ││
│  │  [________________________________________]             ││
│  │  [________________________________________]             ││
│  │                                                         ││
│  │  ☑ Send proposal immediately via email                 ││
│  │  ☑ Set follow-up reminder for 3 days                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Cancel]  [Save as Draft]        [Create & Send Proposal] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## WIREFRAME 7: STAGE TRANSITION MODAL - PR → WO

```
┌─────────────────────────────────────────────────────────────┐
│  Accept Proposal PR-0018 → Create Work Order          [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Customer Accepted Proposal                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  PROPOSAL SUMMARY                                       ││
│  │                                                         ││
│  │  Customer: Maria Jones                                  ││
│  │  Service: Forestry Mulching - 3.5 acres                 ││
│  │  Contract Price: $8,500                                 ││
│  │  Expected Profit: $2,550 (30%)                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  JOB SCHEDULING                                         ││
│  │                                                         ││
│  │  Start Date: [Nov 25, 2025 ▾]  * Required              ││
│  │  Est Duration: 2 days (from proposal)                   ││
│  │  End Date: Nov 26, 2025 (auto-calculated)               ││
│  │                                                         ││
│  │  Weather: ☀️ Clear, 72°F (good conditions)              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  CREW ASSIGNMENT                                        ││
│  │                                                         ││
│  │  Select Crew: [Crew A - Mulching Team ▾]  * Required   ││
│  │                                                         ││
│  │  Crew A Members:                         Availability   ││
│  │  ✅ John Smith (Operator)                ✅ Available   ││
│  │  ✅ Mike Johnson (Groundman)             ✅ Available   ││
│  │  ✅ Sarah Lee (Groundman)                ✅ Available   ││
│  │                                                         ││
│  │  Hourly Cost: $128/hr (all members + burden)            ││
│  │  Est Total Labor: $2,048 (16 hours)                     ││
│  │                                                         ││
│  │  ⚠️  Crew B is booked Nov 25-26                         ││
│  │                                                         ││
│  │  [View Crew Schedule]                                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  EQUIPMENT ASSIGNMENT                                   ││
│  │                                                         ││
│  │  Primary Equipment:                                     ││
│  │  [Forestry Mulcher #2 ▾]                ✅ Available   ││
│  │  Hourly Cost: $95/hr                                    ││
│  │                                                         ││
│  │  Support Equipment:                                     ││
│  │  [+ Add Equipment]                                      ││
│  │  • Pickup Truck #1              $25/hr  ✅ Available   ││
│  │                                                         ││
│  │  Est Total Equipment: $1,920 (16 hours)                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  COST VERIFICATION                                      ││
│  │                                                         ││
│  │  Estimated Labor:      $2,048                           ││
│  │  Estimated Equipment:  $1,920                           ││
│  │  Transport & Setup:    $1,000                           ││
│  │  ───────────────────────────────                        ││
│  │  Total Est Cost:       $4,968                           ││
│  │                                                         ││
│  │  Contract Price:       $8,500                           ││
│  │  Expected Profit:      $3,532 (42%) ✅                  ││
│  │                                                         ││
│  │  ✅ Margin improved vs proposal (was 30%)               ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  JOB NOTES (optional)                                   ││
│  │                                                         ││
│  │  [________________________________________]             ││
│  │  [________________________________________]             ││
│  │                                                         ││
│  │  Attachments from Proposal:                             ││
│  │  📎 site_map.pdf                                        ││
│  │  📎 customer_notes.txt                                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  NOTIFICATIONS                                          ││
│  │                                                         ││
│  │  ☑ Send job assignment to Crew A                       ││
│  │  ☑ Add to crew calendar                                ││
│  │  ☑ Send confirmation email to customer                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Cancel]  [Save as Draft]             [Create Work Order] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## WIREFRAME 8: MOBILE VIEWS (RESPONSIVE)

### MOBILE - PIPELINE LIST VIEW

```
┌─────────────────────┐
│  Pipeline      [☰]  │
├─────────────────────┤
│                     │
│  [🔍 Search...]     │
│                     │
│  [All] [LE] [PR]    │
│  [WO] [IN] [CO]     │
│                     │
├─────────────────────┤
│                     │
│  🟢 WO-1247         │
│  ─────────────────  │
│  Jennifer Brown     │
│  Mulching 5.2ac     │
│                     │
│  In Progress        │
│  $25,000            │
│                     │
│  Started 2d ago     │
│  Crew A • 75% done  │
│                     │
│  [View] [Time] [✓]  │
│  ─────────────────  │
│                     │
│  🟡 PR-0019         │
│  ─────────────────  │
│  Maria Jones        │
│  Mulching 3.5ac     │
│                     │
│  Sent 2d ago        │
│  $8,500             │
│                     │
│  Expires in 12 days │
│                     │
│  [Send] [Call] [✓]  │
│  ─────────────────  │
│                     │
│  🟠 IN-0089         │
│  ─────────────────  │
│  Robert Davis       │
│  Tree Removal       │
│                     │
│  Invoice Sent       │
│  $15,000 due        │
│                     │
│  Due in 27 days     │
│                     │
│  [Remind] [Pay] [>] │
│  ─────────────────  │
│                     │
│  ⚪ LE-0023          │
│  ─────────────────  │
│  Tom Smith          │
│  Est. Clearing      │
│                     │
│  New Lead           │
│  $12,000 est        │
│                     │
│  5 days ago         │
│                     │
│  [Call] [Quote] [>] │
│  ─────────────────  │
│                     │
│                     │
│  [+ New Lead]       │
│                     │
└─────────────────────┘
```

### MOBILE - SWIPE ACTIONS

**Swipe Left (Delete/Archive):**
```
┌─────────────────────┐
│  🟢 WO-1247    [❌] │
│  ─────────────────  │
│  Jennifer Brown     │
│  Mulching 5.2ac     │
└─────────────────────┘
         ← Swipe left reveals delete
```

**Swipe Right (Quick Actions):**
```
┌─────────────────────┐
│ [✓] 🟢 WO-1247      │
│  ─────────────────  │
│  Jennifer Brown     │
│  Mulching 5.2ac     │
└─────────────────────┘
    ↑ Swipe right reveals complete action
```

### MOBILE - PROJECT DETAIL (FULL SCREEN)

```
┌─────────────────────┐
│  [<] WO-1247   [⋮]  │
├─────────────────────┤
│                     │
│  Jennifer Brown     │
│  789 Maple Lane     │
│  Smithville, TX     │
│                     │
│  [📞] [📧] [📍]     │
│                     │
├─────────────────────┤
│  STATUS             │
│  🟢 In Progress     │
│  Started Nov 18     │
│  75% Complete       │
├─────────────────────┤
│  SERVICE            │
│  🌲 Mulching        │
│  📏 5.2 acres       │
├─────────────────────┤
│  CREW               │
│  👷 Crew A (3)      │
│  • John             │
│  • Mike             │
│  • Sarah            │
├─────────────────────┤
│  FINANCIALS         │
│  Revenue: $25,000   │
│  Cost: $18,200      │
│  Profit: $6,800     │
│  Margin: 27%        │
├─────────────────────┤
│  TIME LOGS          │
│  Nov 18: 24h total  │
│  Nov 19: 12h (now)  │
│                     │
│  [View All Logs]    │
├─────────────────────┤
│  NOTES              │
│  "Use light         │
│  mulcher for lawn"  │
│                     │
│  [+ Add Note]       │
├─────────────────────┤
│                     │
│  [Update Status]    │
│  [Log Time]         │
│  [Mark Complete]    │
│                     │
└─────────────────────┘
```

### MOBILE - BOTTOM SHEET ACTION MODAL

```
┌─────────────────────┐
│                     │
│  Project List       │
│                     │
└─────────────────────┘
         ⬇
┌─────────────────────┐
│                     │
│  ═══════════════    │  ← Drag handle
│                     │
│  Create Proposal    │
│                     │
│  Customer ✓         │
│  Tom Smith          │
│                     │
│  Service Items      │
│  [+ Add Service]    │
│                     │
│  Mulching           │
│  [3.5] acres        │
│                     │
│  Cost: $6,000       │
│  Margin: [30]%      │
│  Price: $8,571      │
│                     │
│  [Cancel] [Create]  │
└─────────────────────┘
```

---

## WIREFRAME 9: ANALYTICS DASHBOARD

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ShopOS                                                    [User Menu] [Notifications]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  < Dashboard  /  Pipeline  /  Analytics                                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐│
│  │  PIPELINE ANALYTICS                        [This Month ▾]  [Export Report]        ││
│  └───────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐              │
│  │   LEADS     │  PROPOSALS  │    WORK     │  INVOICES   │  COMPLETED  │              │
│  │             │             │   ORDERS    │             │             │              │
│  ├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤              │
│  │             │             │             │             │             │              │
│  │     12      │      8      │     15      │      6      │     142     │              │
│  │   Active    │   Active    │   Active    │  Outstanding│  Lifetime   │              │
│  │             │             │             │             │             │              │
│  │   $145K     │    $68K     │   $385K     │    $92K     │   $1.2M     │              │
│  │  Estimated  │   Quoted    │ In Progress │     Due     │   Revenue   │              │
│  │             │             │             │             │             │              │
│  │  Avg 4.2d   │  Win 67%    │  On-time    │  DSO 18d    │  Margin     │              │
│  │    old      │   rate      │    87%      │   (target   │    28%      │              │
│  │             │             │             │    30d)     │             │              │
│  │             │             │             │             │             │              │
│  │  🟢 Healthy │  🟡 Follow  │  🟢 Healthy │  🟢 Healthy │  🟢 Good    │              │
│  │             │     up      │             │             │             │              │
│  └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘              │
│                                                                                         │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐│
│  │  CONVERSION FUNNEL                                                                 ││
│  │                                                                                    ││
│  │  LE (20) ────60%────> PR (12) ────67%────> WO (8) ────100%────> IN (8) ────88%────> CO (7) ││
│  │                                                                                    ││
│  │  Lead Sources:          Lost Reasons (PR):      Delayed Jobs:                     ││
│  │  • Google: 8 (40%)      • Price: 2              • None ✓                          ││
│  │  • Referral: 7 (35%)    • Competitor: 2                                           ││
│  │  • Facebook: 3 (15%)    • Timing: 0                                               ││
│  │  • Other: 2 (10%)                                                                 ││
│  │                                                                                    ││
│  │  Avg Lead-to-Cash Cycle: 18 days (target: 21) ✅                                  ││
│  └────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                         │
│  ┌──────────────────────────────────────────┬────────────────────────────────────────┐│
│  │  REVENUE TREND (Last 6 Months)           │  TOP SERVICES BY REVENUE               ││
│  │                                          │                                        ││
│  │  $200K ┤                          ●      │  1. Forestry Mulching    $520K (43%)   ││
│  │        │                                 │  2. Tree Removal         $380K (32%)   ││
│  │  $150K ┤             ●       ●    │      │  3. Stump Grinding       $180K (15%)   ││
│  │        │        ●                        │  4. Land Clearing        $120K (10%)   ││
│  │  $100K ┤   ●                             │                                        ││
│  │        │●                                │  Total: $1.2M                          ││
│  │   $50K ┤                                 │  Avg Margin: 28%                       ││
│  │        └─┬───┬───┬───┬───┬───┬──        │                                        ││
│  │         Jun Jul Aug Sep Oct Nov          │                                        ││
│  └──────────────────────────────────────────┴────────────────────────────────────────┘│
│                                                                                         │
│  ┌──────────────────────────────────────────┬────────────────────────────────────────┐│
│  │  ALERTS & ACTIONS                        │  PAYMENT STATUS                        ││
│  │                                          │                                        ││
│  │  🔴 3 overdue invoices ($42K)            │  ┌──────────────────────────────────┐ ││
│  │     [View Invoices]                      │  │     Outstanding: $92K            │ ││
│  │                                          │  │     ████████░░░░░░░░  (60%)      │ ││
│  │  🟡 5 proposals expiring in 7 days       │  │                                  │ ││
│  │     [Send Reminders]                     │  │     0-30d:  $58K  (63%)         │ ││
│  │                                          │  │     31-60d: $22K  (24%)         │ ││
│  │  🟢 12 new leads this week               │  │     61-90d: $8K   (9%)          │ ││
│  │     [Review Leads]                       │  │     90+d:   $4K   (4%) ⚠️        │ ││
│  │                                          │  │                                  │ ││
│  │  🟡 2 jobs behind schedule               │  │     Avg DSO: 18 days ✅          │ ││
│  │     [Check Status]                       │  │     Target: 30 days              │ ││
│  │                                          │  └──────────────────────────────────┘ ││
│  └──────────────────────────────────────────┴────────────────────────────────────────┘│
│                                                                                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## WIREFRAME 10: FILTER & SEARCH INTERFACE

```
┌─────────────────────────────────────────────────────────────┐
│  ADVANCED FILTERS                                      [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  STAGE                                                  ││
│  │  ☑ Leads (12)                                           ││
│  │  ☑ Proposals (8)                                        ││
│  │  ☑ Work Orders (15)                                     ││
│  │  ☑ Invoices (6)                                         ││
│  │  ☐ Completed (142)                                      ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  DATE RANGE                                             ││
│  │  ○ All Time                                             ││
│  │  ● This Month                                           ││
│  │  ○ This Quarter                                         ││
│  │  ○ Custom: [Nov 1] to [Nov 30]                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  VALUE                                                  ││
│  │  Min: [$_____]  Max: [$_____]                           ││
│  │  ☐ Under $5K (8)                                        ││
│  │  ☑ $5K - $15K (18)                                      ││
│  │  ☑ $15K - $30K (12)                                     ││
│  │  ☐ Over $30K (3)                                        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  SERVICE TYPE                                           ││
│  │  ☑ Forestry Mulching (22)                               ││
│  │  ☑ Tree Removal (12)                                    ││
│  │  ☐ Stump Grinding (7)                                   ││
│  │  ☐ Land Clearing (4)                                    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  CREW                                                   ││
│  │  ☐ Crew A                                               ││
│  │  ☐ Crew B                                               ││
│  │  ☐ Unassigned                                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  STATUS                                                 ││
│  │  ☐ On Track                                             ││
│  │  ☑ Needs Attention (12)                                 ││
│  │  ☐ Overdue (3)                                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Clear All]                [Apply Filters] (41 results)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## COLOR PALETTE & DESIGN TOKENS

```typescript
// Design System - Pipeline Colors

const STAGE_COLORS = {
  LE: {
    primary: '#8E8E93',    // Gray
    light: '#E5E5EA',      // Light gray background
    border: '#D1D1D6',     // Border
  },
  PR: {
    primary: '#FF9500',    // Orange
    light: '#FFF4E5',      // Light orange background
    border: '#FFCC80',     // Border
  },
  WO: {
    primary: '#34C759',    // Green
    light: '#E8F5E9',      // Light green background
    border: '#81C784',     // Border
  },
  IN: {
    primary: '#FF9500',    // Orange (same as PR but different context)
    light: '#FFF4E5',
    border: '#FFCC80',
  },
  CO: {
    primary: '#007AFF',    // Blue
    light: '#E3F2FD',      // Light blue background
    border: '#64B5F6',     // Border
  }
};

const STATUS_COLORS = {
  success: '#34C759',      // Green
  warning: '#FF9500',      // Orange
  error: '#FF3B30',        // Red
  info: '#007AFF',         // Blue
  neutral: '#8E8E93',      // Gray
};

const URGENCY_INDICATORS = {
  critical: '🔴',          // Overdue, immediate action
  warning: '🟡',           // Expiring soon, needs attention
  normal: '🟢',            // On track
  inactive: '⚪',          // No urgency
};
```

---

**End of Wireframes Document**

These wireframes provide pixel-perfect specifications for developers to implement the pipeline management system with consistent UX across all views and devices.
