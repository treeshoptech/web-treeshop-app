'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';

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
      id={`settings-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const company = useQuery(api.companies.getCompany);
  const companyRates = useQuery(api.companies.getCompanyProductionRates);
  const saveCompany = useMutation(api.companies.createOrUpdateCompany);
  const saveRate = useMutation(api.companies.upsertCompanyProductionRate);

  const [tabValue, setTabValue] = useState(0);

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    defaultProfitMargin: '30',
    sops: '',
  });

  // Load company data when available
  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name,
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zipCode: company.zipCode || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        defaultProfitMargin: company.defaultProfitMargin.toString(),
        sops: company.sops || '',
      });
    }
  }, [company]);

  const handleSaveCompany = async () => {
    if (!companyForm.name) {
      alert('Company name is required');
      return;
    }

    try {
      await saveCompany({
        name: companyForm.name,
        address: companyForm.address || undefined,
        city: companyForm.city || undefined,
        state: companyForm.state || undefined,
        zipCode: companyForm.zipCode || undefined,
        phone: companyForm.phone || undefined,
        email: companyForm.email || undefined,
        website: companyForm.website || undefined,
        defaultProfitMargin: parseFloat(companyForm.defaultProfitMargin) || 30,
        sops: companyForm.sops || undefined,
      });
      alert('Company settings saved');
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (company === undefined || companyRates === undefined) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#FFFFFF', mb: 4 }}>
        Settings
      </Typography>

      <Card sx={{ background: 'rgba(28, 28, 30, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            '& .MuiTab-root': {
              color: '#8E8E93',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
            },
            '& .Mui-selected': {
              color: '#007AFF',
            },
          }}
        >
          <Tab label="Company" />
          <Tab label="Production Rates" />
          <Tab label="Account" />
        </Tabs>

        {/* COMPANY TAB */}
        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                COMPANY INFORMATION
              </Typography>

              <TextField
                fullWidth
                label="Company Name *"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
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
                label="Street Address"
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
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
                  label="City"
                  value={companyForm.city}
                  onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
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
                  label="State"
                  value={companyForm.state}
                  onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
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
                  label="Zip"
                  value={companyForm.zipCode}
                  onChange={(e) => setCompanyForm({ ...companyForm, zipCode: e.target.value })}
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
                  label="Phone"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
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
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
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
                label="Website"
                value={companyForm.website}
                onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
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
                FINANCIAL SETTINGS
              </Typography>

              <TextField
                fullWidth
                label="Default Profit Margin (%)"
                type="number"
                value={companyForm.defaultProfitMargin}
                onChange={(e) => setCompanyForm({ ...companyForm, defaultProfitMargin: e.target.value })}
                helperText="Default profit margin % for new projects"
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

              <Divider sx={{ borderColor: '#2A2A2A' }} />

              <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                STANDARD OPERATING PROCEDURES
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={8}
                label="Company SOPs"
                value={companyForm.sops}
                onChange={(e) => setCompanyForm({ ...companyForm, sops: e.target.value })}
                placeholder="Enter company SOPs, safety procedures, quality standards, etc..."
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
                variant="contained"
                size="large"
                onClick={handleSaveCompany}
                sx={{
                  background: '#007AFF',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  alignSelf: 'flex-start',
                  '&:hover': { background: '#0066DD' },
                }}
              >
                Save Company Settings
              </Button>
            </Box>
          </CardContent>
        </TabPanel>

        {/* PRODUCTION RATES TAB */}
        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 1 }}>
                  Company Production Rate Defaults
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                  Set average production rates used for pricing and proposals. Actual loadout performance is tracked separately.
                </Typography>
              </Box>

              {companyRates.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  No production rates set. Add rates for services you offer.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {companyRates.map((rate) => (
                    <Box
                      key={rate._id}
                      sx={{
                        p: 2,
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                            {rate.serviceType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {rate.averageRatePerDay} {rate.unit}/day
                            {rate.conditions && ` (${rate.conditions})`}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic' }}>
                Production rate management UI coming soon
              </Typography>
            </Box>
          </CardContent>
        </TabPanel>

        {/* ACCOUNT TAB */}
        <TabPanel value={tabValue} index={2}>
          <CardContent>
            <Typography variant="body2" sx={{ color: '#666' }}>
              User account settings coming soon
            </Typography>
          </CardContent>
        </TabPanel>
      </Card>
    </Container>
  );
}
