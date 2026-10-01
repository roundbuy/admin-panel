import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Paper,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    Stack,
    Divider,
    Chip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Tooltip
} from '@mui/material';
import {
    TrendingUp,
    SmartToy as AiIcon,
    Search as SearchIcon,
    Paid as PaidIcon,
    Link as LinkIcon,
    AutoAwesome as GeminiIcon,
    Psychology as PerplexityIcon,
    Google as GoogleIcon,
    BarChart as BarChartIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartTooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import api from '../../services/api';

// ─── Source icon map ──────────────────────────────────────────────────────────
const SOURCE_ICONS = {
    organic:            <SearchIcon sx={{ fontSize: 18 }} />,
    paid:               <PaidIcon sx={{ fontSize: 18 }} />,
    referral:           <LinkIcon sx={{ fontSize: 18 }} />,
    chatgpt:            <AiIcon sx={{ fontSize: 18 }} />,
    gemini:             <GeminiIcon sx={{ fontSize: 18 }} />,
    perplexity:         <PerplexityIcon sx={{ fontSize: 18 }} />,
    google_ai_overview: <GoogleIcon sx={{ fontSize: 18 }} />,
};

// ─── Stat hero card ───────────────────────────────────────────────────────────
const HeroCard = ({ label, value, sub, color, icon: Icon }) => (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
        <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                        {label}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color }}>
                        {value}
                    </Typography>
                    {sub && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {sub}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}18`, color }}>
                    <Icon />
                </Box>
            </Stack>
        </CardContent>
    </Card>
);

// ─── Custom tooltip for area chart ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((s, p) => s + (p.value || 0), 0);
    return (
        <Paper elevation={3} sx={{ p: 2, minWidth: 200, borderRadius: 2 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">{label}</Typography>
            <Divider sx={{ my: 1 }} />
            {payload.map(p => (
                <Stack key={p.dataKey} direction="row" justifyContent="space-between" spacing={3} sx={{ mb: 0.5 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                        <Typography variant="caption" color="text.secondary">{p.name}</Typography>
                    </Stack>
                    <Typography variant="caption" fontWeight={700}>{p.value?.toLocaleString()}</Typography>
                </Stack>
            ))}
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" fontWeight={700}>Total</Typography>
                <Typography variant="caption" fontWeight={700}>{total.toLocaleString()}</Typography>
            </Stack>
        </Paper>
    );
};

// ─── Source row card ──────────────────────────────────────────────────────────
const SourceRow = ({ source, rank }) => {
    const icon = SOURCE_ICONS[source.source_name];
    return (
        <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '50%',
                        bgcolor: `${source.color}18`, color: source.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="body2" fontWeight={600}>{source.label}</Typography>
                        <Chip
                            label={source.category === 'ai' ? '🤖 AI Referrer' : source.category === 'organic' ? '🔍 Organic' : source.category === 'paid' ? '💰 Paid' : '🔗 Referral'}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: 9, mt: 0.25 }}
                        />
                    </Box>
                </Stack>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={800}>{parseInt(source.total_visitors).toLocaleString()}</Typography>
                    <Typography variant="caption" color="text.secondary">{source.share_pct}% of total</Typography>
                </Box>
            </Stack>
            <Box sx={{ position: 'relative' }}>
                <LinearProgress
                    variant="determinate"
                    value={source.share_pct}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: `${source.color}18`,
                        '& .MuiLinearProgress-bar': { bgcolor: source.color, borderRadius: 4 }
                    }}
                />
            </Box>
            <Stack direction="row" spacing={3} sx={{ mt: 0.75 }}>
                <Typography variant="caption" color="text.secondary">Avg/day: <b>{source.avg_daily}</b></Typography>
                <Typography variant="caption" color="text.secondary">Peak: <b>{source.max_daily?.toLocaleString()}</b></Typography>
                <Typography variant="caption" color="text.secondary">Days active: <b>{source.active_days}</b></Typography>
            </Stack>
        </Box>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TrafficAnalyticsPage = () => {
    const [dateRange, setDateRange] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => { fetchData(); }, [dateRange]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const endDate = new Date();
            const startDate = new Date();
            if (dateRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (dateRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (dateRange === '90d') startDate.setDate(endDate.getDate() - 90);

            const res = await api.get('/admin/marketplace-dashboard/traffic', {
                params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
            });
            setData(res.data.data);
        } catch (err) {
            console.error('Traffic fetch failed:', err);
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
                <Typography color="error">Failed to load traffic analytics. Please try again.</Typography>
            </Box>
        );
    }

    const { summary, by_source, by_category, daily_trend } = data;

    // All unique source_name keys for the chart
    const allSources = by_source.map(s => s.source_name);
    const aiSources = by_source.filter(s => s.category === 'ai');
    const nonAiSources = by_source.filter(s => s.category !== 'ai');

    // Filter sources for category view
    const visibleSources = activeCategory === 'all'
        ? by_source
        : by_source.filter(s => s.category === activeCategory);

    // Build chart series keys based on active filter
    const chartKeys = activeCategory === 'all'
        ? allSources
        : by_source.filter(s => s.category === activeCategory).map(s => s.source_name);

    const sourceColorMap = Object.fromEntries(by_source.map(s => [s.source_name, s.color]));
    const sourceLabelMap = Object.fromEntries(by_source.map(s => [s.source_name, s.label]));

    // Pie data: by category
    const pieData = by_category.map(c => ({ name: c.label, value: c.total_visitors, color: c.color }));

    return (
        <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Traffic Acquisition Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Organic · Paid · Referral · AI Referrers (ChatGPT, Gemini, Perplexity, Google AI Overview)
                    </Typography>
                </Box>
                <ToggleButtonGroup
                    value={dateRange}
                    exclusive
                    onChange={(_, val) => val && setDateRange(val)}
                    size="small"
                >
                    <ToggleButton value="7d">7 Days</ToggleButton>
                    <ToggleButton value="30d">30 Days</ToggleButton>
                    <ToggleButton value="90d">90 Days</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* No API Key alert */}
            <Alert
                severity="info"
                icon={<InfoIcon />}
                sx={{ mb: 3, borderRadius: 2 }}
            >
                <strong>No API key required.</strong> Traffic data is tracked directly in your database via the <code>traffic_analytics</code> table.
                To capture real AI referrer traffic, add UTM parameters to your links shared in AI conversations, or use referrer header detection in your backend middleware.
            </Alert>

            {/* Hero stat cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <HeroCard
                        label="Total Visitors"
                        value={summary.total_visitors.toLocaleString()}
                        sub={`${summary.date_range.start} → ${summary.date_range.end}`}
                        color="#1e3a8a"
                        icon={BarChartIcon}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <HeroCard
                        label="AI Referrer Visitors"
                        value={summary.ai_visitors.toLocaleString()}
                        sub={`${summary.ai_share_pct}% of total · ${summary.ai_growth_note}`}
                        color="#10b981"
                        icon={AiIcon}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <HeroCard
                        label="Top AI Source"
                        value={summary.top_ai_source || 'N/A'}
                        sub="Highest AI referrer volume"
                        color="#f59e0b"
                        icon={GeminiIcon}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <HeroCard
                        label="Top Overall Source"
                        value={summary.top_source || 'N/A'}
                        sub="Largest single traffic channel"
                        color="#7c3aed"
                        icon={TrendingUp}
                    />
                </Grid>
            </Grid>

            {/* Category filter tabs */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                {[{ key: 'all', label: 'All Sources', color: '#1e3a8a' },
                  { key: 'organic', label: '🔍 Organic', color: '#1e3a8a' },
                  { key: 'paid', label: '💰 Paid', color: '#7c3aed' },
                  { key: 'referral', label: '🔗 Referral', color: '#0891b2' },
                  { key: 'ai', label: '🤖 AI Referrers', color: '#10b981' }
                ].map(tab => (
                    <Chip
                        key={tab.key}
                        label={tab.label}
                        clickable
                        onClick={() => setActiveCategory(tab.key)}
                        variant={activeCategory === tab.key ? 'filled' : 'outlined'}
                        sx={{
                            fontWeight: 600,
                            bgcolor: activeCategory === tab.key ? tab.color : 'transparent',
                            color: activeCategory === tab.key ? '#fff' : tab.color,
                            borderColor: tab.color,
                        }}
                    />
                ))}
            </Stack>

            {/* Main chart + pie */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                            Daily Traffic Trend {activeCategory !== 'all' ? `— ${by_category.find(c => c.category === activeCategory)?.label || activeCategory}` : ''}
                        </Typography>
                        <Box sx={{ height: 340 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={daily_trend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <defs>
                                        {chartKeys.map(key => (
                                            <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={sourceColorMap[key]} stopOpacity={0.18} />
                                                <stop offset="95%" stopColor={sourceColorMap[key]} stopOpacity={0.01} />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="day"
                                        stroke="#94a3b8"
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={v => v?.slice(5)}
                                    />
                                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                    <RechartTooltip content={<CustomTooltip />} />
                                    <Legend
                                        formatter={(value) => sourceLabelMap[value] || value}
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: 11 }}
                                    />
                                    {chartKeys.map(key => (
                                        <Area
                                            key={key}
                                            type="monotone"
                                            dataKey={key}
                                            name={key}
                                            stroke={sourceColorMap[key]}
                                            strokeWidth={2}
                                            fill={`url(#grad_${key})`}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Share by Category
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <PieChart width={220} height={220}>
                                <Pie
                                    data={pieData}
                                    cx={110}
                                    cy={110}
                                    innerRadius={58}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartTooltip formatter={(v) => v.toLocaleString()} />
                            </PieChart>
                        </Box>
                        <Stack spacing={1.5} sx={{ mt: 1 }}>
                            {by_category.map(cat => (
                                <Stack key={cat.category} direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cat.color }} />
                                        <Typography variant="body2" fontWeight={500}>{cat.label}</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Typography variant="body2" fontWeight={700}>{cat.total_visitors.toLocaleString()}</Typography>
                                        <Chip label={`${cat.share_pct}%`} size="small" variant="outlined" sx={{ fontSize: 10, height: 18 }} />
                                    </Stack>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* ── AI Referrers breakdown (feature section) ── */}
            <Typography variant="overline" color="success.main" fontWeight="bold" sx={{ mb: 1.5, display: 'block' }}>
                🤖 AI Referrer Deep-Dive
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* AI vs Non-AI bar comparison */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            AI vs Traditional Channels
                        </Typography>
                        <Box sx={{ height: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[
                                        { name: 'Organic', visitors: nonAiSources.find(s => s.source_name === 'organic')?.total_visitors || 0, color: '#1e3a8a' },
                                        { name: 'Paid', visitors: nonAiSources.find(s => s.source_name === 'paid')?.total_visitors || 0, color: '#7c3aed' },
                                        { name: 'Referral', visitors: nonAiSources.find(s => s.source_name === 'referral')?.total_visitors || 0, color: '#0891b2' },
                                        ...aiSources.map(s => ({ name: s.label, visitors: s.total_visitors, color: s.color }))
                                    ]}
                                    layout="vertical"
                                    margin={{ left: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" width={80} />
                                    <RechartTooltip formatter={v => v.toLocaleString()} />
                                    <Bar dataKey="visitors" radius={[0, 4, 4, 0]}>
                                        {[
                                            { color: '#1e3a8a' }, { color: '#7c3aed' }, { color: '#0891b2' },
                                            ...aiSources.map(s => ({ color: s.color }))
                                        ].map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* AI sources individual cards */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Individual AI Source Performance
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'text.secondary' } }}>
                                        <TableCell>Source</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                        <TableCell align="right">Avg/Day</TableCell>
                                        <TableCell align="right">Peak</TableCell>
                                        <TableCell align="right">AI Share</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {aiSources.map(src => {
                                        const aiSharePct = summary.ai_visitors > 0
                                            ? ((src.total_visitors / summary.ai_visitors) * 100).toFixed(1)
                                            : 0;
                                        return (
                                            <TableRow key={src.source_name} hover>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Box sx={{ color: src.color }}>{SOURCE_ICONS[src.source_name]}</Box>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>{src.label}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={700}>{src.total_visitors.toLocaleString()}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">{src.avg_daily}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2">{src.max_daily?.toLocaleString()}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={`${aiSharePct}%`}
                                                        size="small"
                                                        sx={{ bgcolor: `${src.color}18`, color: src.color, fontWeight: 700, fontSize: 10 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {/* AI total row */}
                                    <TableRow sx={{ bgcolor: '#f0fdf4' }}>
                                        <TableCell><Typography variant="body2" fontWeight={700} color="success.main">🤖 AI Total</Typography></TableCell>
                                        <TableCell align="right"><Typography variant="body2" fontWeight={800} color="success.main">{summary.ai_visitors.toLocaleString()}</Typography></TableCell>
                                        <TableCell align="right"><Typography variant="body2" fontWeight={700}>{(summary.ai_visitors / (data.daily_trend?.length || 1)).toFixed(0)}</Typography></TableCell>
                                        <TableCell align="right">—</TableCell>
                                        <TableCell align="right"><Chip label={`${summary.ai_share_pct}% of all`} size="small" color="success" variant="outlined" sx={{ fontSize: 10 }} /></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* ── All Sources Detail table ── */}
            <Typography variant="overline" color="primary" fontWeight="bold" sx={{ mb: 1.5, display: 'block' }}>
                📊 All Sources — Detailed Report
            </Typography>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 4 }}>
                <Stack spacing={2.5}>
                    {visibleSources.map((src, i) => (
                        <React.Fragment key={src.source_name}>
                            <SourceRow source={src} rank={i + 1} />
                            {i < visibleSources.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </Stack>
            </Paper>

            {/* How to track AI referrers */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: '#10b981', borderRadius: 2, bgcolor: '#f0fdf4', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="success.dark" sx={{ mb: 1.5 }}>
                    🛠 How AI Referrer Tracking Works — No API Key Needed
                </Typography>
                <Grid container spacing={2}>
                    {[
                        { title: 'ChatGPT', desc: 'When ChatGPT surfaces your site in a web search result, traffic arrives with referrer openai.com or chatgpt.com. Your backend middleware captures this as "chatgpt" in traffic_analytics.' },
                        { title: 'Google Gemini', desc: 'Gemini responses that link to your site send referrer traffic from google.com/search. The AI Overview tag helps differentiate Gemini-driven vs regular Google traffic.' },
                        { title: 'Perplexity AI', desc: 'Perplexity.ai includes source links in answers. Traffic from perplexity.ai referrer is captured automatically.' },
                        { title: 'UTM Parameters', desc: 'For links you share manually (e.g. in AI conversations), add ?utm_source=chatgpt&utm_medium=ai to your URLs. Your backend can log these in traffic_analytics.' },
                    ].map(item => (
                        <Grid item xs={12} sm={6} key={item.title}>
                            <Box>
                                <Typography variant="body2" fontWeight={700} color="success.dark">{item.title}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{item.desc}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Box>
    );
};

export default TrafficAnalyticsPage;
