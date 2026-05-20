import api from './api';


export const notificationService = {
  getNotifications(params = {}) {
    return api.get('/notifications', { params });
  },

  getUnreadCount() {
    return api.get('/notifications/unread-count');
  },

  markAsRead(id) {
    return api.put(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return api.put('/notifications/read-all');
  },

  resendNotification(id) {
    return api.post(`/notifications/${id}/resend`);
  },

  getNotificationById(id) {
    return api.get(`/notifications/${id}`);
  },

  getNotificationSettings(prescriptionId) {
    return api.get(`/prescriptions/${prescriptionId}`);
  },

  updateNotificationSettings(prescriptionId, data) {
    return api.put(`/prescriptions/${prescriptionId}/notification-settings`, data);
  },
};

export default notificationService;
