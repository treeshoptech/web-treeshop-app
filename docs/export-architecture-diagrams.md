# Export System Architecture Diagrams

## System Overview

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                        EXPORT SYSTEM OVERVIEW                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

                            ┌──────────────┐
                            │    USER      │
                            │   (Browser)  │
                            └──────┬───────┘
                                   │
                    1. Click "Export PDF/JPG"
                                   │
                                   ▼
              ┌─────────────────────────────────────────┐
              │   FRONTEND (Client Component)           │
              │  /app/shopos/reports/[id]/page.tsx      │
              │                                          │
              │  • Report display UI                    │
              │  • Export buttons (PDF/JPG)             │
              │  • Loading states                       │
              │  • Error handling                       │
              └──────────────────┬──────────────────────┘
                                 │
                  2. Fetch API Route with Report ID
                                 │
                                 ▼
              ┌─────────────────────────────────────────┐
              │   API ROUTE (Server-Side)               │
              │  /app/api/export/report/[id]/route.ts   │
              │                                          │
              │  • Authentication (Clerk)               │
              │  • Authorization (Org check)            │
              │  • Data fetching                        │
              │  • Document generation orchestration    │
              │  • Response streaming                   │
              └──────┬──────────────────┬────────────────┘
                     │                  │
     3a. Auth Check │                  │ 3b. Fetch Data
                     │                  │
                     ▼                  ▼
         ┌──────────────────┐   ┌──────────────────────┐
         │  Clerk Auth      │   │  Convex Backend      │
         │                  │   │                      │
         │  • Verify token  │   │  • Query: getProject │
         │  • Get org ID    │   │    Report            │
         │  • Get user ID   │   │  • Return enriched   │
         └──────────────────┘   │    data              │
                                └───────────┬──────────┘
                                            │
                          4. Report Data (JSON)
                                            │
                                            ▼
              ┌─────────────────────────────────────────┐
              │   DOCUMENT GENERATOR                    │
              │  /lib/export/documentGenerator.ts       │
              │                                          │
              │  • Format routing (PDF/JPG)             │
              │  • Template rendering                   │
              │  • Buffer generation                    │
              └──────┬──────────────────┬────────────────┘
                     │                  │
        5a. PDF Gen  │                  │ 5b. JPG Gen
                     │                  │
                     ▼                  ▼
         ┌──────────────────┐   ┌──────────────────────┐
         │  PDF Generator   │   │  JPG Generator       │
         │  (@react-pdf)    │   │  (puppeteer)         │
         │                  │   │                      │
         │  • Render React  │   │  • Render HTML       │
         │    component     │   │  • Screenshot        │
         │  • Generate PDF  │   │  • Optimize image    │
         │    buffer        │   │  • Return JPEG       │
         └──────────┬───────┘   └──────────┬───────────┘
                    │                      │
                    └──────────┬───────────┘
                               │
                  6. Binary Document (Buffer)
                               │
                               ▼
              ┌─────────────────────────────────────────┐
              │   RESPONSE STREAM                       │
              │                                          │
              │  Headers:                               │
              │    Content-Type: application/pdf        │
              │    Content-Disposition: attachment      │
              │    Cache-Control: private, max-age=3600 │
              │    ETag: "report-{id}-{timestamp}"      │
              │                                          │
              │  Body: Binary document data             │
              └──────────────────┬──────────────────────┘
                                 │
                  7. Stream to Browser
                                 │
                                 ▼
                         ┌──────────────┐
                         │  USER        │
                         │  (Downloads) │
                         │              │
                         │  WO-1234.pdf │
                         └──────────────┘
