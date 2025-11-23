# Project Quote/Proposal Export System Architecture

## Executive Summary

This document outlines the architecture for a document export system that generates professional PDF and JPG exports of project quotes/proposals in the Tree Shop application. The solution uses Next.js API routes with server-side rendering for document generation, avoiding third-party API services.

---

## System Requirements

### Functional Requirements
- Generate professional PDF exports of project reports
- Generate JPG image exports for easy sharing via text/email
- Pull live data from Convex projectReports
- Support both completed project reports and draft proposals
- Client-side download trigger with server-side generation
- No third-party API services (self-contained solution)

### Non-Functional Requirements
- Fast generation (< 5 seconds for typical report)
- High-quality output suitable for client delivery
- Works on server-side (for deployment on Vercel/other platforms)
- Minimal bundle size impact
- Memory efficient for concurrent exports

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER FLOW                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. User views report (/shopos/reports/[id])                        │
│                ↓                                                      │
│  2. Clicks "Export PDF" or "Export JPG" button                       │
│                ↓                                                      │
│  3. Client triggers download with report ID                          │
│                ↓                                                      │
│  4. Browser initiates download from API route                        │
│                ↓                                                      │
│  5. File downloaded to user's device                                 │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      TECHNICAL FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Client (Browser)                                                    │
│       │                                                               │
│       │  Button Click (Export PDF/JPG)                              │
│       ↓                                                               │
│  ┌──────────────────────────────────────┐                           │
│  │ Client Component (ReportDetailPage)  │                           │
│  │  - Triggers download via fetch()     │                           │
│  │  - Shows loading state               │                           │
│  └──────────────────────────────────────┘                           │
│       │                                                               │
│       │  GET /api/export/report/[id]?format=pdf                     │
│       ↓                                                               │
│  ┌──────────────────────────────────────┐                           │
│  │   API Route (Server-Side)            │                           │
│  │   /app/api/export/report/[id]/route  │                           │
│  │   - Validates auth (Clerk)           │                           │
│  │   - Fetches data from Convex         │                           │
│  │   - Generates document               │                           │
│  │   - Streams to client                │                           │
│  └──────────────────────────────────────┘                           │
│       │                                                               │
│       ↓                                                               │
│  ┌──────────────────────────────────────┐                           │
│  │   Document Generator Service         │                           │
│  │   - Renders React template           │                           │
│  │   - Converts to PDF (react-pdf)      │                           │
│  │   - Converts to JPG (puppeteer)      │                           │
│  └──────────────────────────────────────┘                           │
│       │                                                               │
│       ↓                                                               │
│  ┌──────────────────────────────────────┐                           │
│  │   Convex Backend                     │                           │
│  │   - Query: getProjectReport          │                           │
│  │   - Returns enriched report data     │                           │
│  └──────────────────────────────────────┘                           │
│       │                                                               │
│       ↓                                                               │
│   Generated Document (PDF/JPG)                                       │
│       │                                                               │
│       ↓                                                               │
│   Downloaded to Client                                               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Report ID                                                           │
│      │                                                                │
│      ↓                                                                │
│  [Client Component]                                                  │
│      │                                                                │
│      │ (1) Request with Report ID + Auth Token                      │
│      ↓                                                                │
│  [API Route Handler]                                                 │
│      │                                                                │
│      │ (2) Validate Auth (Clerk Session)                            │
│      ↓                                                                │
│      ├─→ [Clerk Auth] ──→ User ID + Org ID                          │
│      │                                                                │
│      │ (3) Fetch Report Data                                        │
│      ↓                                                                │
│  [Convex Client (Server-Side)]                                      │
│      │                                                                │
│      │ (4) Query: getProjectReport(reportId)                        │
│      ↓                                                                │
│  [Convex Backend]                                                    │
│      │                                                                │
│      │ (5) Return Enriched Report Data                              │
│      ↓                                                                │
│  {                                                                    │
│    jobNumber: "WO-1234",                                             │
│    customerName: "Acme Corp",                                        │
│    lineItems: [...],                                                 │
│    timeLogs: {...},                                                  │
│    financialSummary: {...}                                           │
│  }                                                                    │
│      │                                                                │
│      │ (6) Pass to Template                                         │
│      ↓                                                                │
│  [Document Template Component]                                       │
│      │                                                                │
│      │ (7) Render with Data                                         │
│      ↓                                                                │
│  [React Component Tree]                                              │
│      │                                                                │
│      │ (8) Convert to Document Format                               │
│      ↓                                                                │
│  [Document Generator]                                                │
│      │                                                                │
│      ├─→ PDF: react-pdf renders to PDF buffer                       │
│      │                                                                │
│      └─→ JPG: puppeteer renders HTML + screenshot                   │
│      │                                                                │
│      │ (9) Return Binary Stream                                     │
│      ↓                                                                │
│  [API Response]                                                      │
│      │                                                                │
│      │ Headers:                                                      │
│      │   Content-Type: application/pdf | image/jpeg                 │
│      │   Content-Disposition: attachment; filename="WO-1234.pdf"    │
│      │                                                                │
│      ↓                                                                │
│  [Client Browser]                                                    │
│      │                                                                │
│      └─→ Download Triggered → File Saved                            │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Location Strategy

