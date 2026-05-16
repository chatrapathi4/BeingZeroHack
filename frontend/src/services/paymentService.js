// -----------------------------------------
// Payment Service
// API calls for payment CRUD operations
// -----------------------------------------
import api from './api';

const paymentService = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export default paymentService;
