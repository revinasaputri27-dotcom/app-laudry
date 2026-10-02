"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const packages = [
      { name: "Reguler", pricePerKg: 6000, estimasiHari: 3, description: "Cuci kering lipat", createdAt: now, updatedAt: now },
      { name: "Paket Hemat", pricePerKg: 5000, estimasiHari: 4, description: "Minimal 5 kg", createdAt: now, updatedAt: now },
      { name: "Express", pricePerKg: 10000, estimasiHari: 1, description: "Selesai 24 jam", createdAt: now, updatedAt: now },
      { name: "Super Express", pricePerKg: 15000, estimasiHari: 1, description: "Selesai 6 jam", createdAt: now, updatedAt: now },
      { name: "Premium", pricePerKg: 12000, estimasiHari: 2, description: "Setrika uap + parfum", createdAt: now, updatedAt: now },
      { name: "Karpet", pricePerKg: 25000, estimasiHari: 3, description: "Cuci karpet per m2", createdAt: now, updatedAt: now },
      { name: "Sepatu", pricePerKg: 30000, estimasiHari: 2, description: "Deep clean per pasang", createdAt: now, updatedAt: now },
      { name: "Bed Cover", pricePerKg: 20000, estimasiHari: 3, description: "Cuci bed cover & selimut", createdAt: now, updatedAt: now },
      { name: "Gorden", pricePerKg: 18000, estimasiHari: 4, description: "Cuci gorden per m2", createdAt: now, updatedAt: now },
      { name: "Boneka", pricePerKg: 35000, estimasiHari: 3, description: "Cuci boneka besar", createdAt: now, updatedAt: now },
    ];
    for (const item of packages) {
      const [existing] = await queryInterface.sequelize.query('SELECT id FROM Packages WHERE name = :name LIMIT 1', { replacements: { name: item.name } });
      if (!existing.length) await queryInterface.bulkInsert('Packages', [item]);
    }
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("Packages", null, {});
  }
};
