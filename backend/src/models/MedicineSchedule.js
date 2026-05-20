const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const MedicineSchedule = sequelize.define('MedicineSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  medicine_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  label: {
    type: DataTypes.ENUM('morning', 'noon', 'afternoon', 'evening'),
    allowNull: true,
  },
}, {
  tableName: 'medicine_schedules',
});

module.exports = MedicineSchedule;
