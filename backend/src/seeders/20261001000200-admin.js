'use strict';
const bcrypt = require('bcryptjs');
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const defaultUsers = [
      { name: 'Administrator Revina', email: 'admin@revina.com', password: 'admin123', phone: '081200000001', role: 'admin' },
      { name: 'Kasir Revina', email: 'kasir@revina.com', password: 'kasir123', phone: '081200000002', role: 'kasir' },
      { name: 'Nadia Putri', email: 'customer@revina.com', password: 'customer123', phone: '081234567890', role: 'customer' }
    ];
    for (const item of defaultUsers) {
      const [existing] = await queryInterface.sequelize.query('SELECT id FROM Users WHERE email = :email LIMIT 1', { replacements: { email: item.email } });
      if (existing.length) {
        await queryInterface.bulkUpdate('Users', { phone: item.phone, updatedAt: now }, { email: item.email, phone: null });
      } else {
        await queryInterface.bulkInsert('Users', [{
          ...item,
          password: await bcrypt.hash(item.password, 10),
          createdAt: now,
          updatedAt: now
        }]);
      }
    }

    const [users] = await queryInterface.sequelize.query("SELECT id, name, phone FROM Users WHERE email = 'customer@revina.com' LIMIT 1");
    const customerUser = users[0];
    const userId = customerUser.id;
    const [customers] = await queryInterface.sequelize.query('SELECT id FROM Customers WHERE userId = :userId LIMIT 1', { replacements: { userId } });
    let customerId = customers[0]?.id;
    if (!customerId) {
      await queryInterface.bulkInsert('Customers', [{ userId, name: customerUser.name, phone: customerUser.phone || '081234567890', address: 'Jl. Kenanga No. 8', city: 'Bandung', postalCode: '40123', notes: null, createdAt: now, updatedAt: now }]);
      const [created] = await queryInterface.sequelize.query('SELECT id FROM Customers WHERE userId = :userId LIMIT 1', { replacements: { userId } });
      customerId = created[0].id;
    }

    for (const address of [
      { label: 'Rumah', address: 'Jl. Kenanga No. 8', city: 'Bandung', postalCode: '40123', notes: 'Rumah pagar hijau', isDefault: true },
      { label: 'Kantor', address: 'Jl. Asia Afrika No. 20', city: 'Bandung', postalCode: '40111', notes: 'Resepsionis lantai dasar', isDefault: false }
    ]) {
      const [existing] = await queryInterface.sequelize.query('SELECT id FROM CustomerAddresses WHERE customerId = :customerId AND label = :label LIMIT 1', { replacements: { customerId, label: address.label } });
      if (!existing.length) await queryInterface.bulkInsert('CustomerAddresses', [{ customerId, ...address, createdAt: now, updatedAt: now }]);
    }
    const [addresses] = await queryInterface.sequelize.query('SELECT id FROM CustomerAddresses WHERE customerId = :customerId ORDER BY isDefault DESC, id', { replacements: { customerId } });

    const [existingOrders] = await queryInterface.sequelize.query('SELECT id FROM Orders WHERE customerId = :customerId LIMIT 1', { replacements: { customerId } });
    if (existingOrders.length) return;
    const addressId = addresses[0].id;
    const [packages] = await queryInterface.sequelize.query("SELECT id, name FROM Packages WHERE name IN ('Cuci Kering', 'Cuci Setrika', 'Premium (Parfum)')");
    const packageByName = Object.fromEntries(packages.map((item) => [item.name, item.id]));
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const samples = [
      { orderCode: `LRV-${dateCode}-901`, packageId: packageByName['Cuci Setrika'], weight: 4, total: 28000, discount: 5600, fee: 0, finalTotal: 22400, status: 'pending', daysAgo: 0 },
      { orderCode: `LRV-${dateCode}-902`, packageId: packageByName['Cuci Kering'], weight: 3, total: 15000, discount: 0, fee: 5000, finalTotal: 20000, status: 'washing', daysAgo: 1 },
      { orderCode: `LRV-${dateCode}-903`, packageId: packageByName['Premium (Parfum)'], weight: 2, total: 30000, discount: 0, fee: 0, finalTotal: 30000, status: 'delivered', daysAgo: 4 }
    ];
    for (const [index, sample] of samples.entries()) {
      const createdAt = new Date(now.getTime() - sample.daysAgo * 86400000);
      const estimatedDone = new Date(createdAt.getTime() + 2 * 86400000);
      await queryInterface.bulkInsert('Orders', [{
        orderCode: sample.orderCode, customerId, packageId: sample.packageId, addressId,
        weight: sample.weight, total: sample.total, discount: sample.discount, finalTotal: sample.finalTotal,
        pickupMethod: sample.fee ? 'pickup' : 'delivery', deliveryFee: sample.fee,
        status: sample.status, paymentStatus: sample.status === 'delivered' ? 'paid' : 'pending',
        pickupSchedule: createdAt, estimatedDone, note: index === 0 ? 'Mohon hubungi sebelum kurir tiba.' : null,
        createdAt, updatedAt: createdAt
      }]);
      const [createdOrder] = await queryInterface.sequelize.query('SELECT id FROM Orders WHERE orderCode = :orderCode LIMIT 1', { replacements: { orderCode: sample.orderCode } });
      const orderId = createdOrder[0].id;
      await queryInterface.bulkInsert('OrderItems', [{ orderId, name: packages.find((item) => item.id === sample.packageId).name, qty: sample.weight, price: sample.total, createdAt, updatedAt: createdAt }]);
      const historyStatuses = sample.status === 'delivered' ? ['pending', 'confirmed', 'picked_up', 'washing', 'ironing', 'ready', 'delivered'] : sample.status === 'washing' ? ['pending', 'confirmed', 'picked_up', 'washing'] : ['pending'];
      await queryInterface.bulkInsert('OrderStatusHistories', historyStatuses.map((status, historyIndex) => ({
        orderId, status, note: null, updatedBy: null,
        createdAt: new Date(createdAt.getTime() + historyIndex * 3600000),
        updatedAt: new Date(createdAt.getTime() + historyIndex * 3600000)
      })));
      if (sample.status === 'delivered') await queryInterface.bulkInsert('Payments', [{
        orderId, amount: sample.finalTotal, method: 'transfer', status: 'paid', proof: null,
        paidAt: createdAt, createdAt, updatedAt: createdAt
      }]);
    }
  },
  async down(queryInterface) {
    const [orders] = await queryInterface.sequelize.query("SELECT id FROM Orders WHERE orderCode LIKE 'LRV-%-90_'");
    for (const order of orders) await queryInterface.bulkDelete('Payments', { orderId: order.id });
    await queryInterface.bulkDelete('Orders', { orderCode: { [require('sequelize').Op.like]: 'LRV-%-90_' } });
    await queryInterface.bulkDelete('Users', { email: ['admin@revina.com', 'kasir@revina.com', 'customer@revina.com'] });
  }
};