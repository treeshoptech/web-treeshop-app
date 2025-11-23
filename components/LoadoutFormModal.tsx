'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Divider,
} from '@mui/material';
import { Id } from '@/convex/_generated/dataModel';
import { useSnackbar } from '@/app/contexts/SnackbarContext';

interface LoadoutFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function LoadoutFormModal({
  open,
  onClose,
  initialData,
}: LoadoutFormModalProps) {
  const employees = useQuery(api.employees.listEmployees);
  const equipment = useQuery(api.equipment.listEquipment);
  const createLoadout = useMutation(api.loadouts.createLoadout);
  const updateLoadout = useMutation(api.loadouts.updateLoadout);
  const { showError } = useSnackbar();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Id<'employees'>[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<Id<'equipment'>[]>([]);

  // Production rate fields (ALL in points per hour)
  const [mulchingRate, setMulchingRate] = useState('1.5');
  const [stumpRate, setStumpRate] = useState('1.8');
  const [treeRemovalRate, setTreeRemovalRate] = useState('1.2');
  const [landClearingRate, setLandClearingRate] = useState('1.3');
  const [treeTrimmingRate, setTreeTrimmingRate] = useState('1.0');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setSelectedEmployeeIds(initialData.employeeIds || []);
      setSelectedEquipmentIds(initialData.equipmentIds || []);

      // Load production rates if they exist
      const rates = initialData.productionRates || [];
      const mulching = rates.find((r: any) => r.serviceType === 'forestry_mulching');
      const stump = rates.find((r: any) => r.serviceType === 'stump_grinding');
      const treeRemoval = rates.find((r: any) => r.serviceType === 'tree_removal');
      const landClearing = rates.find((r: any) => r.serviceType === 'land_clearing');
      const treeTrimming = rates.find((r: any) => r.serviceType === 'tree_trimming');

      setMulchingRate(mulching?.actualRatePerDay?.toString() || '');
      setStumpRate(stump?.actualRatePerDay?.toString() || '');
      setTreeRemovalRate(treeRemoval?.actualRatePerDay?.toString() || '');
      setLandClearingRate(landClearing?.actualRatePerDay?.toString() || '');
      setTreeTrimmingRate(treeTrimming?.actualRatePerDay?.toString() || '');
    } else {
      setName('');
      setDescription('');
      setSelectedEmployeeIds([]);
      setSelectedEquipmentIds([]);
      setMulchingRate('1.5');
      setStumpRate('1.8');
      setTreeRemovalRate('1.2');
      setLandClearingRate('1.3');
      setTreeTrimmingRate('1.0');
    }
  }, [initialData, open]);

  const calculateTotalCost = () => {
    const employeeCost = selectedEmployeeIds.reduce((sum, id) => {
      const emp = employees?.find(e => e._id === id);
      return sum + (emp?.effectiveRate || 0);
    }, 0);

    const equipmentCost = selectedEquipmentIds.reduce((sum, id) => {
      const equip = equipment?.find(e => e._id === id);
      return sum + (equip?.hourlyCost || 0);
    }, 0);

    return employeeCost + equipmentCost;
  };

  const handleSubmit = async () => {
    if (!name) {
      showError('Please enter a loadout name');
      return;
    }

    if (selectedEmployeeIds.length === 0 && selectedEquipmentIds.length === 0) {
      showError('Please select at least one employee or equipment');
      return;
    }

    const hasAtLeastOneRate =
      mulchingRate ||
      stumpRate ||
      treeRemovalRate ||
      landClearingRate ||
      treeTrimmingRate;

    if (!hasAtLeastOneRate) {
      showError('Please set at least one production rate');
      return;
    }

    try {
      const rateData = {
        mulchingRate: parseFloat(mulchingRate) || undefined,
        stumpRate: parseFloat(stumpRate) || undefined,
        treeRemovalRate: parseFloat(treeRemovalRate) || undefined,
        landClearingRate: parseFloat(landClearingRate) || undefined,
        treeTrimmingRate: parseFloat(treeTrimmingRate) || undefined,
      };

      if (initialData) {
        await updateLoadout({
          loadoutId: initialData._id,
          name,
          description: description || undefined,
          employeeIds: selectedEmployeeIds,
          equipmentIds: selectedEquipmentIds,
          ...rateData,
        });
      } else {
        await createLoadout({
          name,
          description: description || undefined,
          employeeIds: selectedEmployeeIds,
          equipmentIds: selectedEquipmentIds,
          ...rateData,
        });
      }
      onClose();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const totalCost = calculateTotalCost();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ color: '#FFFFFF', borderBottom: '1px solid #2A2A2A' }}>
        {initialData ? 'Edit Loadout' : 'Create New Loadout'}
      </DialogTitle>

      <DialogContent sx={{ pt: 3, maxHeight: '70vh', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="Loadout Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Mulching Crew A"
            sx={{
              '& .MuiInputLabel-root': { color: '#B3B3B3' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
              '& .MuiOutlinedInput-root': {
                color: '#FFFFFF',
                '& fieldset': { borderColor: '#2A2A2A' },
                '&:hover fieldset': { borderColor: '#007AFF' },
                '&.Mui-focused fieldset': { borderColor: '#007AFF' },
              },
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            sx={{
              '& .MuiInputLabel-root': { color: '#B3B3B3' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
              '& .MuiOutlinedInput-root': {
                color: '#FFFFFF',
                '& fieldset': { borderColor: '#2A2A2A' },
                '&:hover fieldset': { borderColor: '#007AFF' },
                '&.Mui-focused fieldset': { borderColor: '#007AFF' },
              },
            }}
          />

          <FormControl fullWidth>
            <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
              Employees
            </InputLabel>
            <Select
              multiple
              value={selectedEmployeeIds}
              onChange={(e) => setSelectedEmployeeIds(e.target.value as Id<'employees'>[])}
              input={<OutlinedInput label="Employees" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const emp = employees?.find(e => e._id === value);
                    return (
                      <Chip
                        key={value}
                        label={emp?.name}
                        size="small"
                        sx={{ background: '#2A2A2A', color: '#FFFFFF' }}
                      />
                    );
                  })}
                </Box>
              )}
              sx={{
                color: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '& .MuiSvgIcon-root': { color: '#FFFFFF' },
              }}
            >
              {employees?.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.name} - ${(emp.effectiveRate || 0).toFixed(2)}/hr
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
              Equipment
            </InputLabel>
            <Select
              multiple
              value={selectedEquipmentIds}
              onChange={(e) => setSelectedEquipmentIds(e.target.value as Id<'equipment'>[])}
              input={<OutlinedInput label="Equipment" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const equip = equipment?.find(e => e._id === value);
                    return (
                      <Chip
                        key={value}
                        label={equip?.name}
                        size="small"
                        sx={{ background: '#2A2A2A', color: '#FFFFFF' }}
                      />
                    );
                  })}
                </Box>
              )}
              sx={{
                color: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '& .MuiSvgIcon-root': { color: '#FFFFFF' },
              }}
            >
              {equipment?.map((equip) => (
                <MenuItem key={equip._id} value={equip._id}>
                  {equip.name} - ${equip.hourlyCost.toFixed(2)}/hr
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          <Box>
            <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, mb: 1.5, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              PRODUCTION RATES *
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 2 }}>
              At least one rate required. Auto-updates from job performance.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Forestry Mulching"
                type="number"
                value={mulchingRate}
                onChange={(e) => setMulchingRate(e.target.value)}
                placeholder="1.5"
                helperText="pts/hr"
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: '#B3B3B3' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: '#2A2A2A' },
                    '&:hover fieldset': { borderColor: '#007AFF' },
                    '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                  },
                  '& .MuiFormHelperText-root': { color: '#666', fontSize: '0.7rem' },
                }}
              />

              <TextField
                fullWidth
                label="Stump Grinding"
                type="number"
                value={stumpRate}
                onChange={(e) => setStumpRate(e.target.value)}
                placeholder="1.8"
                helperText="pts/hr"
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: '#B3B3B3' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: '#2A2A2A' },
                    '&:hover fieldset': { borderColor: '#007AFF' },
                    '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                  },
                  '& .MuiFormHelperText-root': { color: '#666', fontSize: '0.7rem' },
                }}
              />

              <TextField
                fullWidth
                label="Tree Removal"
                type="number"
                value={treeRemovalRate}
                onChange={(e) => setTreeRemovalRate(e.target.value)}
                placeholder="1.2"
                helperText="pts/hr"
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: '#B3B3B3' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: '#2A2A2A' },
                    '&:hover fieldset': { borderColor: '#007AFF' },
                    '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                  },
                  '& .MuiFormHelperText-root': { color: '#666', fontSize: '0.7rem' },
                }}
              />

              <TextField
                fullWidth
                label="Land Clearing"
                type="number"
                value={landClearingRate}
                onChange={(e) => setLandClearingRate(e.target.value)}
                placeholder="1.3"
                helperText="pts/hr"
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: '#B3B3B3' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: '#2A2A2A' },
                    '&:hover fieldset': { borderColor: '#007AFF' },
                    '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                  },
                  '& .MuiFormHelperText-root': { color: '#666', fontSize: '0.7rem' },
                }}
              />

              <TextField
                fullWidth
                label="Tree Trimming"
                type="number"
                value={treeTrimmingRate}
                onChange={(e) => setTreeTrimmingRate(e.target.value)}
                placeholder="1.0"
                helperText="pts/hr"
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: '#B3B3B3' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: '#2A2A2A' },
                    '&:hover fieldset': { borderColor: '#007AFF' },
                    '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                  },
                  '& .MuiFormHelperText-root': { color: '#666', fontSize: '0.7rem' },
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          <Box
            sx={{
              p: 2,
              background: '#0A0A0A',
              border: '1px solid #2A2A2A',
              borderRadius: 1,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                Total Hourly Cost
              </Typography>
              <Typography variant="h6" sx={{ color: '#007AFF', fontWeight: 600 }}>
                ${totalCost.toFixed(2)}/hr
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1.5, borderTop: '1px solid #2A2A2A' }}>
        <Button
          onClick={onClose}
          size="large"
          sx={{
            color: '#B3B3B3',
            textTransform: 'none',
            px: 3,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#FFFFFF',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          size="large"
          sx={{
            background: '#007AFF',
            textTransform: 'none',
            px: 4,
            fontWeight: 600,
            '&:hover': { background: '#0066DD' },
          }}
        >
          {initialData ? 'Update' : 'Create'} Loadout
        </Button>
      </DialogActions>
    </Dialog>
  );
}
