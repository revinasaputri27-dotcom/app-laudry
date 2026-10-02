'use strict';
// Membuat tabel transaksi dan relasi pelanggan serta paket.
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes('Orders')) return;
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      customerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Customers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      packageId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Packages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      weight: {
        allowNull: false,
        type: Sequelize.DECIMAL(8, 2)
      },
      total: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2)
      },
      status: {
        allowNull: false,
        defaultValue: 'pending',
        type: Sequelize.ENUM('pending', 'processing', 'washing', 'ironing', 'ready', 'delivered', 'cancelled')
      },
      note: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};