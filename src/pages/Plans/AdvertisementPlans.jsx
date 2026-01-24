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
  Chip,
  Tooltip,
  IconButton
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

const AdvertisementPlans = () => {
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
    is_active: true,
    features: {},
    prices: {}
  });

  useEffect(() => {
    fetchPlans();
    fetchCurrencies();
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
      is_active: true,
      features: {},
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
      is_active: plan.is_active,
      features: plan.features || {},
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
        await adminService.updateAdvertisementPlan(selectedPlan.id, formData);
        toast.success('Advertisement plan updated and synced with Stripe');
      } else {
        await adminService.createAdvertisementPlan(formData);
        toast.success('Advertisement plan created and synced with Stripe');
      }
      setDialogOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} advertisement plan`);
      console.error(error);
    }
  };

  const handleDelete = (plan) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteAdvertisementPlan(selectedPlan.id);
      toast.success('Advertisement plan archived successfully');
      setDeleteDialogOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete advertisement plan');
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
    { id: 'slug', label: 'Slug', minWidth: 120 },
    {
      id: 'prices',
      label: 'Prices',
      minWidth: 150,
      format: (value) => {
        if (!value || typeof value !== 'object') return '-';
        const priceStr = Object.entries(value)
          .slice(0, 2)
          .map(([currency, price]) => `${currency}: ${price}`)
          .join(', ');
        const remaining = Object.keys(value).length - 2;
        return priceStr + (remaining > 0 ? ` +${remaining} more` : '');
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Advertisement Plans</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage advertisement visibility and promotion plans with Stripe integration
          </Typography>
        </Box>
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
          onPageChange={() => { }}
          onRowsPerPageChange={() => { }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Advertisement Plan' : 'Add New Advertisement Plan'}
        </DialogTitle>
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
                  helperText="URL-friendly identifier (e.g., featured-ad-30-days)"
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
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SyncIcon fontSize="small" />
                  Prices by Currency (Synced with Stripe)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Prices will be automatically synced to Stripe when you save
                </Typography>
                {currencies.map(currency => (
                  <Grid container spacing={2} key={currency.id} sx={{ mb: 1 }}>
                    <Grid item xs={4}>
                      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {currency.name} ({currency.symbol})
                        {currency.is_default && (
                          <Chip label="Default" size="small" color="primary" variant="outlined" />
                        )}
                      </Typography>
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
                        required={currency.is_default}
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
          <Button onClick={handleSave} variant="contained" startIcon={<SyncIcon />}>
            {isEditing ? 'Update & Sync' : 'Create & Sync'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Advertisement Plan"
        message={`Are you sure you want to delete the plan "${selectedPlan?.name}"? This will also archive the Stripe product.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default AdvertisementPlans;