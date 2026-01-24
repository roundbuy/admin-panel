import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    LinearProgress
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Send as SendIcon,
    Visibility as ViewIcon,
    TouchApp as ClickIcon,
    CheckCircle as DeliveredIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import notificationService from '../../services/notification.service';

const NotificationStats = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [notifResponse, statsResponse] = await Promise.all([
                notificationService.getNotificationById(id),
                notificationService.getNotificationStats(id)
            ]);

            setNotification(notifResponse.notification);
            setStats(statsResponse.stats);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch notification stats');
            navigate('/notifications');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!notification || !stats) {
        return (
            <Box>
                <Typography>Notification not found</Typography>
            </Box>
        );
    }

    const StatCard = ({ title, value, icon, color = 'primary', percentage }) => (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary" variant="subtitle2">
                        {title}
                    </Typography>
                    <Box sx={{ color: `${color}.main` }}>
                        {icon}
                    </Box>
                </Box>
                <Typography variant="h3" component="div" gutterBottom>
                    {value.toLocaleString()}
                </Typography>
                {percentage !== undefined && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                                Rate
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {percentage}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={parseFloat(percentage)}
                            color={color}
                            sx={{ height: 8, borderRadius: 1 }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    return (
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
                    Notification Statistics
                </Typography>
            </Box>

            {/* Notification Details */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Notification Details
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Title
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {notification.title}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Type
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {notification.type}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Message
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {notification.message}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Priority
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {notification.priority}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Target Audience
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {notification.target_audience}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Sent At
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {notification.sent_at
                                ? new Date(notification.sent_at).toLocaleString()
                                : 'Not sent yet'}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Statistics Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Sent"
                        value={stats.total_sent}
                        icon={<SendIcon />}
                        color="primary"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Delivered"
                        value={stats.delivered_count}
                        icon={<DeliveredIcon />}
                        color="success"
                        percentage={stats.delivery_rate}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Read"
                        value={stats.read_count}
                        icon={<ViewIcon />}
                        color="info"
                        percentage={stats.read_rate}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Clicked"
                        value={stats.clicked_count}
                        icon={<ClickIcon />}
                        color="warning"
                        percentage={stats.click_through_rate}
                    />
                </Grid>
            </Grid>

            {/* Engagement Funnel */}
            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Engagement Funnel
                </Typography>
                <Box sx={{ mt: 3 }}>
                    {/* Sent */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Sent</Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {stats.total_sent} (100%)
                            </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={100} sx={{ height: 10, borderRadius: 1 }} />
                    </Box>

                    {/* Delivered */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Delivered</Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {stats.delivered_count} ({stats.delivery_rate}%)
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={parseFloat(stats.delivery_rate)}
                            color="success"
                            sx={{ height: 10, borderRadius: 1 }}
                        />
                    </Box>

                    {/* Read */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Read</Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {stats.read_count} ({stats.read_rate}%)
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={parseFloat(stats.read_rate)}
                            color="info"
                            sx={{ height: 10, borderRadius: 1 }}
                        />
                    </Box>

                    {/* Clicked */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Clicked</Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {stats.clicked_count} ({stats.click_through_rate}%)
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={parseFloat(stats.click_through_rate)}
                            color="warning"
                            sx={{ height: 10, borderRadius: 1 }}
                        />
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default NotificationStats;
