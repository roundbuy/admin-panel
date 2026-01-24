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
    CheckCircle as AcceptIcon,
    Cancel as RejectIcon,
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

const IssuesManagement = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [filters, setFilters] = useState({
        status: '',
        issue_type: '',
        search: '',
    });

    // Dialogs
    const [extendDialogOpen, setExtendDialogOpen] = useState(false);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [actionType, setActionType] = useState('');
    const [formData, setFormData] = useState({
        days: 3,
        note: '',
        reason: '',
    });

    useEffect(() => {
        fetchIssues();
        fetchStats();
    }, [page, rowsPerPage, filters]);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const response = await adminService.getIssues({
                page: page + 1,
                limit: rowsPerPage,
                ...filters,
            });
            setIssues(response.data.data || []);
            setTotalRows(response.data.pagination?.total || 0);
        } catch (error) {
            console.error('Failed to fetch issues:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch issues');
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminService.getIssueStats();
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0);
    };

    const handleViewDetails = (issue) => {
        navigate(`/resolution/issues/${issue.id}`);
    };

    const handleExtendDeadline = (issue) => {
        setSelectedIssue(issue);
        setFormData({ ...formData, days: 3 });
        setExtendDialogOpen(true);
    };

    const handleAddNote = (issue) => {
        setSelectedIssue(issue);
        setFormData({ ...formData, note: '' });
        setNoteDialogOpen(true);
    };

    const handleAction = (issue, type) => {
        setSelectedIssue(issue);
        setActionType(type);
        setFormData({ ...formData, reason: '' });
        setActionDialogOpen(true);
    };

    const handleConfirmExtend = async () => {
        try {
            await adminService.extendIssueDeadline(selectedIssue.id, formData.days);
            toast.success('Deadline extended successfully');
            setExtendDialogOpen(false);
            fetchIssues();
            fetchStats();
        } catch (error) {
            console.error('Extend deadline error:', error);
            toast.error(error.response?.data?.message || 'Failed to extend deadline');
        }
    };

    const handleConfirmNote = async () => {
        try {
            if (!formData.note.trim()) {
                toast.error('Note is required');
                return;
            }
            await adminService.addIssueNote(selectedIssue.id, formData.note);
            toast.success('Note added successfully');
            setNoteDialogOpen(false);
            fetchIssues();
        } catch (error) {
            console.error('Add note error:', error);
            toast.error(error.response?.data?.message || 'Failed to add note');
        }
    };

    const handleConfirmAction = async () => {
        try {
            switch (actionType) {
                case 'accept':
                    await adminService.forceAcceptIssue(selectedIssue.id, formData.reason);
                    toast.success('Issue force-accepted successfully');
                    break;
                case 'reject':
                    await adminService.forceRejectIssue(selectedIssue.id, formData.reason);
                    toast.success('Issue force-rejected successfully');
                    break;
                case 'close':
                    await adminService.closeIssue(selectedIssue.id, formData.reason);
                    toast.success('Issue closed successfully');
                    break;
                default:
                    break;
            }
            setActionDialogOpen(false);
            fetchIssues();
            fetchStats();
        } catch (error) {
            console.error('Action error:', error);
            toast.error(error.response?.data?.message || 'Failed to perform action');
        }
    };

    const getActionTitle = () => {
        switch (actionType) {
            case 'accept':
                return 'Force Accept Issue';
            case 'reject':
                return 'Force Reject Issue';
            case 'close':
                return 'Close Issue';
            default:
                return 'Confirm Action';
        }
    };

    const columns = [
        {
            id: 'issue_number',
            label: 'Issue #',
            minWidth: 120,
            format: (value) => <strong>{value}</strong>
        },
        {
            id: 'issue_type',
            label: 'Type',
            minWidth: 120,
            format: (value) => (
                <Chip
                    label={value?.replace('_', ' ')}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            )
        },
        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            format: (value) => <StatusBadge status={value} />
        },
        {
            id: 'creator_name',
            label: 'Creator',
            minWidth: 150
        },
        {
            id: 'other_party_name',
            label: 'Other Party',
            minWidth: 150
        },
        {
            id: 'ad_title',
            label: 'Advertisement',
            minWidth: 200
        },
        {
            id: 'issue_deadline',
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
            id: 'message_count',
            label: 'Messages',
            minWidth: 80,
            align: 'center'
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
            <Tooltip title="Extend Deadline">
                <IconButton size="small" onClick={() => handleExtendDeadline(row)} color="info">
                    <ExtendIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Add Note">
                <IconButton size="small" onClick={() => handleAddNote(row)} color="default">
                    <NoteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            {row.status === 'pending' && (
                <>
                    <Tooltip title="Force Accept">
                        <IconButton size="small" onClick={() => handleAction(row, 'accept')} color="success">
                            <AcceptIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Force Reject">
                        <IconButton size="small" onClick={() => handleAction(row, 'reject')} color="error">
                            <RejectIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </>
            )}
            <Tooltip title="Close Issue">
                <IconButton size="small" onClick={() => handleAction(row, 'close')} color="warning">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Issues Management</Typography>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchIssues}>
                    Refresh
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <StatCard label="Total" value={stats.total || 0} color="primary" />
                <StatCard label="Pending" value={stats.pending || 0} color="warning" />
                <StatCard label="Accepted" value={stats.accepted || 0} color="success" />
                <StatCard label="Rejected" value={stats.rejected || 0} color="error" />
                <StatCard label="Escalated" value={stats.escalated || 0} color="info" />
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
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="escalated">Escalated</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                </TextField>

                <TextField
                    select
                    label="Type"
                    value={filters.issue_type}
                    onChange={(e) => handleFilterChange('issue_type', e.target.value)}
                    sx={{ minWidth: 150 }}
                    size="small"
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="quality">Quality</MenuItem>
                    <MenuItem value="delivery">Delivery</MenuItem>
                    <MenuItem value="price">Price</MenuItem>
                    <MenuItem value="description_mismatch">Description Mismatch</MenuItem>
                    <MenuItem value="exchange">Exchange</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                </TextField>

                <TextField
                    label="Search"
                    placeholder="Issue #, email, ad title..."
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
                    data={issues}
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

            {/* Extend Deadline Dialog */}
            <Dialog open={extendDialogOpen} onClose={() => setExtendDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Extend Issue Deadline</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            type="number"
                            label="Extend by (days)"
                            value={formData.days}
                            onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                            fullWidth
                            inputProps={{ min: 1, max: 30 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Current deadline: {selectedIssue?.issue_deadline ? new Date(selectedIssue.issue_deadline).toLocaleDateString() : 'N/A'}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExtendDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmExtend} variant="contained">Extend</Button>
                </DialogActions>
            </Dialog>

            {/* Add Note Dialog */}
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
                            placeholder="Enter admin note..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmNote} variant="contained">Add Note</Button>
                </DialogActions>
            </Dialog>

            {/* Action Confirmation Dialog */}
            <ConfirmDialog
                open={actionDialogOpen}
                title={getActionTitle()}
                message={
                    <Box>
                        <Typography>
                            Are you sure you want to {actionType} issue <strong>{selectedIssue?.issue_number}</strong>?
                        </Typography>
                        <TextField
                            label="Reason (optional)"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mt: 2 }}
                            placeholder="Enter reason for this action..."
                        />
                    </Box>
                }
                onConfirm={handleConfirmAction}
                onCancel={() => setActionDialogOpen(false)}
                confirmText={actionType === 'accept' ? 'Accept' : actionType === 'reject' ? 'Reject' : 'Close'}
                confirmColor={actionType === 'accept' ? 'success' : 'error'}
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

export default IssuesManagement;
