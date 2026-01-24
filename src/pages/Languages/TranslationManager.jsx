import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, MenuItem, Select, FormControl, InputLabel, TextField, IconButton, Tooltip } from '@mui/material';
import { Save as SaveIcon, Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const TranslationManager = () => {
    const [languages, setLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [translations, setTranslations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [savingId, setSavingId] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (newRowsPerPage) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    useEffect(() => {
        if (selectedLanguage) {
            fetchTranslations(selectedLanguage);
        }
    }, [selectedLanguage]);

    const fetchLanguages = async () => {
        try {
            const response = await adminService.getLanguages();
            const langs = response.data.data;
            setLanguages(langs);
            // Default to the first non-English language if available, or just first one
            const defaultLang = langs.find(l => l.code !== 'en') || langs[0];
            if (defaultLang) setSelectedLanguage(defaultLang.id);
        } catch (error) {
            toast.error('Failed to fetch languages');
        }
    };

    const fetchTranslations = async (langId) => {
        try {
            setLoading(true);
            const response = await adminService.getTranslations({ language_id: langId });
            setTranslations(response.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch translations');
        } finally {
            setLoading(false);
        }
    };

    const handleTranslationChange = (id, newValue) => {
        setTranslations(prev => prev.map(t =>
            t.id === id ? { ...t, translated_text: newValue } : t
        ));
    };

    const handleSave = async (id, newValue) => {
        try {
            setSavingId(id);
            await adminService.updateTranslation(id, { translated_text: newValue });
            toast.success('Translation updated');
        } catch (error) {
            toast.error('Failed to update translation');
        } finally {
            setSavingId(null);
        }
    };

    const filteredTranslations = translations.filter(t =>
        t.key_name.toLowerCase().includes(search.toLowerCase()) ||
        t.default_text.toLowerCase().includes(search.toLowerCase()) ||
        (t.translated_text && t.translated_text.toLowerCase().includes(search.toLowerCase()))
    );

    const paginatedTranslations = filteredTranslations.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const columns = [
        {
            id: 'category',
            label: 'Category',
            minWidth: 100,
            format: (value, row) => (
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
                    {row.key_name.includes('.') ? row.key_name.split('.')[0] : 'common'}
                </Typography>
            )
        },
        { id: 'key_name', label: 'Key', minWidth: 200 },
        {
            id: 'default_text',
            label: 'Default (English)',
            minWidth: 300,
            format: (value) => (
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {value}
                </Typography>
            )
        },
        {
            id: 'translated_text',
            label: 'Translation',
            minWidth: 300,
            format: (value, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        maxRows={3}
                        value={value || ''}
                        onChange={(e) => handleTranslationChange(row.id, e.target.value)}
                        onBlur={() => handleSave(row.id, value)} // Auto-save on blur
                        placeholder="Enter translation..."
                        variant="outlined"
                        sx={{
                            backgroundColor: 'background.paper',
                            '& .MuiOutlinedInput-root': {
                                fontSize: '0.875rem'
                            }
                        }}
                    />
                    {savingId === row.id && <LoadingSpinner size={20} />}
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Translation Manager</Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Language</InputLabel>
                        <Select
                            value={selectedLanguage}
                            label="Language"
                            onChange={(e) => {
                                setSelectedLanguage(e.target.value);
                                setPage(0);
                            }}
                        >
                            {languages.map(lang => (
                                <MenuItem key={lang.id} value={lang.id}>
                                    {lang.flag_icon} {lang.name} ({lang.code})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Paper sx={{ mb: 3, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search keys or text..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {loading ? <LoadingSpinner /> : (
                <DataTable
                    columns={columns}
                    data={paginatedTranslations}
                    totalRows={filteredTranslations.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    actions={false}
                />
            )}
        </Box>
    );
};

export default TranslationManager;