```

---

## Request Flow (Sequence Diagram)

```
User         Client       API Route      Clerk       Convex      Generator
 │             │              │            │            │            │
 │ Click Export│              │            │            │            │
 ├────────────>│              │            │            │            │
 │             │              │            │            │            │
 │             │ GET /api/export/report/123?format=pdf │            │
 │             ├─────────────>│            │            │            │
 │             │              │            │            │            │
 │             │              │ Verify Auth│            │            │
 │             │              ├───────────>│            │            │
 │             │              │<───────────┤            │            │
 │             │              │ userId, orgId           │            │
 │             │              │            │            │            │
 │             │              │ Query getProjectReport  │            │
 │             │              ├───────────────────────>│            │
 │             │              │<───────────────────────┤            │
 │             │              │     Report Data         │            │
 │             │              │            │            │            │
 │             │              │ Verify Ownership        │            │
 │             │              │ (report.companyId === orgId)        │
 │             │              │            │            │            │
 │             │              │ Generate Document       │            │
 │             │              ├───────────────────────────────────>│
 │             │              │            │            │            │
 │             │              │            │            │  Render    │
 │             │              │            │            │  Template  │
 │             │              │            │            │    │       │
 │             │              │            │            │  Generate  │
 │             │              │            │            │  Buffer    │
 │             │              │            │            │    │       │
 │             │              │<───────────────────────────────────┤
 │             │              │     PDF Buffer          │            │
 │             │              │            │            │            │
 │             │     200 OK   │            │            │            │
 │             │  + PDF Binary│            │            │            │
 │             │<─────────────┤            │            │            │
 │             │              │            │            │            │
 │  Download   │              │            │            │            │
 │<────────────┤              │            │            │            │
 │ Complete    │              │            │            │            │
 │             │              │            │            │            │
