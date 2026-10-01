import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Paper,
    CircularProgress,
    Stack,
    Divider,
    ToggleButton,
    ToggleButtonGroup,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Alert
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    AttachMoney as MoneyIcon,
    People as PeopleIcon,
    ShoppingCart as ShoppingCartIcon,
    Verified as VerifiedIcon,
    Warning as WarningIcon,
    Visibility as VisibilityIcon,
    AccessTime as AccessTimeIcon,
    Poll as PollIcon,
    Public as PublicIcon,
    Forum as ForumIcon,
    Repeat as RepeatIcon,
    CheckCircle as CheckCircleIcon,
    Speed as SpeedIcon,
    ErrorOutline as ErrorIcon,
    NotificationsActive as AlertIcon
} from '@mui/icons-material';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    RadialBarChart,
    RadialBar
} from 'recharts';
import api from '../../services/api';

const COLORS_PALETTE = ['#1e3a8a', '#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatCard = ({ title, value, subValue, icon: Icon, color, alert }) => (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: alert ? `${color}.main` : 'divider', height: '100%', position: 'relative', overflow: 'visible' }}>
        {alert && (
            <Box sx={{ position: 'absolute', top: -8, right: 12, bgcolor: `${color}.main`, borderRadius: 4, px: 1, py: 0.25 }}>
                <Typography variant="caption" color="white" fontWeight="bold">ALERT</Typography>
            </Box>
        )}
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: alert ? `${color}.main` : 'text.primary' }}>
                        {value}
                    </Typography>
                </Box>
                <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: `${color}.light`,
                    color: `${color}.main`,
                    display: 'flex'
                }}>
                    <Icon />
                </Box>
            </Box>
            {subValue && (
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {subValue}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const ScoreGauge = ({ value, label, color }) => {
    const gaugeData = [{ value, fill: color }];
    return (
        <Box sx={{ textAlign: 'center' }}>
            <RadialBarChart width={100} height={100} cx={50} cy={50} innerRadius={30} outerRadius={46} data={gaugeData} startAngle={90} endAngle={-270}>
                <RadialBar minAngle={15} dataKey="value" cornerRadius={6} background={{ fill: '#f1f5f9' }} />
            </RadialBarChart>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: -1.5, color }}>{value}%</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
    );
};

const AlertKPIBanner = ({ alerts }) => {
    if (!alerts) return null;
    const issues = [];
    if (alerts.sellerChurnHigh) issues.push(`Seller churn at ${alerts.churnRate}% — threshold 10%`);
    if (alerts.disputeRateHigh) issues.push(`Dispute/cancel rate at ${alerts.disputeRate}% — threshold 5%`);
    if (alerts.supportSLABreached) issues.push(`Support response ${alerts.supportResponseMinutes} min — SLA target ≤ 240 min`);
    if (alerts.lowActivationRate) issues.push(`Seller activation rate below 50% — review onboarding`);

    if (issues.length === 0) {
        return (
            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                <strong>All Alert KPIs within healthy thresholds.</strong> No immediate action required.
            </Alert>
        );
    }

    return (
        <Alert severity="error" icon={<AlertIcon />} sx={{ mb: 3, borderRadius: 2 }}>
            <strong>{issues.length} Alert KPI{issues.length > 1 ? 's' : ''} require immediate attention:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                {issues.map((issue, i) => <li key={i}>{issue}</li>)}
            </ul>
        </Alert>
    );
};

