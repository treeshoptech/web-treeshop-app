'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
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
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import { Id } from '@/convex/_generated/dataModel';
import { useSnackbar } from '@/app/contexts/SnackbarContext';

interface CreateWorkOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customerId: Id<'customers'>;
    startDate?: string;
    status?: 'draft' | 'sent' | 'accepted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    assignedCrewId?: Id<'crews'>;
    assignedLoadoutId?: Id<'loadouts'>;
  }) => void;
  customers: any[];
  crews: any[];
  loadouts: any[];
}

export default function CreateWorkOrderModal({
  open,
  onClose,
  onSubmit,
  customers,
  crews,
  loadouts,
}: CreateWorkOrderModalProps) {
  const createCustomer = useMutation(api.customers.createCustomer);
  const { showError } = useSnackbar();

  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [customerId, setCustomerId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [assignedCrewId, setAssignedCrewId] = useState<string>('');
  const [assignedLoadoutId, setAssignedLoadoutId] = useState<string>('');

  // New customer form fields
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: '',
  });

  const selectedCustomer = customers.find((c) => c._id === customerId);

  const handleSubmit = async () => {
    let finalCustomerId = customerId;

    // If creating new customer, create it first
    if (mode === 'create') {
      if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.streetAddress || !newCustomer.city || !newCustomer.state || !newCustomer.zipCode) {
        showError('Please fill in all required customer fields (Name, Address, City, State, Zip)');
        return;
      }

      try {
        finalCustomerId = await createCustomer({
          firstName: newCustomer.firstName,
          lastName: newCustomer.lastName,
          businessName: newCustomer.businessName || undefined,
          phone: newCustomer.phone || undefined,
          email: newCustomer.email || undefined,
          streetAddress: newCustomer.streetAddress,
          city: newCustomer.city,
          state: newCustomer.state,
          zipCode: newCustomer.zipCode,
          propertyType: newCustomer.propertyType || undefined,
          howDidTheyFindUs: undefined,
          notes: undefined,
        });
      } catch (error: any) {
        console.error('Error creating customer:', error);
        showError('Error creating customer: ' + (error.message || 'Unknown error'));
        return;
      }
    } else if (!customerId) {
      showError('Please select a customer');
      return;
    }

    onSubmit({
      customerId: finalCustomerId as Id<'customers'>,
      status: 'draft', // Always start as draft
      notes: notes || undefined,
      assignedCrewId: assignedCrewId ? (assignedCrewId as Id<'crews'>) : undefined,
      assignedLoadoutId: assignedLoadoutId ? (assignedLoadoutId as Id<'loadouts'>) : undefined,
    });

    // Reset form
    setMode('select');
    setCustomerId('');
    setNotes('');
    setAssignedCrewId('');
    setNewCustomer({
      firstName: '',
      lastName: '',
      businessName: '',
      phone: '',
      email: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      propertyType: '',
    });
  };

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
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            Create New Project
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Job number will be auto-generated
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Mode Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(e, newMode) => newMode && setMode(newMode)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  color: '#B3B3B3',
                  borderColor: '#2A2A2A',
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: '#FFFFFF',
                    background: '#007AFF',
                    borderColor: '#007AFF',
                    '&:hover': {
                      background: '#0066DD',
                    },
                  },
                  '&:hover': {
                    background: 'rgba(0, 122, 255, 0.1)',
                  },
                },
              }}
            >
              <ToggleButton value="select">
                <SearchIcon sx={{ mr: 1, fontSize: 18 }} /> Select Existing
              </ToggleButton>
              <ToggleButton value="create">
                <PersonAddIcon sx={{ mr: 1, fontSize: 18 }} /> Create New
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* SELECT MODE: Choose existing customer */}
          {mode === 'select' && (
            <>
              <Divider sx={{ borderColor: '#2A2A2A' }} />

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, mb: 2, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  CUSTOMER
                </Typography>

                <FormControl fullWidth>
                <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                  Customer *
                </InputLabel>
                <Select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  label="Customer *"
                  sx={{
                    color: '#FFFFFF',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                    '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                  }}
                >
                  {customers.length === 0 ? (
                    <MenuItem value="" disabled>
                      No customers yet - create one instead
                    </MenuItem>
                  ) : (
                    customers.map((customer) => {
                      const fullName = customer.businessName
                        ? `${customer.firstName} ${customer.lastName} (${customer.businessName})`
                        : `${customer.firstName} ${customer.lastName}`;
                      return (
                        <MenuItem key={customer._id} value={customer._id}>
                          {fullName} - {customer.city}, {customer.state}
                        </MenuItem>
                      );
                    })
                  )}
                </Select>

                {/* Show selected customer details */}
                {selectedCustomer && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      background: '#0A0A0A',
                      border: '1px solid #2A2A2A',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#FFFFFF', mb: 0.5 }}>
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                      {selectedCustomer.businessName && ` (${selectedCustomer.businessName})`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                      {selectedCustomer.streetAddress}, {selectedCustomer.city}, {selectedCustomer.state}
                    </Typography>
                    {selectedCustomer.phone && (
                      <Typography variant="caption" sx={{ color: '#007AFF', display: 'block', mt: 0.5 }}>
                        {selectedCustomer.phone}
                      </Typography>
                    )}
                  </Box>
                )}
              </FormControl>
              </Box>
            </>
          )}

          {/* CREATE MODE: New customer form */}
          {mode === 'create' && (
            <>
              <Divider sx={{ borderColor: '#2A2A2A' }} />

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, mb: 2, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  NEW CUSTOMER
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="First Name *"
                  value={newCustomer.firstName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
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
                  label="Last Name *"
                  value={newCustomer.lastName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
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
                fullWidth
                label="Business Name (Optional)"
                value={newCustomer.businessName}
                onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value })}
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
                  label="Phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
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
                  label="Email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
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
                fullWidth
                label="Street Address *"
                value={newCustomer.streetAddress}
                onChange={(e) => setNewCustomer({ ...newCustomer, streetAddress: e.target.value })}
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

              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 2 }}>
                <TextField
                  label="City *"
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
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
                  label="State *"
                  value={newCustomer.state}
                  onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                  placeholder="FL"
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
                  label="Zip *"
                  value={newCustomer.zipCode}
                  onChange={(e) => setNewCustomer({ ...newCustomer, zipCode: e.target.value })}
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

              <FormControl fullWidth>
                <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                  Property Type
                </InputLabel>
                <Select
                  value={newCustomer.propertyType}
                  onChange={(e) => setNewCustomer({ ...newCustomer, propertyType: e.target.value })}
                  label="Property Type"
                  sx={{
                    color: '#FFFFFF',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                    '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Residential">Residential</MenuItem>
                  <MenuItem value="Commercial">Commercial</MenuItem>
                  <MenuItem value="Municipal">Municipal</MenuItem>
                </Select>
              </FormControl>
                </Box>
              </Box>
            </>
          )}

          <Divider sx={{ borderColor: '#2A2A2A' }} />

          {/* JOB DETAILS SECTION */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, mb: 2, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              JOB DETAILS
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              {loadouts.length > 0 && (
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                    Assign Loadout (Recommended)
                  </InputLabel>
                  <Select
                    value={assignedLoadoutId}
                    onChange={(e) => setAssignedLoadoutId(e.target.value)}
                    label="Assign Loadout (Recommended)"
                    sx={{
                      color: '#FFFFFF',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                      '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                    }}
                  >
                    <MenuItem value="">
                      <em>No loadout - crew only</em>
                    </MenuItem>
                    {loadouts.map((loadout) => (
                      <MenuItem key={loadout._id} value={loadout._id}>
                        {loadout.name} (${loadout.totalHourlyCost?.toFixed(0)}/hr)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions or notes..."
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
          </Box>

          <Box
            sx={{
              p: 1.5,
              background: 'rgba(0, 122, 255, 0.05)',
              border: '1px solid rgba(0, 122, 255, 0.2)',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
              After creating:
            </Typography>
            <Typography variant="caption" sx={{ color: '#B3B3B3', lineHeight: 1.6 }}>
              Default project phases will be created: Transport to Site → Site Setup → (Your Production Tasks) → Site Cleanup → Transport Back to Shop. Add billable tasks like Forestry Mulching, Tree Removal, etc.
            </Typography>
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
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
}
