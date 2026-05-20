const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { Patient, Prescription, Medicine, MedicineSchedule, MedicationLog, User } = require('../models');
const emailService = require('./emailService');


const getPatients = async (doctorId, { search, page = 1, limit = 20 }) => {
  const where = { doctor_id: doctorId };

  if (search) {
    where[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await Patient.findAndCountAll({
    where,
    include: [
      {
        model: Prescription,
        as: 'prescriptions',
        attributes: ['id', 'status'],
        required: false,
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  return {
    patients: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getPatientById = async (doctorId, patientId) => {
  const patient = await Patient.findOne({
    where: { id: patientId, doctor_id: doctorId },
    include: [
      {
        model: Prescription,
        as: 'prescriptions',
        include: [
          {
            model: Medicine,
            as: 'medicines',
            include: [{ model: MedicineSchedule, as: 'schedules' }],
          },
        ],
      },
    ],
  });

  if (!patient) {
    const error = new Error('Không tìm thấy bệnh nhân');
    error.statusCode = 404;
    throw error;
  }

  return patient;
};

const createPatient = async (doctorId, data) => {
  let userId = null;

  // Tự động tạo tài khoản đăng nhập cho bệnh nhân nếu có email
  if (data.email) {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      if (existingUser.role !== 'patient') {
        const error = new Error('Email này đã được sử dụng cho tài khoản bác sĩ. Vui lòng dùng email khác cho bệnh nhân.');
        error.statusCode = 409;
        throw error;
      }
      userId = existingUser.id;
    } else {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const newUser = await User.create({
        full_name: data.full_name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone || null,
        role: 'patient',
      }, { hooks: false });
      userId = newUser.id;
    }
  }

  const patient = await Patient.create({
    full_name: data.full_name,
    date_of_birth: data.date_of_birth,
    gender: data.gender,
    phone: data.phone,
    address: data.address,
    diagnosis: data.diagnosis,
    notes: data.notes,
    doctor_id: doctorId,
    user_id: userId,
  });

  // Gửi email thông báo tài khoản cho bệnh nhân nếu có email và là user mới
  if (data.email && userId) {
    try {
      // Lấy tên bác sĩ
      let doctorName = 'bác sĩ của bạn';
      const doctor = await User.findByPk(doctorId);
      if (doctor) {
        doctorName = doctor.full_name || doctor.name || doctorName;
      }

      const html = emailService.welcomeTemplate({
        patientName: data.full_name,
        email: data.email,
        password: '123456',
        doctorName,
      });
      await emailService.sendEmail(data.email, '[MedConnect] Tài khoản của bạn đã được tạo', html);
    } catch (emailErr) {
      console.error('[PatientService] Lỗi gửi email chào mừng:', emailErr.message);
    }
  }

  return patient;
};

const updatePatient = async (doctorId, patientId, data) => {
  const patient = await Patient.findOne({
    where: { id: patientId, doctor_id: doctorId },
  });

  if (!patient) {
    const error = new Error('Không tìm thấy bệnh nhân');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    'full_name', 'date_of_birth', 'gender', 'phone',
    'address', 'diagnosis', 'notes', 'treatment_status',
  ];
  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  await patient.update(updateData);
  return patient;
};

const deletePatient = async (doctorId, patientId) => {
  const patient = await Patient.findOne({
    where: { id: patientId, doctor_id: doctorId },
  });

  if (!patient) {
    const error = new Error('Không tìm thấy bệnh nhân');
    error.statusCode = 404;
    throw error;
  }

  await patient.destroy(); // soft delete via paranoid
  return { message: 'Xóa bệnh nhân thành công' };
};

const getMedicationHistory = async (doctorId, patientId, { limit = 100 } = {}) => {
  const patient = await Patient.findOne({
    where: { id: patientId, doctor_id: doctorId },
  });
  if (!patient) {
    const error = new Error('Không tìm thấy bệnh nhân');
    error.statusCode = 404;
    throw error;
  }

  const logs = await MedicationLog.findAll({
    where: { patient_id: patientId },
    include: [
      {
        model: MedicineSchedule,
        as: 'schedule',
        include: [{ model: Medicine, as: 'medicine', attributes: ['id', 'name', 'dosage', 'unit'] }],
      },
    ],
    order: [['scheduled_date', 'DESC'], ['scheduled_time', 'DESC']],
    limit: parseInt(limit),
  });

  return logs;
};

module.exports = { getPatients, getPatientById, createPatient, updatePatient, deletePatient, getMedicationHistory };
