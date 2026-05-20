const { Op } = require('sequelize');
const { Notification } = require('../models');


// Tham chiếu tới socketService – được set sau khi server khởi động
let socketService = null;

const setSocketService = (svc) => {
  socketService = svc;
};

// ============================================================
// Tạo thông báo mới
// ============================================================
const createNotification = async ({
  userId,
  type,
  title,
  message,
  channel = 'in_app',
  sendStatus = 'sent',
  prescriptionId = null,
  medicineId = null,
  patientId = null,
}) => {
  const notification = await Notification.create({
    user_id: userId,
    type,
    title,
    message,
    channel,
    send_status: sendStatus,
    prescription_id: prescriptionId,
    medicine_id: medicineId,
    patient_id: patientId,
  });

  // Emit realtime qua Socket.IO nếu có
  if (socketService) {
    socketService.emitToUser(userId, 'new_notification', notification.toJSON());
    // Cập nhật badge số thông báo chưa đọc
    const unread = await getUnreadCount(userId);
    socketService.emitToUser(userId, 'unread_count', { count: unread });
  }

  return notification;
};

// ============================================================
// Lấy danh sách thông báo (có lọc, phân trang)
// ============================================================
const getNotifications = async (userId, { type, isRead, patientId, page = 1, limit = 20 }) => {
  const where = { user_id: userId };

  if (type) {
    where.type = type;
  }
  if (isRead !== undefined && isRead !== null && isRead !== '') {
    where.is_read = isRead === 'true' || isRead === true;
  }
  if (patientId !== undefined && patientId !== null && patientId !== '') {
    where.patient_id = parseInt(patientId);
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Notification.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return {
    notifications: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

// ============================================================
// Đánh dấu đã đọc
// ============================================================
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, user_id: userId },
  });

  if (!notification) {
    const error = new Error('Không tìm thấy thông báo');
    error.statusCode = 404;
    throw error;
  }

  await notification.update({ is_read: true });

  // Emit realtime
  if (socketService) {
    socketService.emitToUser(userId, 'notification_read', { id: notificationId });
    const unread = await getUnreadCount(userId);
    socketService.emitToUser(userId, 'unread_count', { count: unread });
  }

  return notification;
};

// ============================================================
// Đánh dấu tất cả đã đọc
// ============================================================
const markAllAsRead = async (userId) => {
  const [updatedCount] = await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } }
  );

  // Emit realtime
  if (socketService) {
    socketService.emitToUser(userId, 'notification_read', { all: true });
    socketService.emitToUser(userId, 'unread_count', { count: 0 });
  }

  return { updated: updatedCount };
};

// ============================================================
// Đếm số thông báo chưa đọc
// ============================================================
const getUnreadCount = async (userId) => {
  const count = await Notification.count({
    where: { user_id: userId, is_read: false },
  });
  return count;
};

module.exports = {
  setSocketService,
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
