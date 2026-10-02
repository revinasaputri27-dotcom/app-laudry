"use strict";
const bcrypt = require("bcryptjs");
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const users = [
      { name: "Admin Revina", email: "admin@revina.com", password: "admin123", phone: "081200000001", role: "admin" },
      { name: "Kasir Revina", email: "kasir@revina.com", password: "kasir123", phone: "081200000002", role: "kasir" },
      { name: "Customer Revina", email: "customer@revina.com", password: "customer123", phone: "081234567890", role: "customer" },
    ];
    for (const user of users) {
      const [existing] = await queryInterface.sequelize.query('SELECT id FROM Users WHERE email = :email LIMIT 1', { replacements: { email: user.email } });
      if (existing.length) {
        await queryInterface.bulkUpdate('Users', { phone: user.phone, updatedAt: now }, { email: user.email, phone: null });
      } else {
        await queryInterface.bulkInsert("Users", [{ ...user, password: await bcrypt.hash(user.password, 10), createdAt: now, updatedAt: now }]);
      }
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("Users", { email: ["admin@revina.com", "kasir@revina.com", "customer@revina.com"] }, {});
  }
};
