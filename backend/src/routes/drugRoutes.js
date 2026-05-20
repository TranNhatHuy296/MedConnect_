const express = require('express');
const drugController = require('../controllers/drugController');
const { authenticate, authorize } = require('../middlewares/auth');


const router = express.Router();

// Yeu cau dang nhap (doctor)
router.use(authenticate, authorize('doctor'));

// GET /api/drugs — danh sach thuoc tham khao
router.get('/', drugController.getAll);

// GET /api/drugs/:id — chi tiet thuoc
router.get('/:id', drugController.getById);

module.exports = router;
