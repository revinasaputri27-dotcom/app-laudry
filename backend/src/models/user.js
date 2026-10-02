'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
  }
  User.init({
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'kasir', 'customer'), allowNull: false, defaultValue: 'customer' },
    phone: { type: DataTypes.STRING(30), allowNull: true },
    avatar: { type: DataTypes.STRING(500), allowNull: true }
  }, {
    sequelize,
    modelName: 'User'
  });
  return User;
};