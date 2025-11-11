import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const LanguageList = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const response = await adminService.getLanguages();
      setLanguages(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch languages');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'name', label: 'Language', minWidth: 150 },
    { id: 'code', label: 'Code', minWidth: 100 },
    { id: 'is_default', label: 'Default', minWidth: 100, format: (value) => value ? 'Yes' : 'No' },
    { id: 'is_active', label: 'Status', minWidth: 100, format: (value) => <StatusBadge status={value ? 'active' : 'inactive'} /> },
    { id: 'created_at', label: 'Created', minWidth: 120, format: (value) => new Date(value).toLocaleDateString() }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Languages</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>Add Language</Button>
      </Box>
      {loading ? <LoadingSpinner /> : (
        <DataTable columns={columns} data={languages} totalRows={languages.length} page={0} rowsPerPage={languages.length} onPageChange={() => {}} onRowsPerPageChange={() => {}} />
      )}
    </Box>
  );
};

export default LanguageList;