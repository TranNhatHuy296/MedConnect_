const express = require('express');
const { authenticate } = require('../middlewares/auth');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const { Notification, Prescription } = require('../models');
const { body, param, query } = require('express-validator');


const router = express.Router();

// Tất cả routes yêu cầu đăng nhập (cả doctor và patient)
router.use(authenticate);

// ============================================================
// GET /api/notifications — danh sách thông báo (lọc type, isRead, pagination)
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    const { type, isRead, patient_id, page = 1, limit = 20 } = req.query;
    const result = await notificationService.getNotifications(req.user.id, {
      type,
      isRead,
      patientId: patient_id,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================================
// GET /api/notifications/unread-count — số thông báo chưa đọc
// ============================================================
router.get('/unread-count', async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// PUT /api/notifications/read-all — đánh dấu tất cả đã đọc
// ============================================================
router.put('/read-all', async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.json({ message: 'Đã đánh dấu tất cả thông báo đã đọc', ...result });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// GET /api/notifications/:id — chi tiết 1 thông báo
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: parseInt(req.params.id), user_id: req.user.id },
    });
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    res.json({ notification });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// PUT /api/notifications/:id/read — đánh dấu 1 thông báo đã đọc
// ============================================================
router.put('/:id/read', async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      parseInt(req.params.id),
      req.user.id
    );
    res.json({ message: 'Đã đánh dấu đã đọc', notification });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// POST /api/notifications/:id/resend — gửi lại thông báo (chỉ khi failed)
// ============================================================
router.post('/:id/resend', async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: parseInt(req.params.id), user_id: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    if (notification.send_status !== 'failed') {
      return res.status(400).json({ message: 'Chỉ có thể gửi lại thông báo bị lỗi' });
    }

    // Gửi lại email
    const result = await emailService.sendEmail(
      req.user.email,
      `[MedConnect] ${notification.title}`,
      notification.message
    );

    if (result.success) {
      await notification.update({ send_status: 'sent' });
      return res.json({ message: 'Đã gửi lại thông báo thành công', notification });
    } else {
      return res.status(500).json({ message: 'Gửi lại thất bại', error: result.error });
    }
  } catch (error) {
    next(error);
  }
});

// ============================================================
// PUT /api/prescriptions/:id/notification-settings — cập nhật cài đặt thông báo
// ============================================================
const notificationSettingsRouter = express.Router();
notificationSettingsRouter.use(authenticate);

notificationSettingsRouter.put('/:id/notification-settings', [
  body('notification_email').optional().isBoolean().withMessage('notification_email phải là boolean'),
  body('notify_minutes_before').optional().isInt({ min: 0, max: 120 }).withMessage('notify_minutes_before phải từ 0-120'),
  body('max_reminders').optional().isInt({ min: 1, max: 10 }).withMessage('max_reminders phải từ 1-10'),
  body('notify_doctor_on_confirm').optional().isBoolean().withMessage('notify_doctor_on_confirm phải là boolean'),
  body('notify_doctor_on_miss').optional().isBoolean().withMessage('notify_doctor_on_miss phải là boolean'),
  body('google_calendar_synced').optional().isBoolean().withMessage('google_calendar_synced phải là boolean'),
], async (req, res, next) => {
  try {
    const prescription = await Prescription.findByPk(parseInt(req.params.id));

    if (!prescription) {
      return res.status(404).json({ message: 'Không tìm thấy đơn thuốc' });
    }

    // Chỉ bác sĩ tạo đơn thuốc mới được cập nhật
    if (prescription.doctor_id !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật đơn thuốc này' });
    }

    const allowedFields = [
      'notification_email',
      'notify_minutes_before',
      'max_reminders',
      'notify_doctor_on_confirm',
      'notify_doctor_on_miss',
      'google_calendar_synced',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.google_calendar_synced === true && !prescription.google_calendar_synced) {
      updateData.google_calendar_synced_at = new Date();
    }

    await prescription.update(updateData);

    res.json({
      message: 'Đã cập nhật cài đặt thông báo',
      prescription: {
        id: prescription.id,
        notification_email: prescription.notification_email,
        notify_minutes_before: prescription.notify_minutes_before,
        max_reminders: prescription.max_reminders,
        notify_doctor_on_confirm: prescription.notify_doctor_on_confirm,
        notify_doctor_on_miss: prescription.notify_doctor_on_miss,
        google_calendar_synced: prescription.google_calendar_synced,
        google_calendar_synced_at: prescription.google_calendar_synced_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { notificationRouter: router, notificationSettingsRouter };
