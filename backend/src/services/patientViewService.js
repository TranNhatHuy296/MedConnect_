const { Op } = require('sequelize');

const {
  Patient,
  Prescription,
  Medicine,
  MedicineSchedule,
  MedicationLog,
  Notification,
  User,
} = require('../models');
const notificationService = require('./notificationService');
const emailService = require('./emailService');

const getPatientByUserId = async (userId) => {
  const patient = await Patient.findOne({ where: { user_id: userId } });
  if (!patient) {
    const error = new Error('Không tìm thấy hồ sơ bệnh nhân');
    error.statusCode = 404;
    throw error;
  }
  return patient;
};

const getDashboard = async (userId, date) => {
  const patient = await getPatientByUserId(userId);
  const todayStr = date || new Date().toISOString().split('T')[0];

  const todayLogs = await MedicationLog.findAll({
    where: {
      patient_id: patient.id,
      scheduled_date: todayStr,
    },
    include: [
      {
        model: MedicineSchedule,
        as: 'schedule',
        include: [
          {
            model: Medicine,
            as: 'medicine',
            attributes: ['id', 'name', 'dosage', 'unit'],
          },
        ],
      },
    ],
    order: [['scheduled_time', 'ASC']],
  });

  const total = todayLogs.length;
  const taken = todayLogs.filter((l) => l.status === 'taken').length;
  const missed = todayLogs.filter((l) => l.status === 'missed').length;
  const pending = total - taken - missed;

  // Count active prescriptions
  const totalPrescriptions = await Prescription.count({
    where: { patient_id: patient.id, status: 'active' },
  });

  // Count unread notifications
  const unreadNotifications = await Notification.count({
    where: { user_id: userId, is_read: false },
  });

  return {
    patient: {
      id: patient.id,
      full_name: patient.full_name,
    },
    today: todayStr,
    summary: { total, taken, missed, pending },
    logs: todayLogs,
    totalPrescriptions,
    unreadNotifications,
  };
};

const getPrescriptions = async (userId) => {
  const patient = await getPatientByUserId(userId);

  const prescriptions = await Prescription.findAll({
    where: {
      patient_id: patient.id,
    },
    include: [
      {
        model: Medicine,
        as: 'medicines',
        include: [{ model: MedicineSchedule, as: 'schedules' }],
      },
      { model: User, as: 'doctor', attributes: ['id', 'full_name', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  // Tự cập nhật status: đơn thuốc có end_date trong quá khứ -> completed
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const toComplete = [];
  for (const p of prescriptions) {
    if (p.status === 'active' && p.end_date) {
      const end = new Date(p.end_date);
      end.setHours(23, 59, 59, 999);
      if (end < today) toComplete.push(p.id);
    }
  }
  if (toComplete.length > 0) {
    await Prescription.update(
      { status: 'completed' },
      { where: { id: { [Op.in]: toComplete } } }
    );
    for (const p of prescriptions) {
      if (toComplete.includes(p.id)) p.status = 'completed';
    }
  }

  return prescriptions;
};

const getSchedule = async (userId, date) => {
  const patient = await getPatientByUserId(userId);
  const todayStr = date || new Date().toISOString().split('T')[0];

  const logs = await MedicationLog.findAll({
    where: {
      patient_id: patient.id,
      scheduled_date: todayStr,
    },
    include: [
      {
        model: MedicineSchedule,
        as: 'schedule',
        include: [
          {
            model: Medicine,
            as: 'medicine',
            attributes: ['id', 'name', 'dosage', 'unit'],
            include: [
              {
                model: Prescription,
                as: 'prescription',
                attributes: ['id', 'notes', 'start_date', 'end_date'],
              },
            ],
          },
        ],
      },
    ],
    order: [['scheduled_time', 'ASC']],
  });

  return logs;
};

const confirmMedication = async (userId, logId) => {
  const patient = await getPatientByUserId(userId);

  const log = await MedicationLog.findOne({
    where: { id: logId, patient_id: patient.id },
  });

  if (!log) {
    const error = new Error('Không tìm thấy lịch uống thuốc');
    error.statusCode = 404;
    throw error;
  }

  if (log.status === 'taken') {
    const error = new Error('Đã xác nhận uống thuốc trước đó');
    error.statusCode = 400;
    throw error;
  }

  await log.update({
    status: 'taken',
    taken_at: new Date(),
    confirmed_by: 'patient',
  });

  // Tạo notification xác nhận cho bác sĩ
  try {
    const schedule = await MedicineSchedule.findByPk(log.medicine_schedule_id, {
      include: [
        {
          model: Medicine,
          as: 'medicine',
          include: [
            {
              model: Prescription,
              as: 'prescription',
              include: [
                { model: User, as: 'doctor' },
                { model: Patient, as: 'patient' },
              ],
            },
          ],
        },
      ],
    });

    if (schedule && schedule.medicine && schedule.medicine.prescription) {
      const medicine = schedule.medicine;
      const prescription = medicine.prescription;
      const doctor = prescription.doctor;
      const patientInfo = prescription.patient;

      if (doctor && prescription.notify_doctor_on_confirm) {
        const title = `Xác nhận uống thuốc: ${medicine.name}`;
        const message = `Bệnh nhân ${patientInfo.full_name} đã xác nhận uống ${medicine.name} (${medicine.dosage} ${medicine.unit}) lúc ${new Date().toLocaleString('vi-VN')}.`;

        // Thông báo in-app cho bác sĩ
        await notificationService.createNotification({
          userId: doctor.id,
          type: 'confirmation',
          title,
          message,
          channel: 'in_app',
          prescriptionId: prescription.id,
          medicineId: medicine.id,
          patientId: patientInfo.id,
        });

        // Gửi email cho bác sĩ
        if (doctor.email && prescription.notification_email) {
          const html = emailService.confirmationTemplate({
            doctorName: doctor.full_name,
            patientName: patientInfo.full_name,
            medicineName: medicine.name,
            dosage: medicine.dosage,
            unit: medicine.unit,
            takenAt: new Date().toLocaleString('vi-VN'),
          });
          await emailService.sendEmail(doctor.email, `[MedConnect] ${title}`, html);
        }
      }
    }
  } catch (notifyErr) {
    console.error('[PatientView] Lỗi gửi thông báo xác nhận:', notifyErr.message);
  }

  return log;
};

const getNotifications = async (userId, { page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Notification.findAndCountAll({
    where: { user_id: userId },
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return {
    notifications: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getScheduleMonth = async (userId, month) => {
  const patient = await getPatientByUserId(userId);

  // month format: YYYY-MM
  const [year, mon] = month.split('-').map(Number);
  const startDate = `${year}-${String(mon).padStart(2, '0')}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const endDate = `${year}-${String(mon).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const logs = await MedicationLog.findAll({
    where: {
      patient_id: patient.id,
      scheduled_date: {
        [Op.between]: [startDate, endDate],
      },
    },
    include: [
      {
        model: MedicineSchedule,
        as: 'schedule',
        include: [
          {
            model: Medicine,
            as: 'medicine',
            attributes: ['id', 'name', 'dosage', 'unit'],
          },
        ],
      },
    ],
    order: [['scheduled_date', 'ASC'], ['scheduled_time', 'ASC']],
  });

  return logs;
};

module.exports = {
  getDashboard,
  getPrescriptions,
  getSchedule,
  getScheduleMonth,
  confirmMedication,
  getNotifications,
};
