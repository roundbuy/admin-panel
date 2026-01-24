import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
    Grid,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Chip,
    Autocomplete,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Save as SaveIcon, Send as SendIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import notificationService from '../../services/notification.service';

const NotificationForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [estimatedRecipients, setEstimatedRecipients] = useState(null);
    const [loadingEstimate, setLoadingEstimate] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'push',
        priority: 'medium',
        targetAudience: 'all',
        targetUserIds: [],
        targetConditions: {
            subscription_plan: [],
            country_code: [],
            is_verified: null
        },
        imageUrl: '',
        actionType: 'none',
        actionData: {},
        scheduledAt: null,
        expiresAt: null
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            fetchNotification();
        }
    }, [id]);

    useEffect(() => {
        // Auto-fetch recipient count when target changes
        if (formData.targetAudience) {
            fetchRecipientCount();
        }
    }, [formData.targetAudience, formData.targetUserIds, formData.targetConditions]);

    const fetchNotification = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotificationById(id);
            const notification = response.notification;

            setFormData({
                title: notification.title || '',
                message: notification.message || '',
                type: notification.type || 'push',
                priority: notification.priority || 'medium',
                targetAudience: notification.target_audience || 'all',
                targetUserIds: notification.target_user_ids || [],
                targetConditions: notification.target_conditions || { subscription_plan: [], country_code: [], is_verified: null },
                imageUrl: notification.image_url || '',
                actionType: notification.action_type || 'none',
                actionData: notification.action_data || {},
                scheduledAt: notification.scheduled_at ? dayjs(notification.scheduled_at) : null,
                expiresAt: notification.expires_at ? dayjs(notification.expires_at) : null
            });
        } catch (error) {
            console.error('Error fetching notification:', error);
            toast.error('Failed to fetch notification');
            navigate('/notifications');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipientCount = async () => {
        try {
            setLoadingEstimate(true);
            const response = await notificationService.previewTargetCount({
                targetAudience: formData.targetAudience,
                targetUserIds: formData.targetUserIds,
                targetConditions: formData.targetConditions
            });
            setEstimatedRecipients(response.estimatedRecipients);
        } catch (error) {
            console.error('Error fetching recipient count:', error);
            setEstimatedRecipients(null);
        } finally {
            setLoadingEstimate(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleConditionChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            targetConditions: {
                ...prev.targetConditions,
                [field]: value
            }
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        }

        if (formData.targetAudience === 'specific_users' && formData.targetUserIds.length === 0) {
            newErrors.targetUserIds = 'Please select at least one user';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (sendImmediately = false) => {
        if (!validate()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        try {
            setSaving(true);

            const payload = {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                priority: formData.priority,
                targetAudience: formData.targetAudience,
                targetUserIds: formData.targetAudience === 'specific_users' ? formData.targetUserIds : null,
                targetConditions: formData.targetAudience === 'condition' ? formData.targetConditions : null,
                imageUrl: formData.imageUrl || null,
                actionType: formData.actionType,
                actionData: formData.actionType !== 'none' ? formData.actionData : null,
                scheduledAt: formData.scheduledAt ? formData.scheduledAt.toISOString() : null,
                expiresAt: formData.expiresAt ? formData.expiresAt.toISOString() : null
            };

            let notificationId = id;

            if (isEditMode) {
                await notificationService.updateNotification(id, payload);
                toast.success('Notification updated successfully');
            } else {
                const response = await notificationService.createNotification(payload);
                notificationId = response.notificationId;
                toast.success('Notification created successfully');
            }

            if (sendImmediately && notificationId) {
                const result = await notificationService.sendNotification(notificationId);
                toast.success(`Notification sent to ${result.pushNotificationsSent || 0} devices!`);
            }

            navigate('/notifications');
        } catch (error) {
            console.error('Error saving notification:', error);
            toast.error(error.response?.data?.message || 'Failed to save notification');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Button
                        startIcon={<BackIcon />}
                        onClick={() => navigate('/notifications')}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4" component="h1">
                        {isEditMode ? 'Edit Notification' : 'Create Notification'}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Main Form */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Notification Details
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        error={Boolean(errors.title)}
                                        helperText={errors.title}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Message"
                                        value={formData.message}
                                        onChange={(e) => handleChange('message', e.target.value)}
                                        error={Boolean(errors.message)}
                                        helperText={errors.message}
                                        multiline
                                        rows={4}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Type"
                                        value={formData.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                    >
                                        <MenuItem value="push">Push Notification</MenuItem>
                                        <MenuItem value="popup">In-App Popup</MenuItem>
                                        <MenuItem value="fullscreen">Fullscreen Popup</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Priority"
                                        value={formData.priority}
                                        onChange={(e) => handleChange('priority', e.target.value)}
                                    >
                                        <MenuItem value="low">Low</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="high">High</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Image URL (Optional)"
                                        value={formData.imageUrl}
                                        onChange={(e) => handleChange('imageUrl', e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Action (Optional)
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Action Type"
                                        value={formData.actionType}
                                        onChange={(e) => handleChange('actionType', e.target.value)}
                                    >
                                        <MenuItem value="none">No Action</MenuItem>
                                        <MenuItem value="open_url">Open URL</MenuItem>
                                        <MenuItem value="open_screen">Open Screen</MenuItem>
                                        <MenuItem value="custom">Custom</MenuItem>
                                    </TextField>
                                </Grid>

                                {formData.actionType === 'open_url' && (
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="URL"
                                            value={formData.actionData.url || ''}
                                            onChange={(e) => handleChange('actionData', { url: e.target.value })}
                                            placeholder="https://example.com"
                                        />
                                    </Grid>
                                )}

                                {formData.actionType === 'open_screen' && (
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Screen Name"
                                            value={formData.actionData.screen || ''}
                                            onChange={(e) => handleChange('actionData', { screen: e.target.value })}
                                            placeholder="ProductDetails"
                                        />
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Scheduling (Optional)
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DateTimePicker
                                        label="Schedule Send Time"
                                        value={formData.scheduledAt}
                                        onChange={(newValue) => handleChange('scheduledAt', newValue)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                        minDateTime={dayjs()}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DateTimePicker
                                        label="Expiration Time"
                                        value={formData.expiresAt}
                                        onChange={(newValue) => handleChange('expiresAt', newValue)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                        minDateTime={dayjs()}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Sidebar - Target Audience */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Target Audience
                            </Typography>

                            <TextField
                                select
                                fullWidth
                                label="Audience Type"
                                value={formData.targetAudience}
                                onChange={(e) => handleChange('targetAudience', e.target.value)}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="all">Everyone (Users + Guests)</MenuItem>
                                <MenuItem value="all_users">All Logged-in Users</MenuItem>
                                <MenuItem value="all_guests">All Guest Users</MenuItem>
                                <MenuItem value="specific_users">Specific Users</MenuItem>
                                <MenuItem value="condition">Conditional</MenuItem>
                            </TextField>

                            {formData.targetAudience === 'specific_users' && (
                                <TextField
                                    fullWidth
                                    label="User IDs (comma-separated)"
                                    value={formData.targetUserIds.join(', ')}
                                    onChange={(e) => {
                                        const ids = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                                        handleChange('targetUserIds', ids);
                                    }}
                                    error={Boolean(errors.targetUserIds)}
                                    helperText={errors.targetUserIds || 'Enter user IDs separated by commas'}
                                    multiline
                                    rows={3}
                                />
                            )}

                            {formData.targetAudience === 'condition' && (
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Subscription Plans (comma-separated IDs)"
                                        value={formData.targetConditions.subscription_plan?.join(', ') || ''}
                                        onChange={(e) => {
                                            const plans = e.target.value.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
                                            handleConditionChange('subscription_plan', plans);
                                        }}
                                        helperText="e.g., 1, 2, 3"
                                        sx={{ mb: 2 }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Country Codes (comma-separated)"
                                        value={formData.targetConditions.country_code?.join(', ') || ''}
                                        onChange={(e) => {
                                            const codes = e.target.value.split(',').map(c => c.trim().toUpperCase()).filter(c => c);
                                            handleConditionChange('country_code', codes);
                                        }}
                                        helperText="e.g., IND, USA, GBR"
                                        sx={{ mb: 2 }}
                                    />

                                    <TextField
                                        select
                                        fullWidth
                                        label="Verified Users Only"
                                        value={formData.targetConditions.is_verified === null ? '' : formData.targetConditions.is_verified.toString()}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? null : e.target.value === 'true';
                                            handleConditionChange('is_verified', value);
                                        }}
                                    >
                                        <MenuItem value="">Any</MenuItem>
                                        <MenuItem value="true">Verified Only</MenuItem>
                                        <MenuItem value="false">Unverified Only</MenuItem>
                                    </TextField>
                                </Box>
                            )}

                            {/* Estimated Recipients */}
                            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Estimated Recipients
                                </Typography>
                                {loadingEstimate ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <Typography variant="h4" color="primary">
                                        {estimatedRecipients !== null ? estimatedRecipients.toLocaleString() : '-'}
                                    </Typography>
                                )}
                            </Box>
                        </Paper>

                        {/* Action Buttons */}
                        <Paper sx={{ p: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={() => handleSubmit(false)}
                                disabled={saving}
                                sx={{ mb: 1 }}
                            >
                                {saving ? 'Saving...' : isEditMode ? 'Update' : 'Save as Draft'}
                            </Button>

                            {!isEditMode && (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    startIcon={<SendIcon />}
                                    onClick={() => handleSubmit(true)}
                                    disabled={saving}
                                >
                                    {saving ? 'Sending...' : 'Create & Send Now'}
                                </Button>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default NotificationForm;
