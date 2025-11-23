# Tree Service Proposal - Implementation Guide

This guide provides practical code examples and implementation steps for building the proposal system.

---

## TABLE OF CONTENTS

1. [Component Architecture](#component-architecture)
2. [CSS/Tailwind Configuration](#csstailwind-configuration)
3. [React Components](#react-components)
4. [PDF Generation](#pdf-generation)
5. [JPG Export](#jpg-export)
6. [Data Transformation](#data-transformation)
7. [Testing Checklist](#testing-checklist)

---

## COMPONENT ARCHITECTURE

### File Structure

```
/app
  /proposals
    /[id]
      /page.tsx                 # View proposal
      /export-pdf/route.ts      # PDF generation endpoint
      /export-jpg/route.ts      # JPG generation endpoint
/components
  /proposal
    /ProposalDocument.tsx       # Main container
    /ProposalHeader.tsx         # Header with branding
    /CustomerSection.tsx        # Customer info block
    /ProposalOverview.tsx       # Project summary cards
    /ScopeOfWork.tsx           # Service line items
    /ServiceCard.tsx           # Individual service card
    /PricingBreakdown.tsx      # Detailed cost tables
    /LaborTable.tsx            # Labor breakdown
    /EquipmentTable.tsx        # Equipment breakdown
    /CostDistribution.tsx      # Visual chart
    /InvestmentSummary.tsx     # Total investment box
    /NextSteps.tsx             # Contact section
/lib
  /proposal-utils.ts           # Helper functions
  /proposal-data.ts            # Data transformation
/styles
  /proposal.css                # Proposal-specific styles
  /proposal-print.css          # Print media queries
```

---

## CSS/TAILWIND CONFIGURATION

### Extend Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tree Service Brand Colors
        brand: {
          green: {
            DEFAULT: '#2E7D32',
            light: '#4CAF50',
            lighter: '#81C784',
            pale: '#F1F8F4',
          },
          brown: {
            DEFAULT: '#5D4037',
            tan: '#D7CCC8',
            cream: '#FFF8E1',
          },
          gray: {
            dark: '#1A1A1A',
            medium: '#4A4A4A',
            light: '#9E9E9E',
            pale: '#F5F5F5',
            border: '#E0E0E0',
          },
          blue: '#1976D2',
          amber: '#F57C00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        // Proposal-specific sizes
        'proposal-h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'proposal-h2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'proposal-h3': ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        'proposal-total': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
      },
      spacing: {
        // 8px grid system
        '18': '72px',  // Document margins
        '22': '88px',
        '26': '104px',
      },
      boxShadow: {
        'card-sm': '0 2px 4px rgba(0, 0, 0, 0.06)',
        'card-md': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-lg': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'inset-subtle': 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}

export default config
```

### Custom CSS Variables

```css
/* styles/proposal.css */
:root {
  /* Colors */
  --color-brand-green: #2E7D32;
  --color-brand-green-light: #4CAF50;
  --color-brand-green-pale: #F1F8F4;
  --color-brand-brown: #5D4037;
  --color-text-dark: #1A1A1A;
  --color-text-medium: #4A4A4A;
  --color-text-light: #6B6B6B;
  --color-border: #E0E0E0;

  /* Spacing (8px grid) */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 32px;
  --space-xl: 48px;
  --space-xxl: 64px;
  --space-xxxl: 72px;

  /* Typography */
  --font-h1: 32px;
  --font-h2: 24px;
  --font-h3: 18px;
  --font-body: 16px;
  --font-small: 14px;
  --font-total: 48px;

  /* Document layout */
  --doc-width: 816px;
  --doc-content-width: 672px;
  --doc-margin: 72px;
}

/* Mobile overrides */
@media (max-width: 767px) {
  :root {
    --font-h1: 28px;
    --font-h2: 20px;
    --font-total: 36px;
    --doc-margin: 16px;
  }
}

/* Print styles */
@media print {
  :root {
    --doc-margin: 0.75in;
  }

  body {
    font-size: 12pt;
  }

  .no-print {
    display: none !important;
  }

  .page-break-inside-avoid {
    page-break-inside: avoid;
  }

  @page {
    size: letter portrait;
    margin: 0.75in;
  }
}
```

---

## REACT COMPONENTS

### 1. ProposalDocument.tsx (Main Container)

```typescript
// components/proposal/ProposalDocument.tsx
import React from 'react'
import { ProposalHeader } from './ProposalHeader'
import { CustomerSection } from './CustomerSection'
import { ProposalOverview } from './ProposalOverview'
import { ScopeOfWork } from './ScopeOfWork'
import { PricingBreakdown } from './PricingBreakdown'
import { InvestmentSummary } from './InvestmentSummary'
import { NextSteps } from './NextSteps'

interface ProposalDocumentProps {
  proposal: {
    proposalNumber: string
    createdAt: string
    validUntil: string
    company: CompanyInfo
    customer: CustomerInfo
    lineItems: LineItem[]
    summary: ProposalSummary
  }
}

export function ProposalDocument({ proposal }: ProposalDocumentProps) {
  return (
    <div
      id="proposal-document"
      className="proposal-document max-w-[816px] mx-auto bg-white"
      style={{ minHeight: '11in' }}
    >
      <ProposalHeader
        logo={proposal.company.logo}
        companyName={proposal.company.name}
        tagline={proposal.company.tagline}
        phone={proposal.company.phone}
        email={proposal.company.email}
        proposalNumber={proposal.proposalNumber}
        date={proposal.createdAt}
        validUntil={proposal.validUntil}
      />

      <div className="px-18 md:px-4 lg:px-18">
        <CustomerSection customer={proposal.customer} />

        <ProposalOverview
          scope={proposal.lineItems[0]?.serviceType || 'Tree Services'}
          estimatedDays={proposal.summary.estimatedDays}
          validDays={30}
        />

        <ScopeOfWork lineItems={proposal.lineItems} />

        <PricingBreakdown lineItems={proposal.lineItems} />

        <InvestmentSummary
          total={proposal.summary.totalPrice}
          estimatedDays={proposal.summary.estimatedDays}
          validDays={30}
        />

        <NextSteps
          phone={proposal.company.phone}
          email={proposal.company.email}
          businessHours={proposal.company.businessHours}
        />
      </div>
    </div>
  )
}
```

### 2. ProposalHeader.tsx

```typescript
// components/proposal/ProposalHeader.tsx
import React from 'react'
import Image from 'next/image'
import { formatDate } from '@/lib/proposal-utils'

interface ProposalHeaderProps {
  logo?: string
  companyName: string
  tagline?: string
  phone: string
  email: string
  proposalNumber: string
  date: string
  validUntil: string
}

export function ProposalHeader({
  logo,
  companyName,
  tagline,
  phone,
  email,
  proposalNumber,
  date,
  validUntil,
}: ProposalHeaderProps) {
  return (
    <header className="proposal-header p-6 border-b-2 border-brand-gray-border">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left: Company Branding */}
        <div className="flex items-center gap-4">
          {logo && (
            <div className="relative w-[120px] h-[60px]">
              <Image
                src={logo}
                alt={`${companyName} Logo`}
                fill
                className="object-contain"
              />
            </div>
          )}

          <div>
            <h1 className="text-proposal-h1 text-brand-green font-bold">
              {companyName}
            </h1>
            {tagline && (
              <p className="text-sm text-brand-gray-medium mt-1">
                {tagline}
              </p>
            )}
            <p className="text-sm text-brand-gray-medium mt-1">
              {phone} | {email}
            </p>
          </div>
        </div>

        {/* Right: Proposal Info */}
        <div className="text-left md:text-right">
          <p className="text-lg font-semibold text-brand-gray-dark">
            Proposal #{proposalNumber}
          </p>
          <p className="text-sm text-brand-gray-medium mt-1">
            Date: {formatDate(date)}
          </p>
          <p className="text-sm text-brand-gray-medium">
            Valid Until: {formatDate(validUntil)}
          </p>
        </div>
      </div>
    </header>
  )
}
```

### 3. ServiceCard.tsx

```typescript
// components/proposal/ServiceCard.tsx
import React from 'react'
import { formatCurrency } from '@/lib/proposal-utils'

interface ServiceCardProps {
  serviceType: string
  displayName: string
  description: string
  laborCost: number
  equipmentCost: number
  total: number
}

const SERVICE_ICONS: Record<string, string> = {
  forestry_mulching: '●',
  tree_removal: '▲',
  stump_grinding: '■',
  transport: '◆',
}

export function ServiceCard({
  serviceType,
  displayName,
  description,
  laborCost,
  equipmentCost,
  total,
}: ServiceCardProps) {
  const icon = SERVICE_ICONS[serviceType] || '●'

  return (
    <div className="service-card bg-white border border-brand-gray-border rounded-lg shadow-card-md p-6 mb-4 page-break-inside-avoid">
      {/* Service Name */}
      <div className="flex items-start gap-2 mb-3">
        <span className="text-brand-green text-xl" aria-hidden="true">
          {icon}
        </span>
        <h3 className="text-proposal-h3 text-brand-gray-dark font-semibold">
          {displayName}
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-brand-gray-light leading-relaxed mb-6">
        {description}
      </p>

      {/* Cost Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-base text-brand-gray-medium">
          <span>Labor Cost:</span>
          <span>{formatCurrency(laborCost)}</span>
        </div>

        <div className="flex justify-between text-base text-brand-gray-medium">
          <span>Equipment Cost:</span>
          <span>{formatCurrency(equipmentCost)}</span>
        </div>

        <div className="border-t border-brand-gray-border pt-2 mt-3">
          <div className="flex justify-between text-lg font-bold text-brand-green">
            <span>Line Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 4. InvestmentSummary.tsx

```typescript
// components/proposal/InvestmentSummary.tsx
import React from 'react'
import { formatCurrency } from '@/lib/proposal-utils'

interface InvestmentSummaryProps {
  total: number
  estimatedDays: number
  validDays: number
}

export function InvestmentSummary({
  total,
  estimatedDays,
  validDays,
}: InvestmentSummaryProps) {
  return (
    <div className="investment-summary relative my-12 p-10 bg-brand-green-pale border-l-[6px] border-brand-green rounded-lg shadow-inset-subtle page-break-inside-avoid">
      {/* Header */}
      <h2 className="text-xl font-semibold uppercase tracking-wider text-brand-gray-dark mb-6 text-center">
        Your Total Investment
      </h2>

      {/* Total Amount - The Star of the Show */}
      <div className="text-center mb-8">
        <p className="text-proposal-total font-bold text-brand-green">
          {formatCurrency(total)}
        </p>
      </div>

      {/* Benefits List */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-brand-green text-lg mt-0.5" aria-hidden="true">✓</span>
          <p className="text-base text-brand-gray-dark leading-relaxed">
            Includes all labor, equipment, and materials
          </p>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-brand-green text-lg mt-0.5" aria-hidden="true">✓</span>
          <p className="text-base text-brand-gray-dark leading-relaxed">
            Project completion estimated: {estimatedDays}-{estimatedDays + 1} business days
          </p>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-brand-green text-lg mt-0.5" aria-hidden="true">✓</span>
          <p className="text-base text-brand-gray-dark leading-relaxed">
            Proposal valid for {validDays} days
          </p>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-brand-green text-lg mt-0.5" aria-hidden="true">✓</span>
          <p className="text-base text-brand-gray-dark leading-relaxed">
            No hidden fees or surprise charges
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 5. LaborTable.tsx

```typescript
// components/proposal/LaborTable.tsx
import React from 'react'
import { formatCurrency } from '@/lib/proposal-utils'

interface LaborRow {
  position: string
  days: number
  ratePerDay: number
  total: number
}

interface LaborTableProps {
  laborRows: LaborRow[]
  subtotal: number
}

export function LaborTable({ laborRows, subtotal }: LaborTableProps) {
  return (
    <div className="labor-table border border-brand-gray-border rounded-lg overflow-hidden mb-6 page-break-inside-avoid">
      {/* Header */}
      <div className="bg-brand-green text-white p-3">
        <h3 className="text-xl font-semibold">Labor Breakdown</h3>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-brand-gray-pale text-sm font-semibold text-brand-gray-dark">
            <th className="text-left p-3">Position</th>
            <th className="text-center p-3 hidden md:table-cell">Days</th>
            <th className="text-right p-3 hidden md:table-cell">Rate/Day</th>
            <th className="text-right p-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {laborRows.map((row, index) => (
            <tr
              key={index}
              className={`border-t border-brand-gray-border ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="p-3 text-sm text-brand-gray-dark">
                {row.position}
                {/* Mobile: Show days inline */}
                <span className="md:hidden text-brand-gray-medium ml-2">
                  ({row.days} days)
                </span>
              </td>
              <td className="text-center p-3 text-sm hidden md:table-cell">
                {row.days}
              </td>
              <td className="text-right p-3 text-sm hidden md:table-cell tabular-nums">
                {formatCurrency(row.ratePerDay)}
              </td>
              <td className="text-right p-3 text-sm font-medium tabular-nums">
                {formatCurrency(row.total)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-brand-green-pale border-t-2 border-brand-green">
            <td
              colSpan={3}
              className="p-3 text-base font-bold text-brand-gray-dark"
            >
              LABOR SUBTOTAL
            </td>
            <td className="text-right p-3 text-base font-bold text-brand-green tabular-nums">
              {formatCurrency(subtotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
```

### 6. CostDistribution.tsx

```typescript
// components/proposal/CostDistribution.tsx
import React from 'react'
import { formatCurrency } from '@/lib/proposal-utils'

interface CostDistributionProps {
  laborCost: number
  equipmentCost: number
  total: number
}

export function CostDistribution({
  laborCost,
  equipmentCost,
  total,
}: CostDistributionProps) {
  const laborPercent = Math.round((laborCost / total) * 100)
  const equipmentPercent = Math.round((equipmentCost / total) * 100)

  return (
    <div className="cost-distribution border border-brand-gray-border rounded-lg p-5 mb-6">
      <h3 className="text-base font-semibold text-brand-gray-dark mb-4">
        Cost Breakdown by Category:
      </h3>

      {/* Labor Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-brand-gray-dark">Labor</span>
          <span className="text-brand-gray-medium">
            {laborPercent}% ({formatCurrency(laborCost)})
          </span>
        </div>
        <div className="w-full h-6 bg-brand-gray-border rounded overflow-hidden">
          <div
            className="h-full bg-brand-green transition-all duration-300"
            style={{ width: `${laborPercent}%` }}
            role="progressbar"
            aria-valuenow={laborPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Equipment Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-brand-gray-dark">Equipment</span>
          <span className="text-brand-gray-medium">
            {equipmentPercent}% ({formatCurrency(equipmentCost)})
          </span>
        </div>
        <div className="w-full h-6 bg-brand-gray-border rounded overflow-hidden">
          <div
            className="h-full bg-brand-green transition-all duration-300"
            style={{ width: `${equipmentPercent}%` }}
            role="progressbar"
            aria-valuenow={equipmentPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-brand-gray-border pt-3 mt-3">
        <div className="flex justify-between text-base font-semibold">
          <span className="text-brand-gray-dark">Total Project Cost:</span>
          <span className="text-brand-green">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
```

---

## PDF GENERATION

### Using @react-pdf/renderer

```typescript
// app/proposals/[id]/export-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { ProposalPDF } from '@/components/proposal/ProposalPDF'
import { fetchProposalData } from '@/lib/proposal-data'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch proposal data
    const proposal = await fetchProposalData(params.id)

    if (!proposal) {
      return new NextResponse('Proposal not found', { status: 404 })
    }

    // Generate PDF
    const stream = await renderToStream(
      <ProposalPDF proposal={proposal} />
    )

    // Return as downloadable PDF
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Proposal-${proposal.proposalNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return new NextResponse('PDF generation failed', { status: 500 })
  }
}
```

### ProposalPDF Component

```typescript
// components/proposal/ProposalPDF.tsx
import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 72,
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
    paddingBottom: 24,
    borderBottom: '2px solid #E0E0E0',
  },
  companyName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  proposalNumber: {
    fontSize: 18,
    fontWeight: 'semibold',
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'semibold',
    color: '#1A1A1A',
    marginTop: 48,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: '2px solid #E0E0E0',
    textTransform: 'uppercase',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
  },
  totalBox: {
    backgroundColor: '#F1F8F4',
    borderLeft: '6px solid #2E7D32',
    borderRadius: 8,
    padding: 40,
    marginTop: 48,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 32,
  },
})

interface ProposalPDFProps {
  proposal: ProposalData
}

export function ProposalPDF({ proposal }: ProposalPDFProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{proposal.company.name}</Text>
            <Text style={{ fontSize: 14, color: '#4A4A4A', marginTop: 4 }}>
              {proposal.company.tagline}
            </Text>
          </View>
          <View>
            <Text style={styles.proposalNumber}>
              Proposal #{proposal.proposalNumber}
            </Text>
            <Text style={{ fontSize: 14, color: '#4A4A4A' }}>
              Date: {new Date(proposal.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Customer Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={styles.sectionHeader}>Prepared For</Text>
          <Text style={{ fontSize: 18, fontWeight: 'semibold' }}>
            {proposal.customer.name}
          </Text>
          <Text style={{ fontSize: 16, color: '#4A4A4A', marginTop: 4 }}>
            {proposal.customer.address}
          </Text>
        </View>

        {/* Service Cards */}
        <View>
          <Text style={styles.sectionHeader}>Scope of Work</Text>
          {proposal.lineItems.map((item, index) => (
            <View key={index} style={styles.serviceCard}>
              <Text style={{ fontSize: 18, fontWeight: 'semibold', marginBottom: 8 }}>
                {item.displayName}
              </Text>
              <Text style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 16 }}>
                {item.description}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>Labor Cost:</Text>
                <Text>${item.laborCost.toFixed(2)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>Equipment Cost:</Text>
                <Text>${item.equipmentCost.toFixed(2)}</Text>
              </View>
              <View
                style={{
                  borderTop: '1px solid #E0E0E0',
                  marginTop: 8,
                  paddingTop: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Line Total:</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2E7D32' }}>
                  ${item.lineItemPrice.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Investment Summary */}
        <View style={styles.totalBox}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'semibold',
              textAlign: 'center',
              marginBottom: 24,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Your Total Investment
          </Text>
          <Text style={styles.totalAmount}>
            ${proposal.summary.totalPrice.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>
            ✓ Includes all labor, equipment, and materials
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>
            ✓ Project completion: {proposal.summary.estimatedDays}-
            {proposal.summary.estimatedDays + 1} business days
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>
            ✓ Proposal valid for 30 days
          </Text>
          <Text style={{ fontSize: 16 }}>
            ✓ No hidden fees or surprise charges
          </Text>
        </View>
      </Page>
    </Document>
  )
}
```

---

## JPG EXPORT

### Using html2canvas

```typescript
// lib/export-jpg.ts
import html2canvas from 'html2canvas'

export async function exportProposalAsJPG(elementId: string, filename: string) {
  const element = document.getElementById(elementId)

  if (!element) {
    throw new Error('Element not found')
  }

  // Configure canvas
  const canvas = await html2canvas(element, {
    scale: 2,              // 2x for retina displays
    useCORS: true,         // Allow cross-origin images
    backgroundColor: '#ffffff',
    width: 1200,           // Fixed width for consistency
    windowWidth: 1200,
    logging: false,
  })

  // Convert to blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/jpeg',
      0.9  // 90% quality
    )
  })

  // Download
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
```

### Export Button Component

```typescript
// components/proposal/ExportButtons.tsx
'use client'

import React, { useState } from 'react'
import { exportProposalAsJPG } from '@/lib/export-jpg'

interface ExportButtonsProps {
  proposalNumber: string
}

export function ExportButtons({ proposalNumber }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handlePDFExport = async () => {
    window.open(`/proposals/${proposalNumber}/export-pdf`, '_blank')
  }

  const handleJPGExport = async () => {
    setIsExporting(true)
    try {
      await exportProposalAsJPG(
        'proposal-document',
        `Proposal-${proposalNumber}.jpg`
      )
    } catch (error) {
      console.error('JPG export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="no-print flex gap-4 mb-6 sticky top-4 bg-white p-4 rounded-lg shadow-md z-10">
      <button
        onClick={handlePDFExport}
        className="px-6 py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-light transition-colors"
      >
        Download PDF
      </button>

      <button
        onClick={handleJPGExport}
        disabled={isExporting}
        className="px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isExporting ? 'Exporting...' : 'Download JPG'}
      </button>

      <button
        onClick={() => window.print()}
        className="px-6 py-3 bg-brand-gray-medium text-white rounded-lg font-semibold hover:bg-brand-gray-dark transition-colors"
      >
        Print
      </button>
    </div>
  )
}
```

---

## DATA TRANSFORMATION

### Transform Convex Data to Proposal Format

```typescript
// lib/proposal-data.ts
import { Doc } from '@/convex/_generated/dataModel'

export interface ProposalData {
  proposalNumber: string
  createdAt: string
  validUntil: string
  company: {
    name: string
    logo?: string
    tagline?: string
    phone: string
    email: string
    businessHours?: string
  }
  customer: {
    name: string
    address: string
    phone: string
    email?: string
  }
  lineItems: Array<{
    serviceType: string
    displayName: string
    description: string
    quantity: number
    unit: string
    estimatedDays: number
    laborCost: number
    equipmentCost: number
    lineItemPrice: number
  }>
  summary: {
    subtotal: number
    marginPercentage: number
    totalPrice: number
    estimatedDays: number
  }
}

export function transformProposalData(
  proposal: Doc<'proposals'>,
  lineItems: Doc<'proposalLineItems'>[],
  customer: Doc<'customers'>,
  company: Doc<'companies'>
): ProposalData {
  // Calculate totals
  const totalLabor = lineItems.reduce((sum, item) => sum + item.laborCost, 0)
  const totalEquipment = lineItems.reduce((sum, item) => sum + item.equipmentCost, 0)
  const totalDays = Math.max(...lineItems.map((item) => item.estimatedDays))

  // Calculate validity date (30 days from creation)
  const validUntil = new Date(proposal.createdAt)
  validUntil.setDate(validUntil.getDate() + 30)

  return {
    proposalNumber: proposal.proposalNumber,
    createdAt: new Date(proposal.createdAt).toISOString(),
    validUntil: validUntil.toISOString(),

    company: {
      name: company.name,
      logo: undefined, // Add logo URL if available
      tagline: 'Professional Tree Services',
      phone: company.phone || '',
      email: company.email || '',
      businessHours: 'Mon-Fri 7am-5pm',
    },

    customer: {
      name: `${customer.firstName} ${customer.lastName}`,
      address: `${customer.streetAddress}, ${customer.city}, ${customer.state} ${customer.zipCode}`,
      phone: customer.phone || '',
      email: customer.email,
    },

    lineItems: lineItems.map((item) => ({
      serviceType: item.serviceType,
      displayName: item.displayName,
      description: item.description || generateDescription(item.serviceType, item.quantity, item.unit),
      quantity: item.quantity,
      unit: item.unit,
      estimatedDays: item.estimatedDays,
      laborCost: item.laborCost,
      equipmentCost: item.equipmentCost,
      lineItemPrice: item.lineItemPrice,
    })),

    summary: {
      subtotal: proposal.subtotal,
      marginPercentage: proposal.marginPercentage,
      totalPrice: proposal.totalPrice,
      estimatedDays: totalDays,
    },
  }
}

function generateDescription(serviceType: string, quantity: number, unit: string): string {
  const descriptions: Record<string, string> = {
    forestry_mulching: `This service includes clearing and mulching ${quantity} ${unit} of vegetation, leaving a clean, finished surface ready for use.`,
    tree_removal: `Professional removal of ${quantity} ${unit}, including cutting, hauling, and site cleanup.`,
    stump_grinding: `Complete grinding of ${quantity} ${unit} to below ground level, with mulch removal.`,
    transport: `Equipment transportation and setup for the project site.`,
  }

  return descriptions[serviceType] || `${serviceType} service for ${quantity} ${unit}.`
}
```

---

## TESTING CHECKLIST

### Visual Testing

- [ ] Test on Chrome (desktop & mobile)
- [ ] Test on Safari (desktop & mobile)
- [ ] Test on Firefox
- [ ] Test on Samsung Internet (Android)
- [ ] Test on actual iPhone (Messages, Mail, Safari)
- [ ] Test on actual Android (Messages, Gmail, Chrome)
- [ ] Verify all fonts load correctly
- [ ] Verify logo displays correctly
- [ ] Check color accuracy across devices

### PDF Testing

- [ ] Open in Adobe Acrobat Reader
- [ ] Open in macOS Preview
- [ ] Open in Chrome PDF viewer
- [ ] Open in Edge PDF viewer
- [ ] Verify text is selectable
- [ ] Verify file size under 2MB
- [ ] Test printing from PDF
- [ ] Verify page breaks are clean
- [ ] Check embedded fonts display correctly

### JPG Testing

- [ ] Verify image quality at 100% zoom
- [ ] Check file size (target: under 1MB)
- [ ] Test sending via SMS (iPhone, Android)
- [ ] Test sending via email attachment
- [ ] Verify readability on small screens
- [ ] Check for any pixelation or artifacts

### Accessibility Testing

- [ ] Run WAVE accessibility checker
- [ ] Test with screen reader (VoiceOver)
- [ ] Verify color contrast ratios (WCAG AA)
- [ ] Test keyboard navigation
- [ ] Verify semantic HTML structure
- [ ] Check ARIA labels
- [ ] Test with 200% browser zoom

### Data Accuracy Testing

- [ ] Verify all calculations are correct
- [ ] Check currency formatting
- [ ] Verify date formatting
- [ ] Test with edge cases (very large/small numbers)
- [ ] Verify proposal number generation
- [ ] Test with missing optional fields

### Performance Testing

- [ ] Measure page load time (target: under 3s)
- [ ] Test PDF generation time (target: under 5s)
- [ ] Test JPG export time (target: under 3s)
- [ ] Monitor memory usage during export
- [ ] Test with slow network connection

---

This implementation guide provides working code examples that you can adapt to your specific needs. All components follow best practices for accessibility, performance, and maintainability.
