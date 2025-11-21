'use client';

import { Card, CardContent, Box, Typography, SvgIconProps } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<SvgIconProps>;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: string;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color = '#007AFF',
}: MetricCardProps) {
  const trendColor = trend?.direction === 'up' ? '#34C759' : '#FF3B30';
  const TrendIcon = trend?.direction === 'up' ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card
      sx={{
        background: '#1C1C1E',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          border: `1px solid ${color}20`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: '#8E8E93',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 24, color }} />
          </Box>
        </Box>

        <Typography
          variant="h4"
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            mb: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </Typography>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
            <Typography
              variant="body2"
              sx={{
                color: trendColor,
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#8E8E93',
                fontSize: '0.875rem',
                ml: 0.5,
              }}
            >
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
