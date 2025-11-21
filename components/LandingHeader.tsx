'use client';

import { AppBar, Toolbar, Box, Button, Container, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import Image from 'next/image';

interface LandingHeaderProps {
  isLoggedIn?: boolean;
  onMenuClick?: () => void;
}

export default function LandingHeader({ isLoggedIn = false, onMenuClick }: LandingHeaderProps) {
  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #2A2A2A',
        boxShadow: 'none',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 2, sm: 3 } }}>
          {/* Logo - Left */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <Image
              src="/logo.png"
              alt="ShopOS"
              width={120}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </Box>

          {/* Login or Hamburger - Right */}
          {isLoggedIn ? (
            <IconButton
              onClick={onMenuClick}
              sx={{
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
          ) : (
            <Button
              component={Link}
              href="/sign-in"
              variant="contained"
              sx={{
                background: '#007AFF',
                color: '#FFFFFF',
                fontWeight: 600,
                px: 4,
                py: 1,
                '&:hover': {
                  background: '#0066DD',
                },
              }}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
