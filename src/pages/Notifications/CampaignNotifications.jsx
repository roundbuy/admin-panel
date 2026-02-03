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
    Chip,
    IconButton,
    TextField,
    MenuItem,
    CircularProgress,
    Tooltip,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Edit as EditIcon,
    Send as SendIcon,
    BarChart as StatsIcon,
    Refresh as RefreshIcon,
    ToggleOn as ToggleOnIcon,
    ToggleOff as ToggleOffIcon,
    Person as PersonIcon,
    Group as GroupIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import campaignNotificationService from '../../services/campaignNotification.service';
import ManualSendDialog from '../../components/ManualSendDialog';

const CampaignNotifications = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0); // 0 = Active Notifications, 1 = Scheduled Sends
    const [notifications, setNotifications] = useState([]);
    const [scheduledSends, setScheduledSends] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filters, setFilters] = useState({
        category: '',
        priority: '',
        trigger_type: '',
        is_active: ''
    });

    // Manual send dialog
    const [sendDialog, setSendDialog] = useState({
        open: false,
        notificationId: null,
        mode: 'all' // 'all', 'user', 'group'
    });

    // Toggle dialog
    const [toggleDialog, setToggleDialog] = useState({
        open: false,
        notification: null
    });

    useEffect(() => {
        if (activeTab === 0) {
            fetchNotifications();
        } else {
            fetchScheduledSends();
        }
    }, [activeTab, filters]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await campaignNotificationService.getAllCampaignNotifications(filters);
            setNotifications(response.notifications || []);
        } catch (error) {
            console.error('Error fetching campaign notifications:', error);
            toast.error('Failed to fetch campaign notifications');
        } finally {
            setLoading(false);
        }
    };

    const fetchScheduledSends = async () => {
        try {
            setLoading(true);
            const response = await campaignNotificationService.getAllScheduledSends();
            setScheduledSends(response.scheduled || []);
        } catch (error) {
            console.error('Error fetching scheduled sends:', error);
            toast.error('Failed to fetch scheduled sends');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleToggle = async () => {
        try {
            const { notification } = toggleDialog;
            await campaignNotificationService.toggleCampaignNotification(
                notification.id,
                !notification.is_active
            );
            toast.success(`Notification ${!notification.is_active ? 'enabled' : 'disabled'} successfully`);
            setToggleDialog({ open: false, notification: null });
            fetchNotifications();
        } catch (error) {
            console.error('Error toggling notification:', error);
            toast.error('Failed to toggle notification');
        }
    };

    const handleSendNow = async (notificationId) => {
        try {
            const response = await campaignNotificationService.sendToAll(notificationId);
            toast.success(`Notification sent to ${response.recipients} users!`);
            fetchNotifications();
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Failed to send notification');
        }
    };

    const handleCancelScheduled = async (triggerId) => {
        try {
            await campaignNotificationService.cancelScheduledSend(triggerId);
            toast.success('Scheduled notification cancelled');
            fetchScheduledSends();
        } catch (error) {
            console.error('Error cancelling scheduled send:', error);
            toast.error('Failed to cancel scheduled send');
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'account': return 'primary';
            case 'privacy': return 'secondary';
            case 'legal': return 'error';
            case 'feature': return 'info';
            case 'promotion': return 'warning';
            case 'system': return 'default';
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

    const getTriggerTypeLabel = (type) => {
        switch (type) {
            case 'one_time': return 'One Time';
            case 'recurring': return 'Recurring';
            case 'manual': return 'Manual';
            case 'event': return 'Event';
            default: return type;
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Campaign Notifications
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={activeTab === 0 ? fetchNotifications : fetchScheduledSends}
                >
                    Refresh
                </Button>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab label="Active Notifications" />
                    <Tab label="Scheduled Sends" />
                </Tabs>
            </Paper>

            {/* Active Notifications Tab */}
            {activeTab === 0 && (
                <>
                    {/* Filters */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Filters
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                            <TextField
                                select
                                label="Category"
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">All Categories</MenuItem>
                                <MenuItem value="account">Account</MenuItem>
                                <MenuItem value="privacy">Privacy</MenuItem>
                                <MenuItem value="legal">Legal</MenuItem>
                                <MenuItem value="feature">Feature</MenuItem>
                                <MenuItem value="promotion">Promotion</MenuItem>
                                <MenuItem value="system">System</MenuItem>
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
                                label="Trigger Type"
                                value={filters.trigger_type}
                                onChange={(e) => handleFilterChange('trigger_type', e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">All Types</MenuItem>
                                <MenuItem value="one_time">One Time</MenuItem>
                                <MenuItem value="recurring">Recurring</MenuItem>
                                <MenuItem value="manual">Manual</MenuItem>
                                <MenuItem value="event">Event</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Status"
                                value={filters.is_active}
                                onChange={(e) => handleFilterChange('is_active', e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">All Status</MenuItem>
                                <MenuItem value="true">Active</MenuItem>
                                <MenuItem value="false">Inactive</MenuItem>
                            </TextField>
                        </Box>
                    </Paper>

                    {/* Notifications Table */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell>Trigger Type</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : notifications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                No campaign notifications found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    notifications.map((notification) => (
                                        <TableRow key={notification.id} hover>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {notification.type_key}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {notification.collapsed_title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: 'block' }}>
                                                    {notification.collapsed_message}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={notification.category}
                                                    color={getCategoryColor(notification.category)}
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
                                                <Typography variant="caption">
                                                    {getTriggerTypeLabel(notification.trigger_type)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {notification.is_active ? (
                                                    <Chip label="Active" color="success" size="small" />
                                                ) : (
                                                    <Chip label="Inactive" color="default" size="small" />
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => navigate(`/notifications/campaigns/${notification.id}`)}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={notification.is_active ? "Disable" : "Enable"}>
                                                        <IconButton
                                                            size="small"
                                                            color={notification.is_active ? "warning" : "success"}
                                                            onClick={() => setToggleDialog({ open: true, notification })}
                                                        >
                                                            {notification.is_active ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Send to All">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => setSendDialog({ open: true, notificationId: notification.id, mode: 'all' })}
                                                        >
                                                            <SendIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Send to User">
                                                        <IconButton
                                                            size="small"
                                                            color="info"
                                                            onClick={() => setSendDialog({ open: true, notificationId: notification.id, mode: 'user' })}
                                                        >
                                                            <PersonIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Send to Group">
                                                        <IconButton
                                                            size="small"
                                                            color="secondary"
                                                            onClick={() => setSendDialog({ open: true, notificationId: notification.id, mode: 'group' })}
                                                        >
                                                            <GroupIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="View Stats">
                                                        <IconButton
                                                            size="small"
                                                            color="info"
                                                            onClick={() => navigate(`/notifications/campaigns/${notification.id}/stats`)}
                                                        >
                                                            <StatsIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* Scheduled Sends Tab */}
            {activeTab === 1 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Notification Type</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Scheduled Date/Time</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Recurring</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : scheduledSends.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            No scheduled sends found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                scheduledSends.map((send) => (
                                    <TableRow key={send.id} hover>
                                        <TableCell>{send.type_key}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{send.user_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{send.user_email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(send.scheduled_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={send.trigger_status}
                                                color={send.trigger_status === 'pending' ? 'warning' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {send.is_recurring ? (
                                                <Chip label={send.recurrence_pattern} color="info" size="small" />
                                            ) : (
                                                <Typography variant="caption">-</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            {send.trigger_status === 'pending' && (
                                                <Tooltip title="Cancel">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleCancelScheduled(send.id)}
                                                    >
                                                        <CancelIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Toggle Confirmation Dialog */}
            <Dialog open={toggleDialog.open} onClose={() => setToggleDialog({ open: false, notification: null })}>
                <DialogTitle>
                    {toggleDialog.notification?.is_active ? 'Disable' : 'Enable'} Notification
                </DialogTitle>
                <DialogContent>
                    Are you sure you want to {toggleDialog.notification?.is_active ? 'disable' : 'enable'} this notification?
                    {toggleDialog.notification?.is_active && (
                        <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                            Disabling will prevent automated triggers from sending this notification.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setToggleDialog({ open: false, notification: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleToggle} color="primary" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Manual Send Dialog */}
            <ManualSendDialog
                open={sendDialog.open}
                notificationId={sendDialog.notificationId}
                initialMode={sendDialog.mode}
                onClose={() => setSendDialog({ open: false, notificationId: null, mode: 'all' })}
                onSuccess={() => {
                    setSendDialog({ open: false, notificationId: null, mode: 'all' });
                    if (activeTab === 1) {
                        fetchScheduledSends();
                    }
                }}
            />
        </Box>
    );
};

export default CampaignNotifications;
