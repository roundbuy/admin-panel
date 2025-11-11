import api from './api';

const adminService = {
  // ==================== DASHBOARD ====================
  getDashboardStats: () => api.get('/admin/dashboard'),

  // ==================== USER MANAGEMENT ====================
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetail: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  toggleUserStatus: (id, is_active) => api.patch(`/admin/users/${id}/status`, { is_active }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // ==================== SUBSCRIPTION PLANS ====================
  getSubscriptionPlans: () => api.get('/admin/subscription-plans'),
  createSubscriptionPlan: (data) => api.post('/admin/subscription-plans', data),
  updateSubscriptionPlan: (id, data) => api.put(`/admin/subscription-plans/${id}`, data),
  deleteSubscriptionPlan: (id) => api.delete(`/admin/subscription-plans/${id}`),

  // ==================== ADVERTISEMENT PLANS ====================
  getAdvertisementPlans: () => api.get('/admin/advertisement-plans'),
  createAdvertisementPlan: (data) => api.post('/admin/advertisement-plans', data),
  updateAdvertisementPlan: (id, data) => api.put(`/admin/advertisement-plans/${id}`, data),
  deleteAdvertisementPlan: (id) => api.delete(`/admin/advertisement-plans/${id}`),

  // ==================== BANNER PLANS ====================
  getBannerPlans: () => api.get('/admin/banner-plans'),
  createBannerPlan: (data) => api.post('/admin/banner-plans', data),
  updateBannerPlan: (id, data) => api.put(`/admin/banner-plans/${id}`, data),
  deleteBannerPlan: (id) => api.delete(`/admin/banner-plans/${id}`),

  // ==================== ADVERTISEMENTS ====================
  getAdvertisements: (params) => api.get('/admin/advertisements', { params }),
  getAdvertisementDetail: (id) => api.get(`/admin/advertisements/${id}`),
  updateAdvertisement: (id, data) => api.put(`/admin/advertisements/${id}`, data),
  approveAdvertisement: (id) => api.patch(`/admin/advertisements/${id}/approve`),
  rejectAdvertisement: (id, rejection_reason) => 
    api.patch(`/admin/advertisements/${id}/reject`, { rejection_reason }),
  deleteAdvertisement: (id) => api.delete(`/admin/advertisements/${id}`),

  // ==================== BANNERS ====================
  getBanners: (params) => api.get('/admin/banners', { params }),
  approveBanner: (id) => api.patch(`/admin/banners/${id}/approve`),
  rejectBanner: (id, rejection_reason) => 
    api.patch(`/admin/banners/${id}/reject`, { rejection_reason }),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),

  // ==================== SUBSCRIPTIONS ====================
  getSubscriptions: (params) => api.get('/admin/subscriptions', { params }),
  updateSubscription: (id, data) => api.put(`/admin/subscriptions/${id}`, data),

  // ==================== LANGUAGES ====================
  getLanguages: () => api.get('/admin/languages'),
  createLanguage: (data) => api.post('/admin/languages', data),
  updateLanguage: (id, data) => api.put(`/admin/languages/${id}`, data),
  deleteLanguage: (id) => api.delete(`/admin/languages/${id}`),

  // ==================== TRANSLATIONS ====================
  getTranslationKeys: (params) => api.get('/admin/translation-keys', { params }),
  createTranslationKey: (data) => api.post('/admin/translation-keys', data),
  getTranslations: (params) => api.get('/admin/translations', { params }),
  updateTranslation: (id, data) => api.put(`/admin/translations/${id}`, data),

  // ==================== SETTINGS ====================
  getSettings: (params) => api.get('/admin/settings', { params }),
  updateSetting: (key, value) => api.put(`/admin/settings/${key}`, { setting_value: value }),
  bulkUpdateSettings: (settings) => api.post('/admin/settings/bulk', { settings }),

  // ==================== MODERATION ====================
  getModerationWords: (params) => api.get('/admin/moderation/words', { params }),
  createModerationWord: (data) => api.post('/admin/moderation/words', data),
  updateModerationWord: (id, data) => api.put(`/admin/moderation/words/${id}`, data),
  deleteModerationWord: (id) => api.delete(`/admin/moderation/words/${id}`),
  
  getModerationQueue: (params) => api.get('/admin/moderation/queue', { params }),
  reviewModerationItem: (id, data) => api.patch(`/admin/moderation/queue/${id}/review`, data),

  // ==================== API LOGS ====================
  getAPILogs: (params) => api.get('/admin/api-logs', { params }),
  getAPILogDetail: (id) => api.get(`/admin/api-logs/${id}`),

  // ==================== CATEGORIES ====================
  getCategories: () => api.get('/admin/categories'),
};

export default adminService;