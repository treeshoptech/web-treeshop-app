import { SignIn } from '@clerk/nextjs';
import { Box, Container } from '@mui/material';

export default function SignInPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <SignIn />
      </Container>
    </Box>
  );
}
