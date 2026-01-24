import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    FormControlLabel,
    Switch,
    Box,
    CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import faqService from '../services/faq.service';

const FAQForm = ({ open, onClose, faq, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [formData, setFormData] = useState({
        category_id: '',
        subcategory_id: '',
        question: '',
        answer: '',
        sort_order: 0,
        is_active: true
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            fetchCategories();
            if (faq) {
                setFormData({
                    category_id: faq.category_id || '',
                    subcategory_id: faq.subcategory_id || '',
                    question: faq.question || '',
                    answer: faq.answer || '',
                    sort_order: faq.sort_order || 0,
                    is_active: faq.is_active !== false
                });
                if (faq.category_id) {
                    fetchSubcategories(faq.category_id);
                }
            } else {
                setFormData({
                    category_id: '',
                    subcategory_id: '',
                    question: '',
                    answer: '',
                    sort_order: 0,
                    is_active: true
                });
            }
        }
    }, [open, faq]);

    const fetchCategories = async () => {
        try {
            const response = await faqService.getAllCategories(true);
            setCategories(response.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to fetch categories');
        }
    };

    const fetchSubcategories = async (categoryId) => {
        try {
            const response = await faqService.getAllSubcategories(categoryId, true);
            setSubcategories(response.subcategories || []);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            toast.error('Failed to fetch subcategories');
        }
    };

    const handleCategoryChange = (categoryId) => {
        setFormData(prev => ({
            ...prev,
            category_id: categoryId,
            subcategory_id: '' // Reset subcategory when category changes
        }));
        if (categoryId) {
            fetchSubcategories(categoryId);
        } else {
            setSubcategories([]);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.category_id) {
            newErrors.category_id = 'Category is required';
        }
        if (!formData.subcategory_id) {
            newErrors.subcategory_id = 'Subcategory is required';
        }
        if (!formData.question.trim()) {
            newErrors.question = 'Question is required';
        }
        if (!formData.answer.trim() || formData.answer === '<p><br></p>') {
            newErrors.answer = 'Answer is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            if (faq) {
                await faqService.updateFaq(faq.id, formData);
                toast.success('FAQ updated successfully');
            } else {
                await faqService.createFaq(formData);
                toast.success('FAQ created successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving FAQ:', error);
            toast.error(error.response?.data?.message || 'Failed to save FAQ');
        } finally {
            setLoading(false);
        }
    };

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link'],
            ['clean']
        ]
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {faq ? 'Edit FAQ' : 'Create New FAQ'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {/* Category */}
                    <TextField
                        select
                        label="Category"
                        value={formData.category_id}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        error={!!errors.category_id}
                        helperText={errors.category_id}
                        required
                        fullWidth
                    >
                        <MenuItem value="">Select Category</MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Subcategory */}
                    <TextField
                        select
                        label="Subcategory"
                        value={formData.subcategory_id}
                        onChange={(e) => handleChange('subcategory_id', e.target.value)}
                        error={!!errors.subcategory_id}
                        helperText={errors.subcategory_id}
                        required
                        fullWidth
                        disabled={!formData.category_id || subcategories.length === 0}
                    >
                        <MenuItem value="">Select Subcategory</MenuItem>
                        {subcategories.map((subcategory) => (
                            <MenuItem key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Question */}
                    <TextField
                        label="Question"
                        value={formData.question}
                        onChange={(e) => handleChange('question', e.target.value)}
                        error={!!errors.question}
                        helperText={errors.question}
                        required
                        fullWidth
                        multiline
                        rows={2}
                    />

                    {/* Answer (Rich Text Editor) */}
                    <Box>
                        <label style={{ fontSize: '12px', color: errors.answer ? '#d32f2f' : '#666', marginBottom: '4px', display: 'block' }}>
                            Answer *
                        </label>
                        <ReactQuill
                            theme="snow"
                            value={formData.answer}
                            onChange={(value) => handleChange('answer', value)}
                            modules={quillModules}
                            style={{
                                height: '200px',
                                marginBottom: '50px',
                                border: errors.answer ? '1px solid #d32f2f' : undefined
                            }}
                        />
                        {errors.answer && (
                            <p style={{ color: '#d32f2f', fontSize: '12px', margin: '4px 14px 0' }}>
                                {errors.answer}
                            </p>
                        )}
                    </Box>

                    {/* Sort Order */}
                    <TextField
                        label="Sort Order"
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                        fullWidth
                        helperText="Lower numbers appear first"
                    />

                    {/* Active Status */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.target.checked)}
                            />
                        }
                        label="Active"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {faq ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FAQForm;
