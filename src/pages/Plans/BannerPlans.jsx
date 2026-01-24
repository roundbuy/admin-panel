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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const BannerPlans = () => {
  const [plans, setPlans] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    duration_days: 30,
    placement: 'home_top',
    dimensions: { width: 1200, height: 300 },
    max_clicks: null,
    is_active: true,
    prices: {}
  });

  useEffect(() => {
    fetchPlans();
    fetchCurrencies();
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

  const fetchCurrencies = async () => {
    try {
      const response = await adminService.getCurrencies();
      setCurrencies(response.data.data);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    }
  };

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      slug: '',
      description: '',
      duration_days: 30,
      placement: 'home_top',
      dimensions: { width: 1200, height: 300 },
      max_clicks: null,
      is_active: true,
      prices: {}
    });
    setDialogOpen(true);
  };

  const handleEdit = (plan) => {
    setIsEditing(true);
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      duration_days: plan.duration_days,
      placement: plan.placement,
      dimensions: plan.dimensions || { width: 1200, height: 300 },
      max_clicks: plan.max_clicks,
      is_active: plan.is_active,
      prices: plan.prices || {}
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validate prices
      const hasPrice = Object.values(formData.prices).some(p => p > 0);
      if (!hasPrice) {
        toast.error('Please set at least one price');
        return;
      }

      if (isEditing) {
        await adminService.updateBannerPlan(selectedPlan.id, formData);
        toast.success('Banner plan updated successfully');
      } else {
        await adminService.createBannerPlan(formData);
        toast.success('Banner plan created successfully');
      }
      setDialogOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} banner plan`);
      console.error(error);
    }
  };

  const handleDelete = (plan) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteBannerPlan(selectedPlan.id);
      toast.success('Banner plan deleted successfully');
      setDeleteDialogOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete banner plan');
    }
  };

  const renderStripeStatus = (plan) => {
    const hasSyncedProduct = plan.stripe_product_id;
    const hasSyncedPrice = plan.stripe_price_id;

    if (hasSyncedProduct && hasSyncedPrice) {
      return (
        <Tooltip title={`Product: ${plan.stripe_product_id}\nPrice: ${plan.stripe_price_id}`}>
          <Chip
            icon={<CheckCircleIcon />}
            label="Synced"
            color="success"
            size="small"
            sx={{ cursor: 'pointer' }}
          />
        </Tooltip>
      );
    } else if (hasSyncedProduct) {
      return (
        <Tooltip title="Product synced but missing price">
          <Chip
            icon={<ErrorIcon />}
            label="Partial"
            color="warning"
            size="small"
          />
        </Tooltip>
      );
    } else {
      return (
        <Chip
          icon={<ErrorIcon />}
          label="Not Synced"
          color="error"
          size="small"
        />
      );
    }
  };

  const columns = [
    { id: 'name', label: 'Plan Name', minWidth: 150 },
    { id: 'placement', label: 'Placement', minWidth: 120 },
    {
      id: 'prices',
      label: 'Prices',
      minWidth: 150,
      format: (value) => {
        if (!value || typeof value !== 'object') return '-';
        const priceStr = Object.entries(value)
          .map(([currency, price]) => `${currency}: ${price}`)
          .join(', ');
        return priceStr || '-';
      }
    },
    { id: 'duration_days', label: 'Duration', minWidth: 100, format: (value) => `${value} days` },
    {
      id: 'stripe_product_id',
      label: 'Stripe Status',
      minWidth: 120,
      format: (value, row) => renderStripeStatus(row)
    },
    { id: 'is_active', label: 'Status', minWidth: 100, format: (value) => <StatusBadge status={value ? 'active' : 'inactive'} /> }
  ];

  const placementOptions = [
    { value: 'home_top', label: 'Home Top' },
    { value: 'home_sidebar', label: 'Home Sidebar' },
    { value: 'category_page', label: 'Category Page' },
    { value: 'product_detail', label: 'Product Detail' },
    { value: 'footer', label: 'Footer' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Banner Plans</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage banner advertising plans with Stripe integration
          </Typography>
        </Box>
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
          onPageChange={() => { }}
          onRowsPerPageChange={() => { }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Banner Plan' : 'Add New Banner Plan'}</DialogTitle>
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
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Placement</InputLabel>
                  <Select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    label="Placement"
                  >
                    {placementOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Duration (days)"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Width (px)"
                  type="number"
                  value={formData.dimensions.width}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: { ...formData.dimensions, width: parseInt(e.target.value) }
                  })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Height (px)"
                  type="number"
                  value={formData.dimensions.height}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: { ...formData.dimensions, height: parseInt(e.target.value) }
                  })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Max Clicks (optional)"
                  type="number"
                  value={formData.max_clicks || ''}
                  onChange={(e) => setFormData({ ...formData, max_clicks: e.target.value ? parseInt(e.target.value) : null })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
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

              {/* Multi-currency prices */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Prices by Currency
                </Typography>
                {currencies.map(currency => (
                  <Grid container spacing={2} key={currency.id} sx={{ mb: 1 }}>
                    <Grid item xs={4}>
                      <Typography>{currency.name} ({currency.symbol})</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        type="number"
                        label={`Price in ${currency.code}`}
                        value={formData.prices[currency.code] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          prices: {
                            ...formData.prices,
                            [currency.code]: e.target.value ? parseFloat(e.target.value) : 0
                          }
                        })}
                        fullWidth
                        inputProps={{ step: '0.01', min: '0' }}
                      />
                    </Grid>
                  </Grid>
                ))}
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

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Banner Plan"
        message={`Are you sure you want to delete the plan "${selectedPlan?.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default BannerPlans;