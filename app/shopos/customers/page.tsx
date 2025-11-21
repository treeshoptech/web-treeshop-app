'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import { Id } from '@/convex/_generated/dataModel';
import CustomerFormModal from '@/components/CustomerFormModal';
import { useSnackbar } from '@/app/contexts/SnackbarContext';

export default function CustomersPage() {
  const router = useRouter();
  const customers = useQuery(api.customers.listCustomers);
  const createCustomer = useMutation(api.customers.createCustomer);
  const updateCustomer = useMutation(api.customers.updateCustomer);
  const deleteCustomer = useMutation(api.customers.deleteCustomer);
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
        await updateCustomer({
          customerId: editingItem._id,
          ...data,
        });
      } else {
        await createCustomer(data);
      }
      setFormOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleDelete = async (id: Id<'customers'>) => {
    showConfirm(
      'Delete this customer? This cannot be undone.',
      async () => {
        try {
          await deleteCustomer({ customerId: id });
        } catch (error: any) {
          showError(error.message);
        }
      },
      'Delete Customer'
    );
  };

  if (customers === undefined) {
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
          Customers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{
            background: '#007AFF',
            '&:hover': { background: '#0066DD' },
          }}
        >
          Add Customer
        </Button>
      </Box>

      {customers.length === 0 ? (
        <Card
          sx={{
            background: '#1A1A1A',
            textAlign: 'center',
            py: 6,
          }}
        >
          <CardContent>
            <PersonIcon sx={{ fontSize: 60, color: '#666', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#B3B3B3', mb: 2 }}>
              No customers yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Click "Add Customer" to create your first customer record
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {customers.map((customer) => {
            const fullName = customer.businessName
              ? `${customer.firstName} ${customer.lastName} (${customer.businessName})`
              : `${customer.firstName} ${customer.lastName}`;
            const fullAddress = `${customer.streetAddress}, ${customer.city}, ${customer.state} ${customer.zipCode}`;

            return (
              <Card
                key={customer._id}
                onClick={() => router.push(`/customers/${customer._id}`)}
                sx={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    background: '#222',
                    borderColor: '#007AFF',
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{ color: '#FFFFFF', fontWeight: 600 }}
                        >
                          {fullName}
                        </Typography>
                        {customer.propertyType && (
                          <Chip
                            label={customer.propertyType}
                            size="small"
                            sx={{
                              background: customer.propertyType === 'Commercial' ? '#007AFF' : '#666',
                              color: '#FFFFFF',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ color: '#666', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                            {fullAddress}
                          </Typography>
                        </Box>

                        {customer.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ color: '#666', fontSize: 18 }} />
                            <Typography variant="body2" sx={{ color: '#007AFF' }}>
                              {customer.phone}
                            </Typography>
                          </Box>
                        )}

                        {customer.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon sx={{ color: '#666', fontSize: 18 }} />
                            <Typography variant="body2" sx={{ color: '#007AFF' }}>
                              {customer.email}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Box
                      sx={{ display: 'flex', gap: 1 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        onClick={() => handleOpenForm(customer)}
                        sx={{
                          color: '#007AFF',
                          '&:hover': { background: 'rgba(0, 122, 255, 0.1)' },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(customer._id)}
                        sx={{
                          color: '#FF3B30',
                          '&:hover': { background: 'rgba(255, 59, 48, 0.1)' },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Add/Edit Customer Modal */}
      <CustomerFormModal
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
