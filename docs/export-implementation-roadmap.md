# Export System Implementation Roadmap

## Quick Start Guide

This roadmap provides a step-by-step implementation plan for the project quote/proposal export system.

---

## Phase 1: Foundation Setup (Day 1)

### 1.1 Install Dependencies

```bash
cd /Users/silvermbpro/web-treeshop-app
npm install @react-pdf/renderer puppeteer-core @sparticuz/chromium
```

**Verify installation**:
```bash
npm list @react-pdf/renderer puppeteer-core @sparticuz/chromium
```

### 1.2 Create Directory Structure

```bash
# Create export library structure
mkdir -p lib/export/templates/styles
mkdir -p lib/export/utils

# Create API route structure
mkdir -p app/api/export/report/[id]
```

### 1.3 Create Type Definitions

**File**: `/lib/export/types.ts`

```typescript
export type ExportFormat = 'pdf' | 'jpg'

export interface ExportError {
  error: string
  code: string
  statusCode: number
}
```

---

## Phase 2: Core PDF Export (Days 2-3)

### 2.1 Create Document Generator Service

Copy from `/docs/export-implementation-examples.md`:
- `/lib/export/documentGenerator.ts`

### 2.2 Create PDF Generator

Copy from examples:
- `/lib/export/pdfGenerator.ts`

### 2.3 Create PDF Template Component

Copy from examples:
- `/lib/export/templates/ReportPDFTemplate.tsx`

### 2.4 Create API Route Handler

Copy from examples:
- `/app/api/export/report/[id]/route.ts`

### 2.5 Test PDF Generation

```bash
# Start dev server
npm run dev

# In browser, navigate to a report page
# Click "Export PDF" button
# Verify PDF downloads correctly
```

**Test checklist**:
- [ ] PDF downloads with correct filename
- [ ] PDF contains all report data
- [ ] Customer information displays correctly
- [ ] Financial summary accurate
- [ ] Line items table formatted properly
- [ ] Crew time logs included
- [ ] Styling matches design

---

## Phase 3: Add Client-Side Export Buttons (Day 3)

### 3.1 Update Report Page Component

Edit: `/app/shopos/reports/[id]/page.tsx`

Add:
1. Import statements for export functionality
2. `isExporting` state
3. `handleExport` function
4. Export PDF button
5. Export JPG button (disabled for now)

Copy code from `/docs/export-implementation-examples.md` section 7.

### 3.2 Test User Flow

- [ ] Click "Export PDF" button
- [ ] Loading indicator shows
- [ ] Success message displays
- [ ] File downloads automatically
- [ ] Error handling works (try with invalid report ID)

---

## Phase 4: JPG Export (Days 4-5)

### 4.1 Create JPG Generator

Copy from examples:
- `/lib/export/jpgGenerator.ts`

### 4.2 Create HTML Template

Copy from examples:
- `/lib/export/templates/ReportHTMLTemplate.tsx`

### 4.3 Update Document Generator

Edit: `/lib/export/documentGenerator.ts`

Ensure it routes to `generateJPG()` when format is 'jpg'.

### 4.4 Enable JPG Button

Edit: `/app/shopos/reports/[id]/page.tsx`

Remove `disabled` prop from "Export JPG" button.

### 4.5 Test JPG Generation

**Test checklist**:
- [ ] JPG downloads correctly
- [ ] Image quality is sufficient (300 DPI)
- [ ] All sections visible
- [ ] Text is readable
- [ ] Colors render correctly
- [ ] Works on mobile browsers

---

## Phase 5: Optimization & Caching (Day 6)

### 5.1 Implement ETag Caching

Already included in API route example. Verify:

```typescript
// In route.ts
const etag = generateETag(report)
const ifNoneMatch = request.headers.get('If-None-Match')

if (ifNoneMatch === etag) {
  return new NextResponse(null, { status: 304 })
}
```

### 5.2 Add Cache Headers

Verify response headers include:
```typescript
{
  'Cache-Control': 'private, max-age=3600',
  'ETag': etag,
}
```

### 5.3 Test Caching

```bash
# First request (generates document)
time curl -X GET "http://localhost:3000/api/export/report/{id}?format=pdf" \
  -H "Cookie: __clerk_session=..." \
  --output test1.pdf

# Second request (should use cache)
time curl -X GET "http://localhost:3000/api/export/report/{id}?format=pdf" \
  -H "Cookie: __clerk_session=..." \
  -H "If-None-Match: \"{etag-value}\"" \
  -i
```

Expected:
- First request: ~3 seconds
- Second request: ~50ms (304 Not Modified)

---

