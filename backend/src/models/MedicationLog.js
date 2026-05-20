const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const MedicationLog = sequelize.define('MedicationLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  medicine_schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  scheduled_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  scheduled_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'taken', 'missed'),
    defaultValue: 'pending',
  },
  taken_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  confirmed_by: {
    type: DataTypes.ENUM('patient', 'app'),
    allowNull: true,
  },
}, {
  tableName: 'medication_logs',
});

module.exports = MedicationLog;
