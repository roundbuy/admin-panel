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
  InputLabel
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const CountryList = () => {
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    iso_code: '',
    phone_code: '',
    currency_code: '',
    flag_emoji: '',
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    fetchCountries();
    fetchCurrencies();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCountries();
      setCountries(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      toast.error('Failed to fetch countries');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await adminService.getCurrencies();
      setCurrencies(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    }
  };

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      code: '',
      iso_code: '',
      phone_code: '',
      currency_code: '',
      flag_emoji: '',
      is_active: true,
      is_default: false
    });
    setDialogOpen(true);
  };

  const handleEdit = (country) => {
    setIsEditing(true);
    setSelectedCountry(country);
    setFormData({
      name: country.name,
      code: country.code,
      iso_code: country.iso_code,
      phone_code: country.phone_code,
      currency_code: country.currency_code || '',
      flag_emoji: country.flag_emoji || '',
      is_active: country.is_active,
      is_default: country.is_default
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await adminService.updateCountry(selectedCountry.id, formData);
        toast.success('Country updated successfully');
      } else {
        await adminService.createCountry(formData);
        toast.success('Country created successfully');
      }
      setDialogOpen(false);
      fetchCountries();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} country`);
      console.error('Save country error:', error);
    }
  };

  const handleDelete = (country) => {
    setSelectedCountry(country);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteCountry(selectedCountry.id);
      toast.success('Country deleted successfully');
      setDeleteDialogOpen(false);
      fetchCountries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete country');
    }
  };

  const columns = [
    {
      id: 'flag_emoji',
      label: 'Flag',
      minWidth: 60,
      format: (value) => <span style={{ fontSize: '1.5rem' }}>{value || '🏳️'}</span>
    },
    {
      id: 'name',
      label: 'Country Name',
      minWidth: 150
    },
    {
      id: 'code',
      label: 'Code',
      minWidth: 80
    },
    {
      id: 'iso_code',
      label: 'ISO Code',
      minWidth: 80
    },
    {
      id: 'phone_code',
      label: 'Phone',
      minWidth: 100
    },

    {
      id: 'currency_code',
      label: 'Currency',
      minWidth: 100
    },
    {
      id: 'is_default',
      label: 'Default',
      minWidth: 100,
      format: (value) => value ? '⭐ Default' : ''
    },
    {
      id: 'is_active',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <StatusBadge status={value ? 'active' : 'inactive'} />
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Countries
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Country
        </Button>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={countries}
          totalRows={countries.length}
          page={0}
          rowsPerPage={countries.length}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Country' : 'Add New Country'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Country Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  required
                  helperText="e.g., India, United States"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Country Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  fullWidth
                  required
                  inputProps={{ maxLength: 3 }}
                  helperText="3-letter code (IND, USA, GBR)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="ISO Code"
                  value={formData.iso_code}
                  onChange={(e) => setFormData({ ...formData, iso_code: e.target.value.toUpperCase() })}
                  fullWidth
                  required
                  inputProps={{ maxLength: 2 }}
                  helperText="2-letter ISO code (IN, US, GB)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Code"
                  value={formData.phone_code}
                  onChange={(e) => setFormData({ ...formData, phone_code: e.target.value })}
                  fullWidth
                  placeholder="+91"
                  helperText="Country calling code"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Currency</InputLabel>
                  <Select
                    value={formData.currency_code}
                    label="Default Currency"
                    onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {currencies.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Flag Emoji"
                  value={formData.flag_emoji}
                  onChange={(e) => setFormData({ ...formData, flag_emoji: e.target.value })}
                  fullWidth
                  placeholder="🇮🇳"
                  helperText="Country flag emoji"
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
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    />
                  }
                  label="Set as Default"
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
        title="Delete Country"
        message={`Are you sure you want to delete "${selectedCountry?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default CountryList;