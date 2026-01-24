import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    TablePagination,
    Grid,
    Button
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    FilterList as FilterListIcon,
    GetApp as DownloadIcon
} from '@mui/icons-material';
import axios from '../../services/api';
import { toast } from 'react-toastify';

const WalletReports = () => {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, credit, debit

    useEffect(() => {
        fetchTransactions();
    }, [page, rowsPerPage, search, filterType]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/wallets/transactions/all', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    search,
                    type: filterType !== 'all' ? filterType : ''
                }
            });

            setTransactions(response.data.data.transactions);
            setTotal(response.data.data.pagination.total);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load wallet reports');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'failed': return 'error';
            case 'cancelled': return 'default';
            default: return 'default';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    Wallet Reports
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => toast.success('Export started')}
                >
                    Export CSV
                </Button>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search by user or transaction ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant={filterType === 'all' ? 'contained' : 'outlined'}
                            onClick={() => setFilterType('all')}
                            size="small"
                        >
                            All
                        </Button>
                        <Button
                            variant={filterType === 'credit' ? 'contained' : 'outlined'}
                            onClick={() => setFilterType('credit')}
                            color="success"
                            size="small"
                        >
                            Money In
                        </Button>
                        <Button
                            variant={filterType === 'debit' ? 'contained' : 'outlined'}
                            onClick={() => setFilterType('debit')}
                            color="error"
                            size="small"
                        >
                            Money Out
                        </Button>
                    </Grid>
                </Grid>
            </Card>

            {/* Transactions Table */}
            <Card>
                <TableContainer component={Paper} elevation={0}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                        Loading transactions...
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((transaction) => (
                                    <TableRow key={transaction.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                #{transaction.reference_id || transaction.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {transaction.user_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {transaction.user_email}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={transaction.transaction_type === 'credit' ? 'Money In' : 'Money Out'}
                                                size="small"
                                                color={transaction.transaction_type === 'credit' ? 'success' : 'error'}
                                                variant="outlined"
                                                sx={{ borderRadius: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                {transaction.category}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                color={transaction.transaction_type === 'credit' ? 'success.main' : 'error.main'}
                                            >
                                                {transaction.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={transaction.status}
                                                size="small"
                                                color={getStatusColor(transaction.status)}
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(transaction.created_at)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small">
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={handlePageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </Card>
        </Box>
    );
};

export default WalletReports;
