// -----------------------------------------
// Report Service
// API calls for dashboard and report data
// -----------------------------------------
import api from './api';

const reportService = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getWeeklySummary: () => api.get('/reports/weekly'),
  getMonthlySummary: () => api.get('/reports/monthly'),
};

export default reportService;
