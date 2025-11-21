'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams, useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as Id<'customers'>;

  const customerData = useQuery(api.customers.getCustomerWithJobs, { customerId });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (customerData === undefined) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 42px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (customerData === null) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" sx={{ color: '#B3B3B3' }}>
          Customer not found
        </Typography>
      </Container>
    );
  }

  const { jobs, ...customer } = customerData;
  const fullName = customer.businessName
    ? `${customer.firstName} ${customer.lastName} (${customer.businessName})`
    : `${customer.firstName} ${customer.lastName}`;
  const fullAddress = `${customer.streetAddress}, ${customer.city}, ${customer.state} ${customer.zipCode}`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/customers')}
        sx={{
          color: '#666',
          mb: 3,
          '&:hover': { color: '#007AFF', background: 'rgba(0, 122, 255, 0.05)' },
        }}
      >
        Back to Customers
      </Button>

      {/* Customer Profile */}
      <Card sx={{ background: '#1A1A1A', border: '1px solid #2A2A2A', mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <PersonIcon sx={{ color: '#007AFF', fontSize: 40 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                {fullName}
              </Typography>
              {customer.propertyType && (
                <Chip
                  label={customer.propertyType}
                  size="small"
                  sx={{
                    mt: 1,
                    background: customer.propertyType === 'Commercial' ? '#007AFF' : '#666',
                    color: '#FFFFFF',
                  }}
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A', my: 3 }} />

          {/* Contact Info */}
          <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 600, mb: 2 }}>
            CONTACT INFORMATION
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            {customer.phone && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <PhoneIcon sx={{ color: '#666', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Primary Phone
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
                  {customer.phone}
                </Typography>
              </Box>
            )}

            {customer.alternatePhone && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <PhoneIcon sx={{ color: '#666', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Alternate Phone
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
                  {customer.alternatePhone}
                </Typography>
              </Box>
            )}

            {customer.email && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <EmailIcon sx={{ color: '#666', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Email
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#007AFF' }}>
                  {customer.email}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A', my: 3 }} />

          {/* Property Address */}
          <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 600, mb: 2 }}>
            PROPERTY ADDRESS
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 3 }}>
            <LocationOnIcon sx={{ color: '#666', fontSize: 20, mt: 0.5 }} />
            <Box>
              <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
                {customer.streetAddress}
              </Typography>
              <Typography variant="body1" sx={{ color: '#B3B3B3' }}>
                {customer.city}, {customer.state} {customer.zipCode}
              </Typography>
            </Box>
          </Box>

          {customer.howDidTheyFindUs && (
            <>
              <Divider sx={{ borderColor: '#2A2A2A', my: 3 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                  HOW THEY FOUND US
                </Typography>
                <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                  {customer.howDidTheyFindUs}
                </Typography>
              </Box>
            </>
          )}

          {customer.notes && (
            <>
              <Divider sx={{ borderColor: '#2A2A2A', my: 3 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                  NOTES
                </Typography>
                <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                  {customer.notes}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
          Projects ({jobs.length})
        </Typography>
      </Box>

      {jobs.length === 0 ? (
        <Card sx={{ background: '#1A1A1A', border: '1px solid #2A2A2A', textAlign: 'center', py: 6 }}>
          <CardContent>
            <AssignmentIcon sx={{ fontSize: 60, color: '#666', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#B3B3B3', mb: 2 }}>
              No projects yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Create a project for this customer to get started
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {jobs.map((job) => (
            <Link
              key={job._id}
              href={`/work-orders/${job._id}`}
              style={{ textDecoration: 'none' }}
            >
              <Card
                sx={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    background: '#222',
                    borderColor: '#007AFF',
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: '#FFFFFF', fontWeight: 600, mb: 0.5 }}
                      >
                        {job.jobNumber}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {job.startDate ? new Date(job.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }) : 'Not scheduled'}
                      </Typography>
                    </Box>
                    <Chip
                      label={job.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(job.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 4,
                      mt: 2,
                      pt: 2,
                      borderTop: '1px solid #2A2A2A',
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Estimated Hours
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: '#FFFFFF', fontWeight: 600 }}
                      >
                        {job.estimatedTotalHours.toFixed(1)}h
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Total Investment
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: '#007AFF', fontWeight: 600 }}
                      >
                        ${job.totalInvestment.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Box>
      )}
    </Container>
  );
}