**Where should export logic live?**

```
/app/api/export/
├── report/
│   └── [id]/
│       └── route.ts          # GET handler for report export
└── proposal/
    └── [id]/
        └── route.ts          # GET handler for proposal export (future)
```

**Why API Routes over Server Actions?**
- **Streaming Support**: API routes can stream binary data directly to browser
- **Download Triggers**: Browser automatically triggers download for proper Content-Disposition headers
- **Caching**: Can implement HTTP caching headers (ETag, Cache-Control)
- **Standard HTTP**: Familiar GET request pattern for exports
- **File Handling**: Better suited for binary file generation and streaming

### 2. API Route Handler

**File**: `/app/api/export/report/[id]/route.ts`

```typescript
// Pseudo-code structure
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Authentication & Authorization
  const { userId, orgId } = await auth()
  if (!userId) return unauthorized()

  // 2. Extract parameters
  const reportId = params.id
  const format = request.nextUrl.searchParams.get('format') || 'pdf'

  // 3. Fetch data from Convex (server-side)
  const report = await convexClient.query(
    api.projectReports.getProjectReport,
    { reportId }
  )

  // 4. Verify ownership
  if (report.companyId !== orgId) return forbidden()

  // 5. Generate document
  const document = await generateDocument(report, format)

  // 6. Stream response
  return new Response(document, {
    headers: {
      'Content-Type': format === 'pdf'
        ? 'application/pdf'
        : 'image/jpeg',
      'Content-Disposition': `attachment; filename="${report.jobNumber}.${format}"`,
      'Cache-Control': 'private, max-age=3600'
    }
  })
}
```

### 3. Document Generator Service

**File**: `/lib/export/documentGenerator.ts`

```typescript
// Service layer for document generation
export async function generateDocument(
  report: ProjectReport,
  format: 'pdf' | 'jpg'
): Promise<Buffer> {

  if (format === 'pdf') {
    return generatePDF(report)
  } else {
    return generateJPG(report)
  }
}

async function generatePDF(report: ProjectReport): Promise<Buffer> {
  // Use @react-pdf/renderer
  // Renders React components to PDF
  const doc = <ReportPDFTemplate report={report} />
  return await pdf(doc).toBuffer()
}

async function generateJPG(report: ProjectReport): Promise<Buffer> {
  // Use puppeteer or sharp
  // 1. Render HTML with report data
  // 2. Capture screenshot
  // 3. Return as JPG buffer
}
```

### 4. Document Templates

**File**: `/lib/export/templates/ReportPDFTemplate.tsx`

```typescript
// React component that defines PDF structure
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

export function ReportPDFTemplate({ report }: { report: ProjectReport }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.jobNumber}>{report.jobNumber}</Text>
          <Text>Project Completion Report</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.label}>CUSTOMER</Text>
          <Text>{report.customerName}</Text>
          <Text>{report.customerAddress}</Text>
        </View>

        {/* Financial Summary */}
        <View style={styles.financialGrid}>
          {/* ... */}
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* ... */}
        </View>

        {/* Time Logs */}
        {/* ... */}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  )
}
```

### 5. Client-Side Trigger

**File**: `/app/shopos/reports/[id]/page.tsx` (modifications)

