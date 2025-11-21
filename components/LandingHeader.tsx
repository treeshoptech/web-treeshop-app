'use client';

import { AppBar, Toolbar, Box, Button, Container, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';

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

          {/* Login or User Controls - Right */}
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* UserButton */}
              <Box
                sx={{
                  '& .cl-userButtonBox': {
                    display: 'flex',
                    alignItems: 'center',
                  },
                  '& .cl-userButtonTrigger': {
                    border: '2px solid rgba(0, 122, 255, 0.2)',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#007AFF',
                      transform: 'scale(1.05)',
                    },
                  },
                }}
              >
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: {
                        width: 40,
                        height: 40,
                      },
                      userButtonPopoverCard: {
                        background: 'rgba(28, 28, 30, 0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      },
                      userButtonPopoverActionButton: {
                        color: '#FFFFFF',
                        '&:hover': {
                          background: 'rgba(0, 122, 255, 0.15)',
                        },
                      },
                      userButtonPopoverActionButtonText: {
                        color: '#FFFFFF',
                      },
                      userButtonPopoverActionButtonIcon: {
                        color: '#007AFF',
                      },
                      userButtonPopoverFooter: {
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      },
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </Box>

              {/* Hamburger Menu */}
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
            </Box>
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
