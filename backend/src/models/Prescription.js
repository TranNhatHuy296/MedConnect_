const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notification_email: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notify_minutes_before: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
  },
  max_reminders: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  notify_doctor_on_confirm: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notify_doctor_on_miss: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  google_calendar_synced: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  google_calendar_synced_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'prescriptions',
  paranoid: true,
});

module.exports = Prescription;
