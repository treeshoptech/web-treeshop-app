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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import { Id } from '@/convex/_generated/dataModel';
import LoadoutFormModal from '@/components/LoadoutFormModal';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import DirectoryCard from '@/components/DirectoryCard';

export default function LoadoutsPage() {
  const loadouts = useQuery(api.loadouts.listLoadouts);
  const deleteLoadout = useMutation(api.loadouts.deleteLoadout);
  const { showError, showConfirm } = useSnackbar();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleOpenForm = (item?: any) => {
    setEditingItem(item || null);
    setFormOpen(true);
  };

  const handleDelete = async (id: Id<'loadouts'>) => {
    showConfirm(
      'Delete this loadout? This cannot be undone.',
      async () => {
        try {
          await deleteLoadout({ loadoutId: id });
        } catch (error: any) {
          showError(error.message);
        }
      },
      'Delete Loadout'
    );
  };

  if (loadouts === undefined) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 42px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
          Loadouts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{ background: '#007AFF', '&:hover': { background: '#0066DD' } }}
        >
          New Loadout
        </Button>
      </Box>

      {loadouts.length === 0 ? (
        <Card sx={{ background: '#1C1C1E', border: '1px solid #2A2A2A', textAlign: 'center', py: 6 }}>
          <CardContent>
            <GroupsIcon sx={{ fontSize: 60, color: '#8E8E93', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#B3B3B3', fontWeight: 600, mb: 2 }}>
              No loadouts yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#8E8E93' }}>
              Create pre-configured resource groups for quick project setup
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {loadouts.map((loadout) => (
            <DirectoryCard
              key={loadout._id}
              id={loadout._id}
              icon={<GroupsIcon />}
              title={loadout.name}
              subtitle={loadout.description}
              collapsedMetrics={[
                {
                  label: 'Total Hourly Cost',
                  value: `$${loadout.totalHourlyCost.toFixed(2)}/hr`,
                  color: '#007AFF',
                },
                {
                  label: 'Members',
                  value: `${loadout.employees.length + loadout.equipment.length} total`,
                  color: '#8E8E93',
                },
              ]}
              expandedMetrics={[
                {
                  label: 'Total Hourly Cost',
                  value: `$${loadout.totalHourlyCost.toFixed(2)}/hr`,
                  color: '#007AFF',
                },
              ]}
              expandedDetails={[
                {
                  label: `Employees (${loadout.employees.length})`,
                  value: (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {loadout.employees.length > 0 ? (
                        loadout.employees.map((emp: any) => (
                          <Chip
                            key={emp._id}
                            label={emp.name}
                            size="small"
                            sx={{ background: '#2A2A2A', color: '#FFFFFF', fontSize: '0.7rem' }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                          No employees
                        </Typography>
                      )}
                    </Box>
                  ),
                  fullWidth: true,
                },
                {
                  label: `Equipment (${loadout.equipment.length})`,
                  value: (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {loadout.equipment.length > 0 ? (
                        loadout.equipment.map((equip: any) => (
                          <Chip
                            key={equip._id}
                            label={equip.name}
                            size="small"
                            sx={{ background: '#2A2A2A', color: '#FFFFFF', fontSize: '0.7rem' }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                          No equipment
                        </Typography>
                      )}
                    </Box>
                  ),
                  fullWidth: true,
                },
              ]}
              actions={[
                {
                  icon: <EditIcon />,
                  label: 'Edit',
                  onClick: () => handleOpenForm(loadout),
                  color: 'primary',
                },
                {
                  icon: <DeleteIcon />,
                  label: 'Delete',
                  onClick: () => handleDelete(loadout._id),
                  color: 'error',
                  divider: true,
                },
              ]}
            />
          ))}
        </Box>
      )}

      <LoadoutFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
      />
    </Container>
  );
}
