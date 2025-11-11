import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSubscriptions({});
      setSubscriptions(response.data.data.subscriptions);
    } catch (error) {
      toast.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'user_name', label: 'User', minWidth: 150 },
    { id: 'user_email', label: 'Email', minWidth: 200 },
    { id: 'plan_name', label: 'Plan', minWidth: 120 },
    { id: 'start_date', label: 'Start Date', minWidth: 120, format: (value) => new Date(value).toLocaleDateString() },
    { id: 'end_date', label: 'End Date', minWidth: 120, format: (value) => new Date(value).toLocaleDateString() },
    { id: 'status', label: 'Status', minWidth: 100, format: (value) => <StatusBadge status={value} /> },
    { id: 'amount_paid', label: 'Amount', minWidth: 100, format: (value) => `₹${value}` }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Active Subscriptions</Typography>
      {loading ? <LoadingSpinner /> : (
        <DataTable columns={columns} data={subscriptions} totalRows={subscriptions.length} page={0} rowsPerPage={20} onPageChange={() => {}} onRowsPerPageChange={() => {}} />
      )}
    </Box>
  );
};

export default SubscriptionList;