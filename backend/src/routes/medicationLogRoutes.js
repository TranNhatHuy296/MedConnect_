const express = require('express');
const medicationLogController = require('../controllers/medicationLogController');
const { authenticate, authorize } = require('../middlewares/auth');


const router = express.Router();

// All routes require doctor authentication
router.use(authenticate, authorize('doctor'));

// GET /api/medication-logs — danh sách lịch uống thuốc (filter: patient_id, start_date, end_date, status)
router.get('/', medicationLogController.getMedicationLogs);

// GET /api/medication-logs/calendar — dữ liệu cho giao diện lịch
router.get('/calendar', medicationLogController.getCalendarData);

module.exports = router;
