'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
  }
  Payment.init({
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    method: { type: DataTypes.ENUM('cash', 'transfer', 'qris', 'ewallet'), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending' },
    proof: { type: DataTypes.STRING(500), allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    modelName: 'Payment'
  });
  return Payment;
};