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

const CurrencyList = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    exchange_rate: 1.0,
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCurrencies();
      setCurrencies(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      toast.error('Failed to fetch currencies');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      code: '',
      name: '',
      symbol: '',
      exchange_rate: 1.0,
      is_active: true,
      is_default: false
    });
    setDialogOpen(true);
  };

  const handleEdit = (currency) => {
    setIsEditing(true);
    setSelectedCurrency(currency);
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      exchange_rate: currency.exchange_rate,
      is_active: currency.is_active,
      is_default: currency.is_default
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await adminService.updateCurrency(selectedCurrency.id, formData);
        toast.success('Currency updated successfully');
      } else {
        await adminService.createCurrency(formData);
        toast.success('Currency created successfully');
      }
      setDialogOpen(false);
      fetchCurrencies();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} currency`);
      console.error('Save currency error:', error);
    }
  };

  const handleDelete = (currency) => {
    setSelectedCurrency(currency);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteCurrency(selectedCurrency.id);
      toast.success('Currency deleted successfully');
      setDeleteDialogOpen(false);
      fetchCurrencies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete currency');
    }
  };

  const columns = [
    {
      id: 'code',
      label: 'Code',
      minWidth: 80
    },
    {
      id: 'name',
      label: 'Currency Name',
      minWidth: 150
    },
    {
      id: 'symbol',
      label: 'Symbol',
      minWidth: 80
    },
    {
      id: 'exchange_rate',
      label: 'Exchange Rate',
      minWidth: 120,
      format: (value) => {
        if (value === null || value === undefined || value === '') {
          return 'N/A';
        }
        const numValue = parseFloat(value);
        return isNaN(numValue) ? 'N/A' : numValue.toFixed(6);
      }
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
          Currencies
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Currency
        </Button>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={currencies}
          totalRows={currencies.length}
          page={0}
          rowsPerPage={currencies.length}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Currency' : 'Add New Currency'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Currency Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  fullWidth
                  required
                  inputProps={{ maxLength: 3 }}
                  helperText="3-letter ISO code (e.g., USD, EUR, INR)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  fullWidth
                  required
                  helperText="e.g., $, €, ₹"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Currency Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  required
                  helperText="e.g., US Dollar, Indian Rupee"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Exchange Rate"
                  type="number"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 1.0 })}
                  fullWidth
                  required
                  inputProps={{ step: 0.000001 }}
                  helperText="Exchange rate to base currency (1 USD = x this currency)"
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
        title="Delete Currency"
        message={`Are you sure you want to delete "${selectedCurrency?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default CurrencyList;