'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  LinearProgress,
  CircularProgress,
  Avatar,
  AvatarGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import SupportTaskModal from '@/components/SupportTaskModal';
import ManualTimeEntryModal from '@/components/ManualTimeEntryModal';
import AddLineItemModal from '@/components/AddLineItemModal';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Menu from '@mui/material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from '@/app/contexts/SnackbarContext';

export default function WorkOrderDetailPage() {
  const params = useParams();
  const jobId = params.id as Id<'jobs'>;

  const job = useQuery(api.jobs.getJob, { jobId });
  const employees = useQuery(api.jobs.listEmployees);
  const { showError, showSuccess, showConfirm } = useSnackbar();

  // Employee selection (until Clerk is integrated)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<Id<'employees'> | undefined>(undefined);

  // Auto-select first crew member on load
  useEffect(() => {
    if (!selectedEmployeeId && job?.crew?.members?.[0]) {
      setSelectedEmployeeId(job.crew.members[0]._id as Id<'employees'>);
    }
  }, [job, selectedEmployeeId]);

  const activeTimer = useQuery(
    api.timeLogs.getActiveTimer,
    selectedEmployeeId ? { employeeId: selectedEmployeeId } : 'skip'
  );

  const startTimer = useMutation(api.timeLogs.startTimer);
  const stopTimer = useMutation(api.timeLogs.stopTimer);
  const markComplete = useMutation(api.jobLineItems.markComplete);
  const markJobComplete = useMutation(api.jobs.markJobComplete);
  const addManualTimeEntry = useMutation(api.timeLogs.addManualTimeEntry);
  const addLineItem = useMutation(api.jobLineItems.addLineItem);
  const deleteLineItem = useMutation(api.jobLineItems.deleteLineItem);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [supportTaskModalOpen, setSupportTaskModalOpen] = useState(false);
  const [stopTimerDialogOpen, setStopTimerDialogOpen] = useState(false);
  const [stopTimerNotes, setStopTimerNotes] = useState('');
  const [manualEntryModalOpen, setManualEntryModalOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'productive' | 'support'>('all');
  const [addLineItemModalOpen, setAddLineItemModalOpen] = useState(false);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<Id<'jobLineItems'> | null>(null);

  // Update elapsed time every second for active timer
  useEffect(() => {
    if (activeTimer) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - activeTimer.startTime;
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeTimer]);

  const handleStartTask = async (
    taskName: string,
    taskType: 'productive' | 'support',
    lineItemId?: Id<'jobLineItems'>
  ) => {
    if (!selectedEmployeeId) {
      showError('Please select an employee first');
      return;
    }

    try {
      await startTimer({
        jobId,
        jobLineItemId: lineItemId,
        employeeId: selectedEmployeeId,
        taskType,
        taskName,
      });
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleStopTimerClick = () => {
    setStopTimerDialogOpen(true);
  };

  const handleConfirmStopTimer = async () => {
    if (!activeTimer) return;

    try {
      await stopTimer({ timeLogId: activeTimer._id, notes: stopTimerNotes || undefined });
      setStopTimerDialogOpen(false);
      setStopTimerNotes('');
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleSupportTaskSelect = async (taskName: string) => {
    await handleStartTask(taskName, 'support', undefined);
  };

  const handleCompleteJob = async () => {
    showConfirm(
      'Mark this entire job as complete? All tasks will be marked done.',
      async () => {
        try {
          await markJobComplete({ jobId });
          showSuccess('Job marked as complete!');
        } catch (error: any) {
          showError(error.message);
        }
      },
      'Complete Job'
    );
  };

  const handleOpenTaskMenu = (event: React.MouseEvent<HTMLElement>, taskId: Id<'jobLineItems'>) => {
    setTaskMenuAnchor(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const handleCloseTaskMenu = () => {
    setTaskMenuAnchor(null);
    setSelectedTaskId(null);
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId) return;

    showConfirm(
      'Delete this task? This cannot be undone.',
      async () => {
        try {
          await deleteLineItem({ lineItemId: selectedTaskId });
          handleCloseTaskMenu();
        } catch (error: any) {
          showError(error.message);
        }
      },
      'Delete Task'
    );
  };

  const handleManualTimeEntry = async (data: {
    taskName: string;
    taskType: 'productive' | 'support';
    lineItemId?: Id<'jobLineItems'>;
    durationHours: number;
    notes: string;
  }) => {
    if (!selectedEmployeeId) {
      showError('Please select an employee first');
      return;
    }

    try {
      await addManualTimeEntry({
        jobId,
        jobLineItemId: data.lineItemId,
        employeeId: selectedEmployeeId,
        taskType: data.taskType,
        taskName: data.taskName,
        durationHours: data.durationHours,
        notes: data.notes || undefined,
      });
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleAddLineItem = async (data: any) => {
    try {
      await addLineItem({
        jobId,
        ...data,
      });
      setAddLineItemModalOpen(false);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const formatElapsedTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDuration = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (job === undefined) {
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

  if (job === null) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" sx={{ color: '#B3B3B3' }}>
          Project not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
          {job.jobNumber}
        </Typography>
        <Chip
          label={job.status.replace('_', ' ').toUpperCase()}
          color={getStatusColor(job.status)}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Active Timer Banner */}
      {activeTimer && (
        <Box
          sx={{
            mb: 3,
            p: 3,
            background: 'rgba(0, 122, 255, 0.15)',
            border: '2px solid rgba(0, 122, 255, 0.6)',
            borderRadius: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 16px rgba(0, 122, 255, 0.15)',
          }}
        >
          <Box>
            <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 0.5 }}>
              ⏱ Timer Running: {activeTimer.taskName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#007AFF' }}>
              {formatElapsedTime(elapsedTime)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<StopIcon />}
            onClick={handleStopTimerClick}
            sx={{
              background: '#FF3B30',
              '&:hover': { background: '#CC2E26' },
            }}
          >
            Stop
          </Button>
        </Box>
      )}

      {/* Employee Selector */}
      {employees && employees.length > 0 && (
        <Box sx={{ mb: 3, p: 3, background: '#1C1C1E', border: '1px solid #2A2A2A', borderRadius: 3 }}>
          <Typography variant="caption" sx={{ color: '#8E8E93', mb: 1, display: 'block', fontWeight: 600, letterSpacing: '0.05em' }}>
            WHO'S LOGGING TIME?
          </Typography>
          <Select
            value={selectedEmployeeId || ''}
            onChange={(e) => setSelectedEmployeeId(e.target.value as Id<'employees'>)}
            fullWidth
            disabled={!!activeTimer}
            sx={{
              color: '#FFFFFF',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
              '& .MuiSvgIcon-root': { color: '#FFFFFF' },
              '&.Mui-disabled': {
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                color: '#666',
              },
            }}
          >
            {employees.map((emp) => (
              <MenuItem
                key={emp._id}
                value={emp._id}
                sx={{
                  color: '#FFFFFF',
                  '&:hover': { background: 'rgba(0, 122, 255, 0.1)' },
                  '&.Mui-selected': {
                    background: 'rgba(0, 122, 255, 0.2)',
                    '&:hover': { background: 'rgba(0, 122, 255, 0.3)' },
                  },
                }}
              >
                {emp.name}
              </MenuItem>
            ))}
          </Select>
          {activeTimer && (
            <Typography variant="caption" sx={{ color: '#8E8E93', mt: 1, display: 'block' }}>
              Timer running - cannot change employee
            </Typography>
          )}
        </Box>
      )}

      {/* 1. CUSTOMER INFO */}
      <Accordion
        sx={{
          background: '#1C1C1E',
          border: '1px solid #2A2A2A',
          borderRadius: '16px !important',
          mb: 3,
          overflow: 'hidden',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#FFFFFF' }} />}
          sx={{
            '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 2 },
          }}
        >
          <PersonIcon sx={{ color: '#007AFF' }} />
          <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
            Customer
          </Typography>
          {job.customer && (
            <Typography variant="body2" sx={{ color: '#8E8E93', ml: 2 }}>
              {job.customer.firstName} {job.customer.lastName}
            </Typography>
          )}
        </AccordionSummary>
        <AccordionDetails>
          {job.customer ? (
            <>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
                {job.customer.firstName} {job.customer.lastName}
                {job.customer.businessName && ` (${job.customer.businessName})`}
              </Typography>

              {job.customer.propertyType && (
                <Chip
                  label={job.customer.propertyType}
                  size="small"
                  sx={{
                    mb: 2,
                    background: job.customer.propertyType === 'Commercial' ? '#007AFF' : '#666',
                    color: '#FFFFFF',
                  }}
                />
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOnIcon sx={{ color: '#8E8E93', fontSize: 18 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                    {job.customer.streetAddress}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
                    {job.customer.city}, {job.customer.state} {job.customer.zipCode}
                  </Typography>
                </Box>
              </Box>

              {job.customer.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PhoneIcon sx={{ color: '#8E8E93', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#007AFF' }}>
                    {job.customer.phone}
                  </Typography>
                </Box>
              )}

              {job.customer.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EmailIcon sx={{ color: '#8E8E93', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#007AFF' }}>
                    {job.customer.email}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Typography variant="body2" sx={{ color: '#8E8E93', fontStyle: 'italic' }}>
              No customer information available
            </Typography>
          )}

          {job.notes && (
            <Typography variant="body2" sx={{ color: '#8E8E93', mt: 2, fontStyle: 'italic', pt: 2, borderTop: '1px solid #2A2A2A' }}>
              Job Note: {job.notes}
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* 2. TASKS (THE MAIN SECTION) */}
      <Accordion
        defaultExpanded
        sx={{
          background: '#1C1C1E',
          border: '1px solid #2A2A2A',
          borderRadius: '16px !important',
          mb: 3,
          overflow: 'hidden',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#FFFFFF' }} />}
          sx={{
            '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 2 },
          }}
        >
          <AssignmentIcon sx={{ color: '#007AFF' }} />
          <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>Tasks</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* Billable Tasks (Line Items) */}
          {job.lineItems.map((item) => {
            const isActiveTask = activeTimer?.jobLineItemId === item._id;
            const taskStatus = item.status || 'not_started';
            const isCompleted = taskStatus === 'completed';

            return (
              <Box
                key={item._id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2.5,
                  mb: 2,
                  background: isCompleted
                    ? 'rgba(52, 199, 89, 0.08)'
                    : isActiveTask
                    ? 'rgba(0, 122, 255, 0.12)'
                    : 'rgba(0, 0, 0, 0.3)',
                  border: `1.5px solid ${
                    isCompleted ? 'rgba(52, 199, 89, 0.3)' : isActiveTask ? 'rgba(0, 122, 255, 0.4)' : 'rgba(255, 255, 255, 0.06)'
                  }`,
                  borderRadius: 3,
                  opacity: isCompleted ? 0.75 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      {item.displayName}
                    </Typography>
                    {isCompleted && (
                      <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                    )}
                  </Box>
                  {isActiveTask ? (
                    <Typography variant="caption" sx={{ color: '#007AFF', fontWeight: 600 }}>
                      ⏱ {formatElapsedTime(elapsedTime)}
                    </Typography>
                  ) : isCompleted ? (
                    <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                      Completed
                    </Typography>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                      {formatDuration(item.actualProductiveHours || 0)} / {formatDuration(item.estimatedHours)} logged
                    </Typography>
                  )}
                </Box>

                {/* Button Logic */}
                {isCompleted ? (
                  // Completed state - show menu only
                  <IconButton
                    onClick={(e) => handleOpenTaskMenu(e, item._id)}
                    sx={{
                      color: '#666',
                      '&:hover': { background: 'rgba(255, 255, 255, 0.05)' },
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                ) : isActiveTask ? (
                  // Timer running - show Stop button
                  <Button
                    variant="contained"
                    startIcon={<StopIcon />}
                    onClick={handleStopTimerClick}
                    sx={{
                      background: '#FF3B30',
                      '&:hover': { background: '#CC2E26' },
                      textTransform: 'none',
                      px: 2,
                    }}
                  >
                    Stop
                  </Button>
                ) : (
                  // Not started or in progress - show Start + Done + Menu
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => handleStartTask(item.displayName, 'productive', item._id)}
                      disabled={!!activeTimer}
                      sx={{
                        background: '#007AFF',
                        '&:hover': { background: '#0066DD' },
                        '&:disabled': { background: '#333', color: '#666' },
                        textTransform: 'none',
                        px: 2,
                      }}
                    >
                      Start
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => markComplete({ lineItemId: item._id })}
                      disabled={!!activeTimer}
                      sx={{
                        borderColor: '#4CAF50',
                        color: '#4CAF50',
                        '&:hover': {
                          borderColor: '#4CAF50',
                          background: 'rgba(76, 175, 80, 0.1)',
                        },
                        '&:disabled': { borderColor: '#333', color: '#666' },
                        textTransform: 'none',
                        px: 2,
                      }}
                    >
                      Done
                    </Button>
                    <IconButton
                      onClick={(e) => handleOpenTaskMenu(e, item._id)}
                      disabled={!!activeTimer}
                      sx={{
                        color: '#666',
                        '&:hover': { background: 'rgba(255, 255, 255, 0.05)' },
                        '&:disabled': { color: '#444' },
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            );
          })}

          {/* Add Line Item Button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => setAddLineItemModalOpen(true)}
            sx={{
              mt: 2,
              background: '#4CAF50',
              '&:hover': { background: '#388E3C' },
            }}
          >
            + Add Billable Task (Forestry Mulching, etc.)
          </Button>

          {/* Add Support Task Button */}
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setSupportTaskModalOpen(true)}
            disabled={!!activeTimer}
            sx={{
              mt: 1.5,
              borderColor: '#2A2A2A',
              color: '#8E8E93',
              borderStyle: 'dashed',
              '&:hover': {
                borderColor: '#007AFF',
                background: 'rgba(0, 122, 255, 0.05)',
                color: '#007AFF',
              },
              '&:disabled': {
                borderColor: '#333',
                color: '#444',
              },
            }}
          >
            + Log Support Task (Transport, Maintenance, etc.)
          </Button>

          {/* Time Log History */}
          {job.timeLogs.length > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 4 }}>
                <Typography variant="subtitle2" sx={{ color: '#8E8E93', fontWeight: 600, letterSpacing: '0.05em' }}>
                  RECENT ACTIVITY
                </Typography>
                <Button
                  size="small"
                  onClick={() => setManualEntryModalOpen(true)}
                  sx={{
                    color: '#007AFF',
                    fontSize: '0.75rem',
                    '&:hover': { background: 'rgba(0, 122, 255, 0.1)' },
                  }}
                >
                  + Manual Entry
                </Button>
              </Box>

              {/* Filter Buttons */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label="All"
                  onClick={() => setActivityFilter('all')}
                  sx={{
                    background: activityFilter === 'all' ? '#007AFF' : '#2A2A2A',
                    color: activityFilter === 'all' ? '#FFFFFF' : '#8E8E93',
                    cursor: 'pointer',
                    '&:hover': { background: activityFilter === 'all' ? '#0066DD' : '#333' },
                  }}
                />
                <Chip
                  label="Billable"
                  onClick={() => setActivityFilter('productive')}
                  sx={{
                    background: activityFilter === 'productive' ? '#007AFF' : '#2A2A2A',
                    color: activityFilter === 'productive' ? '#FFFFFF' : '#8E8E93',
                    cursor: 'pointer',
                    '&:hover': { background: activityFilter === 'productive' ? '#0066DD' : '#333' },
                  }}
                />
                <Chip
                  label="Support"
                  onClick={() => setActivityFilter('support')}
                  sx={{
                    background: activityFilter === 'support' ? '#007AFF' : '#2A2A2A',
                    color: activityFilter === 'support' ? '#FFFFFF' : '#8E8E93',
                    cursor: 'pointer',
                    '&:hover': { background: activityFilter === 'support' ? '#0066DD' : '#333' },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {job.timeLogs
                  .filter((log: any) => {
                    if (activityFilter === 'all') return true;
                    return log.taskType === activityFilter;
                  })
                  .slice(0, 10)
                  .map((log: any) => (
                  <Box
                    key={log._id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      background: '#0A0A0A',
                      borderRadius: 1,
                      border: '1px solid #2A2A2A',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 0.25 }}>
                        {log.taskName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                        {log.employeeName} • {formatDateTime(log.startTime)}
                      </Typography>
                      {log.notes && (
                        <Typography variant="caption" sx={{ color: '#B3B3B3', display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                          "{log.notes}"
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Chip
                        label={formatDuration(log.durationHours || 0)}
                        size="small"
                        sx={{
                          background: log.taskType === 'productive' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          color: log.taskType === 'productive' ? '#007AFF' : '#666',
                          fontWeight: 600,
                        }}
                      />
                      {log.totalCost && (
                        <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                          ${log.totalCost.toFixed(0)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Running Totals */}
              {activityFilter === 'all' && (
                <Box
                  sx={{
                    mt: 3,
                    pt: 3,
                    borderTop: '1px solid #2A2A2A',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block' }}>
                      Productive Hours
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#007AFF', fontWeight: 600 }}>
                      {formatDuration(job.actualProductiveHours || 0)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block' }}>
                      Support Hours
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#B3B3B3', fontWeight: 600 }}>
                      {formatDuration(job.actualSupportHours || 0)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block', textAlign: 'right' }}>
                      Total Cost
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      ${(job.actualTotalCost || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </>
          )}
        </AccordionDetails>
      </Accordion>

      {/* 3. JOB SUMMARY */}
      <Accordion
        sx={{
          background: '#1C1C1E',
          border: '1px solid #2A2A2A',
          borderRadius: '16px !important',
          mb: 3,
          overflow: 'hidden',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#FFFFFF' }} />}
          sx={{
            '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 2 },
          }}
        >
          <DescriptionIcon sx={{ color: '#007AFF' }} />
          <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>Job Summary</Typography>
          <Typography variant="body2" sx={{ color: '#8E8E93', ml: 2 }}>
            {job.actualProductiveHours?.toFixed(1) || '0'} / {job.estimatedTotalHours.toFixed(1)} hrs
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Line Items Progress */}
            {job.lineItems.map((item, index) => {
              const progress = item.actualProductiveHours
                ? (item.actualProductiveHours / item.estimatedHours) * 100
                : 0;
              const isCompleted = progress >= 100;

              return (
                <Box key={item._id} sx={{ mb: index < job.lineItems.length - 1 ? 2 : 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      {item.displayName}
                    </Typography>
                    {isCompleted && <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 18 }} />}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#0A0A0A',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: isCompleted ? '#4CAF50' : '#007AFF',
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#B3B3B3', minWidth: 40, textAlign: 'right' }}>
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#8E8E93', mt: 0.5 }}>
                    {formatDuration(item.actualProductiveHours || 0)} / {formatDuration(item.estimatedHours)} hrs
                  </Typography>
                </Box>
              );
            })}

            {/* Crew Info */}
            {(job.crew?.members?.length ?? 0) > 0 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #2A2A2A' }}>
                <Typography variant="caption" sx={{ color: '#8E8E93', mb: 1, display: 'block', fontWeight: 600, letterSpacing: '0.05em' }}>
                  CREW
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AvatarGroup max={3}>
                    {job.crew.members?.map((member: any) => (
                      <Avatar
                        key={member._id}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: '#007AFF',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        {member.name.charAt(0)}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Typography variant="caption" sx={{ color: '#B3B3B3' }}>
                    {job.crew.members?.map((m: any) => m.name).join(', ')}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Complete Job Button */}
      {job.status !== 'completed' && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<CheckCircleIcon />}
            onClick={handleCompleteJob}
            disabled={!!activeTimer}
            sx={{
              background: '#4CAF50',
              '&:hover': { background: '#388E3C' },
              '&:disabled': { background: '#333', color: '#666' },
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Done
          </Button>
        </Box>
      )}

      {/* Support Task Modal */}
      <SupportTaskModal
        open={supportTaskModalOpen}
        onClose={() => setSupportTaskModalOpen(false)}
        onSelectTask={handleSupportTaskSelect}
      />

      {/* Manual Time Entry Modal */}
      <ManualTimeEntryModal
        open={manualEntryModalOpen}
        onClose={() => setManualEntryModalOpen(false)}
        lineItems={job.lineItems}
        employeeId={selectedEmployeeId}
        onSubmit={handleManualTimeEntry}
      />

      {/* Add Line Item Modal */}
      <AddLineItemModal
        open={addLineItemModalOpen}
        onClose={() => setAddLineItemModalOpen(false)}
        onSubmit={handleAddLineItem}
      />

      {/* Task Action Menu */}
      <Menu
        anchorEl={taskMenuAnchor}
        open={Boolean(taskMenuAnchor)}
        onClose={handleCloseTaskMenu}
        PaperProps={{
          sx: {
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            minWidth: 180,
          },
        }}
      >
        <MenuItem
          onClick={handleDeleteTask}
          sx={{
            color: '#FF3B30',
            '&:hover': { background: 'rgba(255, 59, 48, 0.1)' },
          }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Task
        </MenuItem>
      </Menu>

      {/* Stop Timer Dialog with Notes */}
      <Dialog
        open={stopTimerDialogOpen}
        onClose={() => setStopTimerDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
          },
        }}
      >
        <DialogTitle sx={{ color: '#FFFFFF', borderBottom: '1px solid #2A2A2A' }}>
          Stop Timer
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {activeTimer && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ color: '#FFFFFF', mb: 1 }}>
                <strong>{activeTimer.taskName}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Duration: {formatElapsedTime(elapsedTime)}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (optional)"
            placeholder="Add any observations, issues, or lessons learned..."
            value={stopTimerNotes}
            onChange={(e) => setStopTimerNotes(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': { color: '#B3B3B3' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
              '& .MuiOutlinedInput-root': {
                color: '#FFFFFF',
                '& fieldset': { borderColor: '#2A2A2A' },
                '&:hover fieldset': { borderColor: '#007AFF' },
                '&.Mui-focused fieldset': { borderColor: '#007AFF' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #2A2A2A' }}>
          <Button
            onClick={() => {
              setStopTimerDialogOpen(false);
              setStopTimerNotes('');
            }}
            sx={{
              color: '#666',
              '&:hover': { background: 'rgba(255, 255, 255, 0.05)' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmStopTimer}
            sx={{
              background: '#FF3B30',
              '&:hover': { background: '#CC2E26' },
            }}
          >
            Stop Timer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
