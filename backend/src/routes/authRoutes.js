const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');


const router = express.Router();

router.post('/register', [
  body('full_name').notEmpty().withMessage('Vui lòng nhập họ tên'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
  body('phone').optional().isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
  body('role').isIn(['doctor', 'patient']).withMessage('Vai trò không hợp lệ'),
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu'),
], authController.login);

router.put('/change-password', authenticate, [
  body('oldPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu cũ'),
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự')
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('Mật khẩu mới phải khác mật khẩu cũ');
      }
      return true;
    }),
], authController.changePassword);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Email không hợp lệ'),
], authController.forgotPassword);

router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
