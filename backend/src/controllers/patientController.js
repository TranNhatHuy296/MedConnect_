const { validationResult } = require('express-validator');
const patientService = require('../services/patientService');
const getPatients = async (req, res, next) => {
  try {
    const result = await patientService.getPatients(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(req.user.id, req.params.id);
    res.json({ patient });
  } catch (error) {
    next(error);
  }
};

const createPatient = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
    }
    const patient = await patientService.createPatient(req.user.id, req.body);
    res.status(201).json({ message: 'Thêm bệnh nhân thành công', patient });
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: errors.array() });
    }
    const patient = await patientService.updatePatient(req.user.id, req.params.id, req.body);
    res.json({ message: 'Cập nhật bệnh nhân thành công', patient });
  } catch (error) {
    next(error);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    const result = await patientService.deletePatient(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getMedicationHistory = async (req, res, next) => {
  try {
    const logs = await patientService.getMedicationHistory(req.user.id, req.params.id, req.query);
    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPatients, getPatientById, createPatient, updatePatient, deletePatient, getMedicationHistory };
