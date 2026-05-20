import api from './api';


export const drugService = {
  getAll: (params) => api.get('/drugs', { params }),
  getById: (id) => api.get(`/drugs/${id}`),
};
