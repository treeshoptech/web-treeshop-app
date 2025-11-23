# Export System Implementation Examples

This document provides concrete, copy-paste-ready code examples for implementing the export system.

---

## 1. API Route Handler

**File**: `/app/api/export/report/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { generateDocument } from '@/lib/export/documentGenerator'

// Initialize Convex client for server-side
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()

  try {
    // 1. Authentication
    const { userId, orgId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Extract and validate parameters
    const reportId = params.id as Id<'projectReports'>
    const format = request.nextUrl.searchParams.get('format') || 'pdf'

    // Validate format
    if (format !== 'pdf' && format !== 'jpg') {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid format. Use pdf or jpg.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate report ID format (Convex IDs are 32 characters)
    if (!reportId.match(/^[a-z0-9]{32}$/)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid report ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 3. Fetch report data from Convex
    const report = await convex.query(api.projectReports.getProjectReport, {
      reportId,
    })

    if (!report) {
      return new NextResponse(
        JSON.stringify({ error: 'Report not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 4. Verify ownership
    if (report.companyId !== orgId) {
      return new NextResponse(
        JSON.stringify({
          error: "You don't have permission to access this report",
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 5. Check for conditional request (caching)
    const etag = generateETag(report)
    const ifNoneMatch = request.headers.get('If-None-Match')

    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304, // Not Modified
        headers: {
          ETag: etag,
          'Cache-Control': 'private, max-age=3600',
        },
      })
    }

    // 6. Generate document
    const buffer = await generateDocument(report, format as 'pdf' | 'jpg')

    // 7. Generate filename
    const filename = generateFilename(report, format as 'pdf' | 'jpg')

    // 8. Log metrics (optional)
    const generationTime = Date.now() - startTime
    console.log({
      event: 'export_success',
      reportId: report._id,
      format,
      fileSize: buffer.length,
      generationTimeMs: generationTime,
      userId,
      orgId,
    })

    // 9. Return document with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          format === 'pdf' ? 'application/pdf' : 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
        ETag: etag,
      },
    })
  } catch (error) {
    console.error('Export error:', error)

    return new NextResponse(
      JSON.stringify({
        error: 'Failed to generate export',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Helper: Generate ETag for caching
function generateETag(report: any): string {
  return `"${report._id}-${report.createdAt}"`
}

// Helper: Generate filename
function generateFilename(report: any, format: 'pdf' | 'jpg'): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
  return `${report.jobNumber}-report-${date}.${format}`
}
```

---

## 2. Document Generator Service

**File**: `/lib/export/documentGenerator.ts`

```typescript
import { generatePDF } from './pdfGenerator'
import { generateJPG } from './jpgGenerator'

export type ExportFormat = 'pdf' | 'jpg'

export interface ProjectReport {
  _id: string
  jobNumber: string
  customerName: string
  customerAddress?: string
  customerPhone?: string
  customerEmail?: string
  totalInvestment: number
  actualTotalCost: number
  profit: number
  profitMargin: number
  estimatedTotalHours: number
  actualProductiveHours: number
  actualSupportHours: number
  totalHours: number
  lineItems: any[]
  timeLogs: Record<string, any>
  crewMembers?: any[]
  jobNotes?: string
  completedAt: number
  createdAt: number
}

/**
 * Main entry point for document generation
 * Routes to appropriate generator based on format
 */
export async function generateDocument(
  report: ProjectReport,
  format: ExportFormat
): Promise<Buffer> {
  if (format === 'pdf') {
    return generatePDF(report)
  } else if (format === 'jpg') {
    return generateJPG(report)
  } else {
    throw new Error(`Unsupported format: ${format}`)
  }
}
```

---

## 3. PDF Generator

**File**: `/lib/export/pdfGenerator.ts`

