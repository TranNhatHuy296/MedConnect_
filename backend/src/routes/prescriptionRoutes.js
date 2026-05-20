const express = require('express');
const { body } = require('express-validator');
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate, authorize } = require('../middlewares/auth');


const router = express.Router();

// All routes require doctor authentication
router.use(authenticate, authorize('doctor'));

// GET /api/prescriptions — danh sách đơn thuốc (filter by patient_id, status)
router.get('/', prescriptionController.getPrescriptions);

// GET /api/prescriptions/:id — chi tiết đơn thuốc kèm medicines + schedules
router.get('/:id', prescriptionController.getPrescriptionById);

// POST /api/prescriptions — tạo đơn thuốc mới
router.post('/', [
  body('patient_id').isInt().withMessage('Vui lòng chọn bệnh nhân'),
  body('start_date').isDate().withMessage('Ngày bắt đầu không hợp lệ'),
  body('end_date').optional().isDate().withMessage('Ngày kết thúc không hợp lệ')
    .custom((value, { req }) => {
      if (value && req.body.start_date && new Date(value) < new Date(req.body.start_date)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }
      return true;
    }),
  body('medicines').isArray({ min: 1 }).withMessage('Đơn thuốc phải có ít nhất 1 loại thuốc'),
  body('medicines.*.name').notEmpty().withMessage('Tên thuốc không được để trống'),
  body('medicines.*.dosage').notEmpty().withMessage('Liều lượng không được để trống'),
  body('medicines.*.unit').notEmpty().withMessage('Đơn vị không được để trống'),
  body('medicines.*.frequency').isInt({ min: 1 }).withMessage('Số lần uống phải >= 1'),
  body('medicines.*.schedules').isArray({ min: 1 }).withMessage('Mỗi thuốc phải có ít nhất 1 lịch uống'),
  body('medicines.*.schedules.*.time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Giờ uống không hợp lệ (HH:mm)'),
  body('medicines.*.schedules.*.label').optional().isIn(['morning', 'noon', 'afternoon', 'evening']).withMessage('Nhãn thời gian không hợp lệ'),
], prescriptionController.createPrescription);

// PUT /api/prescriptions/:id — cập nhật đơn thuốc
router.put('/:id', [
  body('start_date').optional().isDate().withMessage('Ngày bắt đầu không hợp lệ'),
  body('end_date').optional().isDate().withMessage('Ngày kết thúc không hợp lệ')
    .custom((value, { req }) => {
      if (value && req.body.start_date && new Date(value) < new Date(req.body.start_date)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }
      return true;
    }),
  body('status').optional().isIn(['active', 'completed', 'cancelled']).withMessage('Trạng thái không hợp lệ'),
  body('medicines').optional().isArray({ min: 1 }).withMessage('Đơn thuốc phải có ít nhất 1 loại thuốc'),
  body('medicines.*.name').optional().notEmpty().withMessage('Tên thuốc không được để trống'),
  body('medicines.*.dosage').optional().notEmpty().withMessage('Liều lượng không được để trống'),
  body('medicines.*.unit').optional().notEmpty().withMessage('Đơn vị không được để trống'),
  body('medicines.*.frequency').optional().isInt({ min: 1 }).withMessage('Số lần uống phải >= 1'),
], prescriptionController.updatePrescription);

// POST /api/prescriptions/:id/mark-synced — đánh dấu đơn thuốc đã đồng bộ Google Calendar
router.post('/:id/mark-synced', prescriptionController.markGoogleCalendarSynced);

// DELETE /api/prescriptions/:id — xóa mềm đơn thuốc
router.delete('/:id', prescriptionController.deletePrescription);

module.exports = router;
