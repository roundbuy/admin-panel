import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Breadcrumbs,
    Link,
    Divider
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    Visibility as VisibilityIcon,
    TouchApp as TouchAppIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import campaignNotificationService from '../../services/campaignNotification.service';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => (
    <Card>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Box sx={{
                    bgcolor: `${color}.light`,
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon sx={{ color: `${color}.main`, fontSize: 32 }} />
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const CampaignNotificationStats = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsResponse, notificationResponse] = await Promise.all([
                campaignNotificationService.getStats(id),
                campaignNotificationService.getCampaignNotificationById(id)
            ]);
            setStats(statsResponse.stats);
            setNotification(notificationResponse.notification);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!stats || !notification) {
        return (
            <Box>
                <Typography>No data available</Typography>
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
                    <Typography color="text.primary">Statistics</Typography>
                </Breadcrumbs>

                <Typography variant="h4" component="h1" gutterBottom>
                    Campaign Statistics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {notification.collapsed_title} ({notification.type_key})
                </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Sent"
                        value={stats.total_sent.toLocaleString()}
                        subtitle="Notifications delivered"
                        icon={TrendingUpIcon}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Read Count"
                        value={stats.read_count.toLocaleString()}
                        subtitle={`${stats.read_rate}% read rate`}
                        icon={VisibilityIcon}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Clicked"
                        value={stats.clicked_count.toLocaleString()}
                        subtitle={`${stats.click_through_rate}% CTR`}
                        icon={TouchAppIcon}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Dismissed"
                        value={stats.dismissed_count.toLocaleString()}
                        subtitle={`${stats.dismiss_rate}% dismiss rate`}
                        icon={CancelIcon}
                        color="warning"
                    />
                </Grid>
            </Grid>

            {/* Engagement Metrics */}
            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Engagement Metrics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h3" color="success.main">
                                {stats.read_rate}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Read Rate
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {stats.read_count} of {stats.total_sent} users read
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h3" color="info.main">
                                {stats.click_through_rate}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Click-Through Rate
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {stats.clicked_count} of {stats.read_count} readers clicked
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h3" color="warning.main">
                                {stats.dismiss_rate}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Dismiss Rate
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {stats.dismissed_count} of {stats.total_sent} users dismissed
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Notification Details */}
            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Notification Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Category</Typography>
                        <Typography variant="body1" fontWeight="medium">{notification.category}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Priority</Typography>
                        <Typography variant="body1" fontWeight="medium">{notification.priority}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Trigger Type</Typography>
                        <Typography variant="body1" fontWeight="medium">{notification.trigger_type}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {notification.is_active ? 'Active' : 'Inactive'}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default CampaignNotificationStats;
