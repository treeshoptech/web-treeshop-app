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
  Alert,
} from '@mui/material';
import { useSnackbar } from '@/app/contexts/SnackbarContext';
import { useOrganization, OrganizationSwitcher, UserProfile } from '@clerk/nextjs';

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
  const { organization } = useOrganization();
  const company = useQuery(api.companies.getCompany);
  const companyRates = useQuery(api.companies.getCompanyProductionRates);
  const saveCompany = useMutation(api.companies.createOrUpdateCompany);
  const saveRate = useMutation(api.companies.upsertCompanyProductionRate);
  const { showError, showSuccess } = useSnackbar();

  const [tabValue, setTabValue] = useState(0);

  // Listen for organization changes
  useEffect(() => {
    if (organization) {
      console.log('Settings page - Organization changed:', {
        id: organization.id,
        name: organization.name,
      });
    }
  }, [organization?.id]);

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
      showError('Company name is required');
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
      showSuccess('Company settings saved');
    } catch (error: any) {
      showError(error.message);
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

      <Card sx={{ background: '#1C1C1E', border: '1px solid #2A2A2A' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: '1px solid #2A2A2A',
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
          <Tab label="Organization" />
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
                <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                  No production rates set. Add rates for services you offer.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {companyRates.map((rate) => (
                    <Box
                      key={rate._id}
                      sx={{
                        p: 2,
                        background: '#0A0A0A',
                        border: '1px solid #2A2A2A',
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                            {rate.serviceType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                            {rate.averageRatePerDay} {rate.unit}/day
                            {rate.conditions && ` (${rate.conditions})`}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              <Typography variant="caption" sx={{ color: '#8E8E93', fontStyle: 'italic' }}>
                Production rate management UI coming soon
              </Typography>
            </Box>
          </CardContent>
        </TabPanel>

        {/* ORGANIZATION TAB */}
        <TabPanel value={tabValue} index={2}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 1 }}>
                  Organization Settings
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                  Manage your organization membership and switch between organizations.
                </Typography>
              </Box>

              {organization && (
                <>
                  <Alert severity="info" sx={{
                    background: 'rgba(0, 122, 255, 0.1)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(0, 122, 255, 0.3)',
                    '& .MuiAlert-icon': {
                      color: '#007AFF',
                    }
                  }}>
                    Currently active organization: <strong>{organization.name}</strong>
                  </Alert>

                  <Divider sx={{ borderColor: '#2A2A2A' }} />

                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em', mb: 2 }}>
                      ORGANIZATION SWITCHER
                    </Typography>
                    <Box sx={{
                      p: 3,
                      background: '#0A0A0A',
                      border: '1px solid #2A2A2A',
                      borderRadius: 2,
                    }}>
                      <Typography variant="body2" sx={{ color: '#B3B3B3', mb: 2 }}>
                        Switch between organizations or create a new one:
                      </Typography>
                      <OrganizationSwitcher
                        appearance={{
                          elements: {
                            rootBox: {
                              width: '100%',
                            },
                            organizationSwitcherTrigger: {
                              width: '100%',
                              padding: '12px 16px',
                              background: 'rgba(0, 122, 255, 0.1)',
                              border: '1px solid rgba(0, 122, 255, 0.3)',
                              borderRadius: '8px',
                              color: '#FFFFFF',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              '&:hover': {
                                background: 'rgba(0, 122, 255, 0.15)',
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: '#2A2A2A' }} />

                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em', mb: 2 }}>
                      HOW ORGANIZATION SWITCHING WORKS
                    </Typography>
                    <Box sx={{
                      p: 3,
                      background: '#0A0A0A',
                      border: '1px solid #2A2A2A',
                      borderRadius: 2,
                    }}>
                      <Typography variant="body2" sx={{ color: '#B3B3B3', mb: 2 }}>
                        When you switch organizations:
                      </Typography>
                      <Box component="ul" sx={{ color: '#B3B3B3', pl: 2, mb: 0 }}>
                        <li>All data automatically refreshes to show the new organization's data</li>
                        <li>Projects, customers, employees, and equipment are filtered by organization</li>
                        <li>Your settings and preferences remain intact</li>
                        <li>No stale data from the previous organization is retained</li>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </TabPanel>

        {/* ACCOUNT TAB */}
        <TabPanel value={tabValue} index={3}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 1 }}>
                  User Profile
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                  Manage your personal account settings, security preferences, and profile information.
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#2A2A2A' }} />

              <Box
                sx={{
                  '& .cl-rootBox': {
                    width: '100%',
                  },
                  '& .cl-card': {
                    background: 'transparent',
                    boxShadow: 'none',
                    border: 'none',
                  },
                  '& .cl-navbar': {
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  },
                  '& .cl-navbarButton': {
                    color: '#8E8E93',
                    '&:hover': {
                      background: 'rgba(0, 122, 255, 0.1)',
                      color: '#007AFF',
                    },
                  },
                  '& .cl-navbarButtonActive': {
                    background: 'rgba(0, 122, 255, 0.15)',
                    color: '#007AFF',
                    fontWeight: 600,
                  },
                  '& .cl-pageScrollBox': {
                    background: 'transparent',
                  },
                  '& .cl-formButtonPrimary': {
                    background: '#007AFF',
                    '&:hover': {
                      background: '#0066DD',
                    },
                  },
                  '& .cl-formFieldInput': {
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid #2A2A2A',
                    color: '#FFFFFF',
                    '&:hover': {
                      borderColor: '#007AFF',
                    },
                    '&:focus': {
                      borderColor: '#007AFF',
                    },
                  },
                  '& .cl-headerTitle': {
                    color: '#FFFFFF',
                  },
                  '& .cl-headerSubtitle': {
                    color: '#8E8E93',
                  },
                  '& .cl-profileSectionTitle': {
                    color: '#FFFFFF',
                  },
                  '& .cl-profileSectionContent': {
                    color: '#B3B3B3',
                  },
                }}
              >
                <UserProfile
                  appearance={{
                    elements: {
                      rootBox: {
                        width: '100%',
                      },
                      card: {
                        background: 'transparent',
                        boxShadow: 'none',
                        border: 'none',
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </TabPanel>
      </Card>
    </Container>
  );
}
