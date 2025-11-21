'use client';

import { Box, Typography, Paper } from '@mui/material';

export interface StatsListItem {
  name: string;
  value: string | number;
  subtitle?: string;
}

export interface StatsListProps {
  items: StatsListItem[];
  numbered?: boolean;
  color?: string;
}

export default function StatsList({
  items,
  numbered = true,
  color = '#007AFF',
}: StatsListProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {items.map((item, index) => (
        <Paper
          key={index}
          sx={{
            background: '#1C1C1E',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${color}20`,
            },
          }}
        >
          {numbered && (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: index < 3 ? `${color}15` : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  color: index < 3 ? color : '#8E8E93',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                {index + 1}
              </Typography>
            </Box>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.9375rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </Typography>
            {item.subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: '#8E8E93',
                  fontSize: '0.8125rem',
                  mt: 0.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.subtitle}
              </Typography>
            )}
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1.125rem',
              flexShrink: 0,
            }}
          >
            {item.value}
          </Typography>
        </Paper>
      ))}

      {items.length === 0 && (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            background: '#1C1C1E',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 2,
          }}
        >
          <Typography sx={{ color: '#8E8E93' }}>
            No data available
          </Typography>
        </Box>
      )}
    </Box>
  );
}
