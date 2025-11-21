'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { Id } from '@/convex/_generated/dataModel';

interface AddLineItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    displayName: string;
    serviceType: string;
    baseScore: number;
    adjustedScore: number;
    estimatedHours: number;
    lineItemTotal: number;
    scopeDetails?: string;
  }) => void;
}

export default function AddLineItemModal({ open, onClose, onSubmit }: AddLineItemModalProps) {
  const employees = useQuery(api.employees.listEmployees);
  const equipment = useQuery(api.equipment.listEquipment);
  const loadouts = useQuery(api.loadouts.listLoadouts);
  const company = useQuery(api.companies.getCompany);

  const [serviceType, setServiceType] = useState('forestry_mulching');
  const [displayName, setDisplayName] = useState('');

  // Mulching Score inputs
  const [acres, setAcres] = useState('');
  const [dbhPackage, setDbhPackage] = useState('6');

  // Resource selection mode
  const [useLoadout, setUseLoadout] = useState(true);
  const [selectedLoadoutId, setSelectedLoadoutId] = useState<Id<'loadouts'> | ''>('');

  // Manual resource selection - MULTIPLE
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Id<'employees'>[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<Id<'equipment'>[]>([]);

  const [profitMargin, setProfitMargin] = useState('');
  const [productionRate, setProductionRate] = useState('');

  // Load company default margin
  useEffect(() => {
    if (company && !profitMargin) {
      setProfitMargin(company.defaultProfitMargin.toString());
    }
  }, [company]);

  // Auto-populate production rate when loadout selected
  useEffect(() => {
    if (useLoadout && selectedLoadoutId && loadouts) {
      const selectedLoadout = loadouts.find(l => l._id === selectedLoadoutId);
      if (selectedLoadout?.productionRates) {
        const rate = selectedLoadout.productionRates.find(
          (r: any) => r.serviceType === serviceType
        );
        if (rate) {
          setProductionRate(rate.actualRatePerDay.toString());
        }
      }
    }
  }, [selectedLoadoutId, serviceType, useLoadout, loadouts]);

  const calculateScore = () => {
    if (serviceType === 'forestry_mulching') {
      const acresNum = parseFloat(acres) || 0;
      const dbhNum = parseFloat(dbhPackage) || 0;
      const baseScore = acresNum * dbhNum;
      const adjustedScore = baseScore;

      const prodRate = parseFloat(productionRate) || 1;
      const estimatedHours = adjustedScore / prodRate;

      let totalCostPerHour = 0;
      let employeeCost = 0;
      let equipmentCost = 0;

      // Calculate cost based on selection mode
      if (useLoadout && selectedLoadoutId) {
        const selectedLoadout = loadouts?.find(l => l._id === selectedLoadoutId);
        totalCostPerHour = selectedLoadout?.totalHourlyCost || 0;
      } else {
        // Sum ALL selected employees
        employeeCost = selectedEmployeeIds.reduce((sum, id) => {
          const emp = employees?.find(e => e._id === id);
          return sum + (emp?.effectiveRate || 0);
        }, 0);

        // Sum ALL selected equipment
        equipmentCost = selectedEquipmentIds.reduce((sum, id) => {
          const equip = equipment?.find(e => e._id === id);
          return sum + (equip?.hourlyCost || 0);
        }, 0);

        totalCostPerHour = employeeCost + equipmentCost;
      }

      const margin = parseFloat(profitMargin) || 0;
      const billingRate = totalCostPerHour * (1 + margin / 100);
      const totalCost = totalCostPerHour * estimatedHours;
      const lineItemTotal = billingRate * estimatedHours;

      return {
        baseScore,
        adjustedScore,
        estimatedHours,
        employeeCost,
        equipmentCost,
        totalCostPerHour,
        billingRate,
        totalCost,
        lineItemTotal,
      };
    }

    return {
      baseScore: 0,
      adjustedScore: 0,
      estimatedHours: 0,
      employeeCost: 0,
      equipmentCost: 0,
      totalCostPerHour: 0,
      billingRate: 0,
      totalCost: 0,
      lineItemTotal: 0,
    };
  };

  const costs = calculateScore();

  const handleSubmit = () => {
    if (!displayName) {
      alert('Please describe the scope of work');
      return;
    }

    if (useLoadout) {
      if (!selectedLoadoutId) {
        alert('Please select a loadout');
        return;
      }
    } else {
      if (selectedEmployeeIds.length === 0 && selectedEquipmentIds.length === 0) {
        alert('Please select at least one employee or equipment');
        return;
      }
    }

    if (serviceType === 'forestry_mulching' && (!acres || !dbhPackage)) {
      alert('Please enter acres and DBH package');
      return;
    }

    const scopeDetails = JSON.stringify({
      acres: parseFloat(acres),
      dbhPackage: parseFloat(dbhPackage),
    });

    onSubmit({
      displayName,
      serviceType,
      baseScore: costs.baseScore,
      adjustedScore: costs.adjustedScore,
      estimatedHours: costs.estimatedHours,
      lineItemTotal: costs.lineItemTotal,
      scopeDetails,
    });

    // Reset form
    setDisplayName('');
    setAcres('');
    setDbhPackage('6');
    setUseLoadout(true);
    setSelectedLoadoutId('');
    setSelectedEmployeeIds([]);
    setSelectedEquipmentIds([]);
    setProfitMargin('30');
    setProductionRate('1.5');
    onClose();
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
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ color: '#FFFFFF', borderBottom: '1px solid #2A2A2A' }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            Add Billable Task
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Describe the work and calculate pricing
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, maxHeight: '75vh', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
              Service Type
            </InputLabel>
            <Select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              label="Service Type"
              sx={{
                color: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '& .MuiSvgIcon-root': { color: '#FFFFFF' },
              }}
            >
              <MenuItem value="forestry_mulching">Forestry Mulching</MenuItem>
              <MenuItem value="tree_removal">Tree Removal (Coming Soon)</MenuItem>
              <MenuItem value="stump_grinding">Stump Grinding (Coming Soon)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Scope of Work *"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Describe the work to be completed (e.g., Clear 3.5 acres of heavy brush, mulch all material on-site)"
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

          {serviceType === 'forestry_mulching' && (
            <>
              <Divider sx={{ borderColor: '#2A2A2A' }} />

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, mb: 2, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  MULCHING CALCULATION
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Acres *"
                  type="number"
                  inputProps={{ step: 0.1, min: 0 }}
                  value={acres}
                  onChange={(e) => setAcres(e.target.value)}
                  placeholder="e.g., 3.5"
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
                  label="DBH Package *"
                  type="number"
                  inputProps={{ step: 1, min: 2, max: 15 }}
                  value={dbhPackage}
                  onChange={(e) => setDbhPackage(e.target.value)}
                  placeholder="e.g., 6"
                  helperText="Common: 4, 6, 8, 10"
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
              </Box>

              <Divider sx={{ borderColor: '#2A2A2A' }} />

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    RESOURCES
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setUseLoadout(!useLoadout)}
                    sx={{
                      color: '#007AFF',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      '&:hover': { background: 'rgba(0, 122, 255, 0.1)' },
                    }}
                  >
                    {useLoadout ? 'Manual Select' : 'Use Loadout'}
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {useLoadout ? (
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                        Loadout *
                      </InputLabel>
                      <Select
                        value={selectedLoadoutId}
                        onChange={(e) => setSelectedLoadoutId(e.target.value as Id<'loadouts'>)}
                        label="Loadout *"
                        sx={{
                          color: '#FFFFFF',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                          '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                        }}
                      >
                        <MenuItem value="">
                          <em>Select loadout</em>
                        </MenuItem>
                        {loadouts?.map((loadout) => (
                          <MenuItem key={loadout._id} value={loadout._id}>
                            {loadout.name} - ${loadout.totalHourlyCost.toFixed(2)}/hr
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <>
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
                              {emp.name} - ${emp.effectiveRate.toFixed(2)}/hr
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
                    </>
                  )}
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#2A2A2A' }} />

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, mb: 2, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  PRODUCTION & PRICING
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label="Production Rate (pts/hr)"
                    type="number"
                    inputProps={{ step: 0.1, min: 0.1 }}
                    value={productionRate}
                    onChange={(e) => setProductionRate(e.target.value)}
                    placeholder="1.5"
                    helperText="Typical: 1.3 - 5.0"
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
                    label="Profit Margin (%)"
                    type="number"
                    inputProps={{ step: 1, min: 0 }}
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(e.target.value)}
                    placeholder="30"
                    helperText="Profit margin"
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
              </Box>

              <Divider sx={{ borderColor: '#2A2A2A' }} />

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, mb: 2, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  CALCULATED PRICING
                </Typography>

                <Box
                sx={{
                  p: 2,
                  background: '#0A0A0A',
                  border: '1px solid #2A2A2A',
                  borderRadius: 1,
                }}
              >
                {/* Score Calculation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                    Mulching Score
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    {costs.baseScore.toFixed(2)} pts
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {acres || '0'} acres × {dbhPackage || '0'}" DBH
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#2A2A2A', my: 1.5 }} />

                {/* Time Calculation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                    Estimated Hours
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    {costs.estimatedHours.toFixed(1)} hrs
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {costs.adjustedScore.toFixed(2)} pts ÷ {productionRate || '0'} pts/hr
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#2A2A2A', my: 1.5 }} />

                {/* Cost Breakdown */}
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                  Cost Breakdown:
                </Typography>

                {useLoadout && selectedLoadoutId ? (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#B3B3B3' }}>
                      {loadouts?.find(l => l._id === selectedLoadoutId)?.name} ({costs.estimatedHours.toFixed(1)} hrs × ${costs.totalCostPerHour.toFixed(2)}/hr)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#FFFFFF' }}>
                      ${costs.totalCost.toFixed(0)}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {selectedEmployeeIds.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                          Employees ({selectedEmployeeIds.length}):
                        </Typography>
                        {selectedEmployeeIds.map((id) => {
                          const emp = employees?.find(e => e._id === id);
                          if (!emp) return null;
                          return (
                            <Box key={id} sx={{ display: 'flex', justifyContent: 'space-between', ml: 1, mb: 0.25 }}>
                              <Typography variant="caption" sx={{ color: '#B3B3B3', fontSize: '0.7rem' }}>
                                {emp.name} ({costs.estimatedHours.toFixed(1)} hrs × ${emp.effectiveRate.toFixed(2)}/hr)
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#FFFFFF', fontSize: '0.7rem' }}>
                                ${(emp.effectiveRate * costs.estimatedHours).toFixed(0)}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    )}

                    {selectedEquipmentIds.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                          Equipment ({selectedEquipmentIds.length}):
                        </Typography>
                        {selectedEquipmentIds.map((id) => {
                          const equip = equipment?.find(e => e._id === id);
                          if (!equip) return null;
                          return (
                            <Box key={id} sx={{ display: 'flex', justifyContent: 'space-between', ml: 1, mb: 0.25 }}>
                              <Typography variant="caption" sx={{ color: '#B3B3B3', fontSize: '0.7rem' }}>
                                {equip.name} ({costs.estimatedHours.toFixed(1)} hrs × ${equip.hourlyCost.toFixed(2)}/hr)
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#FFFFFF', fontSize: '0.7rem' }}>
                                ${(equip.hourlyCost * costs.estimatedHours).toFixed(0)}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, pt: 0.5, borderTop: '1px solid #2A2A2A' }}>
                  <Typography variant="body2" sx={{ color: '#B3B3B3', fontWeight: 600 }}>
                    Total Cost
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    ${costs.totalCost.toFixed(0)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    ${costs.totalCostPerHour.toFixed(2)}/hr × {costs.estimatedHours.toFixed(1)} hrs
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#2A2A2A', my: 1.5 }} />

                {/* Profit Margin Markup & Final Price Final Price */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#B3B3B3' }}>
                    Profit Margin ({profitMargin || '0'}%)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                    +${(costs.lineItemTotal - costs.totalCost).toFixed(0)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Billing Rate: ${costs.billingRate.toFixed(2)}/hr
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#007AFF', my: 1.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ color: '#007AFF', fontWeight: 600 }}>
                    Customer Pays
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#007AFF', fontWeight: 600 }}>
                    ${costs.lineItemTotal.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Profit: ${(costs.lineItemTotal - costs.totalCost).toFixed(0)} ({((costs.lineItemTotal - costs.totalCost) / costs.totalCost * 100).toFixed(0)}%)
                  </Typography>
                </Box>
                </Box>
              </Box>
            </>
          )}
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
          Add Billable Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}
