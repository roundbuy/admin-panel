import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBanners({});
      setBanners(response.data.data.banners);
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'user_name', label: 'User', minWidth: 150 },
    { id: 'placement', label: 'Placement', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 120, format: (value) => <StatusBadge status={value} /> },
    { id: 'impressions_count', label: 'Impressions', minWidth: 100 },
    { id: 'clicks_count', label: 'Clicks', minWidth: 100 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Banner Management</Typography>
      {loading ? <LoadingSpinner /> : (
        <DataTable columns={columns} data={banners} totalRows={banners.length} page={0} rowsPerPage={20} onPageChange={() => {}} onRowsPerPageChange={() => {}} />
      )}
    </Box>
  );
};

export default Banners;