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
  const loadouts = useQuery(api.loadouts.listLoadouts);
  const createJob = useMutation(api.jobs.createJob);
  const deleteJob = useMutation(api.jobs.deleteJob);
  const { showError, showConfirm } = useSnackbar();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  // Helper to get display ID based on lifecycle stage
  const getDisplayId = (job: any) => {
    const stage = job.lifecycleStage || 'WO';
    const number = job.jobNumber.replace('WO-', '');
    return `${stage}-${number}`;
  };

  // Helper to get stage color
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      LE: '#6C6C70',  // Gray (Lead)
      PR: '#007AFF',  // Blue (Proposal)
      WO: '#FF9500',  // Orange (Work Order)
      IN: '#FF9500',  // Orange (Invoice)
      CO: '#34C759',  // Green (Complete)
    };
    return colors[stage] || '#8E8E93';
  };

  // Filter jobs by stage
  const filteredJobs = jobs?.filter(job => {
    if (stageFilter === 'ALL') return true;
    return (job.lifecycleStage || 'WO') === stageFilter;
  });

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
          mb: 3,
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

      {/* Stage Filter Tabs */}
      <Box sx={{
        display: 'flex',
        gap: 1,
        mb: 3,
        overflowX: 'auto',
        pb: 1,
      }}>
        {['ALL', 'LE', 'PR', 'WO', 'IN', 'CO'].map((stage) => {
          const count = stage === 'ALL'
            ? jobs?.length || 0
            : jobs?.filter(j => (j.lifecycleStage || 'WO') === stage).length || 0;
          const isActive = stageFilter === stage;

          const stageNames: Record<string, string> = {
            ALL: 'All',
            LE: 'Leads',
            PR: 'Proposals',
            WO: 'Work Orders',
            IN: 'Invoices',
            CO: 'Complete',
          };

          return (
            <Button
              key={stage}
              onClick={() => setStageFilter(stage)}
              sx={{
                minWidth: 'auto',
                px: 2,
                py: 0.75,
                background: isActive ? getStageColor(stage) : '#2A2A2A',
                color: isActive ? '#FFFFFF' : '#8E8E93',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  background: isActive ? getStageColor(stage) : '#333',
                },
              }}
            >
              {stageNames[stage]} ({count})
            </Button>
          );
        })}
      </Box>

      {filteredJobs && filteredJobs.length === 0 ? (
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
          {filteredJobs?.map((job) => {
            const customerName = job.customer
              ? `${job.customer?.firstName ?? ''} ${job.customer?.lastName ?? ''}`.trim() || 'Unknown Customer'
              : 'No Customer Assigned';
            const location = job.customer
              ? `${job.customer?.city ?? ''}, ${job.customer?.state ?? ''}`.replace(/^,\s*|,\s*$/g, '').trim()
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
                  showConfirm(
                    `Delete ${job.jobNumber}? This will permanently delete the project and all associated time logs, line items, and reports. This cannot be undone.`,
                    async () => {
                      try {
                        await deleteJob({ jobId: job._id });
                      } catch (error: any) {
                        showError(error.message);
                      }
                    },
                    'Delete Project'
                  );
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

            const displayId = getDisplayId(job);
            const stage = job.lifecycleStage || 'WO';
            const stageName = {
              LE: 'LEAD',
              PR: 'PROPOSAL',
              WO: 'WORK ORDER',
              IN: 'INVOICE',
              CO: 'COMPLETE',
            }[stage];

            return (
              <DirectoryCard
                key={job._id}
                id={job._id}
                icon={<AssignmentIcon />}
                title={displayId}
                subtitle={subtitle}
                badges={[
                  {
                    label: stageName,
                    color: getStageColor(stage),
                  },
                  {
                    label: job.status.replace('_', ' ').toUpperCase(),
                    color: getStatusColor(job.status),
                  },
                  ...(!job.customer ? [{
                    label: 'NO CUSTOMER',
                    color: '#FF9500', // warning orange
                  }] : []),
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
        loadouts={loadouts || []}
      />
    </Container>
  );
}
