'use client';

import React from 'react';
import { Box, Typography, Card, CardContent, Divider, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Id } from '@/convex/_generated/dataModel';

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

interface CustomerQuoteTemplateProps {
  job: Job;
  company: CompanySettings;
}

export const CustomerQuoteTemplate = React.forwardRef<HTMLDivElement, CustomerQuoteTemplateProps>(
  ({ job, company }, ref) => {
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
      <Box
        ref={ref}
        sx={{
          width: '800px',
          minHeight: '1000px',
          backgroundColor: '#FFFFFF',
          padding: 6,
          fontFamily: 'Arial, sans-serif',
          color: '#000000',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            borderBottom: '3px solid #2E7D32',
            paddingBottom: 2,
            marginBottom: 4,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#2E7D32',
              marginBottom: 1,
            }}
          >
            {company.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#5D4037',
              lineHeight: 1.6,
            }}
          >
            {companyAddress && <>{companyAddress}<br /></>}
            {company.phone && `Phone: ${company.phone}`}
            {company.email && ` • Email: ${company.email}`}
            {company.website && <><br />{company.website}</>}
          </Typography>
        </Box>

        {/* Quote Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: 1,
            marginTop: 3,
          }}
        >
          Project Quote
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#666666',
            marginBottom: 3,
          }}
        >
          Quote #{job.jobNumber}
        </Typography>

        {/* Customer Information */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#2E7D32',
            marginTop: 3,
            marginBottom: 2,
            paddingBottom: 1,
            borderBottom: '1px solid #E0E0E0',
          }}
        >
          Prepared For
        </Typography>
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1A1A1A' }}>
            {customerName}
          </Typography>
          {customerAddress && (
            <Typography variant="body2" sx={{ color: '#333333' }}>
              {customerAddress}
            </Typography>
          )}
          {customer?.phone && (
            <Typography variant="body2" sx={{ color: '#333333' }}>
              Phone: {customer.phone}
            </Typography>
          )}
          {customer?.email && (
            <Typography variant="body2" sx={{ color: '#333333' }}>
              Email: {customer.email}
            </Typography>
          )}
        </Box>

        {/* Project Timeline */}
        {(job.startDate || job.endDate) && (
          <>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#2E7D32',
                marginTop: 3,
                marginBottom: 2,
                paddingBottom: 1,
                borderBottom: '1px solid #E0E0E0',
              }}
            >
              Project Timeline
            </Typography>
            <Box sx={{ marginBottom: 3 }}>
              {job.startDate && (
                <Typography variant="body2" sx={{ color: '#333333' }}>
                  Estimated Start:{' '}
                  {new Date(job.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              )}
              {job.endDate && (
                <Typography variant="body2" sx={{ color: '#333333' }}>
                  Estimated Completion:{' '}
                  {new Date(job.endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: '#333333' }}>
                Estimated Duration: {job.estimatedTotalHours.toFixed(1)} hours
              </Typography>
            </Box>
          </>
        )}

        {/* Services */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#2E7D32',
            marginTop: 3,
            marginBottom: 2,
            paddingBottom: 1,
            borderBottom: '1px solid #E0E0E0',
          }}
        >
          Scope of Work
        </Typography>
        <Stack spacing={2} sx={{ marginBottom: 3 }}>
          {job.lineItems.map((item) => (
            <Card
              key={item._id}
              sx={{
                backgroundColor: '#F5F5F5',
                borderLeft: '4px solid #2E7D32',
                boxShadow: 'none',
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: 1,
                  }}
                >
                  {item.displayName}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Est. Hours: {item.estimatedHours.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Service Type:{' '}
                    {item.serviceType
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Typography>
                </Box>
                {item.scopeDetails && (
                  <Typography
                    variant="body2"
                    sx={{ color: '#666666', marginTop: 1 }}
                  >
                    {item.scopeDetails}
                  </Typography>
                )}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#2E7D32',
                    marginTop: 1,
                  }}
                >
                  {formatCurrency(item.lineItemTotal)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Investment Summary */}
        <Box
          sx={{
            backgroundColor: '#2E7D32',
            padding: 4,
            borderRadius: 1,
            marginTop: 3,
            marginBottom: 3,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: '#FFFFFF',
              marginBottom: 2,
            }}
          >
            Total Investment
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: 2,
            }}
          >
            {formatCurrency(job.totalInvestment)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#E8F5E9',
              lineHeight: 1.6,
            }}
          >
            This investment includes all labor, equipment, materials, and project
            management for the complete scope of work outlined above.
          </Typography>
        </Box>

        {/* Benefits */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#2E7D32',
            marginTop: 3,
            marginBottom: 2,
            paddingBottom: 1,
            borderBottom: '1px solid #E0E0E0',
          }}
        >
          What's Included
        </Typography>
        <Stack spacing={1.5} sx={{ marginBottom: 3 }}>
          {[
            'Professional crew with certified equipment operators',
            'All necessary equipment and materials',
            'Complete site cleanup and restoration',
            'Liability insurance coverage',
            'Project management and quality assurance',
          ].map((benefit, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <CheckCircleIcon
                sx={{ color: '#2E7D32', marginRight: 1, fontSize: 20 }}
              />
              <Typography variant="body2" sx={{ color: '#333333' }}>
                {benefit}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Additional Notes */}
        {job.notes && (
          <>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#2E7D32',
                marginTop: 3,
                marginBottom: 2,
                paddingBottom: 1,
                borderBottom: '1px solid #E0E0E0',
              }}
            >
              Additional Notes
            </Typography>
            <Typography variant="body2" sx={{ color: '#333333', marginBottom: 3 }}>
              {job.notes}
            </Typography>
          </>
        )}

        {/* Terms */}
        <Box
          sx={{
            backgroundColor: '#FFF9E6',
            padding: 3,
            borderRadius: 1,
            borderLeft: '4px solid #FFC107',
            marginTop: 3,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: '#F57C00',
              marginBottom: 2,
            }}
          >
            Important Information
          </Typography>
          <Typography variant="body2" sx={{ color: '#5D4037', marginBottom: 1 }}>
            • This quote is valid until {validUntil}
          </Typography>
          <Typography variant="body2" sx={{ color: '#5D4037', marginBottom: 1 }}>
            • Final pricing may vary based on site conditions and scope changes
          </Typography>
          <Typography variant="body2" sx={{ color: '#5D4037', marginBottom: 1 }}>
            • Weather and unforeseen circumstances may affect timeline
          </Typography>
          <Typography variant="body2" sx={{ color: '#5D4037' }}>
            • Payment terms to be discussed upon acceptance
          </Typography>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            marginTop: 4,
            paddingTop: 3,
            borderTop: '1px solid #E0E0E0',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: '#666666', marginBottom: 1 }}>
            Questions about this quote? Contact us at{' '}
            <strong style={{ color: '#2E7D32' }}>
              {company.phone || company.email}
            </strong>
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666' }}>
            We look forward to working with you!
          </Typography>
        </Box>
      </Box>
    );
  }
);

CustomerQuoteTemplate.displayName = 'CustomerQuoteTemplate';
