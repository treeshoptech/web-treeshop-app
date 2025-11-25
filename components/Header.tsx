'use client';

import { AppBar, Toolbar, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <AppBar
      position="fixed"
      component="nav"
      aria-label="Main navigation"
      sx={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: 'none',
      }}
    >
      <Toolbar
        sx={{
          minHeight: '56px !important',
          height: '56px',
          justifyContent: 'center',
          position: 'relative',
          px: 3,
        }}
      >
        {/* Centered Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/logo.png"
            alt="TreeShop Logo"
            width={90}
            height={32}
            style={{ objectFit: 'contain', width: 'auto', height: 32 }}
            priority
          />
        </Box>

        {/* Hamburger Menu (Absolute Right) */}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          sx={{
            position: 'absolute',
            right: 12,
            color: '#007AFF',
            background: 'rgba(0, 122, 255, 0.1)',
            borderRadius: 2,
            '&:hover': {
              background: 'rgba(0, 122, 255, 0.2)',
            },
          }}
        >
          <MenuIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
