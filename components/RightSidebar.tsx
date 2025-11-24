'use client';

import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Link from 'next/link';
import { useUser, useOrganization, SignOutButton, OrganizationSwitcher } from '@clerk/nextjs';

interface RightSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function RightSidebar({ open, onClose }: RightSidebarProps) {
  const { user } = useUser();
  const { organization } = useOrganization();
  const menuSections = [
    {
      title: 'OPERATIONS',
      items: [
        { text: 'Projects', icon: <AssignmentIcon />, href: '/shopos/work-orders' },
        { text: 'Reports', icon: <AssessmentIcon />, href: '/shopos/reports' },
      ],
    },
    {
      title: 'RESOURCES',
      items: [
        { text: 'Customers', icon: <PersonIcon />, href: '/shopos/customers' },
        { text: 'Employees', icon: <PeopleIcon />, href: '/shopos/employees' },
        { text: 'Equipment', icon: <BuildIcon />, href: '/shopos/equipment' },
        { text: 'Loadouts', icon: <PeopleIcon />, href: '/shopos/loadouts' },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { text: 'Analytics', icon: <AnalyticsIcon />, href: '/shopos/analytics' },
        { text: 'Settings', icon: <SettingsIcon />, href: '/shopos/settings' },
      ],
    },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 300,
          background: 'rgba(28, 28, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Close Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2.5,
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              color: '#007AFF',
              background: 'rgba(0, 122, 255, 0.1)',
              borderRadius: 2,
              '&:hover': {
                background: 'rgba(0, 122, 255, 0.2)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1, px: 2, overflowY: 'auto' }}>
          {/* Home Link */}
          <List sx={{ mb: 2 }}>
            <ListItem disablePadding>
              <Link href="/shopos" style={{ width: '100%', textDecoration: 'none' }}>
                <ListItemButton
                  onClick={onClose}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 2.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 122, 255, 0.15)',
                      transform: 'translateX(-4px)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#007AFF', minWidth: 40 }}>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Dashboard"
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      },
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          </List>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', mb: 2 }} />

          {menuSections.map((section, sectionIndex) => (
            <Box key={section.title} sx={{ mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#666',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  px: 2,
                  mb: 1,
                  display: 'block',
                }}
              >
                {section.title}
              </Typography>
              <List sx={{ py: 0 }}>
                {section.items.map((item) => (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                    <Link href={item.href} style={{ width: '100%', textDecoration: 'none' }}>
                      <ListItemButton
                        onClick={onClose}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderRadius: 2.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 122, 255, 0.15)',
                            transform: 'translateX(-4px)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: '#007AFF', minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: '#FFFFFF',
                              fontWeight: 600,
                              fontSize: '0.95rem',
                            },
                          }}
                        />
                      </ListItemButton>
                    </Link>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
        </Box>

        <Divider sx={{ borderColor: '#1A1A1A' }} />

        {/* Organization Name */}
        {organization && (
          <Box
            sx={{
              px: 3,
              py: 2,
              background: 'rgba(0, 122, 255, 0.1)',
              borderTop: '1px solid rgba(0, 122, 255, 0.2)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
              ORGANIZATION
            </Typography>
            <Typography sx={{ color: '#007AFF', fontWeight: 600, fontSize: '0.9rem' }}>
              {organization.name}
            </Typography>
          </Box>
        )}

        <Divider sx={{ borderColor: '#1A1A1A' }} />

        {/* User Profile Section (Bottom) - Compact */}
        <Box
          sx={{
            p: 2,
            background: 'rgba(0, 0, 0, 0.3)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar
              src={user?.imageUrl}
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#007AFF',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {user?.firstName?.[0] || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
              <Typography
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.fullName || 'User'}
              </Typography>
              {organization && (
                <Typography
                  sx={{
                    color: '#666',
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {organization.name}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Compact Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Link href="/shopos/profile" style={{ textDecoration: 'none', flex: 1 }}>
              <Button
                fullWidth
                size="small"
                onClick={onClose}
                sx={{
                  color: '#B3B3B3',
                  background: 'rgba(255, 255, 255, 0.05)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  minWidth: 0,
                  '&:hover': {
                    background: 'rgba(0, 122, 255, 0.15)',
                    color: '#FFFFFF',
                  },
                }}
              >
                Profile
              </Button>
            </Link>

            <SignOutButton>
              <Button
                size="small"
                sx={{
                  color: '#FF453A',
                  background: 'rgba(255, 69, 58, 0.1)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  minWidth: 0,
                  '&:hover': {
                    background: 'rgba(255, 69, 58, 0.2)',
                  },
                }}
              >
                Sign Out
              </Button>
            </SignOutButton>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
