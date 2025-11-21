'use client';

import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import { useUser, useOrganization, SignOutButton, UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  const { user } = useUser();
  const { organization } = useOrganization();

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h5" sx={{ color: '#FFFFFF', textAlign: 'center' }}>
          Loading profile...
        </Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1A1A1A 100%)',
        pt: 10,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              color: '#FFFFFF',
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            User Profile
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#8E8E93',
              fontSize: '1.1rem',
            }}
          >
            Manage your account settings and preferences
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          {/* Left Column - User Info Card */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 350px' } }}>
            <Paper
              elevation={0}
              sx={{
                background: 'rgba(28, 28, 30, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 4,
                p: 4,
                textAlign: 'center',
              }}
            >
              {/* Avatar */}
              <Avatar
                src={user.imageUrl}
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  mb: 3,
                  bgcolor: '#007AFF',
                  fontSize: '3rem',
                  fontWeight: 700,
                  border: '4px solid rgba(0, 122, 255, 0.2)',
                }}
              >
                {user.firstName?.[0] || user.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
              </Avatar>

              {/* Name */}
              <Typography
                variant="h5"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                {user.fullName || 'User'}
              </Typography>

              {/* Email */}
              <Typography
                variant="body2"
                sx={{
                  color: '#8E8E93',
                  mb: 3,
                }}
              >
                {user.primaryEmailAddress?.emailAddress}
              </Typography>

              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', my: 3 }} />

              {/* Organization */}
              {organization && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      display: 'block',
                      mb: 1,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                    }}
                  >
                    ORGANIZATION
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <BusinessIcon sx={{ color: '#007AFF', fontSize: 20 }} />
                    <Typography
                      sx={{
                        color: '#FFFFFF',
                        fontWeight: 600,
                      }}
                    >
                      {organization.name}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  fullWidth
                  startIcon={<EditIcon />}
                  variant="contained"
                  sx={{
                    background: '#007AFF',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      background: '#0066DD',
                    },
                  }}
                  onClick={() => {
                    // Scroll to Clerk's UserProfile component
                    document.getElementById('clerk-user-profile')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Edit Profile
                </Button>

                <SignOutButton>
                  <Button
                    fullWidth
                    startIcon={<LogoutIcon />}
                    sx={{
                      color: '#FF453A',
                      background: 'rgba(255, 69, 58, 0.1)',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': {
                        background: 'rgba(255, 69, 58, 0.2)',
                      },
                    }}
                  >
                    Sign Out
                  </Button>
                </SignOutButton>
              </Box>
            </Paper>
          </Box>

          {/* Right Column - Profile Details */}
          <Box sx={{ flex: 1 }}>
            {/* Account Information Card */}
            <Paper
              elevation={0}
              sx={{
                background: 'rgba(28, 28, 30, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 4,
                p: 4,
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                Account Information
              </Typography>

              <List sx={{ py: 0 }}>
                {/* User ID */}
                <ListItem
                  sx={{
                    px: 0,
                    py: 2,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <BadgeIcon sx={{ color: '#007AFF' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="User ID"
                    secondary={user.id}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#8E8E93',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        mb: 0.5,
                      },
                      '& .MuiListItemText-secondary': {
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                        fontFamily: 'monospace',
                      },
                    }}
                  />
                </ListItem>

                {/* Email */}
                <ListItem
                  sx={{
                    px: 0,
                    py: 2,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <EmailIcon sx={{ color: '#007AFF' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Address"
                    secondary={user.primaryEmailAddress?.emailAddress || 'No email'}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#8E8E93',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        mb: 0.5,
                      },
                      '& .MuiListItemText-secondary': {
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                      },
                    }}
                  />
                </ListItem>

                {/* Phone */}
                {user.primaryPhoneNumber && (
                  <ListItem
                    sx={{
                      px: 0,
                      py: 2,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <PhoneIcon sx={{ color: '#007AFF' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone Number"
                      secondary={user.primaryPhoneNumber.phoneNumber}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: '#8E8E93',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          mb: 0.5,
                        },
                        '& .MuiListItemText-secondary': {
                          color: '#FFFFFF',
                          fontSize: '0.95rem',
                        },
                      }}
                    />
                  </ListItem>
                )}

                {/* Created At */}
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <CalendarTodayIcon sx={{ color: '#007AFF' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={new Date(user.createdAt || '').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#8E8E93',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        mb: 0.5,
                      },
                      '& .MuiListItemText-secondary': {
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                      },
                    }}
                  />
                </ListItem>
              </List>
            </Paper>

            {/* Clerk UserProfile Component */}
            <Paper
              id="clerk-user-profile"
              elevation={0}
              sx={{
                background: 'rgba(28, 28, 30, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 4,
                p: 4,
                '& .cl-rootBox': {
                  width: '100%',
                },
                '& .cl-card': {
                  background: 'transparent',
                  boxShadow: 'none',
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                Manage Profile
              </Typography>
              <UserProfile
                appearance={{
                  elements: {
                    rootBox: {
                      width: '100%',
                    },
                    card: {
                      background: 'transparent',
                      boxShadow: 'none',
                    },
                    navbar: {
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                    },
                    navbarButton: {
                      color: '#8E8E93',
                      '&:hover': {
                        background: 'rgba(0, 122, 255, 0.1)',
                        color: '#007AFF',
                      },
                    },
                    navbarButtonActive: {
                      background: 'rgba(0, 122, 255, 0.15)',
                      color: '#007AFF',
                    },
                    pageScrollBox: {
                      background: 'transparent',
                    },
                    formButtonPrimary: {
                      background: '#007AFF',
                      '&:hover': {
                        background: '#0066DD',
                      },
                    },
                  },
                }}
              />
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
