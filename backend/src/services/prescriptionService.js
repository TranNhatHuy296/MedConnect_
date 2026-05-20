const { Op } = require('sequelize');

const {
  sequelize,
  Prescription,
  Medicine,
  MedicineSchedule,
  MedicationLog,
  Patient,
} = require('../models');

// Tự đồng bộ trạng thái: nếu end_date đã qua mà status vẫn 'active' -> chuyển thành 'completed'
const autoSyncPrescriptionStatus = async (rows) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const toComplete = [];
  for (const p of rows) {
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
    for (const p of rows) {
      if (toComplete.includes(p.id)) p.status = 'completed';
    }
  }
};

const getPrescriptions = async (doctorId, { patient_id, status, page = 1, limit = 20 }) => {
  const where = { doctor_id: doctorId };
  if (patient_id) where.patient_id = patient_id;
  if (status) where.status = status;

  const offset = (page - 1) * limit;
  const { count, rows } = await Prescription.findAndCountAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'full_name', 'phone'] },
      {
        model: Medicine,
        as: 'medicines',
        include: [{ model: MedicineSchedule, as: 'schedules' }],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  await autoSyncPrescriptionStatus(rows);

  return {
    prescriptions: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getPrescriptionById = async (doctorId, prescriptionId) => {
  const prescription = await Prescription.findOne({
    where: { id: prescriptionId, doctor_id: doctorId },
    include: [
      { model: Patient, as: 'patient' },
      {
        model: Medicine,
        as: 'medicines',
        include: [{ model: MedicineSchedule, as: 'schedules' }],
      },
    ],
  });

  if (!prescription) {
    const error = new Error('Không tìm thấy đơn thuốc');
    error.statusCode = 404;
    throw error;
  }

  await autoSyncPrescriptionStatus([prescription]);

  return prescription;
};

const markGoogleCalendarSynced = async (doctorId, prescriptionId) => {
  const prescription = await Prescription.findOne({
    where: { id: prescriptionId, doctor_id: doctorId },
  });
  if (!prescription) {
    const error = new Error('Không tìm thấy đơn thuốc');
    error.statusCode = 404;
    throw error;
  }
  await prescription.update({
    google_calendar_synced: true,
    google_calendar_synced_at: new Date(),
  });
  return prescription;
};

const createPrescription = async (doctorId, data) => {
  const { medicines, ...prescriptionData } = data;

  // Verify patient belongs to this doctor
  const patient = await Patient.findOne({
    where: { id: prescriptionData.patient_id, doctor_id: doctorId },
  });
  if (!patient) {
    const error = new Error('Bệnh nhân không thuộc quyền quản lý của bạn');
    error.statusCode = 403;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    const prescription = await Prescription.create(
      { ...prescriptionData, doctor_id: doctorId },
      { transaction: t }
    );

    if (medicines && medicines.length > 0) {
      for (const med of medicines) {
        const { schedules, ...medData } = med;
        const medicine = await Medicine.create(
          { ...medData, prescription_id: prescription.id },
          { transaction: t }
        );

        if (schedules && schedules.length > 0) {
          const scheduleRecords = schedules.map((s) => ({
            ...s,
            medicine_id: medicine.id,
          }));
          await MedicineSchedule.bulkCreate(scheduleRecords, { transaction: t });
        }
      }
    }

    await t.commit();

    return getPrescriptionById(doctorId, prescription.id);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const updatePrescription = async (doctorId, prescriptionId, data) => {
  const { medicines, ...prescriptionData } = data;

  const existing = await Prescription.findOne({
    where: { id: prescriptionId, doctor_id: doctorId },
  });
  if (!existing) {
    const error = new Error('Không tìm thấy đơn thuốc');
    error.statusCode = 404;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    await existing.update(prescriptionData, { transaction: t });

    if (medicines) {
      // Remove old medicines and schedules
      const oldMedicines = await Medicine.findAll({
        where: { prescription_id: prescriptionId },
      });
      const oldMedicineIds = oldMedicines.map((m) => m.id);

      if (oldMedicineIds.length > 0) {
        await MedicineSchedule.destroy({
          where: { medicine_id: { [Op.in]: oldMedicineIds } },
          transaction: t,
        });
      }
      await Medicine.destroy({
        where: { prescription_id: prescriptionId },
        transaction: t,
      });

      // Create new medicines and schedules
      for (const med of medicines) {
        const { schedules, ...medData } = med;
        const medicine = await Medicine.create(
          { ...medData, prescription_id: prescriptionId },
          { transaction: t }
        );

        if (schedules && schedules.length > 0) {
          const scheduleRecords = schedules.map((s) => ({
            ...s,
            medicine_id: medicine.id,
          }));
          await MedicineSchedule.bulkCreate(scheduleRecords, { transaction: t });
        }
      }
    }

    await t.commit();

    return getPrescriptionById(doctorId, prescriptionId);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const deletePrescription = async (doctorId, prescriptionId) => {
  const prescription = await Prescription.findOne({
    where: { id: prescriptionId, doctor_id: doctorId },
  });
  if (!prescription) {
    const error = new Error('Không tìm thấy đơn thuốc');
    error.statusCode = 404;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    // Deactivate related schedules' pending logs
    const medicines = await Medicine.findAll({
      where: { prescription_id: prescriptionId },
    });
    const medicineIds = medicines.map((m) => m.id);

    if (medicineIds.length > 0) {
      const schedules = await MedicineSchedule.findAll({
        where: { medicine_id: { [Op.in]: medicineIds } },
      });
      const scheduleIds = schedules.map((s) => s.id);

      if (scheduleIds.length > 0) {
        // Mark pending logs as missed
        await MedicationLog.update(
          { status: 'missed' },
          {
            where: {
              medicine_schedule_id: { [Op.in]: scheduleIds },
              status: 'pending',
            },
            transaction: t,
          }
        );
      }
    }

    // Soft delete prescription
    await prescription.destroy({ transaction: t });

    await t.commit();
    return { message: 'Xóa đơn thuốc thành công' };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  markGoogleCalendarSynced,
};