```typescript
'use client'

export default function ProjectReportDetailPage() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'pdf' | 'jpg') => {
    setIsExporting(true)
    try {
      // Trigger download via API route
      const response = await fetch(
        `/api/export/report/${reportId}?format=${format}`
      )

      if (!response.ok) throw new Error('Export failed')

      // Get blob and trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.jobNumber}.${format}`
      a.click()
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export failed:', error)
      // Show error snackbar
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Box>
      {/* Existing UI */}
      <Button
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
      >
        <DownloadIcon /> Export PDF
      </Button>
      <Button
        onClick={() => handleExport('jpg')}
        disabled={isExporting}
      >
        <DownloadIcon /> Export JPG
      </Button>
    </Box>
  )
}
```

---

## Technology Stack

### Core Libraries

| Library | Purpose | Why This Choice | Bundle Size |
|---------|---------|-----------------|-------------|
| `@react-pdf/renderer` | PDF generation from React | Native React support, server-side rendering, no browser needed | ~500KB |
| `puppeteer-core` OR `@sparticuz/chromium` | JPG generation (screenshot) | Headless Chrome for high-quality screenshots | Varies (use serverless version) |
| `sharp` (Alternative) | JPG generation (image processing) | Lighter weight, faster, but requires HTML-to-image conversion first | ~7MB native binding |

### Recommended Approach

**For PDF**: `@react-pdf/renderer`
- Pros: Pure React, works in serverless, predictable output
- Cons: Limited CSS support (subset), learning curve for styling

**For JPG**: Two-step process
1. Use existing React component (already styled perfectly)
2. Render to static HTML
3. Use `@vercel/og` (if simple) or `puppeteer` (if complex)

**Alternative for JPG**: Canvas-based rendering
- Use `node-canvas` to draw directly
- Pros: Lightweight, precise control
- Cons: More manual layout work

---

## Implementation Strategy

### Phase 1: Foundation (Core PDF Export)
1. Install dependencies: `@react-pdf/renderer`
2. Create API route: `/app/api/export/report/[id]/route.ts`
3. Create PDF template component
4. Add Convex server-side client setup
5. Implement authentication in API route
6. Add export button to report page

### Phase 2: JPG Export
1. Choose approach (puppeteer vs. canvas)
2. Implement JPG generator
3. Add format parameter handling
4. Update client to support both formats

### Phase 3: Optimization
1. Implement caching (ETag headers)
2. Add progress indicators
3. Error handling and retry logic
4. Performance monitoring

### Phase 4: Enhancement
1. Add custom branding (company logo)
2. Support for proposal exports
3. Email integration (send via email)
4. Batch export (multiple reports at once)

---

## File Structure

```
/Users/silvermbpro/web-treeshop-app/
│
├── app/
│   ├── api/
│   │   └── export/
│   │       ├── report/
│   │       │   └── [id]/
│   │       │       └── route.ts         # Main export API handler
│   │       └── proposal/
│   │           └── [id]/
│   │               └── route.ts         # Proposal export (future)
│   │
│   └── shopos/
│       └── reports/
│           └── [id]/
│               └── page.tsx             # Updated with export buttons
│
├── lib/
│   ├── export/
│   │   ├── documentGenerator.ts         # Core generation logic
│   │   ├── pdfGenerator.ts              # PDF-specific logic
│   │   ├── jpgGenerator.ts              # JPG-specific logic
│   │   ├── convexClient.ts              # Server-side Convex client
│   │   └── templates/
│   │       ├── ReportPDFTemplate.tsx    # PDF template component
│   │       ├── ReportJPGTemplate.tsx    # HTML template for JPG
│   │       └── styles/
│   │           └── reportStyles.ts      # Shared styling constants
│   │
│   └── types/
│       └── export.ts                    # TypeScript types for export system
│
└── docs/
    └── export-system-architecture.md    # This file
