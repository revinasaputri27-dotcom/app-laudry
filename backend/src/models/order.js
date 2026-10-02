'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
  }
  Order.init({
    orderCode: { type: DataTypes.STRING(24), allowNull: false, unique: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    packageId: { type: DataTypes.INTEGER, allowNull: false },
    addressId: { type: DataTypes.INTEGER, allowNull: true },
    weight: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    finalTotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    pickupMethod: { type: DataTypes.ENUM('pickup', 'delivery'), allowNull: false, defaultValue: 'delivery' },
    deliveryFee: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM('pending', 'confirmed', 'picked_up', 'washing', 'ironing', 'ready', 'delivered', 'cancelled'), allowNull: false, defaultValue: 'pending' },
    paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending' },
    pickupSchedule: { type: DataTypes.DATE, allowNull: true },
    estimatedDone: { type: DataTypes.DATE, allowNull: true },
    note: { type: DataTypes.TEXT, allowNull: true }
  }, {
    sequelize,
    modelName: 'Order'
  });
  return Order;
};