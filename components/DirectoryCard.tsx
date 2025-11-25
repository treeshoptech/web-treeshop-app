'use client';

import { useState, MouseEvent } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

export interface MetricItem {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
}

export interface ActionItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: 'default' | 'primary' | 'error';
  divider?: boolean;
}

export interface DetailField {
  label: string;
  value: string | number | React.ReactNode;
  fullWidth?: boolean;
}

export interface DirectoryCardProps {
  // Identity
  id: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;

  // Badges/Status
  badges?: Array<{
    label: string;
    color?: string;
    variant?: 'filled' | 'outlined';
  }>;

  // Collapsed State Data
  collapsedMetrics?: MetricItem[];

  // Expanded State Data
  expandedMetrics?: MetricItem[];
  expandedDetails?: DetailField[];
  notes?: string;

  // Actions
  actions?: ActionItem[];
  onCardClick?: () => void;

  // State
  defaultExpanded?: boolean;
  disabled?: boolean;
}

export default function DirectoryCard({
  icon,
  title,
  subtitle,
  badges,
  collapsedMetrics,
  expandedMetrics,
  expandedDetails,
  notes,
  actions,
  onCardClick,
  defaultExpanded = false,
  disabled = false,
}: DirectoryCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: ActionItem) => {
    handleMenuClose();
    action.onClick();
  };

  const handleCardClick = () => {
    if (onCardClick && !disabled) {
      onCardClick();
    } else if (!disabled) {
      handleExpandClick();
    }
  };

  return (
    <Card
      role="article"
      aria-label={`${title}${subtitle ? `, ${subtitle}` : ''}`}
      sx={{
        background: '#1C1C1E',
        border: '1px solid #2A2A2A',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        '&:hover': disabled
          ? {}
          : {
              background: '#222',
              borderColor: '#007AFF',
            },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Icon */}
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '8px',
                background: '#2A2A2A',
                color: '#007AFF',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}

          {/* Title & Subtitle */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '1rem',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: '#8E8E93',
                  fontSize: '0.875rem',
                  mt: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Badges */}
          {badges && badges.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              {badges.slice(0, 2).map((badge, index) => (
                <Chip
                  key={index}
                  label={badge.label}
                  size="small"
                  variant={badge.variant || 'filled'}
                  sx={{
                    background: badge.color || '#007AFF',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    height: 24,
                  }}
                />
              ))}
            </Box>
          )}

          {/* Action Menu & Expand Button */}
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            {expanded && (
              <Tooltip title="Collapse">
                <IconButton
                  size="small"
                  aria-label="Collapse card details"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpandClick();
                  }}
                  sx={{ color: '#8E8E93' }}
                >
                  <ExpandLessIcon />
                </IconButton>
              </Tooltip>
            )}

            {!expanded && !onCardClick && (
              <Tooltip title="Expand">
                <IconButton
                  size="small"
                  aria-label="Expand card details"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpandClick();
                  }}
                  sx={{ color: '#8E8E93' }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Tooltip>
            )}

            {actions && actions.length > 0 && (
              <>
                <Tooltip title="Actions">
                  <IconButton
                    size="small"
                    aria-label="Open actions menu"
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                    onClick={handleMenuClick}
                    sx={{ color: '#8E8E93' }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  aria-label="Card actions"
                  PaperProps={{
                    sx: {
                      background: '#1C1C1E',
                      border: '1px solid #2A2A2A',
                      mt: 0.5,
                    },
                  }}
                >
                  {actions.map((action, index) => (
                    <Box key={index}>
                      {action.divider && index > 0 && <Divider sx={{ borderColor: '#2A2A2A' }} />}
                      <MenuItem
                        onClick={() => handleActionClick(action)}
                        sx={{
                          color: action.color === 'error' ? '#FF3B30' : action.color === 'primary' ? '#007AFF' : '#FFFFFF',
                          '&:hover': {
                            background: '#2A2A2A',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                          {action.icon}
                        </ListItemIcon>
                        <ListItemText>{action.label}</ListItemText>
                      </MenuItem>
                    </Box>
                  ))}
                </Menu>
              </>
            )}
          </Box>
        </Box>

        {/* Collapsed Metrics */}
        {!expanded && collapsedMetrics && collapsedMetrics.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 2,
              pt: 2,
              borderTop: '1px solid #2A2A2A',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {collapsedMetrics.map((metric, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {metric.icon && <Box sx={{ color: '#8E8E93', display: 'flex' }}>{metric.icon}</Box>}
                <Typography
                  variant="body2"
                  sx={{
                    color: metric.color || '#007AFF',
                    fontWeight: 600,
                  }}
                >
                  {metric.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Expanded Content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            {/* Expanded Metrics */}
            {expandedMetrics && expandedMetrics.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                {expandedMetrics.map((metric, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33% - 11px)', md: '1 1 calc(25% - 12px)' },
                      minWidth: 0,
                      background: '#2A2A2A',
                      borderRadius: '8px',
                      p: 1.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block', mb: 0.5 }}>
                      {metric.label}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: metric.color || '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                      }}
                    >
                      {metric.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Expanded Details */}
            {expandedDetails && expandedDetails.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                {expandedDetails.map((detail, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: detail.fullWidth ? '1 1 100%' : { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' },
                      minWidth: 0,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block', mb: 0.5 }}>
                      {detail.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                      {detail.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Notes */}
            {notes && (
              <Box
                sx={{
                  background: '#2A2A2A',
                  borderRadius: '8px',
                  p: 1.5,
                  mt: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block', mb: 0.5 }}>
                  Notes
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', whiteSpace: 'pre-wrap' }}>
                  {notes}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
