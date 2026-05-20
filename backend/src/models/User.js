const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');


const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('doctor', 'patient'),
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  // Doctor-specific fields
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  specialty: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  hospital: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  license_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    },
  },
});

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
