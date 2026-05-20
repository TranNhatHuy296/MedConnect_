const { validationResult } = require('express-validator');
const doctorService = require('../services/doctorService');

const getProfile = async (req, res, next) => {
  try {
    const profile = await doctorService.getProfile(req.user.id);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
    }
    const profile = await doctorService.updateProfile(req.user.id, req.body);
    res.json({ message: 'Cập nhật hồ sơ thành công', profile });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await doctorService.getDashboard(req.user.id);
    res.json({ dashboard });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const result = await doctorService.getNotifications(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn ảnh để upload' });
    }
    const avatarUrl = req.file.path;
    const profile = await doctorService.updateAvatar(req.user.id, avatarUrl);
    res.json({ message: 'Cập nhật ảnh đại diện thành công', avatar: avatarUrl, profile });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getDashboard, getNotifications, uploadAvatar };
