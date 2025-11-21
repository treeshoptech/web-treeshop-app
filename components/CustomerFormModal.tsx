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
} from '@mui/material';
import { useSnackbar } from '@/app/contexts/SnackbarContext';

interface CustomerFormData {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  howDidTheyFindUs: string;
  notes: string;
}

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEditing: boolean;
}

export default function CustomerFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: CustomerFormModalProps) {
  const { showError } = useSnackbar();
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    streetAddress: '',
    city: '',
    state: 'FL',
    zipCode: '',
    propertyType: 'Residential',
    howDidTheyFindUs: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        businessName: initialData.businessName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        alternatePhone: initialData.alternatePhone || '',
        streetAddress: initialData.streetAddress || '',
        city: initialData.city || '',
        state: initialData.state || 'FL',
        zipCode: initialData.zipCode || '',
        propertyType: initialData.propertyType || 'Residential',
        howDidTheyFindUs: initialData.howDidTheyFindUs || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.streetAddress || !formData.city || !formData.state || !formData.zipCode) {
      showError('Please fill in all required fields');
      return;
    }

    onSubmit({
      firstName: formData.firstName,
      lastName: formData.lastName,
      businessName: formData.businessName || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      alternatePhone: formData.alternatePhone || undefined,
      streetAddress: formData.streetAddress,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      propertyType: formData.propertyType || undefined,
      howDidTheyFindUs: formData.howDidTheyFindUs || undefined,
      notes: formData.notes || undefined,
    });
  };

  const textFieldSx = {
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
            {isEditing ? 'Edit Customer' : 'Add New Customer'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Complete customer profile for projects
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Personal Info */}
          <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 600 }}>
            PERSONAL INFORMATION
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="First Name *"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="John"
              sx={textFieldSx}
            />

            <TextField
              label="Last Name *"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Smith"
              sx={textFieldSx}
            />
          </Box>

          <TextField
            fullWidth
            label="Business Name"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            placeholder="e.g., ABC Property Management (if commercial)"
            sx={textFieldSx}
          />

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          {/* Contact Info */}
          <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 600 }}>
            CONTACT INFORMATION
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="386-555-0123"
              sx={textFieldSx}
            />

            <TextField
              label="Alternate Phone"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              placeholder="407-555-9876"
              sx={textFieldSx}
            />
          </Box>

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john.smith@example.com"
            sx={textFieldSx}
          />

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          {/* Address */}
          <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 600 }}>
            PROPERTY ADDRESS
          </Typography>

          <TextField
            fullWidth
            label="Street Address *"
            value={formData.streetAddress}
            onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
            placeholder="123 Oak Street"
            sx={textFieldSx}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 2 }}>
            <TextField
              label="City *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="New Smyrna Beach"
              sx={textFieldSx}
            />

            <TextField
              label="State *"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="FL"
              sx={textFieldSx}
            />

            <TextField
              label="ZIP Code *"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              placeholder="32168"
              sx={textFieldSx}
            />
          </Box>

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          {/* Additional Info */}
          <Typography variant="subtitle2" sx={{ color: '#007AFF', fontWeight: 600 }}>
            ADDITIONAL INFORMATION
          </Typography>

          <FormControl fullWidth>
            <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
              Property Type
            </InputLabel>
            <Select
              value={formData.propertyType}
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
              label="Property Type"
              sx={{
                color: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '& .MuiSvgIcon-root': { color: '#FFFFFF' },
              }}
            >
              <MenuItem value="Residential">Residential</MenuItem>
              <MenuItem value="Commercial">Commercial</MenuItem>
              <MenuItem value="Municipal">Municipal / Government</MenuItem>
              <MenuItem value="HOA">HOA / Property Management</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="How Did They Find Us?"
            value={formData.howDidTheyFindUs}
            onChange={(e) => setFormData({ ...formData, howDidTheyFindUs: e.target.value })}
            placeholder="e.g., Google, Referral, Facebook, etc."
            sx={textFieldSx}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes about this customer..."
            sx={textFieldSx}
          />
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
          {isEditing ? 'Update Customer' : 'Create Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
