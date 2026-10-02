"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes('Packages')) return;
    await queryInterface.createTable("Packages", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      pricePerKg: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      estimasiHari: { type: Sequelize.INTEGER, defaultValue: 3 },
      description: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Packages");
  }
};
