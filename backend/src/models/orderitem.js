'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {}
  OrderItem.init({
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
    qty: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
  }, { sequelize, modelName: 'OrderItem' });
  return OrderItem;
};