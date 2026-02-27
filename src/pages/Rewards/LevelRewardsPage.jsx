import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControlLabel,
    Switch,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import axios from '../../services/api';
import { toast } from 'react-toastify';

const LevelRewardsPage = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        points_cost: 0,
        required_referrals: 0,
        required_level: 'beginner',
        is_active: true
    });

    const requiredLevels = [
        { value: 'beginner', label: 'Beginner' },
        { value: 'advanced', label: 'Advanced' },
        { value: 'exclusive', label: 'Exclusive' }
    ];

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/level-rewards');
            setRewards(response.data.data || []);
        } catch (error) {
            console.error('Error fetching level rewards:', error);
            toast.error('Failed to load level rewards');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (reward = null) => {
        if (reward) {
            setDialogMode('edit');
            setFormData({
                id: reward.id,
                name: reward.name || '',
                description: reward.description || '',
                points_cost: reward.points_cost || 0,
                required_referrals: reward.required_referrals || 0,
                required_level: reward.required_level || 'beginner',
                is_active: Boolean(reward.is_active)
            });
        } else {
            setDialogMode('add');
            setFormData({
                id: null,
                name: '',
                description: '',
                points_cost: 0,
                required_referrals: 0,
                required_level: 'beginner',
                is_active: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);

            // Format numbers
            const payload = {
                ...formData,
                points_cost: parseInt(formData.points_cost, 10) || 0,
                required_referrals: parseInt(formData.required_referrals, 10) || 0,
            };

            if (dialogMode === 'add') {
                await axios.post('/admin/level-rewards', payload);
                toast.success('Level reward created successfully');
            } else {
                await axios.put(`/admin/level-rewards/${formData.id}`, payload);
                toast.success('Level reward updated successfully');
            }

            setOpenDialog(false);
            fetchRewards();
        } catch (error) {
            console.error('Error saving level reward:', error);
            toast.error(error.response?.data?.message || 'Failed to save level reward');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this level reward?')) {
            try {
                await axios.delete(`/admin/level-rewards/${id}`);
                toast.success('Level reward deleted successfully');
                fetchRewards();
            } catch (error) {
                console.error('Error deleting level reward:', error);
                toast.error('Failed to delete level reward');
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Level Options & Rewards</Typography>
                <Box>
                    <Tooltip title="Refresh">
                        <IconButton onClick={fetchRewards} sx={{ mr: 1 }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add New Level
                    </Button>
                </Box>
            </Box>

            <Card>
                <CardContent>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper} elevation={0}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="center">Required Referrals</TableCell>
                                        <TableCell align="center">Points Reward</TableCell>
                                        <TableCell>Classification</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rewards.map((reward) => (
                                        <TableRow key={reward.id}>
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="500">
                                                    {reward.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{reward.description || '-'}</TableCell>
                                            <TableCell align="center">
                                                <Chip label={reward.required_referrals} size="small" color="primary" variant="outlined" />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip label={`${reward.points_cost} pts`} size="small" color="secondary" />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                    {reward.required_level}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={reward.is_active ? 'Active' : 'Inactive'}
                                                    color={reward.is_active ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" onClick={() => handleOpenDialog(reward)} color="primary">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" onClick={() => handleDelete(reward.id)} color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {rewards.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                                                    No level rewards found. Click "Add New Level" to create one.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {dialogMode === 'add' ? 'Add New Level Reward' : 'Edit Level Reward'}
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField
                                label="Reward Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                helperText="e.g. Green Member, Gold Member"
                            />

                            <TextField
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                fullWidth
                                multiline
                                rows={3}
                                helperText="What benefits does this level give?"
                            />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Required Referrals"
                                    name="required_referrals"
                                    type="number"
                                    value={formData.required_referrals}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    inputProps={{ min: 0 }}
                                    helperText="Referrals needed to reach this level"
                                />

                                <TextField
                                    label="Points Reward"
                                    name="points_cost"
                                    type="number"
                                    value={formData.points_cost}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    inputProps={{ min: 0 }}
                                    helperText="Points awarded when unlocked"
                                />
                            </Box>

                            <TextField
                                select
                                label="Required Level"
                                name="required_level"
                                value={formData.required_level}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            >
                                {requiredLevels.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        name="is_active"
                                        color="primary"
                                    />
                                }
                                label="Active (Visible in App)"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default LevelRewardsPage;
