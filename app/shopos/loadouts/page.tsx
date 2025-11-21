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
  IconButton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import { Id } from '@/convex/_generated/dataModel';
import LoadoutFormModal from '@/components/LoadoutFormModal';
import { useSnackbar } from '@/app/contexts/SnackbarContext';

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
            <Card key={loadout._id} sx={{ background: '#1C1C1E', border: '1px solid #2A2A2A' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 0.5 }}>
                      {loadout.name}
                    </Typography>
                    {loadout.description && (
                      <Typography variant="body2" sx={{ color: '#8E8E93', mb: 2 }}>
                        {loadout.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                          Total Hourly Cost
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#007AFF', fontWeight: 600 }}>
                          ${loadout.totalHourlyCost.toFixed(2)}/hr
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block' }}>
                          Employees ({loadout.employees.length})
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {loadout.employees.map((emp: any) => (
                            <Chip
                              key={emp._id}
                              label={emp.name}
                              size="small"
                              sx={{ background: '#2A2A2A', color: '#FFFFFF', fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block' }}>
                          Equipment ({loadout.equipment.length})
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {loadout.equipment.map((equip: any) => (
                            <Chip
                              key={equip._id}
                              label={equip.name}
                              size="small"
                              sx={{ background: '#2A2A2A', color: '#FFFFFF', fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => handleOpenForm(loadout)}
                      sx={{ color: '#007AFF', '&:hover': { background: 'rgba(0, 122, 255, 0.1)' } }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(loadout._id)}
                      sx={{ color: '#FF3B30', '&:hover': { background: 'rgba(255, 59, 48, 0.1)' } }}
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
