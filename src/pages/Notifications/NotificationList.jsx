import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Send as SendIcon,
    BarChart as StatsIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notification.service';

const NotificationList = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        type: '',
        priority: '',
        targetAudience: '',
        sent: ''
    });

    // Delete dialog
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
    const [sendDialog, setSendDialog] = useState({ open: false, id: null, notification: null });

    useEffect(() => {
        fetchNotifications();
    }, [page, rowsPerPage, filters]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getAllNotifications({
                ...filters,
                limit: rowsPerPage,
                offset: page * rowsPerPage
            });

            setNotifications(response.notifications || []);
            setTotalCount(response.count || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0);
    };

    const handleDelete = async () => {
        try {
            await notificationService.deleteNotification(deleteDialog.id);
            toast.success('Notification deleted successfully');
            setDeleteDialog({ open: false, id: null });
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleSend = async () => {
        try {
            const result = await notificationService.sendNotification(sendDialog.id);
            toast.success(`Notification sent to ${result.pushNotificationsSent || 0} devices!`);
            setSendDialog({ open: false, id: null, notification: null });
            fetchNotifications();
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error(error.response?.data?.message || 'Failed to send notification');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'push': return 'primary';
            case 'popup': return 'secondary';
            case 'fullscreen': return 'error';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getAudienceLabel = (audience) => {
        switch (audience) {
            case 'all': return 'Everyone';
            case 'all_users': return 'All Users';
            case 'all_guests': return 'All Guests';
            case 'specific_users': return 'Specific Users';
            case 'condition': return 'Conditional';
            default: return audience;
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Notifications
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchNotifications}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/notifications/create')}
                    >
                        Create Notification
                    </Button>
                </Box>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Filters
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <TextField
                        select
                        label="Type"
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        size="small"
                    >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="push">Push</MenuItem>
                        <MenuItem value="popup">Popup</MenuItem>
                        <MenuItem value="fullscreen">Fullscreen</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Priority"
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        size="small"
                    >
                        <MenuItem value="">All Priorities</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Target Audience"
                        value={filters.targetAudience}
                        onChange={(e) => handleFilterChange('targetAudience', e.target.value)}
                        size="small"
                    >
                        <MenuItem value="">All Audiences</MenuItem>
                        <MenuItem value="all">Everyone</MenuItem>
                        <MenuItem value="all_users">All Users</MenuItem>
                        <MenuItem value="all_guests">All Guests</MenuItem>
                        <MenuItem value="specific_users">Specific Users</MenuItem>
                        <MenuItem value="condition">Conditional</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Status"
                        value={filters.sent}
                        onChange={(e) => handleFilterChange('sent', e.target.value)}
                        size="small"
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="true">Sent</MenuItem>
                        <MenuItem value="false">Not Sent</MenuItem>
                    </TextField>
                </Box>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Target Audience</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : notifications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No notifications found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            notifications.map((notification) => (
                                <TableRow key={notification.id} hover>
                                    <TableCell>{notification.id}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {notification.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: 'block' }}>
                                            {notification.message}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={notification.type}
                                            color={getTypeColor(notification.type)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={notification.priority}
                                            color={getPriorityColor(notification.priority)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {getAudienceLabel(notification.target_audience)}
                                    </TableCell>
                                    <TableCell>
                                        {notification.sent_at ? (
                                            <Chip label="Sent" color="success" size="small" />
                                        ) : notification.scheduled_at ? (
                                            <Chip label="Scheduled" color="info" size="small" />
                                        ) : (
                                            <Chip label="Draft" color="default" size="small" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                            {!notification.sent_at && (
                                                <Tooltip title="Send Now">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => setSendDialog({ open: true, id: notification.id, notification })}
                                                    >
                                                        <SendIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="View Stats">
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    onClick={() => navigate(`/notifications/${notification.id}/stats`)}
                                                >
                                                    <StatsIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {!notification.sent_at && (
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => navigate(`/notifications/${notification.id}/edit`)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => setDeleteDialog({ open: true, id: notification.id })}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
                <DialogTitle>Delete Notification</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this notification? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Send Confirmation Dialog */}
            <Dialog open={sendDialog.open} onClose={() => setSendDialog({ open: false, id: null, notification: null })}>
                <DialogTitle>Send Notification</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Are you sure you want to send this notification?
                    </Typography>
                    {sendDialog.notification && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                <strong>Title:</strong> {sendDialog.notification.title}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>Message:</strong> {sendDialog.notification.message}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Target:</strong> {getAudienceLabel(sendDialog.notification.target_audience)}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSendDialog({ open: false, id: null, notification: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleSend} color="success" variant="contained" startIcon={<SendIcon />}>
                        Send Now
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NotificationList;
