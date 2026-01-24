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
    MenuItem,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    Schedule as ExtendIcon,
    Person as AssignIcon,
    PriorityHigh as PriorityIcon,
    CheckCircle as ResolveIcon,
    Close as CloseIcon,
    Note as NoteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';
import { useNavigate } from 'react-router-dom';

const DisputesManagement = () => {
    const navigate = useNavigate();
    const [disputes, setDisputes] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [filters, setFilters] = useState({
        status: '',
        current_phase: '',
        priority: '',
        search: '',
    });

    // Dialogs
    const [extendDialogOpen, setExtendDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [formData, setFormData] = useState({
        days: 3,
        deadline_type: 'dispute_deadline',
        staff_id: '',
        priority: 'medium',
        note: '',
        resolution: '',
        winner: '',
        reason: '',
    });

    useEffect(() => {
        fetchDisputes();
        fetchStats();
    }, [page, rowsPerPage, filters]);

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const response = await adminService.getDisputes({
                page: page + 1,
                limit: rowsPerPage,
                ...filters,
            });
            setDisputes(response.data.data || []);
            setTotalRows(response.data.pagination?.total || 0);
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch disputes');
            setDisputes([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminService.getDisputeStats();
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0);
    };

    const handleViewDetails = (dispute) => {
        navigate(`/resolution/disputes/${dispute.id}`);
    };

    const handleExtendDeadline = async () => {
        try {
            await adminService.extendDisputeDeadline(
                selectedDispute.id,
                formData.days,
                formData.deadline_type
            );
            toast.success('Deadline extended successfully');
            setExtendDialogOpen(false);
            fetchDisputes();
            fetchStats();
        } catch (error) {
            console.error('Extend deadline error:', error);
            toast.error(error.response?.data?.message || 'Failed to extend deadline');
        }
    };

    const handleAssign = async () => {
        try {
            if (!formData.staff_id) {
                toast.error('Please select a staff member');
                return;
            }
            await adminService.assignDispute(selectedDispute.id, formData.staff_id);
            toast.success('Dispute assigned successfully');
            setAssignDialogOpen(false);
            fetchDisputes();
        } catch (error) {
            console.error('Assign error:', error);
            toast.error(error.response?.data?.message || 'Failed to assign dispute');
        }
    };

    const handleUpdatePriority = async () => {
        try {
            await adminService.updateDisputePriority(selectedDispute.id, formData.priority);
            toast.success('Priority updated successfully');
            setPriorityDialogOpen(false);
            fetchDisputes();
            fetchStats();
        } catch (error) {
            console.error('Update priority error:', error);
            toast.error(error.response?.data?.message || 'Failed to update priority');
        }
    };

    const handleAddNote = async () => {
        try {
            if (!formData.note.trim()) {
                toast.error('Note is required');
                return;
            }
            await adminService.addDisputeNote(selectedDispute.id, formData.note);
            toast.success('Note added successfully');
            setNoteDialogOpen(false);
            setFormData({ ...formData, note: '' });
            fetchDisputes();
        } catch (error) {
            console.error('Add note error:', error);
            toast.error(error.response?.data?.message || 'Failed to add note');
        }
    };

    const handleResolve = async () => {
        try {
            if (!formData.resolution.trim()) {
                toast.error('Resolution is required');
                return;
            }
            await adminService.resolveDispute(
                selectedDispute.id,
                formData.resolution,
                formData.winner
            );
            toast.success('Dispute resolved successfully');
            setResolveDialogOpen(false);
            fetchDisputes();
            fetchStats();
        } catch (error) {
            console.error('Resolve error:', error);
            toast.error(error.response?.data?.message || 'Failed to resolve dispute');
        }
    };

    const handleClose = async () => {
        try {
            await adminService.closeDispute(selectedDispute.id, formData.reason);
            toast.success('Dispute closed successfully');
            setCloseDialogOpen(false);
            fetchDisputes();
            fetchStats();
        } catch (error) {
            console.error('Close error:', error);
            toast.error(error.response?.data?.message || 'Failed to close dispute');
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'info',
            medium: 'warning',
            high: 'error',
            urgent: 'error',
        };
        return colors[priority] || 'default';
    };

    const columns = [
        {
            id: 'dispute_number',
            label: 'Dispute #',
            minWidth: 120,
            format: (value) => <strong>{value}</strong>
        },
        {
            id: 'current_phase',
            label: 'Phase',
            minWidth: 100,
            format: (value) => (
                <Chip
                    label={value}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            )
        },
        {
            id: 'priority',
            label: 'Priority',
            minWidth: 100,
            format: (value, row) => (
                <Chip
                    label={value?.toUpperCase()}
                    size="small"
                    color={getPriorityColor(value)}
                />
            )
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 120,
            format: (value) => <StatusBadge status={value} />
        },
        {
            id: 'user_name',
            label: 'User',
            minWidth: 150
        },
        {
            id: 'ad_title',
            label: 'Advertisement',
            minWidth: 200
        },
        {
            id: 'linked_issue_number',
            label: 'Linked Issue',
            minWidth: 120,
            format: (value) => value || 'N/A'
        },
        {
            id: 'message_count',
            label: 'Messages',
            minWidth: 80,
            align: 'center'
        },
        {
            id: 'evidence_count',
            label: 'Evidence',
            minWidth: 80,
            align: 'center'
        },
        {
            id: 'dispute_deadline',
            label: 'Deadline',
            minWidth: 120,
            format: (value) => {
                if (!value) return 'N/A';
                const deadline = new Date(value);
                const now = new Date();
                const isOverdue = deadline < now;
                return (
                    <span style={{ color: isOverdue ? 'red' : 'inherit' }}>
                        {deadline.toLocaleDateString()}
                    </span>
                );
            }
        },
        {
            id: 'created_at',
            label: 'Created',
            minWidth: 120,
            format: (value) => new Date(value).toLocaleDateString()
        },
    ];

    const customActions = (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View Details">
                <IconButton size="small" onClick={() => handleViewDetails(row)} color="primary">
                    <ViewIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Assign">
                <IconButton
                    size="small"
                    onClick={() => {
                        setSelectedDispute(row);
                        setAssignDialogOpen(true);
                    }}
                    color="info"
                >
                    <AssignIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Update Priority">
                <IconButton
                    size="small"
                    onClick={() => {
                        setSelectedDispute(row);
                        setFormData({ ...formData, priority: row.priority || 'medium' });
                        setPriorityDialogOpen(true);
                    }}
                    color="warning"
                >
                    <PriorityIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Extend Deadline">
                <IconButton
                    size="small"
                    onClick={() => {
                        setSelectedDispute(row);
                        setExtendDialogOpen(true);
                    }}
                    color="info"
                >
                    <ExtendIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Add Note">
                <IconButton
                    size="small"
                    onClick={() => {
                        setSelectedDispute(row);
                        setNoteDialogOpen(true);
                    }}
                    color="default"
                >
                    <NoteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            {row.status !== 'resolved' && row.status !== 'closed' && (
                <Tooltip title="Resolve">
                    <IconButton
                        size="small"
                        onClick={() => {
                            setSelectedDispute(row);
                            setResolveDialogOpen(true);
                        }}
                        color="success"
                    >
                        <ResolveIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
            <Tooltip title="Close">
                <IconButton
                    size="small"
                    onClick={() => {
                        setSelectedDispute(row);
                        setCloseDialogOpen(true);
                    }}
                    color="error"
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Disputes Management</Typography>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchDisputes}>
                    Refresh
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <StatCard label="Total" value={stats.total || 0} color="primary" />
                <StatCard label="Pending" value={stats.pending || 0} color="warning" />
                <StatCard label="Under Review" value={stats.under_review || 0} color="info" />
                <StatCard label="In Claim Phase" value={stats.in_claim_phase || 0} color="secondary" />
                <StatCard label="Urgent" value={stats.urgent || 0} color="error" />
                <StatCard label="Resolved" value={stats.resolved || 0} color="success" />
                <StatCard label="Overdue" value={stats.overdue || 0} color="error" />
            </Box>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    select
                    label="Status"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    sx={{ minWidth: 150 }}
                    size="small"
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                </TextField>

                <TextField
                    select
                    label="Phase"
                    value={filters.current_phase}
                    onChange={(e) => handleFilterChange('current_phase', e.target.value)}
                    sx={{ minWidth: 150 }}
                    size="small"
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="dispute">Dispute</MenuItem>
                    <MenuItem value="claim">Claim</MenuItem>
                    <MenuItem value="resolution">Resolution</MenuItem>
                    <MenuItem value="ended">Ended</MenuItem>
                </TextField>

                <TextField
                    select
                    label="Priority"
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    sx={{ minWidth: 150 }}
                    size="small"
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                </TextField>

                <TextField
                    label="Search"
                    placeholder="Dispute #, email, ad title..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    sx={{ minWidth: 300 }}
                    size="small"
                />
            </Box>

            {/* Data Table */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <DataTable
                    columns={columns}
                    data={disputes}
                    totalRows={totalRows}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(newPage) => setPage(newPage)}
                    onRowsPerPageChange={(newRowsPerPage) => {
                        setRowsPerPage(newRowsPerPage);
                        setPage(0);
                    }}
                    customActions={customActions}
                />
            )}

            {/* Dialogs */}
            <Dialog open={extendDialogOpen} onClose={() => setExtendDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Extend Dispute Deadline</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            select
                            label="Deadline Type"
                            value={formData.deadline_type}
                            onChange={(e) => setFormData({ ...formData, deadline_type: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="dispute_deadline">Dispute Deadline</MenuItem>
                            <MenuItem value="claim_deadline">Claim Deadline</MenuItem>
                            <MenuItem value="resolution_deadline">Resolution Deadline</MenuItem>
                        </TextField>
                        <TextField
                            type="number"
                            label="Extend by (days)"
                            value={formData.days}
                            onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                            fullWidth
                            inputProps={{ min: 1, max: 30 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExtendDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleExtendDeadline} variant="contained">Extend</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Assign Dispute</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            type="number"
                            label="Staff ID"
                            value={formData.staff_id}
                            onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                            fullWidth
                            placeholder="Enter staff user ID"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAssign} variant="contained">Assign</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={priorityDialogOpen} onClose={() => setPriorityDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Update Priority</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            select
                            label="Priority"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="urgent">Urgent</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPriorityDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdatePriority} variant="contained">Update</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Admin Note</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Note"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            fullWidth
                            multiline
                            rows={4}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddNote} variant="contained">Add Note</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Resolve Dispute</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Resolution"
                            value={formData.resolution}
                            onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Enter resolution details..."
                        />
                        <TextField
                            select
                            label="Winner (optional)"
                            value={formData.winner}
                            onChange={(e) => setFormData({ ...formData, winner: e.target.value })}
                            fullWidth
                        >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="buyer">Buyer</MenuItem>
                            <MenuItem value="seller">Seller</MenuItem>
                            <MenuItem value="split">Split Decision</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleResolve} variant="contained" color="success">Resolve</Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={closeDialogOpen}
                title="Close Dispute"
                message={
                    <Box>
                        <Typography>
                            Are you sure you want to close dispute <strong>{selectedDispute?.dispute_number}</strong>?
                        </Typography>
                        <TextField
                            label="Reason (optional)"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mt: 2 }}
                        />
                    </Box>
                }
                onConfirm={handleClose}
                onCancel={() => setCloseDialogOpen(false)}
                confirmText="Close"
                confirmColor="error"
            />
        </Box>
    );
};

const StatCard = ({ label, value, color }) => (
    <Box
        sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: `${color}.50`,
            border: 1,
            borderColor: `${color}.200`,
            minWidth: 120,
        }}
    >
        <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
            {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            {label}
        </Typography>
    </Box>
);

export default DisputesManagement;
