import api from './api';


export const doctorPatientService = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  search: (query) => api.get('/patients/search', { params: { q: query } }),
  getMedicationHistory: (id, params) => api.get(`/patients/${id}/medication-history`, { params }),
};