```

---

## Component Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    COMPONENT BREAKDOWN                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /app/shopos/reports/[id]/page.tsx                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ProjectReportDetailPage (Client Component)              │   │
│  │                                                           │   │
│  │  State:                                                   │   │
│  │    - isExporting: boolean                                │   │
│  │    - report: ProjectReport                               │   │
│  │                                                           │   │
│  │  Methods:                                                 │   │
│  │    - handleExport(format: 'pdf' | 'jpg'): Promise<void> │   │
│  │    - triggerDownload(blob: Blob, filename: string)      │   │
│  │                                                           │   │
│  │  UI:                                                      │   │
│  │    - [Export PDF Button]                                 │   │
│  │    - [Export JPG Button]                                 │   │
│  │    - Loading indicator                                   │   │
│  │    - Error snackbar                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                │ fetch()
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API ROUTE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /app/api/export/report/[id]/route.ts                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  GET Handler                                             │   │
│  │                                                           │   │
│  │  Flow:                                                    │   │
│  │    1. Extract params (reportId, format)                  │   │
│  │    2. Authenticate request (Clerk)                       │   │
│  │    3. Fetch report data (Convex)                         │   │
│  │    4. Authorize access (org ownership)                   │   │
│  │    5. Generate document                                  │   │
│  │    6. Return Response with headers                       │   │
│  │                                                           │   │
│  │  Error Handling:                                         │   │
│  │    - 401: Unauthorized (no auth)                         │   │
│  │    - 403: Forbidden (wrong org)                          │   │
│  │    - 404: Not Found (invalid report ID)                  │   │
│  │    - 500: Server Error (generation failed)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                │ generateDocument()
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /lib/export/documentGenerator.ts                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  generateDocument(report, format)                        │   │
│  │                                                           │   │
│  │  Router:                                                  │   │
│  │    if format === 'pdf':                                  │   │
│  │      return generatePDF(report)                          │   │
│  │    else if format === 'jpg':                             │   │
│  │      return generateJPG(report)                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  /lib/export/pdfGenerator.ts                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  generatePDF(report: ProjectReport): Promise<Buffer>     │   │
│  │                                                           │   │
│  │  Implementation:                                         │   │
│  │    1. Import template component                          │   │
│  │    2. Render with report data                            │   │
│  │    3. Use @react-pdf/renderer                            │   │
│  │    4. Return PDF buffer                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  /lib/export/jpgGenerator.ts                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  generateJPG(report: ProjectReport): Promise<Buffer>     │   │
│  │                                                           │   │
│  │  Implementation:                                         │   │
│  │    1. Launch headless browser (puppeteer)               │   │
│  │    2. Render HTML template                               │   │
│  │    3. Take screenshot at 300 DPI                         │   │
│  │    4. Convert to JPEG                                    │   │
│  │    5. Cleanup browser                                    │   │
│  │    6. Return image buffer                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                │ render()
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TEMPLATE LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /lib/export/templates/ReportPDFTemplate.tsx                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ReportPDFTemplate({ report })                           │   │
│  │                                                           │   │
│  │  Structure:                                              │   │
│  │    <Document>                                            │   │
│  │      <Page size="LETTER">                               │   │
│  │        <Header />                                        │   │
│  │        <CustomerInfo />                                  │   │
│  │        <FinancialSummary />                              │   │
│  │        <LineItemsTable />                                │   │
│  │        <TimeLogsSection />                               │   │
│  │        <CrewMembers />                                   │   │
│  │        <Footer />                                        │   │
│  │      </Page>                                             │   │
│  │    </Document>                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  /lib/export/templates/ReportHTMLTemplate.tsx                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ReportHTMLTemplate({ report })                          │   │
│  │                                                           │   │
│  │  Structure: (same as PDF but HTML/CSS)                   │   │
│  │    <html>                                                │   │
│  │      <head>                                              │   │
│  │        <style>/* Print-optimized CSS */</style>         │   │
│  │      </head>                                             │   │
│  │      <body>                                              │   │
│  │        {/* Same sections as PDF */}                      │   │
│  │      </body>                                             │   │
│  │    </html>                                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow (Detailed)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    DETAILED DATA FLOW                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Step 1: USER ACTION
┌─────────────────────────────────────────────┐
│  User clicks "Export PDF"                   │
│                                             │
│  Input:                                     │
│    - reportId: "k17hjdgq0pnm7yxv..."       │
│    - format: "pdf"                          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
Step 2: CLIENT COMPONENT
┌─────────────────────────────────────────────┐
│  handleExport(format)                       │
│                                             │
│  1. Set loading: setIsExporting(true)       │
│  2. Construct URL:                          │
│     `/api/export/report/${reportId}?        │
│      format=${format}`                      │
│  3. Fetch with auth headers                 │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
Step 3: HTTP REQUEST
┌─────────────────────────────────────────────┐
│  GET /api/export/report/k17h...?format=pdf  │
│                                             │
│  Headers:                                   │
│    Cookie: __clerk_session=...              │
│    Accept: application/pdf, */*             │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
Step 4: API ROUTE HANDLER
┌─────────────────────────────────────────────┐
│  async function GET(request, { params })    │
│                                             │
│  A. Parse Request                           │
│     - reportId = params.id                  │
│     - format = searchParams.get('format')   │
│                                             │
│  B. Authenticate                            │
│     const { userId, orgId } = await auth()  │
│     ├─ userId: "user_abc123"                │
│     └─ orgId: "org_xyz789"                  │
│                                             │
│  C. Fetch Data                              │
│     const report = await convex.query(...)  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
Step 5: CONVEX QUERY
┌─────────────────────────────────────────────┐
│  api.projectReports.getProjectReport        │
│                                             │
│  Query:                                     │
│    reportId: "k17hjdgq0pnm7yxv..."         │
│                                             │
│  Returns:                                   │
│  {                                          │
│    _id: "k17hjdgq0pnm7yxv...",             │
│    companyId: "org_xyz789",                │
│    jobNumber: "WO-1234",                   │
│    customerName: "Acme Corp",              │
│    customerAddress: "123 Main St...",      │
│    totalInvestment: 15000,                 │
│    actualTotalCost: 10500,                 │
│    profit: 4500,                           │
│    profitMargin: 30,                       │
│    lineItems: [                            │
│      {                                      │
│        displayName: "Forestry Mulching",   │
│        estimatedHours: 8,                  │
│        actualProductiveHours: 7.5,         │
│        lineItemTotal: 5000                 │
│      },                                     │
│      // ... more items                     │
│    ],                                       │
│    timeLogs: {                             │
│      "emp_001": {                          │
│        employeeName: "John Doe",           │
│        totalHours: 16,                     │
│        logs: [...]                         │
│      }                                      │
│    },                                       │
│    crewMembers: [...]                      │
│  }                                          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
Step 6: AUTHORIZATION CHECK
┌─────────────────────────────────────────────┐
│  if (report.companyId !== orgId)            │
│    return 403 Forbidden                     │
│                                             │
│  ✓ Verified: org_xyz789 === org_xyz789      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
Step 7: DOCUMENT GENERATION
┌─────────────────────────────────────────────┐
│  const buffer = await generateDocument(     │
│    report, format                           │
│  )                                          │
│                                             │
│  Format Router:                             │
│    format === 'pdf'                         │
│      → generatePDF(report)                  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
Step 8: PDF GENERATION
┌─────────────────────────────────────────────┐
│  import { pdf } from '@react-pdf/renderer'  │
│                                             │
│  1. Create React element:                   │
│     const doc = (                           │
│       <ReportPDFTemplate report={report} /> │
│     )                                        │
│                                             │
│  2. Render to PDF:                          │
│     const pdfStream = pdf(doc)              │
│                                             │
│  3. Convert to buffer:                      │
│     const buffer = await pdfStream          │
│       .toBuffer()                           │
│                                             │
│  Returns:                                   │
│    Buffer <25 4d 46 2d 31 2e 34 0a ...>    │
│    (Binary PDF data)                        │
│    Size: ~487,392 bytes (476 KB)           │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
Step 9: RESPONSE CONSTRUCTION
┌─────────────────────────────────────────────┐
│  return new Response(buffer, {              │
│    status: 200,                             │
│    headers: {                               │
│      'Content-Type': 'application/pdf',     │
│      'Content-Disposition':                 │
│        'attachment; filename="WO-1234.pdf"',│
│      'Content-Length': '487392',            │
│      'Cache-Control':                       │
│        'private, max-age=3600',             │
│      'ETag': '"k17h...-1700755200000"'     │
│    }                                        │
│  })                                         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
Step 10: CLIENT RECEIVES RESPONSE
┌─────────────────────────────────────────────┐
│  const response = await fetch(...)          │
│                                             │
│  1. Check status: response.ok === true      │
│  2. Extract blob:                           │
│     const blob = await response.blob()      │
│  3. Create object URL:                      │
│     const url = URL.createObjectURL(blob)   │
│  4. Create download link:                   │
│     const a = document.createElement('a')   │
│     a.href = url                            │
│     a.download = "WO-1234.pdf"              │
│     a.click()                               │
│  5. Cleanup:                                │
│     URL.revokeObjectURL(url)                │
│     setIsExporting(false)                   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
Step 11: FILE DOWNLOAD
┌─────────────────────────────────────────────┐
│  Browser triggers download                  │
│                                             │
│  File saved to:                             │
│    ~/Downloads/WO-1234.pdf                  │
│                                             │
│  User sees:                                 │
│    ✓ Export successful!                     │
└─────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    ERROR HANDLING FLOW                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

         User Request
              │
              ▼
    ┌─────────────────────┐
    │   API Route Entry   │
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Try-Catch Block    │
    └─────────┬───────────┘
              │
              ├──────────────────────────────────────────────────┐
              │                                                   │
              ▼                                                   │
    ┌─────────────────────┐                                     │
    │  Authentication     │                                     │
    └─────────┬───────────┘                                     │
              │                                                   │
              ├─ FAIL ─────────────────────────────┐            │
              │                                     │            │
              ▼                                     ▼            │
    ┌─────────────────────┐           ┌──────────────────────┐ │
    │  Fetch Report Data  │           │  401 Unauthorized    │ │
    └─────────┬───────────┘           │                      │ │
              │                        │  Response:           │ │
              ├─ FAIL ─────────────┐  │  {                   │ │
              │                     │  │    error: "Auth...", │ │
              ▼                     │  │    code: "UNAUTH"    │ │
    ┌─────────────────────┐        │  │  }                   │ │
    │  Verify Ownership   │        │  └──────────┬───────────┘ │
    └─────────┬───────────┘        │             │             │
              │                     ▼             │             │
              ├─ FAIL ─┐  ┌──────────────────┐   │             │
              │         │  │  404 Not Found   │   │             │
              ▼         │  │                  │   │             │
    ┌─────────────────┐│  │  Response:       │   │             │
    │ Generate Doc    ││  │  {               │   │             │
    └─────────┬───────┘│  │    error: "Not   │   │             │
              │         │  │     found",      │   │             │
              │         │  │    code: "404"   │   │             │
              │         │  │  }               │   │             │
              │         │  └──────────┬───────┘   │             │
              │         │             │            │             │
              │         ▼             │            │             │
              │  ┌──────────────────┐ │            │             │
              │  │  403 Forbidden   │ │            │             │
              │  │                  │ │            │             │
              │  │  Response:       │ │            │             │
              │  │  {               │ │            │             │
              │  │    error: "No    │ │            │             │
              │  │     permission", │ │            │             │
              │  │    code: "403"   │ │            │             │
              │  │  }               │ │            │             │
              │  └──────────┬───────┘ │            │             │
              │             │          │            │             │
              ▼             │          │            │             │
    ┌─────────────────┐    │          │            │             │
    │  Return Success │    │          │            │             │
    │  Response       │    │          │            │             │
    └─────────┬───────┘    │          │            │             │
              │             │          │            │             │
              └─────────────┴──────────┴────────────┴─────────────┤
                                                                   │
                                                                   ▼
                                                        ┌──────────────────┐
                                                        │  Catch Block     │
                                                        │                  │
                                                        │  Unknown Error   │
                                                        │                  │
                                                        │  500 Server Err  │
                                                        │                  │
                                                        │  Response:       │
                                                        │  {               │
                                                        │    error: "...", │
                                                        │    code: "500"   │
                                                        │  }               │
                                                        └──────────┬───────┘
                                                                   │
                                                                   ▼
                                                              Client receives
                                                              error response
                                                                   │
                                                                   ▼
                                                         Show error snackbar
```

