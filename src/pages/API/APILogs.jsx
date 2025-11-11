import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, MenuItem, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import SearchBar from '../../components/Common/SearchBar';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const APILogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalLogs, setTotalLogs] = useState(0);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, search, methodFilter, statusFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAPILogs({
        page: page + 1,
        limit: rowsPerPage,
        endpoint: search,
        method: methodFilter,
        status_code: statusFilter
      });
      setLogs(response.data.data.logs);
      setTotalLogs(response.data.data.pagination.total);
    } catch (error) {
      toast.error('Failed to fetch API logs');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'endpoint', label: 'Endpoint', minWidth: 200 },
    { id: 'method', label: 'Method', minWidth: 80 },
    { id: 'status_code', label: 'Status', minWidth: 80, format: (value) => (
      <span style={{ color: value >= 400 ? 'red' : value >= 300 ? 'orange' : 'green' }}>{value}</span>
    )},
    { id: 'response_time_ms', label: 'Time (ms)', minWidth: 100 },
    { id: 'ip_address', label: 'IP Address', minWidth: 120 },
    { id: 'created_at', label: 'Timestamp', minWidth: 150, format: (value) => new Date(value).toLocaleString() }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>API Logs</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(0); }} placeholder="Search by endpoint..." />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField select fullWidth size="small" label="Method" value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All Methods</MenuItem>
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
            <MenuItem value="PATCH">PATCH</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField select fullWidth size="small" label="Status Code" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="200">200 - OK</MenuItem>
            <MenuItem value="201">201 - Created</MenuItem>
            <MenuItem value="400">400 - Bad Request</MenuItem>
            <MenuItem value="401">401 - Unauthorized</MenuItem>
            <MenuItem value="404">404 - Not Found</MenuItem>
            <MenuItem value="500">500 - Server Error</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {loading ? <LoadingSpinner /> : (
        <DataTable
          columns={columns}
          data={logs}
          totalRows={totalLogs}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          actions={false}
        />
      )}
    </Box>
  );
};

export default APILogs;