import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const BannerPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBannerPlans();
      setPlans(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch banner plans');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'name', label: 'Plan Name', minWidth: 150 },
    { id: 'placement', label: 'Placement', minWidth: 120 },
    { id: 'price', label: 'Price', minWidth: 100, format: (value) => `₹${value}` },
    { id: 'duration_days', label: 'Duration', minWidth: 100, format: (value) => `${value} days` },
    { id: 'is_active', label: 'Status', minWidth: 100, format: (value) => <StatusBadge status={value ? 'active' : 'inactive'} /> }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Banner Plans</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>Add Plan</Button>
      </Box>
      {loading ? <LoadingSpinner /> : (
        <DataTable columns={columns} data={plans} totalRows={plans.length} page={0} rowsPerPage={plans.length} onPageChange={() => {}} onRowsPerPageChange={() => {}} />
      )}
    </Box>
  );
};

export default BannerPlans;