'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
  }
  Package.init({
    name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    pricePerKg: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    estimasiHari: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    minWeight: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 1 },
    estimasiJam: { type: DataTypes.INTEGER, allowNull: true },
    icon: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'WashingMachine' },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    category: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'cuci' },
    unit: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'kg' }
  }, {
    sequelize,
    modelName: 'Package'
  });
  return Package;
};