import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Tooltip,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    DragIndicator as DragIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import faqService from '../services/faq.service';
import FAQForm from '../components/FAQForm';

const FAQManagement = () => {
    const [faqs, setFaqs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        category_id: '',
        subcategory_id: '',
        is_active: '',
        search: ''
    });

    // Dialogs
    const [formDialog, setFormDialog] = useState({ open: false, faq: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchFaqs();
    }, [page, rowsPerPage, filters]);

    useEffect(() => {
        if (filters.category_id) {
            fetchSubcategories(filters.category_id);
        } else {
            setSubcategories([]);
        }
    }, [filters.category_id]);

    const fetchCategories = async () => {
        try {
            const response = await faqService.getAllCategories();
            setCategories(response.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubcategories = async (categoryId) => {
        try {
            const response = await faqService.getAllSubcategories(categoryId);
            setSubcategories(response.subcategories || []);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const fetchFaqs = async () => {
        try {
            setLoading(true);
            const response = await faqService.getAllFaqs({
                ...filters,
                limit: rowsPerPage,
                offset: page * rowsPerPage
            });

            setFaqs(response.faqs || []);
            setTotalCount(response.pagination?.total || 0);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            toast.error('Failed to fetch FAQs');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0);
    };

    const handleCategoryFilterChange = (categoryId) => {
        setFilters(prev => ({
            ...prev,
            category_id: categoryId,
            subcategory_id: '' // Reset subcategory when category changes
        }));
        setPage(0);
    };

    const handleEdit = (faq) => {
        setFormDialog({ open: true, faq });
    };

    const handleDelete = async () => {
        try {
            await faqService.deleteFaq(deleteDialog.id);
            toast.success('FAQ deleted successfully');
            setDeleteDialog({ open: false, id: null });
            fetchFaqs();
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            toast.error(error.response?.data?.message || 'Failed to delete FAQ');
        }
    };

    const handleFormSuccess = () => {
        fetchFaqs();
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        // Remove HTML tags
        const plainText = text.replace(/<[^>]*>/g, '');
        if (plainText.length <= maxLength) return plainText;
        return plainText.substring(0, maxLength) + '...';
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    FAQ Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchFaqs}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setFormDialog({ open: true, faq: null })}
                    >
                        Create FAQ
                    </Button>
                </Box>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Filters
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <TextField
                        select
                        label="Category"
                        value={filters.category_id}
                        onChange={(e) => handleCategoryFilterChange(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Subcategory"
                        value={filters.subcategory_id}
                        onChange={(e) => handleFilterChange('subcategory_id', e.target.value)}
                        size="small"
                        disabled={!filters.category_id || subcategories.length === 0}
                    >
                        <MenuItem value="">All Subcategories</MenuItem>
                        {subcategories.map((subcategory) => (
                            <MenuItem key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Status"
                        value={filters.is_active}
                        onChange={(e) => handleFilterChange('is_active', e.target.value)}
                        size="small"
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="true">Active</MenuItem>
                        <MenuItem value="false">Inactive</MenuItem>
                    </TextField>

                    <TextField
                        label="Search"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        size="small"
                        placeholder="Search questions..."
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width="50">ID</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Subcategory</TableCell>
                            <TableCell>Question</TableCell>
                            <TableCell>Answer</TableCell>
                            <TableCell width="100">Sort Order</TableCell>
                            <TableCell width="100">Status</TableCell>
                            <TableCell align="right" width="150">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : faqs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No FAQs found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            faqs.map((faq) => (
                                <TableRow key={faq.id} hover>
                                    <TableCell>{faq.id}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                            {faq.category_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                            {faq.subcategory_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {truncateText(faq.question, 80)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {truncateText(faq.answer, 60)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={faq.sort_order} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        {faq.is_active ? (
                                            <Chip label="Active" color="success" size="small" />
                                        ) : (
                                            <Chip label="Inactive" color="default" size="small" />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleEdit(faq)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => setDeleteDialog({ open: true, id: faq.id })}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </TableContainer>

            {/* FAQ Form Dialog */}
            <FAQForm
                open={formDialog.open}
                onClose={() => setFormDialog({ open: false, faq: null })}
                faq={formDialog.faq}
                onSuccess={handleFormSuccess}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
                <DialogTitle>Delete FAQ</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this FAQ? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FAQManagement;
