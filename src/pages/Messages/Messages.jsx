import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Message as MessageIcon,
    LocalOffer as OfferIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalConversations, setTotalConversations] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversationDetails, setConversationDetails] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, [page, rowsPerPage, searchTerm]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/admin/messaging/conversations', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    search: searchTerm || undefined,
                },
            });

            if (response.data.success) {
                setConversations(response.data.conversations);
                setTotalConversations(response.data.pagination.total);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch conversations');
        } finally {
            setLoading(false);
        }
    };

    const fetchConversationDetails = async (conversationId) => {
        try {
            const [detailsRes, messagesRes] = await Promise.all([
                axios.get(`/api/v1/admin/messaging/conversations/${conversationId}`),
                axios.get(`/api/v1/admin/messaging/conversations/${conversationId}/messages`),
            ]);

            if (detailsRes.data.success && messagesRes.data.success) {
                setConversationDetails({
                    ...detailsRes.data.conversation,
                    messages: messagesRes.data.messages,
                    offers: messagesRes.data.offers,
                });
                setDetailsDialogOpen(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch conversation details');
        }
    };

    const handleViewConversation = (conversation) => {
        setSelectedConversation(conversation);
        fetchConversationDetails(conversation.id);
    };

    const handleDeleteConversation = async (conversationId) => {
        if (!window.confirm('Are you sure you want to delete this conversation?')) {
            return;
        }

        try {
            await axios.delete(`/api/v1/admin/messaging/conversations/${conversationId}`);
            fetchConversations();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete conversation');
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Messages & Conversations
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search by user name or product title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Buyer</TableCell>
                            <TableCell>Seller</TableCell>
                            <TableCell align="center">Messages</TableCell>
                            <TableCell align="center">Offers</TableCell>
                            <TableCell>Last Activity</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : conversations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No conversations found
                                </TableCell>
                            </TableRow>
                        ) : (
                            conversations.map((conversation) => (
                                <TableRow key={conversation.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2">
                                                {conversation.advertisement_title}
                                            </Typography>
                                            <Chip
                                                label={`₹${conversation.advertisement_price}`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 24, height: 24 }}>
                                                {conversation.buyer_name?.charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2">
                                                {conversation.buyer_name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 24, height: 24 }}>
                                                {conversation.seller_name?.charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2">
                                                {conversation.seller_name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            icon={<MessageIcon />}
                                            label={conversation.message_count}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            icon={<OfferIcon />}
                                            label={conversation.offer_count}
                                            size="small"
                                            color={conversation.offer_count > 0 ? 'secondary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(conversation.last_message_at)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleViewConversation(conversation)}
                                            color="primary"
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteConversation(conversation.id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={totalConversations}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </TableContainer>

            {/* Conversation Details Dialog */}
            <Dialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Conversation Details
                </DialogTitle>
                <DialogContent>
                    {conversationDetails && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Product: {conversationDetails.advertisement_title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Price: ₹{conversationDetails.advertisement_price}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Buyer: {conversationDetails.buyer_name} ({conversationDetails.buyer_email})
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Seller: {conversationDetails.seller_name} ({conversationDetails.seller_email})
                            </Typography>

                            {conversationDetails.offers && conversationDetails.offers.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Offers ({conversationDetails.offers.length})
                                    </Typography>
                                    {conversationDetails.offers.map((offer) => (
                                        <Paper key={offer.id} sx={{ p: 2, mb: 1 }}>
                                            <Typography variant="body2">
                                                <strong>{offer.sender_name}</strong> offered ₹{offer.offered_price}
                                            </Typography>
                                            <Chip
                                                label={offer.status}
                                                size="small"
                                                color={
                                                    offer.status === 'accepted'
                                                        ? 'success'
                                                        : offer.status === 'rejected'
                                                            ? 'error'
                                                            : 'default'
                                                }
                                                sx={{ mt: 1 }}
                                            />
                                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                                {formatDate(offer.created_at)}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Box>
                            )}

                            {conversationDetails.messages && conversationDetails.messages.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Messages ({conversationDetails.messages.length})
                                    </Typography>
                                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                                        {conversationDetails.messages.map((msg) => (
                                            <Paper key={msg.id} sx={{ p: 2, mb: 1 }}>
                                                <Typography variant="body2">
                                                    <strong>{msg.sender_name}:</strong> {msg.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(msg.created_at)}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Messages;
