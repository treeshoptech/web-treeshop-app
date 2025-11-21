'use client';

import { useAuth } from '@clerk/nextjs';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import { useEffect, useState } from 'react';

export default function DebugTokenPage() {
  const { getToken } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken({ template: 'convex' });
      if (token) {
        // Decode JWT (just the payload, don't verify)
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        setTokenInfo(payload);
      }
    };
    fetchToken();
  }, [getToken]);

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ color: '#FFFFFF', mb: 3 }}>
          Debug JWT Token
        </Typography>
        <Card sx={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          <CardContent>
            <pre style={{ color: '#FFFFFF', overflow: 'auto' }}>
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