---

## Caching Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    MULTI-LAYER CACHE                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

                     First Request
                          │
                          ▼
          ┌────────────────────────────────┐
          │   LAYER 1: Browser Cache       │
          │                                │
          │   Check: Cache-Control header  │
          │   TTL: 1 hour                  │
          │                                │
          │   Cache Miss (first request)   │
          └────────────┬───────────────────┘
                       │
                       │ Request to Server
                       ▼
          ┌────────────────────────────────┐
          │   LAYER 2: Server Memory       │
          │            (Optional)          │
          │                                │
          │   Check: In-memory Map         │
          │   Key: reportId-format         │
          │   TTL: 1 hour                  │
          │                                │
          │   Cache Miss                   │
          └────────────┬───────────────────┘
                       │
                       │ Generate Document
                       ▼
          ┌────────────────────────────────┐
          │   Document Generator           │
          │                                │
          │   Generate PDF (3s)            │
          └────────────┬───────────────────┘
                       │
                       │ PDF Buffer
                       ▼
          ┌────────────────────────────────┐
          │   Store in Server Cache        │
          │                                │
          │   Map.set(key, {               │
          │     buffer: Buffer,            │
          │     timestamp: Date.now(),     │
          │     etag: "..."                │
          │   })                           │
          └────────────┬───────────────────┘
                       │
                       │
                       ▼
          ┌────────────────────────────────┐
          │   Response Headers             │
          │                                │
          │   Cache-Control: private,      │
          │     max-age=3600               │
          │   ETag: "report-123-456"       │
          │   Content-Type: application/pdf│
          └────────────┬───────────────────┘
                       │
                       │ To Browser
                       ▼
          ┌────────────────────────────────┐
          │   Browser Cache Storage        │
          │                                │
          │   Cached until:                │
          │     Date.now() + 3600s         │
          └────────────────────────────────┘


                    Second Request
                    (same report)
                          │
                          ▼
          ┌────────────────────────────────┐
          │   LAYER 1: Browser Cache       │
          │                                │
          │   Cache Hit!                   │
          │   Valid until: [timestamp]     │
          │                                │
          │   Return cached PDF            │
          │   (0ms latency)                │
          └────────────────────────────────┘
                       │
                       │ No server request!
                       ▼
                   Instant Download


              Third Request (after 1 hour)
                          │
                          ▼
          ┌────────────────────────────────┐
          │   LAYER 1: Browser Cache       │
          │                                │
          │   Cache Expired                │
          │   Send conditional request:    │
          │     If-None-Match: "etag..."   │
          └────────────┬───────────────────┘
                       │
                       │ Conditional Request
                       ▼
          ┌────────────────────────────────┐
          │   API Route Handler            │
          │                                │
          │   Compare ETags:               │
          │     request.etag === current   │
          │                                │
          │   Match! (report unchanged)    │
          └────────────┬───────────────────┘
                       │
                       │ 304 Not Modified
                       ▼
          ┌────────────────────────────────┐
          │   Response: 304 Not Modified   │
          │                                │
          │   Headers:                     │
          │     Status: 304                │
          │     ETag: "report-123-456"     │
          │     (no body)                  │
          └────────────┬───────────────────┘
                       │
                       │ Use cached version
                       ▼
          ┌────────────────────────────────┐
          │   Browser revalidates cache    │
          │                                │
          │   Extend TTL: +1 hour          │
          │   Use existing cached file     │
          └────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      CACHE BENEFITS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  First Request:     3000ms (generate + download)                │
