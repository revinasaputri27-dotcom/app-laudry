'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const hasColumn = async (table, column) => Object.prototype.hasOwnProperty.call(await queryInterface.describeTable(table), column);
    const addColumn = async (table, column, definition) => {
      if (!(await hasColumn(table, column))) await queryInterface.addColumn(table, column, definition);
    };
    const tables = await queryInterface.showAllTables();
    const createTable = async (name, definition) => {
      if (!tables.includes(name)) await queryInterface.createTable(name, definition);
    };

    await addColumn('Users', 'phone', { type: Sequelize.STRING(30), allowNull: true });
    await addColumn('Users', 'avatar', { type: Sequelize.STRING(500), allowNull: true });
    await addColumn('Customers', 'city', { type: Sequelize.STRING(100), allowNull: true });
    await addColumn('Customers', 'postalCode', { type: Sequelize.STRING(10), allowNull: true });
    await addColumn('Customers', 'notes', { type: Sequelize.TEXT, allowNull: true });
    await addColumn('Packages', 'minWeight', { type: Sequelize.DECIMAL(8, 2), allowNull: false, defaultValue: 1 });
    await addColumn('Packages', 'estimasiJam', { type: Sequelize.INTEGER, allowNull: true });
    await addColumn('Packages', 'icon', { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'WashingMachine' });
    await addColumn('Packages', 'isActive', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true });
    await addColumn('Packages', 'category', { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'cuci' });
    await addColumn('Packages', 'unit', { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'kg' });

    await createTable('CustomerAddresses', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      customerId: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'Customers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      label: { allowNull: false, type: Sequelize.STRING(40) },
      address: { allowNull: false, type: Sequelize.TEXT },
      city: { allowNull: false, type: Sequelize.STRING(100) },
      postalCode: { allowNull: false, type: Sequelize.STRING(10) },
      notes: { allowNull: true, type: Sequelize.TEXT },
      isDefault: { allowNull: false, defaultValue: false, type: Sequelize.BOOLEAN },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    await addColumn('Orders', 'orderCode', { type: Sequelize.STRING(24), allowNull: true });
    await addColumn('Orders', 'addressId', { type: Sequelize.INTEGER, allowNull: true, references: { model: 'CustomerAddresses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });
    await addColumn('Orders', 'discount', { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 });
    await addColumn('Orders', 'finalTotal', { type: Sequelize.DECIMAL(12, 2), allowNull: true });
    await addColumn('Orders', 'pickupMethod', { type: Sequelize.ENUM('pickup', 'delivery'), allowNull: false, defaultValue: 'delivery' });
    await addColumn('Orders', 'deliveryFee', { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 });
    await addColumn('Orders', 'paymentStatus', { type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending' });
    await addColumn('Orders', 'pickupSchedule', { type: Sequelize.DATE, allowNull: true });
    await addColumn('Orders', 'estimatedDone', { type: Sequelize.DATE, allowNull: true });

    const [existingOrders] = await queryInterface.sequelize.query('SELECT id, createdAt, total, status FROM Orders ORDER BY id');
    const sequenceByDate = new Map();
    for (const order of existingOrders) {
      const dateCode = new Date(order.createdAt).toISOString().slice(0, 10).replace(/-/g, '');
      const sequence = (sequenceByDate.get(dateCode) || 0) + 1;
      sequenceByDate.set(dateCode, sequence);
      await queryInterface.bulkUpdate('Orders', {
        orderCode: `LRV-${dateCode}-${String(sequence).padStart(3, '0')}`,
        finalTotal: order.total
      }, { id: order.id });
    }
    await queryInterface.changeColumn('Orders', 'orderCode', { type: Sequelize.STRING(24), allowNull: false, unique: true });
    await queryInterface.changeColumn('Orders', 'finalTotal', { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 });
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM('pending', 'processing', 'confirmed', 'picked_up', 'washing', 'ironing', 'ready', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    });
    await queryInterface.bulkUpdate('Orders', { status: 'confirmed' }, { status: 'processing' });
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM('pending', 'confirmed', 'picked_up', 'washing', 'ironing', 'ready', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    });

    await createTable('OrderItems', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      orderId: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'Orders', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      name: { allowNull: false, type: Sequelize.STRING(120) },
      qty: { allowNull: false, defaultValue: 1, type: Sequelize.DECIMAL(8, 2) },
      price: { allowNull: false, type: Sequelize.DECIMAL(12, 2) },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
    await createTable('AddOns', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { allowNull: false, unique: true, type: Sequelize.STRING(120) },
      description: { allowNull: false, type: Sequelize.STRING(255) },
      price: { allowNull: false, type: Sequelize.DECIMAL(12, 2) },
      unit: { allowNull: false, defaultValue: 'pesanan', type: Sequelize.STRING(20) },
      isActive: { allowNull: false, defaultValue: true, type: Sequelize.BOOLEAN },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
    await createTable('OrderStatusHistories', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      orderId: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'Orders', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      status: { allowNull: false, type: Sequelize.STRING(30) },
      note: { allowNull: true, type: Sequelize.STRING(255) },
      updatedBy: { allowNull: true, type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
    await createTable('Reviews', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      orderId: { allowNull: false, unique: true, type: Sequelize.INTEGER, references: { model: 'Orders', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      customerId: { allowNull: false, type: Sequelize.INTEGER, references: { model: 'Customers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      rating: { allowNull: false, type: Sequelize.INTEGER },
      comment: { allowNull: true, type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    await addColumn('Payments', 'proof', { type: Sequelize.STRING(500), allowNull: true });
    await queryInterface.changeColumn('Payments', 'method', {
      type: Sequelize.ENUM('cash', 'transfer', 'qris', 'ewallet'), allowNull: false
    });
    await queryInterface.changeColumn('Payments', 'status', {
      type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending'
    });
    for (const index of await queryInterface.showIndex('Payments')) {
      const fields = (index.fields || []).map((field) => typeof field === 'string' ? field : field.attribute || field.name);
      if (index.unique && fields.includes('orderId')) await queryInterface.removeIndex('Payments', index.name);
    }
    await queryInterface.addIndex('Payments', ['orderId']);

    const now = new Date();
    const historyRows = existingOrders.map((order) => ({
      orderId: order.id,
      status: order.status === 'processing' ? 'confirmed' : order.status,
      note: 'Pesanan tercatat sebelum fitur riwayat aktif',
      updatedBy: null,
      createdAt: now,
      updatedAt: now
    }));
    if (historyRows.length) await queryInterface.bulkInsert('OrderStatusHistories', historyRows);
  },

  async down(queryInterface) {
    const columns = {
      Users: ['phone', 'avatar'],
      Customers: ['city', 'postalCode', 'notes'],
      Packages: ['minWeight', 'estimasiJam', 'icon', 'isActive', 'category', 'unit'],
      Orders: ['orderCode', 'addressId', 'discount', 'finalTotal', 'pickupMethod', 'deliveryFee', 'paymentStatus', 'pickupSchedule', 'estimatedDone'],
      Payments: ['proof']
    };
    if (Object.prototype.hasOwnProperty.call(await queryInterface.describeTable('Orders'), 'addressId')) await queryInterface.removeColumn('Orders', 'addressId');
    for (const table of ['Reviews', 'OrderStatusHistories', 'AddOns', 'OrderItems', 'CustomerAddresses']) {
      const tables = await queryInterface.showAllTables();
      if (tables.includes(table)) await queryInterface.dropTable(table);
    }
    for (const [table, names] of Object.entries(columns)) {
      for (const column of names.reverse()) {
        if (Object.prototype.hasOwnProperty.call(await queryInterface.describeTable(table), column)) await queryInterface.removeColumn(table, column);
      }
    }
  }
};