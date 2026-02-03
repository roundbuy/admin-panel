import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as BackIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import campaignNotificationService from '../../services/campaignNotification.service';
import CampaignNotificationFormFields from '../../components/CampaignNotificationFormFields';
import NotificationPreview from '../../components/NotificationPreview';

const CampaignNotificationEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        fetchNotification();
    }, [id]);

    const fetchNotification = async () => {
        try {
            setLoading(true);
            const response = await campaignNotificationService.getCampaignNotificationById(id);
            const notification = response.notification;
            setFormData(notification);
            setOriginalData(notification);
        } catch (error) {
            console.error('Error fetching notification:', error);
            toast.error('Failed to load notification');
            navigate('/notifications/campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await campaignNotificationService.updateCampaignNotification(id, formData);
            toast.success('Campaign notification updated successfully');
            setOriginalData(formData);
        } catch (error) {
            console.error('Error saving notification:', error);
            toast.error('Failed to save notification');
        } finally {
            setSaving(false);
        }
    };

    const handleTestSend = async () => {
        try {
            await campaignNotificationService.testSend(id);
            toast.success('Test notification sent to your account');
        } catch (error) {
            console.error('Error sending test:', error);
            toast.error('Failed to send test notification');
        }
    };

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link component={RouterLink} to="/notifications/campaigns" underline="hover" color="inherit">
                        Campaign Notifications
                    </Link>
                    <Typography color="text.primary">Edit {formData.type_key}</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1">
                        Edit Campaign Notification
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<BackIcon />}
                            onClick={() => navigate('/notifications/campaigns')}
                        >
                            Back
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<SendIcon />}
                            onClick={handleTestSend}
                            color="info"
                        >
                            Test Send
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Box>

                {hasChanges && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        You have unsaved changes
                    </Alert>
                )}
            </Box>

            {/* Main Content */}
            <Grid container spacing={3}>
                {/* Form Section */}
                <Grid item xs={12} lg={7}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Notification Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                            Type: <strong>{formData.type_key}</strong> | Category: <strong>{formData.category}</strong>
                        </Typography>
                        <CampaignNotificationFormFields
                            formData={formData}
                            setFormData={setFormData}
                        />
                    </Paper>
                </Grid>

                {/* Preview Section */}
                <Grid item xs={12} lg={5}>
                    <Box sx={{ position: 'sticky', top: 20 }}>
                        <NotificationPreview notification={formData} />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CampaignNotificationEdit;
