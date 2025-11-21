'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import LandingHeader from '@/components/LandingHeader';
import {
  Assignment,
  Speed,
  Assessment,
  People,
  Construction,
  TrendingUp,
} from '@mui/icons-material';

export default function HomePage() {
  return (
    <Box sx={{ background: '#000000', minHeight: '100vh' }}>
      <LandingHeader />

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #000000 0%, #1A1A1A 100%)',
          borderBottom: '1px solid #2A2A2A',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4.5rem', lg: '6rem' },
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                mb: 3,
              }}
            >
              Run Your Operations
              <br />
              Like a Pro
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.75rem', lg: '2rem' },
                fontWeight: 500,
                color: '#B3B3B3',
                maxWidth: '900px',
                mx: 'auto',
                mb: 5,
                lineHeight: 1.4,
              }}
            >
              ShopOS is the operating system for modern field service businesses.
              Track projects, manage crews, optimize equipment, and scale with confidence.
            </Typography>

            {/* Dual CTAs */}
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                justifyContent: 'center',
                flexWrap: 'wrap',
                mb: 5,
              }}
            >
              <Button
                variant="contained"
                size="large"
                href="/sign-in"
                sx={{
                  background: '#007AFF',
                  px: 6,
                  py: 2.5,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  '&:hover': { background: '#0066DD' },
                }}
              >
                Get Started →
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: '#007AFF',
                  color: '#007AFF',
                  px: 6,
                  py: 2.5,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#0066DD',
                    background: 'rgba(0, 122, 255, 0.1)',
                  },
                }}
                href="#features"
              >
                See Features
              </Button>
            </Box>

            {/* Trust Bar */}
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 2, md: 4 },
                justifyContent: 'center',
                flexWrap: 'wrap',
                color: '#666',
                fontSize: { xs: '0.875rem', md: '1rem' },
              }}
            >
              <Box>✓ Real-time tracking</Box>
              <Box>✓ Mobile-first design</Box>
              <Box>✓ Built by operators</Box>
              <Box>✓ No training required</Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 12, background: '#0A0A0A', borderBottom: '1px solid #2A2A2A' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              mb: 2,
            }}
          >
            Everything You Need to Run Your Shop
          </Typography>
          <Typography
            sx={{
              color: '#666',
              fontSize: '1.125rem',
              textAlign: 'center',
              mb: 8,
              maxWidth: '700px',
              mx: 'auto',
            }}
          >
            From proposal to payment, ShopOS handles every step of your operations.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
            }}
          >
            {[
              {
                icon: Assignment,
                title: 'Project Management',
                description: 'Create, assign, and track projects in real-time. Know exactly what your crews are doing and when jobs will be completed.',
                color: '#007AFF',
              },
              {
                icon: Assessment,
                title: 'Smart Proposals',
                description: 'Generate professional proposals with built-in pricing intelligence. Win more jobs with transparent, accurate quotes.',
                color: '#34C759',
              },
              {
                icon: People,
                title: 'Crew Management',
                description: 'Track time, assign tasks, and monitor performance. Keep your team accountable and productive.',
                color: '#FF9500',
              },
              {
                icon: Construction,
                title: 'Equipment Tracking',
                description: 'Monitor equipment usage, maintenance schedules, and true operating costs. Make data-driven decisions about your fleet.',
                color: '#FF3B30',
              },
              {
                icon: Speed,
                title: 'Real-Time Updates',
                description: 'Field crews update job status from their phones. Office sees everything instantly. No more phone tag.',
                color: '#5856D6',
              },
              {
                icon: TrendingUp,
                title: 'Performance Analytics',
                description: 'Understand your costs per hour, per acre, per job. Optimize pricing and increase profitability.',
                color: '#00C7BE',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Box key={index}>
                  <Card
                    sx={{
                      background: '#1A1A1A',
                      border: '1px solid #2A2A2A',
                      height: '100%',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: feature.color,
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          background: `${feature.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                        }}
                      >
                        <Icon sx={{ color: feature.color, fontSize: 32 }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{ color: '#FFFFFF', fontWeight: 600, mb: 2 }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography sx={{ color: '#B3B3B3', lineHeight: 1.7 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* Social Proof */}
      <Box sx={{ py: 12, background: '#000000', borderBottom: '1px solid #2A2A2A' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              mb: 8,
            }}
          >
            Built by Operators, for Operators
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 4 }}>
            <Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{ fontSize: '3rem', fontWeight: 700, color: '#007AFF', mb: 1 }}
                >
                  5,000+
                </Typography>
                <Typography sx={{ color: '#666', fontSize: '1.125rem' }}>
                  Acres Managed
                </Typography>
              </Box>
            </Box>
            <Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{ fontSize: '3rem', fontWeight: 700, color: '#007AFF', mb: 1 }}
                >
                  98%
                </Typography>
                <Typography sx={{ color: '#666', fontSize: '1.125rem' }}>
                  Customer Satisfaction
                </Typography>
              </Box>
            </Box>
            <Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{ fontSize: '3rem', fontWeight: 700, color: '#007AFF', mb: 1 }}
                >
                  Zero
                </Typography>
                <Typography sx={{ color: '#666', fontSize: '1.125rem' }}>
                  Training Required
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #007AFF 0%, #0066DD 100%)',
                border: '1px solid #007AFF',
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Typography
                  sx={{
                    color: '#FFFFFF',
                    fontSize: '1.5rem',
                    fontStyle: 'italic',
                    mb: 3,
                    lineHeight: 1.6,
                  }}
                >
                  "We built ShopOS because we got tired of running our business on spreadsheets and phone calls. Now we have real-time visibility into every job, every crew member, and every piece of equipment."
                </Typography>
                <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                  — Jeremiah, TreeShop LLC Founder
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box sx={{ py: 12, background: '#0A0A0A' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 3,
              }}
            >
              Ready to Professionalize Your Operations?
            </Typography>
            <Typography
              sx={{
                color: '#B3B3B3',
                fontSize: '1.25rem',
                mb: 6,
                maxWidth: '700px',
                mx: 'auto',
              }}
            >
              Join the operators who are running smarter, scaling faster, and making more money with ShopOS.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="/sign-in"
              sx={{
                background: '#007AFF',
                px: 8,
                py: 3,
                fontSize: '1.5rem',
                fontWeight: 600,
                '&:hover': { background: '#0066DD' },
              }}
            >
              Start Using ShopOS →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, background: '#000000', borderTop: '1px solid #2A2A2A' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#666', fontSize: '0.875rem' }}>
              © 2025 TreeShop LLC • ShopOS Platform
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
