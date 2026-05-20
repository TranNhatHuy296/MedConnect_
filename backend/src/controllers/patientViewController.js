const patientViewService = require('../services/patientViewService');
const getDashboard = async (req, res, next) => {
  try {
    const result = await patientViewService.getDashboard(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await patientViewService.getPrescriptions(req.user.id);
    res.json({ prescriptions });
  } catch (error) {
    next(error);
  }
};

const getSchedule = async (req, res, next) => {
  try {
    const schedule = await patientViewService.getSchedule(req.user.id, req.query.date);
    res.json({ schedule });
  } catch (error) {
    next(error);
  }
};

const confirmMedication = async (req, res, next) => {
  try {
    const log = await patientViewService.confirmMedication(req.user.id, req.params.logId);
    res.json({ message: 'Xác nhận uống thuốc thành công', log });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const result = await patientViewService.getNotifications(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getScheduleMonth = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const logs = await patientViewService.getScheduleMonth(req.user.id, month);
    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getPrescriptions, getSchedule, getScheduleMonth, confirmMedication, getNotifications };
