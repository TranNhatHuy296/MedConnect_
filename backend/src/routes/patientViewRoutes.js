const express = require('express');
const patientViewController = require('../controllers/patientViewController');
const { authenticate, authorize } = require('../middlewares/auth');


const router = express.Router();

// All routes require patient authentication
router.use(authenticate, authorize('patient'));

// GET /api/patient/dashboard — tổng quan hôm nay cho bệnh nhân
router.get('/dashboard', patientViewController.getDashboard);

// GET /api/patient/prescriptions — đơn thuốc đang áp dụng
router.get('/prescriptions', patientViewController.getPrescriptions);

// GET /api/patient/schedule — lịch uống thuốc hôm nay
router.get('/schedule', patientViewController.getSchedule);

// GET /api/patient/schedule-month — lịch uống thuốc theo tháng
router.get('/schedule-month', patientViewController.getScheduleMonth);

// POST /api/patient/confirm/:logId — xác nhận đã uống thuốc
router.post('/confirm/:logId', patientViewController.confirmMedication);

// GET /api/patient/notifications — danh sách thông báo
router.get('/notifications', patientViewController.getNotifications);

module.exports = router;