│  Second Request:    0ms (browser cache)                         │
│  Third Request:     50ms (304 Not Modified)                     │
│                                                                   │
│  Server Load:       Reduced by ~90%                             │
│  Bandwidth:         Reduced by ~80%                             │
│  User Experience:   Instant repeat downloads                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 DEPLOYMENT ON VERCEL                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

                         Internet
                             │
                             ▼
                ┌────────────────────────┐
                │  Vercel Edge Network   │
                │  (Global CDN)          │
                └────────┬───────────────┘
                         │
                         │ Route Request
                         ▼
        ┌─────────────────────────────────────────┐
        │      Vercel Serverless Function         │
        │      (us-east-1 region)                 │
        │                                          │
        │  ┌────────────────────────────────────┐ │
        │  │  Next.js API Route                 │ │
        │  │  /api/export/report/[id]/route.ts  │ │
        │  │                                     │ │
        │  │  Runtime: Node.js 18                │ │
        │  │  Memory: 1024 MB                    │ │
        │  │  Timeout: 30 seconds                │ │
        │  └─────────────┬──────────────────────┘ │
        │                │                         │
        │                ▼                         │
        │  ┌────────────────────────────────────┐ │
        │  │  Dependencies                      │ │
        │  │                                     │ │
        │  │  • @react-pdf/renderer (~500KB)    │ │
        │  │  • puppeteer-core (~5MB)           │ │
        │  │  • @sparticuz/chromium (~50MB)     │ │
        │  │                                     │ │
        │  │  Total Bundle: ~55 MB              │ │
        │  └────────────────────────────────────┘ │
        └──────────────┬──────────────────────────┘
                       │
                       ├────────────────────────────┐
                       │                            │
                       ▼                            ▼
        ┌──────────────────────┐    ┌─────────────────────────┐
        │   Clerk Auth API     │    │   Convex Backend        │
        │   (External)         │    │   (External)            │
        │                      │    │                         │
        │   • Verify session   │    │   • Query report data   │
        │   • Return userId    │    │   • Verify ownership    │
        │   • Return orgId     │    │   • Return JSON         │
        └──────────────────────┘    └─────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                   SERVERLESS CONSTRAINTS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Max Execution Time:    30 seconds (configurable)               │
