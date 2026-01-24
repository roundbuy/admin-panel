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
    Button,
    TablePagination,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Grid
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Visibility as VisibilityIcon,
    AccountBalance as BankIcon,
    Payment as PayPalIcon
} from '@mui/icons-material';
import axios from '../../services/api';
import { toast } from 'react-toastify';

const WithdrawalRequests = () => {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('pending'); // pending, completed, rejected

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
    const [adminNotes, setAdminNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [page, rowsPerPage, statusFilter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/wallets/withdrawals/requests', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    status: statusFilter === 'all' ? '' : statusFilter
                }
            });

            setRequests(response.data.data.requests);
            setTotal(response.data.data.pagination.total);
        } catch (error) {
            console.error('Error fetching withdrawal requests:', error);
            toast.error('Failed to load withdrawal requests');
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

    const handleTabChange = (event, newValue) => {
        setStatusFilter(newValue);
        setPage(0);
    };

    const handleAction = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setAdminNotes('');
        setOpenDialog(true);
    };

    const submitAction = async () => {
        try {
            setProcessing(true);
            const status = actionType === 'approve' ? 'completed' : 'rejected';

            await axios.patch(`/admin/wallets/withdrawals/${selectedRequest.id}/process`, {
                status,
                admin_notes: adminNotes
            });

            toast.success(`Withdrawal request ${status} successfully`);
            setOpenDialog(false);
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            toast.error(error.response?.data?.message || 'Failed to process request');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'rejected': return 'error';
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

    const rendermethodIcon = (method) => {
        if (method === 'bank_transfer') return <BankIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />;
        if (method === 'paypal') return <PayPalIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />;
        return null;
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 2 }}>
                    Withdrawal Requests
                </Typography>

                <Tabs
                    value={statusFilter}
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Pending" value="pending" />
                    <Tab label="Processing" value="processing" />
                    <Tab label="Completed" value="completed" />
                    <Tab label="Rejected" value="rejected" />
                    <Tab label="All" value="all" />
                </Tabs>
            </Box>

            <Card>
                <TableContainer component={Paper} elevation={0}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                        Loading requests...
                                    </TableCell>
                                </TableRow>
                            ) : requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                        No withdrawal requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((request) => (
                                    <TableRow key={request.id} hover>
                                        <TableCell>#{request.id}</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {request.full_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {request.email}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {formatCurrency(request.amount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {rendermethodIcon(request.withdrawal_method)}
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                    {request.withdrawal_method.replace('_', ' ')}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 250 }}>
                                            <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                                {request.withdrawal_method === 'paypal' ?
                                                    `Email: ${JSON.parse(request.bank_account_details || '{}').account_name}` :
                                                    `Bank: ${JSON.parse(request.bank_account_details || '{}').bank_name || 'N/A'}\nAcc: ${JSON.parse(request.bank_account_details || '{}').account_number}`
                                                }
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={request.status}
                                                size="small"
                                                color={getStatusColor(request.status)}
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            {(request.status === 'pending' || request.status === 'processing') && (
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                    <Button
                                                        variant="outlined"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleAction(request, 'approve')}
                                                        startIcon={<ApproveIcon />}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleAction(request, 'reject')}
                                                        startIcon={<RejectIcon />}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            )}
                                            {(request.status !== 'pending' && request.status !== 'processing') && (
                                                <IconButton size="small">
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            )}
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
                    rowsPerPageOptions={[10, 25, 50]}
                />
            </Card>

            {/* Approve/Reject Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: actionType === 'approve' ? 'success.main' : 'error.main' }}>
                    {actionType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        {actionType === 'approve'
                            ? `Are you sure you want to approve the withdrawal of ${selectedRequest ? formatCurrency(selectedRequest.amount) : ''} for ${selectedRequest?.full_name}?`
                            : `Are you sure you want to reject this withdrawal request? The amount will be refunded to the user's wallet.`
                        }
                    </DialogContentText>

                    <TextField
                        autoFocus
                        margin="dense"
                        label={actionType === 'approve' ? "Notes (Optional)" : "Rejection Reason (Required)"}
                        fullWidth
                        multiline
                        rows={3}
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        required={actionType === 'reject'}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} disabled={processing}>Cancel</Button>
                    <Button
                        onClick={submitAction}
                        variant="contained"
                        color={actionType === 'approve' ? 'success' : 'error'}
                        disabled={processing || (actionType === 'reject' && !adminNotes.trim())}
                    >
                        {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WithdrawalRequests;
