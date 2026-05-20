const express = require('express');
const { body } = require('express-validator');
const doctorController = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middlewares/auth');
const { upload } = require('../services/uploadService');


const router = express.Router();

// All routes require doctor authentication
router.use(authenticate, authorize('doctor'));

// GET /api/doctor/profile — xem hồ sơ bác sĩ
router.get('/profile', doctorController.getProfile);

// PUT /api/doctor/profile — cập nhật hồ sơ
router.put('/profile', [
  body('full_name').optional().notEmpty().withMessage('Họ tên không được để trống'),
  body('phone').optional().isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
  body('department').optional().isString().withMessage('Khoa không hợp lệ'),
  body('hospital').optional().isString().withMessage('Bệnh viện không hợp lệ'),
  body('license_number').optional().isString().withMessage('Số giấy phép không hợp lệ'),
], doctorController.updateProfile);

// POST /api/doctor/avatar — upload ảnh đại diện
router.post('/avatar', upload.single('avatar'), doctorController.uploadAvatar);

// GET /api/doctor/dashboard — thống kê tổng quan
router.get('/dashboard', doctorController.getDashboard);

// GET /api/doctor/notifications — danh sách thông báo
router.get('/notifications', doctorController.getNotifications);

module.exports = router;