│  Max Memory:            1024 MB                                  │
│  Max Response Size:     4.5 MB (streaming bypasses this)        │
│  Cold Start Time:       1-2 seconds (with puppeteer)            │
│  Concurrent Requests:   100 (default)                           │
│                                                                   │
│  Our Performance:                                                │
│    Warm Start:          200ms (auth + fetch)                    │
│                       + 3000ms (generation)                     │
│                       = 3.2s total                              │
│                                                                   │
│    Cold Start:          2000ms (function init)                  │
│                       + 200ms (auth + fetch)                    │
│                       + 3000ms (generation)                     │
│                       = 5.2s total                              │
│                                                                   │
│  Well within limits! ✓                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                     COST ESTIMATES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Vercel Pro Plan: $20/month                                     │
│                                                                   │
│  Included:                                                       │
│    • 1000 GB-Hours function execution                           │
│    • 1000 GB bandwidth                                          │
│                                                                   │
│  Per Export Cost:                                                │
│    • Execution: 3s × 1GB = 0.0008 GB-Hours                      │
│    • Bandwidth: 500 KB download = 0.0005 GB                     │
│                                                                   │
│  Monthly Usage (100 exports):                                    │
│    • Execution: 0.08 GB-Hours (0.008% of quota)                 │
│    • Bandwidth: 0.05 GB (0.005% of quota)                       │
│                                                                   │
│  Additional Costs: $0                                            │
│                                                                   │
│  Total Monthly: $20 (base plan only)                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    SECURITY LAYERS                                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

                    User Request
                         │
                         ▼
          ┌─────────────────────────────────┐
          │  LAYER 1: Authentication        │
          │                                 │
          │  Clerk Session Verification     │
          │                                 │
          │  Checks:                        │
          │    ✓ Valid session token        │
          │    ✓ Not expired                │
          │    ✓ Signature valid            │
          │                                 │
          │  Returns:                       │
          │    • userId                     │
          │    • orgId                      │
          │                                 │
          │  Fail → 401 Unauthorized        │
          └────────────┬────────────────────┘
                       │
                       ▼
          ┌─────────────────────────────────┐
          │  LAYER 2: Input Validation      │
          │                                 │
          │  Validate:                      │
          │    • reportId format (32 chars) │
          │    • format enum (pdf|jpg)      │
          │    • No SQL injection           │
          │    • No path traversal          │
          │                                 │
          │  Sanitize:                      │
          │    • Strip special chars        │
          │    • Validate against regex     │
          │                                 │
          │  Fail → 400 Bad Request         │
          └────────────┬────────────────────┘
                       │
                       ▼
          ┌─────────────────────────────────┐
          │  LAYER 3: Authorization         │
          │                                 │
          │  Verify Ownership:              │
          │    report.companyId === orgId   │
          │                                 │
          │  Checks:                        │
          │    ✓ Report exists              │
          │    ✓ Belongs to user's org      │
          │    ✓ Not deleted                │
          │                                 │
          │  Fail → 403 Forbidden           │
          └────────────┬────────────────────┘
                       │
                       ▼
          ┌─────────────────────────────────┐
          │  LAYER 4: Rate Limiting         │
          │         (Optional)              │
          │                                 │
          │  Check Request Rate:            │
          │    • 10 exports per minute      │
          │    • Per user                   │
          │    • Redis-backed               │
          │                                 │
          │  Prevents:                      │
          │    • Abuse                      │
          │    • DDoS                       │
          │    • Resource exhaustion        │
          │                                 │
          │  Fail → 429 Too Many Requests   │
          └────────────┬────────────────────┘
                       │
                       ▼
          ┌─────────────────────────────────┐
          │  LAYER 5: Content Security      │
          │                                 │
          │  Sanitize User Content:         │
          │    • DOMPurify for HTML         │
          │    • Escape special chars       │
          │    • Remove scripts             │
          │                                 │
          │  Prevents:                      │
          │    • XSS in generated docs      │
          │    • Injection attacks          │
          │                                 │
          └────────────┬────────────────────┘
                       │
                       ▼
          ┌─────────────────────────────────┐
          │  LAYER 6: Resource Limits       │
          │                                 │
          │  Enforce:                       │
          │    • Max generation time: 30s   │
          │    • Max file size: 10 MB       │
          │    • Concurrent limit: 3        │
          │    • Memory limit: 1 GB         │
          │                                 │
          │  Prevents:                      │
          │    • Infinite loops             │
          │    • Memory leaks               │
          │    • Server overload            │
          │                                 │
          │  Fail → 504 Gateway Timeout     │
          └────────────┬────────────────────┘
                       │
                       ▼
                 Safe Document
                   Generation


┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY BEST PRACTICES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✓ Never trust client input                                     │
│  ✓ Always verify ownership                                      │
│  ✓ Use prepared queries (Convex handles this)                   │
│  ✓ Sanitize user-generated content                              │
│  ✓ Set proper CORS headers                                      │
│  ✓ Use HTTPS only (Vercel default)                              │
│  ✓ Log security events                                          │
│  ✓ Implement rate limiting                                      │
│  ✓ Set resource timeouts                                        │
│  ✓ Keep dependencies updated                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure Visual

```
/Users/silvermbpro/web-treeshop-app/
│
├── app/
│   │
│   ├── api/
│   │   └── export/                      ← NEW: Export API routes
│   │       ├── report/
│   │       │   └── [id]/
│   │       │       └── route.ts         ← Main export handler
│   │       │
│   │       └── proposal/                ← Future: Proposal exports
│   │           └── [id]/
│   │               └── route.ts
│   │
│   └── shopos/
│       └── reports/
│           └── [id]/
│               └── page.tsx             ← Modified: Add export buttons
│
├── lib/
│   └── export/                          ← NEW: Export logic
│       │
│       ├── documentGenerator.ts         ← Main orchestrator
│       ├── pdfGenerator.ts              ← PDF-specific logic
│       ├── jpgGenerator.ts              ← JPG-specific logic
│       ├── convexClient.ts              ← Server-side Convex setup
│       │
│       ├── templates/                   ← Document templates
│       │   ├── ReportPDFTemplate.tsx    ← PDF React component
│       │   ├── ReportHTMLTemplate.tsx   ← HTML for JPG
│       │   │
│       │   └── styles/
│       │       ├── reportStyles.ts      ← Shared styles
│       │       └── pdfStyles.ts         ← PDF-specific styles
│       │
│       ├── utils/                       ← Helper utilities
│       │   ├── filename.ts              ← Filename generation
│       │   ├── cache.ts                 ← Cache management
│       │   └── validation.ts            ← Input validation
│       │
│       └── types/                       ← TypeScript types
│           └── export.ts                ← Export-related types
│
├── convex/
│   └── projectReports.ts               ← Existing (no changes)
│
├── docs/
│   ├── export-system-architecture.md   ← This documentation
│   └── export-architecture-diagrams.md ← Visual diagrams
│
└── package.json                        ← Add dependencies
    • @react-pdf/renderer
    • puppeteer-core
    • @sparticuz/chromium
```

