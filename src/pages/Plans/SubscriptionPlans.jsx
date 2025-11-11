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

const SubscriptionPlans = () => {
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
    sort_order: 0,
    features: {
      max_ads: 0,
      max_banners: 0,
      featured_ads: 0,
      support_priority: 'standard',
      chat_enabled: true,
      analytics: false,
      verification_badge: false,
      api_access: false,
      bulk_upload: false
    }
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      console.log('Fetching subscription plans...');
      const response = await adminService.getSubscriptionPlans();
      console.log('Response:', response);
      setPlans(response.data.data || []);
      if (!response.data.data || response.data.data.length === 0) {
        console.log('No subscription plans found');
      }
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch subscription plans');
      setPlans([]);
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
      sort_order: 0,
      features: {
        max_ads: 0,
        max_banners: 0,
        featured_ads: 0,
        support_priority: 'standard',
        chat_enabled: true,
        analytics: false,
        verification_badge: false,
        api_access: false,
        bulk_upload: false
      }
    });
    setDialogOpen(true);
  };

  const handleEdit = (plan) => {
    setIsEditing(true);
    setSelectedPlan(plan);
    const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      price: plan.price,
      duration_days: plan.duration_days,
      is_active: plan.is_active,
      sort_order: plan.sort_order || 0,
      features
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await adminService.updateSubscriptionPlan(selectedPlan.id, formData);
        toast.success('Plan updated successfully');
      } else {
        await adminService.createSubscriptionPlan(formData);
        toast.success('Plan created successfully');
      }
      setDialogOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} plan`);
      console.error('Save plan error:', error);
    }
  };

  const handleDelete = (plan) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteSubscriptionPlan(selectedPlan.id);
      toast.success('Plan deleted successfully');
      setDeleteDialogOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
      console.error('Delete plan error:', error);
    }
  };

  const columns = [
    {
      id: 'name',
      label: 'Plan Name',
      minWidth: 120
    },
    {
      id: 'slug',
      label: 'Slug',
      minWidth: 100
    },
    {
      id: 'price',
      label: 'Price',
      minWidth: 100,
      format: (value) => `₹${value}`
    },
    {
      id: 'duration_days',
      label: 'Duration',
      minWidth: 100,
      format: (value) => `${value} days`
    },
    {
      id: 'features',
      label: 'Max Ads',
      minWidth: 80,
      format: (value) => {
        const features = typeof value === 'string' ? JSON.parse(value) : value;
        return features.max_ads === -1 ? 'Unlimited' : features.max_ads;
      }
    },
    {
      id: 'is_active',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <StatusBadge status={value ? 'active' : 'inactive'} />
      )
    },
    {
      id: 'sort_order',
      label: 'Order',
      minWidth: 80
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Subscription Plans
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Plan
        </Button>
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
          loading={loading}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Plan Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Price (₹)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Duration (days)"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Sort Order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Features
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Max Ads (-1 for unlimited)"
                  type="number"
                  value={formData.features.max_ads}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, max_ads: parseInt(e.target.value) }
                  })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Max Banners"
                  type="number"
                  value={formData.features.max_banners}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, max_banners: parseInt(e.target.value) }
                  })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Featured Ads"
                  type="number"
                  value={formData.features.featured_ads}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, featured_ads: parseInt(e.target.value) }
                  })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.features.chat_enabled}
                      onChange={(e) => setFormData({
                        ...formData,
                        features: { ...formData.features, chat_enabled: e.target.checked }
                      })}
                    />
                  }
                  label="Chat Enabled"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.features.analytics}
                      onChange={(e) => setFormData({
                        ...formData,
                        features: { ...formData.features, analytics: e.target.checked }
                      })}
                    />
                  }
                  label="Analytics"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.features.verification_badge}
                      onChange={(e) => setFormData({
                        ...formData,
                        features: { ...formData.features, verification_badge: e.target.checked }
                      })}
                    />
                  }
                  label="Verification Badge"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Plan"
        message={`Are you sure you want to delete the plan "${selectedPlan?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default SubscriptionPlans;