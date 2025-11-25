'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import { Doc, Id } from '@/convex/_generated/dataModel';
import EmployeeFormModal from '@/components/EmployeeFormModal';
import DirectoryCard, { ActionItem, MetricItem, DetailField } from '@/components/DirectoryCard';
import { useSnackbar } from '@/app/contexts/SnackbarContext';

export default function EmployeesPage() {
  const employees = useQuery(api.employees.listEmployees);
  const createEmployee = useMutation(api.employees.createEmployee);
  const updateEmployee = useMutation(api.employees.updateEmployee);
  const deleteEmployee = useMutation(api.employees.deleteEmployee);
  const { showError, showConfirm } = useSnackbar();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Doc<'employees'> | null>(null);

  const handleOpenForm = (item?: Doc<'employees'>) => {
    setEditingItem(item || null);
    setFormOpen(true);
  };

  const handleSubmit = async (data: {
    name: string;
    position?: string;
    qualificationCode?: string;
    tierLevel?: number;
    burdenMultiplier?: number;
    hasLeadership?: boolean;
    hasSupervisor?: boolean;
    hasCDL?: boolean;
    hasCrane?: boolean;
    hasOSHA?: boolean;
  }) => {
    try {
      if (editingItem) {
        await updateEmployee({
          employeeId: editingItem._id,
          ...data,
          isActive: true,
        });
      } else {
        await createEmployee(data);
      }
      setFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: Id<'employees'>) => {
    showConfirm(
      'Delete this employee? This cannot be undone.',
      async () => {
        try {
          await deleteEmployee({ employeeId: id });
        } catch (error) {
          showError(error instanceof Error ? error.message : 'An error occurred');
        }
      },
      'Delete Employee'
    );
  };

  const handleDeactivate = async (emp: Doc<'employees'>) => {
    showConfirm(
      `${emp.isActive ? 'Deactivate' : 'Activate'} ${emp.name}?`,
      async () => {
        try {
          await updateEmployee({
            employeeId: emp._id,
            name: emp.name,
            position: emp.position,
            qualificationCode: emp.qualificationCode,
            tierLevel: emp.tierLevel,
            burdenMultiplier: emp.burdenMultiplier,
            hasLeadership: emp.hasLeadership,
            hasSupervisor: emp.hasSupervisor,
            hasCDL: emp.hasCDL,
            hasCrane: emp.hasCrane,
            hasOSHA: emp.hasOSHA,
            isActive: !emp.isActive,
          });
        } catch (error) {
          showError(error instanceof Error ? error.message : 'An error occurred');
        }
      },
      `${emp.isActive ? 'Deactivate' : 'Activate'} Employee`
    );
  };

  if (employees === undefined) {
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
          Employees
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            sx={{
              background: '#007AFF',
              '&:hover': { background: '#0066DD' },
            }}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      {employees.length === 0 ? (
        <Card
          sx={{
            background: '#1C1C1E',
            border: '1px solid #2A2A2A',
            textAlign: 'center',
            py: 6,
          }}
        >
          <CardContent>
            <PersonIcon sx={{ fontSize: 60, color: '#8E8E93', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#B3B3B3', fontWeight: 600, mb: 2 }}>
              No employees yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#8E8E93' }}>
              Click &quot;Add Employee&quot; to create your first employee record
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {employees.map((emp) => {
            // Build badges array
            const badges = [];
            if (emp.qualificationCode) {
              badges.push({
                label: emp.qualificationCode,
                color: '#007AFF',
              });
            }
            if (!emp.isActive) {
              badges.push({
                label: 'Inactive',
                color: '#666',
              });
            }

            // Collapsed metrics (Cost/Hour)
            const collapsedMetrics: MetricItem[] = [
              {
                label: 'Cost/Hour',
                value: `$${(emp.effectiveRate ?? 0).toFixed(2)}`,
                color: '#007AFF',
              },
            ];

            // Expanded metrics (Base Rate, Qualification Rate, Burden, Effective Rate)
            const expandedMetrics: MetricItem[] = [];

            if (emp.tierLevel) {
              expandedMetrics.push({
                label: 'Tier Level',
                value: `T${emp.tierLevel}`,
                color: '#B3B3B3',
              });
            }

            if (emp.burdenMultiplier) {
              expandedMetrics.push({
                label: 'Burden',
                value: `${(emp.burdenMultiplier ?? 0).toFixed(1)}x`,
                color: '#B3B3B3',
              });
            }

            expandedMetrics.push({
              label: 'Effective Rate',
              value: `$${(emp.effectiveRate ?? 0).toFixed(2)}`,
              color: '#007AFF',
            });

            // Expanded details (Certifications)
            const expandedDetails: DetailField[] = [];

            const certifications = [];
            if (emp.hasLeadership) certifications.push('Leadership');
            if (emp.hasSupervisor) certifications.push('Supervisor');
            if (emp.hasCDL) certifications.push('CDL');
            if (emp.hasCrane) certifications.push('Crane');
            if (emp.hasOSHA) certifications.push('OSHA');

            if (certifications.length > 0) {
              expandedDetails.push({
                label: 'Certifications',
                value: certifications.join(', '),
                fullWidth: true,
              });
            } else {
              expandedDetails.push({
                label: 'Certifications',
                value: 'None',
                fullWidth: true,
              });
            }

            // Actions
            const actions: ActionItem[] = [
              {
                icon: <EditIcon />,
                label: 'Edit',
                onClick: () => handleOpenForm(emp),
                color: 'primary',
              },
              {
                icon: <BlockIcon />,
                label: emp.isActive ? 'Deactivate' : 'Activate',
                onClick: () => handleDeactivate(emp),
                color: 'default',
              },
              {
                icon: <DeleteIcon />,
                label: 'Delete',
                onClick: () => handleDelete(emp._id),
                color: 'error',
                divider: true,
              },
            ];

            return (
              <DirectoryCard
                key={emp._id}
                id={emp._id}
                icon={<PersonIcon />}
                title={emp.name}
                subtitle={emp.position || undefined}
                badges={badges}
                collapsedMetrics={collapsedMetrics}
                expandedMetrics={expandedMetrics}
                expandedDetails={expandedDetails}
                actions={actions}
              />
            );
          })}
        </Box>
      )}

      {/* Add/Edit Employee Modal */}
      <EmployeeFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingItem ?? undefined}
        isEditing={!!editingItem}
      />
    </Container>
  );
}
