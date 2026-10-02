"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes('Payments')) return;
    await queryInterface.createTable("Payments", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      orderId: {
        type: Sequelize.INTEGER,
        references: { model: "Orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      method: { type: Sequelize.STRING, defaultValue: "cash" },
      status: { type: Sequelize.STRING, defaultValue: "pending" },
      paidAt: { type: Sequelize.DATE },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Payments");
  }
};
