'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const packages = [
      { name: 'Cuci Kering', pricePerKg: 5000, estimasiHari: 3, description: 'Cuci bersih, kering, dan siap dilipat.', category: 'cuci', unit: 'kg', icon: 'WashingMachine', minWeight: 1 },
      { name: 'Cuci Setrika', pricePerKg: 7000, estimasiHari: 3, description: 'Cucian bersih dan disetrika rapi.', category: 'cuci', unit: 'kg', icon: 'Shirt', minWeight: 1 },
      { name: 'Setrika Saja', pricePerKg: 4000, estimasiHari: 2, description: 'Pakaian Anda disetrika hingga licin.', category: 'setrika', unit: 'kg', icon: 'Wind', minWeight: 1 },
      { name: 'Paket Hemat', pricePerKg: 5500, estimasiHari: 4, description: 'Pilihan hemat untuk cucian mingguan.', category: 'cuci', unit: 'kg', icon: 'Sparkles', minWeight: 5 },
      { name: 'Express 24 Jam', pricePerKg: 12000, estimasiHari: 1, description: 'Selesai dalam waktu 24 jam.', category: 'express', unit: 'kg', icon: 'Timer', minWeight: 1 },
      { name: 'Super Express 6 Jam', pricePerKg: 18000, estimasiHari: 1, estimasiJam: 6, description: 'Prioritas pengerjaan, selesai 6 jam.', category: 'express', unit: 'kg', icon: 'Zap', minWeight: 1 },
      { name: 'Premium (Parfum)', pricePerKg: 15000, estimasiHari: 2, description: 'Perawatan premium dengan parfum pilihan.', category: 'premium', unit: 'kg', icon: 'Flower2', minWeight: 1 },
      { name: 'Cuci Sepatu', pricePerKg: 35000, estimasiHari: 2, description: 'Deep clean untuk sepatu kesayangan.', category: 'khusus', unit: 'pasang', icon: 'Footprints', minWeight: 1 },
      { name: 'Cuci Karpet', pricePerKg: 25000, estimasiHari: 3, description: 'Cuci menyeluruh untuk karpet rumah.', category: 'khusus', unit: 'm²', icon: 'Grid2X2', minWeight: 1 },
      { name: 'Cuci Bed Cover', pricePerKg: 20000, estimasiHari: 3, description: 'Bed cover kembali bersih dan segar.', category: 'khusus', unit: 'kg', icon: 'BedDouble', minWeight: 1 }
    ];
    for (const item of packages) {
      const { estimasiJam = null, ...base } = item;
      const values = { ...base, estimasiJam, isActive: true, createdAt: now, updatedAt: now };
      const [existing] = await queryInterface.sequelize.query('SELECT id FROM Packages WHERE name = :name LIMIT 1', { replacements: { name: item.name } });
      if (existing.length) await queryInterface.bulkUpdate('Packages', values, { name: item.name });
      else await queryInterface.bulkInsert('Packages', [values]);
    }
    for (const item of packages) {
      const [rows] = await queryInterface.sequelize.query('SELECT id FROM Packages WHERE name = :name ORDER BY id', { replacements: { name: item.name } });
      if (rows.length < 2) continue;
      const canonicalId = rows[0].id;
      for (const duplicate of rows.slice(1)) {
        await queryInterface.bulkUpdate('Orders', { packageId: canonicalId }, { packageId: duplicate.id });
        await queryInterface.bulkDelete('Packages', { id: duplicate.id });
      }
    }
    await queryInterface.bulkUpdate('Packages', { isActive: false, updatedAt: now }, {
      name: ['Reguler', 'Express', 'Super Express', 'Premium', 'Karpet', 'Sepatu', 'Bed Cover', 'Gorden', 'Boneka']
    });
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('Packages', { name: ['Cuci Kering', 'Cuci Setrika', 'Setrika Saja', 'Paket Hemat', 'Express 24 Jam', 'Super Express 6 Jam', 'Premium (Parfum)', 'Cuci Sepatu', 'Cuci Karpet', 'Cuci Bed Cover'] });
  }
};