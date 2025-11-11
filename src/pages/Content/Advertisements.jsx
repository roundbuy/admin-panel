import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import SearchBar from '../../components/Common/SearchBar';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const Advertisements = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalAds, setTotalAds] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchAdvertisements();
  }, [page, rowsPerPage, search, statusFilter]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdvertisements({
        page: page + 1,
        limit: rowsPerPage,
        search,
        status: statusFilter
      });
      setAdvertisements(response.data.data.advertisements);
      setTotalAds(response.data.data.pagination.total);
    } catch (error) {
      toast.error('Failed to fetch advertisements');
      console.error('Fetch advertisements error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ad) => {
    try {
      await adminService.approveAdvertisement(ad.id);
      toast.success('Advertisement approved successfully');
      fetchAdvertisements();
    } catch (error) {
      toast.error('Failed to approve advertisement');
      console.error('Approve advertisement error:', error);
    }
  };

  const handleReject = (ad) => {
    setSelectedAd(ad);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    try {
      await adminService.rejectAdvertisement(selectedAd.id, rejectionReason);
      toast.success('Advertisement rejected successfully');
      setRejectDialogOpen(false);
      fetchAdvertisements();
    } catch (error) {
      toast.error('Failed to reject advertisement');
      console.error('Reject advertisement error:', error);
    }
  };

  const handleDelete = (ad) => {
    setSelectedAd(ad);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteAdvertisement(selectedAd.id);
      toast.success('Advertisement deleted successfully');
      setDeleteDialogOpen(false);
      fetchAdvertisements();
    } catch (error) {
      toast.error('Failed to delete advertisement');
      console.error('Delete advertisement error:', error);
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  const columns = [
    {
      id: 'title',
      label: 'Title',
      minWidth: 200
    },
    {
      id: 'user_name',
      label: 'User',
      minWidth: 150
    },
    {
      id: 'category_name',
      label: 'Category',
      minWidth: 120
    },
    {
      id: 'price',
      label: 'Price',
      minWidth: 100,
      format: (value) => `₹${value}`
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => <StatusBadge status={value} />
    },
    {
      id: 'views_count',
      label: 'Views',
      minWidth: 80
    },
    {
      id: 'created_at',
      label: 'Created',
      minWidth: 120,
      format: (value) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Advertisement Management
        </Typography>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by title or description..."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={advertisements}
          totalRows={totalAds}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          loading={loading}
        />
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Advertisement</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmReject} 
            variant="contained" 
            color="error"
            disabled={!rejectionReason}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Advertisement"
        message={`Are you sure you want to delete "${selectedAd?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default Advertisements;