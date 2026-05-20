const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(
      'reminder',
      'confirmation',
      'missed',
      'expiring',
      'updated',
      'channel_error'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  channel: {
    type: DataTypes.ENUM('email', 'in_app'),
    defaultValue: 'in_app',
  },
  send_status: {
    type: DataTypes.ENUM('sent', 'failed', 'pending'),
    defaultValue: 'pending',
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  prescription_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  medicine_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'notifications',
});

module.exports = Notification;
