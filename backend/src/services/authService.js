const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');


const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const register = async ({ full_name, email, password, phone, role }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const error = new Error('Email đã được sử dụng');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ full_name, email, password, phone, role });
  return { user: user.toJSON() };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Email hoặc mật khẩu không chính xác');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Email hoặc mật khẩu không chính xác');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);
  return { user: user.toJSON(), token };
};

const changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error('Tài khoản không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    const error = new Error('Mật khẩu cũ không chính xác');
    error.statusCode = 400;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return { message: 'Đổi mật khẩu thành công' };
};

const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Email không tồn tại trong hệ thống');
    error.statusCode = 404;
    throw error;
  }

  // Tạo mật khẩu mới random 8 ký tự
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let newPassword = '';
  for (let i = 0; i < 8; i++) {
    newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // Gửi email mật khẩu mới
  try {
    const emailService = require('./emailService');
    const html = emailService.resetPasswordTemplate({
      userName: user.full_name,
      email: user.email,
      newPassword,
    });
    await emailService.sendEmail(email, '[MedConnect] Mật khẩu mới của bạn', html);
  } catch (emailErr) {
    console.error('Lỗi gửi email reset password:', emailErr.message);
  }

  return { message: 'Mật khẩu mới đã được gửi đến email của bạn' };
};

module.exports = { register, login, changePassword, forgotPassword };
