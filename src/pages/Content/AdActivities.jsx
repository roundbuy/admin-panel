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

const AdActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdActivities();
      setActivities(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch ad activities');
      console.error('Fetch ad activities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingActivity(null);
    setFormData({
      name: '',
      slug: '',
      is_active: true,
      sort_order: 0
    });
    setDialogOpen(true);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      slug: activity.slug,
      is_active: activity.is_active,
      sort_order: activity.sort_order || 0
    });
    setDialogOpen(true);
  };

  const handleDelete = (activity) => {
    setSelectedActivity(activity);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const saveData = {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 0
      };

      if (editingActivity) {
        await adminService.updateAdActivity(editingActivity.id, saveData);
        toast.success('Ad activity updated successfully');
      } else {
        await adminService.createAdActivity(saveData);
        toast.success('Ad activity created successfully');
      }
      setDialogOpen(false);
      fetchActivities();
    } catch (error) {
      toast.error(`Failed to ${editingActivity ? 'update' : 'create'} ad activity`);
      console.error('Save ad activity error:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteAdActivity(selectedActivity.id);
      toast.success('Ad activity deleted successfully');
      setDeleteDialogOpen(false);
      fetchActivities();
    } catch (error) {
      toast.error('Failed to delete ad activity');
      console.error('Delete ad activity error:', error);
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
          Ad Activities Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Activity
        </Button>
      </Box>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={activities}
          totalRows={activities.length}
          page={0}
          rowsPerPage={activities.length}
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
          {editingActivity ? 'Edit Activity' : 'Add Activity'}
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
            {editingActivity ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Activity"
        message={`Are you sure you want to delete "${selectedActivity?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default AdActivities;