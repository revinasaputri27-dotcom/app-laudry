module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Packages', [
      { name: 'Reguler', pricePerKg: 6000, estimasiHari: 3, description: 'Cuci kering lipat', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Paket Hemat', pricePerKg: 5000, estimasiHari: 4, description: 'Min 5kg', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Express', pricePerKg: 10000, estimasiHari: 1, description: 'Selesai 24 jam', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Super Express', pricePerKg: 15000, estimasiHari: 1, description: 'Selesai 6 jam', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Premium', pricePerKg: 12000, estimasiHari: 2, description: 'Setrika uap + parfum', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Karpet', pricePerKg: 25000, estimasiHari: 3, description: 'Cuci karpet per m2', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sepatu', pricePerKg: 30000, estimasiHari: 2, description: 'Deep clean per pasang', createdAt: new Date(), updatedAt: new Date() }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('Packages', null, {});
  }
};