// -----------------------------------------
// AI Service
// API call for product image analysis
// Uses FormData for file upload
// -----------------------------------------
import api from './api';

const aiService = {
  analyzeProduct: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/ai/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default aiService;
