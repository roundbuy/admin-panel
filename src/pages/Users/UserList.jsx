import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import SearchBar from '../../components/Common/SearchBar';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'subscriber'
  });

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({
        page: page + 1,
        limit: rowsPerPage,
        search,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(response.data.data.users);
      setTotalUsers(response.data.data.pagination.total);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await adminService.updateUser(selectedUser.id, formData);
      toast.success('User updated successfully');
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Update user error:', error);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.is_active;
      await adminService.toggleUserStatus(user.id, newStatus);
      toast.success(newStatus ? 'User activated' : 'User banned');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Toggle status error:', error);
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Delete user error:', error);
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  const columns = [
    {
      id: 'full_name',
      label: 'Name',
      minWidth: 150
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 120
    },
    {
      id: 'role',
      label: 'Role',
      minWidth: 100,
      format: (value) => (
        <StatusBadge status={value} showIcon={false} />
      )
    },
    {
      id: 'subscription_name',
      label: 'Subscription',
      minWidth: 120,
      format: (value) => value || 'None'
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
      id: 'created_at',
      label: 'Joined',
      minWidth: 120,
      format: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const customActions = [
    {
      label: 'Toggle Status',
      icon: <StatusBadge status="active" size="small" />,
      onClick: handleToggleStatus,
      color: 'warning'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          User Management
        </Typography>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="subscriber">Subscriber</MenuItem>
            <MenuItem value="editor">Editor</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          totalRows={totalUsers}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          customActions={customActions}
          loading={loading}
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              fullWidth
            >
              <MenuItem value="subscriber">Subscriber</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.full_name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default UserList;