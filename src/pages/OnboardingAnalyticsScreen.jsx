import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
    Stack,
    Paper,
    useTheme
} from '@mui/material';
import {
    Groups as GroupsIcon,
    Visibility as VisibilityIcon,
    Verified as VerifiedIcon,
    Warning as WarningIcon,
    FastForward as FastForwardIcon,
    AccessTime as AccessTimeIcon,
    ArrowUpward,
    ArrowDownward
} from '@mui/icons-material';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import api from '../services/api';

const OnboardingAnalyticsScreen = () => {
    const theme = useTheme();
    const [tourId, setTourId] = useState('registration_tour');
    const [dateRange, setDateRange] = useState('30d');
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [tourId, dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const endDate = new Date();
            const startDate = new Date();
            if (dateRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (dateRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (dateRange === '90d') startDate.setDate(endDate.getDate() - 90);

            const response = await api.get('/admin/onboarding/analytics', {
                params: {
                    tourId,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });
            setMetrics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (event, newRange) => {
        if (newRange !== null) {
            setDateRange(newRange);
        }
    };

    const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: `${color}.light`,
                        color: `${color}.main`,
                        display: 'flex'
                    }}>
                        <Icon />
                    </Box>
                </Box>
                {subValue && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{
                            color: subValue.includes('+') ? 'success.main' : 'error.main',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            {subValue.includes('+') ? <ArrowUpward fontSize="inherit" /> : <ArrowDownward fontSize="inherit" />}
                            {subValue}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            from previous period
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header & Filters */}
            <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Tours Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track user onboarding engagement and completion
                    </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    {/* Tour Selector */}
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Select Tour</InputLabel>
                        <Select
                            value={tourId}
                            label="Select Tour"
                            onChange={(e) => setTourId(e.target.value)}
                        >
                            <MenuItem value="registration_tour">Registration Tour</MenuItem>
                            <MenuItem value="welcome_tour">Welcome Tour</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Time Presets */}
                    <ToggleButtonGroup
                        value={dateRange}
                        exclusive
                        onChange={handleDateRangeChange}
                        size="small"
                        aria-label="date range"
                    >
                        <ToggleButton value="7d">7D</ToggleButton>
                        <ToggleButton value="30d">30D</ToggleButton>
                        <ToggleButton value="60d">60D</ToggleButton>
                        <ToggleButton value="90d">90D</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Metrics Grid */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Eligible Users"
                                value={metrics?.current?.eligibleUsers || 0}
                                icon={GroupsIcon}
                                color="info"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Total Views"
                                value={metrics?.current?.total_events || 0}
                                subValue="0%" // Placeholder
                                icon={VisibilityIcon}
                                color="warning"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            {/* <StatCard
                                title="Unique Cons"
                                value={metrics?.current?.unique_users || 0}
                                subValue="0%"
                                icon={GroupsIcon}
                                color="primary"
                            /> */}
                            <StatCard
                                title="Unique Cons"
                                value={1}
                                subValue="0%"
                                icon={GroupsIcon}
                                color="primary"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Finished"
                                value={`${Math.round((metrics?.current?.finished_count / (metrics?.current?.unique_users || 1) * 100) || 0)}%`}
                                subValue={`${metrics?.current?.finished_count || 0} users`}
                                icon={VerifiedIcon}
                                color="success"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Issues"
                                value={`${metrics?.current?.issues_count || 0}%`}
                                subValue={`${metrics?.current?.issues_count || 0} from ${metrics?.current?.unique_users || 0}`}
                                icon={WarningIcon}
                                color="error"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Skipped"
                                value={`${Math.round((metrics?.current?.skipped_count / (metrics?.current?.unique_users || 1) * 100) || 0)}%`}
                                subValue={`${metrics?.current?.skipped_count || 0} users`}
                                icon={FastForwardIcon}
                                color="grey"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Average Time"
                                value={`${Math.round(metrics?.current?.avg_time || 0)}s`}
                                icon={AccessTimeIcon}
                                color="secondary"
                            />
                        </Grid>
                    </Grid>

                    {/* Charts Section */}
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" fontWeight="bold">Engagement Trend</Typography>
                            <Typography variant="body2" color="text.secondary">Daily unique users vs completions</Typography>
                        </Box>

                        <Box sx={{ height: 350, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics?.chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => {
                                            if (!str) return '';
                                            return new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                        }}
                                        stroke="#9E9E9E"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis stroke="#9E9E9E" tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ color: '#000', fontWeight: 'bold', marginBottom: 5 }}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        name="Unique Users"
                                        stroke={theme.palette.primary.main}
                                        fillOpacity={1}
                                        fill="url(#colorUsers)"
                                        strokeWidth={2}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="completions"
                                        name="Completions"
                                        stroke={theme.palette.success.main}
                                        fillOpacity={1}
                                        fill="url(#colorCompletions)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default OnboardingAnalyticsScreen;