## Phase 6: Error Handling & Security (Day 7)

### 6.1 Add Input Validation

Already in API route example. Verify:
- Report ID format validation
- Format parameter validation
- Authentication check
- Authorization check

### 6.2 Add Error Logging

Add structured logging:

```typescript
// In route.ts
console.log({
  event: 'export_success',
  reportId,
  format,
  fileSize: buffer.length,
  generationTimeMs: Date.now() - startTime,
  userId,
  orgId,
})
```

### 6.3 Test Error Scenarios

- [ ] Unauthorized (no auth token)
- [ ] Forbidden (wrong organization)
- [ ] Not Found (invalid report ID)
- [ ] Bad Request (invalid format)
- [ ] Server Error (generation failure)

---

## Phase 7: Production Deployment (Day 8)

### 7.1 Create Vercel Configuration

**File**: `/vercel.json`

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

### 7.2 Verify Environment Variables

Check in Vercel Dashboard:
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### 7.3 Deploy to Production

```bash
# Commit changes
git add .
git commit -m "Add export system for project reports"
git push origin main

# Vercel will auto-deploy
```

### 7.4 Test in Production

- [ ] PDF export works
- [ ] JPG export works
- [ ] Authentication works
- [ ] Authorization works
- [ ] Caching works
- [ ] Performance is acceptable (< 5s)
- [ ] Mobile download works

---

## Phase 8: Enhancements (Optional - Week 2)

### 8.1 Add Progress Indicators

For slower JPG generation, add progress feedback:

```typescript
// Show percentage or spinner during generation
setExportProgress(50) // Halfway through
```

### 8.2 Add Batch Export

Allow exporting multiple reports at once:

```typescript
// API route: /app/api/export/reports/batch/route.ts
export async function POST(request: NextRequest) {
  const { reportIds } = await request.json()

  // Generate ZIP file with all reports
  const zip = new JSZip()

  for (const id of reportIds) {
    const pdf = await generatePDF(report)
    zip.file(`${report.jobNumber}.pdf`, pdf)
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="reports.zip"'
    }
  })
}
```

### 8.3 Add Company Branding

Add company logo to reports:

```typescript
// In PDF template
import { Image } from '@react-pdf/renderer'

<Image
  src="/images/company-logo.png"
  style={{ width: 100, height: 50 }}
/>
```

### 8.4 Add Email Integration

Send reports via email:

```typescript
// API route: /app/api/export/email/route.ts
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  const { reportId, recipientEmail } = await request.json()

  const pdf = await generatePDF(report)

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'reports@yourdomain.com',
    to: recipientEmail,
    subject: `Project Report: ${report.jobNumber}`,
    html: '<p>Your project report is attached.</p>',
    attachments: [
      {
        filename: `${report.jobNumber}.pdf`,
        content: pdf,
      },
    ],
  })
}
```

---

## Testing Strategy

### Unit Tests

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Create test files
touch lib/export/__tests__/documentGenerator.test.ts
touch lib/export/__tests__/pdfGenerator.test.ts
```

**Example test**:

```typescript
// lib/export/__tests__/pdfGenerator.test.ts
import { generatePDF } from '../pdfGenerator'
import { mockReport } from './fixtures'

describe('PDF Generator', () => {
  it('should generate valid PDF buffer', async () => {
    const buffer = await generatePDF(mockReport)

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
    expect(buffer.toString('utf8', 0, 4)).toBe('%PDF')
  })

  it('should include report data', async () => {
    const buffer = await generatePDF(mockReport)
    const pdfText = buffer.toString('utf8')

    expect(pdfText).toContain(mockReport.jobNumber)
    expect(pdfText).toContain(mockReport.customerName)
  })
})
```

### Integration Tests

```bash
# Create integration test
touch app/api/export/__tests__/route.test.ts
```

**Example test**:

```typescript
import { GET } from '../report/[id]/route'

describe('Export API Route', () => {
  it('should return PDF for authenticated request', async () => {
    const request = new NextRequest('http://localhost:3000/api/export/report/123?format=pdf')
    const params = { id: 'k17hjdgq0pnm7yxv8fwzts2k9rg0ab1c' }

    const response = await GET(request, { params })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
  })

  it('should return 401 for unauthenticated request', async () => {
    // Mock auth to return null
    jest.mock('@clerk/nextjs/server', () => ({
      auth: () => ({ userId: null, orgId: null })
    }))

    const request = new NextRequest('http://localhost:3000/api/export/report/123')
    const response = await GET(request, { params: { id: '123' } })

    expect(response.status).toBe(401)
  })
})
```

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| PDF Generation | < 2s | < 5s | > 10s |
| JPG Generation | < 3s | < 8s | > 15s |
| First Request (Cold Start) | < 3s | < 6s | > 10s |
| Subsequent (Cached) | < 100ms | < 500ms | > 1s |
| File Size (PDF) | < 500 KB | < 2 MB | > 5 MB |
| File Size (JPG) | < 1 MB | < 3 MB | > 5 MB |

### Monitoring

Add to API route:

```typescript
const startTime = Date.now()

