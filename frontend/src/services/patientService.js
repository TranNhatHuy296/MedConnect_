import api from './api';


export const patientService = {
  getDashboard: () => api.get('/patient/dashboard'),
  getPrescriptions: () => api.get('/patient/prescriptions'),
  getPrescriptionDetail: (id) => api.get(`/patient/prescriptions/${id}`),
  getSchedule: (date) => api.get('/patient/schedule', { params: { date } }),
  getScheduleMonth: (month) => api.get('/patient/schedule-month', { params: { month } }),
  confirmDose: (logId) => api.post(`/patient/confirm/${logId}`),
  getNotifications: () => api.get('/patient/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/notifications/read-all'),
};
