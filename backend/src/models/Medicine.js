const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Medicine = sequelize.define('Medicine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  prescription_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  dosage: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  frequency: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Number of times per day',
  },
}, {
  tableName: 'medicines',
});

module.exports = Medicine;
