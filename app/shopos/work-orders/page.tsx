'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import CreateWorkOrderModal from '@/components/CreateWorkOrderModal';

export default function WorkOrdersPage() {
  const router = useRouter();
  const jobs = useQuery(api.jobs.listJobs);
  const customers = useQuery(api.customers.listCustomers);
  const crews = useQuery(api.crews.listCrews);
  const createJob = useMutation(api.jobs.createJob);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'info';
      case 'accepted':
        return 'success';
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

  const handleCreateWorkOrder = async (data: any) => {
    try {
      const jobId = await createJob(data);
      setCreateModalOpen(false);
      router.push(`/shopos/work-orders/${jobId}`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (jobs === undefined) {
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
          sx={{
            background: '#007AFF',
            '&:hover': { background: '#0066DD' },
          }}
        >
          New Project
        </Button>
      </Box>

      {jobs.length === 0 ? (
        <Card
          sx={{
            background: '#1A1A1A',
            textAlign: 'center',
            py: 6,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#B3B3B3', mb: 2 }}>
              No projects yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Click "New Project" to get started
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {jobs.map((job) => (
            <Link
              key={job._id}
              href={`/shopos/work-orders/${job._id}`}
              style={{ textDecoration: 'none' }}
            >
              <Card
                sx={{
                  background: 'rgba(28, 28, 30, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 3,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'rgba(28, 28, 30, 0.9)',
                    borderColor: 'rgba(0, 122, 255, 0.4)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 122, 255, 0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: '#FFFFFF', fontWeight: 600, mb: 0.5 }}
                      >
                        {job.jobNumber}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#B3B3B3' }}>
                        {job.customer ? `${job.customer.firstName} ${job.customer.lastName}` : 'Unknown Customer'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                        {job.customer ? `${job.customer.city}, ${job.customer.state}` : ''}
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
                        Actual Hours
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: '#FFFFFF', fontWeight: 600 }}
                      >
                        {((job.actualProductiveHours || 0) + (job.actualSupportHours || 0)).toFixed(1)}h
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

      {/* Create Project Modal */}
      <CreateWorkOrderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateWorkOrder}
        customers={customers || []}
        crews={crews || []}
      />
    </Container>
  );
}
