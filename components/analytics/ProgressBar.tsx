'use client';

import { Box, Typography, LinearProgress } from '@mui/material';

export interface ProgressBarProps {
  label: string;
  percentage: number;
  color?: string;
  showValue?: boolean;
}

export default function ProgressBar({
  label,
  percentage,
  color = '#007AFF',
  showValue = true,
}: ProgressBarProps) {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {label}
        </Typography>
        {showValue && (
          <Typography
            variant="body2"
            sx={{
              color: '#8E8E93',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {normalizedPercentage.toFixed(0)}%
          </Typography>
        )}
      </Box>
      <LinearProgress
        variant="determinate"
        value={normalizedPercentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: color,
            backgroundImage: `linear-gradient(90deg, ${color}dd, ${color})`,
          },
        }}
      />
    </Box>
  );
}
