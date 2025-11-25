'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Chip,
} from '@mui/material';
import LandingHeader from '@/components/LandingHeader';
import {
  CheckCircle,
  Warning,
  TrendingUp,
  AccessTime,
  AttachMoney,
  Groups,
} from '@mui/icons-material';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [revenue, setRevenue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to your backend/CRM
    console.log('Lead captured:', { email, revenue });
    setSubmitted(true);
  };

  return (
    <Box sx={{ background: '#000000', minHeight: '100vh' }}>
      <LandingHeader />

      {/* Hero Section - Pain + Promise */}
      <Box
        sx={{
          minHeight: '95vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #000000 0%, #1A1A1A 100%)',
          borderBottom: '1px solid #2A2A2A',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ py: 8 }}>
            {/* Market Callout */}
            <Chip
              label="FOR TREE SERVICE & LAND CLEARING OPERATORS"
              sx={{
                background: 'rgba(0, 122, 255, 0.2)',
                color: '#007AFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                mb: 4,
                py: 2.5,
                px: 1,
              }}
            />

            {/* Dream Outcome Headline */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.25rem', md: '3.5rem', lg: '4.5rem' },
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                mb: 3,
                lineHeight: 1.1,
              }}
            >
              Stop Losing $50K+ Per Year
              <br />
              <Box component="span" sx={{ color: '#007AFF' }}>
                To Jobs That Run Over Budget
              </Box>
            </Typography>

            {/* Subhead - Agitate */}
            <Typography
              sx={{
                fontSize: { xs: '1.125rem', md: '1.5rem' },
                color: '#B3B3B3',
                maxWidth: '800px',
                mb: 5,
                lineHeight: 1.6,
              }}
            >
              You quoted 40 hours. It took 60. Your &quot;profit&quot; just became your paycheck.
              Again. ShopOS shows you{' '}
              <strong style={{ color: '#FFFFFF' }}>exactly</strong> where your hours go,
              so you can price right and actually keep your margins.
            </Typography>

            {/* Pain Points Row */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mb: 6,
              }}
            >
              {[
                'Crews forget to clock in',
                'No idea what equipment actually costs',
                'Quoting from gut feel',
                'Jobs always run over',
                'Spreadsheets everywhere',
              ].map((pain, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#FF6B6B',
                    fontSize: '1rem',
                  }}
                >
                  <Warning sx={{ fontSize: 18 }} />
                  {pain}
                </Box>
              ))}
            </Box>

            {/* Lead Capture Form */}
            <Card
              sx={{
                background: '#1A1A1A',
                border: '2px solid #007AFF',
                maxWidth: '600px',
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {!submitted ? (
                  <>
                    <Typography
                      sx={{
                        color: '#FFFFFF',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        mb: 1,
                      }}
                    >
                      Apply for Early Access
                    </Typography>
                    <Typography
                      sx={{
                        color: '#888',
                        fontSize: '1rem',
                        mb: 3,
                      }}
                    >
                      We&apos;re onboarding 10 operators this month. Invite-only.
                    </Typography>

                    <Box
                      component="form"
                      onSubmit={handleSubmit}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                      }}
                    >
                      <TextField
                        placeholder="Your email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            background: '#0A0A0A',
                            color: '#FFFFFF',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#007AFF' },
                            '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: '#666',
                            opacity: 1,
                          },
                        }}
                      />
                      <TextField
                        placeholder="Annual revenue"
                        select
                        SelectProps={{ native: true }}
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        sx={{
                          minWidth: 180,
                          '& .MuiOutlinedInput-root': {
                            background: '#0A0A0A',
                            color: '#FFFFFF',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#007AFF' },
                            '&.Mui-focused fieldset': { borderColor: '#007AFF' },
                          },
                          '& .MuiNativeSelect-select': {
                            color: revenue ? '#FFFFFF' : '#666',
                          },
                        }}
                      >
                        <option value="">Revenue...</option>
                        <option value="under-250k">Under $250K</option>
                        <option value="250k-500k">$250K - $500K</option>
                        <option value="500k-1m">$500K - $1M</option>
                        <option value="1m-2m">$1M - $2M</option>
                        <option value="2m-plus">$2M+</option>
                      </TextField>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                          background: '#007AFF',
                          px: 4,
                          py: 1.75,
                          fontSize: '1rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          '&:hover': { background: '#0066DD' },
                        }}
                      >
                        Apply Now
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CheckCircle sx={{ fontSize: 48, color: '#34C759', mb: 2 }} />
                    <Typography
                      sx={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 600 }}
                    >
                      Application Received
                    </Typography>
                    <Typography sx={{ color: '#888', mt: 1 }}>
                      We&apos;ll reach out within 24 hours if you&apos;re a good fit.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Trust Signals */}
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 3, md: 5 },
                flexWrap: 'wrap',
                color: '#666',
                fontSize: '0.9rem',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: '#34C759', fontSize: 18 }} />
                Built by a tree service owner
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: '#34C759', fontSize: 18 }} />
                Works on any phone
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: '#34C759', fontSize: 18 }} />
                30-day money back guarantee
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Problem Section - Agitate Hard */}
      <Box sx={{ py: 12, background: '#0A0A0A', borderBottom: '1px solid #2A2A2A' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              mb: 2,
            }}
          >
            Here&apos;s What&apos;s Actually Killing Your Profit
          </Typography>
          <Typography
            sx={{
              color: '#888',
              fontSize: '1.125rem',
              textAlign: 'center',
              mb: 8,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            (And why working harder won&apos;t fix it)
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
                icon: AccessTime,
                title: 'Time Blindness',
                problem: 'You think that job took 32 hours. It actually took 47. Your crew "forgot" to log the setup, the travel, the return trip for the chipper.',
                cost: '$15K-40K/year in unbilled time',
              },
              {
                icon: AttachMoney,
                title: 'Equipment Guessing',
                problem: 'What does your skid steer actually cost per hour? Including depreciation, maintenance, fuel, insurance? Most owners guess. They guess wrong.',
                cost: '$10K-25K/year in underpriced jobs',
              },
              {
                icon: Groups,
                title: 'Crew Chaos',
                problem: 'Text chains. Missed messages. "I thought you were sending the bucket truck." Every miscommunication costs you time and money.',
                cost: '$5K-15K/year in wasted labor',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Card
                  key={i}
                  sx={{
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Icon sx={{ color: '#FF6B6B', fontSize: 40, mb: 2 }} />
                    <Typography
                      sx={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 700, mb: 2 }}
                    >
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: '#B3B3B3', mb: 3, lineHeight: 1.7 }}>
                      {item.problem}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#FF6B6B',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    >
                      {item.cost}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 700,
              }}
            >
              Total: <span style={{ color: '#FF6B6B' }}>$30K - $80K per year</span>
            </Typography>
            <Typography sx={{ color: '#888', mt: 1 }}>
              Walking out your door because you can&apos;t see it.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Solution Section - The Fix */}
      <Box sx={{ py: 12, background: '#000000', borderBottom: '1px solid #2A2A2A' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              mb: 2,
            }}
          >
            ShopOS Makes the Invisible{' '}
            <span style={{ color: '#007AFF' }}>Visible</span>
          </Typography>
          <Typography
            sx={{
              color: '#888',
              fontSize: '1.125rem',
              textAlign: 'center',
              mb: 8,
              maxWidth: '700px',
              mx: 'auto',
            }}
          >
            Every hour tracked. Every cost calculated. Every job profitable.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 4,
            }}
          >
            {[
              {
                before: 'Crews "forget" to clock in for 2 hours',
                after: 'One-tap timer on their phone. Auto-calculates labor cost.',
                result: 'Capture every billable minute',
              },
              {
                before: 'Guessing equipment costs at $50/hr',
                after: 'Actual cost: $73/hr (depreciation + fuel + maintenance)',
                result: 'Price jobs on real numbers',
              },
              {
                before: 'Job quoted at $4,200, came in at $3,100 profit... maybe?',
                after: 'Real-time P&L: Revenue $4,200 - Costs $2,847 = Profit $1,353',
                result: 'Know your margins instantly',
              },
              {
                before: 'Which jobs make money? No idea.',
                after: 'Production rates by service: Mulching: $127/hr. Stumps: $89/hr.',
                result: 'Double down on winners',
              },
            ].map((item, i) => (
              <Card
                key={i}
                sx={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      sx={{
                        color: '#FF6B6B',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        mb: 1,
                      }}
                    >
                      Before
                    </Typography>
                    <Typography sx={{ color: '#888', fontSize: '1rem' }}>
                      {item.before}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      sx={{
                        color: '#34C759',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        mb: 1,
                      }}
                    >
                      After
                    </Typography>
                    <Typography sx={{ color: '#FFFFFF', fontSize: '1rem' }}>
                      {item.after}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      background: 'rgba(0, 122, 255, 0.1)',
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Typography
                      sx={{ color: '#007AFF', fontWeight: 600, fontSize: '0.9rem' }}
                    >
                      {item.result}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Social Proof - Specific Results */}
      <Box sx={{ py: 12, background: '#0A0A0A', borderBottom: '1px solid #2A2A2A' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              mb: 8,
            }}
          >
            What Operators Are Saying
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 4,
              mb: 8,
            }}
          >
            <Card sx={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  sx={{
                    color: '#FFFFFF',
                    fontSize: '1.25rem',
                    fontStyle: 'italic',
                    mb: 3,
                    lineHeight: 1.6,
                  }}
                >
                  &quot;I found out my loader was costing me $47/hour more than I thought.
                  I was losing money on every land clearing job. Now I price it right
                  and my margins went from 15% to 34%.&quot;
                </Typography>
                <Box>
                  <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    Mike R.
                  </Typography>
                  <Typography sx={{ color: '#888', fontSize: '0.9rem' }}>
                    Land clearing, Tennessee • $1.2M revenue
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  sx={{
                    color: '#FFFFFF',
                    fontSize: '1.25rem',
                    fontStyle: 'italic',
                    mb: 3,
                    lineHeight: 1.6,
                  }}
                >
                  &quot;My guys were clocking 6 hours on 8 hour jobs. Not lying - just forgetting
                  drive time and setup. ShopOS caught an extra 12 hours per week. That&apos;s
                  $600/week I was eating.&quot;
                </Typography>
                <Box>
                  <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    Sarah K.
                  </Typography>
                  <Typography sx={{ color: '#888', fontSize: '0.9rem' }}>
                    Tree service, North Carolina • 6 crew members
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Stats */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 4,
            }}
          >
            {[
              { stat: '23%', label: 'Average margin improvement' },
              { stat: '8 hrs', label: 'Saved per week on admin' },
              { stat: '<5 min', label: 'To learn the system' },
            ].map((item, i) => (
              <Box key={i} sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{ fontSize: '3rem', fontWeight: 800, color: '#007AFF', mb: 1 }}
                >
                  {item.stat}
                </Typography>
                <Typography sx={{ color: '#888', fontSize: '1rem' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Value Stack + Guarantee */}
      <Box sx={{ py: 12, background: '#000000', borderBottom: '1px solid #2A2A2A' }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              mb: 2,
            }}
          >
            Everything You Get
          </Typography>
          <Typography
            sx={{
              color: '#888',
              fontSize: '1.125rem',
              textAlign: 'center',
              mb: 6,
            }}
          >
            One platform. No more duct-taping 5 different apps together.
          </Typography>

          <Card sx={{ background: '#1A1A1A', border: '2px solid #007AFF', mb: 6 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              {[
                { item: 'Real-time job tracking & crew timers', value: '' },
                { item: 'True equipment cost calculator', value: '' },
                { item: 'Professional proposals with your branding', value: '' },
                { item: 'Job profitability dashboard', value: '' },
                { item: 'Crew performance analytics', value: '' },
                { item: 'Mobile app for field crews', value: '' },
                { item: 'Customer management & history', value: '' },
                { item: 'Production rate benchmarking', value: '' },
              ].map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    borderBottom: i < 7 ? '1px solid #2A2A2A' : 'none',
                  }}
                >
                  <CheckCircle sx={{ color: '#34C759', fontSize: 24 }} />
                  <Typography sx={{ color: '#FFFFFF', fontSize: '1.1rem', flex: 1 }}>
                    {item.item}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Guarantee */}
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1A3D1A 0%, #0A0A0A 100%)',
              border: '2px solid #34C759',
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 48, color: '#34C759', mb: 2 }} />
              <Typography
                sx={{
                  color: '#FFFFFF',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                The &quot;Find The Money&quot; Guarantee
              </Typography>
              <Typography
                sx={{
                  color: '#B3B3B3',
                  fontSize: '1.1rem',
                  maxWidth: '500px',
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                If ShopOS doesn&apos;t help you identify at least <strong style={{ color: '#FFFFFF' }}>$5,000 in
                hidden costs or unbilled time</strong> in your first 60 days, we&apos;ll refund
                every penny. No questions asked.
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box sx={{ py: 12, background: '#0A0A0A' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 3,
              }}
            >
              Stop Guessing. Start Knowing.
            </Typography>
            <Typography
              sx={{
                color: '#B3B3B3',
                fontSize: '1.25rem',
                mb: 2,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              We&apos;re only onboarding <strong style={{ color: '#FFFFFF' }}>10 operators this month</strong> to
              ensure everyone gets proper setup and support.
            </Typography>
            <Typography
              sx={{
                color: '#888',
                fontSize: '1rem',
                mb: 5,
              }}
            >
              $500K+ annual revenue required. This isn&apos;t for side hustles.
            </Typography>

            <Button
              variant="contained"
              size="large"
              href="#"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{
                background: '#007AFF',
                px: 6,
                py: 2.5,
                fontSize: '1.25rem',
                fontWeight: 700,
                '&:hover': { background: '#0066DD' },
              }}
            >
              Apply for Early Access
            </Button>

            <Box sx={{ mt: 4, color: '#666', fontSize: '0.9rem' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                <span>No credit card required</span>
                <span>•</span>
                <span>60-day guarantee</span>
                <span>•</span>
                <span>Cancel anytime</span>
              </Box>
            </Box>
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
