'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams, useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Button,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';

export default function ProjectReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as Id<'projectReports'>;

  const report = useQuery(api.projectReports.getProjectReport, { reportId });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (report === undefined) {
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

  if (report === null) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" sx={{ color: '#B3B3B3' }}>
          Report not found
        </Typography>
      </Container>
    );
  }

  const profitMarginColor =
    (report.profitMargin ?? 0) >= 30
      ? '#4CAF50'
      : (report.profitMargin ?? 0) >= 15
      ? '#FF9800'
      : '#FF3B30';

  return (
    <Box>
      {/* Screen-only toolbar */}
      <Box
        className="no-print"
        sx={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          mb: 3,
          '@media print': { display: 'none' },
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton onClick={() => router.back()} sx={{ color: '#007AFF' }}>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  borderColor: '#2A2A2A',
                  color: '#FFFFFF',
                  '&:hover': {
                    borderColor: '#007AFF',
                    background: 'rgba(0, 122, 255, 0.1)',
                  },
                }}
              >
                Print / PDF
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        <Card
          sx={{
            background: 'rgba(28, 28, 30, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 3,
            mb: 3,
            '@media print': {
              background: '#FFFFFF',
              border: '1px solid #000000',
              boxShadow: 'none',
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#007AFF',
                    mb: 1,
                    '@media print': { color: '#000000' },
                  }}
                >
                  {report.jobNumber ?? ''}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#FFFFFF',
                    '@media print': { color: '#000000' },
                  }}
                >
                  Project Completion Report
                </Typography>
              </Box>
              <Chip
                label="COMPLETED"
                sx={{
                  background: '#4CAF50',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  px: 2,
                  '@media print': { background: '#E8F5E9', color: '#2E7D32' },
                }}
              />
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)', '@media print': { borderColor: '#CCCCCC' } }} />

            {/* Customer & Date Info */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                      '@media print': { color: '#666666' },
                    }}
                  >
                    CUSTOMER
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: 600,
                      '@media print': { color: '#000000' },
                    }}
                  >
                    {report.customerName ?? ''}
                  </Typography>
                  {(report.customerAddress ?? null) && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#B3B3B3',
                        mt: 0.5,
                        '@media print': { color: '#666666' },
                      }}
                    >
                      {report.customerAddress ?? ''}
                    </Typography>
                  )}
                  {(report.customerPhone ?? null) && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#B3B3B3',
                        '@media print': { color: '#666666' },
                      }}
                    >
                      {report.customerPhone ?? ''}
                    </Typography>
                  )}
                  {(report.customerEmail ?? null) && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#007AFF',
                        '@media print': { color: '#1976D2' },
                      }}
                    >
                      {report.customerEmail ?? ''}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                      '@media print': { color: '#666666' },
                    }}
                  >
                    PROJECT DATES
                  </Typography>
                  {report.startDate && (
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#FFFFFF',
                        mb: 0.5,
                        '@media print': { color: '#000000' },
                      }}
                    >
                      Start: {new Date(report.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  )}
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#FFFFFF',
                      '@media print': { color: '#000000' },
                    }}
                  >
                    Completed: {report.completedAt ? formatDate(report.completedAt) : 'N/A'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card
          sx={{
            background: 'rgba(28, 28, 30, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 3,
            mb: 3,
            '@media print': {
              background: '#FFFFFF',
              border: '1px solid #000000',
              boxShadow: 'none',
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 3,
                '@media print': { color: '#000000' },
              }}
            >
              Financial Summary
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Box
                  sx={{
                    p: 2.5,
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 2,
                    '@media print': { background: '#F5F5F5', border: '1px solid #E0E0E0' },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontWeight: 600,
                      display: 'block',
                      mb: 1,
                      '@media print': { color: '#666666' },
                    }}
                  >
                    TOTAL HOURS
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: 700,
                      '@media print': { color: '#000000' },
                    }}
                  >
                    {(report.totalHours ?? 0).toFixed(1)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#B3B3B3',
                      '@media print': { color: '#666666' },
                    }}
                  >
                    Est: {(report.estimatedTotalHours ?? 0).toFixed(1)}h
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Box
                  sx={{
                    p: 2.5,
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 2,
                    '@media print': { background: '#F5F5F5', border: '1px solid #E0E0E0' },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontWeight: 600,
                      display: 'block',
                      mb: 1,
                      '@media print': { color: '#666666' },
                    }}
                  >
                    TOTAL COST
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#FF9800',
                      fontWeight: 700,
                      '@media print': { color: '#F57C00' },
                    }}
                  >
                    {formatCurrency(report.actualTotalCost ?? 0)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Box
                  sx={{
                    p: 2.5,
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 2,
                    '@media print': { background: '#F5F5F5', border: '1px solid #E0E0E0' },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontWeight: 600,
                      display: 'block',
                      mb: 1,
                      '@media print': { color: '#666666' },
                    }}
                  >
                    CUSTOMER PAID
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#4CAF50',
                      fontWeight: 700,
                      '@media print': { color: '#2E7D32' },
                    }}
                  >
                    {formatCurrency(report.totalInvestment ?? 0)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Box
                  sx={{
                    p: 2.5,
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 2,
                    '@media print': { background: '#F5F5F5', border: '1px solid #E0E0E0' },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontWeight: 600,
                      display: 'block',
                      mb: 1,
                      '@media print': { color: '#666666' },
                    }}
                  >
                    PROFIT
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: (report.profit ?? 0) > 0 ? '#4CAF50' : '#FF3B30',
                      fontWeight: 700,
                      '@media print': { color: (report.profit ?? 0) > 0 ? '#2E7D32' : '#C62828' },
                    }}
                  >
                    {formatCurrency(report.profit ?? 0)}
                  </Typography>
                  <Chip
                    label={`${(report.profitMargin ?? 0).toFixed(1)}% margin`}
                    size="small"
                    sx={{
                      mt: 1,
                      background: profitMarginColor,
                      color: '#FFFFFF',
                      fontWeight: 600,
                      '@media print': {
                        background: (report.profitMargin ?? 0) >= 30 ? '#E8F5E9' : '#FFEBEE',
                        color: (report.profitMargin ?? 0) >= 30 ? '#2E7D32' : '#C62828',
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 3 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    display: 'block',
                    '@media print': { color: '#666666' },
                  }}
                >
                  Billable Hours
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#007AFF',
                    fontWeight: 600,
                    '@media print': { color: '#1976D2' },
                  }}
                >
                  {(report.actualProductiveHours ?? 0).toFixed(1)}h
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    display: 'block',
                    '@media print': { color: '#666666' },
                  }}
                >
                  Support Hours
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#B3B3B3',
                    fontWeight: 600,
                    '@media print': { color: '#666666' },
                  }}
                >
                  {(report.actualSupportHours ?? 0).toFixed(1)}h
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Line Items Breakdown */}
        <Card
          sx={{
            background: 'rgba(28, 28, 30, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 3,
            mb: 3,
            '@media print': {
              background: '#FFFFFF',
              border: '1px solid #000000',
              boxShadow: 'none',
              pageBreakInside: 'avoid',
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 3,
                '@media print': { color: '#000000' },
              }}
            >
              Line Items Breakdown
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                background: 'rgba(0, 0, 0, 0.3)',
                boxShadow: 'none',
                '@media print': { background: '#FFFFFF', border: '1px solid #E0E0E0' },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: '#666',
                        fontWeight: 700,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        '@media print': { color: '#000000', borderColor: '#E0E0E0' },
                      }}
                    >
                      Service
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: '#666',
                        fontWeight: 700,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        '@media print': { color: '#000000', borderColor: '#E0E0E0' },
                      }}
                    >
                      Est. Hours
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: '#666',
                        fontWeight: 700,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        '@media print': { color: '#000000', borderColor: '#E0E0E0' },
                      }}
                    >
                      Actual Hours
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: '#666',
                        fontWeight: 700,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        '@media print': { color: '#000000', borderColor: '#E0E0E0' },
                      }}
                    >
                      Variance
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: '#666',
                        fontWeight: 700,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        '@media print': { color: '#000000', borderColor: '#E0E0E0' },
                      }}
                    >
                      Price
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(report.lineItems ?? []).map((item: {
                    displayName?: string;
                    estimatedHours?: number;
                    actualProductiveHours?: number;
                    variance?: number;
                    lineItemTotal?: number;
                  }, index: number) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          color: '#FFFFFF',
                          borderColor: 'rgba(255, 255, 255, 0.06)',
                          '@media print': { color: '#000000', borderColor: '#E0E0E0' },
                        }}
                      >
                        {item.displayName ?? ''}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: '#B3B3B3',
                          borderColor: 'rgba(255, 255, 255, 0.06)',
                          '@media print': { color: '#666666', borderColor: '#E0E0E0' },
                        }}
                      >
                        {(item.estimatedHours ?? 0).toFixed(1)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: '#FFFFFF',
                          fontWeight: 600,
                          borderColor: 'rgba(255, 255, 255, 0.06)',
                          '@media print': { color: '#000000', borderColor: '#E0E0E0' },
                        }}
                      >
                        {(item.actualProductiveHours ?? 0).toFixed(1)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: (item.variance ?? 0) > 0 ? '#FF9800' : '#4CAF50',
                          fontWeight: 600,
                          borderColor: 'rgba(255, 255, 255, 0.06)',
                          '@media print': {
                            color: (item.variance ?? 0) > 0 ? '#F57C00' : '#2E7D32',
                            borderColor: '#E0E0E0',
                          },
                        }}
                      >
                        {(item.variance ?? 0) > 0 ? '+' : ''}{(item.variance ?? 0).toFixed(1)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: '#FFFFFF',
                          fontWeight: 600,
                          borderColor: 'rgba(255, 255, 255, 0.06)',
                          '@media print': { color: '#000000', borderColor: '#E0E0E0' },
                        }}
                      >
                        {formatCurrency(item.lineItemTotal ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Time Logs by Crew Member */}
        <Card
          sx={{
            background: 'rgba(28, 28, 30, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 3,
            mb: 3,
            '@media print': {
              background: '#FFFFFF',
              border: '1px solid #000000',
              boxShadow: 'none',
              pageBreakInside: 'avoid',
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 3,
                '@media print': { color: '#000000' },
              }}
            >
              Crew Time Breakdown
            </Typography>

            {(Object.values(report.timeLogs ?? {}) as Array<{
              employeeName?: string;
              employeePosition?: string;
              totalHours?: number;
              totalCost?: number;
              logs?: Array<{
                taskName?: string;
                notes?: string;
                taskType?: string;
                durationHours?: number;
                totalCost?: number;
              }>;
            }>).map((employeeData, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    background: 'rgba(0, 122, 255, 0.1)',
                    borderRadius: 2,
                    '@media print': { background: '#E3F2FD', border: '1px solid #90CAF9' },
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#FFFFFF',
                        fontWeight: 600,
                        '@media print': { color: '#000000' },
                      }}
                    >
                      {employeeData.employeeName ?? ''}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#B3B3B3',
                        '@media print': { color: '#666666' },
                      }}
                    >
                      {employeeData.employeePosition ?? ''}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#007AFF',
                        fontWeight: 700,
                        '@media print': { color: '#1976D2' },
                      }}
                    >
                      {(employeeData.totalHours ?? 0).toFixed(1)}h
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#B3B3B3',
                        '@media print': { color: '#666666' },
                      }}
                    >
                      {formatCurrency(employeeData.totalCost ?? 0)} cost
                    </Typography>
                  </Box>
                </Box>

                <TableContainer
                  component={Paper}
                  sx={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    boxShadow: 'none',
                    mb: 2,
                    '@media print': { background: '#FFFFFF', border: '1px solid #E0E0E0' },
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            color: '#666',
                            fontWeight: 600,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            '@media print': { color: '#666666', borderColor: '#E0E0E0' },
                          }}
                        >
                          Task
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#666',
                            fontWeight: 600,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            '@media print': { color: '#666666', borderColor: '#E0E0E0' },
                          }}
                        >
                          Type
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: '#666',
                            fontWeight: 600,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            '@media print': { color: '#666666', borderColor: '#E0E0E0' },
                          }}
                        >
                          Hours
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: '#666',
                            fontWeight: 600,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            '@media print': { color: '#666666', borderColor: '#E0E0E0' },
                          }}
                        >
                          Cost
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(employeeData.logs ?? []).map((log: {
                        taskName?: string;
                        notes?: string;
                        taskType?: string;
                        durationHours?: number;
                        totalCost?: number;
                      }, logIndex: number) => (
                        <TableRow key={logIndex}>
                          <TableCell
                            sx={{
                              color: '#FFFFFF',
                              borderColor: 'rgba(255, 255, 255, 0.06)',
                              '@media print': { color: '#000000', borderColor: '#E0E0E0' },
                            }}
                          >
                            {log.taskName ?? ''}
                            {log.notes && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  color: '#666',
                                  fontStyle: 'italic',
                                  mt: 0.5,
                                  '@media print': { color: '#666666' },
                                }}
                              >
                                {log.notes}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              borderColor: 'rgba(255, 255, 255, 0.06)',
                              '@media print': { borderColor: '#E0E0E0' },
                            }}
                          >
                            <Chip
                              label={(log.taskType ?? 'support') === 'productive' ? 'Billable' : 'Support'}
                              size="small"
                              sx={{
                                background:
                                  (log.taskType ?? 'support') === 'productive'
                                    ? 'rgba(0, 122, 255, 0.2)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                color: (log.taskType ?? 'support') === 'productive' ? '#007AFF' : '#666',
                                fontSize: '0.7rem',
                                '@media print': {
                                  background: (log.taskType ?? 'support') === 'productive' ? '#E3F2FD' : '#F5F5F5',
                                  color: (log.taskType ?? 'support') === 'productive' ? '#1976D2' : '#666666',
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: '#FFFFFF',
                              fontWeight: 600,
                              borderColor: 'rgba(255, 255, 255, 0.06)',
                              '@media print': { color: '#000000', borderColor: '#E0E0E0' },
                            }}
                          >
                            {(log.durationHours ?? 0).toFixed(2)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: '#B3B3B3',
                              borderColor: 'rgba(255, 255, 255, 0.06)',
                              '@media print': { color: '#666666', borderColor: '#E0E0E0' },
                            }}
                          >
                            {formatCurrency(log.totalCost ?? 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Crew Members */}
        {(report.crewMembers ?? []).length > 0 && (
          <Card
            sx={{
              background: 'rgba(28, 28, 30, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 3,
              mb: 3,
              '@media print': {
                background: '#FFFFFF',
                border: '1px solid #000000',
                boxShadow: 'none',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#FFFFFF',
                  mb: 3,
                  '@media print': { color: '#000000' },
                }}
              >
                Assigned Crew
              </Typography>

              <Grid container spacing={2}>
                {(report.crewMembers ?? []).map((member: {
                  name?: string;
                  position?: string;
                  effectiveRate?: number;
                }, index: number) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 2,
                        '@media print': { background: '#F5F5F5', border: '1px solid #E0E0E0' },
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#FFFFFF',
                          fontWeight: 600,
                          '@media print': { color: '#000000' },
                        }}
                      >
                        {member.name ?? ''}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#B3B3B3',
                          '@media print': { color: '#666666' },
                        }}
                      >
                        {member.position ?? ''} • ${(member.effectiveRate ?? 0).toFixed(2)}/hr
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {(report.jobNotes ?? null) && (
          <Card
            sx={{
              background: 'rgba(28, 28, 30, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 3,
              mb: 3,
              '@media print': {
                background: '#FFFFFF',
                border: '1px solid #000000',
                boxShadow: 'none',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#FFFFFF',
                  mb: 2,
                  '@media print': { color: '#000000' },
                }}
              >
                Project Notes
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#B3B3B3',
                  fontStyle: 'italic',
                  '@media print': { color: '#666666' },
                }}
              >
                {report.jobNotes ?? ''}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            '@media print': { borderColor: '#E0E0E0' },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              '@media print': { color: '#666666' },
            }}
          >
            Report generated on {report.createdAt ? formatDateTime(report.createdAt) : 'N/A'}
          </Typography>
        </Box>
      </Container>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
