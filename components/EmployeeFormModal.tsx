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
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { useSnackbar } from '@/app/contexts/SnackbarContext';

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  name: string;
  position: string;
  employmentType: 'full_time' | 'part_time' | 'seasonal' | 'contractor';
  hireDate: string;

  // Compensation
  payType: 'hourly' | 'salary';
  baseHourlyRate: string;
  annualSalary: string;
  expectedAnnualHours: string;
  overtimeEligible: boolean;

  // Burden Costs
  workersCompRate: string;
  payrollTaxRate: string;
  healthInsuranceMonthly: string;
  ptoDays: string;
  holidayDays: string;
  phoneAllowance: string;
  vehicleAllowance: string;

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEditing: boolean;
}

// Common Workers Comp Rate Presets
const WORKERS_COMP_PRESETS = [
  { label: 'Tree Climber', rate: 32 },
  { label: 'Ground Crew', rate: 28 },
  { label: 'Mulcher/Chipper', rate: 25 },
  { label: 'Bucket/Crane', rate: 22 },
  { label: 'Admin/Sales', rate: 2 },
];

export default function EmployeeFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: EmployeeFormModalProps) {
  const { showError, showSuccess } = useSnackbar();

  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    name: '',
    position: '',
    employmentType: 'full_time',
    hireDate: new Date().toISOString().split('T')[0],

    payType: 'hourly',
    baseHourlyRate: '20',
    annualSalary: '40000',
    expectedAnnualHours: '2000',
    overtimeEligible: true,

    workersCompRate: '28',
    payrollTaxRate: '12',
    healthInsuranceMonthly: '400',
    ptoDays: '10',
    holidayDays: '6',
    phoneAllowance: '0',
    vehicleAllowance: '0',

    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  });

  // Load initial data for editing
  useEffect(() => {
    if (initialData) {
      const hourlyRate = initialData.baseHourlyRate || initialData.hourlyRate || 20;
      const annualHours = initialData.annualWorkingHours || 2000;
      const salary = initialData.annualSalary || (hourlyRate * annualHours);

      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        name: initialData.name || '',
        position: initialData.position || initialData.positionCode || '',
        employmentType: initialData.employmentType || 'full_time',
        hireDate: initialData.hireDate || new Date().toISOString().split('T')[0],

        payType: initialData.payType || 'hourly',
        baseHourlyRate: hourlyRate.toString(),
        annualSalary: Math.round(salary).toString(),
        expectedAnnualHours: annualHours.toString(),
        overtimeEligible: initialData.overtimeEligible ?? true,

        workersCompRate: (initialData.workersCompRate || 28).toString(),
        payrollTaxRate: (initialData.payrollTaxRate || 12).toString(),
        healthInsuranceMonthly: (initialData.healthInsuranceMonthly || 400).toString(),
        ptoDays: (initialData.ptoDays || 10).toString(),
        holidayDays: (initialData.holidayDays || 6).toString(),
        phoneAllowance: (initialData.phoneAllowance || 0).toString(),
        vehicleAllowance: (initialData.vehicleAllowance || 0).toString(),

        emergencyContactName: initialData.emergencyContactName || '',
        emergencyContactPhone: initialData.emergencyContactPhone || '',
        emergencyContactRelationship: initialData.emergencyContactRelationship || '',
      });
    }
  }, [initialData]);

  // Calculate fully burdened hourly cost in real-time
  const calculateBurdenedCost = () => {
    const { payType, baseHourlyRate, annualSalary, expectedAnnualHours, workersCompRate,
            payrollTaxRate, healthInsuranceMonthly, ptoDays, holidayDays,
            phoneAllowance, vehicleAllowance } = formData;

    // Get effective hourly rate
    const hourlyRate = payType === 'hourly'
      ? parseFloat(baseHourlyRate) || 0
      : (parseFloat(annualSalary) || 0) / (parseFloat(expectedAnnualHours) || 2000);

    const annualHours = parseFloat(expectedAnnualHours) || 2000;
    const workingHoursPerYear = 2080; // Standard full-time

    // Calculate hourly costs
    const wcRate = parseFloat(workersCompRate) || 0;
    const taxRate = parseFloat(payrollTaxRate) || 0;
    const workersComp = hourlyRate * (wcRate / 100);
    const payrollTax = hourlyRate * (taxRate / 100);

    // Annual costs converted to hourly
    const healthMonthly = parseFloat(healthInsuranceMonthly) || 0;
    const healthHourly = (healthMonthly * 12) / annualHours;

    // PTO/Holiday cost (paying for non-working hours)
    const pto = parseFloat(ptoDays) || 0;
    const holidays = parseFloat(holidayDays) || 0;
    const nonWorkingDays = pto + holidays;
    const nonWorkingHours = nonWorkingDays * 8; // 8 hours per day
    const ptoHolidayCost = (hourlyRate * nonWorkingHours) / annualHours;

    // Allowances converted to hourly
    const phoneMonthly = parseFloat(phoneAllowance) || 0;
    const vehicleMonthly = parseFloat(vehicleAllowance) || 0;
    const phoneHourly = (phoneMonthly * 12) / annualHours;
    const vehicleHourly = (vehicleMonthly * 12) / annualHours;

    // Total burdened cost
    const totalBurdenedHourly = hourlyRate + workersComp + payrollTax + healthHourly +
                                 ptoHolidayCost + phoneHourly + vehicleHourly;

    const annualBasePay = hourlyRate * annualHours;
    const annualBurdenedCost = totalBurdenedHourly * annualHours;
    const burdenPercentage = ((totalBurdenedHourly - hourlyRate) / hourlyRate) * 100;

    return {
      hourlyRate,
      workersComp,
      payrollTax,
      healthHourly,
      ptoHolidayCost,
      phoneHourly,
      vehicleHourly,
      totalBurdenedHourly,
      annualBasePay,
      annualBurdenedCost,
      burdenPercentage,
      annualHours,
    };
  };

  const costs = calculateBurdenedCost();

  // Update name when first/last change
  const handleFirstNameChange = (value: string) => {
    setFormData({
      ...formData,
      firstName: value,
      name: `${value} ${formData.lastName}`.trim(),
    });
  };

  const handleLastNameChange = (value: string) => {
    setFormData({
      ...formData,
      lastName: value,
      name: `${formData.firstName} ${value}`.trim(),
    });
  };

  // Sync hourly rate and salary when either changes
  const handleHourlyRateChange = (value: string) => {
    const hourly = parseFloat(value) || 0;
    const hours = parseFloat(formData.expectedAnnualHours) || 2000;
    setFormData({
      ...formData,
      baseHourlyRate: value,
      annualSalary: Math.round(hourly * hours).toString(),
    });
  };

  const handleSalaryChange = (value: string) => {
    const salary = parseFloat(value) || 0;
    const hours = parseFloat(formData.expectedAnnualHours) || 2000;
    setFormData({
      ...formData,
      annualSalary: value,
      baseHourlyRate: (salary / hours).toFixed(2),
    });
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName) {
      showError('Please enter first and last name');
      return;
    }

    if (!formData.position) {
      showError('Please enter a position/title');
      return;
    }

    try {
      const employeeData = {
        name: formData.name,
        firstName: formData.firstName,
        lastName: formData.lastName,
        position: formData.position,
        employmentType: formData.employmentType,
        hireDate: formData.hireDate,

        // Compensation
        payType: formData.payType,
        positionTitle: formData.position,
        baseHourlyRate: costs.hourlyRate,
        hourlyRate: costs.hourlyRate, // For backward compatibility
        annualSalary: costs.annualBasePay,
        expectedAnnualBillableHours: parseFloat(formData.expectedAnnualHours) || 2000,
        annualWorkingHours: parseFloat(formData.expectedAnnualHours) || 2000,
        overtimeEligible: formData.overtimeEligible,
        fullyBurdenedHourlyRate: costs.totalBurdenedHourly,

        // Burden costs
        workersCompRate: parseFloat(formData.workersCompRate) || 0,
        payrollTaxRate: parseFloat(formData.payrollTaxRate) || 0,
        healthInsuranceMonthly: parseFloat(formData.healthInsuranceMonthly) || 0,
        ptoHoursPerYear: (parseFloat(formData.ptoDays) || 0) * 8,
        holidayHoursPerYear: (parseFloat(formData.holidayDays) || 0) * 8,
        phoneAllowance: parseFloat(formData.phoneAllowance) || 0,
        vehicleAllowance: parseFloat(formData.vehicleAllowance) || 0,

        // Calculated values
        effectiveRate: costs.totalBurdenedHourly,
        totalAnnualCost: costs.annualBurdenedCost,
        burdenMultiplier: costs.burdenPercentage / 100 + 1,

        // Emergency contact
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelationship: formData.emergencyContactRelationship,

        // Legacy fields for backward compatibility
        positionCode: formData.position,
        tierLevel: 1,
        qualificationRate: costs.hourlyRate,
        qualificationCode: formData.position,
      };

      await onSubmit(employeeData);
      showSuccess(isEditing ? 'Employee updated successfully' : 'Employee created successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to save employee');
    }
  };

  const textFieldStyles = {
    '& .MuiInputLabel-root': { color: '#B3B3B3' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
    '& .MuiOutlinedInput-root': {
      color: '#FFFFFF',
      '& fieldset': { borderColor: '#2A2A2A' },
      '&:hover fieldset': { borderColor: '#007AFF' },
      '&.Mui-focused fieldset': { borderColor: '#007AFF' },
    },
    '& .MuiFormHelperText-root': { color: '#666' },
  };

  const selectStyles = {
    color: '#FFFFFF',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
    '& .MuiSvgIcon-root': { color: '#FFFFFF' },
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
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ color: '#FFFFFF', borderBottom: '1px solid #2A2A2A', pb: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          {isEditing ? 'Edit Employee' : 'Add New Employee'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>
          Simple payroll-focused employee form
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, maxHeight: '70vh', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* SECTION 1: BASIC INFO */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: '#007AFF', fontWeight: 600, fontSize: '0.875rem', mb: 2 }}
            >
              BASIC INFORMATION
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                required
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleFirstNameChange(e.target.value)}
                placeholder="John"
                sx={textFieldStyles}
              />
              <TextField
                fullWidth
                required
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleLastNameChange(e.target.value)}
                placeholder="Smith"
                sx={textFieldStyles}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                required
                label="Position/Title"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Tree Climber, Foreman, etc."
                sx={textFieldStyles}
              />

              <TextField
                label="Hire Date"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={textFieldStyles}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                  Employment Type
                </InputLabel>
                <Select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  label="Employment Type"
                  sx={selectStyles}
                >
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="seasonal">Seasonal</MenuItem>
                  <MenuItem value="contractor">Contractor</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          {/* SECTION 2: COMPENSATION */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: '#007AFF', fontWeight: 600, fontSize: '0.875rem', mb: 2 }}
            >
              COMPENSATION
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#B3B3B3', mb: 1 }}>
                Pay Type
              </Typography>
              <ToggleButtonGroup
                value={formData.payType}
                exclusive
                onChange={(_, value) => {
                  if (value) setFormData({ ...formData, payType: value });
                }}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    color: '#B3B3B3',
                    borderColor: '#2A2A2A',
                    '&.Mui-selected': {
                      background: '#007AFF',
                      color: '#FFFFFF',
                      '&:hover': { background: '#0066DD' },
                    },
                  },
                }}
              >
                <ToggleButton value="hourly">Hourly</ToggleButton>
                <ToggleButton value="salary">Salary</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              {formData.payType === 'hourly' ? (
                <TextField
                  fullWidth
                  required
                  label="Base Hourly Rate"
                  type="number"
                  value={formData.baseHourlyRate}
                  onChange={(e) => handleHourlyRateChange(e.target.value)}
                  placeholder="20.00"
                  InputProps={{ startAdornment: <Typography sx={{ color: '#B3B3B3', mr: 0.5 }}>$</Typography> }}
                  helperText="/hour before burden"
                  sx={textFieldStyles}
                />
              ) : (
                <TextField
                  fullWidth
                  required
                  label="Annual Salary"
                  type="number"
                  value={formData.annualSalary}
                  onChange={(e) => handleSalaryChange(e.target.value)}
                  placeholder="40000"
                  InputProps={{ startAdornment: <Typography sx={{ color: '#B3B3B3', mr: 0.5 }}>$</Typography> }}
                  helperText="per year before burden"
                  sx={textFieldStyles}
                />
              )}

              <TextField
                fullWidth
                label="Expected Annual Billable Hours"
                type="number"
                value={formData.expectedAnnualHours}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, expectedAnnualHours: value });
                  // Recalc salary/hourly based on new hours
                  if (formData.payType === 'hourly') {
                    const hourly = parseFloat(formData.baseHourlyRate) || 0;
                    setFormData(prev => ({
                      ...prev,
                      expectedAnnualHours: value,
                      annualSalary: Math.round(hourly * (parseFloat(value) || 2000)).toString(),
                    }));
                  } else {
                    const salary = parseFloat(formData.annualSalary) || 0;
                    setFormData(prev => ({
                      ...prev,
                      expectedAnnualHours: value,
                      baseHourlyRate: (salary / (parseFloat(value) || 2000)).toFixed(2),
                    }));
                  }
                }}
                placeholder="2000"
                helperText="Typically 2000 hrs/year"
                sx={textFieldStyles}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.overtimeEligible}
                  onChange={(e) => setFormData({ ...formData, overtimeEligible: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#007AFF',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#007AFF',
                    },
                  }}
                />
              }
              label={<Typography sx={{ color: '#B3B3B3' }}>Overtime Eligible</Typography>}
            />
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          {/* SECTION 3: BURDEN COSTS */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: '#007AFF', fontWeight: 600, fontSize: '0.875rem', mb: 2 }}
            >
              BURDEN COSTS
            </Typography>

            <Typography variant="body2" sx={{ color: '#666', mb: 2, fontSize: '0.875rem' }}>
              Quick presets for Workers Comp:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {WORKERS_COMP_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  size="small"
                  variant="outlined"
                  onClick={() => setFormData({ ...formData, workersCompRate: preset.rate.toString() })}
                  sx={{
                    borderColor: '#2A2A2A',
                    color: '#B3B3B3',
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#007AFF', color: '#007AFF' },
                  }}
                >
                  {preset.label} ({preset.rate}%)
                </Button>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Workers Comp Rate"
                type="number"
                value={formData.workersCompRate}
                onChange={(e) => setFormData({ ...formData, workersCompRate: e.target.value })}
                placeholder="28"
                InputProps={{ endAdornment: <Typography sx={{ color: '#B3B3B3' }}>%</Typography> }}
                helperText="% of wages"
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                label="Payroll Tax Rate"
                type="number"
                value={formData.payrollTaxRate}
                onChange={(e) => setFormData({ ...formData, payrollTaxRate: e.target.value })}
                placeholder="12"
                InputProps={{ endAdornment: <Typography sx={{ color: '#B3B3B3' }}>%</Typography> }}
                helperText="FICA, unemployment, etc."
                sx={textFieldStyles}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Health Insurance (Company Paid)"
                type="number"
                value={formData.healthInsuranceMonthly}
                onChange={(e) => setFormData({ ...formData, healthInsuranceMonthly: e.target.value })}
                placeholder="400"
                InputProps={{ startAdornment: <Typography sx={{ color: '#B3B3B3', mr: 0.5 }}>$</Typography> }}
                helperText="per month"
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                label="Phone Allowance"
                type="number"
                value={formData.phoneAllowance}
                onChange={(e) => setFormData({ ...formData, phoneAllowance: e.target.value })}
                placeholder="0"
                InputProps={{ startAdornment: <Typography sx={{ color: '#B3B3B3', mr: 0.5 }}>$</Typography> }}
                helperText="per month"
                sx={textFieldStyles}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="PTO Days/Year"
                type="number"
                value={formData.ptoDays}
                onChange={(e) => setFormData({ ...formData, ptoDays: e.target.value })}
                placeholder="10"
                helperText="Paid time off"
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                label="Holiday Days/Year"
                type="number"
                value={formData.holidayDays}
                onChange={(e) => setFormData({ ...formData, holidayDays: e.target.value })}
                placeholder="6"
                helperText="Paid holidays"
                sx={textFieldStyles}
              />

              <TextField
                fullWidth
                label="Vehicle Allowance"
                type="number"
                value={formData.vehicleAllowance}
                onChange={(e) => setFormData({ ...formData, vehicleAllowance: e.target.value })}
                placeholder="0"
                InputProps={{ startAdornment: <Typography sx={{ color: '#B3B3B3', mr: 0.5 }}>$</Typography> }}
                helperText="per month"
                sx={textFieldStyles}
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          {/* SECTION 4: EMERGENCY CONTACT */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: '#FF3B30', fontWeight: 600, fontSize: '0.875rem', mb: 2 }}
            >
              EMERGENCY CONTACT (ICE)
            </Typography>

            <TextField
              fullWidth
              label="Emergency Contact Name"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              placeholder="Jane Doe"
              sx={{ ...textFieldStyles, mb: 2 }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="(555) 123-4567"
                sx={textFieldStyles}
              />
              <TextField
                fullWidth
                label="Relationship"
                value={formData.emergencyContactRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                placeholder="Spouse, Parent, etc."
                sx={textFieldStyles}
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#007AFF', my: 1 }} />

          {/* REAL-TIME COST CALCULATION DISPLAY */}
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
              border: '2px solid #007AFF',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: '#007AFF', fontWeight: 600, mb: 2, textAlign: 'center' }}
            >
              FULLY BURDENED COST
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                  Base Pay:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  ${costs.hourlyRate.toFixed(2)}/hr
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3', fontSize: '0.875rem' }}>
                  + Workers Comp ({formData.workersCompRate}%):
                </Typography>
                <Typography variant="body2" sx={{ color: '#B3B3B3', fontSize: '0.875rem' }}>
                  ${costs.workersComp.toFixed(2)}/hr
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3', fontSize: '0.875rem' }}>
                  + Payroll Tax ({formData.payrollTaxRate}%):
                </Typography>
                <Typography variant="body2" sx={{ color: '#B3B3B3', fontSize: '0.875rem' }}>
                  ${costs.payrollTax.toFixed(2)}/hr
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3', fontSize: '0.875rem' }}>
                  + Health Insurance:
                </Typography>
                <Typography variant="body2" sx={{ color: '#B3B3B3', fontSize: '0.875rem' }}>
                  ${costs.healthHourly.toFixed(2)}/hr
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3', fontSize: '0.875rem' }}>
                  + PTO & Holidays:
                </Typography>
                <Typography variant="body2" sx={{ color: '#B3B3B3', fontSize: '0.875rem' }}>
                  ${costs.ptoHolidayCost.toFixed(2)}/hr
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3', fontSize: '0.875rem' }}>
                  + Allowances:
                </Typography>
                <Typography variant="body2" sx={{ color: '#B3B3B3', fontSize: '0.875rem' }}>
                  ${(costs.phoneHourly + costs.vehicleHourly).toFixed(2)}/hr
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#007AFF', my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ color: '#007AFF', fontWeight: 700 }}>
                    ${costs.totalBurdenedHourly.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    per hour true cost
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                    Burden: +{costs.burdenPercentage.toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Annual: ${costs.annualBurdenedCost.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
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
            px: 4,
          }}
        >
          {isEditing ? 'Update Employee' : 'Create Employee'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
