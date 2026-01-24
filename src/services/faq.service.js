/**
 * FAQ Service
 * 
 * Handles all API calls for FAQ management in admin panel
 */

import api from './api';

const faqService = {
    // ==================== CATEGORIES ====================

    /**
     * Get all FAQ categories
     */
    getAllCategories: async (isActive) => {
        const params = new URLSearchParams();
        if (isActive !== undefined) params.append('is_active', isActive);

        const response = await api.get(`/admin/faqs/categories?${params.toString()}`);
        return response.data;
    },

    /**
     * Create FAQ category
     */
    createCategory: async (categoryData) => {
        const response = await api.post('/admin/faqs/categories', categoryData);
        return response.data;
    },

    /**
     * Update FAQ category
     */
    updateCategory: async (id, categoryData) => {
        const response = await api.put(`/admin/faqs/categories/${id}`, categoryData);
        return response.data;
    },

    /**
     * Delete FAQ category
     */
    deleteCategory: async (id) => {
        const response = await api.delete(`/admin/faqs/categories/${id}`);
        return response.data;
    },

    // ==================== SUBCATEGORIES ====================

    /**
     * Get all FAQ subcategories
     */
    getAllSubcategories: async (categoryId, isActive) => {
        const params = new URLSearchParams();
        if (categoryId) params.append('category_id', categoryId);
        if (isActive !== undefined) params.append('is_active', isActive);

        const response = await api.get(`/admin/faqs/subcategories?${params.toString()}`);
        return response.data;
    },

    /**
     * Create FAQ subcategory
     */
    createSubcategory: async (subcategoryData) => {
        const response = await api.post('/admin/faqs/subcategories', subcategoryData);
        return response.data;
    },

    /**
     * Update FAQ subcategory
     */
    updateSubcategory: async (id, subcategoryData) => {
        const response = await api.put(`/admin/faqs/subcategories/${id}`, subcategoryData);
        return response.data;
    },

    /**
     * Delete FAQ subcategory
     */
    deleteSubcategory: async (id) => {
        const response = await api.delete(`/admin/faqs/subcategories/${id}`);
        return response.data;
    },

    // ==================== FAQs ====================

    /**
     * Get all FAQs with filters
     */
    getAllFaqs: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.subcategory_id) params.append('subcategory_id', filters.subcategory_id);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
        if (filters.search) params.append('search', filters.search);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.offset) params.append('offset', filters.offset);

        const response = await api.get(`/admin/faqs?${params.toString()}`);
        return response.data;
    },

    /**
     * Get FAQ by ID
     */
    getFaqById: async (id) => {
        const response = await api.get(`/admin/faqs/${id}`);
        return response.data;
    },

    /**
     * Create new FAQ
     */
    createFaq: async (faqData) => {
        const response = await api.post('/admin/faqs', faqData);
        return response.data;
    },

    /**
     * Update FAQ
     */
    updateFaq: async (id, faqData) => {
        const response = await api.put(`/admin/faqs/${id}`, faqData);
        return response.data;
    },

    /**
     * Delete FAQ
     */
    deleteFaq: async (id) => {
        const response = await api.delete(`/admin/faqs/${id}`);
        return response.data;
    },

    /**
     * Reorder FAQs
     */
    reorderFaqs: async (faqs) => {
        const response = await api.put('/admin/faqs/reorder', { faqs });
        return response.data;
    },

    /**
     * Bulk update FAQ status
     */
    bulkUpdateStatus: async (faqIds, isActive) => {
        const response = await api.patch('/admin/faqs/bulk-status', {
            faq_ids: faqIds,
            is_active: isActive
        });
        return response.data;
    }
};

export default faqService;
