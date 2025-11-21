'use client';

import { useAuth } from '@clerk/nextjs';
import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import { useEffect, useState } from 'react';

export default function CheckTokenPage() {
  const { getToken } = useAuth();
  const [issuer, setIssuer] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken({ template: 'convex' });
        if (token) {
          const parts = token.split('.');
          const payload = JSON.parse(atob(parts[1]));
          setIssuer(payload.iss || 'NOT FOUND');
        } else {
          setError('No token received');
        }
      } catch (e: any) {
        setError(e.message);
      }
    };
    fetchToken();
  }, [getToken]);

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ color: '#FFFFFF', mb: 3 }}>
          JWT Issuer Check
        </Typography>
        <Card sx={{ background: '#1A1A1A', border: '1px solid #2A2A2A', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#007AFF', mb: 2 }}>
              Clerk JWT Issuer:
            </Typography>
            <Typography sx={{ color: '#FFFFFF', fontFamily: 'monospace', fontSize: '1.2rem', mb: 2 }}>
              {issuer || error || 'Loading...'}
            </Typography>
            <Typography variant="h6" sx={{ color: '#34C759', mb: 2, mt: 3 }}>
              Expected in Convex:
            </Typography>
            <Typography sx={{ color: '#FFFFFF', fontFamily: 'monospace', fontSize: '1.2rem' }}>
              https://clerk.treeshopterminal.com
            </Typography>
          </CardContent>
        </Card>
        {issuer && issuer !== 'https://clerk.treeshopterminal.com' && (
          <Card sx={{ background: '#FF3B3020', border: '1px solid #FF3B30' }}>
            <CardContent>
              <Typography sx={{ color: '#FF3B30', fontWeight: 600 }}>
                ⚠️ MISMATCH DETECTED
              </Typography>
              <Typography sx={{ color: '#FFFFFF', mt: 2 }}>
                Update Convex auth config domain to: {issuer}
              </Typography>
            </CardContent>
          </Card>
        )}
        <Button href="/shopos" sx={{ color: '#007AFF', mt: 2 }}>
          ← Back to Dashboard
        </Button>
      </Container>
    </Box>
  );
}