const MarketplaceDashboard = () => {
    const theme = useTheme();
    const [dateRange, setDateRange] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchMarketplaceStats();
    }, [dateRange]);

    const fetchMarketplaceStats = async () => {
        try {
            setLoading(true);
            const endDate = new Date();
            const startDate = new Date();
            if (dateRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (dateRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (dateRange === '90d') startDate.setDate(endDate.getDate() - 90);

            const response = await api.get('/admin/marketplace-dashboard', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });
            setData(response.data.data);
        } catch (error) {
            console.error('Error fetching marketplace stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!data) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Failed to load marketplace analytics</Typography>
            </Box>
        );
    }

    const countryPieData = data.transactional.byCountry.map((item) => ({
        name: item.country,
        value: parseFloat(item.gmv || 0)
    }));

    const processingTimeLabel = data.seller.avgProcessingHours >= 24
        ? `${(data.seller.avgProcessingHours / 24).toFixed(1)} days`
        : `${data.seller.avgProcessingHours}h`;

    return (
        <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Marketplace KPI Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Transactional · Buyer · Seller · Operator KPIs (2026 Framework)
                    </Typography>
                </Box>
                <ToggleButtonGroup
                    value={dateRange}
                    exclusive
                    onChange={(e, val) => val && setDateRange(val)}
                    size="small"
                >
                    <ToggleButton value="7d">7 Days</ToggleButton>
                    <ToggleButton value="30d">30 Days</ToggleButton>
                    <ToggleButton value="90d">90 Days</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Alert KPIs Banner */}
            <AlertKPIBanner alerts={data.alerts} />

            {/* ── Section 1: Transactional KPIs ── */}
            <Typography variant="overline" color="primary" fontWeight="bold" sx={{ mb: 1.5, display: 'block' }}>
                📊 Transactional KPIs
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Gross Merchandise Volume"
                        value={`£${parseFloat(data.transactional.gmv || 0).toLocaleString()}`}
                        subValue={`AOV: £${parseFloat(data.transactional.aov || 0).toFixed(2)}`}
                        icon={MoneyIcon}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Completed Orders"
                        value={data.transactional.transactions}
                        subValue="Confirmed and delivered shipments"
                        icon={ShoppingCartIcon}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Take Rate (Commissions)"
                        value={`${data.transactional.takeRate}%`}
                        subValue={`Items: £${data.transactional.commissions.item.toFixed(0)} / Svcs: £${data.transactional.commissions.service.toFixed(0)}`}
                        icon={TrendingUpIcon}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="NPS Score"
                        value={`+${data.buyer.nps.score}`}
                        subValue={`Buyer: +${data.buyer.nps.score} / Seller: +${data.seller.nps.score}`}
                        icon={PollIcon}
                        color="info"
                    />
                </Grid>
            </Grid>

            {/* ── Section 2: Buyer KPIs ── */}
            <Typography variant="overline" color="success.main" fontWeight="bold" sx={{ mb: 1.5, display: 'block' }}>
                🛍 Buyer KPIs
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Conversion Rate"
                        value={`${data.buyer.conversionRate}%`}
                        subValue="Orders placed / unique sessions"
                        icon={TrendingUpIcon}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Repeat Purchase Rate"
                        value={`${data.buyer.repeatPurchaseRate}%`}
                        subValue="Buyers with ≥ 2 orders in period"
                        icon={RepeatIcon}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="CAC / CLV Ratio"
                        value={`${(data.buyer.clv / data.buyer.cac).toFixed(1)}×`}
                        subValue={`CAC: £${data.buyer.cac} · CLV: £${data.buyer.clv} (manual input)`}
                        icon={PeopleIcon}
                        color="warning"
                    />
                </Grid>
            </Grid>

            {/* ── Section 3: Seller KPIs ── */}
            <Typography variant="overline" color="warning.main" fontWeight="bold" sx={{ mb: 1.5, display: 'block' }}>
                🏪 Seller KPIs
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Seller Activation Rate"
                        value={`${data.seller.activationRate}%`}
                        subValue="Sellers with ≥1 completed sale"
                        icon={VerifiedIcon}
                        color={data.seller.activationRate < 50 ? 'error' : 'success'}
                        alert={data.alerts?.lowActivationRate}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Order Acceptance Rate"
                        value={`${data.seller.orderAcceptanceRate}%`}
                        subValue="Confirmed / total orders placed"
                        icon={CheckCircleIcon}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg Processing Time"
                        value={processingTimeLabel}
                        subValue="Creation → shipped (avg)"
                        icon={AccessTimeIcon}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Seller Churn Rate"
                        value={`${data.seller.churn.rate}%`}
                        subValue={`Involuntary: ${data.seller.churn.involuntary} / Managed: ${data.seller.churn.managed}`}
                        icon={WarningIcon}
                        color={data.alerts?.sellerChurnHigh ? 'error' : 'warning'}
                        alert={data.alerts?.sellerChurnHigh}
                    />
                </Grid>
            </Grid>

            {/* ── Section 4: Traffic & Country ── */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Traffic Acquisition Sources (Including AI Interfaces)
                        </Typography>
                        <Box sx={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.operator.traffic}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                    <XAxis dataKey="source_name" stroke="#9E9E9E" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="#9E9E9E" tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="visitors" fill="#1e3a8a" radius={[4, 4, 0, 0]}>
                                        {data.operator.traffic.map((entry, index) => {
                                            const isAI = ['chatgpt', 'gemini', 'perplexity', 'google_ai_overview'].includes(entry.source_name);
                                            return <Cell key={`cell-${index}`} fill={isAI ? '#10b981' : '#1e3a8a'} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Box sx={{ width: 10, height: 10, bgcolor: '#1e3a8a', borderRadius: '50%' }} />
                                <Typography variant="caption">Organic / Paid</Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Box sx={{ width: 10, height: 10, bgcolor: '#10b981', borderRadius: '50%' }} />
                                <Typography variant="caption">AI Referrers (ChatGPT, Gemini, Perplexity)</Typography>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            GMV by Country
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={countryPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {countryPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_PALETTE[index % COLORS_PALETTE.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Stack spacing={1.5} sx={{ mt: 1 }}>
                            {data.transactional.byCountry.map((item, index) => (
                                <Box key={item.country} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS_PALETTE[index % COLORS_PALETTE.length] }} />
                                        <Typography variant="body2" fontWeight={500}>{item.country}</Typography>
                                    </Stack>
                                    <Typography variant="body2" fontWeight="bold">
                                        £{parseFloat(item.gmv || 0).toLocaleString()}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* ── Section 5: Operator KPIs + Gauges ── */}
            <Typography variant="overline" color="error.main" fontWeight="bold" sx={{ mb: 1.5, display: 'block' }}>
                ⚙️ Operator KPIs
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                            Quality & Compliance
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <ScoreGauge
                                    value={data.operator.supplierComplianceRate}
                                    label="KYC Compliance"
                                    color="#10b981"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <ScoreGauge
                                    value={data.operator.catalogueQualityScore}
                                    label="Catalogue Quality"
                                    color="#1e3a8a"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <ScoreGauge
                                    value={data.operator.marketplaceLiquidity}
                                    label="Liquidity Rate"
                                    color="#fbbf24"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: data.alerts?.supportSLABreached ? 'error.main' : 'divider', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Operator Operations & Compliance
                        </Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Overall Refund / Return Rate</Typography>
                                <Typography variant="body2" fontWeight="bold" color="error.main">{data.operator.returnRate}%</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">Avg Support Response Time</Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" fontWeight="bold">
                                        {data.operator.responseTimeMinutes < 60
                                            ? `${data.operator.responseTimeMinutes} min`
                                            : `${(data.operator.responseTimeMinutes / 60).toFixed(1)}h`}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={data.operator.supportSLAMet ? '✓ SLA Met' : '⚠ SLA Breached'}
                                        color={data.operator.supportSLAMet ? 'success' : 'error'}
                                        variant="outlined"
                                    />
                                </Stack>
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Pre-launch MRR</Typography>
                                <Typography variant="body2" fontWeight="bold">£{parseFloat(data.prelaunch.mrr || 0).toLocaleString()}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* ── Section 6: Onboarding & Beta Feedback ── */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            User Onboarding KPIs
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">Total Views</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">{data.onboarding.total_views || 0}</Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">Unique Users</Typography>
                                <Typography variant="h6" fontWeight="bold" color="success.main">{data.onboarding.unique_users || 0}</Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">Completions</Typography>
                                <Typography variant="h6" fontWeight="bold">{data.onboarding.completions || 0}</Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">Avg Time</Typography>
                                <Typography variant="h6" fontWeight="bold">{Math.round(data.onboarding.avg_time || 0)}s</Typography>
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={1.5}>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption">Completion Rate</Typography>
                                    <Typography variant="caption" fontWeight="bold">
                                        {Math.round((data.onboarding.completions / (data.onboarding.unique_users || 1)) * 100)}%
                                    </Typography>
                                </Box>
                                <Box sx={{ width: '100%', height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                    <Box sx={{ width: `${(data.onboarding.completions / (data.onboarding.unique_users || 1)) * 100}%`, height: '100%', bgcolor: '#10b981' }} />
                                </Box>
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption">Skip Rate</Typography>
                                    <Typography variant="caption" fontWeight="bold">
                                        {Math.round((data.onboarding.skips / (data.onboarding.unique_users || 1)) * 100)}%
                                    </Typography>
                                </Box>
                                <Box sx={{ width: '100%', height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                    <Box sx={{ width: `${(data.onboarding.skips / (data.onboarding.unique_users || 1)) * 100}%`, height: '100%', bgcolor: '#f59e0b' }} />
                                </Box>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Beta Testing Feedback (Rounds 1–4)
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Round</b></TableCell>
                                        <TableCell align="center"><b>Logs</b></TableCell>
                                        <TableCell align="center"><b>Rating</b></TableCell>
                                        <TableCell align="right"><b>Sentiment</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.prelaunch.betaFeedback.map((row) => (
                                        <TableRow key={row.round}>
                                            <TableCell>Round {row.round}</TableCell>
                                            <TableCell align="center">{row.feedback_count}</TableCell>
                                            <TableCell align="center">
                                                <Chip label={`${parseFloat(row.avg_rating || 0).toFixed(1)} ★`} size="small" color="primary" variant="outlined" />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="caption" color="success.main" fontWeight="bold">+{row.positive_feedback}</Typography>
                                                <Typography variant="caption" color="text.secondary"> / </Typography>
                                                <Typography variant="caption" color="error.main" fontWeight="bold">-{row.negative_feedback}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MarketplaceDashboard;
