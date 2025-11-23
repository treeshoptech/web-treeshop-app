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
  Chip,
  Tabs,
  Tab,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
} from '@mui/material';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface EmployeeSkillForm {
  trackId: Id<'careerTracks'> | null;
  proficiencyLevel: 'learning' | 'qualified' | 'expert';
  isPrimary: boolean;
  yearsExperience?: number;
  notes?: string;
  existingSkillId?: Id<'employeeSkills'>; // For edit mode
}

interface EmployeeCertificationForm {
  certificationId: Id<'certifications'> | null;
  dateEarned: string;
  expiresAt?: string;
  certificationNumber?: string;
  existingCertId?: Id<'employeeCertifications'>; // For edit mode
}

interface EmployeeFormData {
  name: string;
  employmentType: 'full_time' | 'part_time' | 'seasonal' | 'contractor';
  hireDate: string;
  baseRate: string;
  tierLevel: string;
  managementLevelId: Id<'managementLevels'> | null;
  reportsToEmployeeId: Id<'employees'> | null;
  // Legacy fields
  positionCode: string;
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
  const { showError, showSuccess } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);

  // Fetch data from APIs
  const careerTracks = useQuery(api.careerTracks.listTracks, {}) || [];
  const managementLevels = useQuery(api.managementLevels.listManagementLevels, {}) || [];
  const certifications = useQuery(api.certifications.listCertifications, {}) || [];
  const employees = useQuery(api.employees.listEmployees, {}) || [];

  // Debug logging to check what data is being fetched
  useEffect(() => {
    console.log('EmployeeFormModal - Data fetch status:', {
      careerTracks: {
        count: careerTracks?.length || 0,
        data: careerTracks,
      },
      managementLevels: {
        count: managementLevels?.length || 0,
        data: managementLevels,
      },
      certifications: {
        count: certifications?.length || 0,
        data: certifications,
      },
      employees: {
        count: employees?.length || 0,
        data: employees,
      },
    });
  }, [careerTracks, managementLevels, certifications, employees]);

  // For edit mode - fetch existing skills and certifications
  const existingSkills = useQuery(
    api.employeeSkills.getEmployeeSkills,
    isEditing && initialData?._id ? { employeeId: initialData._id } : 'skip'
  );
  const existingCertifications = useQuery(
    api.employeeCertifications.getEmployeeCertifications,
    isEditing && initialData?._id ? { employeeId: initialData._id } : 'skip'
  );

  // Mutations for skills and certifications
  const addSkill = useMutation(api.employeeSkills.addEmployeeSkill);
  const updateSkill = useMutation(api.employeeSkills.updateEmployeeSkill);
  const removeSkill = useMutation(api.employeeSkills.removeEmployeeSkill);
  const addCertification = useMutation(api.employeeCertifications.addCertification);
  const updateCertification = useMutation(api.employeeCertifications.updateCertification);
  const removeCertification = useMutation(api.employeeCertifications.removeCertification);

  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    employmentType: 'full_time',
    hireDate: new Date().toISOString().split('T')[0],
    baseRate: '20',
    tierLevel: '1',
    managementLevelId: null,
    reportsToEmployeeId: null,
    // Legacy
    positionCode: 'GC',
    hasLeadership: false,
    hasSupervisor: false,
    equipmentLevel: '1',
    hasCDL: false,
    hasCrane: false,
    hasOSHA: false,
  });

  // Skills management
  const [skills, setSkills] = useState<EmployeeSkillForm[]>([]);
  const [newSkill, setNewSkill] = useState<EmployeeSkillForm>({
    trackId: null,
    proficiencyLevel: 'qualified',
    isPrimary: false,
    yearsExperience: undefined,
    notes: '',
  });

  // Certifications management
  const [certifs, setCertifs] = useState<EmployeeCertificationForm[]>([]);
  const [newCertif, setNewCertif] = useState<EmployeeCertificationForm>({
    certificationId: null,
    dateEarned: new Date().toISOString().split('T')[0],
    expiresAt: '',
    certificationNumber: '',
  });

  // Load initial data for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        employmentType: initialData.employmentType || 'full_time',
        hireDate: initialData.hireDate || new Date().toISOString().split('T')[0],
        baseRate: initialData.baseHourlyRate?.toString() || '20',
        tierLevel: initialData.tierLevel?.toString() || '1',
        managementLevelId: initialData.managementLevelId || null,
        reportsToEmployeeId: initialData.reportsToEmployeeId || null,
        // Legacy
        positionCode: initialData.positionCode || 'GC',
        hasLeadership: initialData.hasLeadership || false,
        hasSupervisor: initialData.hasSupervisor || false,
        equipmentLevel: initialData.equipmentLevel?.toString() || '1',
        hasCDL: initialData.hasCDL || false,
        hasCrane: initialData.hasCrane || false,
        hasOSHA: initialData.hasOSHA || false,
      });
    }
  }, [initialData]);

  // Load existing skills in edit mode
  useEffect(() => {
    if (existingSkills && existingSkills.length > 0) {
      setSkills(
        existingSkills.map((skill) => ({
          trackId: skill.trackId,
          proficiencyLevel: skill.proficiencyLevel,
          isPrimary: skill.isPrimary,
          yearsExperience: skill.yearsExperience,
          notes: skill.notes,
          existingSkillId: skill._id,
        }))
      );
    }
  }, [existingSkills]);

  // Load existing certifications in edit mode
  useEffect(() => {
    if (existingCertifications && existingCertifications.length > 0) {
      setCertifs(
        existingCertifications.map((cert) => ({
          certificationId: cert.certificationId,
          dateEarned: cert.dateEarned,
          expiresAt: cert.expiresAt,
          certificationNumber: cert.certificationNumber,
          existingCertId: cert._id,
        }))
      );
    }
  }, [existingCertifications]);

  // Add new skill to list
  const handleAddSkill = () => {
    if (!newSkill.trackId) {
      showError('Please select a career track');
      return;
    }

    // Check if skill already exists
    if (skills.some((s) => s.trackId === newSkill.trackId)) {
      showError('This skill has already been added');
      return;
    }

    // If setting as primary, unset other primary skills
    if (newSkill.isPrimary) {
      setSkills(skills.map((s) => ({ ...s, isPrimary: false })));
    }

    setSkills([...skills, { ...newSkill }]);
    setNewSkill({
      trackId: null,
      proficiencyLevel: 'qualified',
      isPrimary: false,
      yearsExperience: undefined,
      notes: '',
    });
  };

  // Remove skill from list
  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Set skill as primary
  const handleSetPrimarySkill = (index: number) => {
    setSkills(
      skills.map((skill, i) => ({
        ...skill,
        isPrimary: i === index,
      }))
    );
  };

  // Add new certification to list
  const handleAddCertification = () => {
    if (!newCertif.certificationId) {
      showError('Please select a certification');
      return;
    }

    // Check if certification already exists
    if (certifs.some((c) => c.certificationId === newCertif.certificationId)) {
      showError('This certification has already been added');
      return;
    }

    setCertifs([...certifs, { ...newCertif }]);
    setNewCertif({
      certificationId: null,
      dateEarned: new Date().toISOString().split('T')[0],
      expiresAt: '',
      certificationNumber: '',
    });
  };

  // Remove certification from list
  const handleRemoveCertification = (index: number) => {
    setCertifs(certifs.filter((_, i) => i !== index));
  };

  // Calculate costs using comprehensive multi-track system
  const calculateCosts = () => {
    const baseRate = parseFloat(formData.baseRate) || 20;
    const tier = parseInt(formData.tierLevel) || 1;

    // Tier multipliers
    const tierMultipliers = [1.6, 1.7, 1.8, 2.0, 2.2];
    const tierMultiplier = tierMultipliers[tier - 1] || 1.6;

    // Start with base × tier
    let qualificationRate = baseRate * tierMultiplier;

    // Primary skill premium
    const primarySkill = skills.find((s) => s.isPrimary);
    let primarySkillPremium = 0;
    if (primarySkill) {
      const track = careerTracks.find((t) => t._id === primarySkill.trackId);
      if (track?.hourlyPremium) {
        primarySkillPremium = track.hourlyPremium;
        qualificationRate += primarySkillPremium;
      }
    }

    // Additional skills premiums (non-primary qualified/expert skills)
    let additionalSkillsPremiums = 0;
    skills
      .filter((s) => !s.isPrimary && s.proficiencyLevel !== 'learning')
      .forEach((skill) => {
        const track = careerTracks.find((t) => t._id === skill.trackId);
        if (track?.hourlyPremium) {
          // 50% premium for additional skills
          const premium = track.hourlyPremium * 0.5;
          additionalSkillsPremiums += premium;
          qualificationRate += premium;
        }
      });

    // Management premium
    let managementPremium = 0;
    if (formData.managementLevelId) {
      const mgmtLevel = managementLevels.find((m) => m._id === formData.managementLevelId);
      if (mgmtLevel) {
        managementPremium = mgmtLevel.hourlyPremium;
        qualificationRate += managementPremium;
      }
    }

    // Certification premiums
    let certificationPremiums = 0;
    certifs.forEach((cert) => {
      const certification = certifications.find((c) => c._id === cert.certificationId);
      if (certification?.hourlyPremium) {
        certificationPremiums += certification.hourlyPremium;
        qualificationRate += certification.hourlyPremium;
      }
    });

    // Legacy qualifications (for backward compatibility)
    if (formData.hasLeadership) qualificationRate += 3;
    if (formData.hasSupervisor) qualificationRate += 7;

    const equipLevel = parseInt(formData.equipmentLevel) || 1;
    const equipmentPremiums = [0, 1.5, 4, 7];
    qualificationRate += equipmentPremiums[equipLevel - 1] || 0;

    if (formData.hasCDL) qualificationRate += 3;
    if (formData.hasCrane) qualificationRate += 4;
    if (formData.hasOSHA) qualificationRate += 2;

    // Build qualification code
    let code = `${formData.positionCode}${tier}`;
    if (primarySkill) {
      const track = careerTracks.find((t) => t._id === primarySkill.trackId);
      if (track) code += `+${track.code}`;
    }
    if (formData.managementLevelId) {
      const mgmtLevel = managementLevels.find((m) => m._id === formData.managementLevelId);
      if (mgmtLevel) code += `+${mgmtLevel.code}`;
    }
    if (formData.hasLeadership) code += '+L';
    if (formData.hasSupervisor) code += '+S';
    if (equipLevel > 1) code += `+E${equipLevel}`;
    if (formData.hasCDL) code += '+D3';
    if (formData.hasCrane) code += '+CRA';
    if (formData.hasOSHA) code += '+OSHA';

    // Apply burden multiplier
    const burdenMultiplier = tierMultipliers[tier - 1] || 1.6;
    const effectiveRate = qualificationRate * burdenMultiplier;

    return {
      baseRate,
      tierMultiplier,
      primarySkillPremium,
      additionalSkillsPremiums,
      managementPremium,
      certificationPremiums,
      qualificationRate,
      qualificationCode: code,
      burdenMultiplier,
      effectiveRate,
      annualCost: effectiveRate * 2000,
    };
  };

  const costs = calculateCosts();

  const handleSubmit = async () => {
    if (!formData.name || !formData.baseRate) {
      showError('Please fill in required fields (Name, Base Rate)');
      return;
    }

    try {
      // Create or update employee
      const employeeData = {
        name: formData.name,
        employmentType: formData.employmentType,
        hireDate: formData.hireDate,
        baseHourlyRate: parseFloat(formData.baseRate),
        tierLevel: parseInt(formData.tierLevel),
        managementLevelId: formData.managementLevelId,
        reportsToEmployeeId: formData.reportsToEmployeeId,
        totalQualificationPremium:
          costs.primarySkillPremium +
          costs.additionalSkillsPremiums +
          costs.managementPremium +
          costs.certificationPremiums,
        // Legacy fields
        positionCode: formData.positionCode,
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
      };

      // Call parent submit handler (this creates/updates the employee)
      await onSubmit(employeeData);

      // If editing, get the employee ID from initialData
      // If creating, we'll need to get the ID from the response
      // For now, we'll handle skills/certs after employee creation via the parent component
      // This is a simplified approach - in production, you might want to return the ID

      showSuccess(
        isEditing ? 'Employee updated successfully' : 'Employee created successfully'
      );
    } catch (error: any) {
      showError(error.message || 'Failed to save employee');
    }
  };

  // Helper to get track name by ID
  const getTrackName = (trackId: Id<'careerTracks'> | null) => {
    if (!trackId) return 'Unknown';
    const track = careerTracks.find((t) => t._id === trackId);
    return track?.name || 'Unknown';
  };

  // Helper to get certification name by ID
  const getCertificationName = (certId: Id<'certifications'> | null) => {
    if (!certId) return 'Unknown';
    const cert = certifications.find((c) => c._id === certId);
    return cert?.name || 'Unknown';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
              {isEditing ? 'Edit Employee' : 'Add New Employee'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Multi-Track Qualification System
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

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            mt: 2,
            '& .MuiTab-root': {
              color: '#666',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
            },
            '& .Mui-selected': {
              color: '#007AFF !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#007AFF',
            },
          }}
        >
          <Tab label="Basic Info" />
          <Tab label="Primary Skill" />
          <Tab label="Additional Skills" />
          <Tab label="Management" />
          <Tab label="Certifications" />
          <Tab label="Compensation" />
        </Tabs>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, maxHeight: '60vh', overflowY: 'auto' }}>
        {/* TAB 0: BASIC INFO */}
        <TabPanel value={activeTab} index={0}>
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

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                  Employment Type
                </InputLabel>
                <Select
                  value={formData.employmentType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employmentType: e.target.value as any,
                    })
                  }
                  label="Employment Type"
                  sx={{
                    color: '#FFFFFF',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                    '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                  }}
                >
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="seasonal">Seasonal</MenuItem>
                  <MenuItem value="contractor">Contractor</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Hire Date"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
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

            <Divider sx={{ borderColor: '#2A2A2A', my: 1 }} />

            <Typography
              variant="subtitle2"
              sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              BASE COMPENSATION
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
              <TextField
                label="Base Hourly Rate *"
                type="number"
                value={formData.baseRate}
                onChange={(e) => setFormData({ ...formData, baseRate: e.target.value })}
                placeholder="20"
                helperText="$/hr before qualifications"
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

              <FormControl fullWidth>
                <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                  Tier Level
                </InputLabel>
                <Select
                  value={formData.tierLevel}
                  onChange={(e) => setFormData({ ...formData, tierLevel: e.target.value })}
                  label="Tier Level"
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
            </Box>

            <Divider sx={{ borderColor: '#2A2A2A', my: 1 }} />

            <Typography
              variant="subtitle2"
              sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              LEGACY POSITION (Backward Compatibility)
            </Typography>

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                Position Code
              </InputLabel>
              <Select
                value={formData.positionCode}
                onChange={(e) => setFormData({ ...formData, positionCode: e.target.value })}
                label="Position Code"
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
          </Box>
        </TabPanel>

        {/* TAB 1: PRIMARY SKILL */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
              Select the primary career track for this employee. The primary skill receives full
              hourly premium.
            </Typography>

            <Divider sx={{ borderColor: '#2A2A2A' }} />

            <Typography
              variant="subtitle2"
              sx={{ color: '#007AFF', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              ADD PRIMARY SKILL
            </Typography>

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                Career Track
              </InputLabel>
              <Select
                value={newSkill.trackId || ''}
                onChange={(e) =>
                  setNewSkill({
                    ...newSkill,
                    trackId: e.target.value as Id<'careerTracks'>,
                    isPrimary: true,
                  })
                }
                label="Career Track"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {careerTracks.map((track) => (
                  <MenuItem key={track._id} value={track._id}>
                    {track.name} ({track.code}) - ${track.hourlyPremium || 0}/hr
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                  Proficiency Level
                </InputLabel>
                <Select
                  value={newSkill.proficiencyLevel}
                  onChange={(e) =>
                    setNewSkill({
                      ...newSkill,
                      proficiencyLevel: e.target.value as any,
                    })
                  }
                  label="Proficiency Level"
                  sx={{
                    color: '#FFFFFF',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                    '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                  }}
                >
                  <MenuItem value="learning">Learning</MenuItem>
                  <MenuItem value="qualified">Qualified</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Years Experience"
                type="number"
                value={newSkill.yearsExperience || ''}
                onChange={(e) =>
                  setNewSkill({
                    ...newSkill,
                    yearsExperience: parseFloat(e.target.value) || undefined,
                  })
                }
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

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setNewSkill({ ...newSkill, isPrimary: true });
                handleAddSkill();
              }}
              sx={{
                background: '#007AFF',
                '&:hover': { background: '#0066DD' },
              }}
            >
              Set as Primary Skill
            </Button>

            <Divider sx={{ borderColor: '#2A2A2A' }} />

            <Typography
              variant="subtitle2"
              sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              CURRENT PRIMARY SKILL
            </Typography>

            {skills.filter((s) => s.isPrimary).length === 0 ? (
              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                No primary skill set
              </Typography>
            ) : (
              <Paper
                sx={{
                  background: '#0A0A0A',
                  border: '1px solid #007AFF',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Career Track
                      </TableCell>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Proficiency
                      </TableCell>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Experience
                      </TableCell>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skills
                      .filter((s) => s.isPrimary)
                      .map((skill, index) => {
                        const actualIndex = skills.findIndex((s) => s === skill);
                        return (
                          <TableRow key={actualIndex}>
                            <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                              <Chip
                                label={getTrackName(skill.trackId)}
                                size="small"
                                sx={{ background: '#007AFF', color: '#FFFFFF' }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                              {skill.proficiencyLevel}
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                              {skill.yearsExperience || 'N/A'} years
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveSkill(actualIndex)}
                                sx={{ color: '#FF3B30' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* TAB 2: ADDITIONAL SKILLS */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
              Add additional skills for this employee. Additional qualified/expert skills receive
              50% of the hourly premium.
            </Typography>

            <Divider sx={{ borderColor: '#2A2A2A' }} />

            <Typography
              variant="subtitle2"
              sx={{ color: '#007AFF', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              ADD ADDITIONAL SKILL
            </Typography>

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                Career Track
              </InputLabel>
              <Select
                value={newSkill.trackId || ''}
                onChange={(e) =>
                  setNewSkill({
                    ...newSkill,
                    trackId: e.target.value as Id<'careerTracks'>,
                    isPrimary: false,
                  })
                }
                label="Career Track"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {careerTracks.map((track) => (
                  <MenuItem key={track._id} value={track._id}>
                    {track.name} ({track.code}) - ${(track.hourlyPremium || 0) * 0.5}/hr (50%)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                  Proficiency Level
                </InputLabel>
                <Select
                  value={newSkill.proficiencyLevel}
                  onChange={(e) =>
                    setNewSkill({
                      ...newSkill,
                      proficiencyLevel: e.target.value as any,
                    })
                  }
                  label="Proficiency Level"
                  sx={{
                    color: '#FFFFFF',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                    '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                  }}
                >
                  <MenuItem value="learning">Learning</MenuItem>
                  <MenuItem value="qualified">Qualified</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Years Experience"
                type="number"
                value={newSkill.yearsExperience || ''}
                onChange={(e) =>
                  setNewSkill({
                    ...newSkill,
                    yearsExperience: parseFloat(e.target.value) || undefined,
                  })
                }
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

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setNewSkill({ ...newSkill, isPrimary: false });
                handleAddSkill();
              }}
              sx={{
                borderColor: '#007AFF',
                color: '#007AFF',
                '&:hover': { borderColor: '#0066DD', background: 'rgba(0, 122, 255, 0.1)' },
              }}
            >
              Add Additional Skill
            </Button>

            <Divider sx={{ borderColor: '#2A2A2A' }} />

            <Typography
              variant="subtitle2"
              sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              ADDITIONAL SKILLS
            </Typography>

            {skills.filter((s) => !s.isPrimary).length === 0 ? (
              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                No additional skills added
              </Typography>
            ) : (
              <Paper
                sx={{
                  background: '#0A0A0A',
                  border: '1px solid #2A2A2A',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Career Track
                      </TableCell>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Proficiency
                      </TableCell>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Experience
                      </TableCell>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skills
                      .filter((s) => !s.isPrimary)
                      .map((skill, index) => {
                        const actualIndex = skills.findIndex((s) => s === skill);
                        return (
                          <TableRow key={actualIndex}>
                            <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                              {getTrackName(skill.trackId)}
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                              {skill.proficiencyLevel}
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                              {skill.yearsExperience || 'N/A'} years
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleSetPrimarySkill(actualIndex)}
                                  sx={{
                                    borderColor: '#007AFF',
                                    color: '#007AFF',
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  Set Primary
                                </Button>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveSkill(actualIndex)}
                                  sx={{ color: '#FF3B30' }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* TAB 3: MANAGEMENT */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
              Assign management level and reporting structure for this employee.
            </Typography>

            <Divider sx={{ borderColor: '#2A2A2A' }} />

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                Management Level
              </InputLabel>
              <Select
                value={formData.managementLevelId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    managementLevelId: (e.target.value as Id<'managementLevels'>) || null,
                  })
                }
                label="Management Level"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                }}
              >
                <MenuItem value="">
                  <em>None - Individual Contributor</em>
                </MenuItem>
                {managementLevels.map((level) => (
                  <MenuItem key={level._id} value={level._id}>
                    Level {level.level} - {level.title} ({level.code}) - $
                    {level.hourlyPremium}/hr
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                Reports To
              </InputLabel>
              <Select
                value={formData.reportsToEmployeeId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reportsToEmployeeId: (e.target.value as Id<'employees'>) || null,
                  })
                }
                label="Reports To"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {employees
                  .filter((emp) => emp._id !== initialData?._id)
                  .map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {emp.name} - {emp.positionCode || emp.position}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <Divider sx={{ borderColor: '#2A2A2A' }} />

            <Typography
              variant="subtitle2"
              sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              MANAGEMENT SUMMARY
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
                  Management Level:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  {formData.managementLevelId
                    ? managementLevels.find((m) => m._id === formData.managementLevelId)?.title ||
                      'Unknown'
                    : 'None'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                  Management Premium:
                </Typography>
                <Typography variant="body2" sx={{ color: '#007AFF', fontWeight: 600 }}>
                  ${costs.managementPremium.toFixed(2)}/hr
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                  Reports To:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  {formData.reportsToEmployeeId
                    ? employees.find((e) => e._id === formData.reportsToEmployeeId)?.name ||
                      'Unknown'
                    : 'None'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* TAB 4: CERTIFICATIONS */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
              Add professional certifications for this employee. Each certification may add an
              hourly premium.
            </Typography>

            <Divider sx={{ borderColor: '#2A2A2A' }} />

            <Typography
              variant="subtitle2"
              sx={{ color: '#007AFF', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              ADD CERTIFICATION
            </Typography>

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                Certification
              </InputLabel>
              <Select
                value={newCertif.certificationId || ''}
                onChange={(e) =>
                  setNewCertif({
                    ...newCertif,
                    certificationId: e.target.value as Id<'certifications'>,
                  })
                }
                label="Certification"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {certifications.map((cert) => (
                  <MenuItem key={cert._id} value={cert._id}>
                    {cert.name} ({cert.code}) - ${cert.hourlyPremium || 0}/hr
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Date Earned"
                type="date"
                value={newCertif.dateEarned}
                onChange={(e) =>
                  setNewCertif({
                    ...newCertif,
                    dateEarned: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
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
                label="Expires At (Optional)"
                type="date"
                value={newCertif.expiresAt || ''}
                onChange={(e) =>
                  setNewCertif({
                    ...newCertif,
                    expiresAt: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
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

            <TextField
              label="Certification Number (Optional)"
              value={newCertif.certificationNumber || ''}
              onChange={(e) =>
                setNewCertif({
                  ...newCertif,
                  certificationNumber: e.target.value,
                })
              }
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

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddCertification}
              sx={{
                borderColor: '#007AFF',
                color: '#007AFF',
                '&:hover': { borderColor: '#0066DD', background: 'rgba(0, 122, 255, 0.1)' },
              }}
            >
              Add Certification
            </Button>

            <Divider sx={{ borderColor: '#2A2A2A' }} />

            <Typography
              variant="subtitle2"
              sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              CERTIFICATIONS
            </Typography>

            {certifs.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                No certifications added
              </Typography>
            ) : (
              <Paper
                sx={{
                  background: '#0A0A0A',
                  border: '1px solid #2A2A2A',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Certification
                      </TableCell>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Date Earned
                      </TableCell>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Expires
                      </TableCell>
                      <TableCell sx={{ color: '#B3B3B3', borderColor: '#2A2A2A' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {certifs.map((cert, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                          {getCertificationName(cert.certificationId)}
                        </TableCell>
                        <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                          {cert.dateEarned}
                        </TableCell>
                        <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                          {cert.expiresAt || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ color: '#FFFFFF', borderColor: '#2A2A2A' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveCertification(index)}
                            sx={{ color: '#FF3B30' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* TAB 5: COMPENSATION */}
        <TabPanel value={activeTab} index={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
              Review the complete compensation breakdown including all qualifications and
              multipliers.
            </Typography>

            <Divider sx={{ borderColor: '#2A2A2A' }} />

            <Typography
              variant="subtitle2"
              sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              QUALIFICATION BREAKDOWN
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
                  Base Rate:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  ${costs.baseRate.toFixed(2)}/hr
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                  × Tier {formData.tierLevel} Multiplier:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  {costs.tierMultiplier}x
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#2A2A2A', my: 1.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#007AFF' }}>
                  Base after Tier:
                </Typography>
                <Typography variant="body2" sx={{ color: '#007AFF', fontWeight: 600 }}>
                  ${(costs.baseRate * costs.tierMultiplier).toFixed(2)}/hr
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#2A2A2A', my: 1.5 }} />

              <Typography
                variant="caption"
                sx={{
                  color: '#666',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                  display: 'block',
                  mb: 1,
                }}
              >
                PREMIUMS
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                  + Primary Skill:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  ${costs.primarySkillPremium.toFixed(2)}/hr
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                  + Additional Skills (50%):
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  ${costs.additionalSkillsPremiums.toFixed(2)}/hr
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                  + Management:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  ${costs.managementPremium.toFixed(2)}/hr
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                  + Certifications:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  ${costs.certificationPremiums.toFixed(2)}/hr
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#007AFF', my: 1.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3', fontWeight: 600 }}>
                  Total Qualification Rate:
                </Typography>
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  ${costs.qualificationRate.toFixed(2)}/hr
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1.5 }}>
                This is what the employee earns
              </Typography>

              <Divider sx={{ borderColor: '#007AFF', my: 1.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  × Burden Multiplier ({costs.burdenMultiplier}x):
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Taxes, benefits, insurance
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#007AFF', my: 1.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ color: '#007AFF', fontWeight: 600 }}>
                  FINAL EFFECTIVE RATE
                </Typography>
                <Typography variant="h5" sx={{ color: '#007AFF', fontWeight: 700 }}>
                  ${costs.effectiveRate.toFixed(2)}/hr
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
                True cost to company per hour
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#2A2A2A' }} />

            <Typography
              variant="subtitle2"
              sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              ANNUAL PROJECTIONS
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
                  Employee Earnings (2000 hrs):
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  ${(costs.qualificationRate * 2000).toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                  Total Company Cost (2000 hrs):
                </Typography>
                <Typography variant="body2" sx={{ color: '#007AFF', fontWeight: 700 }}>
                  ${costs.annualCost.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </TabPanel>
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
