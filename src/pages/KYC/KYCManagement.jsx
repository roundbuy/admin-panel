import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, TextField,
  MenuItem, Select, FormControl, InputLabel, Grid
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import { adminApi } from '../../services/api';
import { useSnackbar } from 'notistack';

const KYCManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedSub, setSelectedSub] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const getImageUrl = (path) => {
    if (!path) return '';
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '');
    return baseUrl + path;
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/kyc', {
        params: { status: filterStatus !== 'all' ? filterStatus : undefined, limit: 100 }
      });
      setSubmissions(res.data.data || []);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to load KYC submissions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]);

  const handleAction = async (id, status) => {
    if (status === 'rejected' && !rejectReason) {
      enqueueSnackbar('Please provide a rejection reason.', { variant: 'warning' });
      return;
    }

    try {
      await adminApi.put(`/admin/kyc/${id}`, {
        status,
        rejection_reason: status === 'rejected' ? rejectReason : null
      });
      enqueueSnackbar(`KYC ${status} successfully`, { variant: 'success' });
      setSelectedSub(null);
      setRejectReason('');
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      enqueueSnackbar(`Failed to ${status} KYC`, { variant: 'error' });
    }
  };

  const statusColors = {
    pending: 'warning',
    approved: 'success',
    verified: 'success',
    rejected: 'error',
    unverified: 'default'
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">KYC / KYB Verification</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={filterStatus}
            label="Status Filter"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{sub.full_name}</Typography>
                  <Typography variant="caption" color="textSecondary">{sub.email}</Typography>
                </TableCell>
                <TableCell>{sub.country_code}</TableCell>
                <TableCell>{sub.document_type}</TableCell>
                <TableCell>
                  <Chip label={sub.status.toUpperCase()} color={statusColors[sub.status] || 'default'} size="small" />
                </TableCell>
                <TableCell>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => setSelectedSub(sub)} color="primary">
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {submissions.length === 0 && !loading && (
              <TableRow><TableCell colSpan={6} align="center">No submissions found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Review Modal */}
      <Dialog open={!!selectedSub} onClose={() => setSelectedSub(null)} maxWidth="md" fullWidth>
        {selectedSub && (
          <>
            <DialogTitle>Review KYC Submission - {selectedSub.full_name}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Document Type</Typography>
                  <Typography variant="body1">{selectedSub.document_type} ({selectedSub.country_code})</Typography>
                </Grid>
                {selectedSub.business_name && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Business Details</Typography>
                    <Typography variant="body1">{selectedSub.business_name}</Typography>
                    <Typography variant="body2">Reg: {selectedSub.business_reg_number}</Typography>
                  </Grid>
                )}
                
                {selectedSub.front_document_url && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Front Document</Typography>
                    <Box component="img" src={getImageUrl(selectedSub.front_document_url)} width="100%" borderRadius={2} />
                  </Grid>
                )}
                
                {selectedSub.back_document_url && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Back Document</Typography>
                    <Box component="img" src={getImageUrl(selectedSub.back_document_url)} width="100%" borderRadius={2} />
                  </Grid>
                )}

                {selectedSub.selfie_url && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Selfie</Typography>
                    <Box component="img" src={getImageUrl(selectedSub.selfie_url)} width="100%" borderRadius={2} />
                  </Grid>
                )}

                {selectedSub.business_reg_url && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary" mb={1}>Business Registration Doc</Typography>
                    <Box component="img" src={getImageUrl(selectedSub.business_reg_url)} width="100%" borderRadius={2} />
                  </Grid>
                )}

                {selectedSub.status === 'pending' && (
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Rejection Reason (only if rejecting)" 
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      multiline rows={2}
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSub(null)}>Close</Button>
              {selectedSub.status === 'pending' && (
                <>
                  <Button 
                    variant="contained" 
                    color="error" 
                    startIcon={<RejectIcon />}
                    onClick={() => handleAction(selectedSub.id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<ApproveIcon />}
                    onClick={() => handleAction(selectedSub.id, 'verified')}
                  >
                    Verify
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default KYCManagement;
