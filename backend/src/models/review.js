'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {}
  Review.init({
    orderId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: true }
  }, { sequelize, modelName: 'Review' });
  return Review;
};