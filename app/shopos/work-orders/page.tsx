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
  Button,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateWorkOrderModal from '@/components/CreateWorkOrderModal';
import DirectoryCard from '@/components/DirectoryCard';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import type { ActionItem, DetailField } from '@/components/DirectoryCard';

export default function WorkOrdersPage() {
  const router = useRouter();
  const jobs = useQuery(api.jobs.listJobs);
  const customers = useQuery(api.customers.listCustomers);
  const crews = useQuery(api.crews.listCrews);
  const createJob = useMutation(api.jobs.createJob);
  const { showError } = useSnackbar();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#6C6C70'; // gray
      case 'sent':
        return '#007AFF'; // blue
      case 'accepted':
        return '#34C759'; // green
      case 'scheduled':
        return '#007AFF'; // blue
      case 'in_progress':
        return '#FF9500'; // orange
      case 'completed':
        return '#34C759'; // green
      case 'cancelled':
        return '#FF3B30'; // red
      default:
        return '#6C6C70'; // gray
    }
  };

  const handleCreateWorkOrder = async (data: any) => {
    try {
      const jobId = await createJob(data);
      setCreateModalOpen(false);
      router.push(`/shopos/work-orders/${jobId}`);
    } catch (error: any) {
      showError(error.message);
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
            background: '#1C1C1E',
            border: '1px solid #2A2A2A',
            textAlign: 'center',
            py: 6,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#B3B3B3', fontWeight: 600, mb: 2 }}>
              No projects yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#8E8E93' }}>
              Click "New Project" to get started
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {jobs.map((job) => {
            const customerName = job.customer
              ? `${job.customer.firstName} ${job.customer.lastName}`
              : 'Unknown Customer';
            const location = job.customer
              ? `${job.customer.city}, ${job.customer.state}`
              : '';
            const subtitle = location ? `${customerName} • ${location}` : customerName;

            const actions: ActionItem[] = [
              {
                icon: <EditIcon />,
                label: 'Edit',
                onClick: () => router.push(`/shopos/work-orders/${job._id}`),
                color: 'primary',
              },
              {
                icon: <VisibilityIcon />,
                label: 'View Details',
                onClick: () => router.push(`/shopos/work-orders/${job._id}`),
                color: 'default',
              },
              {
                icon: <DeleteIcon />,
                label: 'Delete',
                onClick: () => {
                  // TODO: Implement delete functionality
                  showError('Delete functionality not yet implemented');
                },
                color: 'error',
                divider: true,
              },
            ];

            const expandedDetails: DetailField[] = [
              { label: 'Job Number', value: job.jobNumber },
              { label: 'Status', value: job.status.replace('_', ' ').toUpperCase() },
              { label: 'Customer', value: customerName },
              { label: 'Location', value: location || 'N/A' },
              { label: 'Estimated Hours', value: `${job.estimatedTotalHours.toFixed(1)}h` },
              {
                label: 'Actual Hours',
                value: `${((job.actualProductiveHours || 0) + (job.actualSupportHours || 0)).toFixed(1)}h`
              },
              { label: 'Total Investment', value: `$${job.totalInvestment.toLocaleString()}` },
              {
                label: 'Productive Hours',
                value: `${(job.actualProductiveHours || 0).toFixed(1)}h`
              },
              {
                label: 'Support Hours',
                value: `${(job.actualSupportHours || 0).toFixed(1)}h`
              },
            ];

            return (
              <DirectoryCard
                key={job._id}
                id={job._id}
                icon={<AssignmentIcon />}
                title={job.jobNumber}
                subtitle={subtitle}
                badges={[
                  {
                    label: job.status.replace('_', ' ').toUpperCase(),
                    color: getStatusColor(job.status),
                  },
                ]}
                collapsedMetrics={[
                  {
                    label: 'Estimated Hours',
                    value: `${job.estimatedTotalHours.toFixed(1)}h`,
                    color: '#8E8E93',
                  },
                  {
                    label: 'Actual Hours',
                    value: `${((job.actualProductiveHours || 0) + (job.actualSupportHours || 0)).toFixed(1)}h`,
                    color: '#FFFFFF',
                  },
                  {
                    label: 'Total Investment',
                    value: `$${job.totalInvestment.toLocaleString()}`,
                    color: '#007AFF',
                  },
                ]}
                expandedDetails={expandedDetails}
                actions={actions}
                onCardClick={() => router.push(`/shopos/work-orders/${job._id}`)}
              />
            );
          })}
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
