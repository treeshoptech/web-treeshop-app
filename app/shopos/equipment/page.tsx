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
import BuildIcon from '@mui/icons-material/Build';
import { Id } from '@/convex/_generated/dataModel';
import EquipmentFormModal from '@/components/EquipmentFormModal';

export default function EquipmentPage() {
  const equipment = useQuery(api.equipment.listEquipment);
  const createEquipment = useMutation(api.equipment.createEquipment);
  const updateEquipment = useMutation(api.equipment.updateEquipment);
  const deleteEquipment = useMutation(api.equipment.deleteEquipment);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleOpenForm = (item?: any) => {
    setEditingItem(item || null);
    setFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingItem) {
        await updateEquipment({
          equipmentId: editingItem._id,
          ...data,
          isActive: true,
        });
      } else {
        await createEquipment(data);
      }
      setFormOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: Id<'equipment'>) => {
    if (!confirm('Delete this equipment? This cannot be undone.')) return;

    try {
      await deleteEquipment({ equipmentId: id });
    } catch (error: any) {
      alert(error.message);
    }
  };


  if (equipment === undefined) {
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
          Equipment
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
            Add Equipment
          </Button>
        </Box>
      </Box>

      {equipment.length === 0 ? (
        <Card
          sx={{
            background: '#1A1A1A',
            textAlign: 'center',
            py: 6,
          }}
        >
          <CardContent>
            <BuildIcon sx={{ fontSize: 60, color: '#666', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#B3B3B3', mb: 2 }}>
              No equipment yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Click "Add Equipment" to create your first equipment record
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {equipment.map((item) => (
            <Card
              key={item._id}
              sx={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                transition: 'all 0.2s',
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
                        {item.name}
                      </Typography>
                      <Chip
                        label={item.type}
                        size="small"
                        sx={{
                          background: '#007AFF',
                          color: '#FFFFFF',
                          fontWeight: 600,
                        }}
                      />
                      {!item.isActive && (
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

                    <Box sx={{ display: 'flex', gap: 4, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                          Cost/Hour
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ color: '#007AFF', fontWeight: 600 }}
                        >
                          ${item.hourlyCost.toFixed(2)}
                        </Typography>
                      </Box>
                      {item.hourlyDepreciation !== undefined && (
                        <>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                              Depreciation
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                              ${item.hourlyDepreciation.toFixed(2)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                              Fuel
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                              ${item.hourlyFuel?.toFixed(2) || '0.00'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                              Maintenance
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                              ${item.hourlyMaintenance?.toFixed(2) || '0.00'}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => handleOpenForm(item)}
                      sx={{
                        color: '#007AFF',
                        '&:hover': { background: 'rgba(0, 122, 255, 0.1)' },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(item._id)}
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

      {/* Add/Edit Equipment Modal */}
      <EquipmentFormModal
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
