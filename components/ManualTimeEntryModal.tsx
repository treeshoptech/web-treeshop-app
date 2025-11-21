'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Id } from '@/convex/_generated/dataModel';
import { useSnackbar } from '@/app/contexts/SnackbarContext';

interface ManualTimeEntryModalProps {
  open: boolean;
  onClose: () => void;
  lineItems: any[];
  employeeId: Id<'employees'> | undefined;
  onSubmit: (data: {
    taskName: string;
    taskType: 'productive' | 'support';
    lineItemId?: Id<'jobLineItems'>;
    durationHours: number;
    notes: string;
  }) => void;
}

export default function ManualTimeEntryModal({
  open,
  onClose,
  lineItems,
  employeeId,
  onSubmit,
}: ManualTimeEntryModalProps) {
  const { showError } = useSnackbar();
  const [taskType, setTaskType] = useState<'productive' | 'support'>('productive');
  const [selectedLineItemId, setSelectedLineItemId] = useState<string>('');
  const [supportTaskName, setSupportTaskName] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [notes, setNotes] = useState('');

  const supportTasks = [
    'Transport',
    'Setup',
    'Maintenance',
    'Fuel Stop',
    'Safety Walkthrough',
    'Break / Lunch',
    'Tear Down',
  ];

  const handleSubmit = () => {
    if (!employeeId) {
      showError('Please select an employee first');
      return;
    }

    if (!durationHours || parseFloat(durationHours) <= 0) {
      showError('Please enter a valid duration');
      return;
    }

    let taskName = '';
    let lineItemId: Id<'jobLineItems'> | undefined = undefined;

    if (taskType === 'productive') {
      if (!selectedLineItemId) {
        showError('Please select a task');
        return;
      }
      const item = lineItems.find((i) => i._id === selectedLineItemId);
      taskName = item?.displayName || '';
      lineItemId = selectedLineItemId as Id<'jobLineItems'>;
    } else {
      if (!supportTaskName) {
        showError('Please select a support task');
        return;
      }
      taskName = supportTaskName;
    }

    onSubmit({
      taskName,
      taskType,
      lineItemId,
      durationHours: parseFloat(durationHours),
      notes,
    });

    // Reset form
    setTaskType('productive');
    setSelectedLineItemId('');
    setSupportTaskName('');
    setDurationHours('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            Add Manual Time Entry
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Log time that wasn't tracked with the timer
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Task Type */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
              Task Type
            </InputLabel>
            <Select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as 'productive' | 'support')}
              label="Task Type"
              sx={{
                color: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                '& .MuiSvgIcon-root': { color: '#FFFFFF' },
              }}
            >
              <MenuItem value="productive">Billable Task</MenuItem>
              <MenuItem value="support">Support Task</MenuItem>
            </Select>
          </FormControl>

          {/* Task Selection */}
          {taskType === 'productive' ? (
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                Select Task
              </InputLabel>
              <Select
                value={selectedLineItemId}
                onChange={(e) => setSelectedLineItemId(e.target.value)}
                label="Select Task"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                }}
              >
                {lineItems.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#B3B3B3', '&.Mui-focused': { color: '#007AFF' } }}>
                Support Task
              </InputLabel>
              <Select
                value={supportTaskName}
                onChange={(e) => setSupportTaskName(e.target.value)}
                label="Support Task"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A2A2A' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007AFF' },
                  '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                }}
              >
                {supportTasks.map((task) => (
                  <MenuItem key={task} value={task}>
                    {task}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Duration */}
          <TextField
            fullWidth
            label="Duration (hours)"
            type="number"
            inputProps={{ step: 0.25, min: 0 }}
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            placeholder="e.g., 2.5"
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

          {/* Notes */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (optional)"
            placeholder="Add any observations or context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #2A2A2A' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#666',
            '&:hover': { background: 'rgba(255, 255, 255, 0.05)' },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            background: '#007AFF',
            '&:hover': { background: '#0066DD' },
          }}
        >
          Add Time Entry
        </Button>
      </DialogActions>
    </Dialog>
  );
}
