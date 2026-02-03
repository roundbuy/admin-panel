import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    TablePagination,
    Rating,
    CircularProgress
} from '@mui/material';
import suggestionsService from '../../services/suggestions.service';
import { toast } from 'react-toastify';

const Suggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const response = await suggestionsService.getSuggestions(page + 1, rowsPerPage);
            if (response.success) {
                setSuggestions(response.data.suggestions);
                setTotal(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            toast.error('Failed to load suggestions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, [page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1a1a2e' }}>
                User Suggestions & Feedback
            </Typography>

            <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table sx={{ minWidth: 750 }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                        <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Page</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Tags</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Comment</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {suggestions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                No suggestions found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        suggestions.map((row) => (
                                            <TableRow key={row.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ bgcolor: '#3f51b5', width: 32, height: 32, fontSize: '0.875rem' }}>
                                                            {row.full_name ? row.full_name.charAt(0).toUpperCase() : (row.email ? row.email.charAt(0).toUpperCase() : '?')}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {row.full_name || 'Anonymous'}
                                                            </Typography>
                                                            {row.email && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {row.email}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={row.page_route || 'General'} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell>
                                                    <Rating value={row.rating} readOnly size="small" />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {Array.isArray(row.feedback_tags) && row.feedback_tags.map((tag, idx) => (
                                                            <Chip key={idx} label={tag} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }} />
                                                        ))}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ maxWidth: 300 }}>{row.comment || '-'}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Date(row.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={total}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default Suggestions;