---

## Technology Comparison Matrix

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                PDF GENERATION LIBRARIES                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────┬─────────────┬──────────┬───────────┬──────────┐
│   Library      │   Bundle    │  Quality │   Speed   │   DX     │
├────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ @react-pdf/    │   ~500 KB   │  ★★★★☆   │  ★★★★☆    │  ★★★★★   │
│   renderer     │             │  Good    │  Fast     │  React   │
│                │             │          │  2-3s     │  Native  │
├────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ puppeteer +    │   ~50 MB    │  ★★★★★   │  ★★★☆☆    │  ★★★☆☆   │
│   chromium     │  (serverless│  Perfect │  Slow     │  HTML/   │
│                │   version)  │          │  3-5s     │  CSS     │
├────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ pdfkit         │   ~300 KB   │  ★★★☆☆   │  ★★★★★    │  ★★☆☆☆   │
│                │             │  Basic   │  Very     │  Low-    │
│                │             │          │  Fast     │  level   │
│                │             │          │  1-2s     │  API     │
├────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ jsPDF          │   ~200 KB   │  ★★☆☆☆   │  ★★★★★    │  ★★☆☆☆   │
│                │             │  Poor    │  Fast     │  Canvas  │
│                │             │          │  1-2s     │  API     │
└────────────────┴─────────────┴──────────┴───────────┴──────────┘

RECOMMENDATION: @react-pdf/renderer
  • Best balance of quality, speed, and DX
  • React components = familiar for team
  • Works server-side (no browser needed)
  • Good documentation and examples


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                JPG GENERATION OPTIONS                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────┬─────────────┬──────────┬───────────┬──────────┐
│   Approach     │   Setup     │  Quality │   Speed   │   Cost   │
├────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ puppeteer +    │   Medium    │  ★★★★★   │  ★★★☆☆    │  Free    │
│   chromium     │  (~50MB)    │  Perfect │  3-5s     │          │
│   screenshot   │             │  300 DPI │           │          │
├────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ node-canvas +  │   Complex   │  ★★★★☆   │  ★★★★☆    │  Free    │
│   manual draw  │  (native    │  Good    │  2-3s     │          │
│                │  bindings)  │          │           │          │
├────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ html2canvas +  │   Easy      │  ★★★☆☆   │  ★★★★☆    │  Free    │
│   client-side  │  (~200KB)   │  OK      │  2-3s     │          │
│                │             │          │  (client) │          │
├────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ @vercel/og     │   Easy      │  ★★★★☆   │  ★★★★★    │  Free    │
│   (OG images)  │  (built-in) │  Good    │  1-2s     │  (Vercel)│
│                │             │  1200px  │           │          │
└────────────────┴─────────────┴──────────┴───────────┴──────────┘

RECOMMENDATION: puppeteer + chromium (for Vercel)
  • Highest quality output
  • Reuses existing HTML/CSS
  • Works well with @sparticuz/chromium (serverless)
  • Can capture entire multi-page report

ALTERNATIVE: @vercel/og for simple single-page summaries
  • Very fast
  • Built into Vercel
  • Limited to single image (no multi-page)
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-23
**Purpose**: Visual architecture diagrams for export system
