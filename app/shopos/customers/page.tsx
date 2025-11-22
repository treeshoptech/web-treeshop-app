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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { Id } from '@/convex/_generated/dataModel';
import CustomerFormModal from '@/components/CustomerFormModal';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import DirectoryCard from '@/components/DirectoryCard';

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
            background: '#1C1C1E',
            border: '1px solid #2A2A2A',
            textAlign: 'center',
            py: 6,
          }}
        >
          <CardContent>
            <PersonIcon sx={{ fontSize: 60, color: '#8E8E93', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#B3B3B3', fontWeight: 600, mb: 2 }}>
              No customers yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#8E8E93' }}>
              Click "Add Customer" to create your first customer record
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {customers.map((customer) => {
            const fullName = `${customer.firstName} ${customer.lastName}`;
            const fullAddress = `${customer.streetAddress}, ${customer.city}, ${customer.state} ${customer.zipCode}`;

            return (
              <DirectoryCard
                key={customer._id}
                id={customer._id}
                icon={<PersonIcon />}
                title={fullName}
                subtitle={customer.businessName || customer.streetAddress}
                badges={
                  customer.propertyType
                    ? [
                        {
                          label: customer.propertyType,
                          color: customer.propertyType === 'Commercial' ? '#007AFF' : '#666',
                        },
                      ]
                    : undefined
                }
                collapsedMetrics={[
                  ...(customer.phone
                    ? [
                        {
                          label: 'Phone',
                          value: customer.phone,
                          icon: <PhoneIcon fontSize="small" />,
                          color: '#007AFF',
                        },
                      ]
                    : []),
                  ...(customer.email
                    ? [
                        {
                          label: 'Email',
                          value: customer.email,
                          icon: <EmailIcon fontSize="small" />,
                          color: '#007AFF',
                        },
                      ]
                    : []),
                ]}
                expandedDetails={[
                  { label: 'First Name', value: customer.firstName },
                  { label: 'Last Name', value: customer.lastName },
                  ...(customer.businessName
                    ? [{ label: 'Business Name', value: customer.businessName }]
                    : []),
                  { label: 'Street Address', value: customer.streetAddress },
                  { label: 'City', value: customer.city },
                  { label: 'State', value: customer.state },
                  { label: 'Zip Code', value: customer.zipCode },
                  ...(customer.phone ? [{ label: 'Phone', value: customer.phone }] : []),
                  ...(customer.email ? [{ label: 'Email', value: customer.email }] : []),
                  ...(customer.propertyType
                    ? [{ label: 'Property Type', value: customer.propertyType }]
                    : []),
                  { label: 'Full Address', value: fullAddress, fullWidth: true },
                ]}
                notes={customer.notes}
                actions={[
                  {
                    icon: <EditIcon />,
                    label: 'Edit',
                    onClick: () => handleOpenForm(customer),
                    color: 'primary',
                  },
                  {
                    icon: <DeleteIcon />,
                    label: 'Delete',
                    onClick: () => handleDelete(customer._id),
                    color: 'error',
                    divider: true,
                  },
                ]}
                onCardClick={() => router.push(`/shopos/customers/${customer._id}`)}
              />
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
