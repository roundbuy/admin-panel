import { adminApi } from './api';

const postageService = {
  // Shipments
  getShipments: async (params) => {
    const response = await adminApi.get('/admin/postage/shipments', { params });
    return response.data;
  },

  // Carriers
  getCarriers: async () => {
    const response = await adminApi.get('/admin/postage/carriers');
    return response.data;
  },
  createCarrier: async (data) => {
    const response = await adminApi.post('/admin/postage/carriers', data);
    return response.data;
  },
  updateCarrier: async (id, data) => {
    const response = await adminApi.put(`/admin/postage/carriers/${id}`, data);
    return response.data;
  },
  deleteCarrier: async (id) => {
    const response = await adminApi.delete(`/admin/postage/carriers/${id}`);
    return response.data;
  },

  // Rates
  getRates: async () => {
    const response = await adminApi.get('/admin/postage/rates');
    return response.data;
  },
  createRate: async (data) => {
    const response = await adminApi.post('/admin/postage/rates', data);
    return response.data;
  },
  deleteRate: async (id) => {
    const response = await adminApi.delete(`/admin/postage/rates/${id}`);
    return response.data;
  }
};

export default postageService;
