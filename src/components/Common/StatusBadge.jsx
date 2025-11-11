import React from 'react';
import { Chip } from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Block,
  HourglassEmpty,
  Done,
  Warning
} from '@mui/icons-material';

const statusConfig = {
  // User statuses
  active: { color: 'success', icon: <CheckCircle />, label: 'Active' },
  inactive: { color: 'default', icon: <Cancel />, label: 'Inactive' },
  banned: { color: 'error', icon: <Block />, label: 'Banned' },
  
  // Content statuses
  draft: { color: 'default', icon: <HourglassEmpty />, label: 'Draft' },
  pending: { color: 'warning', icon: <Schedule />, label: 'Pending' },
  approved: { color: 'success', icon: <CheckCircle />, label: 'Approved' },
  published: { color: 'success', icon: <Done />, label: 'Published' },
  expired: { color: 'warning', icon: <Warning />, label: 'Expired' },
  rejected: { color: 'error', icon: <Cancel />, label: 'Rejected' },
  sold: { color: 'info', icon: <Done />, label: 'Sold' },
  
  // Subscription statuses
  cancelled: { color: 'error', icon: <Cancel />, label: 'Cancelled' },
  
  // Moderation statuses
  escalated: { color: 'warning', icon: <Warning />, label: 'Escalated' },
  
  // Payment statuses
  completed: { color: 'success', icon: <Done />, label: 'Completed' },
  failed: { color: 'error', icon: <Cancel />, label: 'Failed' },
  refunded: { color: 'warning', icon: <Warning />, label: 'Refunded' },
};

const StatusBadge = ({ status, size = 'small', showIcon = true }) => {
  const config = statusConfig[status?.toLowerCase()] || {
    color: 'default',
    icon: null,
    label: status || 'Unknown'
  };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={showIcon ? config.icon : undefined}
      sx={{ fontWeight: 500 }}
    />
  );
};

export default StatusBadge;