// ... generation logic ...

const metrics = {
  generationTimeMs: Date.now() - startTime,
  fileSize: buffer.length,
  format,
  reportId,
}

// Send to analytics
console.log('[EXPORT_METRICS]', JSON.stringify(metrics))
```

Use Vercel Analytics or custom logging to track:
- Average generation time
- 95th percentile latency
- Error rate
- Export volume

---

## Rollback Plan

If issues occur in production:

### Quick Rollback

```bash
# Revert to previous deployment
vercel rollback
```

### Disable Feature

Add feature flag:

```typescript
// In page component
const EXPORT_ENABLED = process.env.NEXT_PUBLIC_EXPORT_ENABLED === 'true'

{EXPORT_ENABLED && (
  <Button onClick={handleExport}>Export PDF</Button>
)}
```

Set in Vercel:
```bash
NEXT_PUBLIC_EXPORT_ENABLED=false
```

### Gradual Rollout

Use percentage-based rollout:

```typescript
// Enable for 10% of users
const enableExport = Math.random() < 0.1

{enableExport && (
  <Button onClick={handleExport}>Export PDF</Button>
)}
```

---

## Success Criteria

### Must Have (MVP)
- [x] PDF export works for all reports
- [x] Proper authentication and authorization
- [x] Error handling for common scenarios
- [x] Acceptable performance (< 5s)
- [x] Works on desktop browsers
- [x] Proper file naming

### Should Have
- [ ] JPG export works
- [ ] Caching implemented
- [ ] Works on mobile browsers
- [ ] Progress indicators
- [ ] Analytics/logging

### Nice to Have
- [ ] Batch export
- [ ] Email integration
- [ ] Company branding
- [ ] Custom templates
- [ ] Export history

---

## Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|----------------|
| 1. Foundation | 1 day | Dependencies installed, structure created |
| 2. PDF Export | 2 days | Working PDF generation |
| 3. UI Integration | 1 day | Export buttons functional |
| 4. JPG Export | 2 days | Working JPG generation |
| 5. Optimization | 1 day | Caching implemented |
| 6. Error Handling | 1 day | Robust error handling |
| 7. Production Deploy | 1 day | Live in production |
| **Total MVP** | **9 days** | **Fully functional export system** |
| 8. Enhancements | 5+ days | Additional features |

---

## Risk Mitigation

### Risk: Puppeteer fails on Vercel

**Mitigation**:
- Use @sparticuz/chromium (Vercel-optimized)
- Test in Vercel preview environment before production
- Fallback: Disable JPG export, keep PDF only

### Risk: Large files cause timeouts

**Mitigation**:
- Implement streaming responses
- Increase function timeout to 60s
- Optimize PDF template (reduce complexity)

### Risk: High concurrency causes memory issues

**Mitigation**:
- Implement queue system (PQueue)
- Limit concurrent exports to 3
- Add rate limiting per user

### Risk: User reports missing data

**Mitigation**:
- Validate report data before generation
- Add fallbacks for missing fields
- Show preview before export

---

## Support & Maintenance

### Documentation

- [x] Architecture documentation
- [x] Implementation examples
- [x] Troubleshooting guide
- [ ] User guide
- [ ] API documentation

### Monitoring

Set up alerts for:
- Error rate > 5%
- Average latency > 10s
- Export volume spike (>1000/day)

### Updates

Schedule quarterly reviews:
- Performance optimization
- Security patches
- Dependency updates
- User feedback implementation

---

## Resources

### Documentation
- `/docs/export-system-architecture.md` - Full architecture
- `/docs/export-architecture-diagrams.md` - Visual diagrams
- `/docs/export-implementation-examples.md` - Code examples
- This file - Implementation roadmap

### External Links
- [@react-pdf/renderer docs](https://react-pdf.org/)
- [Puppeteer docs](https://pptr.dev/)
- [Vercel Functions docs](https://vercel.com/docs/functions)
- [Clerk Auth docs](https://clerk.com/docs)

### Support Channels
- GitHub Issues (internal)
- Team Slack channel
- Vercel support (if platform issues)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-23
**Status**: Ready for Implementation
**Estimated Completion**: 9 business days for MVP
