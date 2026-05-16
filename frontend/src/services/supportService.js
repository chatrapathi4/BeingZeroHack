// -----------------------------------------
// Support Service
// API calls for user support requests
// -----------------------------------------
import api from './api';

const supportService = {
  getMyRequests: () => api.get('/support'),
  createRequest: (data) => api.post('/support', data),
  getRequestById: (id) => api.get(`/support/${id}`),
};

export default supportService;
