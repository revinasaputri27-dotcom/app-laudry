'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerAddress extends Model {}
  CustomerAddress.init({
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    label: { type: DataTypes.STRING(40), allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    city: { type: DataTypes.STRING(100), allowNull: false },
    postalCode: { type: DataTypes.STRING(10), allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
    isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, { sequelize, modelName: 'CustomerAddress' });
  return CustomerAddress;
};