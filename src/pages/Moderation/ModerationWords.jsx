import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const ModerationWords = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await adminService.getModerationWords({});
      setWords(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch moderation words');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'word', label: 'Word/Phrase', minWidth: 200 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'severity', label: 'Severity', minWidth: 100, format: (value) => <StatusBadge status={value} showIcon={false} /> },
    { id: 'is_active', label: 'Status', minWidth: 100, format: (value) => <StatusBadge status={value ? 'active' : 'inactive'} /> },
    { id: 'created_at', label: 'Created', minWidth: 120, format: (value) => new Date(value).toLocaleDateString() }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Moderation Words</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>Add Word</Button>
      </Box>
      {loading ? <LoadingSpinner /> : (
        <DataTable columns={columns} data={words} totalRows={words.length} page={0} rowsPerPage={20} onPageChange={() => {}} onRowsPerPageChange={() => {}} />
      )}
    </Box>
  );
};

export default ModerationWords;