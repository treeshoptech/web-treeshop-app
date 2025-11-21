'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { theme } from './theme';
import EmotionRegistry from './emotion-registry';
import { SnackbarProvider } from './contexts/SnackbarContext';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <EmotionRegistry>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            {children}
          </SnackbarProvider>
        </ThemeProvider>
      </EmotionRegistry>
    </ConvexProviderWithClerk>
  );
}
