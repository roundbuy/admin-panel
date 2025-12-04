import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const AdConditions = () => {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdConditions();
      setConditions(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch ad conditions');
      console.error('Fetch ad conditions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCondition(null);
    setFormData({
      name: '',
      slug: '',
      is_active: true,
      sort_order: 0
    });
    setDialogOpen(true);
  };

  const handleEdit = (condition) => {
    setEditingCondition(condition);
    setFormData({
      name: condition.name,
      slug: condition.slug,
      is_active: condition.is_active,
      sort_order: condition.sort_order || 0
    });
    setDialogOpen(true);
  };

  const handleDelete = (condition) => {
    setSelectedCondition(condition);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const saveData = {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 0
      };

      if (editingCondition) {
        await adminService.updateAdCondition(editingCondition.id, saveData);
        toast.success('Ad condition updated successfully');
      } else {
        await adminService.createAdCondition(saveData);
        toast.success('Ad condition created successfully');
      }
      setDialogOpen(false);
      fetchConditions();
    } catch (error) {
      toast.error(`Failed to ${editingCondition ? 'update' : 'create'} ad condition`);
      console.error('Save ad condition error:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteAdCondition(selectedCondition.id);
      toast.success('Ad condition deleted successfully');
      setDeleteDialogOpen(false);
      fetchConditions();
    } catch (error) {
      toast.error('Failed to delete ad condition');
      console.error('Delete ad condition error:', error);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const columns = [
    { id: 'name', label: 'Name', minWidth: 200 },
    { id: 'slug', label: 'Slug', minWidth: 150 },
    { id: 'sort_order', label: 'Sort Order', minWidth: 100 },
    { 
      id: 'is_active', 
      label: 'Status', 
      minWidth: 100,
      format: (value) => (
        <Chip 
          label={value ? 'Active' : 'Inactive'} 
          color={value ? 'success' : 'default'} 
          size="small" 
        />
      )
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
          Ad Conditions Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Condition
        </Button>
      </Box>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={conditions}
          totalRows={conditions.length}
          page={0}
          rowsPerPage={conditions.length}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCondition ? 'Edit Condition' : 'Add Condition'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sort Order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
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
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingCondition ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Condition"
        message={`Are you sure you want to delete "${selectedCondition?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default AdConditions;