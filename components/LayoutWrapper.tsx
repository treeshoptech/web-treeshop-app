'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import LandingHeader from './LandingHeader';
import RightSidebar from './RightSidebar';
import { useUser } from '@clerk/nextjs';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      <LandingHeader isLoggedIn={isSignedIn || false} onMenuClick={handleMenuClick} />
      <RightSidebar open={sidebarOpen} onClose={handleSidebarClose} />
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          background: '#000000',
        }}
      >
        {children}
      </Box>
    </>
  );
}
