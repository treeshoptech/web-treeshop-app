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
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

interface RightSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function RightSidebar({ open, onClose }: RightSidebarProps) {
  const { user } = useUser();
  const menuSections = [
    {
      title: 'OPERATIONS',
      items: [
        { text: 'Projects', icon: <AssignmentIcon />, href: '/shopos/work-orders' },
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

        {/* User Profile Section (Bottom) */}
        <Box
          sx={{
            p: 3,
            background: 'rgba(0, 0, 0, 0.3)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2.5 }}>
            <Avatar
              src={user?.imageUrl}
              sx={{
                width: 52,
                height: 52,
                bgcolor: '#007AFF',
                fontSize: '1.3rem',
                fontWeight: 700,
              }}
            >
              {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'User'}
              </Typography>
              <Typography
                sx={{
                  color: '#8E8E93',
                  fontSize: '0.85rem',
                }}
              >
                {user?.primaryEmailAddress?.emailAddress || ''}
              </Typography>
            </Box>
          </Box>

        </Box>
      </Box>
    </Drawer>
  );
}
