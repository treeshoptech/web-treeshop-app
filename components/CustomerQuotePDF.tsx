import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { Id } from '@/convex/_generated/dataModel';

// Register fonts (optional - using default fonts for now)
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
// });

// Define types based on your schema
interface Customer {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  phone?: string;
  email?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface LineItem {
  _id: Id<'jobLineItems'>;
  displayName: string;
  estimatedHours: number;
  lineItemTotal: number;
  scopeDetails?: string;
  serviceType: string;
}

interface Job {
  _id: Id<'jobs'>;
  jobNumber: string;
  totalInvestment: number;
  estimatedTotalHours: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  customer: Customer | null;
  lineItems: LineItem[];
}

interface CompanySettings {
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface CustomerQuotePDFProps {
  job: Job;
  company: CompanySettings;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
  },

  // Header
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #2E7D32',
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  companyInfo: {
    fontSize: 9,
    color: '#5D4037',
    lineHeight: 1.4,
  },

  // Quote Title
  quoteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 5,
    marginTop: 20,
  },
  jobNumber: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 20,
  },

  // Customer Section
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '1 solid #E0E0E0',
  },
  customerInfo: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.6,
    marginBottom: 15,
  },

  // Services Section
  servicesContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  serviceCard: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    marginBottom: 10,
    borderRadius: 4,
    borderLeft: '3 solid #2E7D32',
  },
  serviceName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  serviceDetailItem: {
    fontSize: 9,
    color: '#666666',
  },
  servicePrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 6,
  },

  // Investment Summary
  investmentSummary: {
    backgroundColor: '#2E7D32',
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 4,
  },
  investmentLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  investmentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  investmentSubtext: {
    fontSize: 9,
    color: '#E8F5E9',
    lineHeight: 1.5,
  },

  // Benefits Section
  benefitsContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  checkmark: {
    fontSize: 12,
    color: '#2E7D32',
    marginRight: 8,
    fontWeight: 'bold',
  },
  benefitText: {
    fontSize: 10,
    color: '#333333',
    flex: 1,
    lineHeight: 1.4,
  },

  // Terms Section
  termsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF9E6',
    borderRadius: 4,
    borderLeft: '3 solid #FFC107',
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 9,
    color: '#5D4037',
    lineHeight: 1.5,
    marginBottom: 5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #E0E0E0',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  footerBold: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },

  // Utility
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  textBold: {
    fontWeight: 'bold',
  },
});

export const CustomerQuotePDF: React.FC<CustomerQuotePDFProps> = ({ job, company }) => {
  const customer = job.customer;

  // Format customer name
  const customerName = customer?.businessName ||
    `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() ||
    'Valued Customer';

  // Format customer address
  const customerAddress = customer?.streetAddress && customer?.city && customer?.state
    ? `${customer.streetAddress}, ${customer.city}, ${customer.state} ${customer.zipCode || ''}`
    : null;

  // Format company address
  const companyAddress = company.address && company.city && company.state
    ? `${company.address}, ${company.city}, ${company.state} ${company.zipCode || ''}`
    : null;

  // Calculate totals
  const subtotal = job.totalInvestment;
  const totalHours = job.estimatedTotalHours;

  // Format date for quote validity
  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 30);
  const validUntil = validUntilDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.companyInfo}>
            {companyAddress && `${companyAddress}\n`}
            {company.phone && `Phone: ${company.phone}`}
            {company.email && ` • Email: ${company.email}`}
            {company.website && `\n${company.website}`}
          </Text>
        </View>

        {/* Quote Title */}
        <Text style={styles.quoteTitle}>Project Quote</Text>
        <Text style={styles.jobNumber}>Quote #{job.jobNumber}</Text>

        {/* Customer Information */}
        <Text style={styles.sectionHeader}>Prepared For</Text>
        <View style={styles.customerInfo}>
          <Text style={styles.textBold}>{customerName}</Text>
          {customerAddress && <Text>{customerAddress}</Text>}
          {customer?.phone && <Text>Phone: {customer.phone}</Text>}
          {customer?.email && <Text>Email: {customer.email}</Text>}
        </View>

        {/* Project Dates */}
        {(job.startDate || job.endDate) && (
          <>
            <Text style={styles.sectionHeader}>Project Timeline</Text>
            <View style={styles.customerInfo}>
              {job.startDate && (
                <Text>Estimated Start: {new Date(job.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</Text>
              )}
              {job.endDate && (
                <Text>Estimated Completion: {new Date(job.endDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</Text>
              )}
              <Text>Estimated Duration: {totalHours.toFixed(1)} hours</Text>
            </View>
          </>
        )}

        {/* Services */}
        <Text style={styles.sectionHeader}>Scope of Work</Text>
        <View style={styles.servicesContainer}>
          {job.lineItems.map((item) => (
            <View key={item._id} style={styles.serviceCard}>
              <Text style={styles.serviceName}>{item.displayName}</Text>
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceDetailItem}>
                  Est. Hours: {item.estimatedHours.toFixed(1)}
                </Text>
                <Text style={styles.serviceDetailItem}>
                  Service Type: {item.serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
              {item.scopeDetails && (
                <Text style={[styles.serviceDetailItem, { marginTop: 4 }]}>
                  {item.scopeDetails}
                </Text>
              )}
              <Text style={styles.servicePrice}>{formatCurrency(item.lineItemTotal)}</Text>
            </View>
          ))}
        </View>

        {/* Investment Summary */}
        <View style={styles.investmentSummary}>
          <Text style={styles.investmentLabel}>Total Investment</Text>
          <Text style={styles.investmentAmount}>{formatCurrency(subtotal)}</Text>
          <Text style={styles.investmentSubtext}>
            This investment includes all labor, equipment, materials, and project management for the complete scope of work outlined above.
          </Text>
        </View>

        {/* Benefits/Value Proposition */}
        <Text style={styles.sectionHeader}>What's Included</Text>
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>Professional crew with certified equipment operators</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>All necessary equipment and materials</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>Complete site cleanup and restoration</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>Liability insurance coverage</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>Project management and quality assurance</Text>
          </View>
        </View>

        {/* Additional Notes */}
        {job.notes && (
          <>
            <Text style={styles.sectionHeader}>Additional Notes</Text>
            <Text style={styles.customerInfo}>{job.notes}</Text>
          </>
        )}

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>Important Information</Text>
          <Text style={styles.termsText}>
            • This quote is valid until {validUntil}
          </Text>
          <Text style={styles.termsText}>
            • Final pricing may vary based on site conditions and scope changes
          </Text>
          <Text style={styles.termsText}>
            • Weather and unforeseen circumstances may affect timeline
          </Text>
          <Text style={styles.termsText}>
            • Payment terms to be discussed upon acceptance
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Questions about this quote? Contact us at{' '}
            <Text style={styles.footerBold}>{company.phone || company.email}</Text>
          </Text>
          <Text style={styles.footerText}>
            We look forward to working with you!
          </Text>
        </View>
      </Page>
    </Document>
  );
};
