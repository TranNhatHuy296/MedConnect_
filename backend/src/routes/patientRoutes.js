const express = require('express');
const { body } = require('express-validator');
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middlewares/auth');


const router = express.Router();

// All routes require doctor authentication
router.use(authenticate, authorize('doctor'));

// GET /api/patients — danh sách bệnh nhân (search by name/phone)
router.get('/', patientController.getPatients);

// GET /api/patients/:id — chi tiết bệnh nhân kèm đơn thuốc
router.get('/:id', patientController.getPatientById);

// GET /api/patients/:id/medication-history — lịch sử uống thuốc của bệnh nhân
router.get('/:id/medication-history', patientController.getMedicationHistory);

// POST /api/patients — thêm bệnh nhân mới
router.post('/', [
  body('full_name').notEmpty().withMessage('Vui lòng nhập họ tên bệnh nhân')
    .isLength({ min: 2 }).withMessage('Họ tên phải có ít nhất 2 ký tự'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email không hợp lệ'),
  body('date_of_birth').optional({ checkFalsy: true }).isDate().withMessage('Ngày sinh không hợp lệ')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Ngày sinh không được là ngày tương lai');
      }
      return true;
    }),
  body('gender').optional({ checkFalsy: true }).isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),
  body('phone').optional({ checkFalsy: true }).matches(/^0[0-9]{9}$/).withMessage('Số điện thoại phải gồm 10 số, bắt đầu bằng 0'),
], patientController.createPatient);

// PUT /api/patients/:id — cập nhật bệnh nhân
router.put('/:id', [
  body('full_name').optional().notEmpty().withMessage('Họ tên không được để trống')
    .isLength({ min: 2 }).withMessage('Họ tên phải có ít nhất 2 ký tự'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email không hợp lệ'),
  body('date_of_birth').optional({ checkFalsy: true }).isDate().withMessage('Ngày sinh không hợp lệ')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Ngày sinh không được là ngày tương lai');
      }
      return true;
    }),
  body('gender').optional({ checkFalsy: true }).isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),
  body('phone').optional({ checkFalsy: true }).matches(/^0[0-9]{9}$/).withMessage('Số điện thoại phải gồm 10 số, bắt đầu bằng 0'),
  body('treatment_status').optional().isIn(['treating', 'completed', 'stopped', 'urgent']).withMessage('Trạng thái điều trị không hợp lệ'),
], patientController.updatePatient);

// DELETE /api/patients/:id — xóa mềm bệnh nhân
router.delete('/:id', patientController.deletePatient);

module.exports = router;
