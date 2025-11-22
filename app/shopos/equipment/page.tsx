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
import BuildIcon from '@mui/icons-material/Build';
import { Id } from '@/convex/_generated/dataModel';
import EquipmentFormModal from '@/components/EquipmentFormModal';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import DirectoryCard from '@/components/DirectoryCard';

export default function EquipmentPage() {
  const equipment = useQuery(api.equipment.listEquipment);
  const createEquipment = useMutation(api.equipment.createEquipment);
  const updateEquipment = useMutation(api.equipment.updateEquipment);
  const deleteEquipment = useMutation(api.equipment.deleteEquipment);
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
      showError(error.message);
    }
  };

  const handleDelete = async (id: Id<'equipment'>) => {
    showConfirm(
      'Delete this equipment? This cannot be undone.',
      async () => {
        try {
          await deleteEquipment({ equipmentId: id });
        } catch (error: any) {
          showError(error.message);
        }
      },
      'Delete Equipment'
    );
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
            background: '#1C1C1E',
            border: '1px solid #2A2A2A',
            textAlign: 'center',
            py: 6,
          }}
        >
          <CardContent>
            <BuildIcon sx={{ fontSize: 60, color: '#8E8E93', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#B3B3B3', fontWeight: 600, mb: 2 }}>
              No equipment yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#8E8E93' }}>
              Click "Add Equipment" to create your first equipment record
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {equipment.map((item) => (
            <DirectoryCard
              key={item._id}
              id={item._id}
              icon={<BuildIcon />}
              title={item.name}
              subtitle={item.type}
              badges={[
                {
                  label: item.type,
                  color: '#007AFF',
                },
                ...(!item.isActive
                  ? [
                      {
                        label: 'Inactive',
                        color: '#666',
                      },
                    ]
                  : []),
              ]}
              collapsedMetrics={[
                {
                  label: 'Cost/Hour',
                  value: `$${item.hourlyCost.toFixed(2)}`,
                  color: '#007AFF',
                },
              ]}
              expandedMetrics={[
                {
                  label: 'Depreciation',
                  value: `$${(item.hourlyDepreciation || 0).toFixed(2)}`,
                  color: '#FFFFFF',
                },
                {
                  label: 'Fuel',
                  value: `$${(item.hourlyFuel || 0).toFixed(2)}`,
                  color: '#FFFFFF',
                },
                {
                  label: 'Maintenance',
                  value: `$${(item.hourlyMaintenance || 0).toFixed(2)}`,
                  color: '#FFFFFF',
                },
                {
                  label: 'Total Cost/Hour',
                  value: `$${item.hourlyCost.toFixed(2)}`,
                  color: '#007AFF',
                },
              ]}
              expandedDetails={[
                {
                  label: 'Purchase Price',
                  value: `$${(item.purchasePrice || 0).toLocaleString()}`,
                },
                {
                  label: 'Useful Life',
                  value: `${item.usefulLifeYears || 0} years`,
                },
                {
                  label: 'Fuel Consumption',
                  value: `${item.fuelConsumptionPerHour || 0} gal/hr`,
                },
                {
                  label: 'Annual Operating Hours',
                  value: `${item.annualOperatingHours || 0}`,
                },
              ]}
              notes={item.notes}
              actions={[
                {
                  icon: <EditIcon />,
                  label: 'Edit',
                  onClick: () => handleOpenForm(item),
                  color: 'primary',
                },
                {
                  icon: <DeleteIcon />,
                  label: 'Delete',
                  onClick: () => handleDelete(item._id),
                  color: 'error',
                  divider: true,
                },
              ]}
            />
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
