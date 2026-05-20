import api from './api';


export const prescriptionService = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  getByPatient: (patientId) => api.get('/prescriptions', { params: { patient_id: patientId } }),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  delete: (id) => api.delete(`/prescriptions/${id}`),
  markGoogleCalendarSynced: (id) => api.post(`/prescriptions/${id}/mark-synced`),
};
