'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  CheckCircle,
  PlayArrow,
  People,
  Business,
  Construction,
  Schedule,
  Edit,
  Send,
  Cancel,
  AccountBalance,
  ShowChart,
  Percent,
} from '@mui/icons-material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useOrganization } from '@clerk/nextjs';
import OrganizationRequired from '@/components/OrganizationRequired';

type DateRange = 'this_month' | 'last_30_days' | 'last_quarter' | 'all_time';

export default function AnalyticsDashboard() {
  const { organization } = useOrganization();
  const [dateRange, setDateRange] = useState<DateRange>('this_month');

  const analytics = useQuery(api.analytics.getAnalytics, { dateRange });

  if (!organization) {
    return <OrganizationRequired />;
  }

  if (analytics === undefined) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#000000',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#000000', py: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ color: '#8E8E93' }}>
            No analytics data available
          </Typography>
        </Container>
      </Box>
    );
  }

  const { summary, projectsByStatus, topEmployees, topCustomers, equipmentList, revenueTrend } =
    analytics;

  // Calculate trend indicator (simplified)
  const revenueChange = revenueTrend.length >= 2
    ? ((revenueTrend[revenueTrend.length - 1].revenue - revenueTrend[0].revenue) / (revenueTrend[0].revenue || 1)) * 100
    : 0;

  return (
    <Box sx={{ minHeight: '100vh', background: '#000000', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: { xs: '1.75rem', md: '2.125rem' },
              }}
            >
              Analytics
            </Typography>
            <Typography variant="body2" sx={{ color: '#8E8E93', mt: 0.5 }}>
              Business intelligence and performance metrics
            </Typography>
          </Box>

          {/* Date Range Selector */}
          <FormControl
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                background: '#1C1C1E',
                color: '#FFFFFF',
                '& fieldset': {
                  borderColor: '#2C2C2E',
                },
                '&:hover fieldset': {
                  borderColor: '#007AFF',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#007AFF',
                },
              },
            }}
          >
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              sx={{ color: '#FFFFFF' }}
            >
              <MenuItem value="this_month">This Month</MenuItem>
              <MenuItem value="last_30_days">Last 30 Days</MenuItem>
              <MenuItem value="last_quarter">Last Quarter</MenuItem>
              <MenuItem value="all_time">All Time</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Key Metrics Cards - Top Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Revenue */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: '#1C1C1E',
                border: '1px solid #2C2C2E',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', fontWeight: 600 }}>
                    Total Revenue
                  </Typography>
                  <Avatar sx={{ width: 40, height: 40, background: '#007AFF20' }}>
                    <AttachMoney sx={{ color: '#007AFF', fontSize: 20 }} />
                  </Avatar>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  ${summary.totalRevenue.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {revenueChange >= 0 ? (
                    <TrendingUp sx={{ fontSize: 16, color: '#34C759' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: '#FF3B30' }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      color: revenueChange >= 0 ? '#34C759' : '#FF3B30',
                      fontWeight: 600,
                    }}
                  >
                    {Math.abs(revenueChange).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8E8E93', ml: 0.5 }}>
                    vs previous period
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Profit */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: '#1C1C1E',
                border: '1px solid #2C2C2E',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', fontWeight: 600 }}>
                    Total Profit
                  </Typography>
                  <Avatar sx={{ width: 40, height: 40, background: '#34C75920' }}>
                    <AccountBalance sx={{ color: '#34C759', fontSize: 20 }} />
                  </Avatar>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  ${summary.totalProfit.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Percent sx={{ fontSize: 16, color: '#34C759' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#34C759',
                      fontWeight: 600,
                    }}
                  >
                    {summary.profitMargin.toFixed(1)}% margin
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Projects Completed */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: '#1C1C1E',
                border: '1px solid #2C2C2E',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', fontWeight: 600 }}>
                    Completed
                  </Typography>
                  <Avatar sx={{ width: 40, height: 40, background: '#34C75920' }}>
                    <CheckCircle sx={{ color: '#34C759', fontSize: 20 }} />
                  </Avatar>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  {summary.projectsCompleted}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                  projects finished
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Projects */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: '#1C1C1E',
                border: '1px solid #2C2C2E',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8E8E93', fontWeight: 600 }}>
                    Active Projects
                  </Typography>
                  <Avatar sx={{ width: 40, height: 40, background: '#007AFF20' }}>
                    <PlayArrow sx={{ color: '#007AFF', fontSize: 20 }} />
                  </Avatar>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  {summary.activeProjects}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                  in progress or scheduled
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Financial Overview Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Revenue vs Cost Breakdown */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                background: '#1C1C1E',
                border: '1px solid #2C2C2E',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <ShowChart sx={{ color: '#007AFF', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    Financial Overview
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  {/* Revenue */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#8E8E93', fontWeight: 600 }}>
                        Revenue
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                        ${summary.totalRevenue.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#2C2C2E',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#007AFF',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  {/* Cost */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#8E8E93', fontWeight: 600 }}>
                        Total Cost
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                        ${summary.totalCost.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={summary.totalRevenue > 0 ? (summary.totalCost / summary.totalRevenue) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#2C2C2E',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#FF9500',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  {/* Profit */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#8E8E93', fontWeight: 600 }}>
                        Profit
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#34C759', fontWeight: 600 }}>
                        ${summary.totalProfit.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={summary.totalRevenue > 0 ? (summary.totalProfit / summary.totalRevenue) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#2C2C2E',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#34C759',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Divider sx={{ borderColor: '#2C2C2E' }} />

                  {/* Profit Margin */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      Profit Margin
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#34C759', fontWeight: 700 }}>
                      {summary.profitMargin.toFixed(1)}%
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Project Status Overview */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                background: '#1C1C1E',
                border: '1px solid #2C2C2E',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Construction sx={{ color: '#007AFF', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    Project Status Overview
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {/* Draft */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Edit sx={{ color: '#666666', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                        Draft
                      </Typography>
                    </Box>
                    <Chip
                      label={projectsByStatus.draft}
                      sx={{
                        background: '#66666620',
                        color: '#666666',
                        fontWeight: 700,
                        minWidth: 50,
                      }}
                    />
                  </Box>

                  {/* Sent */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Send sx={{ color: '#007AFF', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                        Sent to Customer
                      </Typography>
                    </Box>
                    <Chip
                      label={projectsByStatus.sent}
                      sx={{
                        background: '#007AFF20',
                        color: '#007AFF',
                        fontWeight: 700,
                        minWidth: 50,
                      }}
                    />
                  </Box>

                  {/* Accepted */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircle sx={{ color: '#34C759', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                        Accepted
                      </Typography>
                    </Box>
                    <Chip
                      label={projectsByStatus.accepted}
                      sx={{
                        background: '#34C75920',
                        color: '#34C759',
                        fontWeight: 700,
                        minWidth: 50,
                      }}
                    />
                  </Box>

                  {/* Scheduled */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Schedule sx={{ color: '#FF9500', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                        Scheduled
                      </Typography>
                    </Box>
                    <Chip
                      label={projectsByStatus.scheduled}
                      sx={{
                        background: '#FF950020',
                        color: '#FF9500',
                        fontWeight: 700,
                        minWidth: 50,
                      }}
                    />
                  </Box>

                  {/* In Progress */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PlayArrow sx={{ color: '#007AFF', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                        In Progress
                      </Typography>
                    </Box>
                    <Chip
                      label={projectsByStatus.in_progress}
                      sx={{
                        background: '#007AFF20',
                        color: '#007AFF',
                        fontWeight: 700,
                        minWidth: 50,
                      }}
                    />
                  </Box>

                  {/* Completed */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircle sx={{ color: '#34C759', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                        Completed
                      </Typography>
                    </Box>
                    <Chip
                      label={projectsByStatus.completed}
                      sx={{
                        background: '#34C75920',
                        color: '#34C759',
                        fontWeight: 700,
                        minWidth: 50,
                      }}
                    />
                  </Box>

                  {/* Cancelled */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Cancel sx={{ color: '#FF3B30', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#8E8E93' }}>
                        Cancelled
                      </Typography>
                    </Box>
                    <Chip
                      label={projectsByStatus.cancelled}
                      sx={{
                        background: '#FF3B3020',
                        color: '#FF3B30',
                        fontWeight: 700,
                        minWidth: 50,
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Performers Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Top Employees */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                background: '#1C1C1E',
                border: '1px solid #2C2C2E',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <People sx={{ color: '#007AFF', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    Top Employees
                  </Typography>
                </Box>

                {topEmployees.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#8E8E93', textAlign: 'center', py: 4 }}>
                    No employee data available
                  </Typography>
                ) : (
                  <List sx={{ p: 0 }}>
                    {topEmployees.map((employee, index) => (
                      <ListItem
                        key={employee.employeeId}
                        sx={{
                          borderBottom: index < topEmployees.length - 1 ? '1px solid #2C2C2E' : 'none',
                          px: 0,
                          py: 2,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                                {employee.name}
                              </Typography>
                              <Chip
                                label={`#${index + 1}`}
                                size="small"
                                sx={{
                                  background: index === 0 ? '#FFD70020' : '#007AFF20',
                                  color: index === 0 ? '#FFD700' : '#007AFF',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                                  Total Hours
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                                  {employee.totalHours.toFixed(1)}h
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                                  Revenue Generated
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#34C759', fontWeight: 600 }}>
                                  ${employee.totalRevenue.toLocaleString()}
                                </Typography>
                              </Box>
                            </Stack>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Customers */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                background: '#1C1C1E',
                border: '1px solid #2C2C2E',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Business sx={{ color: '#007AFF', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                    Top Customers
                  </Typography>
                </Box>

                {topCustomers.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#8E8E93', textAlign: 'center', py: 4 }}>
                    No customer data available
                  </Typography>
                ) : (
                  <List sx={{ p: 0 }}>
                    {topCustomers.map((customer, index) => (
                      <ListItem
                        key={customer.customerId}
                        sx={{
                          borderBottom: index < topCustomers.length - 1 ? '1px solid #2C2C2E' : 'none',
                          px: 0,
                          py: 2,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                                {customer.name}
                              </Typography>
                              <Chip
                                label={`#${index + 1}`}
                                size="small"
                                sx={{
                                  background: index === 0 ? '#FFD70020' : '#007AFF20',
                                  color: index === 0 ? '#FFD700' : '#007AFF',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                                  Total Revenue
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#34C759', fontWeight: 600 }}>
                                  ${customer.totalRevenue.toLocaleString()}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                                  Projects
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                                  {customer.projectCount}
                                </Typography>
                              </Box>
                            </Stack>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Equipment Utilization */}
        <Card
          sx={{
            background: '#1C1C1E',
            border: '1px solid #2C2C2E',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Construction sx={{ color: '#007AFF', fontSize: 24 }} />
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                Equipment Utilization
              </Typography>
            </Box>

            {equipmentList.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#8E8E93', textAlign: 'center', py: 4 }}>
                No equipment data available
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {equipmentList.map((equipment) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={equipment.equipmentId}>
                    <Box
                      sx={{
                        p: 2,
                        background: '#0A0A0A',
                        borderRadius: 2,
                        border: '1px solid #2C2C2E',
                      }}
                    >
                      <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 1 }}>
                        {equipment.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block', mb: 2 }}>
                        {equipment.type}
                      </Typography>

                      <Stack spacing={1.5}>
                        {/* Utilization */}
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                              Utilization
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: equipment.utilization > 70 ? '#34C759' : equipment.utilization > 40 ? '#FF9500' : '#FF3B30',
                                fontWeight: 600,
                              }}
                            >
                              {equipment.utilization.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(equipment.utilization, 100)}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: '#2C2C2E',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: equipment.utilization > 70 ? '#34C759' : equipment.utilization > 40 ? '#FF9500' : '#FF3B30',
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>

                        <Divider sx={{ borderColor: '#2C2C2E' }} />

                        {/* Total Hours */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                            Total Hours
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                            {equipment.totalHours.toFixed(1)}h
                          </Typography>
                        </Box>

                        {/* Cost per Hour */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                            Cost/Hour
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                            ${equipment.hourlyCost.toFixed(2)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
