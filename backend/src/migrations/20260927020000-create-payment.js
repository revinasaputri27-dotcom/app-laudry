'use strict';
// Membuat tabel pembayaran dengan satu pembayaran per transaksi.
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes('Payments')) return;
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderId: {
        allowNull: false,
        unique: true,
        type: Sequelize.INTEGER,
        references: { model: 'Orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2)
      },
      method: {
        allowNull: false,
        type: Sequelize.ENUM('cash', 'transfer', 'qris')
      },
      status: {
        allowNull: false,
        defaultValue: 'pending',
        type: Sequelize.ENUM('pending', 'paid')
      },
      paidAt: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Payments');
  }
};