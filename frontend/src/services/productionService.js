// -----------------------------------------
// Production Service
// API calls for production CRUD operations
// -----------------------------------------
import api from './api';

const productionService = {
  getAll: () => api.get('/production'),
  getById: (id) => api.get(`/production/${id}`),
  create: (data) => api.post('/production', data),
  update: (id, data) => api.put(`/production/${id}`, data),
  delete: (id) => api.delete(`/production/${id}`),
};

export default productionService;
