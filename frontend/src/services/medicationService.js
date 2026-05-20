import api from './api';


export const medicationService = {
  getSchedule: (params) => api.get('/medication-logs', { params }),
  getByDate: (date) => api.get('/medication-logs', { params: { start_date: date, end_date: date } }),
  getByWeek: (paramsOrStartDate) => {
    const params = typeof paramsOrStartDate === 'string'
      ? { start_date: paramsOrStartDate }
      : (paramsOrStartDate || {});
    return api.get('/medication-logs/calendar', { params });
  },
  updateStatus: (id, status) => api.put(`/medication-logs/${id}/status`, { status }),
};
