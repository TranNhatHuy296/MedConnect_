const sequelize = require('../config/database');
const User = require('./User');
const Patient = require('./Patient');
const Prescription = require('./Prescription');
const Medicine = require('./Medicine');
const MedicineSchedule = require('./MedicineSchedule');
const MedicationLog = require('./MedicationLog');
const Notification = require('./Notification');
const DrugReference = require('./DrugReference');


// User -> Patient (doctor manages patients)
User.hasMany(Patient, { foreignKey: 'doctor_id', as: 'patients' });
Patient.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

// User -> Patient (patient has user account)
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patientProfile' });
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Doctor -> Prescription
User.hasMany(Prescription, { foreignKey: 'doctor_id', as: 'prescriptions' });
Prescription.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

// Patient -> Prescription
Patient.hasMany(Prescription, { foreignKey: 'patient_id', as: 'prescriptions' });
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Prescription -> Medicine
Prescription.hasMany(Medicine, { foreignKey: 'prescription_id', as: 'medicines' });
Medicine.belongsTo(Prescription, { foreignKey: 'prescription_id', as: 'prescription' });

// Medicine -> MedicineSchedule
Medicine.hasMany(MedicineSchedule, { foreignKey: 'medicine_id', as: 'schedules' });
MedicineSchedule.belongsTo(Medicine, { foreignKey: 'medicine_id', as: 'medicine' });

// MedicineSchedule -> MedicationLog
MedicineSchedule.hasMany(MedicationLog, { foreignKey: 'medicine_schedule_id', as: 'logs' });
MedicationLog.belongsTo(MedicineSchedule, { foreignKey: 'medicine_schedule_id', as: 'schedule' });

// Patient -> MedicationLog
Patient.hasMany(MedicationLog, { foreignKey: 'patient_id', as: 'medicationLogs' });
MedicationLog.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// User -> Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Prescription -> Notification
Prescription.hasMany(Notification, { foreignKey: 'prescription_id', as: 'notifications' });
Notification.belongsTo(Prescription, { foreignKey: 'prescription_id', as: 'prescription' });

module.exports = {
  sequelize,
  User,
  Patient,
  Prescription,
  Medicine,
  MedicineSchedule,
  MedicationLog,
  Notification,
  DrugReference,
};
