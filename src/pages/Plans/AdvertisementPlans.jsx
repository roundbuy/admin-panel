import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Grid
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const AdvertisementPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    duration_days: 30,
    is_active: true,
    allowed_for_subscription_ids: [],
    features: {}
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdvertisementPlans();
      setPlans(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch advertisement plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: 0,
      duration_days: 30,
      is_active: true,
      allowed_for_subscription_ids: [],
      features: {}
    });
    setDialogOpen(true);
  };

  const handleEdit = (plan) => {
    setIsEditing(true);
    setSelectedPlan(plan);
    const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
    const subscriptions = typeof plan.allowed_for_subscription_ids === 'string' ? 
      JSON.parse(plan.allowed_for_subscription_ids) : plan.allowed_for_subscription_ids;
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      price: plan.price,
      duration_days: plan.duration_days,
      is_active: plan.is_active,
      allowed_for_subscription_ids: subscriptions || [],
      features
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await adminService.updateAdvertisementPlan(selectedPlan.id, formData);
        toast.success('Plan updated successfully');
      } else {
        await adminService.createAdvertisementPlan(formData);
        toast.success('Plan created successfully');
      }
      setDialogOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} plan`);
    }
  };

  const handleDelete = (plan) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteAdvertisementPlan(selectedPlan.id);
      toast.success('Plan deleted successfully');
      setDeleteDialogOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const columns = [
    { id: 'name', label: 'Plan Name', minWidth: 150 },
    { id: 'slug', label: 'Slug', minWidth: 120 },
    { id: 'price', label: 'Price', minWidth: 100, format: (value) => `₹${value}` },
    { id: 'duration_days', label: 'Duration', minWidth: 100, format: (value) => `${value} days` },
    { id: 'is_active', label: 'Status', minWidth: 100, format: (value) => <StatusBadge status={value ? 'active' : 'inactive'} /> }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Advertisement Plans</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Add Plan</Button>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={plans}
          totalRows={plans.length}
          page={0}
          rowsPerPage={plans.length}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Plan Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} fullWidth multiline rows={2} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Price (₹)" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Duration (days)" type="number" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />} label="Active" />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">{isEditing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Plan"
        message={`Are you sure you want to delete the plan "${selectedPlan?.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default AdvertisementPlans;