```

---

## Caching Strategy

### Why Caching?

Project reports are **immutable once created** - they're snapshots of completed work. This makes them ideal for aggressive caching.

### Cache Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      CACHE STRATEGY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Layer 1: HTTP Cache (Browser)                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Cache-Control: private, max-age=3600                      │  │
│  │ ETag: "report-{id}-{timestamp}"                           │  │
│  │                                                             │  │
│  │ → Browser caches for 1 hour                               │  │
│  │ → Revalidates with ETag on subsequent requests            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Layer 2: Server-Side Memory Cache (Optional)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Store generated PDFs in Map<reportId, Buffer>             │  │
│  │ TTL: 1 hour                                                │  │
│  │ Max Size: 50 MB                                            │  │
│  │                                                             │  │
│  │ → Fast subsequent generations                             │  │
│  │ → Memory efficient (LRU eviction)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Layer 3: CDN Cache (Future - with blob storage)               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Upload to Vercel Blob / Cloudflare R2                     │  │
│  │ Serve via CDN                                              │  │
│  │ TTL: Indefinite (until manual purge)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation

**ETag Generation**:
```typescript
function generateETag(report: ProjectReport): string {
  return `"${report._id}-${report.createdAt}"`
}
```

**Cache Headers**:
```typescript
return new Response(pdfBuffer, {
  headers: {
    'Cache-Control': 'private, max-age=3600', // 1 hour cache
    'ETag': generateETag(report),
    'Content-Type': 'application/pdf',
  }
})
```

**ETag Check**:
```typescript
const ifNoneMatch = request.headers.get('If-None-Match')
const currentETag = generateETag(report)

if (ifNoneMatch === currentETag) {
  return new Response(null, { status: 304 }) // Not Modified
}
```

---

## File Naming Convention

### Pattern

```
{jobNumber}-{reportType}-{timestamp}.{extension}
```

### Examples

```
WO-1234-report-20231123.pdf
WO-1234-report-20231123.jpg
PROP-5678-proposal-20231123.pdf
```

### Implementation

```typescript
function generateFilename(
  report: ProjectReport,
  format: 'pdf' | 'jpg'
): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
  return `${report.jobNumber}-report-${date}.${format}`
}
```

### Why This Convention?

1. **Sortable**: Chronological ordering in file systems
2. **Descriptive**: Immediately identifies document type
3. **Unique**: Timestamp prevents overwrites
4. **Clean**: No spaces or special characters
5. **Searchable**: Easy to find in Downloads folder

---

## Database Schema Changes

### Current Schema (No Changes Needed!)

The existing `projectReports` table already has all necessary data:

```typescript
projectReports: {
  _id: Id<"projectReports">,
  companyId: string,
  jobId: Id<"jobs">,
  jobNumber: string,
  customerName: string,
  customerAddress: string,
  // ... all financial data
  lineItemsData: string,  // JSON
  timeLogsData: string,   // JSON
  crewMembersData: string, // JSON
  createdAt: number
}
```

### Optional Future Enhancement

**Add export metadata tracking** (if you want analytics):

```typescript
exportLogs: defineTable({
  reportId: v.id("projectReports"),
  userId: v.string(),
  format: v.union(v.literal("pdf"), v.literal("jpg")),
  exportedAt: v.number(),
  fileSize: v.optional(v.number()),
  generationTimeMs: v.optional(v.number()),
})
  .index("by_report", ["reportId"])
  .index("by_user", ["userId"])
```

**Benefits of tracking**:
- Usage analytics (which reports are exported most)
- Performance monitoring (generation time trends)
- Audit trail for client deliverables
- Cost tracking (if using paid services)

**Implementation**:
```typescript
// In API route after successful generation
await convexClient.mutation(api.exportLogs.create, {
  reportId,
  userId,
  format,
  exportedAt: Date.now(),
  fileSize: buffer.length,
  generationTimeMs: generationTime
})
```

---

## Performance Considerations

### Document Generation Benchmarks

| Operation | Expected Time | Optimization Strategy |
|-----------|--------------|----------------------|
| Fetch report data from Convex | 50-200ms | Already optimized with indexes |
| Render PDF template | 500-2000ms | Use simple layouts, minimize images |
| Generate PDF buffer | 500-1500ms | Worker threads for large reports |
| Generate JPG screenshot | 1000-3000ms | Headless Chrome optimization |
| Stream to client | 100-500ms | Chunk streaming for large files |
| **Total (PDF)** | **1-4 seconds** | Acceptable for on-demand generation |
| **Total (JPG)** | **2-5 seconds** | Consider async with notification |

### Optimization Strategies

#### 1. Streaming Response
```typescript
// Instead of buffering entire document
return new Response(stream, {
  headers: {
    'Content-Type': 'application/pdf',
    'Transfer-Encoding': 'chunked'
  }
})
```

#### 2. Worker Threads (for CPU-intensive operations)
```typescript
import { Worker } from 'worker_threads'

