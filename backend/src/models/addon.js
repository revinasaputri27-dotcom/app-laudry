'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AddOn extends Model {}
  AddOn.init({
    name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255), allowNull: false },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    unit: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pesanan' },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, { sequelize, modelName: 'AddOn' });
  return AddOn;
};