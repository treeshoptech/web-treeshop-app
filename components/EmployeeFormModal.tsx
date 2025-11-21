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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material';
import { useSnackbar } from '@/app/contexts/SnackbarContext';

interface EmployeeFormData {
  name: string;
  positionCode: string;
  tierLevel: string;
  baseRate: string;
  hasLeadership: boolean;
  hasSupervisor: boolean;
  equipmentLevel: string;
  hasCDL: boolean;
  hasCrane: boolean;
  hasOSHA: boolean;
}

interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEditing: boolean;
}

export default function EmployeeFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: EmployeeFormModalProps) {
  const { showError } = useSnackbar();
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    positionCode: 'GC',
    tierLevel: '1',
    baseRate: '20',
    hasLeadership: false,
    hasSupervisor: false,
    equipmentLevel: '1',
    hasCDL: false,
    hasCrane: false,
    hasOSHA: false,
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        positionCode: initialData.positionCode || 'GC',
        tierLevel: initialData.tierLevel?.toString() || '1',
        baseRate: initialData.baseHourlyRate?.toString() || '20',
        hasLeadership: initialData.hasLeadership || false,
        hasSupervisor: initialData.hasSupervisor || false,
        equipmentLevel: initialData.equipmentLevel?.toString() || '1',
        hasCDL: initialData.hasCDL || false,
        hasCrane: initialData.hasCrane || false,
        hasOSHA: initialData.hasOSHA || false,
      });
    }
  }, [initialData]);

  // Calculate costs using TreeShop qualification code system
  const calculateCosts = () => {
    const baseRate = parseFloat(formData.baseRate) || 20;
    const tier = parseInt(formData.tierLevel) || 1;

    // Tier multipliers (from article)
    const tierMultipliers = [1.6, 1.7, 1.8, 2.0, 2.2];
    const tierMultiplier = tierMultipliers[tier - 1] || 1.6;

    // Start with base × tier
    let qualificationRate = baseRate * tierMultiplier;

    // Add leadership premiums
    if (formData.hasLeadership) qualificationRate += 3;
    if (formData.hasSupervisor) qualificationRate += 7;

    // Add equipment certification premium
    const equipLevel = parseInt(formData.equipmentLevel) || 1;
    const equipmentPremiums = [0, 1.5, 4, 7];
    qualificationRate += equipmentPremiums[equipLevel - 1] || 0;

    // Add professional credentials
    if (formData.hasCDL) qualificationRate += 3;
    if (formData.hasCrane) qualificationRate += 4;
    if (formData.hasOSHA) qualificationRate += 2;

    // Build qualification code
    let code = `${formData.positionCode}${tier}`;
    if (formData.hasLeadership) code += '+L';
    if (formData.hasSupervisor) code += '+S';
    if (equipLevel > 1) code += `+E${equipLevel}`;
    if (formData.hasCDL) code += '+D3';
    if (formData.hasCrane) code += '+CRA';
    if (formData.hasOSHA) code += '+OSHA';

    // Apply burden multiplier (also tier-based)
    const burdenMultiplier = tierMultipliers[tier - 1] || 1.6;
    const effectiveRate = qualificationRate * burdenMultiplier;

    return {
      baseRate,
      tierMultiplier,
      qualificationRate,
      qualificationCode: code,
      burdenMultiplier,
      effectiveRate,
      annualCost: effectiveRate * 2000,
    };
  };

  const costs = calculateCosts();

  const handleSubmit = () => {
    if (!formData.name || !formData.baseRate) {
      showError('Please fill in required fields (Name, Base Rate)');
      return;
    }

    onSubmit({
      name: formData.name,
      positionCode: formData.positionCode,
      tierLevel: parseInt(formData.tierLevel),
      baseHourlyRate: parseFloat(formData.baseRate),
      hasLeadership: formData.hasLeadership,
      hasSupervisor: formData.hasSupervisor,
      equipmentLevel: parseInt(formData.equipmentLevel),
      hasCDL: formData.hasCDL,
      hasCrane: formData.hasCrane,
      hasOSHA: formData.hasOSHA,
      qualificationRate: costs.qualificationRate,
      qualificationCode: costs.qualificationCode,
      burdenMultiplier: costs.burdenMultiplier,
      effectiveRate: costs.effectiveRate,
      // Legacy backward compat
      position: formData.positionCode,
      hourlyRate: costs.qualificationRate,
      annualSalary: costs.qualificationRate * 2000,
      totalAnnualCost: costs.annualCost,
      annualWorkingHours: 2000,
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
              {isEditing ? 'Edit Employee' : 'Add New Employee'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              TreeShop Qualification Code System
            </Typography>
          </Box>
          {costs.qualificationCode && (
            <Chip
              label={costs.qualificationCode}
              sx={{
                background: '#007AFF',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                fontFamily: 'monospace',
              }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, maxHeight: '70vh', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="Employee Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Smith"
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

          <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            POSITION & TIER
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                Position
              </InputLabel>
              <Select
                value={formData.positionCode}
                onChange={(e) => setFormData({ ...formData, positionCode: e.target.value })}
                label="Position"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                }}
              >
                <MenuItem value="TRS">Tree Removal Specialist</MenuItem>
                <MenuItem value="GC">Ground Crew</MenuItem>
                <MenuItem value="EO">Equipment Operator</MenuItem>
                <MenuItem value="CLM">Climber</MenuItem>
                <MenuItem value="SPT">Safety Spotter</MenuItem>
                <MenuItem value="MECH">Mechanic</MenuItem>
                <MenuItem value="MGR">Manager</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                Tier
              </InputLabel>
              <Select
                value={formData.tierLevel}
                onChange={(e) => setFormData({ ...formData, tierLevel: e.target.value })}
                label="Tier"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                }}
              >
                <MenuItem value="1">Tier 1 (0-6 mo) - 1.6x</MenuItem>
                <MenuItem value="2">Tier 2 (6-18 mo) - 1.7x</MenuItem>
                <MenuItem value="3">Tier 3 (18mo-3yr) - 1.8x</MenuItem>
                <MenuItem value="4">Tier 4 (3-5 yr) - 2.0x</MenuItem>
                <MenuItem value="5">Tier 5 (5+ yr) - 2.2x</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Base Rate *"
              type="number"
              value={formData.baseRate}
              onChange={(e) => setFormData({ ...formData, baseRate: e.target.value })}
              placeholder="20"
              helperText="$/hr base"
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

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            LEADERSHIP
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hasLeadership}
                  onChange={(e) => setFormData({ ...formData, hasLeadership: e.target.checked })}
                  sx={{ color: '#666', '&.Mui-checked': { color: '#007AFF' } }}
                />
              }
              label="Team Leader (+L)"
              sx={{ '& .MuiFormControlLabel-label': { color: '#FFFFFF' } }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hasSupervisor}
                  onChange={(e) => setFormData({ ...formData, hasSupervisor: e.target.checked })}
                  sx={{ color: '#666', '&.Mui-checked': { color: '#007AFF' } }}
                />
              }
              label="Supervisor (+S)"
              sx={{ '& .MuiFormControlLabel-label': { color: '#FFFFFF' } }}
            />
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            EQUIPMENT CERTIFICATION
          </Typography>

          <FormControl fullWidth>
            <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
              Equipment Level
            </InputLabel>
            <Select
              value={formData.equipmentLevel}
              onChange={(e) => setFormData({ ...formData, equipmentLevel: e.target.value })}
              label="Equipment Level"
              sx={{
                color: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '& .MuiSvgIcon-root': { color: '#FFFFFF' },
              }}
            >
              <MenuItem value="1">E1 - Basic Equipment</MenuItem>
              <MenuItem value="2">E2 - Intermediate</MenuItem>
              <MenuItem value="3">E3 - Advanced</MenuItem>
              <MenuItem value="4">E4 - Specialized</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            PROFESSIONAL CREDENTIALS
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hasCDL}
                  onChange={(e) => setFormData({ ...formData, hasCDL: e.target.checked })}
                  sx={{ color: '#666', '&.Mui-checked': { color: '#007AFF' } }}
                />
              }
              label="CDL Class A (+D3)"
              sx={{ '& .MuiFormControlLabel-label': { color: '#FFFFFF' } }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hasCrane}
                  onChange={(e) => setFormData({ ...formData, hasCrane: e.target.checked })}
                  sx={{ color: '#666', '&.Mui-checked': { color: '#007AFF' } }}
                />
              }
              label="Crane Operator (+CRA)"
              sx={{ '& .MuiFormControlLabel-label': { color: '#FFFFFF' } }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hasOSHA}
                  onChange={(e) => setFormData({ ...formData, hasOSHA: e.target.checked })}
                  sx={{ color: '#666', '&.Mui-checked': { color: '#007AFF' } }}
                />
              }
              label="OSHA Trainer (+OSHA)"
              sx={{ '& .MuiFormControlLabel-label': { color: '#FFFFFF' } }}
            />
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            CALCULATED COMPENSATION
          </Typography>

          <Box
            sx={{
              p: 2,
              background: '#0A0A0A',
              border: '1px solid #2A2A2A',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1.5 }}>
              Calculation: Base ({costs.baseRate.toFixed(2)}) × Tier {formData.tierLevel} + Qualifications
            </Typography>

            <Divider sx={{ borderColor: '#2A2A2A', mb: 1.5 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: '#B3B3B3', fontWeight: 600 }}>
                Qualification Rate
              </Typography>
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                ${costs.qualificationRate.toFixed(2)}/hr
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1.5 }}>
              Employee earns this rate
            </Typography>

            <Divider sx={{ borderColor: '#007AFF', my: 1.5 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#666' }}>
                × Burden Multiplier ({costs.burdenMultiplier}x)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ color: '#007AFF', fontWeight: 600 }}>
                Effective Cost
              </Typography>
              <Typography variant="h5" sx={{ color: '#007AFF', fontWeight: 700 }}>
                ${costs.effectiveRate.toFixed(2)}/hr
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
              True cost to company per hour
            </Typography>
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
          {isEditing ? 'Update Employee' : 'Create Employee'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
