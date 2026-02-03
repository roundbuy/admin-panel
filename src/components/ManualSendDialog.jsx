import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Tabs,
    Tab,
    TextField,
    Autocomplete,
    Chip,
    Typography,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    MenuItem,
    CircularProgress,
    Alert,
    Switch
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Send as SendIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import campaignNotificationService from '../services/campaignNotification.service';

const ManualSendDialog = ({ open, notificationId, initialMode = 'all', onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState(0); // 0 = specific users, 1 = group, 2 = all eligible
    const [sendMode, setSendMode] = useState('immediate'); // 'immediate' or 'scheduled'
    const [scheduledDate, setScheduledDate] = useState(null);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrencePattern, setRecurrencePattern] = useState('daily');

    // Tab 1: Specific Users
    const [userSearch, setUserSearch] = useState('');
    const [userOptions, setUserOptions] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    // Tab 2: User Group
    const [groupFilters, setGroupFilters] = useState({
        subscription_plan_id: '',
        country_code: '',
        is_verified: '',
        created_after: '',
        created_before: '',
        last_login_after: ''
    });
    const [recipientCount, setRecipientCount] = useState(null);
    const [loadingCount, setLoadingCount] = useState(false);

    // Sending state
    const [sending, setSending] = useState(false);

    // Set initial tab based on mode
    useEffect(() => {
        if (initialMode === 'user') setActiveTab(0);
        else if (initialMode === 'group') setActiveTab(1);
        else setActiveTab(2);
    }, [initialMode]);

    // Search users
    useEffect(() => {
        if (userSearch.length >= 2) {
            searchUsers();
        } else {
            setUserOptions([]);
        }
    }, [userSearch]);

    // Preview recipient count for group
    useEffect(() => {
        if (activeTab === 1) {
            previewCount();
        }
    }, [groupFilters, activeTab]);

    const searchUsers = async () => {
        try {
            setSearchingUsers(true);
            const response = await campaignNotificationService.searchUsers(userSearch);
            setUserOptions(response.users || []);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearchingUsers(false);
        }
    };

    const previewCount = async () => {
        try {
            setLoadingCount(true);
            const response = await campaignNotificationService.previewRecipientCount(groupFilters);
            setRecipientCount(response.count);
        } catch (error) {
            console.error('Error previewing count:', error);
            setRecipientCount(null);
        } finally {
            setLoadingCount(false);
        }
    };

    const handleSend = async () => {
        try {
            setSending(true);
            let response;

            const scheduledAt = sendMode === 'scheduled' ? scheduledDate : null;

            if (activeTab === 0) {
                // Send to specific users
                if (selectedUsers.length === 0) {
                    toast.error('Please select at least one user');
                    return;
                }
                const userIds = selectedUsers.map(u => u.id);
                response = await campaignNotificationService.sendToUsers(notificationId, userIds, scheduledAt);
            } else if (activeTab === 1) {
                // Send to user group
                response = await campaignNotificationService.sendToGroup(
                    notificationId,
                    groupFilters,
                    scheduledAt,
                    isRecurring,
                    isRecurring ? recurrencePattern : null
                );
            } else {
                // Send to all eligible
                response = await campaignNotificationService.sendToAll(notificationId, scheduledAt);
            }

            toast.success(response.message || 'Notification sent successfully');
            onSuccess();
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    const handleClose = () => {
        // Reset state
        setActiveTab(0);
        setSendMode('immediate');
        setScheduledDate(null);
        setIsRecurring(false);
        setSelectedUsers([]);
        setGroupFilters({
            subscription_plan_id: '',
            country_code: '',
            is_verified: '',
            created_after: '',
            created_before: '',
            last_login_after: ''
        });
        onClose();
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Send Campaign Notification</DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                            <Tab label="Specific Users" />
                            <Tab label="User Group" />
                            <Tab label="All Eligible" />
                        </Tabs>
                    </Box>

                    {/* Tab 1: Specific Users */}
                    {activeTab === 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Autocomplete
                                multiple
                                options={userOptions}
                                getOptionLabel={(option) => `${option.full_name} (${option.email})`}
                                value={selectedUsers}
                                onChange={(e, newValue) => setSelectedUsers(newValue)}
                                inputValue={userSearch}
                                onInputChange={(e, newValue) => setUserSearch(newValue)}
                                loading={searchingUsers}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search Users"
                                        placeholder="Type to search by name, email, or ID"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {searchingUsers ? <CircularProgress size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option.full_name}
                                            {...getTagProps({ index })}
                                            key={option.id}
                                        />
                                    ))
                                }
                            />
                            {selectedUsers.length > 0 && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    {selectedUsers.length} user(s) selected
                                </Alert>
                            )}
                        </Box>
                    )}

                    {/* Tab 2: User Group */}
                    {activeTab === 1 && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                <TextField
                                    select
                                    label="Subscription Plan"
                                    value={groupFilters.subscription_plan_id}
                                    onChange={(e) => setGroupFilters({ ...groupFilters, subscription_plan_id: e.target.value })}
                                    size="small"
                                >
                                    <MenuItem value="">All Plans</MenuItem>
                                    <MenuItem value="1">Free</MenuItem>
                                    <MenuItem value="2">Green</MenuItem>
                                    <MenuItem value="3">Gold</MenuItem>
                                    <MenuItem value="4">Violet</MenuItem>
                                </TextField>

                                <TextField
                                    label="Country Code"
                                    value={groupFilters.country_code}
                                    onChange={(e) => setGroupFilters({ ...groupFilters, country_code: e.target.value })}
                                    placeholder="e.g., US, UK"
                                    size="small"
                                />

                                <TextField
                                    select
                                    label="Verification Status"
                                    value={groupFilters.is_verified}
                                    onChange={(e) => setGroupFilters({ ...groupFilters, is_verified: e.target.value })}
                                    size="small"
                                >
                                    <MenuItem value="">All Users</MenuItem>
                                    <MenuItem value="true">Verified</MenuItem>
                                    <MenuItem value="false">Not Verified</MenuItem>
                                </TextField>

                                <TextField
                                    label="Registered After"
                                    type="date"
                                    value={groupFilters.created_after}
                                    onChange={(e) => setGroupFilters({ ...groupFilters, created_after: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />

                                <TextField
                                    label="Registered Before"
                                    type="date"
                                    value={groupFilters.created_before}
                                    onChange={(e) => setGroupFilters({ ...groupFilters, created_before: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />

                                <TextField
                                    label="Last Login After"
                                    type="date"
                                    value={groupFilters.last_login_after}
                                    onChange={(e) => setGroupFilters({ ...groupFilters, last_login_after: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Box>

                            {loadingCount ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                    <CircularProgress size={20} />
                                    <Typography variant="body2">Calculating recipients...</Typography>
                                </Box>
                            ) : recipientCount !== null && (
                                <Alert severity={recipientCount > 1000 ? 'warning' : 'info'} sx={{ mt: 2 }}>
                                    {recipientCount} user(s) will receive this notification
                                    {recipientCount > 1000 && ' (Large audience - please confirm)'}
                                </Alert>
                            )}
                        </Box>
                    )}

                    {/* Tab 3: All Eligible */}
                    {activeTab === 2 && (
                        <Box sx={{ mt: 2 }}>
                            <Alert severity="warning">
                                This will send the notification to all active users in the system.
                                Please confirm before proceeding.
                            </Alert>
                        </Box>
                    )}

                    {/* Scheduling Section */}
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Delivery Options
                        </Typography>
                        <FormControl component="fieldset">
                            <RadioGroup
                                value={sendMode}
                                onChange={(e) => setSendMode(e.target.value)}
                            >
                                <FormControlLabel
                                    value="immediate"
                                    control={<Radio />}
                                    label="Send immediately"
                                />
                                <FormControlLabel
                                    value="scheduled"
                                    control={<Radio />}
                                    label="Schedule for later"
                                />
                            </RadioGroup>
                        </FormControl>

                        {sendMode === 'scheduled' && (
                            <Box sx={{ mt: 2 }}>
                                <DateTimePicker
                                    label="Scheduled Date & Time"
                                    value={scheduledDate}
                                    onChange={setScheduledDate}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    minDateTime={new Date()}
                                />

                                {activeTab === 1 && (
                                    <Box sx={{ mt: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={isRecurring}
                                                    onChange={(e) => setIsRecurring(e.target.checked)}
                                                />
                                            }
                                            label="Recurring notification"
                                        />
                                        {isRecurring && (
                                            <TextField
                                                select
                                                label="Recurrence Pattern"
                                                value={recurrencePattern}
                                                onChange={(e) => setRecurrencePattern(e.target.value)}
                                                fullWidth
                                                sx={{ mt: 1 }}
                                                size="small"
                                            >
                                                <MenuItem value="daily">Daily</MenuItem>
                                                <MenuItem value="weekly">Weekly</MenuItem>
                                                <MenuItem value="monthly">Monthly</MenuItem>
                                                <MenuItem value="every_14_days">Every 14 Days</MenuItem>
                                                <MenuItem value="every_3_months">Every 3 Months</MenuItem>
                                                <MenuItem value="every_4_months">Every 4 Months</MenuItem>
                                            </TextField>
                                        )}
                                    </Box>
                                )}

                                {scheduledDate && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Will be sent on {scheduledDate.toLocaleString()}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={sending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        variant="contained"
                        color="primary"
                        disabled={sending}
                        startIcon={sending ? <CircularProgress size={20} /> : sendMode === 'scheduled' ? <ScheduleIcon /> : <SendIcon />}
                    >
                        {sending ? 'Sending...' : sendMode === 'scheduled' ? 'Schedule' : 'Send Now'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default ManualSendDialog;
