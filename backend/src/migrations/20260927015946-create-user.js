'use strict';
// Membuat tabel pengguna aplikasi.
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes('Users')) return;
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(120)
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(160)
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      role: {
        allowNull: false,
        defaultValue: 'customer',
        type: Sequelize.ENUM('admin', 'kasir', 'customer')
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
    await queryInterface.dropTable('Users');
  }
};