async function generatePDFInWorker(report: ProjectReport) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./pdfWorker.js', {
      workerData: report
    })
    worker.on('message', resolve)
    worker.on('error', reject)
  })
}
```

#### 3. Lazy Loading (only generate on first request)
```typescript
// Don't pre-generate on report creation
// Generate on-demand when user clicks export
```

#### 4. Progress Indicators
```typescript
// For slow operations (JPG), show progress
export async function GET(request: NextRequest) {
  const reportId = params.id

  // Option A: Immediate response with job ID
  const jobId = await queueExportJob(reportId, format)
  return Response.json({ jobId, status: 'processing' })

  // Option B: Server-Sent Events for progress
  const stream = new TransformStream()
  generateWithProgress(reportId, stream.writable)
  return new Response(stream.readable)
}
```

#### 5. Concurrent Generation Limits
```typescript
// Prevent resource exhaustion
const exportQueue = new PQueue({ concurrency: 3 })

export async function GET(request: NextRequest) {
  return exportQueue.add(() => generateDocument(report, format))
}
```

### Memory Management

**Puppeteer in Serverless**:
```typescript
// Use chromium AWS Lambda layer
import chromium from '@sparticuz/chromium'

const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
})
```

**Cleanup**:
```typescript
try {
  const pdf = await generate()
  return new Response(pdf)
} finally {
  // Always cleanup resources
  await browser?.close()
  buffer = null // Explicit garbage collection hint
}
```

---

## Security Considerations

### 1. Authentication & Authorization

```typescript
export async function GET(request: NextRequest, { params }) {
  // Step 1: Verify user is authenticated
  const { userId, orgId } = await auth()
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Step 2: Fetch report
  const report = await convexClient.query(
    api.projectReports.getProjectReport,
    { reportId: params.id }
  )

  if (!report) {
    return new Response('Not Found', { status: 404 })
  }

  // Step 3: Verify ownership
  if (report.companyId !== orgId) {
    return new Response('Forbidden', { status: 403 })
  }

  // Proceed with export...
}
```

### 2. Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 exports per minute
})

export async function GET(request: NextRequest) {
  const { success } = await ratelimit.limit(userId)

  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60' }
    })
  }

  // Continue...
}
```

### 3. Input Validation

```typescript
const ALLOWED_FORMATS = ['pdf', 'jpg'] as const
const format = request.nextUrl.searchParams.get('format')

if (format && !ALLOWED_FORMATS.includes(format as any)) {
  return new Response('Invalid format', { status: 400 })
}

// Validate report ID format (Convex ID)
if (!params.id.match(/^[a-z0-9]{32}$/)) {
  return new Response('Invalid ID', { status: 400 })
}
```

### 4. Content Security

```typescript
// Sanitize user-generated content before rendering
import DOMPurify from 'isomorphic-dompurify'

const sanitizedNotes = DOMPurify.sanitize(report.jobNotes || '')
```

### 5. Resource Limits

```typescript
// Timeout for long-running generations
const timeoutMs = 30000 // 30 seconds max

const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), timeoutMs)

try {
  const pdf = await generatePDF(report, { signal: controller.signal })
  return new Response(pdf)
} catch (error) {
  if (error.name === 'AbortError') {
    return new Response('Generation timeout', { status: 504 })
  }
  throw error
} finally {
  clearTimeout(timeout)
}
```

---

## Error Handling

### Error Hierarchy

```typescript
export class ExportError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'ExportError'
  }
}

export class DataFetchError extends ExportError {
  constructor(message: string) {
    super(message, 'DATA_FETCH_ERROR', 500)
  }
}

export class GenerationError extends ExportError {
  constructor(message: string) {
    super(message, 'GENERATION_ERROR', 500)
  }
}

export class AuthorizationError extends ExportError {
  constructor(message: string) {
    super(message, 'AUTHORIZATION_ERROR', 403)
  }
}
```

