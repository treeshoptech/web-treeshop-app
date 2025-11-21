'use client';

import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import {
  Add,
  PlayArrow,
  CheckCircle,
  Schedule,
  Pending,
  Edit,
} from '@mui/icons-material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useOrganization } from '@clerk/nextjs';
import OrganizationRequired from '@/components/OrganizationRequired';

export default function ShopOSDashboard() {
  const { organization } = useOrganization();
  const jobs = useQuery(api.jobs.listJobs);

  // Listen for organization changes and log for debugging
  useEffect(() => {
    if (organization) {
      console.log('Organization changed:', {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      });
    }
  }, [organization?.id]); // Re-run when organization ID changes

  if (!organization) {
    return <OrganizationRequired />;
  }

  if (jobs === undefined) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#000000',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Filter jobs by status
  const quotes = jobs.filter(j => j.status === 'draft' || j.status === 'sent');
  const active = jobs.filter(j => j.status === 'scheduled' || j.status === 'in_progress' || j.status === 'accepted');
  const completedToday = jobs.filter(j => {
    if (j.status !== 'completed' || !j.completedAt) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const completedDate = new Date(j.completedAt).setHours(0, 0, 0, 0);
    return completedDate === today;
  });


  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', py: { xs: 3, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Header with Create Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: { xs: '1.75rem', md: '2.125rem' },
              }}
            >
              Projects
            </Typography>
            <Typography sx={{ color: '#666', fontSize: { xs: '0.875rem', md: '1rem' } }}>
              {quotes.length} quotes • {active.length} active • {completedToday.length} completed today
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/shopos/work-orders"
            variant="contained"
            startIcon={<Add />}
            sx={{
              background: '#007AFF',
              fontWeight: 600,
              px: { xs: 2, sm: 3 },
              py: 1.5,
              '&:hover': {
                background: '#0066DD',
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              New Project
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              +
            </Box>
          </Button>
        </Box>

        {/* Quotes/Proposals */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#FFFFFF',
              fontWeight: 600,
              mb: 2,
            }}
          >
            Quotes & Proposals
          </Typography>
          <Box
            sx={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: 2,
            }}
          >
            <List sx={{ p: 0 }}>
              {quotes.length === 0 ? (
                <ListItem sx={{ p: 3 }}>
                  <Typography sx={{ color: '#666', fontSize: '0.875rem' }}>
                    No quotes pending
                  </Typography>
                </ListItem>
              ) : (
                quotes.map((job, index) => (
                  <ListItem
                    key={job._id}
                    disablePadding
                    sx={{
                      borderBottom: index < quotes.length - 1 ? '1px solid #2A2A2A' : 'none',
                    }}
                  >
                    <ListItemButton
                      component={Link}
                      href={`/shopos/work-orders/${job._id}`}
                      sx={{
                        p: { xs: 2, sm: 3 },
                        '&:hover': {
                          background: '#0A0A0A',
                        },
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography
                              sx={{
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: { xs: '0.938rem', sm: '1rem' },
                                mb: 0.5,
                              }}
                            >
                              {job.customer ? `${job.customer.firstName} ${job.customer.lastName}` : job.customerName || 'Unknown'}
                            </Typography>
                            <Typography
                              sx={{
                                color: '#666',
                                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                              }}
                            >
                              {job.customer ? `${job.customer.city}, ${job.customer.state}` : job.customerAddress || ''}
                            </Typography>
                          </Box>
                          <Chip
                            label={job.status === 'sent' ? 'Sent' : 'Draft'}
                            icon={job.status === 'sent' ? <Schedule sx={{ fontSize: 16 }} /> : <Edit sx={{ fontSize: 16 }} />}
                            sx={{
                              background: job.status === 'sent' ? '#007AFF20' : '#66666620',
                              color: job.status === 'sent' ? '#007AFF' : '#666',
                              border: 'none',
                              height: 28,
                              fontSize: '0.75rem',
                              '& .MuiChip-icon': {
                                color: job.status === 'sent' ? '#007AFF' : '#666',
                              },
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Typography sx={{ color: '#B3B3B3', fontSize: { xs: '0.75rem', sm: '0.813rem' } }}>
                            {job.jobNumber}
                          </Typography>
                          <Typography sx={{ color: '#B3B3B3', fontSize: { xs: '0.75rem', sm: '0.813rem' } }}>
                            • ${job.totalInvestment.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </Box>

        {/* Active Projects */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#FFFFFF',
              fontWeight: 600,
              mb: 2,
            }}
          >
            Active Jobs
          </Typography>
          <Box
            sx={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: 2,
            }}
          >
            <List sx={{ p: 0 }}>
              {active.length === 0 ? (
                <ListItem sx={{ p: 3 }}>
                  <Typography sx={{ color: '#666', fontSize: '0.875rem' }}>
                    No active jobs
                  </Typography>
                </ListItem>
              ) : (
                active.map((job, index) => (
                  <ListItem
                    key={job._id}
                    disablePadding
                    sx={{
                      borderBottom: index < active.length - 1 ? '1px solid #2A2A2A' : 'none',
                    }}
                  >
                    <ListItemButton
                      component={Link}
                      href={`/shopos/work-orders/${job._id}`}
                      sx={{
                        p: { xs: 2, sm: 3 },
                        '&:hover': {
                          background: '#0A0A0A',
                        },
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography
                              sx={{
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: { xs: '0.938rem', sm: '1rem' },
                                mb: 0.5,
                              }}
                            >
                              {job.customer ? `${job.customer.firstName} ${job.customer.lastName}` : job.customerName || 'Unknown'}
                            </Typography>
                            <Typography
                              sx={{
                                color: '#666',
                                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                              }}
                            >
                              {job.customer ? `${job.customer.city}, ${job.customer.state}` : job.customerAddress || ''}
                            </Typography>
                          </Box>
                          <Chip
                            label={job.status === 'in_progress' ? 'In Progress' : job.status === 'accepted' ? 'Accepted' : 'Scheduled'}
                            icon={job.status === 'in_progress' ? <PlayArrow sx={{ fontSize: 16 }} /> : <Schedule sx={{ fontSize: 16 }} />}
                            sx={{
                              background: job.status === 'in_progress' ? '#007AFF20' : job.status === 'accepted' ? '#34C75920' : '#FF950020',
                              color: job.status === 'in_progress' ? '#007AFF' : job.status === 'accepted' ? '#34C759' : '#FF9500',
                              border: 'none',
                              height: 28,
                              fontSize: '0.75rem',
                              '& .MuiChip-icon': {
                                color: job.status === 'in_progress' ? '#007AFF' : job.status === 'accepted' ? '#34C759' : '#FF9500',
                              },
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Typography sx={{ color: '#B3B3B3', fontSize: { xs: '0.75rem', sm: '0.813rem' } }}>
                            {job.jobNumber}
                          </Typography>
                          <Typography sx={{ color: '#B3B3B3', fontSize: { xs: '0.75rem', sm: '0.813rem' } }}>
                            • {job.startDate ? new Date(job.startDate).toLocaleDateString() : 'Not scheduled'}
                          </Typography>
                          <Typography sx={{ color: '#B3B3B3', fontSize: { xs: '0.75rem', sm: '0.813rem' } }}>
                            • ${job.totalInvestment.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </Box>

        {/* Completed Today */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: '#FFFFFF',
              fontWeight: 600,
              mb: 2,
            }}
          >
            Completed Today
          </Typography>
          <Box
            sx={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: 2,
            }}
          >
            <List sx={{ p: 0 }}>
              {completedToday.length === 0 ? (
                <ListItem sx={{ p: 3 }}>
                  <Typography sx={{ color: '#666', fontSize: '0.875rem' }}>
                    No projects completed today
                  </Typography>
                </ListItem>
              ) : (
                completedToday.map((job, index) => (
                  <ListItem
                    key={job._id}
                    disablePadding
                    sx={{
                      borderBottom: index < completedToday.length - 1 ? '1px solid #2A2A2A' : 'none',
                    }}
                  >
                    <ListItemButton
                      component={Link}
                      href={`/shopos/work-orders/${job._id}`}
                      sx={{
                        p: { xs: 2, sm: 3 },
                        '&:hover': {
                          background: '#0A0A0A',
                        },
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography
                              sx={{
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: { xs: '0.938rem', sm: '1rem' },
                                mb: 0.5,
                              }}
                            >
                              {job.customer ? `${job.customer.firstName} ${job.customer.lastName}` : job.customerName || 'Unknown'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Typography sx={{ color: '#666', fontSize: { xs: '0.75rem', sm: '0.813rem' } }}>
                                {job.jobNumber}
                              </Typography>
                              <Typography sx={{ color: '#666', fontSize: { xs: '0.75rem', sm: '0.813rem' } }}>
                                • {job.completedAt ? new Date(job.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          <CheckCircle sx={{ color: '#34C759', fontSize: 24 }} />
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
