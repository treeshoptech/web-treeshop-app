'use client';

import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useOrganization, useUser } from '@clerk/nextjs';

export default function DebugPage() {
  const authCheck = useQuery(api.debug.checkAuth);
  const { organization } = useOrganization();
  const { user } = useUser();

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ color: '#FFFFFF', mb: 3 }}>
          Auth Debug Info
        </Typography>

        {/* Clerk Info */}
        <Card sx={{ background: '#1A1A1A', border: '1px solid #2A2A2A', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#007AFF', mb: 2 }}>
              Clerk Info (Client Side)
            </Typography>
            <pre style={{ color: '#FFFFFF', overflow: 'auto', fontSize: '0.875rem' }}>
              {JSON.stringify({
                userId: user?.id,
                email: user?.primaryEmailAddress?.emailAddress,
                organizationId: organization?.id,
                organizationName: organization?.name,
                organizationSlug: organization?.slug,
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Convex Auth */}
        <Card sx={{ background: '#1A1A1A', border: '1px solid #2A2A2A', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#34C759', mb: 2 }}>
              Convex Auth (Server Side)
            </Typography>
            {authCheck === undefined ? (
              <Typography sx={{ color: '#666' }}>Loading...</Typography>
            ) : (
              <pre style={{ color: '#FFFFFF', overflow: 'auto', fontSize: '0.875rem' }}>
                {JSON.stringify(authCheck, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card sx={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#FF9500', mb: 2 }}>
              Diagnosis
            </Typography>
            {authCheck?.hasIdentity ? (
              authCheck.identity?.orgId ? (
                <Typography sx={{ color: '#34C759' }}>
                  ✓ Everything looks good! Organization ID is being passed to Convex.
                </Typography>
              ) : (
                <Typography sx={{ color: '#FF9500' }}>
                  ⚠ User authenticated but no organization ID in token. Make sure you've:
                  <br />1. Created/joined an organization in Clerk
                  <br />2. Added org_id claim to your Clerk JWT template
                  <br />3. Signed out and back in to get fresh token
                </Typography>
              )
            ) : (
              <Typography sx={{ color: '#FF3B30' }}>
                ✗ No identity from Convex. Issues:
                <br />1. ConvexProviderWithClerk not properly configured
                <br />2. Clerk JWT template not created
                <br />3. Auth config in Convex dashboard not set up
              </Typography>
            )}
          </CardContent>
        </Card>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            href="/shopos"
            sx={{
              borderColor: '#007AFF',
              color: '#007AFF',
            }}
          >
            ← Back to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