### API Route Error Handler

```typescript
export async function GET(request: NextRequest, { params }) {
  try {
    // Main logic...
  } catch (error) {
    console.error('Export failed:', error)

    if (error instanceof ExportError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    // Unexpected errors
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Client-Side Error Handling

```typescript
const handleExport = async (format: 'pdf' | 'jpg') => {
  setIsExporting(true)
  try {
    const response = await fetch(`/api/export/report/${reportId}?format=${format}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Export failed')
    }

    const blob = await response.blob()
    triggerDownload(blob, `${report.jobNumber}.${format}`)

    showSnackbar('Export successful!', 'success')
  } catch (error) {
    console.error('Export error:', error)
    showSnackbar(error.message || 'Export failed. Please try again.', 'error')
  } finally {
    setIsExporting(false)
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('documentGenerator', () => {
  it('should generate valid PDF buffer', async () => {
    const mockReport = createMockReport()
    const buffer = await generatePDF(mockReport)

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
    // Verify PDF magic number
    expect(buffer.toString('utf8', 0, 4)).toBe('%PDF')
  })

  it('should throw error for invalid report data', async () => {
    const invalidReport = { ...mockReport, jobNumber: null }
    await expect(generatePDF(invalidReport)).rejects.toThrow()
  })
})
```

### Integration Tests

```typescript
describe('GET /api/export/report/[id]', () => {
  it('should return PDF for valid request', async () => {
    const response = await fetch('/api/export/report/abc123?format=pdf', {
      headers: { 'Authorization': `Bearer ${validToken}` }
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')

    const buffer = await response.arrayBuffer()
    expect(buffer.byteLength).toBeGreaterThan(0)
  })

  it('should return 401 for unauthenticated request', async () => {
    const response = await fetch('/api/export/report/abc123')
    expect(response.status).toBe(401)
  })

  it('should return 403 for unauthorized report access', async () => {
    const response = await fetch('/api/export/report/other-org-report', {
      headers: { 'Authorization': `Bearer ${validToken}` }
    })
    expect(response.status).toBe(403)
  })
})
```

### Manual Testing Checklist

- [ ] PDF exports correctly with all data
- [ ] JPG exports at sufficient resolution (300 DPI)
- [ ] File downloads with correct filename
- [ ] Works on mobile Safari (iOS)
- [ ] Works on Chrome, Firefox, Edge
- [ ] Auth prevents unauthorized access
- [ ] Handles missing data gracefully
- [ ] Performance under load (10 concurrent exports)
- [ ] Memory doesn't leak over multiple exports
- [ ] Print stylesheet matches export output

---

## Deployment Considerations

### Environment Variables (None Required!)

One of the core requirements is **no new environment variables**. This architecture respects that:

- **Convex**: Already configured via existing `.env.local`
- **Clerk**: Already configured
- **PDF Generation**: Pure server-side, no API keys needed
- **JPG Generation**: Self-hosted (puppeteer), no external services

### Vercel Deployment

**vercel.json** (if using puppeteer):
```json
{
  "functions": {
    "app/api/export/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

**package.json** additions:
```json
{
  "dependencies": {
    "@react-pdf/renderer": "^3.1.14",
    "@sparticuz/chromium": "^119.0.0",
    "puppeteer-core": "^21.5.0"
  }
}
```

### Bundle Size Optimization

```typescript
// Dynamic imports to reduce initial bundle
export async function generateJPG(report: ProjectReport) {
  // Only load puppeteer when needed
  const puppeteer = await import('puppeteer-core')
  const chromium = await import('@sparticuz/chromium')

  // ... generation logic
}
```

### Serverless Constraints

| Constraint | Vercel Limit | Our Strategy |
|------------|--------------|--------------|
| Max execution time | 10s (Hobby), 60s (Pro) | Optimize for < 5s, use async for JPG |
| Max payload size | 4.5 MB | Stream large PDFs |
| Memory | 1024 MB | Cleanup after generation |
| Cold start | ~1-2s | Acceptable for on-demand |

---

## Alternative Approaches Considered

### Approach 1: Client-Side Generation (Rejected)

**How it would work**:
```typescript
// Client downloads data, generates PDF in browser
const pdf = await generatePDFClient(report)
```

**Pros**:
- No server resources used
- Instant generation (no API round-trip)

**Cons**:
- **Large bundle size** (~2 MB for PDF libraries)
- **Slow on mobile devices**
- **Security risk** (exposes report data in client memory)
- **Limited browser APIs** (harder to generate high-quality output)

### Approach 2: Pre-Generated Documents (Rejected)

**How it would work**:
```typescript
// Generate PDF immediately when report is created
// Store in blob storage, serve static files
export const generateProjectReport = mutation({
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("projectReports", { ... })

    // Immediately generate and upload PDF
    const pdf = await generatePDF(report)
    const url = await uploadToBlob(pdf)
    await ctx.db.patch(reportId, { pdfUrl: url })
  }
})
```

**Pros**:
- Instant download (already generated)
- No generation delay for users

**Cons**:
- **Storage costs** (every report = 2 files: PDF + JPG)
- **Inflexible** (can't update template without regenerating all)
- **Unnecessary** (most reports never exported)
- **Complexity** (blob storage setup, cleanup, CDN)

### Approach 3: Third-Party API (Explicitly Rejected)

Services like DocRaptor, PDFShift, or Cloudinary could handle generation, but:

**Cons**:
- **Violates requirement**: "No 3rd party API services"
- **Cost** ($100+/month for typical usage)
- **Environment variables** needed (API keys)
- **Vendor lock-in**
- **Latency** (external API call)
- **Data privacy** (customer data sent to third-party)

---

## Migration Path (Rollout Plan)

### Week 1: Foundation
- [ ] Install `@react-pdf/renderer`
- [ ] Create basic API route structure
- [ ] Implement authentication in API route
- [ ] Set up Convex server-side client

### Week 2: PDF Export
- [ ] Create PDF template component
- [ ] Implement PDF generation logic
- [ ] Add export button to report page
- [ ] Test PDF output quality

### Week 3: JPG Export
- [ ] Choose JPG approach (puppeteer vs. canvas)
- [ ] Implement JPG generation
- [ ] Add format selector to UI
- [ ] Cross-browser testing

### Week 4: Polish & Optimization
- [ ] Implement caching (ETag headers)
- [ ] Add error handling
- [ ] Performance optimization
- [ ] Documentation
- [ ] Production deployment

### Week 5+: Enhancements
- [ ] Add proposal export support
- [ ] Company branding (logo)
- [ ] Email integration
- [ ] Batch export feature

---

## Monitoring & Observability

### Key Metrics to Track

```typescript
// In API route
const startTime = Date.now()

try {
  const pdf = await generatePDF(report)

  // Log success metrics
  console.log({
    event: 'export_success',
    reportId: report._id,
    format: 'pdf',
    fileSize: pdf.length,
    generationTimeMs: Date.now() - startTime,
    userId,
    orgId
  })

  return new Response(pdf, { ... })
} catch (error) {
  // Log error metrics
  console.error({
    event: 'export_error',
    reportId: report._id,
    format: 'pdf',
    error: error.message,
    generationTimeMs: Date.now() - startTime,
    userId,
    orgId
  })

  throw error
}
```

### Dashboards (using Vercel Analytics or custom)

- **Export Volume**: Exports per day/week
- **Format Distribution**: PDF vs JPG usage
- **Performance**: P50, P95, P99 generation times
- **Error Rate**: Failed exports / total exports
- **User Adoption**: % of users who export reports

---

## Cost Analysis

### Infrastructure Costs (Vercel Pro Tier)

| Component | Cost | Notes |
|-----------|------|-------|
| API Route Execution | Included | 100GB-hours/month free |
| Bandwidth | $0.10/GB | PDFs ~500KB, minimal |
| Function Duration | Included | < 5s per export |
| Memory | Included | 1024MB sufficient |
| **Total Monthly** | **~$0-5** | For typical usage (100 exports/month) |

### Development Costs

| Task | Estimated Hours | Notes |
|------|-----------------|-------|
| API Route Setup | 4h | Authentication, routing |
| PDF Template | 8h | Layout, styling, testing |
| JPG Generation | 6h | Puppeteer setup, optimization |
| Error Handling | 3h | Edge cases, validation |
| Testing | 5h | Unit + integration tests |
| Documentation | 2h | Code comments, README |
| **Total** | **~28 hours** | 1 developer, ~1 week |

### Comparison vs. Third-Party

| Approach | Setup Cost | Monthly Cost (100 exports) | Flexibility |
|----------|------------|---------------------------|-------------|
| **In-House (Proposed)** | 28 dev hours | $0-5 | Full control |
| DocRaptor API | 2 dev hours | $49/month | Limited |
| PDFShift API | 2 dev hours | $29/month | Limited |
| Cloudinary PDF | 3 dev hours | $0-$99/month | Moderate |

**ROI**: In-house solution pays for itself after 2-3 months, with bonus of:
- No vendor lock-in
- Full customization
- No data privacy concerns
- No environment variables
- Unlimited exports (within server limits)

---

## Conclusion & Recommendation

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RECOMMENDED SOLUTION                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Client Component (Report Page)                           │
│     - Add "Export PDF" and "Export JPG" buttons             │
│     - Trigger download via fetch() to API route             │
│     - Show loading state during generation                  │
│                                                               │
│  2. API Route (/app/api/export/report/[id]/route.ts)       │
│     - GET handler with format query param                   │
│     - Clerk authentication + org verification               │
│     - Fetch data from Convex (server-side)                 │
│     - Generate document (PDF or JPG)                        │
│     - Stream response with proper headers                   │
│                                                               │
│  3. Document Generator (/lib/export/documentGenerator.ts)   │
│     - PDF: @react-pdf/renderer                              │
│     - JPG: puppeteer-core + @sparticuz/chromium            │
│     - Shared template logic                                 │
│                                                               │
│  4. Caching Layer                                            │
│     - HTTP ETag headers (browser cache)                     │
│     - Optional: In-memory server cache (1 hour TTL)        │
│                                                               │
│  5. No Database Changes Needed                               │
│     - Existing projectReports schema is sufficient          │
│     - Optional: Add exportLogs for analytics                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

1. **Meets All Requirements**:
   - ✅ No 3rd party API services
   - ✅ No new environment variables
   - ✅ Server-side generation (works on any platform)
   - ✅ Professional PDF/JPG output
   - ✅ Pulls live data from Convex
   - ✅ Easy sharing via download

2. **Best Practices**:
   - Uses Next.js API routes (standard pattern)
   - Server-side authentication
   - Proper error handling
   - Performance optimized
   - Scalable architecture

3. **Developer Experience**:
   - Familiar React patterns (PDF templates are React components)
   - Clear separation of concerns
   - Easy to test and debug
   - Simple to extend (add branding, new formats, etc.)

4. **Performance**:
   - Fast generation (< 5s)
   - Efficient caching
   - Minimal bundle size impact
   - Serverless-friendly

### Next Steps

1. **Review this architecture** with team
2. **Choose JPG approach**: puppeteer (high-quality) vs. canvas (lightweight)
3. **Begin implementation** following the migration path
4. **Set up monitoring** for performance tracking
5. **Plan future enhancements** (branding, email integration)

---

## Appendix: Example API Response

### Successful PDF Export

```http
GET /api/export/report/k17hjdgq0pnm7yxv8fwzts2k9rg0ab1c?format=pdf
Authorization: Bearer eyJhbGc...

HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="WO-1234-report-20231123.pdf"
Content-Length: 487392
Cache-Control: private, max-age=3600
ETag: "k17hjdgq0pnm7yxv8fwzts2k9rg0ab1c-1700755200000"

[PDF binary data]
```

### Error Response (Unauthorized)

```http
GET /api/export/report/k17hjdgq0pnm7yxv8fwzts2k9rg0ab1c?format=pdf

HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

### Error Response (Not Found)

```http
GET /api/export/report/invalid-id?format=pdf
Authorization: Bearer eyJhbGc...

HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Report not found",
  "code": "NOT_FOUND"
}
```

### Error Response (Forbidden - Wrong Org)

```http
GET /api/export/report/k17hjdgq0pnm7yxv8fwzts2k9rg0ab1c?format=pdf
Authorization: Bearer eyJhbGc...

HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": "You don't have permission to access this report",
  "code": "FORBIDDEN"
}
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-23
**Author**: System Architecture Team
**Status**: Ready for Implementation
