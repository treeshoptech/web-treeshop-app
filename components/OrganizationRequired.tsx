'use client';

import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import { Business, Add } from '@mui/icons-material';
import { useOrganization } from '@clerk/nextjs';

export default function OrganizationRequired() {
  const { organization } = useOrganization();

  if (organization) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            textAlign: 'center',
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <Business sx={{ fontSize: 64, color: '#007AFF', mb: 3 }} />
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                mb: 2,
              }}
            >
              Create Your Organization
            </Typography>
            <Typography
              sx={{
                color: '#B3B3B3',
                mb: 4,
                lineHeight: 1.7,
              }}
            >
              ShopOS uses organizations to keep your company data separate and secure.
              Create your organization to get started, or ask your admin to invite you to
              an existing one.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              href="/sign-in#/create-organization"
              sx={{
                background: '#007AFF',
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: '#0066DD',
                },
              }}
            >
              Create Organization
            </Button>
            <Typography
              sx={{
                color: '#666',
                fontSize: '0.875rem',
                mt: 3,
              }}
            >
              You can also switch organizations from your profile menu
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
