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
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
  const [bulletInput, setBulletInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subheading: '',
    description: '',
    description_bullets: [],
    price: 0,
    renewal_price: null,
    duration_days: 30,
    color_hex: '#4CAF50',
    tag: null,
    stripe_product_id: '',
    stripe_price_id: '',
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
      const response = await adminService.getSubscriptionPlans();
      setPlans(response.data.data || []);
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
      subheading: '',
      description: '',
      description_bullets: [],
      price: 0,
      renewal_price: null,
      duration_days: 30,
      color_hex: '#4CAF50',
      tag: null,
      stripe_product_id: '',
      stripe_price_id: '',
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
    setBulletInput('');
    setDialogOpen(true);
  };

  const handleEdit = (plan) => {
    setIsEditing(true);
    setSelectedPlan(plan);
    const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
    const bullets = plan.description_bullets ? 
      (typeof plan.description_bullets === 'string' ? JSON.parse(plan.description_bullets) : plan.description_bullets) 
      : [];
    
    setFormData({
      name: plan.name,
      slug: plan.slug,
      subheading: plan.subheading || '',
      description: plan.description || '',
      description_bullets: bullets,
      price: plan.price,
      renewal_price: plan.renewal_price,
      duration_days: plan.duration_days,
      color_hex: plan.color_hex || '#4CAF50',
      tag: plan.tag || null,
      stripe_product_id: plan.stripe_product_id || '',
      stripe_price_id: plan.stripe_price_id || '',
      is_active: plan.is_active,
      sort_order: plan.sort_order || 0,
      features
    });
    setBulletInput('');
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

  const handleAddBullet = () => {
    if (bulletInput.trim()) {
      setFormData({
        ...formData,
        description_bullets: [...formData.description_bullets, bulletInput.trim()]
      });
      setBulletInput('');
    }
  };

  const handleRemoveBullet = (index) => {
    setFormData({
      ...formData,
      description_bullets: formData.description_bullets.filter((_, i) => i !== index)
    });
  };

  const columns = [
    {
      id: 'name',
      label: 'Plan Name',
      minWidth: 120,
      format: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            backgroundColor: row.color_hex || '#4CAF50' 
          }} />
          {value}
          {row.tag && (
            <Chip 
              label={row.tag.toUpperCase()} 
              size="small" 
              color={row.tag === 'best' ? 'success' : 'primary'}
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      )
    },
    {
      id: 'slug',
      label: 'Slug',
      minWidth: 100
    },
    {
      id: 'subheading',
      label: 'Subheading',
      minWidth: 150
    },
    {
      id: 'price',
      label: 'Price',
      minWidth: 100,
      format: (value) => `₹${value}`
    },
    {
      id: 'renewal_price',
      label: 'Renewal',
      minWidth: 100,
      format: (value) => value ? `₹${value}` : 'Same'
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
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* Basic Info */}
            <Typography variant="h6">Basic Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Plan Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                  fullWidth
                  required
                  helperText="Lowercase, no spaces (e.g., gold, violet)"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Subheading"
                  value={formData.subheading}
                  onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                  fullWidth
                  placeholder="e.g., Most popular choice"
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
                  placeholder="Brief description of the plan"
                />
              </Grid>
            </Grid>

            {/* Description Bullets */}
            <Typography variant="h6" sx={{ mt: 2 }}>Feature Bullets (for UI)</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Add Feature"
                value={bulletInput}
                onChange={(e) => setBulletInput(e.target.value)}
                fullWidth
                onKeyPress={(e) => e.key === 'Enter' && handleAddBullet()}
                placeholder="e.g., 10 active advertisements"
              />
              <Button onClick={handleAddBullet} variant="outlined">Add</Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.description_bullets.map((bullet, index) => (
                <Chip
                  key={index}
                  label={bullet}
                  onDelete={() => handleRemoveBullet(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>

            {/* Pricing */}
            <Typography variant="h6" sx={{ mt: 2 }}>Pricing</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Initial Price (₹)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Renewal Price (₹)"
                  type="number"
                  value={formData.renewal_price || ''}
                  onChange={(e) => setFormData({ ...formData, renewal_price: e.target.value ? parseFloat(e.target.value) : null })}
                  fullWidth
                  placeholder="Leave empty if same"
                  helperText="Price after first period"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Duration (days)"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Sort Order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* Appearance */}
            <Typography variant="h6" sx={{ mt: 2 }}>Appearance</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Color (Hex)"
                  value={formData.color_hex}
                  onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                  fullWidth
                  placeholder="#4CAF50"
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        backgroundColor: formData.color_hex || '#4CAF50',
                        borderRadius: 1,
                        mr: 1,
                        border: '1px solid #ccc'
                      }} />
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tag</InputLabel>
                  <Select
                    value={formData.tag || ''}
                    label="Tag"
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value || null })}
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="best">Best</MenuItem>
                    <MenuItem value="popular">Popular</MenuItem>
                    <MenuItem value="recommended">Recommended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Stripe Integration */}
            <Typography variant="h6" sx={{ mt: 2 }}>Stripe Integration</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Stripe Product ID"
                  value={formData.stripe_product_id}
                  onChange={(e) => setFormData({ ...formData, stripe_product_id: e.target.value })}
                  fullWidth
                  placeholder="prod_xxxxx"
                  helperText="From Stripe dashboard"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Stripe Price ID"
                  value={formData.stripe_price_id}
                  onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                  fullWidth
                  placeholder="price_xxxxx"
                  helperText="Default currency price ID"
                />
              </Grid>
            </Grid>

            {/* Features */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              Plan Features
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
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Support Priority</InputLabel>
                  <Select
                    value={formData.features.support_priority}
                    label="Support Priority"
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, support_priority: e.target.value }
                    })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="highest">Highest</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.features.api_access}
                      onChange={(e) => setFormData({
                        ...formData,
                        features: { ...formData.features, api_access: e.target.checked }
                      })}
                    />
                  }
                  label="API Access"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.features.bulk_upload}
                      onChange={(e) => setFormData({
                        ...formData,
                        features: { ...formData.features, bulk_upload: e.target.checked }
                      })}
                    />
                  }
                  label="Bulk Upload"
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label="Plan Active"
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