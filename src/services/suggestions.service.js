import api from './api';

const suggestionsService = {
    getSuggestions: async (page = 1, limit = 10) => {
        const response = await api.get('/admin/suggestions', {
            params: { page, limit }
        });
        return response.data;
    }
};

export default suggestionsService;
