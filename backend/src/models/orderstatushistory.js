'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderStatusHistory extends Model {}
  OrderStatusHistory.init({
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING(30), allowNull: false },
    note: { type: DataTypes.STRING(255), allowNull: true },
    updatedBy: { type: DataTypes.INTEGER, allowNull: true }
  }, { sequelize, modelName: 'OrderStatusHistory' });
  return OrderStatusHistory;
};