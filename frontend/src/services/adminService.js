// -----------------------------------------
// Admin Service
// API calls for admin operations
// -----------------------------------------
import api from './api';

const adminService = {
  getAllUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getAllProduction: () => api.get('/admin/production'),
  getUserHistory: (id) => api.get(`/admin/users/${id}/history`),
  getAllSupportRequests: (status) => {
    const params = status ? `?status=${status}` : '';
    return api.get(`/admin/support${params}`);
  },
  updateSupportRequest: (id, data) => api.put(`/admin/support/${id}`, data),
};

export default adminService;
