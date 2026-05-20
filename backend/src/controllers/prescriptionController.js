const { validationResult } = require('express-validator');
const prescriptionService = require('../services/prescriptionService');
const getPrescriptions = async (req, res, next) => {
  try {
    const result = await prescriptionService.getPrescriptions(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.getPrescriptionById(req.user.id, req.params.id);
    res.json({ prescription });
  } catch (error) {
    next(error);
  }
};

const createPrescription = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
    }
    const prescription = await prescriptionService.createPrescription(req.user.id, req.body);
    res.status(201).json({ message: 'Tạo đơn thuốc thành công', prescription });
  } catch (error) {
    next(error);
  }
};

const updatePrescription = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
    }
    const prescription = await prescriptionService.updatePrescription(req.user.id, req.params.id, req.body);
    res.json({ message: 'Cập nhật đơn thuốc thành công', prescription });
  } catch (error) {
    next(error);
  }
};

const deletePrescription = async (req, res, next) => {
  try {
    const result = await prescriptionService.deletePrescription(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const markGoogleCalendarSynced = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.markGoogleCalendarSynced(req.user.id, req.params.id);
    res.json({ message: 'Đã đánh dấu đồng bộ Google Calendar', prescription });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  markGoogleCalendarSynced,
};
