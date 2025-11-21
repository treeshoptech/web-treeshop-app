import { SignUp } from '@clerk/nextjs';
import { Box, Container } from '@mui/material';

export default function SignUpPage() {
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
        <SignUp />
      </Container>
    </Box>
  );
}
