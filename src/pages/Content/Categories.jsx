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
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
  MenuItem,
  Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    icon: '',
    description: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Fetch categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parent_id: '',
      icon: '',
      description: '',
      is_active: true,
      sort_order: 0
    });
    setDialogOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id || '',
      icon: category.icon || '',
      description: category.description || '',
      is_active: category.is_active,
      sort_order: category.sort_order || 0
    });
    setDialogOpen(true);
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const saveData = {
        ...formData,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null
      };

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, saveData);
        toast.success('Category updated successfully');
      } else {
        await adminService.createCategory(saveData);
        toast.success('Category created successfully');
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
      console.error('Save category error:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteCategory(selectedCategory.id);
      toast.success('Category deleted successfully');
      setDeleteDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
      console.error('Delete category error:', error);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const columns = [
    { id: 'name', label: 'Name', minWidth: 200 },
    { id: 'slug', label: 'Slug', minWidth: 150 },
    { 
      id: 'parent_id', 
      label: 'Parent', 
      minWidth: 150,
      format: (value) => {
        if (!value) return 'Root';
        const parent = categories.find(c => c.id === value);
        return parent ? parent.name : 'Unknown';
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
          Categories Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Category
        </Button>
      </Box>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          totalRows={categories.length}
          page={0}
          rowsPerPage={categories.length}
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
          {editingCategory ? 'Edit Category' : 'Add Category'}
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
                  select
                  label="Parent Category"
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                >
                  <MenuItem value="">Root Category</MenuItem>
                  {categories.filter(c => c.id !== editingCategory?.id).map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sort Order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., https://example.com/icon.png"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
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
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default Categories;