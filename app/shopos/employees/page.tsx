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
  Chip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { Id } from '@/convex/_generated/dataModel';
import EmployeeFormModal from '@/components/EmployeeFormModal';
import { useSnackbar } from '@/app/contexts/SnackbarContext';

export default function EmployeesPage() {
  const employees = useQuery(api.employees.listEmployees);
  const createEmployee = useMutation(api.employees.createEmployee);
  const updateEmployee = useMutation(api.employees.updateEmployee);
  const deleteEmployee = useMutation(api.employees.deleteEmployee);
  const { showError, showConfirm } = useSnackbar();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleOpenForm = (item?: any) => {
    setEditingItem(item || null);
    setFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
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
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleDelete = async (id: Id<'employees'>) => {
    showConfirm(
      'Delete this employee? This cannot be undone.',
      async () => {
        try {
          await deleteEmployee({ employeeId: id });
        } catch (error: any) {
          showError(error.message);
        }
      },
      'Delete Employee'
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
              Click "Add Employee" to create your first employee record
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {employees.map((emp) => (
            <Card
              key={emp._id}
              sx={{
                background: '#1C1C1E',
                border: '1px solid #2A2A2A',
                transition: 'all 0.2s ease',
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
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: '#FFFFFF', fontWeight: 600 }}
                      >
                        {emp.name}
                      </Typography>
                      {emp.qualificationCode && (
                        <Chip
                          label={emp.qualificationCode}
                          size="small"
                          sx={{
                            background: '#007AFF',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                      {!emp.isActive && (
                        <Chip
                          label="Inactive"
                          size="small"
                          sx={{
                            background: '#666',
                            color: '#FFFFFF',
                          }}
                        />
                      )}
                    </Box>

                    {emp.position && (
                      <Typography variant="body2" sx={{ color: '#8E8E93', mb: 1 }}>
                        {emp.position}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 4, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block', mb: 0.5 }}>
                          Cost/Hour
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ color: '#007AFF', fontWeight: 600 }}
                        >
                          ${emp.effectiveRate.toFixed(2)}
                        </Typography>
                      </Box>
                      {emp.tierLevel && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block', mb: 0.5 }}>
                            Tier
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                            T{emp.tierLevel}
                          </Typography>
                        </Box>
                      )}
                      {emp.burdenMultiplier && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block', mb: 0.5 }}>
                            Burden
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                            {emp.burdenMultiplier.toFixed(1)}x
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => handleOpenForm(emp)}
                      sx={{
                        color: '#007AFF',
                        '&:hover': { background: 'rgba(0, 122, 255, 0.1)' },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(emp._id)}
                      sx={{
                        color: '#FF3B30',
                        '&:hover': { background: 'rgba(255, 59, 48, 0.1)' },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
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
        initialData={editingItem}
        isEditing={!!editingItem}
      />
    </Container>
  );
}