```typescript
import ReactPDF, { pdf } from '@react-pdf/renderer'
import { ReportPDFTemplate } from './templates/ReportPDFTemplate'
import { ProjectReport } from './documentGenerator'

/**
 * Generate PDF document from project report data
 */
export async function generatePDF(report: ProjectReport): Promise<Buffer> {
  try {
    // Create React element
    const document = <ReportPDFTemplate report={report} />

    // Generate PDF
    const pdfStream = pdf(document)

    // Convert to buffer
    const buffer = await pdfStream.toBuffer()

    return buffer
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error('Failed to generate PDF')
  }
}
```

---

## 4. PDF Template Component

**File**: `/lib/export/templates/ReportPDFTemplate.tsx`

```typescript
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { ProjectReport } from '../documentGenerator'

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #000000',
    paddingBottom: 10,
  },
  jobNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  label: {
    fontSize: 9,
    color: '#666666',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  value: {
    fontSize: 11,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderBottom: '1 solid #CCCCCC',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #EEEEEE',
    padding: 8,
    fontSize: 10,
  },
  col1: { width: '40%' },
  col2: { width: '15%', textAlign: 'right' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },
  financialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  financialCard: {
    width: '23%',
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  financialLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 5,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
    borderTop: '1 solid #EEEEEE',
    paddingTop: 10,
  },
})

export function ReportPDFTemplate({ report }: { report: ProjectReport }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.jobNumber}>{report.jobNumber}</Text>
          <Text style={styles.title}>Project Completion Report</Text>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.label}>CUSTOMER</Text>
          <Text style={styles.value}>{report.customerName}</Text>
          {report.customerAddress && (
            <Text style={styles.value}>{report.customerAddress}</Text>
          )}
          {report.customerPhone && (
            <Text style={styles.value}>{report.customerPhone}</Text>
          )}
          {report.customerEmail && (
            <Text style={styles.value}>{report.customerEmail}</Text>
          )}
        </View>

        {/* Project Dates */}
        <View style={styles.section}>
          <Text style={styles.label}>COMPLETED</Text>
          <Text style={styles.value}>{formatDate(report.completedAt)}</Text>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>

          <View style={styles.financialGrid}>
            <View style={styles.financialCard}>
              <Text style={styles.financialLabel}>TOTAL HOURS</Text>
              <Text style={styles.financialValue}>
                {report.totalHours.toFixed(1)}
              </Text>
            </View>

            <View style={styles.financialCard}>
              <Text style={styles.financialLabel}>TOTAL COST</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(report.actualTotalCost)}
              </Text>
            </View>

            <View style={styles.financialCard}>
              <Text style={styles.financialLabel}>CUSTOMER PAID</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(report.totalInvestment)}
              </Text>
            </View>

            <View style={styles.financialCard}>
              <Text style={styles.financialLabel}>PROFIT</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(report.profit)}
              </Text>
              <Text style={[styles.financialLabel, { marginTop: 5 }]}>
                {report.profitMargin.toFixed(1)}% margin
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Billable Hours</Text>
              <Text style={styles.value}>
                {report.actualProductiveHours.toFixed(1)}h
              </Text>
            </View>
            <View>
              <Text style={styles.label}>Support Hours</Text>
              <Text style={styles.value}>
                {report.actualSupportHours.toFixed(1)}h
              </Text>
            </View>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line Items Breakdown</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Service</Text>
              <Text style={styles.col2}>Est. Hours</Text>
              <Text style={styles.col3}>Actual Hours</Text>
              <Text style={styles.col4}>Variance</Text>
              <Text style={styles.col5}>Price</Text>
            </View>

            {report.lineItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{item.displayName}</Text>
                <Text style={styles.col2}>
                  {item.estimatedHours.toFixed(1)}
                </Text>
                <Text style={styles.col3}>
                  {(item.actualProductiveHours || 0).toFixed(1)}
                </Text>
                <Text style={styles.col4}>
                  {(item.variance || 0) > 0 ? '+' : ''}
                  {(item.variance || 0).toFixed(1)}
                </Text>
                <Text style={styles.col5}>
                  {formatCurrency(item.lineItemTotal)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Time Logs Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crew Time Summary</Text>

          {Object.values(report.timeLogs).map((employeeData: any, index) => (
            <View key={index} style={{ marginBottom: 15 }}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.value}>{employeeData.employeeName}</Text>
                  <Text style={styles.label}>
                    {employeeData.employeePosition}
                  </Text>
                </View>
                <View>
                  <Text style={styles.value}>
                    {employeeData.totalHours.toFixed(1)} hours
                  </Text>
                  <Text style={styles.label}>
                    {formatCurrency(employeeData.totalCost)} cost
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Crew Members */}
        {report.crewMembers && report.crewMembers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Crew</Text>

            {report.crewMembers.map((member: any, index: number) => (
              <View key={index} style={styles.row}>
                <Text style={styles.value}>{member.name}</Text>
                <Text style={styles.label}>
                  {member.position} • ${member.effectiveRate.toFixed(2)}/hr
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {report.jobNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Notes</Text>
            <Text style={styles.value}>{report.jobNotes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Report generated on {formatDate(report.createdAt)}</Text>
        </View>
      </Page>
    </Document>
  )
}
```

