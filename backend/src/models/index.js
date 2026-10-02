const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const settings = config[process.env.NODE_ENV || 'development'];
const sequelize = new Sequelize(settings.database, settings.username, settings.password, settings);
const db = {};

for (const name of ['User', 'Customer', 'CustomerAddress', 'Package', 'Order', 'OrderItem', 'AddOn', 'Payment', 'OrderStatusHistory', 'Review']) {
	db[name] = require(`./${name.toLowerCase()}`)(sequelize, DataTypes);
}

db.User.hasOne(db.Customer, { foreignKey: 'userId', as: 'customer' });
db.Customer.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Customer.hasMany(db.Order, { foreignKey: 'customerId', as: 'orders' });
db.Customer.hasMany(db.CustomerAddress, { foreignKey: 'customerId', as: 'addresses' });
db.CustomerAddress.belongsTo(db.Customer, { foreignKey: 'customerId', as: 'customer' });
db.Order.belongsTo(db.Customer, { foreignKey: 'customerId', as: 'customer' });
db.Package.hasMany(db.Order, { foreignKey: 'packageId', as: 'orders' });
db.Order.belongsTo(db.Package, { foreignKey: 'packageId', as: 'package' });
db.Order.belongsTo(db.CustomerAddress, { foreignKey: 'addressId', as: 'address' });
db.Order.hasMany(db.OrderItem, { foreignKey: 'orderId', as: 'items' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'orderId', as: 'order' });
db.Order.hasMany(db.Payment, { foreignKey: 'orderId', as: 'payments' });
db.Payment.belongsTo(db.Order, { foreignKey: 'orderId', as: 'order' });
db.Order.hasMany(db.OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistory' });
db.OrderStatusHistory.belongsTo(db.Order, { foreignKey: 'orderId', as: 'order' });
db.Review.belongsTo(db.Order, { foreignKey: 'orderId', as: 'order' });
db.Review.belongsTo(db.Customer, { foreignKey: 'customerId', as: 'customer' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;