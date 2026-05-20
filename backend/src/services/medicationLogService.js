const { Op } = require('sequelize');
const {
  MedicationLog,
  MedicineSchedule,
  Medicine,
  Prescription,
  Patient,
} = require('../models');


const getMedicationLogs = async (doctorId, { patient_id, start_date, end_date, status, page = 1, limit = 50 }) => {
  // Get patients of this doctor
  const patientWhere = { doctor_id: doctorId };
  if (patient_id) patientWhere.id = patient_id;

  const patients = await Patient.findAll({
    where: patientWhere,
    attributes: ['id'],
  });
  const patientIds = patients.map((p) => p.id);

  if (patientIds.length === 0) {
    return { logs: [], pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 } };
  }

  const where = { patient_id: { [Op.in]: patientIds } };
  if (start_date && end_date) {
    where.scheduled_date = { [Op.between]: [start_date, end_date] };
  } else if (start_date) {
    where.scheduled_date = { [Op.gte]: start_date };
  } else if (end_date) {
    where.scheduled_date = { [Op.lte]: end_date };
  }
  if (status) where.status = status;

  const offset = (page - 1) * limit;
  const { count, rows } = await MedicationLog.findAndCountAll({
    where,
    include: [
      {
        model: MedicineSchedule,
        as: 'schedule',
        include: [
          {
            model: Medicine,
            as: 'medicine',
            include: [
              {
                model: Prescription,
                as: 'prescription',
                attributes: ['id', 'start_date', 'end_date', 'status'],
              },
            ],
          },
        ],
      },
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name', 'phone'],
      },
    ],
    order: [['scheduled_date', 'DESC'], ['scheduled_time', 'ASC']],
    limit: parseInt(limit),
    offset,
  });

  return {
    logs: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getCalendarData = async (doctorId, { patient_id, start_date, end_date }) => {
  const patientWhere = { doctor_id: doctorId };
  if (patient_id) patientWhere.id = patient_id;

  const patients = await Patient.findAll({
    where: patientWhere,
    attributes: ['id'],
  });
  const patientIds = patients.map((p) => p.id);

  // Mặc định lấy 7 ngày kể từ start_date nếu không có end_date (week view)
  let effectiveEnd = end_date;
  if (start_date && !end_date) {
    const s = new Date(start_date);
    s.setDate(s.getDate() + 6);
    effectiveEnd = s.toISOString().split('T')[0];
  }

  if (patientIds.length === 0) {
    return { dates: {}, summary: [] };
  }

  const where = {
    patient_id: { [Op.in]: patientIds },
  };
  if (start_date && effectiveEnd) {
    where.scheduled_date = { [Op.between]: [start_date, effectiveEnd] };
  }

  const logs = await MedicationLog.findAll({
    where,
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
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name'],
      },
    ],
    order: [['scheduled_date', 'ASC'], ['scheduled_time', 'ASC']],
  });

  // Group by date — dạng { dates: { 'YYYY-MM-DD': [log, log, ...] }, summary: [...] }
  const dates = {};
  const summary = {};
  for (const log of logs) {
    const date = log.scheduled_date;
    if (!dates[date]) dates[date] = [];
    if (!summary[date]) summary[date] = { date, total: 0, taken: 0, missed: 0, pending: 0 };
    dates[date].push(log);
    summary[date].total++;
    summary[date][log.status]++;
  }

  return { dates, summary: Object.values(summary) };
};

module.exports = { getMedicationLogs, getCalendarData };
