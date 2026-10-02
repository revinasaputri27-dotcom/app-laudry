"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes('Orders')) return;
    await queryInterface.createTable("Orders", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      customerId: {
        type: Sequelize.INTEGER,
        references: { model: "Customers", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      packageId: {
        type: Sequelize.INTEGER,
        references: { model: "Packages", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      weight: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      status: { type: Sequelize.STRING, defaultValue: "pending" },
      note: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Orders");
  }
};
