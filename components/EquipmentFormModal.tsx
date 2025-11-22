'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  MenuItem,
} from '@mui/material';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface EquipmentFormData {
  name: string;
  categoryId: string;
  typeId: string;
  purchasePrice: string;
  usefulLifeYears: string;
  salvageValuePercent: string;
  annualOperatingHours: string;
  fuelConsumptionPerHour: string;
  annualMaintenanceCost: string;
  annualOtherCosts: string;
  notes: string;
}

interface EquipmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEditing: boolean;
}

export default function EquipmentFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: EquipmentFormModalProps) {
  const { showError } = useSnackbar();

  // Fetch equipment categories and types
  const categories = useQuery(api.equipmentCategories.listCategories) || [];
  const allTypes = useQuery(api.equipmentTypes.listAllTypes) || [];
  const company = useQuery(api.companies.getCompany);

  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    categoryId: '',
    typeId: '',
    purchasePrice: '',
    usefulLifeYears: '5',
    salvageValuePercent: '20',
    annualOperatingHours: '1500',
    fuelConsumptionPerHour: '',
    annualMaintenanceCost: '',
    annualOtherCosts: '',
    notes: '',
  });

  // Filter types based on selected category
  const filteredTypes = formData.categoryId
    ? allTypes.filter((t: any) => t.categoryId === formData.categoryId)
    : [];

  // Get org fuel price (default to 3.50 if not set)
  const orgFuelPrice = company?.defaultFuelPricePerGallon || 3.50;

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      const salvagePercent = initialData.purchasePrice > 0
        ? ((initialData.salvageValue / initialData.purchasePrice) * 100).toFixed(0)
        : '20';

      setFormData({
        name: initialData.name,
        categoryId: initialData.categoryId || '',
        typeId: initialData.typeId || '',
        purchasePrice: initialData.purchasePrice.toString(),
        usefulLifeYears: initialData.usefulLifeYears.toString(),
        salvageValuePercent: salvagePercent,
        annualOperatingHours: initialData.annualOperatingHours.toString(),
        fuelConsumptionPerHour: initialData.fuelConsumptionPerHour.toString(),
        annualMaintenanceCost: initialData.annualMaintenanceCost.toString(),
        annualOtherCosts: initialData.annualOtherCosts?.toString() || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  // Calculate costs in real-time (using org fuel price)
  const calculateCosts = () => {
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const usefulLifeYears = parseFloat(formData.usefulLifeYears) || 1;
    const salvagePercent = parseFloat(formData.salvageValuePercent) || 0;
    const salvageValue = purchasePrice * (salvagePercent / 100);
    const annualOperatingHours = parseFloat(formData.annualOperatingHours) || 1;
    const fuelConsumption = parseFloat(formData.fuelConsumptionPerHour) || 0;
    const annualMaintenance = parseFloat(formData.annualMaintenanceCost) || 0;
    const annualOther = parseFloat(formData.annualOtherCosts) || 0;

    // Calculations (using org fuel price)
    const annualDepreciation = (purchasePrice - salvageValue) / usefulLifeYears;
    const hourlyDepreciation = annualDepreciation / annualOperatingHours;
    const hourlyFuel = fuelConsumption * orgFuelPrice;
    const hourlyMaintenance = annualMaintenance / annualOperatingHours;
    const hourlyOther = annualOther / annualOperatingHours;
    const hourlyCostBeforeOverhead = hourlyDepreciation + hourlyFuel + hourlyMaintenance + hourlyOther;
    const hourlyCost = hourlyCostBeforeOverhead * 1.15; // 15% overhead

    return {
      salvageValue,
      hourlyDepreciation,
      hourlyFuel,
      hourlyMaintenance,
      hourlyOther,
      hourlyCostBeforeOverhead,
      hourlyCost,
    };
  };

  const costs = calculateCosts();

  const handleSubmit = () => {
    if (!formData.name || !formData.categoryId || !formData.typeId || !formData.purchasePrice) {
      showError('Please fill in required fields (Name, Category, Type, Purchase Price)');
      return;
    }

    const purchasePrice = parseFloat(formData.purchasePrice);
    const salvagePercent = parseFloat(formData.salvageValuePercent) || 20;
    const salvageValue = purchasePrice * (salvagePercent / 100);

    onSubmit({
      name: formData.name,
      categoryId: formData.categoryId,
      typeId: formData.typeId,
      purchasePrice,
      usefulLifeYears: parseFloat(formData.usefulLifeYears) || 5,
      salvageValue,
      annualOperatingHours: parseFloat(formData.annualOperatingHours) || 1500,
      fuelConsumptionPerHour: parseFloat(formData.fuelConsumptionPerHour) || 0,
      fuelPricePerGallon: orgFuelPrice, // Use org fuel price
      annualMaintenanceCost: parseFloat(formData.annualMaintenanceCost) || 0,
      annualOtherCosts: parseFloat(formData.annualOtherCosts) || 0,
      overheadMultiplier: 1.15,
      notes: formData.notes || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
        },
      }}
    >
      <DialogTitle sx={{ color: '#FFFFFF', borderBottom: '1px solid #2A2A2A' }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            {isEditing ? 'Edit Equipment' : 'Add New Equipment'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Army Corps of Engineers Cost Calculation Method
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, maxHeight: '70vh', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Basic Info */}
          <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 600 }}>
            BASIC INFORMATION
          </Typography>

          <TextField
            fullWidth
            label="Equipment Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Forestry Mulcher #2"
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

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Category *"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, typeId: '' })}
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
            >
              {categories.map((category: any) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Type *"
              value={formData.typeId}
              onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
              disabled={!formData.categoryId}
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
            >
              {filteredTypes.map((type: any) => (
                <MenuItem key={type._id} value={type._id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          {/* Financial Data */}
          <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 600 }}>
            FINANCIAL DATA
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Purchase Price *"
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              placeholder="165000"
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
              label="Useful Life (years)"
              type="number"
              value={formData.usefulLifeYears}
              onChange={(e) => setFormData({ ...formData, usefulLifeYears: e.target.value })}
              placeholder="5"
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
              label="Auction Price %"
              type="number"
              value={formData.salvageValuePercent}
              onChange={(e) => setFormData({ ...formData, salvageValuePercent: e.target.value })}
              placeholder="20"
              helperText={`$${costs.salvageValue.toFixed(0)} auction value`}
              sx={{
                '& .MuiInputLabel-root': { color: '#B3B3B3' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: '#2A2A2A' },
                  '&:hover fieldset': { borderColor: '#007AFF' },
                  '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                },
                '& .MuiFormHelperText-root': { color: '#666' },
              }}
            />

            <TextField
              label="Annual Operating Hours"
              type="number"
              value={formData.annualOperatingHours}
              onChange={(e) => setFormData({ ...formData, annualOperatingHours: e.target.value })}
              placeholder="1500"
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
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          {/* Fuel Costs */}
          <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 600 }}>
            FUEL COSTS
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Fuel Consumption (gal/hr)"
              type="number"
              inputProps={{ step: 0.1 }}
              value={formData.fuelConsumptionPerHour}
              onChange={(e) => setFormData({ ...formData, fuelConsumptionPerHour: e.target.value })}
              placeholder="4.5"
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

            <Box>
              <Typography variant="caption" sx={{ color: '#B3B3B3', display: 'block', mb: 0.5 }}>
                Organization Fuel Price
              </Typography>
              <Box
                sx={{
                  p: 1.75,
                  background: '#0A0A0A',
                  border: '1px solid #2A2A2A',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  height: '56px',
                }}
              >
                <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  ${orgFuelPrice.toFixed(2)}/gal
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
                Set in company settings
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          {/* Maintenance & Other */}
          <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 600 }}>
            MAINTENANCE & OTHER COSTS
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Annual Maintenance Cost"
              type="number"
              value={formData.annualMaintenanceCost}
              onChange={(e) => setFormData({ ...formData, annualMaintenanceCost: e.target.value })}
              placeholder="6750"
              helperText="Oil changes, parts, service"
              sx={{
                '& .MuiInputLabel-root': { color: '#B3B3B3' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: '#2A2A2A' },
                  '&:hover fieldset': { borderColor: '#007AFF' },
                  '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                },
                '& .MuiFormHelperText-root': { color: '#666' },
              }}
            />

            <TextField
              label="Annual Other Costs"
              type="number"
              value={formData.annualOtherCosts}
              onChange={(e) => setFormData({ ...formData, annualOtherCosts: e.target.value })}
              placeholder="1500"
              helperText="Filters, belts, consumables"
              sx={{
                '& .MuiInputLabel-root': { color: '#B3B3B3' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: '#2A2A2A' },
                  '&:hover fieldset': { borderColor: '#007AFF' },
                  '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                },
                '& .MuiFormHelperText-root': { color: '#666' },
              }}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Equipment details, specs, special considerations..."
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

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          {/* Cost Breakdown */}
          <Typography variant="subtitle2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
            CALCULATED HOURLY COST
          </Typography>

          <Box
            sx={{
              p: 2,
              background: '#0A0A0A',
              border: '1px solid #2A2A2A',
              borderRadius: 1,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                Depreciation
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                ${costs.hourlyDepreciation.toFixed(2)}/hr
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                Fuel
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                ${costs.hourlyFuel.toFixed(2)}/hr
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                Maintenance
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                ${costs.hourlyMaintenance.toFixed(2)}/hr
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                Other (filters, belts, etc.)
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                ${costs.hourlyOther.toFixed(2)}/hr
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#2A2A2A', mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                Subtotal
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                ${costs.hourlyCostBeforeOverhead.toFixed(2)}/hr
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                Overhead (15%)
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                ${(costs.hourlyCost - costs.hourlyCostBeforeOverhead).toFixed(2)}/hr
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#007AFF', mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ color: '#007AFF', fontWeight: 600 }}>
                Total Hourly Cost
              </Typography>
              <Typography variant="h6" sx={{ color: '#007AFF', fontWeight: 600 }}>
                ${costs.hourlyCost.toFixed(2)}/hr
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #2A2A2A' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#666',
            '&:hover': { background: 'rgba(255, 255, 255, 0.05)' },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            background: '#007AFF',
            '&:hover': { background: '#0066DD' },
          }}
        >
          {isEditing ? 'Update Equipment' : 'Create Equipment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
