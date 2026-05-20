import api from './api';


export const doctorService = {
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (data) => api.put('/doctor/profile', data),
  getDashboard: () => api.get('/doctor/dashboard'),
  uploadAvatar: (formData) => api.post('/doctor/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
