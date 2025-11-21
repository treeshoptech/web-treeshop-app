'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function ProjectReportsPage() {
  const router = useRouter();
  const reports = useQuery(api.projectReports.listProjectReports);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (reports === undefined) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 42px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <DescriptionIcon sx={{ fontSize: 32, color: '#007AFF' }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
            Project Reports
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#B3B3B3' }}>
          Comprehensive completion reports for all finished projects
        </Typography>
      </Box>

      {/* Stats Summary */}
      {reports.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'rgba(28, 28, 30, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                  TOTAL REPORTS
                </Typography>
                <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                  {reports.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'rgba(28, 28, 30, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                  TOTAL REVENUE
                </Typography>
                <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 700 }}>
                  {formatCurrency(reports.reduce((sum, r) => sum + r.totalInvestment, 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'rgba(28, 28, 30, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                  TOTAL PROFIT
                </Typography>
                <Typography variant="h4" sx={{ color: '#007AFF', fontWeight: 700 }}>
                  {formatCurrency(reports.reduce((sum, r) => sum + r.profit, 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            background: 'rgba(28, 28, 30, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 4,
          }}
        >
          <DescriptionIcon sx={{ fontSize: 64, color: '#666', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#B3B3B3', mb: 1 }}>
            No Project Reports Yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Complete a work order to generate your first project report
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reports.map((report) => {
            const isProfitable = report.profit > 0;
            const profitMarginColor =
              report.profitMargin >= 30
                ? '#4CAF50'
                : report.profitMargin >= 15
                ? '#FF9800'
                : '#FF3B30';

            return (
              <Card
                key={report._id}
                sx={{
                  background: 'rgba(28, 28, 30, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 3,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(28, 28, 30, 0.8)',
                    border: '1px solid rgba(0, 122, 255, 0.3)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardActionArea onClick={() => router.push(`/shopos/reports/${report._id}`)}>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                      {/* Left Section - Job Info */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ color: '#007AFF', fontWeight: 700, mb: 1 }}>
                          {report.jobNumber}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <PersonIcon sx={{ color: '#666', fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                            {report.customerName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon sx={{ color: '#666', fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                            {formatDate(report.completedAt)}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Middle Section - Hours */}
                      <Grid item xs={12} md={3}>
                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                          HOURS
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 0.5 }}>
                          {report.totalHours.toFixed(1)}h
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {report.actualProductiveHours.toFixed(1)}h billable + {report.actualSupportHours.toFixed(1)}h support
                        </Typography>
                      </Grid>

                      {/* Right Section - Financials */}
                      <Grid item xs={12} md={5}>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                              REVENUE
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                              {formatCurrency(report.totalInvestment)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                              PROFIT
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {isProfitable ? (
                                <TrendingUpIcon sx={{ color: '#4CAF50', fontSize: 16 }} />
                              ) : (
                                <TrendingDownIcon sx={{ color: '#FF3B30', fontSize: 16 }} />
                              )}
                              <Typography
                                variant="h6"
                                sx={{
                                  color: isProfitable ? '#4CAF50' : '#FF3B30',
                                  fontWeight: 600,
                                }}
                              >
                                {formatCurrency(report.profit)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                              MARGIN
                            </Typography>
                            <Chip
                              label={`${report.profitMargin.toFixed(1)}%`}
                              size="small"
                              sx={{
                                background: profitMarginColor,
                                color: '#FFFFFF',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      )}
    </Container>
  );
}
