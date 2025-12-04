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

const AdColors = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    hex_code: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdColors();
      setColors(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch ad colors');
      console.error('Fetch ad colors error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingColor(null);
    setFormData({
      name: '',
      slug: '',
      hex_code: '',
      is_active: true,
      sort_order: 0
    });
    setDialogOpen(true);
  };

  const handleEdit = (color) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      slug: color.slug,
      hex_code: color.hex_code || '',
      is_active: color.is_active,
      sort_order: color.sort_order || 0
    });
    setDialogOpen(true);
  };

  const handleDelete = (color) => {
    setSelectedColor(color);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const saveData = {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 0,
        hex_code: formData.hex_code || null
      };

      if (editingColor) {
        await adminService.updateAdColor(editingColor.id, saveData);
        toast.success('Ad color updated successfully');
      } else {
        await adminService.createAdColor(saveData);
        toast.success('Ad color created successfully');
      }
      setDialogOpen(false);
      fetchColors();
    } catch (error) {
      toast.error(`Failed to ${editingColor ? 'update' : 'create'} ad color`);
      console.error('Save ad color error:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteAdColor(selectedColor.id);
      toast.success('Ad color deleted successfully');
      setDeleteDialogOpen(false);
      fetchColors();
    } catch (error) {
      toast.error('Failed to delete ad color');
      console.error('Delete ad color error:', error);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const columns = [
    { id: 'name', label: 'Name', minWidth: 200 },
    { id: 'slug', label: 'Slug', minWidth: 150 },
    { 
      id: 'hex_code', 
      label: 'Color', 
      minWidth: 100,
      format: (value) => {
        if (!value) return 'N/A';
        return (
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: value,
              border: '1px solid #ccc',
              borderRadius: '50%'
            }}
          />
        );
      }
    },
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
          Ad Colors Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Color
        </Button>
      </Box>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={colors}
          totalRows={colors.length}
          page={0}
          rowsPerPage={colors.length}
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
          {editingColor ? 'Edit Color' : 'Add Color'}
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
                  label="Hex Color Code"
                  value={formData.hex_code}
                  onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                  placeholder="#FF0000"
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
            {editingColor ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Color"
        message={`Are you sure you want to delete "${selectedColor?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default AdColors;