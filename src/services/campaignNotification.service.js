/**
 * Campaign Notification Service
 * API service for campaign notification management
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const campaignNotificationService = {
    /**
     * Get all campaign notifications
     */
    getAllCampaignNotifications: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/admin/campaign-notifications`, {
            headers: getAuthHeader(),
            params: filters
        });
        return response.data;
    },

    /**
     * Get campaign notification by ID
     */
    getCampaignNotificationById: async (id) => {
        const response = await axios.get(`${API_URL}/admin/campaign-notifications/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Update campaign notification
     */
    updateCampaignNotification: async (id, data) => {
        const response = await axios.put(`${API_URL}/admin/campaign-notifications/${id}`, data, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Toggle campaign notification active status
     */
    toggleCampaignNotification: async (id, isActive) => {
        const response = await axios.post(
            `${API_URL}/admin/campaign-notifications/${id}/toggle`,
            { is_active: isActive },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    /**
     * Send campaign notification to all eligible users
     */
    sendToAll: async (id, scheduledAt = null) => {
        const response = await axios.post(
            `${API_URL}/admin/campaign-notifications/${id}/send`,
            { scheduled_at: scheduledAt },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    /**
     * Send campaign notification to specific users
     */
    sendToUsers: async (id, userIds, scheduledAt = null) => {
        const response = await axios.post(
            `${API_URL}/admin/campaign-notifications/${id}/send-to-user`,
            { user_ids: userIds, scheduled_at: scheduledAt },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    /**
     * Send campaign notification to user group
     */
    sendToGroup: async (id, filters, scheduledAt = null, isRecurring = false, recurrencePattern = null) => {
        const response = await axios.post(
            `${API_URL}/admin/campaign-notifications/${id}/send-to-group`,
            {
                filters,
                scheduled_at: scheduledAt,
                is_recurring: isRecurring,
                recurrence_pattern: recurrencePattern
            },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    /**
     * Test send campaign notification to admin
     */
    testSend: async (id) => {
        const response = await axios.post(
            `${API_URL}/admin/campaign-notifications/${id}/test`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    /**
     * Get campaign notification statistics
     */
    getStats: async (id) => {
        const response = await axios.get(`${API_URL}/admin/campaign-notifications/${id}/stats`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    /**
     * Get scheduled sends for a campaign notification
     */
    getScheduledSends: async (id, status = null) => {
        const response = await axios.get(`${API_URL}/admin/campaign-notifications/${id}/scheduled`, {
            headers: getAuthHeader(),
            params: { status }
        });
        return response.data;
    },

    /**
     * Get all scheduled sends (across all notifications)
     */
    getAllScheduledSends: async () => {
        // This would need a new endpoint, for now we'll return empty
        // TODO: Add endpoint to get all scheduled sends
        return { scheduled: [] };
    },

    /**
     * Cancel scheduled send
     */
    cancelScheduledSend: async (triggerId) => {
        const response = await axios.delete(
            `${API_URL}/admin/campaign-notifications/scheduled/${triggerId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    /**
     * Preview recipient count
     */
    previewRecipientCount: async (filters) => {
        const response = await axios.post(
            `${API_URL}/admin/campaign-notifications/preview-count`,
            { filters },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    /**
     * Search users
     */
    searchUsers: async (query, limit = 20) => {
        const response = await axios.get(`${API_URL}/admin/users/search`, {
            headers: getAuthHeader(),
            params: { q: query, limit }
        });
        return response.data;
    }
};

export default campaignNotificationService;
