const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const DrugReference = sequelize.define('DrugReference', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  drug_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  disease: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  warning: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  contraindications: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Drugs not to use together',
  },
}, {
  tableName: 'drug_references',
});

module.exports = DrugReference;
