'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import CoffeeIcon from '@mui/icons-material/Coffee';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ConstructionIcon from '@mui/icons-material/Construction';

interface SupportTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTask: (taskName: string) => void;
}

const supportTasks = [
  { name: 'Transport', icon: <LocalShippingIcon />, description: 'Travel to/from job site' },
  { name: 'Setup', icon: <ConstructionIcon />, description: 'Site preparation, equipment setup' },
  { name: 'Maintenance', icon: <BuildIcon />, description: 'Equipment maintenance, repairs' },
  { name: 'Fuel Stop', icon: <LocalGasStationIcon />, description: 'Refueling equipment or vehicles' },
  { name: 'Safety Walkthrough', icon: <HealthAndSafetyIcon />, description: 'Safety inspection, briefing' },
  { name: 'Break / Lunch', icon: <CoffeeIcon />, description: 'Crew break or lunch' },
  { name: 'Tear Down', icon: <ConstructionIcon />, description: 'Site cleanup, equipment breakdown' },
];

export default function SupportTaskModal({ open, onClose, onSelectTask }: SupportTaskModalProps) {
  const handleSelectTask = (taskName: string) => {
    onSelectTask(taskName);
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
            Log Support Task
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Select a non-billable overhead task to track
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <List>
          {supportTasks.map((task, index) => (
            <ListItem
              key={task.name}
              disablePadding
              sx={{
                borderBottom: index < supportTasks.length - 1 ? '1px solid #2A2A2A' : 'none',
              }}
            >
              <ListItemButton
                onClick={() => handleSelectTask(task.name)}
                sx={{
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#666', minWidth: 48 }}>
                  {task.icon}
                </ListItemIcon>
                <Box>
                  <ListItemText
                    primary={task.name}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '1rem',
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {task.description}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
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
      </DialogActions>
    </Dialog>
  );
}
