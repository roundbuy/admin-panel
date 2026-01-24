/**
 * Notification Service
 * 
 * Handles all API calls for notification management in admin panel
 */

import api from './api';

const notificationService = {
    /**
     * Get all notifications with filters
     */
    getAllNotifications: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.type) params.append('type', filters.type);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.targetAudience) params.append('targetAudience', filters.targetAudience);
        if (filters.sent !== undefined) params.append('sent', filters.sent);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.offset) params.append('offset', filters.offset);

        const response = await api.get(`/admin/notifications?${params.toString()}`);
        return response.data;
    },

    /**
     * Get notification by ID
     */
    getNotificationById: async (id) => {
        const response = await api.get(`/admin/notifications/${id}`);
        return response.data;
    },

    /**
     * Create a new notification
     */
    createNotification: async (notificationData) => {
        const response = await api.post('/admin/notifications', notificationData);
        return response.data;
    },

    /**
     * Update a notification
     */
    updateNotification: async (id, notificationData) => {
        const response = await api.put(`/admin/notifications/${id}`, notificationData);
        return response.data;
    },

    /**
     * Delete a notification
     */
    deleteNotification: async (id) => {
        const response = await api.delete(`/admin/notifications/${id}`);
        return response.data;
    },

    /**
     * Send a notification immediately
     */
    sendNotification: async (id) => {
        const response = await api.post(`/admin/notifications/${id}/send`);
        return response.data;
    },

    /**
     * Get notification statistics
     */
    getNotificationStats: async (id) => {
        const response = await api.get(`/admin/notifications/${id}/stats`);
        return response.data;
    },

    /**
     * Preview target user count
     */
    previewTargetCount: async (targetData) => {
        const response = await api.post('/admin/notifications/preview-count', targetData);
        return response.data;
    }
};

export default notificationService;