---

## 5. JPG Generator (Puppeteer Approach)

**File**: `/lib/export/jpgGenerator.ts`

```typescript
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { ProjectReport } from './documentGenerator'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReportHTMLTemplate } from './templates/ReportHTMLTemplate'

/**
 * Generate JPG image from project report using Puppeteer
 */
export async function generateJPG(report: ProjectReport): Promise<Buffer> {
  let browser

  try {
    // Launch headless browser (Vercel-optimized)
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })

    const page = await browser.newPage()

    // Set viewport for high-quality output
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2, // 2x for high DPI
    })

    // Render React template to HTML
    const html = renderToStaticMarkup(<ReportHTMLTemplate report={report} />)

    // Load HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 90,
      fullPage: true, // Capture entire page
    })

    return screenshot as Buffer
  } catch (error) {
    console.error('JPG generation failed:', error)
    throw new Error('Failed to generate JPG')
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
```

---

## 6. HTML Template for JPG

**File**: `/lib/export/templates/ReportHTMLTemplate.tsx`

```typescript
import React from 'react'
import { ProjectReport } from '../documentGenerator'

/**
 * HTML template for JPG generation
 * Uses inline styles for reliable rendering in headless browser
 */
export function ReportHTMLTemplate({ report }: { report: ProjectReport }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <html>
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            padding: 40px;
            color: #000;
          }

          .header {
            margin-bottom: 30px;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
          }

          .job-number {
            font-size: 32px;
            font-weight: bold;
            color: #1976D2;
            margin-bottom: 10px;
          }

          .title {
            font-size: 20px;
            font-weight: 600;
          }

          .section {
            margin-bottom: 30px;
          }

          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 2px solid #EEEEEE;
            padding-bottom: 8px;
          }

          .label {
            font-size: 12px;
            color: #666;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 5px;
          }

          .value {
            font-size: 14px;
            margin-bottom: 8px;
          }

          .financial-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }

          .financial-card {
            background: #F5F5F5;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #E0E0E0;
          }

          .financial-value {
            font-size: 24px;
            font-weight: bold;
            margin-top: 10px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }

          thead {
            background: #F5F5F5;
          }

          th {
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            border-bottom: 2px solid #CCCCCC;
          }

          td {
            padding: 12px;
            border-bottom: 1px solid #EEEEEE;
            font-size: 13px;
          }

          .text-right {
            text-align: right;
          }

          .crew-member {
            display: flex;
            justify-content: space-between;
            padding: 15px;
            background: #F9F9F9;
            margin-bottom: 10px;
            border-radius: 6px;
          }

          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #EEEEEE;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        `}</style>
      </head>
      <body>
        {/* Header */}
        <div className="header">
          <div className="job-number">{report.jobNumber}</div>
          <div className="title">Project Completion Report</div>
        </div>

        {/* Customer Info */}
        <div className="section">
          <div className="label">Customer</div>
          <div className="value">{report.customerName}</div>
          {report.customerAddress && (
            <div className="value">{report.customerAddress}</div>
          )}
          {report.customerPhone && (
            <div className="value">{report.customerPhone}</div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="section">
          <div className="section-title">Financial Summary</div>

          <div className="financial-grid">
            <div className="financial-card">
              <div className="label">Total Hours</div>
              <div className="financial-value">
                {report.totalHours.toFixed(1)}
              </div>
            </div>

            <div className="financial-card">
              <div className="label">Total Cost</div>
              <div className="financial-value">
                {formatCurrency(report.actualTotalCost)}
              </div>
            </div>

            <div className="financial-card">
              <div className="label">Customer Paid</div>
              <div className="financial-value">
                {formatCurrency(report.totalInvestment)}
              </div>
            </div>

            <div className="financial-card">
              <div className="label">Profit</div>
              <div className="financial-value">
                {formatCurrency(report.profit)}
              </div>
              <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
                {report.profitMargin.toFixed(1)}% margin
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="section">
          <div className="section-title">Line Items Breakdown</div>

          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th className="text-right">Est. Hours</th>
                <th className="text-right">Actual Hours</th>
                <th className="text-right">Variance</th>
                <th className="text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {report.lineItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.displayName}</td>
                  <td className="text-right">
                    {item.estimatedHours.toFixed(1)}
                  </td>
                  <td className="text-right">
                    {(item.actualProductiveHours || 0).toFixed(1)}
                  </td>
                  <td className="text-right">
                    {(item.variance || 0) > 0 ? '+' : ''}
                    {(item.variance || 0).toFixed(1)}
                  </td>
                  <td className="text-right">
                    {formatCurrency(item.lineItemTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Crew Time Summary */}
        <div className="section">
          <div className="section-title">Crew Time Summary</div>

          {Object.values(report.timeLogs).map((employeeData: any, index) => (
            <div key={index} className="crew-member">
              <div>
                <div className="value">{employeeData.employeeName}</div>
                <div className="label">{employeeData.employeePosition}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="value">
                  {employeeData.totalHours.toFixed(1)} hours
                </div>
                <div className="label">
                  {formatCurrency(employeeData.totalCost)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="footer">
          Report generated on {formatDate(report.createdAt)}
        </div>
      </body>
    </html>
  )
}
```

---

## 7. Client Component Updates

**File**: `/app/shopos/reports/[id]/page.tsx` (Add these modifications)

```typescript
// Add these imports at the top
import { useState } from 'react'
import DownloadIcon from '@mui/icons-material/Download'
import { useSnackbar } from '@/app/contexts/SnackbarContext'

// Inside the component, add this state and handler
export default function ProjectReportDetailPage() {
  const [isExporting, setIsExporting] = useState(false)
  const { showSnackbar } = useSnackbar()

  // ... existing code ...

  const handleExport = async (format: 'pdf' | 'jpg') => {
    setIsExporting(true)

    try {
      // Make request to API route
      const response = await fetch(
        `/api/export/report/${reportId}?format=${format}`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Export failed')
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename =
        filenameMatch?.[1] || `${report.jobNumber}.${format}`

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showSnackbar(`Export successful: ${filename}`, 'success')
    } catch (error) {
      console.error('Export error:', error)
      showSnackbar(
        error instanceof Error ? error.message : 'Export failed',
        'error'
      )
    } finally {
      setIsExporting(false)
    }
  }

  // In the JSX, update the buttons section:
  return (
    <Box>
      {/* ... existing code ... */}

      {/* Update the toolbar section */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          sx={{
            borderColor: '#2A2A2A',
            color: '#FFFFFF',
            '&:hover': {
              borderColor: '#007AFF',
              background: 'rgba(0, 122, 255, 0.1)',
            },
          }}
        >
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => handleExport('jpg')}
          disabled={isExporting}
          sx={{
            borderColor: '#2A2A2A',
            color: '#FFFFFF',
            '&:hover': {
              borderColor: '#007AFF',
              background: 'rgba(0, 122, 255, 0.1)',
            },
          }}
        >
          {isExporting ? 'Exporting...' : 'Export JPG'}
        </Button>

        {/* Keep existing Print button */}
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{
            borderColor: '#2A2A2A',
            color: '#FFFFFF',
            '&:hover': {
              borderColor: '#007AFF',
              background: 'rgba(0, 122, 255, 0.1)',
            },
          }}
        >
          Print / PDF
        </Button>
      </Box>

      {/* ... rest of existing code ... */}
    </Box>
  )
}
```

---

## 8. Package.json Dependencies

Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "@react-pdf/renderer": "^3.1.14",
    "puppeteer-core": "^21.5.0",
    "@sparticuz/chromium": "^119.0.0",
    "react-dom": "19.2.0"
  }
}
```

Then run:

```bash
npm install
```

---

## 9. Vercel Configuration (Optional)

**File**: `vercel.json`

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

---

## 10. Environment Variables

**File**: `.env.local`

No new environment variables needed! The export system uses existing configuration:

```bash
# Existing variables (no changes needed)
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

## 11. Testing Examples

**Manual Testing Checklist**:

```bash
# 1. Test PDF export
curl -X GET "http://localhost:3000/api/export/report/k17hjdgq0pnm7yxv8fwzts2k9rg0ab1c?format=pdf" \
  -H "Cookie: __clerk_session=..." \
  --output test-report.pdf

# 2. Test JPG export
curl -X GET "http://localhost:3000/api/export/report/k17hjdgq0pnm7yxv8fwzts2k9rg0ab1c?format=jpg" \
  -H "Cookie: __clerk_session=..." \
  --output test-report.jpg

# 3. Test authentication (should return 401)
curl -X GET "http://localhost:3000/api/export/report/k17hjdgq0pnm7yxv8fwzts2k9rg0ab1c?format=pdf"

# 4. Test caching (should return 304 on second request)
curl -X GET "http://localhost:3000/api/export/report/k17hjdgq0pnm7yxv8fwzts2k9rg0ab1c?format=pdf" \
  -H "Cookie: __clerk_session=..." \
  -H "If-None-Match: \"k17hjdgq0pnm7yxv8fwzts2k9rg0ab1c-1700755200000\"" \
  -i
```

---

## 12. Troubleshooting Guide

### Issue: "Failed to generate PDF"

**Solution**: Check if @react-pdf/renderer is installed correctly:

```bash
npm list @react-pdf/renderer
```

If missing, reinstall:

```bash
npm install @react-pdf/renderer --save
```

### Issue: "Puppeteer executable not found"

**Solution**: Ensure @sparticuz/chromium is installed for Vercel:

```bash
npm install @sparticuz/chromium puppeteer-core --save
```

### Issue: "Unauthorized" error in production

**Solution**: Check Clerk environment variables are set in Vercel:

1. Go to Vercel Dashboard > Settings > Environment Variables
2. Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
3. Redeploy

### Issue: Export takes too long (timeout)

**Solution**: Increase function timeout in `vercel.json`:

```json
{
  "functions": {
    "app/api/export/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Issue: "Report not found" but report exists

**Solution**: Check report ID format:

```typescript
console.log('Report ID:', reportId)
console.log('ID length:', reportId.length)
console.log('Matches pattern:', /^[a-z0-9]{32}$/.test(reportId))
```

---

## Next Steps

1. **Create the file structure** as outlined above
2. **Install dependencies**: `npm install @react-pdf/renderer puppeteer-core @sparticuz/chromium`
3. **Copy the code examples** into their respective files
4. **Test locally** with `npm run dev`
5. **Deploy to Vercel** once testing is successful

---

**Document Version**: 1.0
**Last Updated**: 2025-11-23
**Purpose**: Implementation code examples for export system
