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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface EquipmentFormData {
  name: string;
  year: string;
  make: string;
  model: string;
  vin: string;
  serialNumber: string;
  isAttachment: boolean;
  categoryId: string;
  typeId: string;
  purchasePrice: string;
  usefulLifeYears: string;
  auctionPrice: string;
  annualOperatingHours: string;
  fuelConsumptionPerHour: string;
  annualMaintenanceCost: string;
  annualOtherCosts: string;
  annualInsuranceCost: string;
  notes: string;
}

interface EquipmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  initialData?: Record<string, unknown>;
  isEditing: boolean;
}

// Default empty form state (outside component to avoid recreation on each render)
const emptyFormData: EquipmentFormData = {
  name: '',
  year: '',
  make: '',
  model: '',
  vin: '',
  serialNumber: '',
  isAttachment: false,
  categoryId: '',
  typeId: '',
  purchasePrice: '',
  usefulLifeYears: '5',
  auctionPrice: '0',
  annualOperatingHours: '1500',
  fuelConsumptionPerHour: '',
  annualMaintenanceCost: '',
  annualOtherCosts: '',
  annualInsuranceCost: '',
  notes: '',
};

export default function EquipmentFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: EquipmentFormModalProps) {
  const { showError } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch equipment categories and types
  const categories = useQuery(api.equipmentCategories.listCategories) || [];
  const allTypes = useQuery(api.equipmentTypes.listAllTypes) || [];
  const company = useQuery(api.companies.getCompany);

  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    year: '',
    make: '',
    model: '',
    vin: '',
    serialNumber: '',
    isAttachment: false,
    categoryId: '',
    typeId: '',
    purchasePrice: '',
    usefulLifeYears: '5',
    auctionPrice: '0',
    annualOperatingHours: '1500',
    fuelConsumptionPerHour: '',
    annualMaintenanceCost: '',
    annualOtherCosts: '',
    annualInsuranceCost: '',
    notes: '',
  });

  // Filter types based on selected category
  interface EquipmentType {
    _id: string;
    categoryId: string;
    name: string;
  }
  const filteredTypes = formData.categoryId
    ? allTypes.filter((t: EquipmentType) => t.categoryId === formData.categoryId)
    : [];

  // Get org fuel price (default to 3.50 if not set)
  const orgFuelPrice = company?.defaultFuelPricePerGallon || 3.50;

  // Reset or populate form when modal opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Editing - populate with existing data
        const data = initialData as Record<string, string | number | boolean | undefined>;
        setFormData({
          name: String(data.name || ''),
          year: String(data.year || ''),
          make: String(data.make || ''),
          model: String(data.model || ''),
          vin: String(data.vin || ''),
          serialNumber: String(data.serialNumber || ''),
          isAttachment: Boolean(data.isAttachment),
          categoryId: String(data.categoryId || ''),
          typeId: String(data.typeId || ''),
          purchasePrice: String(data.purchasePrice || '0'),
          usefulLifeYears: String(data.usefulLifeYears || '1'),
          auctionPrice: String(data.auctionPrice || '0'),
          annualOperatingHours: String(data.annualOperatingHours || '0'),
          fuelConsumptionPerHour: String(data.fuelConsumptionPerHour || '0'),
          annualMaintenanceCost: String(data.annualMaintenanceCost || '0'),
          annualOtherCosts: String(data.annualOtherCosts || ''),
          annualInsuranceCost: String(data.annualInsuranceCost || ''),
          notes: String(data.notes || ''),
        });
      } else {
        // Creating new - reset to empty form
        setFormData(emptyFormData);
      }
    }
  }, [open, initialData]);

  // Calculate costs in real-time (using org fuel price)
  const calculateCosts = () => {
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const usefulLifeYears = parseFloat(formData.usefulLifeYears) || 1;
    const auctionPrice = parseFloat(formData.auctionPrice) || 0;
    const annualOperatingHours = parseFloat(formData.annualOperatingHours) || 1;
    const fuelConsumption = parseFloat(formData.fuelConsumptionPerHour) || 0;
    const annualMaintenance = parseFloat(formData.annualMaintenanceCost) || 0;
    const annualOther = parseFloat(formData.annualOtherCosts) || 0;
    const annualInsurance = parseFloat(formData.annualInsuranceCost) || 0;

    // Calculations (using org fuel price)
    const annualDepreciation = (purchasePrice - auctionPrice) / usefulLifeYears;
    const hourlyDepreciation = annualDepreciation / annualOperatingHours;
    // Attachments don't use fuel - only main equipment does
    const hourlyFuel = formData.isAttachment ? 0 : fuelConsumption * orgFuelPrice;
    const hourlyMaintenance = annualMaintenance / annualOperatingHours;
    const hourlyOther = annualOther / annualOperatingHours;
    const hourlyInsurance = annualInsurance / annualOperatingHours;
    const hourlyCostBeforeOverhead = hourlyDepreciation + hourlyFuel + hourlyMaintenance + hourlyOther + hourlyInsurance;
    const hourlyCost = hourlyCostBeforeOverhead * 1.15; // 15% overhead

    return {
      auctionPrice,
      hourlyDepreciation,
      hourlyFuel,
      hourlyMaintenance,
      hourlyOther,
      hourlyInsurance,
      hourlyCostBeforeOverhead,
      hourlyCost,
    };
  };

  const costs = calculateCosts();

  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId || !formData.typeId || !formData.purchasePrice) {
      showError('Please fill in required fields (Name, Category, Type, Purchase Price)');
      return;
    }

    const purchasePrice = parseFloat(formData.purchasePrice);
    const auctionPrice = parseFloat(formData.auctionPrice) || 0;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        year: formData.year || undefined,
        make: formData.make || undefined,
        model: formData.model || undefined,
        vin: formData.vin || undefined,
        serialNumber: formData.serialNumber || undefined,
        isAttachment: formData.isAttachment,
        categoryId: formData.categoryId,
        typeId: formData.typeId,
        purchasePrice,
        usefulLifeYears: parseFloat(formData.usefulLifeYears) || 5,
        auctionPrice,
        annualOperatingHours: parseFloat(formData.annualOperatingHours) || 1500,
        fuelConsumptionPerHour: parseFloat(formData.fuelConsumptionPerHour) || 0,
        fuelPricePerGallon: orgFuelPrice, // Use org fuel price
        annualMaintenanceCost: parseFloat(formData.annualMaintenanceCost) || 0,
        annualOtherCosts: parseFloat(formData.annualOtherCosts) || 0,
        annualInsuranceCost: parseFloat(formData.annualInsuranceCost) || 0,
        overheadMultiplier: 1.15,
        notes: formData.notes || undefined,
      });
    } catch {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false);
    }
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
            TreeShop Cost Calculation Method
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

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <TextField
              fullWidth
              label="Year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="2020"
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
              label="Make"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              placeholder="John Deere"
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
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="803M"
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

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              fullWidth
              label="VIN"
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              placeholder="Vehicle Identification Number"
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
              label="Serial Number"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="Equipment serial number"
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

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isAttachment}
                onChange={(e) => setFormData({ ...formData, isAttachment: e.target.checked })}
                sx={{
                  color: '#666',
                  '&.Mui-checked': { color: '#007AFF' },
                }}
              />
            }
            label={
              <Box>
                <Typography sx={{ color: '#FFFFFF' }}>This is an attachment</Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Attachments do not consume fuel (e.g., mulching heads, grapples)
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start' }}
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
              {categories.map((category: { _id: string; name: string }) => (
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
              {filteredTypes.map((type: EquipmentType) => (
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
              label="Auction Price ($)"
              type="number"
              value={formData.auctionPrice}
              onChange={(e) => setFormData({ ...formData, auctionPrice: e.target.value })}
              placeholder="33000"
              helperText="Expected resale/auction value"
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

          {/* Maintenance, Insurance & Other */}
          <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 600 }}>
            MAINTENANCE, INSURANCE & OTHER COSTS
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
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
              label="Annual Insurance Cost"
              type="number"
              value={formData.annualInsuranceCost}
              onChange={(e) => setFormData({ ...formData, annualInsuranceCost: e.target.value })}
              placeholder="2500"
              helperText="Annual premium"
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                Insurance
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                ${costs.hourlyInsurance.toFixed(2)}/hr
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
          disabled={isSubmitting}
          sx={{
            background: '#007AFF',
            '&:hover': { background: '#0066DD' },
            '&.Mui-disabled': {
              background: '#555',
              color: '#999',
            },
          }}
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Equipment' : 'Create Equipment')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
