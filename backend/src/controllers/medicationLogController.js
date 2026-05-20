const medicationLogService = require('../services/medicationLogService');
const getMedicationLogs = async (req, res, next) => {
  try {
    const result = await medicationLogService.getMedicationLogs(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getCalendarData = async (req, res, next) => {
  try {
    const result = await medicationLogService.getCalendarData(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMedicationLogs, getCalendarData };
