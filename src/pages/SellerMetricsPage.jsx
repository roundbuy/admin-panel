
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Chip,
    Tooltip
} from '@mui/material';
import { toast } from 'react-toastify';
import DataTable from '../components/Common/DataTable';
import SearchBar from '../components/Common/SearchBar';
import LoadingSpinner from '../components/Common/LoadingSpinner';

import adminService from '../services/admin.service';

const SellerMetricsPage = () => {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchMetrics();
    }, [page, rowsPerPage, search]);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const response = await adminService.getSellerMetrics({
                page: page + 1,
                limit: rowsPerPage,
                search
            });
            // Backend returns { success: true, data: [...], pagination: {...} }
            // UserList expected: response.data.data.users. 
            // My backend implementation returns rows directly in response.data.data
            setMetrics(response.data.data);
            setTotalRows(response.data.pagination.total);
        } catch (error) {
            toast.error('Failed to fetch seller metrics');
            console.error('Fetch metrics error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(0);
    };

    // Format helpers
    const formatPercentage = (val) => val ? `${parseFloat(val).toFixed(1)}%` : '0%';
    const formatTime = (mins) => {
        if (!mins) return 'N/A';
        if (mins < 60) return `${mins}m`;
        return `${(mins / 60).toFixed(1)}h`;
    };

    const ScoreBadge = ({ score }) => {
        const s = parseFloat(score || 0);
        const color = s >= 80 ? 'success' : s >= 60 ? 'warning' : 'error';
        const label = s >= 80 ? 'Elite' : s >= 60 ? 'Good' : 'At Risk';
        return (
            <Tooltip title={`${label} seller — score ${s.toFixed(1)}/100`}>
                <Chip
                    label={`${s.toFixed(1)}`}
                    color={color}
                    size="small"
                    variant="filled"
                    sx={{ fontWeight: 'bold', minWidth: 52 }}
                />
            </Tooltip>
        );
    };

    const columns = [
        {
            id: 'seller_score',
            label: 'Seller Score',
            minWidth: 110,
            format: (value) => <ScoreBadge score={value} />
        },
        {
            id: 'full_name',
            label: 'Seller Name',
            minWidth: 150,
            format: (value, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box>{row.full_name || 'N/A'}</Box>
                </Box>
            )
        },
        {
            id: 'email',
            label: 'Email',
            minWidth: 200
        },
        {
            id: 'average_rating',
            label: 'Avg Rating',
            minWidth: 100,
            format: (value) => value ? `${parseFloat(value).toFixed(2)} ★` : 'N/A'
        },
        {
            id: 'avg_response_time_minutes',
            label: 'Response Time',
            minWidth: 120,
            format: (value) => formatTime(value)
        },
        {
            id: 'pickup_meeting_attendance_rate',
            label: 'Pickup Rate',
            minWidth: 120,
            format: (value) => formatPercentage(value)
        },
        {
            id: 'questions_answered_within_2h_rate',
            label: 'Fast Reply Rate',
            minWidth: 120,
            format: (value) => formatPercentage(value)
        },
        {
            id: 'successful_sales_rate',
            label: 'Sales Rate',
            minWidth: 120,
            format: (value) => formatPercentage(value)
        },
        {
            id: 'dispute_resolution_rate',
            label: 'Dispute Res. Rate',
            minWidth: 120,
            format: (value) => formatPercentage(value)
        },
        {
            id: 'updated_at',
            label: 'Last Updated',
            minWidth: 150,
            format: (value) => value ? new Date(value).toLocaleDateString() : 'Never'
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Seller Metrics
                </Typography>
            </Box>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <SearchBar
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search by name or email..."
                    />
                </Grid>
            </Grid>

            {/* Data Table */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <DataTable
                    columns={columns}
                    data={metrics}
                    totalRows={totalRows}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={setRowsPerPage}
                    loading={loading}
                // No edit/delete actions needed for metrics view
                />
            )}
        </Box>
    );
};

export default SellerMetricsPage;
