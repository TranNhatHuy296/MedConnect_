const { Op } = require('sequelize');
const {
  User,
  Patient,
  Prescription,
  MedicationLog,
  MedicineSchedule,
  Medicine,
} = require('../models');


const getProfile = async (doctorId) => {
  const doctor = await User.findByPk(doctorId);
  if (!doctor) {
    const error = new Error('Không tìm thấy bác sĩ');
    error.statusCode = 404;
    throw error;
  }
  return doctor.toJSON();
};

const updateProfile = async (doctorId, data) => {
  const doctor = await User.findByPk(doctorId);
  if (!doctor) {
    const error = new Error('Không tìm thấy bác sĩ');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = ['department', 'specialty', 'hospital', 'license_number', 'phone', 'avatar', 'full_name', 'bio'];
  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  await doctor.update(updateData);
  await doctor.reload();
  return doctor.toJSON();
};

const getDashboard = async (doctorId) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Total patients
  const totalPatients = await Patient.count({
    where: { doctor_id: doctorId },
  });

  // Prescriptions this month
  const prescriptionsThisMonth = await Prescription.count({
    where: {
      doctor_id: doctorId,
      createdAt: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    },
  });

  // Active prescriptions
  const activePrescriptions = await Prescription.count({
    where: {
      doctor_id: doctorId,
      status: 'active',
    },
  });

  // Today's medication logs for doctor's patients
  const patients = await Patient.findAll({
    where: { doctor_id: doctorId },
    attributes: ['id'],
  });
  const patientIds = patients.map((p) => p.id);

  let todayLogs = { total: 0, taken: 0, missed: 0, pending: 0 };
  if (patientIds.length > 0) {
    const total = await MedicationLog.count({
      where: {
        patient_id: { [Op.in]: patientIds },
        scheduled_date: todayStr,
      },
    });
    const taken = await MedicationLog.count({
      where: {
        patient_id: { [Op.in]: patientIds },
        scheduled_date: todayStr,
        status: 'taken',
      },
    });
    const missed = await MedicationLog.count({
      where: {
        patient_id: { [Op.in]: patientIds },
        scheduled_date: todayStr,
        status: 'missed',
      },
    });
    todayLogs = { total, taken, missed, pending: total - taken - missed };
  }

  // Patients needing attention (missed > 2 in last 7 days)
  let patientsNeedingAttention = [];
  if (patientIds.length > 0) {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const missedCounts = await MedicationLog.findAll({
      attributes: [
        'patient_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'missedCount'],
      ],
      where: {
        patient_id: { [Op.in]: patientIds },
        status: 'missed',
        scheduled_date: { [Op.between]: [sevenDaysAgoStr, todayStr] },
      },
      group: ['patient_id'],
      having: require('sequelize').literal('COUNT(id) >= 2'),
      raw: true,
    });

    if (missedCounts.length > 0) {
      const attentionPatientIds = missedCounts.map((m) => m.patient_id);
      patientsNeedingAttention = await Patient.findAll({
        where: { id: { [Op.in]: attentionPatientIds } },
        attributes: ['id', 'full_name', 'phone'],
      });

      // Attach missed count
      patientsNeedingAttention = patientsNeedingAttention.map((p) => {
        const mc = missedCounts.find((m) => m.patient_id === p.id);
        return {
          ...p.toJSON(),
          missedCount: mc ? parseInt(mc.missedCount) : 0,
        };
      });
    }
  }

  return {
    totalPatients,
    prescriptionsThisMonth,
    activePrescriptions,
    todayLogs,
    patientsNeedingAttention,
  };
};

const getNotifications = async (doctorId, { page = 1, limit = 20 } = {}) => {
  const { Notification } = require('../models');
  const offset = (page - 1) * limit;

  const { count, rows } = await Notification.findAndCountAll({
    where: { user_id: doctorId },
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

const updateAvatar = async (doctorId, avatarUrl) => {
  const doctor = await User.findByPk(doctorId);
  if (!doctor) {
    const error = new Error('Không tìm thấy bác sĩ');
    error.statusCode = 404;
    throw error;
  }
  await doctor.update({ avatar: avatarUrl });
  return doctor.toJSON();
};

module.exports = { getProfile, updateProfile, getDashboard, getNotifications, updateAvatar };
